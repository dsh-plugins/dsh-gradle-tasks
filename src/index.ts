/**
 * Host half of dsh-gradle-tasks.
 *
 * The panel asks three questions and this half answers them over the plugin's
 * own HTTP routes: which Gradle project does this Session live in, which tasks
 * does it declare, and which JDKs does this machine have. Running a task is the
 * fourth: this half types the command into the Session's terminal, so the build
 * runs where the person can watch it and take over.
 */
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import {
  collectConfigurationInputs,
  describeProjectEntry,
  discoverProjects,
  fingerprintConfiguration,
  gradleArgv,
  groupTasks,
  isTaskPath,
  parseTaskDump,
  parseTaskReport,
  pathKey,
  selectProject,
  shellCommandLine,
  shellKindOf,
  TASK_DUMP_SCRIPT,
  tailOf,
  wrapperScriptFor,
  type ProjectIo,
} from './gradle.ts'
import { collectJdkVariables, hasJavaExecutable, readReleaseEntry } from './jdk.ts'
import { CACHE_VERSION, readTaskCache, writeTaskCache } from './cache.ts'
import {
  ROUTE_BASE,
  type FailureCode,
  type GradleProjectEntry,
  type GradleTaskGroup,
  type JdkCandidate,
  type RunResponse,
  type StateResponse,
  type TasksResponse,
} from './shared/protocol.ts'

export const name = 'dsh-gradle-tasks'

/** Host services this plugin reads. */
export const inject = [
  'webServer',
  'connection',
  'subprocess',
  'sessions',
  'agents',
  'workingDirectory',
  'sandboxPolicy',
  'terminalController',
]

/** Longest task listing before the Gradle configuration is considered stuck. */
const LIST_TIMEOUT_MS = 15 * 60 * 1000

/** Largest request body any route accepts. */
const MAX_BODY_BYTES = 16 * 1024

/** Characters of Gradle output returned with a task listing. */
const OUTPUT_TAIL_CHARS = 8000

/** Grace period handed to the process seam when a scan is terminated. */
const TERMINATE_GRACE_MS = 5000

/** Terminal geometry for a Gradle terminal; the shell resizes it when shown. */
const TERMINAL_COLS = 120
const TERMINAL_ROWS = 32

/** How long a new shell may stay silent before the command is typed regardless. */
const SHELL_READY_TIMEOUT_MS = 8000

/** The part of a subprocess handle the scan collector uses. */
interface SpawnedProcess {
  readonly stdout: NodeJS.ReadableStream | undefined
  readonly stderr: NodeJS.ReadableStream | undefined
  readonly done: Promise<{ readonly exitCode: number | null }>
  terminate(): void
}

/** A Session-owned terminal as this plugin needs it. */
interface AgentTerminalHandle {
  readonly id: string
  readonly info: {
    readonly state: string
    readonly control: string
    readonly title: string
    /** Directory the shell started in; the reuse check must match it. */
    readonly cwd: string
    /** The shell this terminal actually started, which decides the quoting. */
    readonly shell: { readonly path: string }
  }
  /** Output revision; advances as the shell produces something. */
  readonly revision: number
  /** Resolve once the next output change is applied, or reject when the wait aborts. */
  changed(after: number, signal: AbortSignal): Promise<number>
  /** Resolve once output received so far is applied. */
  drain(): Promise<void>
  write(data: string): Promise<void>
  close(): Promise<void>
}

/** The extension points this Host half requires from the surrounding Host. */
interface HostServices {
  readonly webServer: {
    register(route: {
      kind: 'exact' | 'prefix'
      path: string
      handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
    }): () => void
  }
  readonly connection: {
    requestRejection(req: IncomingMessage): 401 | 403 | undefined
  }
  readonly subprocess: {
    resolveExecutable(command: string): Promise<string>
    terminalEnvironment(): Promise<{ platform: 'posix' | 'windows' }>
    spawn(spec: {
      argv: readonly string[]
      cwd: string
      stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' }
      graceMs: number
      env?: Readonly<Record<string, string>>
    }): SpawnedProcess
  }
  readonly sessions: {
    get(id: string): object | undefined
  }
  readonly agents: {
    get(id: string): object | undefined
  }
  readonly workingDirectory: {
    get(session: object): string
  }
  readonly sandboxPolicy: {
    resolve(request: { session?: object, mode?: string }): unknown
  }
  readonly terminalController: {
    openForAgent(
      agent: object,
      request: {
        title: string
        cwd?: string
        cols: number
        rows: number
        policy: unknown
        preferredShells: readonly string[]
        env?: Readonly<Record<string, string>>
      },
      signal: AbortSignal,
    ): Promise<AgentTerminalHandle>
  }
}

