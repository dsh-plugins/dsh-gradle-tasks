/**
 * Gradle project detection and task-report parsing.
 *
 * Everything here is pure: filesystem access arrives through the small
 * {@link ProjectIo} facade so the parsing and grouping rules can be exercised
 * without a real build, and so the Host can feed the same logic from any
 * execution world.
 */
import { createHash } from 'node:crypto'
import { dirname, isAbsolute, join } from 'node:path'
import type { GradleProjectEntry, GradleProjectInfo, GradleTask, GradleTaskGroup } from './shared/protocol.ts'

/** Build script file names Gradle accepts at a project root, in discovery order. */
const BUILD_SCRIPTS = ['build.gradle.kts', 'build.gradle'] as const

/** Settings script file names Gradle accepts at a build root, in discovery order. */
const SETTINGS_SCRIPTS = ['settings.gradle.kts', 'settings.gradle'] as const

/** Wrapper scripts, in the order a root directory is probed for them. */
const WRAPPER_SCRIPTS = ['gradlew.bat', 'gradlew'] as const

/** Path of the wrapper descriptor inside a project root, relative to it. */
const WRAPPER_PROPERTIES = join('gradle', 'wrapper', 'gradle-wrapper.properties')

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
`

/** How many parent directories a search climbs before giving up. */
const MAX_ROOT_CLIMB = 12

/** Filesystem facts the detection rules need, injected so they stay pure. */
export interface ProjectIo {
  /** Whether `path` names an existing regular file. */
  isFile(path: string): boolean
  /** Read a UTF-8 text file, or undefined when it cannot be read. */
  readText(path: string): string | undefined
  /** Entries of one directory. */
  listDirectory(path: string): readonly DirectoryEntry[]
}

/** One directory entry, as the configuration walk needs to see it. */
export interface DirectoryEntry {
  readonly name: string
  readonly isDirectory: boolean
}

/** Failures worth reporting with the exact path that caused them. */
export class GradlePathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GradlePathError'
  }
}

/** Whether a path is absolute and therefore usable as a build directory. */
export function requireAbsolute(path: string): string {
  if (!isAbsolute(path)) throw new GradlePathError(`build directory must be absolute, received ${JSON.stringify(path)}`)
  return path
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
export function findProjectRoot(startDir: string, io: ProjectIo): string | null {
  let current = startDir
  for (let depth = 0; depth <= MAX_ROOT_CLIMB; depth += 1) {
    const hasBuild = BUILD_SCRIPTS.some(name => io.isFile(join(current, name)))
    const hasSettings = SETTINGS_SCRIPTS.some(name => io.isFile(join(current, name)))
    if (hasBuild || hasSettings) return current
    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
  return null
}

/**
 * Collect the scripts and wrapper that identify `rootDir` as a Gradle build.
 * @param rootDir - directory returned by {@link findProjectRoot}.
 * @param io - filesystem facts.
 * @returns the project description; `buildFiles` is empty for a settings-only root.
 */
export function describeProject(rootDir: string, io: ProjectIo): GradleProjectInfo {
  const buildFiles = [...SETTINGS_SCRIPTS, ...BUILD_SCRIPTS].filter(name => io.isFile(join(rootDir, name)))
  const wrapper = WRAPPER_SCRIPTS.find(name => io.isFile(join(rootDir, name))) ?? null
  const properties = wrapper === null ? undefined : io.readText(join(rootDir, WRAPPER_PROPERTIES))
  return {
    rootDir,
    buildFiles,
    wrapper,
    wrapperDistribution: properties === undefined ? null : parseDistributionUrl(properties),
  }
}

/**
 * Read `distributionUrl` from a Gradle wrapper properties file.
 * @param properties - raw file content.
 * @returns the declared distribution URL, or null when the file declares none.
 */
function parseDistributionUrl(properties: string): string | null {
  for (const line of properties.split(/\r?\n/)) {
    const match = /^\s*distributionUrl\s*=\s*(.+?)\s*$/.exec(line)
    if (match !== null && match[1] !== undefined && match[1] !== '') return match[1]
  }
  return null
}

/** How deep below the Session directory discovery looks for build roots. */
const MAX_DISCOVERY_DEPTH = 2

/** How many build roots one workspace may report. */
const MAX_WORKSPACE_PROJECTS = 200

/** How many directories one discovery walk may enter. */
const MAX_SCAN_DIRECTORIES = 5000

/** One build root discovered below a workspace directory. */
export interface DiscoveredProject {
  /** Absolute build root, as the walk reached it. */
  readonly rootDir: string
  /** Path relative to the workspace directory, with forward slashes; `.` for the directory itself. */
  readonly relativePath: string
}

/** What one discovery walk found, and whether its budget cut the walk short. */
export interface Discovery {
  readonly projects: readonly DiscoveredProject[]
  /** True when a budget stopped the walk, so the list is incomplete. */
  readonly truncated: boolean
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
export function discoverProjects(startDir: string, io: ProjectIo): Discovery {
  const enclosing = findProjectRoot(startDir, io)
  if (enclosing !== null) {
    return { projects: [{ rootDir: enclosing, relativePath: relativePathOf(startDir, enclosing) }], truncated: false }
  }
  const found: DiscoveredProject[] = []
  const seen = new Set<string>()
  let visited = 0
  let truncated = false
  const walk = (directory: string, depth: number): void => {
    if (truncated) return
    if (depth > MAX_DISCOVERY_DEPTH) return
    for (const entry of io.listDirectory(directory)) {
      if (truncated) return
      if (!entry.isDirectory) continue
      if (DISCOVERY_PRUNED.has(entry.name)) continue
      if (visited >= MAX_SCAN_DIRECTORIES) {
        truncated = true
        return
      }
      visited += 1
      const path = join(directory, entry.name)
      // Settings and build scripts are probed together: a directory holding
      // either one is a build root, and both probes cost one stat each.
      const isRoot = SETTINGS_SCRIPTS.some(name => io.isFile(join(path, name)))
        || BUILD_SCRIPTS.some(name => io.isFile(join(path, name)))
      if (isRoot) {
        const key = pathKey(path)
        if (found.length >= MAX_WORKSPACE_PROJECTS) {
          truncated = true
          return
        }
        if (!seen.has(key)) {
          seen.add(key)
          found.push({ rootDir: path, relativePath: relativePathOf(startDir, path) })
        }
        continue
      }
      walk(path, depth + 1)
    }
  }
  walk(startDir, 0)
  return { projects: sortProjects(found), truncated }
}

/** Order discovered roots by their workspace-relative path. */
function sortProjects(projects: readonly DiscoveredProject[]): DiscoveredProject[] {
  return [...projects].sort((left, right) =>
    compareText(left.relativePath, right.relativePath) || compareText(left.rootDir, right.rootDir))
}

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
export function relativePathOf(base: string, target: string): string {
  const split = (path: string): string[] => path
    .replaceAll('\\', '/')
    .split('/')
    .filter(part => part !== '' && part !== '.')
  const from = split(base).map(part => part.toLowerCase())
  const to = split(target)
  let shared = 0
  while (shared < from.length && shared < to.length && from[shared] === to[shared]?.toLowerCase()) shared += 1
  const up = new Array<string>(from.length - shared).fill('..')
  const joined = [...up, ...to.slice(shared)].join('/')
  return joined === '' ? '.' : joined
}

/**
 * A comparable form of an absolute path.
 *
 * Windows compares paths case-insensitively and accepts either separator, so
 * both spellings of one directory must collapse to the same key; a trailing
 * separator never distinguishes two directories.
 * @param path - absolute path.
 * @returns the comparison key.
 */
export function pathKey(path: string): string {
  return path.replaceAll('\\', '/').replace(/\/+$/, '').toLowerCase()
}

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
export function readRootProjectName(text: string): string | null {
  const match = /^\s*rootProject\.name\s*=\s*(['"])(.+?)\1\s*;?\s*$/m.exec(text)
  const name = match?.[2]?.trim()
  if (name === undefined || name === '' || /\$(?:\{|[A-Za-z_])/.test(name)) return null
  return name
}

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
export function readDeclaredModules(text: string): string[] {
  const modules: string[] = []
  const seen = new Set<string>()
  // `\binclude\b` keeps `includeGroup("…")` and `includeBuild(…)` out: their
  // next character is a word character, so there is no boundary to match. The
  // arguments stop at a closing paren or the end of the line, which covers both
  // `include(":app")` and the parenthesised list form.
  const call = /\binclude\b\s*\(?([^\n)]*)/g
  for (const match of text.matchAll(call)) {
    const args = match[1] ?? ''
    // Only quoted literals count: a computed argument tells us nothing here.
    for (const literal of args.matchAll(/(['"])(.+?)\1/g)) {
      const path = (literal[2] ?? '').trim().replace(/^:+/, '')
      if (path === '' || seen.has(path)) continue
      seen.add(path)
      modules.push(path)
    }
  }
  return modules
}

/**
 * Describe one discovered build root as the panel shows it.
 * @param rootDir - absolute build root.
 * @param relativePath - root path relative to the workspace directory.
 * @param io - filesystem facts.
 * @returns the project entry.
 */
export function describeProjectEntry(rootDir: string, relativePath: string, io: ProjectIo): GradleProjectEntry {
  const project = describeProject(rootDir, io)
  // Each root ships one settings script, not both, so a name is probed before the
  // file behind it is read: reading a missing script is not a failure worth
  // reporting, and a workspace of a hundred projects would otherwise report a
  // hundred of them on every listing.
  const settings = SETTINGS_SCRIPTS
    .filter(name => io.isFile(join(rootDir, name)))
    .map(name => io.readText(join(rootDir, name)))
    .find(text => text !== undefined)
  return {
    ...project,
    name: (settings === undefined ? null : readRootProjectName(settings)) ?? baseNameOf(rootDir),
    relativePath,
    modules: settings === undefined ? [] : readDeclaredModules(settings),
  }
}

/**
 * The last path segment of a directory, which is the display name a build
 * without a declared `rootProject.name` falls back to.
 *
 * The segment keeps its own spelling: this is the name a person reads in the
 * tree, and folding it would misname their directory.
 * @param path - absolute directory.
 * @returns the segment, or the path itself when it names a root.
 */
export function baseNameOf(path: string): string {
  const trimmed = path.replace(/[\\/]+$/, '')
  const index = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
  return index < 0 ? trimmed : trimmed.slice(index + 1)
}

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
export function selectProject(
  projects: readonly GradleProjectEntry[],
  requested: string | null,
): GradleProjectEntry | null {
  if (requested === null || requested.trim() === '') return projects.length === 1 ? projects[0] ?? null : null
  const key = pathKey(requested)
  return projects.find(project => pathKey(project.rootDir) === key) ?? null
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
export function parseTaskDump(text: string): GradleTask[] {
  const tasks: GradleTask[] = []
  for (const raw of text.split(/\r?\n/)) {
    if (raw === '') continue
    const first = raw.indexOf('\t')
    if (first < 0) continue
    const second = raw.indexOf('\t', first + 1)
    if (second < 0) continue
    const path = raw.slice(0, first).trim()
    if (path.length < 2 || !path.startsWith(':')) continue
    const group = raw.slice(first + 1, second).trim()
    const description = raw.slice(second + 1).trim()
    tasks.push({ path, project: projectPathOf(path), group, description })
  }
  return tasks
}

/**
 * The Gradle project path a task path belongs to: `:app:build` is `:app`, while
 * a root task such as `:build` belongs to the root project `:`.
 * @param taskPath - fully qualified task path.
 * @returns the owning project path.
 */
export function projectPathOf(taskPath: string): string {
  const index = taskPath.lastIndexOf(':')
  return index <= 0 ? ':' : taskPath.slice(0, index)
}

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
export function parseTaskReport(text: string): GradleTask[] {
  const tasks: GradleTask[] = []
  const lines = text.split(/\r?\n/)
  let group: string | null = null
  let previous = ''
  for (const raw of lines) {
    const line = raw.trimEnd()
    // A heading is underlined with dashes; the line above it names the bucket.
    if (/^-{3,}$/.test(line.trim())) {
      const heading = previous.trim()
      group = heading === '' ? null : groupNameOf(heading)
      previous = ''
      continue
    }
    if (group !== null && line.trim() !== '') {
      const parsed = taskReportRow(line)
      if (parsed !== null) tasks.push({ ...parsed, group })
    }
    previous = line
  }
  return tasks
}

/**
 * The Gradle group a report heading declares: `Build tasks` is `build`, and the
 * bucket for tasks that declare no group is the empty string.
 * @param heading - the heading line above an underline.
 * @returns the group name.
 */
function groupNameOf(heading: string): string {
  const named = /^(.*?)\s+tasks?$/i.exec(heading)
  if (named === null) return heading
  const name = (named[1] ?? '').trim()
  return /^other$/i.test(name) ? '' : name
}

/**
 * One task row of the `tasks --all` report.
 *
 * A row is a task path, optionally followed by ` - ` and a description. Anything
 * that is not a well-formed path — prose, a pattern rule, a banner — is not a
 * row: the paths this build accepts are already fixed by {@link isTaskPath}.
 * @param line - one report line.
 * @returns the task with an absolute path, or null when the line is not a row.
 */
function taskReportRow(line: string): { path: string, project: string, description: string } | null {
  const separator = line.indexOf(' - ')
  const rawPath = (separator < 0 ? line : line.slice(0, separator)).trim()
  // The report prints a root-project task as `build` and a subproject task as
  // `sub:build`, so the leading colon is added here rather than required.
  const bare = rawPath.replace(/^:+/, '')
  if (!/^[\w.-]+(?::[\w.-]+)*$/.test(bare)) return null
  const path = `:${bare}`
  if (!isTaskPath(path)) return null
  const description = separator < 0 ? '' : line.slice(separator + 3).trim()
  return { path, project: projectPathOf(path), description }
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
export function groupTasks(tasks: readonly GradleTask[]): GradleTaskGroup[] {
  const buckets = new Map<string, GradleTask[]>()
  for (const task of tasks) {
    const bucket = buckets.get(task.group)
    if (bucket === undefined) buckets.set(task.group, [task])
    else bucket.push(task)
  }
  const groups = [...buckets.entries()]
    .map(([group, members]) => ({ group, tasks: sortTasks(members) }))
  groups.sort((left, right) => {
    if (left.group === '') return 1
    if (right.group === '') return -1
    return compareText(left.group, right.group)
  })
  return groups
}

/** Order one group's tasks by description, then by path. */
function sortTasks(tasks: readonly GradleTask[]): GradleTask[] {
  return [...tasks].sort((left, right) => {
    if (left.description === '' && right.description !== '') return 1
    if (right.description === '' && left.description !== '') return -1
    return compareText(left.description, right.description) || compareText(left.path, right.path)
  })
}

/** Case-insensitive comparison with a stable code-unit fallback. */
function compareText(left: string, right: string): number {
  const folded = left.toLowerCase().localeCompare(right.toLowerCase())
  return folded !== 0 ? folded : left.localeCompare(right)
}

/**
 * The wrapper script a project root ships for the given platform.
 * @param project - detected project.
 * @param platform - execution platform of the Host's subprocess provider.
 * @returns the wrapper file name, or null when the project ships none.
 */
export function wrapperScriptFor(project: GradleProjectInfo, platform: 'posix' | 'windows'): string | null {
  if (project.wrapper === null) return null
  if (platform === 'windows' && project.wrapper === 'gradlew.bat') return project.wrapper
  if (platform === 'posix' && project.wrapper === 'gradlew') return project.wrapper
  return null
}

/**
 * Quote one argument for a PowerShell command line.
 *
 * PowerShell reads single quotes literally, so an embedded quote is escaped by
 * doubling it, and everything else — spaces, `$`, backticks — arrives verbatim.
 * @param value - the argument.
 * @returns the quoted argument.
 */
export function quotePowerShell(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

/**
 * Whether a command is a batch script the process seam cannot execute
 * directly. Gradle ships `gradlew.bat` and, on Windows, `gradle.bat`, and
 * `node:child_process` starts neither without a command interpreter.
 * @param path - executable name or path.
 * @returns true for `.bat` and `.cmd`.
 */
function isBatchScript(path: string): boolean {
  return /\.(?:bat|cmd)$/i.test(path)
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
export function powerShellArgv(script: string, args: readonly string[]): string[] {
  const command = ['&', quotePowerShell(script), ...args.map(quotePowerShell)].join(' ')
  return ['powershell.exe', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command]
}

/**
 * Build the argv that invokes Gradle for one directory.
 * @param script - wrapper path, or `gradle` when the project ships no wrapper.
 * @param args - the Gradle arguments.
 * @param platform - execution platform of the Host's subprocess provider.
 * @returns the argv to hand to the subprocess provider.
 */
export function gradleArgv(
  script: { readonly path: string },
  args: readonly string[],
  platform: 'posix' | 'windows',
): string[] {
  if (platform === 'windows' && isBatchScript(script.path)) return powerShellArgv(script.path, args)
  return [script.path, ...args]
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
export function isTaskPath(taskPath: string): boolean {
  return /^:?[\w.-]+(?::[\w.-]+)*$/.test(taskPath)
}

/** Directory names the configuration walk never enters. */
const PRUNED_DIRECTORIES = new Set([
  'build', 'out', 'target', 'bin', 'obj', 'node_modules', 'vendor',
  '.git', '.gradle', '.idea', '.vscode', '.settings',
])

/**
 * Directory names discovery never enters.
 *
 * The configuration walk's list already covers build output, dependencies, and
 * editor state; discovery adds a few more generated-output and checkout-furniture
 * names, because a build rooted inside one of them is generated or vendored
 * rather than a repository somebody opens the workspace to build.
 */
const DISCOVERY_PRUNED = new Set([
  ...PRUNED_DIRECTORIES,
  'dist', 'coverage', 'tmp', 'temp', '.next', '.nuxt', '.output',
  '.hg', '.svn', '.cache',
])

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
])

/** How deep the configuration walk descends below the build root. */
const MAX_INPUT_DEPTH = 8

/** How many configuration files one fingerprint reads. */
const MAX_INPUT_FILES = 2000

/** One configuration input: a project-relative path and the digest of its bytes. */
export interface ConfigurationInput {
  /** Path relative to the build root, always with forward slashes. */
  readonly path: string
  /** Hex SHA-1 of the file's UTF-8 text. */
  readonly digest: string
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
export function collectConfigurationInputs(rootDir: string, io: ProjectIo): ConfigurationInput[] {
  const inputs: ConfigurationInput[] = []
  const walk = (directory: string, depth: number, prefix: string): void => {
    if (depth > MAX_INPUT_DEPTH) return
    for (const entry of io.listDirectory(directory)) {
      const path = join(directory, entry.name)
      if (entry.isDirectory) {
        if (!PRUNED_DIRECTORIES.has(entry.name)) walk(path, depth + 1, `${prefix}${entry.name}/`)
        continue
      }
      if (!CONFIGURATION_FILES.has(entry.name)) continue
      if (inputs.length >= MAX_INPUT_FILES) {
        console.warn(`gradle-tasks: ${rootDir} has more than ${MAX_INPUT_FILES} configuration files; the cache may miss changes below ${prefix}`)
        return
      }
      const text = io.readText(path)
      if (text === undefined) continue
      inputs.push({ path: `${prefix}${entry.name}`, digest: createHash('sha1').update(text).digest('hex') })
    }
  }
  walk(rootDir, 0, '')
  return inputs
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
export function fingerprintConfiguration(
  version: number,
  inputs: readonly ConfigurationInput[],
  conditions: readonly string[],
): string {
  const hash = createHash('sha1')
  hash.update(`dsh-gradle-tasks:${version}\0`)
  for (const condition of conditions) hash.update(`${condition.length}:${condition}\0`)
  for (const input of [...inputs].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) {
    hash.update(`${input.path.length}:${input.path}\0${input.digest}\0`)
  }
  return hash.digest('hex')
}

/**
 * Quote one argument for a POSIX shell.
 * @param value - the argument.
 * @returns the single-quoted argument, with embedded quotes escaped.
 */
export function quotePosix(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`
}

