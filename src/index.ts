/**
 * Host half of dsh-gradle-tasks.
 *
 * The panel asks three questions and this half answers them over the plugin's
 * own HTTP routes: which Gradle project does this Session live in, which tasks
 * does it declare, and which JDKs does this machine have. Running a task is
 * the fourth: one spawned Gradle process whose output streams back to the
 * panel until the build ends.
 */
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import {
  describeProject,
  findProjectRoot,
  gradleArgv,
  groupTasks,
  parseTaskDump,
  TASK_DUMP_SCRIPT,
  tailOf,
  wrapperScriptFor,
  type ProjectIo,
} from './gradle.ts'
import { collectJdkVariables, hasJavaExecutable, markDefault, readReleaseEntry } from './jdk.ts'
import { RunRegistry, type SpawnedProcess } from './runs.ts'
import {
  ROUTE_BASE,
  type FailureCode,
  type GradleProjectInfo,
  type JdkCandidate,
  type RunResponse,
  type StateResponse,
  type TasksResponse,
} from './shared/protocol.ts'

export const name = 'dsh-gradle-tasks'

/** Host services this plugin reads: routes, peer vetting, processes, and Session directories. */
export const inject = ['webServer', 'connection', 'subprocess', 'sessions', 'workingDirectory']

/** Longest task listing before the Gradle configuration is considered stuck. */
const LIST_TIMEOUT_MS = 15 * 60 * 1000

/** Largest request body any route accepts. */
const MAX_BODY_BYTES = 16 * 1024

/** Characters of Gradle output returned with a task listing. */
const OUTPUT_TAIL_CHARS = 8000

/** Grace period handed to the process seam when a build is terminated. */
const TERMINATE_GRACE_MS = 5000

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
  readonly workingDirectory: {
    get(session: object): string
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
}

/**
 * Mount the routes and the run registry.
 * @param ctx - Host Context with the declared services.
 */
export function apply(ctx: Context): void {
  const host = ctx as unknown as HostContext
  const runs = new RunRegistry(host.subprocess)
  ctx.effect(() => () => { runs.dispose() }, 'gradle-tasks: runs')

  const platform = cachedPlatform(host)
  const scratch = ensureScratchDirectory()

  ctx.effect(() => host.webServer.register({
    kind: 'exact',
    path: `${ROUTE_BASE}/state`,
    handler: async (req, res) => {
      if (rejected(host, req, res)) return
      if (req.method !== 'GET') { sendMethodNotAllowed(res, 'GET'); return }
      try {
        const query = queryOf(req)
        const path = resolveDirectory(host, query.get('sessionId'), query.get('path'))
        const root = findProjectRoot(path, projectIo)
        const state: StateResponse = {
          ok: true,
          path,
          project: root === null ? null : describeProject(root, projectIo),
          jdks: scanJdks(),
          platform: await platform(),
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
        const path = resolveDirectory(host, query.get('sessionId'), query.get('path'))
        sendJson(res, 200, await listTasks(host, path, await platform(), query.get('javaHome'), scratch))
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
        const path = resolveDirectory(host, stringField(body, 'sessionId'), stringField(body, 'path'))
        const taskPath = requiredString(body, 'taskPath')
        const javaHome = optionalJavaHome(body)
        sendJson(res, 200, await startRun(host, runs, path, taskPath, javaHome, await platform()))
      } catch (error) {
        sendJson(res, 200, failureOf(error) satisfies RunResponse)
      }
    },
  }), 'gradle-tasks: POST /run')

  ctx.effect(() => host.webServer.register({
    kind: 'exact',
    path: `${ROUTE_BASE}/run/stream`,
    handler: (req, res) => {
      if (rejected(host, req, res)) return
      if (req.method !== 'GET') { sendMethodNotAllowed(res, 'GET'); return }
      const id = queryOf(req).get('id') ?? ''
      if (runs.describe(id) === undefined) {
        sendJson(res, 404, { ok: false, error: 'run-not-found' } satisfies RunResponse)
        return
      }
      res.writeHead(200, {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-store',
        'x-accel-buffering': 'no',
      })
      let closed = false
      const detach = runs.subscribe(id, (event) => {
        if (closed) return
        res.write(`${JSON.stringify(event)}\n`)
      })
      if (detach === undefined) { res.end(); return }
      res.on('close', () => {
        closed = true
        detach()
      })
    },
  }), 'gradle-tasks: GET /run/stream')

  ctx.effect(() => host.webServer.register({
    kind: 'exact',
    path: `${ROUTE_BASE}/run/stop`,
    handler: async (req, res) => {
      if (rejected(host, req, res)) return
      if (req.method !== 'POST') { sendMethodNotAllowed(res, 'POST'); return }
      try {
        const body = await readJsonBody(req)
        sendJson(res, 200, { ok: runs.stop(requiredString(body, 'runId')) })
      } catch (error) {
        sendJson(res, 200, failureOf(error))
      }
    },
  }), 'gradle-tasks: POST /run/stop')
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
 * Write the initialization script, keeping it free of a byte-order mark.
 * Gradle's Groovy parser rejects a leading U+FEFF, and `writeFileSync` with an
 * explicit utf8 encoding never adds one — which is why the text is not written
 * through a shell redirection.
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
    pending ??= host.subprocess.terminalEnvironment().then(environment => environment.platform)
    return pending
  }
}

/**
 * Enumerate the JDKs the Host environment declares.
 * @returns verified candidates, the default one first.
 */
function scanJdks(): JdkCandidate[] {
  const verified = collectJdkVariables(process.env)
    .filter(candidate => hasJavaExecutable(candidate.home, projectIo.isFile))
    .map((candidate) => {
      const release = projectIo.readText?.(join(candidate.home, 'release'))
      return {
        variable: candidate.variable,
        home: candidate.home,
        version: release === undefined ? null : readReleaseEntry(release, 'JAVA_VERSION'),
      }
    })
  return markDefault(verified)
}

