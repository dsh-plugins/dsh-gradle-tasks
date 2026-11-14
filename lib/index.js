/**
 * Host half of dsh-gradle-tasks.
 *
 * The panel asks three questions and this half answers them over the plugin's
 * own HTTP routes: which Gradle project does this Session live in, which tasks
 * does it declare, and which JDKs does this machine have. Running a task is
 * the fourth: one spawned Gradle process whose output streams back to the
 * panel until the build ends.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { describeProject, findProjectRoot, gradleArgv, groupTasks, parseTaskDump, TASK_DUMP_SCRIPT, requireAbsolute, tailOf, wrapperScriptFor, } from "./gradle.js";
import { collectJdkVariables, hasJavaExecutable, markDefault, readReleaseEntry } from "./jdk.js";
import { RunRegistry } from "./runs.js";
import { ROUTE_BASE, } from "./shared/protocol.js";
export const name = 'dsh-gradle-tasks';
/** Host services this plugin reads: routes, peer vetting, processes, and Session directories. */
export const inject = ['webServer', 'connection', 'subprocess', 'sessions', 'workingDirectory'];
/** Longest task listing before the Gradle configuration is considered stuck. */
const LIST_TIMEOUT_MS = 15 * 60 * 1000;
/** Largest request body any route accepts. */
const MAX_BODY_BYTES = 16 * 1024;
/** Characters of Gradle output returned with a task listing. */
const OUTPUT_TAIL_CHARS = 8000;
/** Grace period handed to the process seam when a build is terminated. */
const TERMINATE_GRACE_MS = 5000;
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
};
/**
 * Mount the routes and the run registry.
 * @param ctx - Host Context with the declared services.
 */
