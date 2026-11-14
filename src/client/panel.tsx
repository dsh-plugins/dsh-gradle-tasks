/**
 * The Gradle Tasks page: the JDK selector and two icon controls, the task
 * folders, and one line describing what the last run did.
 *
 * The panel shows no build output of its own: a task runs in a real Session
 * terminal, which the Sidebar shows as its own tab, so the person keeps the
 * scrollback, the colours, and the ability to interrupt the build.
 */
import * as React from 'react'
import type { FailureCode, GradleProjectInfo, GradleTask, GradleTaskGroup, JdkCandidate } from '../shared/protocol.ts'
import { fetchState, fetchTasks, startTaskRun, TransportFailure, type SessionQuery } from './api.ts'
import type { Translator } from './i18n.ts'
import { useCopy } from './i18n.ts'
import { OfflineIcon, RefreshIcon } from './icon.tsx'
import { FAILURE_COPY } from './locales.ts'

/** Browser storage keys this panel owns. */
const JAVA_KEY = 'dsh.gradle-tasks.javaHome'
const OFFLINE_KEY = 'dsh.gradle-tasks.offline'
const COLLAPSED_KEY = 'dsh.gradle-tasks.collapsed'

/** Props the tab seat injects for one occurrence. */
export interface GradleTasksPanelProps {
  /** Session whose working directory the page inspects. */
  readonly sessionId: string
  /** Copy bound to the Host language. */
  readonly translator: Translator
  /** Terminals the window currently shows as tabs. */
  readonly openTerminalIds: () => readonly string[]
  /** Bring a terminal's tab to the front, opening it when it is not shown. */
  readonly revealTerminal: (terminalId: string) => void
}

/** One failure the panel renders in the active language. */
interface PanelFailure {
  readonly code: FailureCode
  readonly detail?: string | undefined
}

/** What the Host reported about the Session's directory. */
interface Location {
  readonly path: string
  readonly project: GradleProjectInfo | null
  readonly jdks: readonly JdkCandidate[]
}

/** What the last launch did, so the panel can confirm it without showing output. */
interface Launch {
  readonly taskPath: string
  readonly command: string
  readonly terminalTitle: string
}

/** Render one failure code as text in the active language. */
function describeFailure(failure: PanelFailure, t: Translator['t']): string {
  return t(FAILURE_COPY[failure.code], { detail: failure.detail ?? '' })
}

/** Turn any thrown value into the failure the panel renders. */
function failureFrom(error: unknown): PanelFailure {
  if (error instanceof TransportFailure) return { code: 'transport', detail: error.detail }
  return { code: 'transport', detail: error instanceof Error ? error.message : String(error) }
}

/** Read one stored string. */
function readStored(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null
  } catch (error) {
    console.warn(`gradle-tasks: ignoring unreadable ${key}`, error)
    return null
  }
}

/** Write one stored string, tolerating a storage that refuses writes. */
function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) globalThis.localStorage?.removeItem(key)
    else globalThis.localStorage?.setItem(key, value)
  } catch (error) {
    console.warn(`gradle-tasks: cannot persist ${key}`, error)
  }
}

/** Read the stored collapsed-group list. */
function readCollapsed(): string[] {
  const raw = readStored(COLLAPSED_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch (error) {
    console.warn(`gradle-tasks: ignoring unreadable ${COLLAPSED_KEY}`, error)
    return []
  }
}

/** Pick the JDK to use: the remembered one when it still exists, else the default. */
function resolveJavaHome(preferred: string | null, jdks: readonly JdkCandidate[]): string | null {
  if (preferred !== null && jdks.some(candidate => candidate.home === preferred)) return preferred
  return jdks.find(candidate => candidate.isDefault)?.home ?? jdks[0]?.home ?? null
}

/** The task path without its Gradle path prefix, for display. */
function taskLabel(task: GradleTask): string {
  return task.path.replace(/^:/, '')
}

/** Human-readable duration. */
function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds} ms`
  const seconds = milliseconds / 1000
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`
}

/** A scan time in the reader's own locale and time zone. */
function formatTimestamp(epochMilliseconds: number): string {
  return new Date(epochMilliseconds).toLocaleString()
}

/** Filter tasks by a case-insensitive substring of path or description. */
function filterGroups(groups: readonly GradleTaskGroup[], filter: string): GradleTaskGroup[] {
  const needle = filter.trim().toLowerCase()
  if (needle === '') return [...groups]
  return groups
    .map(group => ({
      group: group.group,
      tasks: group.tasks.filter(task =>
        task.path.toLowerCase().includes(needle) || task.description.toLowerCase().includes(needle)),
    }))
    .filter(group => group.tasks.length > 0)
}

/**
 * The Gradle Tasks page component.
 * @param props - injected services described by {@link GradleTasksPanelProps}.
 * @returns the rendered page.
 */