/** A Host context carrying the services this plugin declares. */
type HostContext = Context & HostServices

/** A request that cannot be answered, reported to the panel as a code plus detail. */
class RouteFailure extends Error {
  constructor(readonly code: FailureCode, readonly detail?: string) {
    super(detail === undefined ? code : `${code}: ${detail}`)
    this.name = 'RouteFailure'
  }
}

/** Turn any thrown value into the shape a failing route returns. */
function failureOf(error: unknown): { readonly ok: false, readonly error: FailureCode, readonly detail?: string } {
  if (error instanceof RouteFailure) {
    return error.detail === undefined
      ? { ok: false, error: error.code }
      : { ok: false, error: error.code, detail: error.detail }
  }
  console.error('gradle-tasks: unexpected failure while answering a route', error)
  return { ok: false, error: 'scan-failed', detail: error instanceof Error ? error.message : String(error) }
}

/** Filesystem face handed to the pure Gradle rules. */
const projectIo: ProjectIo = {
  isFile: (path) => {
    try {
      return statSync(path).isFile()
    } catch {
      // A missing probe target is the ordinary "this script is absent" answer.
      return false
    }
  },
  readText: (path) => {
    try {
      return readFileSync(path, 'utf8')
    } catch (error) {
      // An unreadable wrapper descriptor only costs the version line in the panel.
      console.warn(`gradle-tasks: cannot read ${path}`, error)
      return undefined
    }
  },
  listDirectory: (path) => {
    try {
      return readdirSync(path, { withFileTypes: true }).map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
      }))
    } catch (error) {
      // The walk prunes what it cannot enter and keeps the inputs it already has.
      console.warn(`gradle-tasks: cannot list ${path}`, error)
      return []
    }
  },
}

/** One build terminal this plugin opened, so the next run for that build continues in it. */
interface TerminalRecord {
  readonly sessionId: string
  /** Build root the terminal was opened for. */
  readonly rootDir: string
  readonly handle: AgentTerminalHandle
}

/**
 * Mount the routes.
 * @param ctx - Host Context with the declared services.
 */
