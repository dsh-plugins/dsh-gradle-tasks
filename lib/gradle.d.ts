import type { GradleProjectEntry, GradleProjectInfo, GradleTask, GradleTaskGroup } from './shared/protocol.ts';
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
/** One build root discovered below a workspace directory. */
export interface DiscoveredProject {
    /** Absolute build root, as the walk reached it. */
    readonly rootDir: string;
    /** Path relative to the workspace directory, with forward slashes; `.` for the directory itself. */
    readonly relativePath: string;
}
/** What one discovery walk found, and whether its budget cut the walk short. */
export interface Discovery {
    readonly projects: readonly DiscoveredProject[];
    /** True when a budget stopped the walk, so the list is incomplete. */
    readonly truncated: boolean;
}
/**
 * Find every Gradle build root in a Session's workspace.
 *
 * A directory that is itself inside a build reports exactly that one build:
 * opening `src/main/java` or `app/` names the build it belongs to, and reporting
 * sibling repositories as well would misrepresent what the Session is about. A
 * directory outside every build is treated as a workspace of repositories, so
 * its descendants are walked to a small bounded depth — the layout of a folder
 * holding several checkouts — and each build root met becomes one entry. The
 * walk stops descending at a root, because everything below it belongs to that
 * build rather than being a project of its own.
 * @param startDir - absolute Session working directory.
 * @param io - filesystem facts.
 * @returns the discovered roots in display order, plus the truncation flag.
 */
export declare function discoverProjects(startDir: string, io: ProjectIo): Discovery;
/**
 * The path of `target` relative to `base`, with forward slashes.
 *
 * Segments compare the way the platform compares them — case-insensitively on
 * Windows, where the two spellings of one directory must still cancel out — but
 * the result keeps the spelling of `target`, because this is what the panel
 * shows a person and folding its case would misname their own directories.
 * @param base - directory the result is relative to.
 * @param target - absolute path to express.
 * @returns the relative path, or `.` when both name the same directory.
 */
export declare function relativePathOf(base: string, target: string): string;
/**
 * A comparable form of an absolute path.
 *
 * Windows compares paths case-insensitively and accepts either separator, so
 * both spellings of one directory must collapse to the same key; a trailing
 * separator never distinguishes two directories.
 * @param path - absolute path.
 * @returns the comparison key.
 */
export declare function pathKey(path: string): string;
/**
 * Read `rootProject.name` from a settings script.
 *
 * Both DSLs spell the assignment the same way, so one pattern covers them; the
 * value may be single- or double-quoted. A value that still holds a template
 * placeholder — `rootProject.name = "${mod_id}"` is how many multi-loader mod
 * builds name themselves, with the real name assigned later — is treated as no
 * declaration at all: showing the placeholder would name every such project
 * `${mod_id}`, which is worse than the directory it already sits in.
 * @param text - settings script content.
 * @returns the declared name, or null when the script declares none.
 */
export declare function readRootProjectName(text: string): string | null;
/**
 * Read the subproject paths a settings script declares.
 *
 * Settings scripts can include projects dynamically, so this list is a display
 * hint — the count a folded project row shows before its build is configured —
 * and never the authority on which modules exist. A leading colon is dropped so
 * the result matches the project paths task paths carry.
 * @param text - settings script content.
 * @returns declared project paths such as `app`, in declaration order.
 */
export declare function readDeclaredModules(text: string): string[];
/**
 * Describe one discovered build root as the panel shows it.
 * @param rootDir - absolute build root.
 * @param relativePath - root path relative to the workspace directory.
 * @param io - filesystem facts.
 * @returns the project entry.
 */
export declare function describeProjectEntry(rootDir: string, relativePath: string, io: ProjectIo): GradleProjectEntry;
/**
 * The last path segment of a directory, which is the display name a build
 * without a declared `rootProject.name` falls back to.
 *
 * The segment keeps its own spelling: this is the name a person reads in the
 * tree, and folding it would misname their directory.
 * @param path - absolute directory.
 * @returns the segment, or the path itself when it names a root.
 */
export declare function baseNameOf(path: string): string;
/**
 * The project entry a request names, or null when the workspace does not hold it.
 *
 * The name reaches a command line as the directory a build runs in, so it is
 * resolved against the discovered list instead of being used as a path: a
 * Session can only ever act on a build root its own workspace contains.
 * @param projects - entries returned by {@link discoverProjects} + {@link describeProjectEntry}.
 * @param requested - absolute root path the request named, or null to leave the choice to the caller.
 * @returns the matching entry, or null when none matches.
 */
export declare function selectProject(projects: readonly GradleProjectEntry[], requested: string | null): GradleProjectEntry | null;
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
 * Parse the report Gradle's own `tasks --all` prints.
 *
 * This is the fallback for a build the initialization script cannot describe.
 * Gradle 9 refuses configuration resolution that happens outside a lock, and
 * some convention plugins resolve during task realization, so the script's
 * traversal of every project fails where Gradle's own report — which realizes
 * tasks inside a real task run — succeeds.
 *
 * The report is a series of `<Group> tasks` headings, each underlined with
 * dashes, followed by `<path> - <description>` lines; a task inside a
 * subproject is printed as `sub:task`, and a task of the root project carries no
 * prefix. `--console=plain` keeps the layout free of progress rewriting, and
 * Gradle's report strings stay in English whatever the JVM locale.
 * @param text - the `tasks --all` output.
 * @returns every task it listed, with the group each heading declares.
 */
export declare function parseTaskReport(text: string): GradleTask[];
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
 * Quote one argument for a POSIX shell.
 * @param value - the argument.
 * @returns the single-quoted argument, with embedded quotes escaped.
 */
export declare function quotePosix(value: string): string;
/**
 * Quote one argument for `cmd.exe`.
 *
 * cmd has no escape for a quote inside a quoted word, and neither a task path
 * nor a wrapper path can contain one, so double quotes are enough and also keep
 * spaces and `&`, `|`, `>` from being read as operators.
 * @param value - the argument.
 * @returns the double-quoted argument.
 */
export declare function quoteCmd(value: string): string;
/** The shell families whose quoting rules differ. */
export type ShellKind = 'powershell' | 'cmd' | 'posix';
/**
 * Which quoting rules a shell executable needs.
 *
 * The terminal's own shell decides how typed text is parsed, and this plugin
 * does not get to assume one: a box with no PowerShell still gets a `cmd.exe`
 * terminal, where `&` is a command separator rather than a call operator.
 * @param shellPath - the terminal's shell executable.
 * @param platform - platform the terminal runs on.
 * @returns the quoting family.
 */
export declare function shellKindOf(shellPath: string, platform: 'posix' | 'windows'): ShellKind;
/**
 * The command line typed into a terminal to run one Gradle invocation.
 *
 * The person's shell decides how the text is parsed, so every argument is a
 * quoted literal for that shell: a wrapper path containing spaces, a task path
 * containing dots, and Windows paths in general all survive intact.
 * @param script - wrapper path, or the `gradle` executable.
 * @param args - the Gradle arguments.
 * @param kind - the quoting family of the terminal's shell.
 * @returns the command line, without a trailing newline.
 */
export declare function shellCommandLine(script: string, args: readonly string[], kind: ShellKind): string;
/**
 * Keep the trailing part of a log, so a failure message stays readable.
 * @param text - full log.
 * @param limit - maximum number of characters to keep.
 * @returns the tail, prefixed with a marker when content was dropped.
 */
export declare function tailOf(text: string, limit: number): string;