export function GradleTasksPanel(props: GradleTasksPanelProps): React.ReactElement {
  const { sessionId, translator, openTerminalIds, revealTerminal } = props
  const t = useCopy(translator)
  const [location, setLocation] = React.useState<Location | null>(null)
  const [groups, setGroups] = React.useState<readonly GradleTaskGroup[]>([])
  const [scanMs, setScanMs] = React.useState(0)
  const [cacheHit, setCacheHit] = React.useState<number | null>(null)
  const [javaHome, setJavaHome] = React.useState<string | null>(() => readStored(JAVA_KEY))
  const [offline, setOffline] = React.useState<boolean>(() => readStored(OFFLINE_KEY) === '1')
  const [busy, setBusy] = React.useState(false)
  const [problem, setProblem] = React.useState<PanelFailure | null>(null)
  const [filter, setFilter] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)
  const [collapsed, setCollapsed] = React.useState<string[]>(readCollapsed)
  const [launch, setLaunch] = React.useState<Launch | null>(null)
  const [launching, setLaunching] = React.useState<string | null>(null)

  const request = React.useRef(0)

  /**
   * Read the task report for this Session.
   *
   * A scan can take minutes, so the answer is applied only while its ticket is
   * still the newest: a person who switches JDK or offline mode mid-scan sees
   * the report for the choice they ended on, never an earlier one arriving late.
   * @param jdk - JDK to configure the build with.
   * @param force - configure the build again instead of reusing the cache.
   * @param ticket - request identity taken before the call.
   * @param state - the location this scan belongs to.
   */
  const scan = React.useCallback(async (
    jdk: string | null,
    force: boolean,
    ticket: number,
    state: Location,
  ): Promise<void> => {
    const query: SessionQuery = { sessionId, javaHome: jdk, offline, force }
    const listing = await fetchTasks(query)
    if (ticket !== request.current) return
    if (!listing.ok) {
      setGroups([])
      setCacheHit(null)
      setProblem({ code: listing.error, detail: listing.detail ?? listing.output })
      return
    }
    setProblem(null)
    setLocation(state)
    setGroups(listing.groups)
    setScanMs(listing.durationMs)
    setCacheHit(listing.cached ? listing.scannedAt : null)
  }, [sessionId, offline])

  /**
   * Ask the Host what this Session's directory is, then which tasks it declares.
   * @param force - configure the build again instead of reusing the cache.
   * @param jdkOverride - JDK chosen right now, before the selector has re-rendered.
   */
  const load = React.useCallback(async (force: boolean, jdkOverride?: string | null): Promise<void> => {
    const ticket = request.current + 1
    request.current = ticket
    setBusy(true)
    setProblem(null)
    try {
      const state = await fetchState(sessionId)
      if (ticket !== request.current) return
      if (!state.ok) {
        setLocation(null)
        setGroups([])
        setCacheHit(null)
        setProblem({ code: state.error, detail: state.detail })
        return
      }
      const chosen = jdkOverride ?? resolveJavaHome(javaHome, state.jdks)
      if (chosen !== javaHome) {
        setJavaHome(chosen)
        writeStored(JAVA_KEY, chosen)
      }
      const located: Location = { path: state.path, project: state.project, jdks: state.jdks }
      if (state.project === null) {
        setLocation(located)
        setGroups([])
        setCacheHit(null)
        setProblem({ code: 'not-gradle', detail: state.path })
        return
      }
      await scan(chosen, force, ticket, located)
    } catch (error) {
      if (ticket !== request.current) return
      setProblem(failureFrom(error))
      setGroups([])
    } finally {
      if (ticket === request.current) setBusy(false)
    }
  }, [sessionId, javaHome, scan])

  const firstLoad = React.useRef(true)
  React.useEffect(() => {
    if (!firstLoad.current) return
    firstLoad.current = false
    void load(false)
  }, [load])

  /** Change the JDK and rescan, because the task report comes from a Gradle run. */
  const chooseJava = React.useCallback((value: string): void => {
    const next = value === '' ? null : value
    setJavaHome(next)
    writeStored(JAVA_KEY, next)
    if (location?.project == null) return
    void load(true, next)
  }, [location, load])

  /**
   * Toggle offline mode.
   *
   * The report a build configures can differ offline — a plugin that resolves a
   * dependency during configuration registers fewer tasks — so the list is
   * rescanned rather than reused.
   */
  const toggleOffline = React.useCallback((): void => {
    const next = !offline
    setOffline(next)
    writeStored(OFFLINE_KEY, next ? '1' : '0')
    if (location?.project == null) return
    void load(true)
  }, [offline, location, load])

  /** Run one task in a Session terminal, reusing the one already open. */
  const runTask = React.useCallback(async (task: GradleTask): Promise<void> => {
    if (launching !== null) return
    setLaunching(task.path)
    setSelected(task.path)
    try {
      const answer = await startTaskRun(
        { sessionId, javaHome, offline, force: true },
        task.path,
        openTerminalIds(),
      )
      if (!answer.ok) {
        setProblem({ code: answer.error, detail: answer.detail })
        return
      }
      setProblem(null)
      setLaunch({ taskPath: answer.taskPath, command: answer.command, terminalTitle: answer.terminalTitle })
      revealTerminal(answer.terminalId)
    } catch (error) {
      setProblem(failureFrom(error))
    } finally {
      setLaunching(null)
    }
  }, [launching, sessionId, javaHome, offline, openTerminalIds, revealTerminal])

  const visible = filterGroups(groups, filter)
  const total = groups.reduce((sum, group) => sum + group.tasks.length, 0)
  const statusLine = ((): string => {
    if (busy) return t('status.scanning')
    if (problem !== null) return describeFailure(problem, t)
    if (location === null) return t('status.noSession')
    if (cacheHit !== null) return t('status.cachedAt', { time: formatTimestamp(cacheHit) })
    return t('status.scanned', { count: total, groups: groups.length, duration: formatDuration(scanMs) })
  })()

  const toggleGroup = (name: string): void => {
    const next = collapsed.includes(name) ? collapsed.filter(item => item !== name) : [...collapsed, name]
    setCollapsed(next)
    writeStored(COLLAPSED_KEY, JSON.stringify(next))
  }

  return (
    <div className="gt-root">
      <div className="gt-header">
        <label className="gt-java" title={t('toolbar.javaHint')}>
          <span className="gt-java-label">{t('toolbar.java')}</span>
          <select
            className="gt-select"
            value={javaHome ?? ''}
            onChange={(event) => { chooseJava(event.target.value) }}
          >
            {location !== null && location.jdks.length === 0
              ? <option value="">{t('toolbar.javaMissing')}</option>
              : null}
            {location?.jdks.map(candidate => (
              <option key={candidate.home} value={candidate.home} title={candidate.home}>
                {candidate.variable}
                {candidate.version === null ? '' : ` (${candidate.version})`}
              </option>
            ))}
          </select>
        </label>
        <button
          className={offline ? 'gt-icon-button gt-icon-button-on' : 'gt-icon-button'}
          type="button"
          aria-pressed={offline}
          title={offline ? t('toolbar.offlineOn') : t('toolbar.offlineOff')}
          onClick={toggleOffline}
        >
          <OfflineIcon />
        </button>
        <button
          className="gt-icon-button"
          type="button"
          title={t('toolbar.rescan')}
          disabled={busy}
          onClick={() => { void load(true) }}
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="gt-hint">
        <div>{statusLine}</div>
        {location?.project == null ? null : (
          <div className="gt-hint-detail">
            {location.project.wrapper === null
              ? t('status.noWrapper')
              : t('status.wrapper', { version: location.project.wrapperDistribution ?? location.project.wrapper })}
          </div>
        )}
        {launch === null ? null : (
          <div className="gt-hint-launch" title={launch.command}>
            {t('run.launched', { task: launch.taskPath, terminal: launch.terminalTitle })}
          </div>
        )}
      </div>

      <div className="gt-toolbar">
        <input
          className="gt-filter"
          value={filter}
          placeholder={t('tasks.filter')}
          onChange={(event) => { setFilter(event.target.value) }}
        />
        <span className="gt-count">{total}</span>
      </div>

      <div className="gt-scroll">
        {visible.length === 0 ? (
          <div className="gt-empty">{groups.length > 0 ? t('tasks.empty') : t('tasks.runHint')}</div>
        ) : visible.map((group) => {
          const name = group.group === '' ? t('tasks.ungrouped') : group.group
          const open = !collapsed.includes(group.group)
          return (
            <div key={group.group}>
              <button
                className="gt-group-head"
                type="button"
                aria-expanded={open}
                onClick={() => { toggleGroup(group.group) }}
              >
                <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>
                <span className="gt-group-name">{name}</span>
                <span className="gt-count">{group.tasks.length}</span>
              </button>
              {open ? group.tasks.map(task => (
                <button
                  key={task.path}
                  className={selected === task.path ? 'gt-task gt-selected' : 'gt-task'}
                  type="button"
                  title={task.path}
                  disabled={launching !== null}
                  onClick={() => { setSelected(task.path) }}
                  onDoubleClick={() => { void runTask(task) }}
                >
                  <div className="gt-task-name">
                    {launching === task.path ? t('run.starting') : taskLabel(task)}
                  </div>
                  {task.description === '' ? null : <div className="gt-task-desc">{task.description}</div>}
                </button>
              )) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
