/**
 * Gradle project detection and task-report parsing.
 *
 * Everything here is pure: filesystem access arrives through the small
 * {@link ProjectIo} facade so the parsing and grouping rules can be exercised
 * without a real build, and so the Host can feed the same logic from any
 * execution world.
 */
import { dirname, isAbsolute, join, relative, sep } from 'node:path';
/** Build script file names Gradle accepts at a project root, in discovery order. */
export const BUILD_SCRIPTS = ['build.gradle.kts', 'build.gradle'];
/** Settings script file names Gradle accepts at a build root, in discovery order. */
export const SETTINGS_SCRIPTS = ['settings.gradle.kts', 'settings.gradle'];
/** Wrapper scripts, in the order a root directory is probed for them. */
export const WRAPPER_SCRIPTS = ['gradlew.bat', 'gradlew'];
/** Path of the wrapper descriptor inside a project root, relative to it. */
export const WRAPPER_PROPERTIES = join('gradle', 'wrapper', 'gradle-wrapper.properties');
/**
 * The initialization script that reports every configured task.
 *
 * It runs after the build is configured, so it sees tasks registered by
 * plugins and by settings scripts alike, and writes one tab-separated row per
 * task. Group and description have their tabs and newlines flattened: they
 * are free text, and one stray separator would otherwise split the row.
 */
export const TASK_DUMP_SCRIPT = `// Written by dsh-gradle-tasks: report every configured task once the build is configured.
gradle.projectsEvaluated {
    def outPath = gradle.startParameter.projectProperties['dshGradleTasksOut']
    if (outPath == null) return
    def esc = { s -> s == null ? '' : s.replace('\\t', ' ').replace('\\r', ' ').replace('\\n', ' ') }
    def sb = new StringBuilder()
    gradle.rootProject.allprojects.each { p ->
        p.tasks.each { t ->
            sb.append(t.path).append('\\t').append(esc(t.group ?: '')).append('\\t').append(esc(t.description ?: '')).append('\\n')
        }
    }
    new File(outPath).setText(sb.toString(), 'UTF-8')
}
`;
/** How many parent directories a search climbs before giving up. */
const MAX_ROOT_CLIMB = 12;
/** Failures worth reporting with the exact path that caused them. */
export class GradlePathError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GradlePathError';
    }
}
/** Whether a path is absolute and therefore usable as a build directory. */
export function requireAbsolute(path) {
    if (!isAbsolute(path))
        throw new GradlePathError(`build directory must be absolute, received ${JSON.stringify(path)}`);
    return path;
}
/**
 * Find the root directory of the Gradle build that owns `startDir`.
 *
 * The search climbs from `startDir` to its ancestors, because a directory
 * inside a build (`src/main/java`, `app/`) is the common way to open one. A
 * settings script wins over a build script at the same level; a directory
 * holding only a build script is a standalone project and its own root.
 * @param startDir - absolute directory to inspect.
 * @param io - filesystem facts.
 * @returns the owning root, or null when no ancestor holds Gradle scripts.
 */
export function findProjectRoot(startDir, io) {
    let current = startDir;
    for (let depth = 0; depth <= MAX_ROOT_CLIMB; depth += 1) {
        const hasBuild = BUILD_SCRIPTS.some(name => io.isFile(join(current, name)));
        const hasSettings = SETTINGS_SCRIPTS.some(name => io.isFile(join(current, name)));
        if (hasBuild || hasSettings)
            return current;
        const parent = dirname(current);
        if (parent === current)
            return null;
        current = parent;
    }
    return null;
}
/**
 * Collect the scripts and wrapper that identify `rootDir` as a Gradle build.
 * @param rootDir - directory returned by {@link findProjectRoot}.
 * @param io - filesystem facts.
 * @returns the project description; `buildFiles` is empty for a settings-only root.
 */
export function describeProject(rootDir, io) {
    const buildFiles = [...SETTINGS_SCRIPTS, ...BUILD_SCRIPTS].filter(name => io.isFile(join(rootDir, name)));
    const wrapper = WRAPPER_SCRIPTS.find(name => io.isFile(join(rootDir, name))) ?? null;
    const properties = wrapper === null ? undefined : io.readText?.(join(rootDir, WRAPPER_PROPERTIES));
    return {
        rootDir,
        buildFiles,
        wrapper,
        wrapperDistribution: properties === undefined ? null : parseDistributionUrl(properties),
    };
}
/**
 * Read `distributionUrl` from a Gradle wrapper properties file.
 * @param properties - raw file content.
 * @returns the declared distribution URL, or null when the file declares none.
 */
export function parseDistributionUrl(properties) {
    for (const line of properties.split(/\r?\n/)) {
        const match = /^\s*distributionUrl\s*=\s*(.+?)\s*$/.exec(line);
        if (match !== null && match[1] !== undefined && match[1] !== '')
            return match[1];
    }
    return null;
}
/**
 * Parse the task report an initialization script writes.
 *
 * The script emits one line per task: the fully qualified task path, the
 * declared group, and the declared description, separated by tabs. Only the
 * first two separators are structural, so a description may itself contain a
 * tab without breaking the parse.
 * @param text - raw report content.
 * @returns every task in report order, with tabs and newlines flattened.
 */
