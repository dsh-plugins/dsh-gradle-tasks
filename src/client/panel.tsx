/**
 * The Gradle Tasks page: a project header with the JDK selector, the task
 * folders on the left, and the build terminal on the right.
 *
 * The panel owns no Gradle knowledge of its own — it asks the Host what the
 * project is and which tasks it declares, and streams one run at a time.
 */
import * as React from 'react'
import type {
  GradleProjectInfo,
  GradleTask,
  GradleTaskGroup,
  JdkCandidate,
  RunEvent,
  StateResponse,
  TasksResponse,
} from '../shared/protocol.ts'
import { fetchState, fetchTasks, startTaskRun, stopTaskRun, streamTaskRun } from './api.ts'
import type { Translator } from './i18n.ts'
import { useCopy } from './i18n.ts'

/** Browser storage keys this panel owns. */
const PATH_KEY = 'dsh.gradle-tasks.path'
const JAVA_KEY = 'dsh.gradle-tasks.javaHome'
const COLLAPSED_KEY = 'dsh.gradle-tasks.collapsed'

/** Longest transcript the panel keeps in memory, in characters. */
const MAX_OUTPUT_CHARS = 300_000

/** How often buffered build output is committed to React state, in milliseconds. */
const OUTPUT_FLUSH_MS = 90

/** Services the panel is registered with. */
export interface GradleTasksPanelServices {
  /** Copy bound to the Host language. */
  readonly translator: Translator
  /** The Session most recently shown on screen, tracked across panel switches. */
  readonly currentSessionId: () => string | undefined
  /** Host directory picker, when the surrounding UI provides one. */
  readonly pickDirectory?: (() => Promise<string | null>) | undefined
}

/** What one build looks like to the panel. */
interface RunView {
  readonly taskPath: string
  readonly command: string
  readonly phase: 'running' | 'succeeded' | 'failed'
  readonly code: number | null
  readonly durationMs: number
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

/** Filter one group's tasks by a case-insensitive substring of path or description. */
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
 * @param props - injected services described by {@link GradleTasksPanelServices}.
 * @returns the rendered page.
 */
export function GradleTasksPanel(props: GradleTasksPanelServices): React.ReactElement {
  const { translator, currentSessionId, pickDirectory } = props
  const t = useCopy(translator)
  const [state, setState] = React.useState<StateResponse | null>(null)
  const [tasks, setTasks] = React.useState<TasksResponse | null>(null)
  const [override, setOverride] = React.useState<string | null>(() => readStored(PATH_KEY))
  const [draft, setDraft] = React.useState('')
  const [javaHome, setJavaHome] = React.useState<string | null>(() => readStored(JAVA_KEY))
  const [busy, setBusy] = React.useState(false)
  const [problem, setProblem] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)
  const [collapsed, setCollapsed] = React.useState<string[]>(() => readStoredList(COLLAPSED_KEY))
  const [run, setRun] = React.useState<RunView | null>(null)
  const [output, setOutput] = React.useState('')

  const buffer = React.useRef('')
  const flushTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const detach = React.useRef<(() => void) | undefined>(undefined)
  const runId = React.useRef<string | null>(null)
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