export function apply(ctx: Context): void {
  const host = ctx as unknown as HostContext
  const platform = cachedPlatform(host)
  const scratch = ensureScratchDirectory()
  const scriptPath = writeDumpScript(scratch)
  const terminals = new Map<string, TerminalRecord>()

  ctx.effect(() => () => {
    for (const record of terminals.values()) {
      void record.handle.close().catch((error: unknown) => {
        console.warn(`gradle-tasks: cannot close terminal ${record.handle.id}`, error)
      })
    }
    terminals.clear()
  }, 'gradle-tasks: terminals')

  ctx.effect(() => host.webServer.register({
    kind: 'exact',
    path: `${ROUTE_BASE}/state`,
    handler: async (req, res) => {
      if (rejected(host, req, res)) return
      if (req.method !== 'GET') { sendMethodNotAllowed(res, 'GET'); return }
      try {
        const path = sessionDirectory(host, queryOf(req).get('sessionId'))
        const discovery = discoverProjects(path, projectIo)
        const state: StateResponse = {
          ok: true,
          path,
          projects: discovery.projects.map(project => describeProjectEntry(project.rootDir, project.relativePath, projectIo)),
          ...discovery.truncated && { truncated: true },
          jdks: scanJdks(),
        }
        sendJson(res, 200, state)
      } catch (error) {
        sendJson(res, 200, failureOf(error))
      }
    },
  }), 'gradle-tasks: GET /state')

  ctx.effect(() => host.webServer.register({
    kind: 'exact',
    path: `${ROUTE_BASE}/tasks`,
    handler: async (req, res) => {
      if (rejected(host, req, res)) return
      if (req.method !== 'GET') { sendMethodNotAllowed(res, 'GET'); return }
      try {
        const query = queryOf(req)
        const path = sessionDirectory(host, query.get('sessionId'))
        const project = requireProject(path, query.get('project'))
        sendJson(res, 200, await listTasks({
          host,
          project,
          platform: await platform(),
          javaHome: checkedJavaHome(query.get('javaHome')),
          offline: query.get('offline') === '1',
          force: query.get('force') === '1',
          scratch,
          scriptPath,
        }))
      } catch (error) {
        sendJson(res, 200, failureOf(error) satisfies TasksResponse)
      }
    },
  }), 'gradle-tasks: GET /tasks')

  ctx.effect(() => host.webServer.register({
    kind: 'exact',
    path: `${ROUTE_BASE}/run`,
    handler: async (req, res) => {
      if (rejected(host, req, res)) return
      if (req.method !== 'POST') { sendMethodNotAllowed(res, 'POST'); return }
      try {
        const body = await readJsonBody(req)
        const answer = await runTask({
          host,
          terminals,
          sessionId: requiredString(body, 'sessionId'),
          project: stringField(body, 'project'),
          taskPath: requiredString(body, 'taskPath'),
          javaHome: checkedJavaHome(stringField(body, 'javaHome')),
          offline: body.offline === true,
          openTerminalIds: stringList(body, 'openTerminalIds'),
          platform: await platform(),
        })
        sendJson(res, 200, answer)
      } catch (error) {
        sendJson(res, 200, failureOf(error) satisfies RunResponse)
      }
    },
  }), 'gradle-tasks: POST /run')
}

/**
 * Create the scratch directory holding the initialization script.
 * @returns the directory path.
 */
function ensureScratchDirectory(): string {
  const directory = join(tmpdir(), 'dsh-gradle-tasks')
  mkdirSync(directory, { recursive: true })
  return directory
}

/**
 * Write the initialization script once per plugin lifetime, keeping it free of
 * a byte-order mark. Gradle's Groovy parser rejects a leading U+FEFF, and
 * `writeFileSync` with an explicit utf8 encoding never adds one — which is why
 * the text is not written through a shell redirection.
 * @param directory - scratch directory.
 * @returns the script path.
 */
function writeDumpScript(directory: string): string {
  const path = join(directory, 'dump-tasks.gradle')
  writeFileSync(path, TASK_DUMP_SCRIPT, 'utf8')
  return path
}

/**
 * Memory of the execution platform, read once from the subprocess provider.
 * @param host - Host context carrying the provider.
 * @returns a loader resolving the cached platform.
 */
function cachedPlatform(host: HostContext): () => Promise<'posix' | 'windows'> {
  let pending: Promise<'posix' | 'windows'> | undefined
  return () => {
    pending ??= host.subprocess.terminalEnvironment()
      .then(environment => environment.platform)
      .catch((error: unknown) => {
        // A failed probe is retried on the next request instead of pinning the
        // rejection for the life of the plugin.
        pending = undefined
        throw error
      })
    return pending
  }
}

/**
 * Enumerate the JDKs the Host environment declares.
 *
 * A variable only counts once its directory really holds a `java` executable,
 * so a stale or mistyped entry never reaches the selector. The first surviving
 * candidate — by construction `JAVA_HOME` when it is usable — is the default.
 * @returns verified candidates, the default one first.
 */
function scanJdks(): JdkCandidate[] {
  const verified = collectJdkVariables(process.env)
    .filter(candidate => hasJavaExecutable(candidate.home, projectIo.isFile))
    .map((candidate) => {
      const release = projectIo.readText(join(candidate.home, 'release'))
      return {
        variable: candidate.variable,
        home: candidate.home,
        version: release === undefined ? null : readReleaseEntry(release, 'JAVA_VERSION'),
      }
    })
  return verified.map((candidate, index) => ({ ...candidate, isDefault: index === 0 }))
}