/**
 * Quote one argument for `cmd.exe`.
 *
 * cmd has no escape for a quote inside a quoted word, and neither a task path
 * nor a wrapper path can contain one, so double quotes are enough and also keep
 * spaces and `&`, `|`, `>` from being read as operators.
 * @param value - the argument.
 * @returns the double-quoted argument.
 */
export function quoteCmd(value: string): string {
  return `"${value}"`
}

/** The shell families whose quoting rules differ. */
export type ShellKind = 'powershell' | 'cmd' | 'posix'

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
export function shellKindOf(shellPath: string, platform: 'posix' | 'windows'): ShellKind {
  if (platform !== 'windows') return 'posix'
  const name = shellPath.slice(Math.max(shellPath.lastIndexOf('/'), shellPath.lastIndexOf('\\')) + 1)
    .toLowerCase().replace(/\.exe$/u, '')
  if (name === 'cmd') return 'cmd'
  if (name === 'pwsh' || name === 'powershell') return 'powershell'
  // Any other Windows shell (Git Bash, a custom profile) reads POSIX quoting.
  return 'posix'
}

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
export function shellCommandLine(
  script: string,
  args: readonly string[],
  kind: ShellKind,
): string {
  if (kind === 'cmd') return [script, ...args].map(quoteCmd).join(' ')
  if (kind === 'powershell') return ['&', quotePowerShell(script), ...args.map(quotePowerShell)].join(' ')
  return [quotePosix(script), ...args.map(quotePosix)].join(' ')
}

/**
 * Keep the trailing part of a log, so a failure message stays readable.
 * @param text - full log.
 * @param limit - maximum number of characters to keep.
 * @returns the tail, prefixed with a marker when content was dropped.
 */
export function tailOf(text: string, limit: number): string {
  if (text.length <= limit) return text
  return `… ${text.length - limit} earlier characters omitted …\n${text.slice(text.length - limit)}`
}
