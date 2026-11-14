/**
 * Host half of dsh-gradle-tasks.
 *
 * The panel asks three questions and this half answers them over the plugin's
 * own HTTP routes: which Gradle project does this Session live in, which tasks
 * does it declare, and which JDKs does this machine have. Running a task is the
 * fourth: this half types the command into the Session's terminal, so the build
 * runs where the person can watch it and take over.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { collectConfigurationInputs, describeProject, findProjectRoot, fingerprintConfiguration, gradleArgv, groupTasks, isTaskPath, parseTaskDump, shellCommandLine, TASK_DUMP_SCRIPT, tailOf, wrapperScriptFor, } from "./gradle.js";
import { collectJdkVariables, hasJavaExecutable, readReleaseEntry } from "./jdk.js";
import { CACHE_VERSION, readTaskCache, writeTaskCache } from "./cache.js";
import { ROUTE_BASE, } from "./shared/protocol.js";
export const name = 'dsh-gradle-tasks';
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
];
/** Longest task listing before the Gradle configuration is considered stuck. */
const LIST_TIMEOUT_MS = 15 * 60 * 1000;
/** Largest request body any route accepts. */
const MAX_BODY_BYTES = 16 * 1024;
/** Characters of Gradle output returned with a task listing. */
const OUTPUT_TAIL_CHARS = 8000;
/** Grace period handed to the process seam when a scan is terminated. */
const TERMINATE_GRACE_MS = 5000;
/** Terminal geometry for a Gradle terminal; the shell resizes it when shown. */
const TERMINAL_COLS = 120;
const TERMINAL_ROWS = 32;
/** How long a new shell may stay silent before the command is typed regardless. */
const SHELL_READY_TIMEOUT_MS = 8000;
/** A request that cannot be answered, reported to the panel as a code plus detail. */
class RouteFailure extends Error {
    code;
    detail;
    constructor(code, detail) {
        super(detail === undefined ? code : `${code}: ${detail}`);
        this.code = code;
        this.detail = detail;
        this.name = 'RouteFailure';
    }
}
/** Turn any thrown value into the shape a failing route returns. */
function failureOf(error) {
    if (error instanceof RouteFailure) {
        return error.detail === undefined
            ? { ok: false, error: error.code }
            : { ok: false, error: error.code, detail: error.detail };
    }
    console.error('gradle-tasks: unexpected failure while answering a route', error);
    return { ok: false, error: 'scan-failed', detail: error instanceof Error ? error.message : String(error) };
}
/** Filesystem face handed to the pure Gradle rules. */
const projectIo = {
    isFile: (path) => {
        try {
            return statSync(path).isFile();
        }
        catch {
            // A missing probe target is the ordinary "this script is absent" answer.
            return false;
        }
    },
    readText: (path) => {
        try {
            return readFileSync(path, 'utf8');
        }
        catch (error) {
            // An unreadable wrapper descriptor only costs the version line in the panel.
            console.warn(`gradle-tasks: cannot read ${path}`, error);
            return undefined;
        }
    },
    listDirectory: (path) => {
        try {
            return readdirSync(path, { withFileTypes: true }).map(entry => ({
                name: entry.name,
                isDirectory: entry.isDirectory(),
            }));
        }
        catch (error) {
            // The walk prunes what it cannot enter and keeps the inputs it already has.
            console.warn(`gradle-tasks: cannot list ${path}`, error);
            return [];
        }
    },
};
/**
 * Mount the routes.
 * @param ctx - Host Context with the declared services.
 */