/**
 * The Session's committed working directory.
 *
 * The panel inspects the project the conversation is already in, so the Session
 * is the only input; a Caller cannot point it at another directory.
 * @param host - Host context with the Session store and directory owner.
 * @param sessionId - Session named by the request.
 * @returns the absolute directory.
 */
function sessionDirectory(host: HostContext, sessionId: string | null): string {
  const id = sessionId?.trim()
  if (id === undefined || id === '') throw new RouteFailure('no-session')
  const session = host.sessions.get(id)
  if (session === undefined) throw new RouteFailure('session-inactive', id)
  const directory = host.workingDirectory.get(session)
  if (!isDirectory(directory)) throw new RouteFailure('directory-missing', directory)
  return directory
}

/** Whether a path is absolute on the Host platform. */
function isAbsolutePath(path: string): boolean {
  return /^(?:[a-zA-Z]:[\\/]|\\\\|\/)/.test(path)
}

/** Whether a path names an existing directory. */
function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    // Absent or unreadable paths are reported as "not a directory" by the caller.
    return false
  }
}

/**
 * The build root a request names, resolved against this Session's own workspace.
 *
 * The named path is matched against the discovered roots rather than used
 * directly: a Caller may only build something the workspace actually holds, and
 * an ambiguity is reported instead of guessed at, because silently picking one
 * of several repositories would run a build somewhere the person never pointed
 * at.
 * @param directory - the Session's working directory.
 * @param requested - absolute root path named by the request, or null.
 * @returns the matching entry.
 */
function requireProject(directory: string, requested: string | null): GradleProjectEntry {
  const discovery = discoverProjects(directory, projectIo)
  if (discovery.projects.length === 0) throw new RouteFailure('not-gradle', directory)
  const entries = discovery.projects.map(project => describeProjectEntry(project.rootDir, project.relativePath, projectIo))
  const chosen = selectProject(entries, requested)
  if (chosen !== null) return chosen
  if (requested === null || requested.trim() === '') {
    throw new RouteFailure('project-not-found', `${directory} holds ${entries.length} projects; name one`)
  }
  throw new RouteFailure('project-not-found', requested)
}

/**
 * Pick the command that runs Gradle for a project: the project's own wrapper
 * first, because the build was authored against that distribution, and the
 * `gradle` executable on `PATH` only when the project ships no wrapper.
 * @param host - Host context carrying the subprocess provider.
 * @param project - the detected project.
 * @param platform - execution platform.
 * @returns the executable path.
 */
async function resolveScript(
  host: HostContext,
  project: GradleProjectEntry,
  platform: 'posix' | 'windows',
): Promise<string> {
  const wrapper = wrapperScriptFor(project, platform)
  if (wrapper !== null) return join(project.rootDir, wrapper)
  if (project.wrapper !== null) throw new RouteFailure('wrapper-mismatch', `${project.wrapper} / ${platform}`)
  try {
    return await host.subprocess.resolveExecutable('gradle')
  } catch (error) {
    console.warn('gradle-tasks: no gradle executable on PATH', error)
    throw new RouteFailure('gradle-missing', project.rootDir)
  }
}

/** Everything one task listing needs, gathered so the function stays readable. */
interface ListInput {
  readonly host: HostContext
  /** Build root the request resolved to. */
  readonly project: GradleProjectEntry
  readonly platform: 'posix' | 'windows'
  readonly javaHome: string | null
  /** Add `--offline`, so Gradle neither downloads nor checks for updates. */
  readonly offline: boolean
  /** Ignore any cache and configure the build again. */
  readonly force: boolean
  readonly scratch: string
  readonly scriptPath: string
}

/**
 * Run Gradle with the initialization script and read back its task report.
 *
 * A cached list is returned when every configuration input still has the same
 * content and the platform and JDK are unchanged, because only then can the
 * previous scan be trusted to describe the same set of tasks. The cache lives
 * inside each build root, so several projects in one workspace never share an
 * entry.
 * @param input - the scan request.
 * @returns the grouped task report.
 */
