/**
 * The Gradle Tasks page: the project header with the JDK selector, the task
 * folders, and the build terminal, stacked for the right Sidebar's narrow
 * column.
 *
 * The panel owns no Gradle knowledge of its own — it asks the Host what the
 * project is and which tasks it declares, and streams one run at a time.
 */
import * as React from 'react'
import type {
  FailureCode,
  GradleProjectInfo,
  GradleTask,
  GradleTaskGroup,
  JdkCandidate,
  RunEvent,
} from '../shared/protocol.ts'
import { fetchState, fetchTasks, startTaskRun, stopTaskRun, streamTaskRun, TransportFailure } from './api.ts'
import type { Translator } from './i18n.ts'
import { useCopy } from './i18n.ts'
import { FAILURE_COPY } from './locales.ts'

/** Browser storage keys this panel owns. */
const PATH_KEY = 'dsh.gradle-tasks.path'
const JAVA_KEY = 'dsh.gradle-tasks.javaHome'
const COLLAPSED_KEY = 'dsh.gradle-tasks.collapsed'

/** Longest transcript the panel keeps in memory, in characters. */
const MAX_OUTPUT_CHARS = 300_000

/** How often buffered build output is committed to React state, in milliseconds. */
const OUTPUT_FLUSH_MS = 90

/** Props the tab seat injects for one occurrence. */
export interface GradleTasksPanelProps {
  /** Session whose directory the page inspects by default. */
  readonly sessionId: string
  /** Copy bound to the Host language. */
  readonly translator: Translator
  /** Host directory picker, when the surrounding UI provides one. */
  readonly pickDirectory?: (() => Promise<string | null>) | undefined
}

/** One failure the panel renders in the active language. */
interface PanelFailure {
  readonly code: FailureCode
  readonly detail?: string | undefined
}

/** What the Host reported about the inspected directory. */
interface Location {
  readonly path: string
  readonly project: GradleProjectInfo | null
  readonly jdks: readonly JdkCandidate[]
  readonly platform: 'posix' | 'windows'
}

/** What one build looks like to the panel. */
interface RunView {
  readonly taskPath: string
  readonly command: string
  readonly phase: 'running' | 'succeeded' | 'failed' | 'stopped'
  readonly code: number | null
  readonly durationMs: number
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

/** Read a JSON string array from storage, tolerating absent or broken values. */
function readStoredList(key: string): string[] {
  try {
    const raw = globalThis.localStorage?.getItem(key)
    if (raw === null || raw === undefined) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch (error) {
    console.warn(`gradle-tasks: ignoring unreadable ${key}`, error)
    return []
  }
}

/** Read one stored string, tolerating absent or broken values. */
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
  const { sessionId, translator, pickDirectory } = props
  const t = useCopy(translator)
  const [location, setLocation] = React.useState<Location | null>(null)
  const [groups, setGroups] = React.useState<readonly GradleTaskGroup[]>([])
  const [scanMs, setScanMs] = React.useState(0)
  const [override, setOverride] = React.useState<string | null>(() => readStored(PATH_KEY))
  const [draft, setDraft] = React.useState('')
  const [javaHome, setJavaHome] = React.useState<string | null>(() => readStored(JAVA_KEY))
  const [busy, setBusy] = React.useState(false)
  const [problem, setProblem] = React.useState<PanelFailure | null>(null)
  const [filter, setFilter] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)
  const [collapsed, setCollapsed] = React.useState<string[]>(() => readStoredList(COLLAPSED_KEY))
  const [run, setRun] = React.useState<RunView | null>(null)
  const [output, setOutput] = React.useState('')

  const buffer = React.useRef('')
  const flushTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const detach = React.useRef<(() => void) | undefined>(undefined)
  const runId = React.useRef<string | null>(null)
  const stopping = React.useRef(false)
  const request = React.useRef(0)
  const terminal = React.useRef<HTMLPreElement | null>(null)

  /** Commit buffered build output to state, keeping the tail only. */
  const flushOutput = React.useCallback(() => {
    flushTimer.current = undefined
    const text = buffer.current
    buffer.current = ''
    if (text === '') return
    setOutput((previous) => {
      const next = previous + text
      return next.length > MAX_OUTPUT_CHARS ? next.slice(next.length - MAX_OUTPUT_CHARS) : next
    })
  }, [])

  /** Queue build output for the next commit. */
  const appendOutput = React.useCallback((text: string) => {
    buffer.current += text
    flushTimer.current ??= setTimeout(flushOutput, OUTPUT_FLUSH_MS)
  }, [flushOutput])