/**
 * Resolve the directory the panel should inspect.
 *
 * An explicit absolute path wins, so the panel can look at any build once a
 * person types or picks one. Otherwise the Session's committed working
 * directory is used, which is the project the conversation is already in.
 * @param host - Host context with the Session store and directory owner.
 * @param sessionId - Session named by the request, when it named one.
 * @param path - explicit directory from the request.
 * @returns the absolute directory.
 */
function resolveDirectory(host: HostContext, sessionId: string | null, path: string | null): string {
  const explicit = path?.trim()
  if (explicit !== undefined && explicit !== '') {
    if (!isAbsolutePath(explicit)) throw new RouteFailure('directory-relative', explicit)
    if (!isDirectory(explicit)) throw new RouteFailure('directory-missing', explicit)
    return explicit
  }
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

/** Where a Gradle command comes from in one project. */
interface GradleScript {
  readonly path: string
  readonly fromWrapper: boolean
}

/**
 * Pick the command that runs Gradle for a project: the project's own wrapper
 * first, because the build was authored against that distribution, and the
 * `gradle` executable on `PATH` only when the project ships no wrapper.
 * @param host - Host context carrying the subprocess provider.
 * @param project - the detected project.
 * @param platform - execution platform.
 * @returns the command to run.
 */
async function resolveScript(
  host: HostContext,
  project: GradleProjectInfo,
  platform: 'posix' | 'windows',
): Promise<GradleScript> {
  const wrapper = wrapperScriptFor(project, platform)
  if (wrapper !== null) return { path: join(project.rootDir, wrapper), fromWrapper: true }
  if (project.wrapper !== null) throw new RouteFailure('wrapper-mismatch', `${project.wrapper} / ${platform}`)
  try {
    return { path: await host.subprocess.resolveExecutable('gradle'), fromWrapper: false }
  } catch (error) {
    console.warn('gradle-tasks: no gradle executable on PATH', error)
    throw new RouteFailure('gradle-missing', project.rootDir)
  }
}

/**
 * Run Gradle with the initialization script and read back its task report.
 * @param host - Host context.
 * @param path - directory the panel inspected.
 * @param platform - execution platform.
 * @param javaHome - JDK to run this listing with, or null for the environment default.
 * @param scratch - directory for the script and the report.
 * @returns the grouped task report.
 */
async function listTasks(
  host: HostContext,
  path: string,
  platform: 'posix' | 'windows',
  javaHome: string | null,
  scratch: string,
): Promise<TasksResponse> {
  const started = Date.now()
  const root = findProjectRoot(path, projectIo)
  if (root === null) throw new RouteFailure('not-gradle', path)
  const project = describeProject(root, projectIo)
  const script = await resolveScript(host, project, platform)
  const reportPath = join(scratch, `tasks-${randomUUID()}.txt`)
  const argv = gradleArgv(script, [
    '--quiet', '--console=plain',
    '-p', project.rootDir,
    '--init-script', writeDumpScript(scratch),
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
  const report = readReport(reportPath)
  if (report === null) {
    const code = outcome.code === 0 ? 'no-report' : 'scan-failed'
    throw new RouteFailure(code, `${String(outcome.code ?? '?')}\n${tailOf(outcome.output, OUTPUT_TAIL_CHARS)}`)
  }
  return {
    ok: true,
    project,
    groups: groupTasks(parseTaskDump(report)),
    durationMs,
    output: tailOf(outcome.output, OUTPUT_TAIL_CHARS),
  }
}

/** Read the task report, or null when Gradle never wrote one. */
function readReport(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch (error) {
    console.warn(`gradle-tasks: no task report at ${path}`, error)
    return null
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

/**
 * Spawn and register one Gradle task run.
 * @param host - Host context.
 * @param runs - run registry.
 * @param path - directory the panel inspected.
 * @param taskPath - fully qualified task to execute.
 * @param javaHome - JDK chosen in the panel, or null for the environment default.
 * @param platform - execution platform.
 * @returns the accepted run.
 */
async function startRun(
  host: HostContext,
  runs: RunRegistry,
  path: string,
  taskPath: string,
  javaHome: string | null,
  platform: 'posix' | 'windows',
): Promise<RunResponse> {
  const root = findProjectRoot(path, projectIo)
  if (root === null) throw new RouteFailure('not-gradle', path)
  const project = describeProject(root, projectIo)
  const script = await resolveScript(host, project, platform)
  const args = [taskPath, '--console=plain']
  const runId = runs.start({
    argv: gradleArgv(script, args, platform),
    cwd: project.rootDir,
    env: javaEnvironment(javaHome),
    displayCommand: [script.path, ...args].join(' '),
    graceMs: TERMINATE_GRACE_MS,
  })
  return { ok: true, runId, command: [script.path, ...args].join(' ') }
}

/**
 * The environment a Gradle process needs to build with a chosen JDK.
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

/** Write one JSON answer with the plugin's cache policy. */
function sendJson(res: ServerResponse, status: number, payload: unknown): void {
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

/**
 * Read the JDK choice, rejecting a directory that does not exist so a typo
 * cannot silently fall back to the inherited JDK.
 */
function optionalJavaHome(body: Record<string, unknown>): string | null {
  const value = stringField(body, 'javaHome')?.trim()
  if (value === undefined || value === '') return null
  if (!isAbsolutePath(value)) throw new RouteFailure('java-invalid', value)
  if (!hasJavaExecutable(value, projectIo.isFile)) throw new RouteFailure('java-invalid', value)
  return value
}