async function listTasks(input: ListInput): Promise<TasksResponse> {
  const { host, project, platform, javaHome, offline, force, scratch, scriptPath } = input
  const fingerprint = fingerprintConfiguration(
    CACHE_VERSION,
    collectConfigurationInputs(project.rootDir, projectIo),
    [platform, javaHome ?? '', scriptPath, offline ? 'offline' : 'online'],
  )
  if (!force) {
    const cached = readTaskCache(project.rootDir)
    if (cached !== null && cached.fingerprint === fingerprint) {
      return {
        ok: true,
        project,
        groups: cached.groups,
        durationMs: cached.durationMs,
        output: '',
        cached: true,
        scannedAt: cached.scannedAt,
      }
    }
  }
  const started = Date.now()
  const script = await resolveScript(host, project, platform)
  const reportPath = join(scratch, `tasks-${randomUUID()}.txt`)
  const argv = gradleArgv({ path: script }, [
    '--quiet', '--console=plain',
    ...offline ? ['--offline'] : [],
    '-p', project.rootDir,
    '--init-script', scriptPath,
    `-PdshGradleTasksOut=${reportPath}`,
    'help',
  ], platform)
  const outcome = await collect(host, {
    argv,
    cwd: project.rootDir,
    env: javaEnvironment(javaHome),
    timeoutMs: LIST_TIMEOUT_MS,
  })
  const durationMs = Date.now() - started
  if (outcome.timedOut) throw new RouteFailure('scan-timeout', tailOf(outcome.output, OUTPUT_TAIL_CHARS))
  const report = takeReport(reportPath)
  const groups = report === null
    ? await reportAsTasks(input, script)
    : groupTasks(parseTaskDump(report))
  const scannedAt = Date.now()
  writeTaskCache(project.rootDir, { version: CACHE_VERSION, fingerprint, javaHome, groups, scannedAt, durationMs })
  return {
    ok: true,
    project,
    groups,
    durationMs,
    output: tailOf(outcome.output, OUTPUT_TAIL_CHARS),
    cached: false,
    scannedAt,
  }
}

/**
 * Read the task list from Gradle's own report instead of the initialization
 * script's dump.
 *
 * The dump traverses every project's tasks while the build is being configured,
 * which Gradle 9 rejects for any convention plugin that resolves a configuration
 * during task creation. Gradle's `tasks --all` realizes tasks inside a real task
 * run, where the locks exist, so it is the second attempt — not the first,
 * because it walks more of the build and its text has to be parsed.
 * @param input - the scan request.
 * @param script - the resolved Gradle executable or wrapper.
 * @returns the grouped tasks.
 */
async function reportAsTasks(input: ListInput, script: string): Promise<GradleTaskGroup[]> {
  const { host, project, platform, javaHome, offline } = input
  const outcome = await collect(host, {
    argv: gradleArgv({ path: script }, [
      '--quiet', '--console=plain',
      ...offline ? ['--offline'] : [],
      '-p', project.rootDir,
      'tasks', '--all',
    ], platform),
    cwd: project.rootDir,
    env: javaEnvironment(javaHome),
    timeoutMs: LIST_TIMEOUT_MS,
  })
  if (outcome.timedOut) throw new RouteFailure('scan-timeout', tailOf(outcome.output, OUTPUT_TAIL_CHARS))
  const tasks = parseTaskReport(outcome.output)
  if (tasks.length === 0) {
    const code = outcome.code === 0 ? 'no-report' : 'scan-failed'
    throw new RouteFailure(code, `${String(outcome.code ?? '?')}
${tailOf(outcome.output, OUTPUT_TAIL_CHARS)}`)
  }
  return groupTasks(tasks)
}

/** Read the task report and remove the temporary file Gradle wrote. */
function takeReport(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch (error) {
    console.warn(`gradle-tasks: no task report at ${path}`, error)
    return null
  } finally {
    rmSync(path, { force: true })
  }
}

/** What one collected Gradle invocation produced. */
interface CollectedOutcome {
  readonly code: number | null
  readonly output: string
  /** True when the time budget expired and the process was terminated. */
  readonly timedOut: boolean
}

/**
 * Run one Gradle invocation to completion, collecting its output.
 * @param host - Host context carrying the subprocess provider.
 * @param spec - argv, directory, environment, and the overall time budget.
 * @returns the exit code, the combined output, and whether the budget expired.
 */