  /** Drop every pending timer and stream attachment. */
  const stopStreaming = React.useCallback(() => {
    detach.current?.()
    detach.current = undefined
    if (flushTimer.current !== undefined) {
      clearTimeout(flushTimer.current)
      flushTimer.current = undefined
    }
    buffer.current = ''
  }, [])

  React.useEffect(() => () => { stopStreaming() }, [stopStreaming])

  React.useEffect(() => {
    const node = terminal.current
    if (node === null) return
    node.scrollTop = node.scrollHeight
  }, [output])

  /**
   * Read the task report for one location, with a chosen JDK.
   *
   * A scan can take minutes, so the answer is applied only while its ticket is
   * still the newest: a person who switches directory or JDK mid-scan sees the
   * report for the choice they ended on, never an earlier one arriving late.
   * @param path - directory override, or null for the Session's own.
   * @param jdk - JDK to run the report with.
   * @param ticket - request identity taken before the call.
   */
  const scan = React.useCallback(async (path: string | null, jdk: string | null, ticket: number): Promise<void> => {
    const listing = await fetchTasks({ sessionId, path: path ?? undefined }, jdk)
    if (ticket !== request.current) return
    if (!listing.ok) {
      setGroups([])
      setProblem({ code: listing.error, detail: listing.detail })
      if (listing.output !== undefined) {
        buffer.current = listing.output
        flushOutput()
      }
      return
    }
    setProblem(null)
    setGroups(listing.groups)
    setScanMs(listing.durationMs)
  }, [sessionId, flushOutput])

