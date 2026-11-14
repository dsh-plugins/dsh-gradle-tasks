import type { GradleProjectInfo, GradleTask, GradleTaskGroup } from './shared/protocol.ts';
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
    readText(path: string): string | undefined;
    /** Entries of one directory. */
    listDirectory(path: string): readonly DirectoryEntry[];
}
/** One directory entry, as the configuration walk needs to see it. */
export interface DirectoryEntry {
    readonly name: string;
    readonly isDirectory: boolean;
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
 * PowerShell both starts batch scripts and quotes paths containing spaces, so
 * every Windows Gradle invocation — wrapper or `PATH` executable — goes
 * through it with single-quoted literals.
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
}, args: readonly string[], platform: 'posix' | 'windows'): string[];
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
export declare function isTaskPath(taskPath: string): boolean;
/** One configuration input: a project-relative path and the digest of its bytes. */
export interface ConfigurationInput {
    /** Path relative to the build root, always with forward slashes. */
    readonly path: string;
    /** Hex SHA-1 of the file's UTF-8 text. */
    readonly digest: string;
}
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
export declare function collectConfigurationInputs(rootDir: string, io: ProjectIo): ConfigurationInput[];
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
export declare function fingerprintConfiguration(version: number, inputs: readonly ConfigurationInput[], conditions: readonly string[]): string;
/**
 * Keep the trailing part of a log, so a failure message stays readable.
 * @param text - full log.
 * @param limit - maximum number of characters to keep.
 * @returns the tail, prefixed with a marker when content was dropped.
 */
export declare function tailOf(text: string, limit: number): string;
