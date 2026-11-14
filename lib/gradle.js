/**
 * Gradle project detection and task-report parsing.
 *
 * Everything here is pure: filesystem access arrives through the small
 * {@link ProjectIo} facade so the parsing and grouping rules can be exercised
 * without a real build, and so the Host can feed the same logic from any
 * execution world.
 */
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, join } from 'node:path';
/** Build script file names Gradle accepts at a project root, in discovery order. */
const BUILD_SCRIPTS = ['build.gradle.kts', 'build.gradle'];
/** Settings script file names Gradle accepts at a build root, in discovery order. */
const SETTINGS_SCRIPTS = ['settings.gradle.kts', 'settings.gradle'];
/** Wrapper scripts, in the order a root directory is probed for them. */
const WRAPPER_SCRIPTS = ['gradlew.bat', 'gradlew'];
/** Path of the wrapper descriptor inside a project root, relative to it. */
const WRAPPER_PROPERTIES = join('gradle', 'wrapper', 'gradle-wrapper.properties');
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
    const properties = wrapper === null ? undefined : io.readText(join(rootDir, WRAPPER_PROPERTIES));
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
function parseDistributionUrl(properties) {
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
 * Whether a command is a batch script the process seam cannot execute
 * directly. Gradle ships `gradlew.bat` and, on Windows, `gradle.bat`, and
 * `node:child_process` starts neither without a command interpreter.
 * @param path - executable name or path.
 * @returns true for `.bat` and `.cmd`.
 */
function isBatchScript(path) {
    return /\.(?:bat|cmd)$/i.test(path);
}
/**
 * The argv that runs a command through PowerShell.
 *
 * PowerShell both starts batch scripts and quotes paths containing spaces, so
 * every Windows Gradle invocation — wrapper or `PATH` executable — goes
 * through it with single-quoted literals.
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
    if (platform === 'windows' && isBatchScript(script.path))
        return powerShellArgv(script.path, args);
    return [script.path, ...args];
}
/**
 * The task path an invocation may name: an optional Gradle project prefix
 * followed by the task name.
 *
 * The value reaches a command line, so anything outside this alphabet — above
 * all a leading `-`, which Gradle would read as an option such as
 * `--init-script` — is rejected before a process starts.
 * @param taskPath - candidate task path.
 * @returns true for a plain task path such as `build` or `:app:test`.
 */
export function isTaskPath(taskPath) {
    return /^:?[\w.-]+(?::[\w.-]+)*$/.test(taskPath);
}
/** Directory names the configuration walk never enters. */
const PRUNED_DIRECTORIES = new Set([
    'build', 'out', 'target', 'bin', 'obj', 'node_modules', 'vendor',
    '.git', '.gradle', '.idea', '.vscode', '.settings',
]);
/**
 * File names that change what a configuration phase produces, wherever they
 * appear: every subproject's scripts, the settings scripts, the properties
 * files Gradle reads, and the version catalogue.
 */
const CONFIGURATION_FILES = new Set([
    'build.gradle', 'build.gradle.kts',
    'settings.gradle', 'settings.gradle.kts',
    'gradle.properties', 'gradle-wrapper.properties',
    'libs.versions.toml',
]);
/** How deep the configuration walk descends below the build root. */
const MAX_INPUT_DEPTH = 8;
/** How many configuration files one fingerprint reads. */
const MAX_INPUT_FILES = 2000;
/**
 * Collect every file whose content can change the tasks a build declares.
 *
 * The walk covers the whole build tree because subproject scripts and settings
 * plugins shape the configuration as much as the root script does. Build
 * outputs and editor state are pruned, since they change constantly and never
 * affect which tasks exist. Order follows the directory listing; the
 * fingerprint canonicalizes it.
 * @param rootDir - build root returned by {@link findProjectRoot}.
 * @param io - filesystem facts.
 * @returns the inputs, one digest per accepted file.
 */
export function collectConfigurationInputs(rootDir, io) {
    const inputs = [];
    const walk = (directory, depth, prefix) => {
        if (depth > MAX_INPUT_DEPTH)
            return;
        for (const entry of io.listDirectory(directory)) {
            const path = join(directory, entry.name);
            if (entry.isDirectory) {
                if (!PRUNED_DIRECTORIES.has(entry.name))
                    walk(path, depth + 1, `${prefix}${entry.name}/`);
                continue;
            }
            if (!CONFIGURATION_FILES.has(entry.name))
                continue;
            if (inputs.length >= MAX_INPUT_FILES) {
                console.warn(`gradle-tasks: ${rootDir} has more than ${MAX_INPUT_FILES} configuration files; the cache may miss changes below ${prefix}`);
                return;
            }
            const text = io.readText(path);
            if (text === undefined)
                continue;
            inputs.push({ path: `${prefix}${entry.name}`, digest: createHash('sha1').update(text).digest('hex') });
        }
    };
    walk(rootDir, 0, '');
    return inputs;
}
/**
 * The identity of one configuration: a digest over every input plus the
 * conditions outside the tree that also change what Gradle configures.
 *
 * Both the platform and the JDK belong in it: the same scripts can register
 * different tasks per operating system and toolchain, so a cached list is only
 * valid for the combination it was produced under. Inputs are sorted here, so
 * the identity depends on which files exist and what they hold, never on the
 * order a directory listing happened to return.
 * @param version - cache format version, so an upgrade invalidates old entries.
 * @param inputs - inputs from {@link collectConfigurationInputs}.
 * @param conditions - free-form conditions such as the platform and the JDK home.
 * @returns hex SHA-1 identifying this exact configuration.
 */
export function fingerprintConfiguration(version, inputs, conditions) {
    const hash = createHash('sha1');
    hash.update(`dsh-gradle-tasks:${version}\0`);
    for (const condition of conditions)
        hash.update(`${condition.length}:${condition}\0`);
    for (const input of [...inputs].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
        hash.update(`${input.path.length}:${input.path}\0${input.digest}\0`);
    }
    return hash.digest('hex');
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
