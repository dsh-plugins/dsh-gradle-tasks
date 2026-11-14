/**
 * The Gradle Tasks page: the JDK selector and two icon controls, then the
 * workspace's build roots as a tree — each one's groups, its subprojects, and
 * their tasks — and one line describing what the last run did.
 *
 * The page deliberately scans lazily. A workspace can hold dozens of
 * repositories, and configuring a Gradle build costs seconds to minutes, so
 * opening the page only lists what the filesystem shows; a build is configured
 * the first time its node is opened, and its report is cached per build root
 * from then on.
 *
 * The panel shows no build output of its own: a task runs in a real Session
 * terminal, which the Sidebar shows as its own tab, so the person keeps the
 * scrollback, the colours, and the ability to interrupt the build.
 */
import * as React from 'react'
import type { FailureCode, GradleProjectEntry, GradleTask, GradleTaskGroup, JdkCandidate } from '../shared/protocol.ts'
import {
  buildProjectTree,
  projectMatches,
  taskMatches,
  type AggregateGroup,
  type ModuleBucket,
  type ProjectTree,
} from '../shared/tree.ts'
import { fetchState, fetchTasks, startTaskRun, TransportFailure, type SessionQuery } from './api.ts'
import type { Translator } from './i18n.ts'
import { useCopy } from './i18n.ts'
import {
  FolderIcon,
  ModuleIcon,
  OfflineIcon,
  ProjectIcon,
  RefreshIcon,
  SearchIcon,
  SpinnerIcon,
  TaskIcon,
} from './icon.tsx'
import { JdkPicker } from './picker.tsx'
import { FAILURE_COPY } from './locales.ts'

/** Browser storage keys this panel owns. */
const JAVA_KEY = 'dsh.gradle-tasks.javaHome'
const OFFLINE_KEY = 'dsh.gradle-tasks.offline'
/**
 * Browser storage key for the unfolded group and module nodes.
 *
 * Projects are deliberately not stored: a workspace is reopened fully folded,
 * the way an IDE tree is, so the panel never starts a build (or shows one as
 * pending) merely because a project was open the last time the page was seen.
 */
const OPEN_NODE_KEY = 'dsh.gradle-tasks.openNodes'

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
  readonly projects: readonly GradleProjectEntry[]
  readonly truncated: boolean
  readonly jdks: readonly JdkCandidate[]
}

/** One build root's scan, as the panel remembers it. */
interface ProjectState {
  /** Tree built from the last successful scan, if there was one. */
  readonly tree: ProjectTree | null
  readonly status: 'idle' | 'loading' | 'ready' | 'failed'
  readonly failure: PanelFailure | null
  readonly durationMs: number
  readonly cachedAt: number | null
}

/** What the last launch did, so the panel can confirm it without showing output. */
interface Launch {
  readonly taskPath: string
  readonly command: string
  readonly terminalTitle: string
}

/** The state every build root starts in. */
const IDLE: ProjectState = { tree: null, status: 'idle', failure: null, durationMs: 0, cachedAt: null }

/**
 * Split a failure into the one line a row shows and the log it holds back.
 *
 * A Gradle failure carries the end of the build log, which is many lines of
 * advice and stack trace. The tree shows the cause and keeps the log one click
 * away, so a failed project stays one row instead of taking over the panel.
 */