export function apply(ctx) {
    const host = ctx;
    const runs = new RunRegistry(host.subprocess);
    ctx.effect(() => () => { runs.dispose(); }, 'gradle-tasks: runs');
    const platform = cachedPlatform(host);
    const workspace = ensureScratchDirectory();
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
                const query = queryOf(req);
                const path = resolveDirectory(host, query.get('sessionId'), query.get('path'));
                const root = findProjectRoot(path, projectIo);
                const project = root === null ? null : describeProject(root, projectIo);
                const jdks = scanJdks();
                const state = {
                    ok: true,
                    path,
                    project,
                    jdks,
                    platform: await platform(),
                };
                sendJson(res, 200, state);
            }
            catch (error) {
                sendJson(res, 200, {
                    ok: false, path: '', project: null, jdks: [], platform: 'posix',
                    error: messageOf(error),
                });
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
                const path = resolveDirectory(host, query.get('sessionId'), query.get('path'));
                const response = await listTasks(host, path, await platform(), query.get('javaHome'), workspace);
                sendJson(res, 200, response);
            }
            catch (error) {
                const failure = {
                    ok: false, project: null, groups: [], durationMs: 0,
                    error: messageOf(error), output: '',
                };
                sendJson(res, 200, failure);
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
            const started = Date.now();
            try {
                const body = await readJsonBody(req);
                const path = resolveDirectory(host, stringField(body, 'sessionId'), stringField(body, 'path'));
                const taskPath = requiredString(body, 'taskPath');
                const javaHome = optionalJavaHome(body);
                const response = await startRun(host, runs, path, taskPath, javaHome, await platform());
                sendJson(res, 200, { ...response, durationMs: Date.now() - started });
            }
            catch (error) {
                sendJson(res, 200, { ok: false, error: messageOf(error) });
            }
        },
    }), 'gradle-tasks: POST /run');
    ctx.effect(() => host.webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/run/stream`,
        handler: (req, res) => {
            if (rejected(host, req, res))
                return;
            if (req.method !== 'GET') {
                sendMethodNotAllowed(res, 'GET');
                return;
            }
            const id = queryOf(req).get('id') ?? '';
            const description = runs.describe(id);
            if (description === undefined) {
                sendJson(res, 404, { ok: false, error: 'run not found' });
                return;
            }
            res.writeHead(200, {
                'content-type': 'application/x-ndjson; charset=utf-8',
                'cache-control': 'no-store',
                'x-accel-buffering': 'no',
            });
            let closed = false;
            const detach = runs.subscribe(id, (event) => {
                if (closed)
                    return;
                res.write(`${JSON.stringify(event)}\n`);
            });
            if (detach === undefined) {
                res.end();
                return;
            }
            res.on('close', () => {
                closed = true;
                detach();
            });
        },
    }), 'gradle-tasks: GET /run/stream');
    ctx.effect(() => host.webServer.register({
        kind: 'exact',
        path: `${ROUTE_BASE}/run/stop`,
        handler: async (req, res) => {
            if (rejected(host, req, res))
                return;
            if (req.method !== 'POST') {
                sendMethodNotAllowed(res, 'POST');
                return;
            }
            try {
                const body = await readJsonBody(req);
                const stopped = runs.stop(requiredString(body, 'runId'));
                sendJson(res, 200, { ok: stopped });
            }
            catch (error) {
                sendJson(res, 200, { ok: false, error: messageOf(error) });
            }
        },
    }), 'gradle-tasks: POST /run/stop');
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
 * Write the initialization script, keeping it free of a byte-order mark.
 * Gradle's Groovy parser rejects a leading U+FEFF, and `writeFileSync` with an
 * explicit utf8 encoding never adds one — which is why the text is not written
 * through a shell redirection.
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
        pending ??= host.subprocess.terminalEnvironment().then(environment => environment.platform);
        return pending;
    };
}
/**
 * Enumerate the JDKs the Host environment declares.
 * @returns verified candidates, the default one first.
 */
function scanJdks() {
    const verified = collectJdkVariables(process.env)
        .filter(candidate => hasJavaExecutable(candidate.home, projectIo.isFile))
        .map((candidate) => {
        const release = projectIo.readText?.(join(candidate.home, 'release'));
        return {
            variable: candidate.variable,
            home: candidate.home,
            version: release === undefined ? null : readReleaseEntry(release, 'JAVA_VERSION'),
        };
    });
    return markDefault(verified);
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
function resolveDirectory(host, sessionId, path) {
    const explicit = path?.trim();
    if (explicit !== undefined && explicit !== '') {
        requireAbsolute(explicit);
        if (!isDirectory(explicit))
            throw new Error(`目录不存在：${explicit}`);
        return explicit;
    }
    const id = sessionId?.trim();
    if (id === undefined || id === '')
        throw new Error('当前没有选中的会话，请先选择项目目录');
    const session = host.sessions.get(id);
    if (session === undefined)
        throw new Error('当前会话尚未激活，请先选择项目目录');
    const directory = host.workingDirectory.get(session);
    if (!isDirectory(directory))
        throw new Error(`会话目录不存在：${directory}`);
    return directory;
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
 * @returns the command to run.
 */
async function resolveScript(host, project, platform) {
    const wrapper = wrapperScriptFor(project, platform);
    if (wrapper !== null)
        return { path: join(project.rootDir, wrapper), fromWrapper: true };
    if (project.wrapper !== null) {
        throw new Error(`项目只有 ${project.wrapper}，与当前执行平台（${platform}）不匹配`);
    }
    let resolved;
    try {
        resolved = await host.subprocess.resolveExecutable('gradle');
    }
    catch {
        throw new Error(`${project.rootDir} 没有 gradle wrapper，PATH 中也找不到 gradle 可执行文件`);
    }
    return { path: resolved, fromWrapper: false };
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
async function listTasks(host, path, platform, javaHome, scratch) {
    const started = Date.now();
    const root = findProjectRoot(path, projectIo);
    if (root === null) {
        return {
            ok: false, project: null, groups: [], durationMs: 0,
            error: '当前目录不是 Gradle 项目（未找到 settings.gradle[.kts] 或 build.gradle[.kts]）', output: '',
        };
    }
    const project = describeProject(root, projectIo);
    const script = await resolveScript(host, project, platform);
    const reportPath = join(scratch, `tasks-${randomUUID()}.txt`);
    const args = [
        '--quiet', '--console=plain',
        '-p', project.rootDir,
        '--init-script', writeDumpScript(scratch),
        `-PdshGradleTasksOut=${reportPath}`,
        'help',
    ];
    const argv = gradleArgv(script, args, platform);
    const outcome = await collect(host, {
        argv,
        cwd: project.rootDir,
        env: javaEnvironment(javaHome),
        timeoutMs: LIST_TIMEOUT_MS,
    });
    const report = readReport(reportPath);
    const tasks = report === null ? [] : parseTaskDump(report);
    const durationMs = Date.now() - started;
    if (report === null && outcome.code !== 0) {
        return {
            ok: false, project, groups: [], durationMs,
            error: `Gradle 执行失败（退出码 ${outcome.code ?? '未知'}）`,
            output: tailOf(outcome.output, OUTPUT_TAIL_CHARS),
        };
    }
    if (report === null) {
        return {
            ok: false, project, groups: [], durationMs,
            error: 'Gradle 未产出任务清单',
            output: tailOf(outcome.output, OUTPUT_TAIL_CHARS),
        };
    }
    return {
        ok: true, project, groups: groupTasks(tasks), durationMs,
        output: tailOf(outcome.output, OUTPUT_TAIL_CHARS),
    };
}
/** Read the task report, or null when Gradle never wrote one. */
function readReport(path) {
    try {
        return readFileSync(path, 'utf8');
    }
    catch (error) {
        console.warn(`gradle-tasks: no task report at ${path}`, error);
        return null;
    }
}
/**
 * Run one Gradle invocation to completion, collecting its output.
 * @param host - Host context carrying the subprocess provider.
 * @param spec - argv, directory, environment, and the overall time budget.
 * @returns the exit code and the combined output.
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
        const timer = setTimeout(() => {
            handle.terminate();
        }, spec.timeoutMs);
        timer.unref();
        handle.done.then((outcome) => {
            clearTimeout(timer);
            resolve({ code: outcome.exitCode, output: chunks.join('') });
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
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
async function startRun(host, runs, path, taskPath, javaHome, platform) {
    const root = findProjectRoot(path, projectIo);
    if (root === null)
        throw new Error('当前目录不是 Gradle 项目');
    const project = describeProject(root, projectIo);
    const script = await resolveScript(host, project, platform);
    const args = [taskPath, '--console=plain'];
    const argv = gradleArgv(script, args, platform);
    const runId = runs.start({
        argv,
        cwd: project.rootDir,
        env: javaEnvironment(javaHome),
        displayCommand: [script.path, ...args].join(' '),
        graceMs: TERMINATE_GRACE_MS,
    });
    return { ok: true, runId, command: [script.path, ...args].join(' ') };
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
/** Write one JSON answer with the plugin's cache policy. */
function sendJson(res, status, payload) {
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
            throw new Error('请求体过大');
        chunks.push(buffer);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    if (text.trim() === '')
        return {};
    const parsed = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error('请求体必须是 JSON 对象');
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
        throw new Error(`缺少字段 ${key}`);
    return value;
}
/**
 * Read the JDK choice, rejecting a directory that does not exist so a typo
 * cannot silently fall back to the inherited JDK.
 */
function optionalJavaHome(body) {
    const value = stringField(body, 'javaHome')?.trim();
    if (value === undefined || value === '')
        return null;
    requireAbsolute(value);
    if (!hasJavaExecutable(value, projectIo.isFile))
        throw new Error(`不是可用的 JDK 目录：${value}`);
    return value;
}
/** The message of a thrown value, for a route answer. */
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