export function apply(ctx) {
    const host = ctx;
    const platform = cachedPlatform(host);
    const scratch = ensureScratchDirectory();
    const scriptPath = writeDumpScript(scratch);
    const terminals = new Map();
    ctx.effect(() => () => {
        for (const record of terminals.values()) {
            void record.handle.close().catch((error) => {
                console.warn(`gradle-tasks: cannot close terminal ${record.handle.id}`, error);
            });
        }
        terminals.clear();
    }, 'gradle-tasks: terminals');
    ctx.effect(() => host.webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/state`,
        handler: async (req, res) => {
            if (rejected(host, req, res))
                return;
            if (req.method !== 'GET') {
                sendMethodNotAllowed(res, 'GET');
                return;
            }
            try {
                const path = sessionDirectory(host, queryOf(req).get('sessionId'));
                const root = findProjectRoot(path, projectIo);
                const state = {
                    ok: true,
                    path,
                    project: root === null ? null : describeProject(root, projectIo),
                    jdks: scanJdks(),
                };
                sendJson(res, 200, state);
            }
            catch (error) {
                sendJson(res, 200, failureOf(error));
            }
        },
    }), 'gradle-tasks: GET /state');
    ctx.effect(() => host.webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/tasks`,
        handler: async (req, res) => {
            if (rejected(host, req, res))
                return;
            if (req.method !== 'GET') {
                sendMethodNotAllowed(res, 'GET');
                return;
            }
            try {
                const query = queryOf(req);
                const path = sessionDirectory(host, query.get('sessionId'));
                sendJson(res, 200, await listTasks({
                    host,
                    path,
                    platform: await platform(),
                    javaHome: checkedJavaHome(query.get('javaHome')),
                    offline: query.get('offline') === '1',
                    force: query.get('force') === '1',
                    scratch,
                    scriptPath,
                }));
            }
            catch (error) {
                sendJson(res, 200, failureOf(error));
            }
        },
    }), 'gradle-tasks: GET /tasks');
    ctx.effect(() => host.webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/run`,
        handler: async (req, res) => {
            if (rejected(host, req, res))
                return;
            if (req.method !== 'POST') {
                sendMethodNotAllowed(res, 'POST');
                return;
            }
            try {
                const body = await readJsonBody(req);
                const answer = await runTask({
                    host,
                    terminals,
                    sessionId: requiredString(body, 'sessionId'),
                    taskPath: requiredString(body, 'taskPath'),
                    javaHome: checkedJavaHome(stringField(body, 'javaHome')),
                    offline: body.offline === true,
                    openTerminalIds: stringList(body, 'openTerminalIds'),
                    platform: await platform(),
                });
                sendJson(res, 200, answer);
            }
            catch (error) {
                sendJson(res, 200, failureOf(error));
            }
        },
    }), 'gradle-tasks: POST /run');
}
/**
 * Create the scratch directory holding the initialization script.
 * @returns the directory path.
 */
function ensureScratchDirectory() {
    const directory = join(tmpdir(), 'dsh-gradle-tasks');
    mkdirSync(directory, { recursive: true });
    return directory;
}
/**
 * Write the initialization script once per plugin lifetime, keeping it free of
 * a byte-order mark. Gradle's Groovy parser rejects a leading U+FEFF, and
 * `writeFileSync` with an explicit utf8 encoding never adds one — which is why
 * the text is not written through a shell redirection.
 * @param directory - scratch directory.
 * @returns the script path.
 */
function writeDumpScript(directory) {
    const path = join(directory, 'dump-tasks.gradle');
    writeFileSync(path, TASK_DUMP_SCRIPT, 'utf8');
    return path;
}
/**
 * Memory of the execution platform, read once from the subprocess provider.
 * @param host - Host context carrying the provider.
 * @returns a loader resolving the cached platform.
 */
function cachedPlatform(host) {
    let pending;
    return () => {
        pending ??= host.subprocess.terminalEnvironment()
            .then(environment => environment.platform)
            .catch((error) => {
            // A failed probe is retried on the next request instead of pinning the
            // rejection for the life of the plugin.
            pending = undefined;
            throw error;
        });
        return pending;
    };
}
/**
 * Enumerate the JDKs the Host environment declares.
 *
 * A variable only counts once its directory really holds a `java` executable,
 * so a stale or mistyped entry never reaches the selector. The first surviving
 * candidate — by construction `JAVA_HOME` when it is usable — is the default.
 * @returns verified candidates, the default one first.
 */
function scanJdks() {
    const verified = collectJdkVariables(process.env)
        .filter(candidate => hasJavaExecutable(candidate.home, projectIo.isFile))
        .map((candidate) => {
        const release = projectIo.readText(join(candidate.home, 'release'));
        return {
            variable: candidate.variable,
            home: candidate.home,
            version: release === undefined ? null : readReleaseEntry(release, 'JAVA_VERSION'),
        };
    });
    return verified.map((candidate, index) => ({ ...candidate, isDefault: index === 0 }));
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
function sessionDirectory(host, sessionId) {
    const id = sessionId?.trim();
    if (id === undefined || id === '')
        throw new RouteFailure('no-session');
    const session = host.sessions.get(id);
    if (session === undefined)
        throw new RouteFailure('session-inactive', id);
    const directory = host.workingDirectory.get(session);
    if (!isDirectory(directory))
        throw new RouteFailure('directory-missing', directory);
    return directory;
}
/** Whether a path is absolute on the Host platform. */
function isAbsolutePath(path) {
    return /^(?:[a-zA-Z]:[\\/]|\\\\|\/)/.test(path);
}
/** Whether a path names an existing directory. */
function isDirectory(path) {
    try {
        return statSync(path).isDirectory();
    }
    catch {
        // Absent or unreadable paths are reported as "not a directory" by the caller.
        return false;
    }
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
async function resolveScript(host, project, platform) {
    const wrapper = wrapperScriptFor(project, platform);
    if (wrapper !== null)
        return join(project.rootDir, wrapper);
    if (project.wrapper !== null)
        throw new RouteFailure('wrapper-mismatch', `${project.wrapper} / ${platform}`);
    try {
        return await host.subprocess.resolveExecutable('gradle');
    }
    catch (error) {
        console.warn('gradle-tasks: no gradle executable on PATH', error);
        throw new RouteFailure('gradle-missing', project.rootDir);
    }
}
/**
 * Run Gradle with the initialization script and read back its task report.
 *
 * A cached list is returned when every configuration input still has the same
 * content and the platform and JDK are unchanged, because only then can the
 * previous scan be trusted to describe the same set of tasks.
 * @param input - the scan request.
 * @returns the grouped task report.
 */
async function listTasks(input) {
    const { host, path, platform, javaHome, offline, force, scratch, scriptPath } = input;
    const root = findProjectRoot(path, projectIo);
    if (root === null)
        throw new RouteFailure('not-gradle', path);
    const project = describeProject(root, projectIo);
    const fingerprint = fingerprintConfiguration(CACHE_VERSION, collectConfigurationInputs(project.rootDir, projectIo), [platform, javaHome ?? '', scriptPath, offline ? 'offline' : 'online']);
    if (!force) {
        const cached = readTaskCache(project.rootDir);
        if (cached !== null && cached.fingerprint === fingerprint) {
            return {
                ok: true,
                project,
                groups: cached.groups,
                durationMs: cached.durationMs,
                output: '',
                cached: true,
                scannedAt: cached.scannedAt,
            };
        }
    }
    const started = Date.now();
    const script = await resolveScript(host, project, platform);
    const reportPath = join(scratch, `tasks-${randomUUID()}.txt`);
    const argv = gradleArgv({ path: script }, [
        '--quiet', '--console=plain',
        ...offline ? ['--offline'] : [],
        '-p', project.rootDir,
        '--init-script', scriptPath,
        `-PdshGradleTasksOut=${reportPath}`,
        'help',
    ], platform);
    const outcome = await collect(host, {
        argv,
        cwd: project.rootDir,
        env: javaEnvironment(javaHome),
        timeoutMs: LIST_TIMEOUT_MS,
    });
    const durationMs = Date.now() - started;
    if (outcome.timedOut)
        throw new RouteFailure('scan-timeout', tailOf(outcome.output, OUTPUT_TAIL_CHARS));
    const report = takeReport(reportPath);
    if (report === null) {
        const code = outcome.code === 0 ? 'no-report' : 'scan-failed';
        throw new RouteFailure(code, `${String(outcome.code ?? '?')}\n${tailOf(outcome.output, OUTPUT_TAIL_CHARS)}`);
    }
    const groups = groupTasks(parseTaskDump(report));
    const scannedAt = Date.now();
    writeTaskCache(project.rootDir, { version: CACHE_VERSION, fingerprint, javaHome, groups, scannedAt, durationMs });
    return {
        ok: true,
        project,
        groups,
        durationMs,
        output: tailOf(outcome.output, OUTPUT_TAIL_CHARS),
        cached: false,
        scannedAt,
    };
}
/** Read the task report and remove the temporary file Gradle wrote. */
function takeReport(path) {
    try {
        return readFileSync(path, 'utf8');
    }
    catch (error) {
        console.warn(`gradle-tasks: no task report at ${path}`, error);
        return null;
    }
    finally {
        rmSync(path, { force: true });
    }
}
/**
 * Run one Gradle invocation to completion, collecting its output.
 * @param host - Host context carrying the subprocess provider.
 * @param spec - argv, directory, environment, and the overall time budget.
 * @returns the exit code, the combined output, and whether the budget expired.
 */
function collect(host, spec) {
    return new Promise((resolve, reject) => {
        let handle;
        try {
            handle = host.subprocess.spawn({
                argv: spec.argv,
                cwd: spec.cwd,
                stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
                graceMs: TERMINATE_GRACE_MS,
                env: { ...spec.env },
            });
        }
        catch (error) {
            reject(error);
            return;
        }
        const chunks = [];
        const sink = (stream) => {
            stream?.setEncoding('utf8');
            stream?.on('data', (text) => { chunks.push(text); });
        };
        sink(handle.stdout);
        sink(handle.stderr);
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            handle.terminate();
        }, spec.timeoutMs);
        timer.unref();
        handle.done.then((outcome) => {
            clearTimeout(timer);
            resolve({ code: outcome.exitCode, output: chunks.join(''), timedOut });
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
/**
 * Type one Gradle task into the Session's terminal.
 *
 * The terminal is reused while this plugin still holds its handle, the person
 * has not taken it over, and a tab for it is open; otherwise a new one is
 * opened, which the Sidebar then shows as its own tab.
 * @param input - the run request.
 * @returns the terminal the command went to.
 */
async function runTask(input) {
    const { host, terminals, sessionId, taskPath, javaHome, offline, openTerminalIds, platform } = input;
    if (!isTaskPath(taskPath))
        throw new RouteFailure('task-missing', taskPath);
    const directory = sessionDirectory(host, sessionId);
    const root = findProjectRoot(directory, projectIo);
    if (root === null)
        throw new RouteFailure('not-gradle', directory);
    const project = describeProject(root, projectIo);
    const script = await resolveScript(host, project, platform);
    const args = [taskPath, '--console=plain', ...offline ? ['--offline'] : []];
    const command = shellCommandLine(script, args, platform);
    const agent = host.agents.get(sessionId);
    if (agent === undefined)
        throw new RouteFailure('session-inactive', sessionId);
    const session = host.sessions.get(sessionId);
    if (session === undefined)
        throw new RouteFailure('session-inactive', sessionId);
    const reusable = reusableTerminal(terminals.get(sessionId), openTerminalIds);
    const terminal = reusable ?? await openTerminal(host, {
        agent,
        session,
        sessionId,
        cwd: project.rootDir,
        env: javaEnvironment(javaHome),
    });
    terminals.set(sessionId, { sessionId, handle: terminal });
    await awaitShell(terminal);
    await terminal.write(`${command}\r`);
    return {
        ok: true,
        terminalId: terminal.id,
        terminalTitle: terminal.info.title,
        command,
        taskPath,
    };
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
async function awaitShell(terminal) {
    const deadline = Date.now() + SHELL_READY_TIMEOUT_MS;
    while (terminal.revision === 0) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
            console.warn(`gradle-tasks: terminal ${terminal.id} produced no output within ${SHELL_READY_TIMEOUT_MS}ms`);
            return;
        }
        try {
            await terminal.changed(terminal.revision, AbortSignal.timeout(remaining));
        }
        catch (error) {
            console.warn(`gradle-tasks: terminal ${terminal.id} stayed silent; typing the command anyway`, error);
            return;
        }
    }
    await terminal.drain();
}
/**
 * The terminal a run may continue in.
 * @param record - the terminal this plugin last opened for the Session.
 * @param openTerminalIds - terminals the asking window currently shows as tabs.
 * @returns that terminal, or undefined when a new one is needed.
 */
function reusableTerminal(record, openTerminalIds) {
    if (record === undefined)
        return undefined;
    const { handle } = record;
    if (handle.info.state !== 'running')
        return undefined;
    // A terminal the person typed into belongs to them; typing into it would
    // hijack their session, so the next run gets a terminal of its own.
    if (handle.info.control !== 'agent')
        return undefined;
    if (!openTerminalIds.includes(handle.id))
        return undefined;
    return handle;
}
/**
 * Open a new Session terminal for builds.
 * @param host - Host context with the terminal controller and sandbox policy.
 * @param request - the owning Agent and Session, the build directory, and the environment.
 * @returns the committed terminal.
 */
async function openTerminal(host, request) {
    const title = terminalTitleOf(request.cwd);
    try {
        return await host.terminalController.openForAgent(request.agent, {
            title,
            cwd: request.cwd,
            cols: TERMINAL_COLS,
            rows: TERMINAL_ROWS,
            policy: host.sandboxPolicy.resolve({ session: request.session }),
            preferredShells: [],
            env: request.env,
        }, AbortSignal.timeout(30_000));
    }
    catch (error) {
        console.error(`gradle-tasks: cannot open a terminal for ${request.sessionId}`, error);
        throw new RouteFailure('terminal-failed', error instanceof Error ? error.message : String(error));
    }
}
/** The tab title for a build terminal: the project directory's name. */
function terminalTitleOf(rootDir) {
    const name = rootDir.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? rootDir;
    return `Gradle · ${name}`.slice(0, 120);
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
function javaEnvironment(javaHome) {
    if (javaHome === null || javaHome === '')
        return {};
    const inherited = process.env.PATH ?? '';
    const bin = join(javaHome, 'bin');
    return { JAVA_HOME: javaHome, PATH: inherited === '' ? bin : `${bin}${delimiter}${inherited}` };
}
/**
 * Vet a request the same way the shipped Host routes do, so a foreign origin
 * or a missing browser cookie cannot drive a build.
 * @returns true when the request was already answered with the rejection.
 */
function rejected(host, req, res) {
    const rejection = host.connection.requestRejection(req);
    if (rejection === undefined)
        return false;
    res.statusCode = rejection;
    res.end();
    return true;
}
/**
 * Write one JSON answer with the plugin's cache policy.
 *
 * A scan can outlive the browser request that asked for it, so the response
 * may already be destroyed by the time the answer exists; writing then would
 * surface as a stream error on a socket nobody is reading.
 */
function sendJson(res, status, payload) {
    if (res.destroyed || res.writableEnded)
        return;
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'content-length': Buffer.byteLength(body),
    });
    res.end(body);
}
/** Answer a route called with the wrong method. */
function sendMethodNotAllowed(res, allowed) {
    res.writeHead(405, { allow: allowed, 'content-type': 'text/plain; charset=utf-8' });
    res.end(`method not allowed: use ${allowed}`);
}
/** Read the request's query parameters. */
function queryOf(req) {
    return new URL(req.url ?? '/', 'http://localhost').searchParams;
}
/**
 * Read a bounded JSON request body.
 * @param req - the request.
 * @returns the parsed object.
 */
async function readJsonBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
        size += buffer.byteLength;
        if (size > MAX_BODY_BYTES)
            throw new RouteFailure('body-too-large', String(size));
        chunks.push(buffer);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    if (text.trim() === '')
        return {};
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch (error) {
        console.warn('gradle-tasks: request body is not JSON', error);
        throw new RouteFailure('body-invalid', text.slice(0, 200));
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new RouteFailure('body-invalid', text.slice(0, 200));
    }
    return parsed;
}
/** Read an optional string field. */
function stringField(body, key) {
    const value = body[key];
    return typeof value === 'string' ? value : null;
}
/** Read a required, non-empty string field. */
function requiredString(body, key) {
    const value = stringField(body, key)?.trim();
    if (value === undefined || value === '')
        throw new RouteFailure('field-missing', key);
    return value;
}
/** Read a list of strings, ignoring anything else the body carries. */
function stringList(body, key) {
    const value = body[key];
    if (!Array.isArray(value))
        return [];
    return value.filter((item) => typeof item === 'string');
}
/**
 * Read the JDK choice, rejecting a directory that does not exist so a typo
 * cannot silently fall back to the inherited JDK.
 * @param value - a directory from the request body or query, or null.
 * @returns the validated directory, or null to inherit the environment.
 */
function checkedJavaHome(value) {
    const home = value?.trim();
    if (home === undefined || home === '')
        return null;
    if (!isAbsolutePath(home))
        throw new RouteFailure('java-invalid', home);
    if (!hasJavaExecutable(home, projectIo.isFile))
        throw new RouteFailure('java-invalid', home);
    return home;
}