export function parseTaskDump(text) {
    const tasks = [];
    for (const raw of text.split(/\r?\n/)) {
        if (raw === '')
            continue;
        const first = raw.indexOf('\t');
        if (first < 0)
            continue;
        const second = raw.indexOf('\t', first + 1);
        if (second < 0)
            continue;
        const path = raw.slice(0, first).trim();
        if (path.length < 2 || !path.startsWith(':'))
            continue;
        const group = raw.slice(first + 1, second).trim();
        const description = raw.slice(second + 1).trim();
        tasks.push({ path, project: projectPathOf(path), group, description });
    }
    return tasks;
}
/**
 * The Gradle project path a task path belongs to: `:app:build` is `:app`, while
 * a root task such as `:build` belongs to the root project `:`.
 * @param taskPath - fully qualified task path.
 * @returns the owning project path.
 */
export function projectPathOf(taskPath) {
    const index = taskPath.lastIndexOf(':');
    return index <= 0 ? ':' : taskPath.slice(0, index);
}
/**
 * Bucket tasks by their declared group and order both levels for display.
 *
 * Groups sort case-insensitively by name; the bucket for tasks that declared
 * no group sorts last. Inside a group, tasks sort by description so the
 * folders read as a catalogue, with described tasks first, undescribed tasks
 * after them, and the task path as the final tiebreaker.
 * @param tasks - parsed tasks, in any order.
 * @returns the display groups.
 */
export function groupTasks(tasks) {
    const buckets = new Map();
    for (const task of tasks) {
        const bucket = buckets.get(task.group);
        if (bucket === undefined)
            buckets.set(task.group, [task]);
        else
            bucket.push(task);
    }
    const groups = [...buckets.entries()]
        .map(([group, members]) => ({ group, tasks: sortTasks(members) }));
    groups.sort((left, right) => {
        if (left.group === '')
            return 1;
        if (right.group === '')
            return -1;
        return compareText(left.group, right.group);
    });
    return groups;
}
/** Order one group's tasks by description, then by path. */
function sortTasks(tasks) {
    return [...tasks].sort((left, right) => {
        if (left.description === '' && right.description !== '')
            return 1;
        if (right.description === '' && left.description !== '')
            return -1;
        return compareText(left.description, right.description) || compareText(left.path, right.path);
    });
}
/** Case-insensitive comparison with a stable code-unit fallback. */
function compareText(left, right) {
    const folded = left.toLowerCase().localeCompare(right.toLowerCase());
    return folded !== 0 ? folded : left.localeCompare(right);
}
/**
 * The wrapper script a project root ships for the given platform.
 * @param project - detected project.
 * @param platform - execution platform of the Host's subprocess provider.
 * @returns the wrapper file name, or null when the project ships none.
 */
export function wrapperScriptFor(project, platform) {
    if (project.wrapper === null)
        return null;
    if (platform === 'windows' && project.wrapper === 'gradlew.bat')
        return project.wrapper;
    if (platform === 'posix' && project.wrapper === 'gradlew')
        return project.wrapper;
    return null;
}
/**
 * Quote one argument for a PowerShell command line.
 *
 * PowerShell reads single quotes literally, so an embedded quote is escaped by
 * doubling it, and everything else — spaces, `$`, backticks — arrives verbatim.
 * @param value - the argument.
 * @returns the quoted argument.
 */
export function quotePowerShell(value) {
    return `'${value.replaceAll("'", "''")}'`;
}
/**
 * The argv that runs a command through PowerShell.
 *
 * On Windows a Gradle wrapper is `gradlew.bat`, a batch file the process
 * seam cannot execute directly, so the invocation is handed to PowerShell,
 * which both starts `.bat` files and quotes paths containing spaces.
 * @param script - wrapper path or executable name.
 * @param args - the Gradle arguments.
 * @returns the full argv, PowerShell first.
 */
export function powerShellArgv(script, args) {
    const command = ['&', quotePowerShell(script), ...args.map(quotePowerShell)].join(' ');
    return ['powershell.exe', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command];
}
/**
 * Build the argv that invokes Gradle for one directory.
 * @param script - wrapper path, or `gradle` when the project ships no wrapper.
 * @param args - the Gradle arguments.
 * @param platform - execution platform of the Host's subprocess provider.
 * @returns the argv to hand to the subprocess provider.
 */
export function gradleArgv(script, args, platform) {
    if (platform === 'windows' && script.fromWrapper)
        return powerShellArgv(script.path, args);
    return [script.path, ...args];
}
/**
 * Keep the trailing part of a log, so a failure message stays readable.
 * @param text - full log.
 * @param limit - maximum number of characters to keep.
 * @returns the tail, prefixed with a marker when content was dropped.
 */
export function tailOf(text, limit) {
    if (text.length <= limit)
        return text;
    return `… ${text.length - limit} earlier characters omitted …\n${text.slice(text.length - limit)}`;
}
/**
 * Render a path for display relative to a root, using forward slashes.
 * @param root - base directory.
 * @param path - absolute path inside the root.
 * @returns the relative path, or the absolute one when it escapes the root.
 */
export function displayRelative(root, path) {
    const relativePath = relative(root, path);
    if (relativePath === '' || relativePath.startsWith('..'))
        return path;
    return relativePath.split(sep).join('/');
}