  /** Ask the Host what this location is, then which tasks it declares. */
  const load = React.useCallback(async (nextOverride: string | null): Promise<void> => {
    setBusy(true)
    setProblem(null)
    try {
      const locator = { sessionId: currentSessionId(), path: nextOverride ?? undefined }
      const nextState = await fetchState(locator)
      setState(nextState)
      if (!nextState.ok) {
        setTasks(null)
        setProblem(nextState.error ?? t('status.failed'))
        return
      }
      setDraft(nextState.path)
      const chosen = resolveJavaHome(javaHome, nextState.jdks)
      if (chosen !== javaHome) {
        setJavaHome(chosen)
        writeStored(JAVA_KEY, chosen)
      }
      if (nextState.project === null) {
        setTasks(null)
        return
      }
      const listing = await fetchTasks(locator, chosen)
      setTasks(listing)
      if (!listing.ok) {
        setProblem(listing.error ?? t('status.failed'))
        buffer.current = listing.output
        flushOutput()
      }
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error))
      setTasks(null)
    } finally {
      setBusy(false)
    }
  }, [currentSessionId, javaHome, t, flushOutput])

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
      setProblem(error instanceof Error ? error.message : String(error))
    }
  }, [pickDirectory, applyPath])

  /** Change the JDK and rescan, because the task report is read from a Gradle run. */
  const chooseJava = React.useCallback((value: string): void => {
    const next = value === '' ? null : value
    setJavaHome(next)
    writeStored(JAVA_KEY, next)
    if (state?.project === null || state?.project === undefined) return
    setBusy(true)
    void fetchTasks({ sessionId: currentSessionId(), path: override ?? undefined }, next)
      .then((listing) => {
        setTasks(listing)
        if (listing.ok) {
          setProblem(null)
          return
        }
        setProblem(listing.error ?? t('status.failed'))
        buffer.current = listing.output
        flushOutput()
      })
      .catch((error: unknown) => { setProblem(error instanceof Error ? error.message : String(error)) })
      .finally(() => { setBusy(false) })
  }, [state, currentSessionId, override, t, flushOutput])

  /** Run one task in the panel's terminal. */
  const runTask = React.useCallback(async (task: GradleTask): Promise<void> => {
    if (run?.phase === 'running') return
    stopStreaming()
    setOutput('')
    setRun({ taskPath: task.path, command: '', phase: 'running', code: null, durationMs: 0 })
    try {
      const locator = { sessionId: currentSessionId(), path: override ?? undefined }
      const started = await startTaskRun(locator, task.path, javaHome)
      if (!started.ok || started.runId === undefined) {
        setRun({ taskPath: task.path, command: started.command ?? '', phase: 'failed', code: null, durationMs: 0 })
        setOutput(started.error ?? t('status.failed'))
        return
      }
      runId.current = started.runId
      setRun(current => current === null ? current : { ...current, command: started.command ?? '' })
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
          : { ...current, phase: event.code === 0 ? 'succeeded' : 'failed', code: event.code, durationMs: event.durationMs })
      }
      const onError = (error: Error): void => { appendOutput(`\n${error.message}\n`) }
      detach.current = streamTaskRun(started.runId, onEvent, onError)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRun({ taskPath: task.path, command: '', phase: 'failed', code: null, durationMs: 0 })
      setOutput(message)
    }
  }, [run, stopStreaming, currentSessionId, override, javaHome, t, appendOutput, flushOutput])

  /** Terminate the running build; its exit event then settles the badge. */
  const stopRun = React.useCallback(async (): Promise<void> => {
    const id = runId.current
    if (id === null) return
    try {
      await stopTaskRun(id)
    } catch (error) {
      appendOutput(`\n${error instanceof Error ? error.message : String(error)}\n`)
    }
  }, [appendOutput])

  const groups = tasks?.ok === true ? filterGroups(tasks.groups, filter) : []
  const project: GradleProjectInfo | null = state?.project ?? null
  const total = tasks?.ok === true ? tasks.groups.reduce((sum, group) => sum + group.tasks.length, 0) : 0
  const statusLine = ((): string => {
    if (busy) return t('status.scanning')
    if (problem !== null) return problem
    if (state === null) return t('status.noProject')
    if (state.project === null) return t('status.notGradle')
    if (tasks?.ok === true) {
      return t('status.scanned', {
        count: total,
        groups: tasks.groups.length,
        duration: formatDuration(tasks.durationMs),
      })
    }
    return t('status.noProject')
  })()

  const badge = ((): { className: string, text: string } => {
    if (run === null) return { className: 'gt-badge', text: t('run.idle') }
    if (run.phase === 'running') return { className: 'gt-badge gt-busy', text: t('run.running') }
    if (run.phase === 'succeeded') {
      return { className: 'gt-badge gt-ok', text: `${t('run.succeeded')} · ${formatDuration(run.durationMs)}` }
    }
    return { className: 'gt-badge gt-bad', text: t('run.failed', { code: run.code ?? '—' }) }
  })()

  const toggleGroup = (name: string): void => {
    const next = collapsed.includes(name) ? collapsed.filter(item => item !== name) : [...collapsed, name]
    setCollapsed(next)
    writeStored(COLLAPSED_KEY, JSON.stringify(next))
  }

  return (
    <div className="gt-root">
      <header className="gt-header">
        <span className="gt-title">{t('panel.title')}</span>
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
            {state !== null && state.jdks.length === 0 ? <option value="">{t('toolbar.javaMissing')}</option> : null}
            {state?.jdks.map(candidate => (
              <option key={candidate.home} value={candidate.home} title={candidate.home}>
                {candidate.variable}
                {candidate.version === null ? '' : ` (${candidate.version})`}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="gt-main">
        <section className="gt-tasks">
          <div className="gt-toolbar">
            <input
              className="gt-filter"
              value={filter}
              placeholder={t('tasks.filter')}
              onChange={(event) => { setFilter(event.target.value) }}
            />
            <span className="gt-count">{total}</span>
          </div>
          <div className="gt-hint">
            {statusLine}
            {project === null ? null : (
              <div>
                {project.wrapper === null
                  ? t('status.noWrapper')
                  : t('status.wrapper', { version: project.wrapperDistribution ?? project.wrapper })}
              </div>
            )}
          </div>
          <div className="gt-scroll">
            {groups.length === 0 ? (
              <div className="gt-empty">{tasks?.ok === true ? t('tasks.empty') : t('tasks.runHint')}</div>
            ) : groups.map((group) => {
              const name = group.group === '' ? t('tasks.ungrouped') : group.group
              const open = !collapsed.includes(group.group)
              return (
                <div key={group.group} className="gt-group">
                  <button
                    className="gt-group-head"
                    type="button"
                    aria-expanded={open}
                    onClick={() => { toggleGroup(group.group) }}
                  >
                    <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>
                    <span>{name}</span>
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
        </section>
        <section className="gt-terminal">
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
              onClick={() => { stopStreaming(); setOutput('') }}
              disabled={output === ''}
            >
              {t('run.clear')}
            </button>
          </div>
          <pre className="gt-term-body" ref={terminal}>
            {output === '' ? <span className="gt-term-muted">{run === null ? t('run.idle') : ''}</span> : output}
          </pre>
        </section>
      </div>
    </div>
  )
}