  /** Ask the Host what this location is, then which tasks it declares. */
  const load = React.useCallback(async (nextOverride: string | null): Promise<void> => {
    const ticket = request.current + 1
    request.current = ticket
    setBusy(true)
    setProblem(null)
    try {
      const state = await fetchState({ sessionId, path: nextOverride ?? undefined })
      if (ticket !== request.current) return
      if (!state.ok) {
        setLocation(null)
        setGroups([])
        setProblem({ code: state.error, detail: state.detail })
        return
      }
      setLocation(state)
      setDraft(state.path)
      const chosen = resolveJavaHome(javaHome, state.jdks)
      if (chosen !== javaHome) {
        setJavaHome(chosen)
        writeStored(JAVA_KEY, chosen)
      }
      if (state.project === null) {
        setGroups([])
        setProblem({ code: 'not-gradle', detail: state.path })
        return
      }
      await scan(nextOverride, chosen, ticket)
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
    void load(readStored(PATH_KEY))
  }, [load])

  /** Apply an explicit directory and remember it. */
  const applyPath = React.useCallback((value: string): void => {
    const trimmed = value.trim()
    const next = trimmed === '' ? null : trimmed
    setOverride(next)
    writeStored(PATH_KEY, next)
    void load(next)
  }, [load])

  /** Choose a directory with the Host picker. */
  const chooseDirectory = React.useCallback(async (): Promise<void> => {
    if (pickDirectory === undefined) return
    try {
      const picked = await pickDirectory()
      if (picked !== null && picked !== '') applyPath(picked)
    } catch (error) {
      setProblem(failureFrom(error))
    }
  }, [pickDirectory, applyPath])

  /** Change the JDK and rescan, because the task report comes from a Gradle run. */
  const chooseJava = React.useCallback((value: string): void => {
    const next = value === '' ? null : value
    setJavaHome(next)
    writeStored(JAVA_KEY, next)
    if (location?.project === null || location?.project === undefined) return
    const ticket = request.current + 1
    request.current = ticket
    setBusy(true)
    void scan(override, next, ticket)
      .catch((error: unknown) => {
        if (ticket !== request.current) return
        setProblem(failureFrom(error))
        setGroups([])
      })
      .finally(() => {
        if (ticket === request.current) setBusy(false)
      })
  }, [location, override, scan])

  /** Run one task in the panel's terminal. */
  const runTask = React.useCallback(async (task: GradleTask): Promise<void> => {
    if (run?.phase === 'running') return
    stopStreaming()
    stopping.current = false
    runId.current = null
    setOutput('')
    setRun({ taskPath: task.path, command: '', phase: 'running', code: null, durationMs: 0 })
    try {
      const started = await startTaskRun({ sessionId, path: override ?? undefined }, task.path, javaHome)
      if (!started.ok) {
        setRun({ taskPath: task.path, command: '', phase: 'failed', code: null, durationMs: 0 })
        setOutput(describeFailure({ code: started.error, detail: started.detail }, t))
        return
      }
      runId.current = started.runId
      setRun(current => current === null ? current : { ...current, command: started.command })
      const onEvent = (event: RunEvent): void => {
        if (event.type === 'chunk') {
          appendOutput(event.text)
          return
        }
        if (event.type === 'error') {
          appendOutput(`\n${event.message}\n`)
          return
        }
        flushOutput()
        runId.current = null
        setRun(current => current === null
          ? current
          : {
              ...current,
              phase: stopping.current ? 'stopped' : event.code === 0 ? 'succeeded' : 'failed',
              code: event.code,
              durationMs: event.durationMs,
            })
        stopping.current = false
      }
      const onError = (error: Error): void => { appendOutput(`\n${describeFailure(failureFrom(error), t)}\n`) }
      detach.current = streamTaskRun(started.runId, onEvent, onError)
    } catch (error) {
      setRun({ taskPath: task.path, command: '', phase: 'failed', code: null, durationMs: 0 })
      setOutput(describeFailure(failureFrom(error), t))
    }
  }, [run, stopStreaming, sessionId, override, javaHome, t, appendOutput, flushOutput])

  /** Terminate the running build; its exit event then settles the badge as stopped. */
  const stopRun = React.useCallback(async (): Promise<void> => {
    const id = runId.current
    if (id === null) return
    stopping.current = true
    try {
      await stopTaskRun(id)
    } catch (error) {
      stopping.current = false
      appendOutput(`\n${describeFailure(failureFrom(error), t)}\n`)
    }
  }, [appendOutput, t])

  const visible = filterGroups(groups, filter)
  const total = groups.reduce((sum, group) => sum + group.tasks.length, 0)
  const statusLine = ((): string => {
    if (busy) return t('status.scanning')
    if (problem !== null) return describeFailure(problem, t)
    if (location === null) return t('status.noProject')
    return t('status.scanned', { count: total, groups: groups.length, duration: formatDuration(scanMs) })
  })()

  const badge = ((): { className: string, text: string } => {
    if (run === null) return { className: 'gt-badge', text: t('run.idle') }
    if (run.phase === 'running') return { className: 'gt-badge gt-busy', text: t('run.running') }
    if (run.phase === 'succeeded') {
      return { className: 'gt-badge gt-ok', text: `${t('run.succeeded')} · ${formatDuration(run.durationMs)}` }
    }
    if (run.phase === 'stopped') return { className: 'gt-badge', text: t('run.stopped') }
    return { className: 'gt-badge gt-bad', text: t('run.failed', { code: run.code ?? '—' }) }
  })()

  const toggleGroup = (name: string): void => {
    const next = collapsed.includes(name) ? collapsed.filter(item => item !== name) : [...collapsed, name]
    setCollapsed(next)
    writeStored(COLLAPSED_KEY, JSON.stringify(next))
  }

  return (
    <div className="gt-root">
      <div className="gt-header">
        <input
          className="gt-path"
          value={draft}
          spellCheck={false}
          placeholder={t('path.placeholder')}
          onChange={(event) => { setDraft(event.target.value) }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            applyPath(event.currentTarget.value)
          }}
        />
        <div className="gt-actions">
          {pickDirectory === undefined ? null : (
            <button className="gt-button" type="button" onClick={() => { void chooseDirectory() }} disabled={busy}>
              {t('toolbar.pickDirectory')}
            </button>
          )}
          <button className="gt-button gt-primary" type="button" onClick={() => { applyPath(draft) }} disabled={busy}>
            {busy ? t('status.scanning') : t('toolbar.reloadTasks')}
          </button>
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
        </div>
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
                  onClick={() => { setSelected(task.path) }}
                  onDoubleClick={() => { void runTask(task) }}
                >
                  <div className="gt-task-name">{taskLabel(task)}</div>
                  {task.description === '' ? null : <div className="gt-task-desc">{task.description}</div>}
                </button>
              )) : null}
            </div>
          )
        })}
      </div>

      <div className="gt-terminal">
        <div className="gt-term-head">
          <span className={badge.className}>{badge.text}</span>
          <span className="gt-command" title={run?.command ?? ''}>
            {run === null ? t('tasks.runHint') : run.taskPath}
          </span>
          {run?.phase === 'running' ? (
            <button className="gt-button" type="button" onClick={() => { void stopRun() }}>{t('run.stop')}</button>
          ) : null}
          <button
            className="gt-button"
            type="button"
            onClick={() => { buffer.current = ''; setOutput('') }}
            disabled={output === ''}
          >
            {t('run.clear')}
          </button>
        </div>
        <pre className="gt-term-body" ref={terminal}>
          {output === '' ? <span className="gt-term-muted">{run === null ? t('run.idle') : ''}</span> : output}
        </pre>
      </div>
    </div>
  )
}
