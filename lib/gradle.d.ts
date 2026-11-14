import type { GradleProjectInfo, GradleTask, GradleTaskGroup } from './shared/protocol.ts';
/** Build script file names Gradle accepts at a project root, in discovery order. */
export declare const BUILD_SCRIPTS: readonly ["build.gradle.kts", "build.gradle"];
/** Settings script file names Gradle accepts at a build root, in discovery order. */
export declare const SETTINGS_SCRIPTS: readonly ["settings.gradle.kts", "settings.gradle"];
/** Wrapper scripts, in the order a root directory is probed for them. */
export declare const WRAPPER_SCRIPTS: readonly ["gradlew.bat", "gradlew"];
/** Path of the wrapper descriptor inside a project root, relative to it. */
export declare const WRAPPER_PROPERTIES: string;
/**
 * The initialization script that reports every configured task.
 *
 * It runs after the build is configured, so it sees tasks registered by
 * plugins and by settings scripts alike, and writes one tab-separated row per
 * task. Group and description have their tabs and newlines flattened: they
 * are free text, and one stray separator would otherwise split the row.
 */
export declare const TASK_DUMP_SCRIPT = "// Written by dsh-gradle-tasks: report every configured task once the build is configured.\ngradle.projectsEvaluated {\n    def outPath = gradle.startParameter.projectProperties['dshGradleTasksOut']\n    if (outPath == null) return\n    def esc = { s -> s == null ? '' : s.replace('\\t', ' ').replace('\\r', ' ').replace('\\n', ' ') }\n    def sb = new StringBuilder()\n    gradle.rootProject.allprojects.each { p ->\n        p.tasks.each { t ->\n            sb.append(t.path).append('\\t').append(esc(t.group ?: '')).append('\\t').append(esc(t.description ?: '')).append('\\n')\n        }\n    }\n    new File(outPath).setText(sb.toString(), 'UTF-8')\n}\n";
/** Filesystem facts the detection rules need, injected so they stay pure. */
export interface ProjectIo {
    /** Whether `path` names an existing regular file. */
    isFile(path: string): boolean;
    /** Read a UTF-8 text file, or undefined when it cannot be read. */
    readText?(path: string): string | undefined;
}
/** Failures worth reporting with the exact path that caused them. */
export declare class GradlePathError extends Error {
    constructor(message: string);
}
/** Whether a path is absolute and therefore usable as a build directory. */
export declare function requireAbsolute(path: string): string;
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
export declare function findProjectRoot(startDir: string, io: ProjectIo): string | null;
/**
 * Collect the scripts and wrapper that identify `rootDir` as a Gradle build.
 * @param rootDir - directory returned by {@link findProjectRoot}.
 * @param io - filesystem facts.
 * @returns the project description; `buildFiles` is empty for a settings-only root.
 */
export declare function describeProject(rootDir: string, io: ProjectIo): GradleProjectInfo;
/**
 * Read `distributionUrl` from a Gradle wrapper properties file.
 * @param properties - raw file content.
 * @returns the declared distribution URL, or null when the file declares none.
 */
export declare function parseDistributionUrl(properties: string): string | null;
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
export declare function parseTaskDump(text: string): GradleTask[];
/**
 * The Gradle project path a task path belongs to: `:app:build` is `:app`, while
 * a root task such as `:build` belongs to the root project `:`.
 * @param taskPath - fully qualified task path.
 * @returns the owning project path.
 */
export declare function projectPathOf(taskPath: string): string;
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
export declare function groupTasks(tasks: readonly GradleTask[]): GradleTaskGroup[];
/**
 * The wrapper script a project root ships for the given platform.
 * @param project - detected project.
 * @param platform - execution platform of the Host's subprocess provider.
 * @returns the wrapper file name, or null when the project ships none.
 */
export declare function wrapperScriptFor(project: GradleProjectInfo, platform: 'posix' | 'windows'): string | null;
/**
 * Quote one argument for a PowerShell command line.
 *
 * PowerShell reads single quotes literally, so an embedded quote is escaped by
 * doubling it, and everything else — spaces, `$`, backticks — arrives verbatim.
 * @param value - the argument.
 * @returns the quoted argument.
 */
export declare function quotePowerShell(value: string): string;
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
export declare function powerShellArgv(script: string, args: readonly string[]): string[];
/**
 * Build the argv that invokes Gradle for one directory.
 * @param script - wrapper path, or `gradle` when the project ships no wrapper.
 * @param args - the Gradle arguments.
 * @param platform - execution platform of the Host's subprocess provider.
 * @returns the argv to hand to the subprocess provider.
 */
export declare function gradleArgv(script: {
    readonly path: string;
    readonly fromWrapper: boolean;
}, args: readonly string[], platform: 'posix' | 'windows'): string[];
/**
 * Keep the trailing part of a log, so a failure message stays readable.
 * @param text - full log.
 * @param limit - maximum number of characters to keep.
 * @returns the tail, prefixed with a marker when content was dropped.
 */
export declare function tailOf(text: string, limit: number): string;
/**
 * Render a path for display relative to a root, using forward slashes.
 * @param root - base directory.
 * @param path - absolute path inside the root.
 * @returns the relative path, or the absolute one when it escapes the root.
 */
export declare function displayRelative(root: string, path: string): string;