function splitFailure(failure: PanelFailure): { summary: string, detail: string } {
  const text = failure.detail ?? ''
  const breakAt = text.indexOf('\n')
  return breakAt < 0 ? { summary: text, detail: '' } : { summary: text.slice(0, breakAt), detail: text.slice(breakAt + 1) }
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

/**
 * Read one stored node-key list.
 *
 * Nodes are keyed by build root as well as by name, because two repositories in
 * one workspace can both have a `build` group; an entry written by the version
 * that had a single project carries no root and simply never matches again.
 */
function readKeys(key: string): string[] {
  const raw = readStored(key)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch (error) {
    console.warn(`gradle-tasks: ignoring unreadable ${key}`, error)
    return []
  }
}

/** Pick the JDK to use: the remembered one when it still exists, else the default. */
function resolveJavaHome(preferred: string | null, jdks: readonly JdkCandidate[]): string | null {
  if (preferred !== null && jdks.some(candidate => candidate.home === preferred)) return preferred
  return jdks.find(candidate => candidate.isDefault)?.home ?? jdks[0]?.home ?? null
}

/**
 * The task path as its row shows it.
 *
 * A task under a module node already says which module it belongs to, so the
 * prefix is dropped there: `common:jar` reads `jar` inside `common`, and the
 * same task reads `common:jar` when its module row is folded away. The full path
 * is always one hover away.
 * @param task - the task.
 * @param scope - Gradle project path of the node the row sits under, `:` for the root project.
 * @returns the label for the row.
 */
function taskLabel(task: GradleTask, scope = ':'): string {
  if (scope !== ':') {
    const prefix = `${scope}:`
    if (task.path.startsWith(prefix)) return task.path.slice(prefix.length)
    // A task listed under one project but belonging to another keeps its full
    // path, because dropping the prefix would then misname it.
    return task.path.replace(/^:/, '')
  }
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

/** The storage key of one collapsible node. */
function nodeKey(rootDir: string, ...parts: readonly string[]): string {
  return [rootDir, ...parts].join('\u0000')
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
  const [states, setStates] = React.useState<ReadonlyMap<string, ProjectState>>(() => new Map())
  const [javaHome, setJavaHome] = React.useState<string | null>(() => readStored(JAVA_KEY))
  const [offline, setOffline] = React.useState<boolean>(() => readStored(OFFLINE_KEY) === '1')
  const [busy, setBusy] = React.useState(false)
  const [problem, setProblem] = React.useState<PanelFailure | null>(null)
  const [filter, setFilter] = React.useState('')
  const [selected, setSelected] = React.useState<string | null>(null)
  // Every level starts folded. A workspace of a hundred repositories would
  // otherwise open a hundred subtrees nobody asked to see, and a configured mod
  // build lists hundreds of tasks, so the tree opens where the person points at
  // it rather than all at once. Group state survives a reload; project state
  // does not, because reopening it would re-run its build.
  const [opened, setOpened] = React.useState<string[]>([])
  const [openNodes, setOpenNodes] = React.useState<string[]>(() => readKeys(OPEN_NODE_KEY))
  // Failures are shown as one line each; the build log behind one is opened on
  // demand and is not remembered, because it is diagnosis, not layout.
  const [openErrors, setOpenErrors] = React.useState<string[]>([])
  const [launch, setLaunch] = React.useState<Launch | null>(null)
  const [launching, setLaunching] = React.useState<string | null>(null)

  const request = React.useRef(0)
  /** Build roots whose scan this component has already started, so one effect pass cannot start two. */
  const started = React.useRef(new Set<string>())
  const javaRef = React.useRef(javaHome)
  javaRef.current = javaHome
  const offlineRef = React.useRef(offline)
  offlineRef.current = offline

  /** Replace one build root's state, leaving the others alone. */
  const patchState = React.useCallback((rootDir: string, patch: Partial<ProjectState>): void => {
    setStates((previous) => {
      const next = new Map(previous)
      next.set(rootDir, { ...previous.get(rootDir) ?? IDLE, ...patch })
      return next
    })
  }, [])

  /**
   * Scan one build root.
   *
   * The answer is applied only while its ticket is still the newest: a person
   * who switches JDK or offline mode mid-scan sees the report for the choice
   * they ended on, never an earlier one arriving late.
   * @param project - the build root to scan.
   * @param force - configure the build again instead of reusing the cache.
   * @param ticket - request identity taken before the call.
   */
  const scan = React.useCallback(async (
    project: GradleProjectEntry,
    force: boolean,
    ticket: number,
  ): Promise<void> => {
    patchState(project.rootDir, { status: 'loading', failure: null })
    const query: SessionQuery = {
      sessionId,
      project: project.rootDir,
      javaHome: javaRef.current,
      offline: offlineRef.current,
      force,
    }
    try {
      const listing = await fetchTasks(query)
      if (ticket !== request.current) return
      if (!listing.ok) {
        patchState(project.rootDir, {
          status: 'failed',
          failure: { code: listing.error, detail: listing.detail ?? listing.output },
        })
        return
      }
      patchState(project.rootDir, {
        status: 'ready',
        tree: buildProjectTree(listing.groups),
        failure: null,
        durationMs: listing.durationMs,
        cachedAt: listing.cached ? listing.scannedAt : null,
      })
    } catch (error) {
      if (ticket !== request.current) return
      patchState(project.rootDir, { status: 'failed', failure: failureFrom(error) })
    }
  }, [sessionId, patchState])

  /**
   * Ask the Host which build roots this Session's directory holds.
   * @param force - configure every project again instead of reusing caches.
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
        setStates(new Map())
        started.current.clear()
        setProblem({ code: state.error, detail: state.detail })
        return
      }
      const chosen = jdkOverride ?? resolveJavaHome(javaHome, state.jdks)
      if (chosen !== javaHome) {
        setJavaHome(chosen)
        writeStored(JAVA_KEY, chosen)
      }
      const located: Location = {
        path: state.path,
        projects: state.projects,
        truncated: state.truncated === true,
        jdks: state.jdks,
      }
      setLocation(located)
      // Build roots that left the workspace lose their scan with their row.
      setStates((previous) => {
        const keep = new Set(state.projects.map(project => project.rootDir))
        const next = new Map<string, ProjectState>()
        for (const [root, value] of previous) if (keep.has(root)) next.set(root, value)
        return next
      })
      started.current = new Set(
        [...started.current].filter(root => state.projects.some(project => project.rootDir === root)),
      )
      if (force) {
        // Only what was already configured is rescanned: the refresh control
        // means "these numbers are stale", not "configure every repository I
        // can see".
        for (const project of state.projects) {
          if (!started.current.has(project.rootDir)) continue
          await scan(project, true, ticket)
        }
      }
    } catch (error) {
      if (ticket !== request.current) return
      setProblem(failureFrom(error))
      setStates(new Map())
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

  /** Record that one project node is open. */
  const openProject = React.useCallback((rootDir: string): void => {
    const key = nodeKey(rootDir)
    setOpened((previous) => previous.includes(key) ? previous : [...previous, key])
  }, [])

  /** Fold or unfold one project's failure log. */
  const toggleError = React.useCallback((rootDir: string): void => {
    setOpenErrors((previous) => previous.includes(rootDir)
      ? previous.filter(item => item !== rootDir)
      : [...previous, rootDir])
  }, [])

  /** Fold or unfold one project node; these start folded. */
  const toggleProject = React.useCallback((rootDir: string): void => {
    const key = nodeKey(rootDir)
    setOpened((previous) => previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key])
  }, [])

  /**
   * Scan a build root the first time its node is opened.
   *
   * A single-project workspace is opened for the person instead: the page has
   * nothing else to show, so the ready state it had before is preserved.
   */
  const expandProject = React.useCallback((project: GradleProjectEntry): void => {
    openProject(project.rootDir)
    if (started.current.has(project.rootDir)) return
    started.current.add(project.rootDir)
    void scan(project, false, request.current)
  }, [openProject, scan])

  /**
   * Open the only project of a workspace without being asked.
   *
   * With exactly one candidate, the task list is what a person opening this page
   * came for, and its result is cached on disk, so this costs at most one
   * configuration. A workspace of several repositories stays folded instead,
   * because opening them all would start that many builds.
   */
  React.useEffect(() => {
    const projects = location?.projects
    if (projects === undefined || projects.length !== 1) return
    const only = projects[0]
    if (only === undefined || started.current.has(only.rootDir)) return
    started.current.add(only.rootDir)
    openProject(only.rootDir)
    void scan(only, false, request.current)
  }, [location, scan])

  /** Change the JDK and rescan every configured project, because the report comes from a Gradle run. */
  const chooseJava = React.useCallback((value: string): void => {
    const next = value === '' ? null : value
    setJavaHome(next)
    writeStored(JAVA_KEY, next)
    const projects = location?.projects ?? []
    const scanned = projects.filter(project => started.current.has(project.rootDir))
    if (scanned.length === 0) return
    void (async () => {
      for (const project of scanned) await scan(project, true, request.current)
    })()
  }, [location, scan])

  /**
   * Toggle offline mode.
   *
   * The report a build configures can differ offline — a plugin that resolves a
   * dependency during configuration registers fewer tasks — so configured
   * projects are rescanned rather than reused.
   */
  const toggleOffline = React.useCallback((): void => {
    const next = !offline
    setOffline(next)
    writeStored(OFFLINE_KEY, next ? '1' : '0')
    const projects = location?.projects ?? []
    const scanned = projects.filter(project => started.current.has(project.rootDir))
    if (scanned.length === 0) return
    void (async () => {
      for (const project of scanned) await scan(project, true, request.current)
    })()
  }, [offline, location, scan])

  /** Run one task in a Session terminal, reusing that build root's terminal. */
  const runTask = React.useCallback(async (project: GradleProjectEntry, taskPath: string): Promise<void> => {
    if (launching !== null) return
    setLaunching(taskPath)
    setSelected(taskPath)
    try {
      const answer = await startTaskRun(
        { sessionId, project: project.rootDir, javaHome, offline, force: true },
        taskPath,
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

  /** Fold or unfold one group or module node; these start folded. */
  const toggleNode = React.useCallback((key: string): void => {
    setOpenNodes((previous) => {
      const next = previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key]
      writeStored(OPEN_NODE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const needle = filter.trim().toLowerCase()
  const projects = location?.projects ?? []
  const loaded = projects.filter(project => states.get(project.rootDir)?.tree != null)
  const taskTotal = loaded.reduce((sum, project) => sum + (states.get(project.rootDir)?.tree?.taskCount ?? 0), 0)
  const statusLine = ((): string => {
    if (busy) return t('status.scanningWorkspace')
    if (problem !== null) return describeFailure(problem, t)
    if (location === null) return t('status.noSession')
    if (projects.length === 0) return t('status.noProjects', { path: location.path })
    return t('status.projects', { projects: projects.length, scanned: loaded.length, tasks: taskTotal })
  })()

  /**
   * The projects the tree shows, each paired with the tree to render.
   *
   * A term matching a project's name keeps the project folded rather than
   * hiding it: its tasks were never scanned, so a filter that dropped it would
   * look like the repository had disappeared. A term matching one of its tasks
   * keeps it as well, and drops the tasks that do not match.
   */
  const visible = React.useMemo(() => {
    const rows: { project: GradleProjectEntry; tree: ProjectTree | null }[] = []
    for (const project of projects) {
      const tree = states.get(project.rootDir)?.tree ?? null
      if (needle === '') {
        rows.push({ project, tree })
        continue
      }
      if (projectMatches(project, needle)) {
        rows.push({ project, tree })
        continue
      }
      // The project's own name does not match, so it survives only through a
      // task it declares — and only the matching tasks are then shown.
      const narrowed = filterTree(tree, needle)
      if (narrowed !== null && narrowed.taskCount > 0) rows.push({ project, tree: narrowed })
    }
    return rows
  }, [projects, states, needle])

  return (
    <div className="gt-root">
      <div className="gt-header">
        <JdkPicker
          candidates={location?.jdks ?? []}
          value={javaHome}
          label={t('toolbar.java')}
          emptyCopy={t('toolbar.javaMissing')}
          ariaLabel={t('toolbar.javaHint')}
          onChoose={chooseJava}
        />
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
        <div className="gt-status">{statusLine}</div>
        {location?.truncated !== true || location === null ? null : (
          <div className="gt-hint-warn">{t('status.truncated')}</div>
        )}
        {launch === null ? null : (
          <div className="gt-hint-launch" title={launch.command}>
            {t('run.launched', { task: launch.taskPath, terminal: launch.terminalTitle })}
          </div>
        )}
      </div>

      <div className="gt-toolbar">
        <span className="gt-filter-wrap">
          <span className="gt-filter-icon" aria-hidden="true"><SearchIcon /></span>
          <input
            className="gt-filter"
            value={filter}
            placeholder={t('tasks.filter')}
            onChange={(event) => { setFilter(event.target.value) }}
          />
        </span>
        <span className="gt-count">{taskTotal}</span>
      </div>

      <div className="gt-scroll">
        {visible.length === 0 ? (
          <div className="gt-empty">
            {projects.length === 0
              ? location === null ? t('status.noSession') : t('tasks.noProjects')
              : t('tasks.empty')}
          </div>
        ) : null}
        {visible.map(({ project, tree }) => {
          const state = states.get(project.rootDir) ?? IDLE
          const key = nodeKey(project.rootDir)
          const open = needle !== '' || opened.includes(key)
          return (
            <ProjectRow
              key={project.rootDir}
              project={project}
              state={state}
              open={open}
              filterActive={needle !== ''}
              openNodes={openNodes}
              selected={selected}
              launching={launching}
              t={t}
              tree={tree}
              errorOpen={openErrors.includes(project.rootDir)}
              onToggleError={() => { toggleError(project.rootDir) }}
              onToggle={() => {
                // A search term forces every remaining row open, so a click
                // there can only mean "load the rows I am looking at"; without
                // one, the click folds and unfolds the project as usual.
                if (needle !== '' || !open) {
                  expandProject(project)
                  return
                }
                toggleProject(project.rootDir)
              }}
              onRescan={() => { void scan(project, true, request.current) }}
              onToggleNode={toggleNode}
              onSelect={setSelected}
              onRun={(taskPath) => { void runTask(project, taskPath) }}
            />
          )
        })}
        {projects.length > 0 && loaded.length === 0 && needle === '' ? (
          <div className="gt-hint-foot">{t('tasks.expandHint')}</div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Narrow a tree to what the search term matches.
 *
 * Groups and modules survive only while they hold a match, which is what makes
 * a search read as a result list rather than as a tree with holes in it.
 */
function filterTree(tree: ProjectTree | null, needle: string): ProjectTree | null {
  if (tree === null || needle === '') return tree
  const narrow = (groups: readonly GradleTaskGroup[]): GradleTaskGroup[] => groups
    .map(group => ({ group: group.group, tasks: group.tasks.filter(task => taskMatches(task, needle)) }))
    .filter(group => group.tasks.length > 0)
  const aggregate = tree.aggregate
    .map(group => ({ group: group.group, tasks: group.tasks.filter(task => taskMatches(task, needle)) }))
    .filter(group => group.tasks.length > 0)
  const modules = tree.modules
    .map(module => ({ ...module, groups: narrow(module.groups) }))
    .filter(module => module.groups.length > 0)
  return {
    aggregate,
    modules,
    // Each task name appears once at the top and again under every module that
    // declares it; the count is about distinct names, so the top is what it uses.
    taskCount: aggregate.reduce((sum, group) => sum + group.tasks.length, 0),
  }
}

/** Props of one build root's rows. */
interface ProjectRowProps {
  readonly project: GradleProjectEntry
  readonly state: ProjectState
  readonly open: boolean
  readonly filterActive: boolean
  /** Tree narrowed by the active search term, or the full tree when none is active. */
  readonly tree: ProjectTree | null
  readonly openNodes: readonly string[]
  readonly selected: string | null
  readonly launching: string | null
  readonly t: Translator['t']
  /** Whether this project's failure log is unfolded. */
  readonly errorOpen: boolean
  readonly onToggleError: () => void
  readonly onToggle: () => void
  readonly onRescan: () => void
  readonly onToggleNode: (key: string) => void
  readonly onSelect: (taskPath: string) => void
  readonly onRun: (taskPath: string) => void
}

/**
 * One build root: its own groups, then one row per subproject, each with its
 * groups. A subproject row only exists when the build has one, so a plain
 * application reads as project → group → task, exactly as before.
 * @param props - described by {@link ProjectRowProps}.
 * @returns the rows of one project subtree.
 */
function ProjectRow(props: ProjectRowProps): React.ReactElement {
  const {
    project, state, open, filterActive, tree, openNodes, selected, launching, t,
    errorOpen, onToggleError, onToggle, onRescan, onToggleNode, onSelect, onRun,
  } = props
  const moduleCount = tree === null ? project.modules.length : tree.modules.length
  // A project shows what is known without opening it: the module count the
  // settings script declares, or the task count of a finished scan. Inventing
  // "0 tasks" before a scan has ever run would read as an empty build.
  const badge = state.status === 'loading'
    ? t('project.scanning')
    : state.status === 'failed'
      ? t('project.failed')
      : moduleCount > 0
        ? t('project.modules', { count: moduleCount })
        : tree === null
          ? ''
          : t('project.tasks', { count: tree.taskCount })
  // The path is worth showing only when the name alone would not identify the
  // folder — a declared `rootProject.name` that differs from its own directory.
  // A path climbing out of the Session's directory (`../..`, the single build a
  // Session was opened inside) says nothing useful, so it is not shown at all.
  // Where the numbers in the badge came from: a cache hit names the scan it
  // reuses, a fresh scan reports its own cost, and a folded project says so.
  const scanNote = state.status === 'failed'
    ? t('status.failedAt')
    : state.cachedAt !== null
      ? t('status.cachedAt', { time: formatTimestamp(state.cachedAt) })
      : state.tree === null
        ? t('tasks.loadHint')
        : t('status.scannedAt', {
          time: formatTimestamp(Date.now() - state.durationMs),
          duration: formatDuration(state.durationMs),
        })

  const folder = project.relativePath.split('/').at(-1) ?? project.relativePath
  const showPath = project.relativePath !== '.'
    && !project.relativePath.startsWith('..')
    && folder.toLowerCase() !== project.name.toLowerCase()
  return (
    <>
      <div className={open ? 'gt-row gt-row-project gt-row-open' : 'gt-row gt-row-project'}>
        <button
          className="gt-twisty"
          type="button"
          aria-expanded={open}
          aria-label={open ? t('project.collapse') : t('project.expand')}
          onClick={onToggle}
        >
          <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>
        </button>
        <button
          className="gt-row-body"
          type="button"
          title={`${project.rootDir}
${t('project.aggregate')}`}
          onClick={onToggle}
        >
          <span className="gt-row-icon gt-icon-project"><ProjectIcon /></span>
          <span className="gt-row-name">{project.name}</span>
          {showPath ? <span className="gt-row-path">{project.relativePath}</span> : null}
          <span className={state.status === 'loading' ? 'gt-badge gt-badge-busy' : 'gt-badge'} title={scanNote}>
            {state.status === 'loading' ? <SpinnerIcon /> : null}
            {badge}
          </span>
        </button>
        <button
          className="gt-row-action"
          type="button"
          title={t('project.rescan')}
          onClick={onRescan}
        >
          <RefreshIcon size={13} />
        </button>
      </div>
      {state.status === 'failed' && state.failure !== null ? (
        <FailureRow
          failure={state.failure}
          open={errorOpen}
          onToggle={onToggleError}
          t={t}
        />
      ) : null}
      {!open ? null : tree === null ? (
        state.status === 'loading' ? null : <div className="gt-row-note">{t('tasks.loadHint')}</div>
      ) : (
        <>
          {/* The project's list is the whole build with the subprojects
              collapsed into the names they share, because that is what one
              `gradle build` here runs: `jar` means every project's jar. The
              module rows below repeat the same tasks one subproject at a time. */}
          <AggregateGroupRows
            groups={tree.aggregate}
            rootDir={project.rootDir}
            openNodes={openNodes}
            selected={selected}
            launching={launching}
            t={t}
            onToggleNode={onToggleNode}
            onSelect={onSelect}
            onRun={onRun}
          />
          {tree.modules.length === 0 ? null : (
            <div className="gt-section">
              <span className="gt-section-text">{t('project.subprojects')}</span>
              <span className="gt-badge">{tree.modules.length}</span>
            </div>
          )}
          {tree.modules.map(module => (
            <ModuleRows
              key={module.path}
              module={module}
              rootDir={project.rootDir}
              openNodes={openNodes}
              forceOpen={filterActive}
              selected={selected}
              launching={launching}
              t={t}
              onToggleNode={onToggleNode}
              onSelect={onSelect}
              onRun={onRun}
            />
          ))}
        </>
      )}
    </>
  )
}

/**
 * One project's failure: the cause as a row, the build log behind a toggle.
 * @param props - the failure, its unfold state, and the toggle.
 * @returns the failure row, and its log when unfolded.
 */
function FailureRow(props: {
  readonly failure: PanelFailure
  readonly open: boolean
  readonly onToggle: () => void
  readonly t: Translator['t']
}): React.ReactElement {
  const { failure, open, onToggle, t } = props
  const { summary, detail } = splitFailure(failure)
  const message = t(FAILURE_COPY[failure.code], { detail: summary })
  return (
    <div className="gt-row-error-box">
      <button
        className="gt-row-error"
        type="button"
        aria-expanded={open && detail !== ''}
        disabled={detail === ''}
        title={detail === '' ? summary : t('project.failureHint')}
        onClick={onToggle}
      >
        <span className="gt-row-error-mark" aria-hidden="true">!</span>
        <span className="gt-row-error-text">{message}</span>
        {detail === '' ? null : <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>}
      </button>
      {open && detail !== '' ? <pre className="gt-row-error-log">{detail}</pre> : null}
    </div>
  )
}

/**
 * The guides that show a row's level.
 *
 * A row indented by padding alone leaves the reader counting pixels to tell a
 * task from its group; a hairline per level makes the nesting readable at a
 * glance, the way an IDE tree does.
 * @param props - how many levels deep the row sits.
 * @returns one spacer per level, or nothing for a top-level row.
 */
function Guides({ depth }: { readonly depth: number }): React.ReactElement | null {
  if (depth <= 0) return null
  return (
    <>
      {Array.from({ length: depth }, (_, level) => <span key={level} className="gt-guide" aria-hidden="true" />)}
    </>
  )
}

/**
 * The hover text of one aggregated task row.
 *
 * A row that reaches several projects says which ones, because the count in its
 * badge answers "how many" but not "which"; the description follows on its own
 * paragraph so a long list of project paths does not bury it.
 * @param projects - every project declaring the name, or none when only one does.
 * @param description - the description the declaring projects agree on.
 * @returns the text, without a trailing separator.
 */
function aggregateTitle(projects: readonly string[], description: string): string {
  const lines = projects.length === 0 ? [] : [projects.join('\n')]
  if (description !== '') lines.push(description)
  return lines.join('\n\n')
}

/** Props of the build-wide group list. */
interface AggregateGroupRowsProps {
  readonly groups: readonly AggregateGroup[]
  readonly rootDir: string
  readonly openNodes: readonly string[]
  readonly selected: string | null
  readonly launching: string | null
  readonly t: Translator['t']
  readonly onToggleNode: (key: string) => void
  readonly onSelect: (taskPath: string) => void
  readonly onRun: (taskPath: string) => void
}

/**
 * The build's groups, one row per task name.
 *
 * A row runs the bare name, which is what Gradle expands across every project
 * that declares it; the badge counts those projects, so a row that starts three
 * builds says so before it is clicked.
 * @param props - described by {@link AggregateGroupRowsProps}.
 * @returns the group rows and their task names.
 */
function AggregateGroupRows(props: AggregateGroupRowsProps): React.ReactElement {
  const { groups, rootDir, openNodes, selected, launching, t, onToggleNode, onSelect, onRun } = props
  return (
    <>
      {groups.map((group) => {
        const key = nodeKey(rootDir, 'aggregate', group.group)
        const open = openNodes.includes(key)
        const name = group.group === '' ? t('tasks.ungrouped') : group.group
        return (
          <React.Fragment key={key}>
            <div className="gt-row gt-row-group">
              <Guides depth={1} />
              <button
                className="gt-twisty"
                type="button"
                aria-expanded={open}
                onClick={() => { onToggleNode(key) }}
              >
                <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>
              </button>
              <button className="gt-row-body" type="button" onClick={() => { onToggleNode(key) }}>
                <span className="gt-row-icon gt-icon-group"><FolderIcon open={open} /></span>
                <span className="gt-row-name">{name}</span>
                <span className="gt-badge">{group.tasks.length}</span>
              </button>
            </div>
            {!open ? null : group.tasks.map((task) => {
              const shared = task.projects.length > 1
              return (
                <div
                  key={task.name}
                  className={selected === task.name ? 'gt-row gt-row-task gt-row-selected' : 'gt-row gt-row-task'}
                >
                  <Guides depth={2} />
                  <button
                    className="gt-row-body gt-row-task-body"
                    type="button"
                    title={aggregateTitle(shared ? task.projects : [], task.description)}
                    disabled={launching !== null}
                    onClick={() => { onSelect(task.name) }}
                    onDoubleClick={() => { onRun(task.name) }}
                  >
                    <span className="gt-row-icon gt-icon-task"><TaskIcon /></span>
                    <span className="gt-row-name gt-row-task-name">
                      {launching === task.name ? t('run.starting') : task.name}
                    </span>
                    {/* One click starts every declaration, so a row that spans
                        several projects says how many. */}
                    {shared ? <span className="gt-badge">{task.projects.length}</span> : null}
                  </button>
                </div>
              )
            })}
          </React.Fragment>
        )
      })}
    </>
  )
}

/** Props shared by the two rows that list groups. */
interface GroupRowsProps {
  readonly groups: readonly GradleTaskGroup[]
  readonly depth: number
  readonly rootDir: string
  /** Prefix of this list's node keys: the project for the root list, the module path otherwise. */
  readonly nodePath: string
  /** Gradle project path these groups belong to, so a row can drop its own prefix. */
  readonly scope: string
  readonly openNodes: readonly string[]
  readonly selected: string | null
  readonly launching: string | null
  readonly t: Translator['t']
  readonly onToggleNode: (key: string) => void
  readonly onSelect: (taskPath: string) => void
  readonly onRun: (taskPath: string) => void
}

/**
 * The groups of one project or module.
 * @param props - described by {@link GroupRowsProps}.
 * @returns the group rows and their tasks.
 */
function GroupRows(props: GroupRowsProps): React.ReactElement {
  const { groups, depth, rootDir, nodePath, scope, openNodes, selected, launching, t, onToggleNode, onSelect, onRun } = props
  return (
    <>
      {groups.map((group) => {
        const key = nodeKey(rootDir, nodePath, group.group)
        const open = openNodes.includes(key)
        const name = group.group === '' ? t('tasks.ungrouped') : group.group
        return (
          <React.Fragment key={key}>
            <div className="gt-row gt-row-group">
              <Guides depth={depth} />
              <button
                className="gt-twisty"
                type="button"
                aria-expanded={open}
                onClick={() => { onToggleNode(key) }}
              >
                <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>
              </button>
              <button className="gt-row-body" type="button" onClick={() => { onToggleNode(key) }}>
                <span className="gt-row-icon gt-icon-group"><FolderIcon open={open} /></span>
                <span className="gt-row-name">{name}</span>
                <span className="gt-badge">{group.tasks.length}</span>
              </button>
            </div>
            {!open ? null : group.tasks.map(task => (
              <div
                key={task.path}
                className={selected === task.path ? 'gt-row gt-row-task gt-row-selected' : 'gt-row gt-row-task'}
              >
                {/* One rail more than its group, so the last rail runs down
                    through the group's twisty column and the task's icon lands
                    exactly under the group's icon. */}
                <Guides depth={depth + 1} />
                <button
                  className="gt-row-body gt-row-task-body"
                  type="button"
                  title={task.description === '' ? task.path : `${task.path} — ${task.description}`}
                  disabled={launching !== null}
                  onClick={() => { onSelect(task.path) }}
                  onDoubleClick={() => { onRun(task.path) }}
                >
                  <span className="gt-row-icon gt-icon-task"><TaskIcon /></span>
                  <span className="gt-row-name gt-row-task-name">
                    {launching === task.path ? t('run.starting') : taskLabel(task, scope)}
                  </span>
                </button>
              </div>
            ))}
          </React.Fragment>
        )
      })}
    </>
  )
}

/** Props of one subproject row. */
interface ModuleRowsProps {
  readonly module: ModuleBucket
  readonly rootDir: string
  readonly openNodes: readonly string[]
  /** A search term is active, so the module is shown expanded whatever its stored state. */
  readonly forceOpen: boolean
  readonly selected: string | null
  readonly launching: string | null
  readonly t: Translator['t']
  readonly onToggleNode: (key: string) => void
  readonly onSelect: (taskPath: string) => void
  readonly onRun: (taskPath: string) => void
}

/**
 * One subproject: its own foldable row, then its groups one level deeper.
 * @param props - described by {@link ModuleRowsProps}.
 * @returns the module's rows.
 */
function ModuleRows(props: ModuleRowsProps): React.ReactElement {
  const { module, rootDir, openNodes, forceOpen, selected, launching, t, onToggleNode, onSelect, onRun } = props
  const key = nodeKey(rootDir, module.path)
  const open = forceOpen || openNodes.includes(key)
  const count = module.groups.reduce((sum, group) => sum + group.tasks.length, 0)
  return (
    <>
      <div className="gt-row gt-row-module">
        <Guides depth={1} />
        <button
          className="gt-twisty"
          type="button"
          aria-expanded={open}
          onClick={() => { onToggleNode(key) }}
        >
          <span className={open ? 'gt-caret gt-open' : 'gt-caret'}>▶</span>
        </button>
        <button className="gt-row-body" type="button" title={module.path} onClick={() => { onToggleNode(key) }}>
          <span className="gt-row-icon gt-icon-module"><ModuleIcon /></span>
          <span className="gt-row-name gt-row-module-name">{module.name}</span>
          <span className="gt-badge">{count}</span>
        </button>
      </div>
      {!open ? null : (
        <GroupRows
          groups={module.groups}
          depth={2}
          rootDir={rootDir}
          nodePath={module.path}
          scope={module.path}
          openNodes={openNodes}
          selected={selected}
          launching={launching}
          t={t}
          onToggleNode={onToggleNode}
          onSelect={onSelect}
          onRun={onRun}
        />
      )}
    </>
  )
}