function collect(
  host: HostContext,
  spec: { argv: readonly string[], cwd: string, env: Readonly<Record<string, string>>, timeoutMs: number },
): Promise<CollectedOutcome> {
  return new Promise((resolve, reject) => {
    let handle: SpawnedProcess
    try {
      handle = host.subprocess.spawn({
        argv: spec.argv,
        cwd: spec.cwd,
        stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
        graceMs: TERMINATE_GRACE_MS,
        env: { ...spec.env },
      })
    } catch (error) {
      reject(error)
      return
    }
    const chunks: string[] = []
    const sink = (stream: NodeJS.ReadableStream | undefined): void => {
      stream?.setEncoding('utf8')
      stream?.on('data', (text: string) => { chunks.push(text) })
    }
    sink(handle.stdout)
    sink(handle.stderr)
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      handle.terminate()
    }, spec.timeoutMs)
    timer.unref()
    handle.done.then((outcome) => {
      clearTimeout(timer)
      resolve({ code: outcome.exitCode, output: chunks.join(''), timedOut })
    }, (error: unknown) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

/** Everything one run needs. */
interface RunInput {
  readonly host: HostContext
  readonly terminals: Map<string, TerminalRecord>
  readonly sessionId: string
  /** Build root the request resolved to, or null to let a single-project workspace decide. */
  readonly project: string | null
  readonly taskPath: string
  readonly javaHome: string | null
  readonly offline: boolean
  /** Terminals currently open as tabs in the asking window. */
  readonly openTerminalIds: readonly string[]
  readonly platform: 'posix' | 'windows'
}

/**
 * Type one Gradle task into the Session's terminal.
 *
 * The terminal is reused per build root while this plugin still holds its
 * handle, the person has not taken it over, and a tab for it is open; otherwise
 * a new one is opened, which the Sidebar then shows as its own tab. Keying the
 * record by root as well as Session is what lets a workspace of several
 * repositories keep one terminal per repository: switching to another project
 * starts its own terminal, and switching back continues in the original one.
 * @param input - the run request.
 * @returns the terminal the command went to.
 */
async function runTask(input: RunInput): Promise<RunResponse> {
  const { host, terminals, sessionId, taskPath, javaHome, offline, openTerminalIds, platform } = input
  if (!isTaskPath(taskPath)) throw new RouteFailure('task-missing', taskPath)
  const directory = sessionDirectory(host, sessionId)
  const project = requireProject(directory, input.project)
  const script = await resolveScript(host, project, platform)

  const agent = host.agents.get(sessionId)
  if (agent === undefined) throw new RouteFailure('session-inactive', sessionId)
  const session = host.sessions.get(sessionId)
  if (session === undefined) throw new RouteFailure('session-inactive', sessionId)

  const key = terminalKey(sessionId, project.rootDir)
  const reusable = reusableTerminal(terminals.get(key), openTerminalIds, project.rootDir)
  const terminal = reusable ?? await openTerminal(host, {
    agent,
    session,
    sessionId,
    cwd: project.rootDir,
    env: javaEnvironment(javaHome),
    platform,
  })
  terminals.set(key, { sessionId, rootDir: project.rootDir, handle: terminal })

  // The command is quoted for the shell the terminal actually started, not for
  // the platform: a `cmd.exe` terminal reads `&` as a command separator.
  const kind = shellKindOf(terminal.info.shell.path, platform)
  const args = [taskPath, '--console=plain', ...offline ? ['--offline'] : []]
  const command = shellCommandLine(script, args, kind)

  await awaitShell(terminal)
  await terminal.write(`${command}\r`)
  return {
    ok: true,
    terminalId: terminal.id,
    terminalTitle: terminal.info.title,
    command,
    taskPath,
  }
}

/**
 * The record key of one build terminal.
 *
 * A Session may build several repositories, and each of them wants its own
 * terminal sitting in its own directory; the key is therefore the pair, with
 * the directory normalized the way path comparison elsewhere normalizes it.
 * @param sessionId - owning Session.
 * @param rootDir - the build root the terminal belongs to.
 * @returns the map key.
 */
function terminalKey(sessionId: string, rootDir: string): string {
  return `${sessionId}\u0000${pathKey(rootDir)}`
}

/**
 * Wait until the terminal's shell has produced output.
 *
 * A shell that is still starting — loading a PowerShell profile, sourcing an
 * rc file — may drop input typed before its prompt, so the command goes in once
 * the terminal has spoken. A shell that stays silent until the timeout receives
 * the command anyway; the warning records that the wait did not confirm it.
 * @param terminal - the terminal about to receive the command.
 */
async function awaitShell(terminal: AgentTerminalHandle): Promise<void> {
  const deadline = Date.now() + SHELL_READY_TIMEOUT_MS
  while (terminal.revision === 0) {
    const remaining = deadline - Date.now()
    if (remaining <= 0) {
      console.warn(`gradle-tasks: terminal ${terminal.id} produced no output within ${SHELL_READY_TIMEOUT_MS}ms`)
      return
    }
    try {
      await terminal.changed(terminal.revision, AbortSignal.timeout(remaining))
    } catch (error) {
      console.warn(`gradle-tasks: terminal ${terminal.id} stayed silent; typing the command anyway`, error)
      return
    }
  }
  await terminal.drain()
}

/**
 * The terminal a run may continue in.
 *
 * A terminal started in another directory cannot run this build: the command
 * carries no `-p`, so Gradle reads the shell's own working directory, and a
 * person who moved their Session to another project must get a terminal there.
 * @param record - the terminal this plugin last opened for the Session.
 * @param openTerminalIds - terminals the asking window currently shows as tabs.
 * @param rootDir - the build root this run belongs to.
 * @returns that terminal, or undefined when a new one is needed.
 */
function reusableTerminal(
  record: TerminalRecord | undefined,
  openTerminalIds: readonly string[],
  rootDir: string,
): AgentTerminalHandle | undefined {
  if (record === undefined) return undefined
  const { handle } = record
  if (handle.info.state !== 'running') return undefined
  // A terminal the person typed into belongs to them; typing into it would
  // hijack their session, so the next run gets a terminal of its own.
  if (handle.info.control !== 'agent') return undefined
  if (!openTerminalIds.includes(handle.id)) return undefined
  if (!sameDirectory(handle.info.cwd, rootDir)) return undefined
  return handle
}

/** Whether two absolute paths name the same directory, ignoring Windows case and a trailing separator. */
function sameDirectory(left: string, right: string): boolean {
  const normalize = (path: string): string => path.replace(/[\\/]+$/, '').replaceAll('\\', '/')
  return normalize(left).toLowerCase() === normalize(right).toLowerCase()
}

/**
 * Open a new Session terminal for builds.
 * @param host - Host context with the terminal controller and sandbox policy.
 * @param request - the owning Agent and Session, the build directory, and the environment.
 * @returns the committed terminal.
 */
async function openTerminal(
  host: HostContext,
  request: {
    readonly agent: object
    readonly session: object
    readonly sessionId: string
    readonly cwd: string
    readonly env: Readonly<Record<string, string>>
    readonly platform: 'posix' | 'windows'
  },
): Promise<AgentTerminalHandle> {
  const title = terminalTitleOf(request.cwd)
  try {
    return await host.terminalController.openForAgent(request.agent, {
      title,
      cwd: request.cwd,
      cols: TERMINAL_COLS,
      rows: TERMINAL_ROWS,
      policy: host.sandboxPolicy.resolve({ session: request.session }),
      preferredShells: preferredShellsFor(request.platform),
      env: request.env,
    }, AbortSignal.timeout(30_000))
  } catch (error) {
    console.error(`gradle-tasks: cannot open a terminal for ${request.sessionId}`, error)
    throw new RouteFailure('terminal-failed', error instanceof Error ? error.message : String(error))
  }
}

/**
 * The shells to try before the platform default.
 *
 * On Windows the default is `cmd.exe`, which reads this plugin's PowerShell
 * quoting as literal text; PowerShell starts batch wrappers with the call
 * operator and quotes each argument, so it is asked for first. `pwsh` covers
 * PowerShell 7+, `powershell` the Windows PowerShell every supported release
 * still ships. A terminal that gets neither is handled by
 * {@link shellKindOf}, which quotes for `cmd.exe` instead.
 * @param platform - the terminal's platform.
 * @returns executable names in preference order.
 */
function preferredShellsFor(platform: 'posix' | 'windows'): readonly string[] {
  return platform === 'windows' ? ['pwsh', 'powershell'] : []
}

/** The tab title for a build terminal: the project directory's name. */
function terminalTitleOf(rootDir: string): string {
  const name = rootDir.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? rootDir
  return `Gradle · ${name}`.slice(0, 120)
}

/**
 * The environment a Gradle shell needs to build with a chosen JDK.
 *
 * `JAVA_HOME` is what Gradle reads, and `PATH` is what the wrapper's own
 * `java` lookup reads first, so both are set together; a null home leaves the
 * inherited environment untouched.
 * @param javaHome - chosen JDK directory.
 * @returns environment entries to overlay on the inherited environment.
 */
function javaEnvironment(javaHome: string | null): Readonly<Record<string, string>> {
  if (javaHome === null || javaHome === '') return {}
  const inherited = process.env.PATH ?? ''
  const bin = join(javaHome, 'bin')
  return { JAVA_HOME: javaHome, PATH: inherited === '' ? bin : `${bin}${delimiter}${inherited}` }
}

/**
 * Vet a request the same way the shipped Host routes do, so a foreign origin
 * or a missing browser cookie cannot drive a build.
 * @returns true when the request was already answered with the rejection.
 */
function rejected(host: HostContext, req: IncomingMessage, res: ServerResponse): boolean {
  const rejection = host.connection.requestRejection(req)
  if (rejection === undefined) return false
  res.statusCode = rejection
  res.end()
  return true
}

/**
 * Write one JSON answer with the plugin's cache policy.
 *
 * A scan can outlive the browser request that asked for it, so the response
 * may already be destroyed by the time the answer exists; writing then would
 * surface as a stream error on a socket nobody is reading.
 */
function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  if (res.destroyed || res.writableEnded) return
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

/** Answer a route called with the wrong method. */
function sendMethodNotAllowed(res: ServerResponse, allowed: string): void {
  res.writeHead(405, { allow: allowed, 'content-type': 'text/plain; charset=utf-8' })
  res.end(`method not allowed: use ${allowed}`)
}

/** Read the request's query parameters. */
function queryOf(req: IncomingMessage): URLSearchParams {
  return new URL(req.url ?? '/', 'http://localhost').searchParams
}

/**
 * Read a bounded JSON request body.
 * @param req - the request.
 * @returns the parsed object.
 */
async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.byteLength
    if (size > MAX_BODY_BYTES) throw new RouteFailure('body-too-large', String(size))
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (text.trim() === '') return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    console.warn('gradle-tasks: request body is not JSON', error)
    throw new RouteFailure('body-invalid', text.slice(0, 200))
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new RouteFailure('body-invalid', text.slice(0, 200))
  }
  return parsed as Record<string, unknown>
}

/** Read an optional string field. */
function stringField(body: Record<string, unknown>, key: string): string | null {
  const value = body[key]
  return typeof value === 'string' ? value : null
}

/** Read a required, non-empty string field. */
function requiredString(body: Record<string, unknown>, key: string): string {
  const value = stringField(body, key)?.trim()
  if (value === undefined || value === '') throw new RouteFailure('field-missing', key)
  return value
}

/** Read a list of strings, ignoring anything else the body carries. */
function stringList(body: Record<string, unknown>, key: string): readonly string[] {
  const value = body[key]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

/**
 * Read the JDK choice, rejecting a directory that does not exist so a typo
 * cannot silently fall back to the inherited JDK.
 * @param value - a directory from the request body or query, or null.
 * @returns the validated directory, or null to inherit the environment.
 */
function checkedJavaHome(value: string | null | undefined): string | null {
  const home = value?.trim()
  if (home === undefined || home === '') return null
  if (!isAbsolutePath(home)) throw new RouteFailure('java-invalid', home)
  if (!hasJavaExecutable(home, projectIo.isFile)) throw new RouteFailure('java-invalid', home)
  return home
}
