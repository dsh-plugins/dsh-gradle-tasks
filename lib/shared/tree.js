/**
 * Split one scan's groups into the whole-build list and one bucket per
 * subproject, keeping the grouping and ordering the scan already produced.
 *
 * The whole-build list is the scanned groups unchanged: a group such as `build`
 * already holds the root project's task and every subproject's, which is what
 * one `gradle build` runs. The module buckets are the same tasks seen from the
 * other side, so a person can either run the aggregate or narrow down to one
 * subproject without losing the aggregate's meaning.
 * @param groups - task groups returned by the Host.
 * @param rootPath - the root project's Gradle path, `:` for a single-project build.
 * @returns the tree for one build root.
 */
export function buildProjectTree(groups, rootPath = ':') {
    const buckets = new Map();
    for (const group of groups) {
        const perModule = new Map();
        for (const task of group.tasks) {
            if (task.project === rootPath)
                continue;
            const list = perModule.get(task.project);
            if (list === undefined)
                perModule.set(task.project, [task]);
            else
                list.push(task);
        }
        for (const [path, tasks] of perModule) {
            const existing = buckets.get(path);
            const bucket = { group: group.group, tasks };
            if (existing === undefined)
                buckets.set(path, [bucket]);
            else
                existing.push(bucket);
        }
    }
    const modules = [...buckets.entries()]
        .map(([path, moduleGroups]) => ({
        path,
        name: moduleNameOf(path),
        groups: moduleGroups.sort(compareGroups),
    }))
        .sort((left, right) => compareText(left.path, right.path));
    const aggregate = aggregateGroups(groups);
    return {
        aggregate,
        modules,
        taskCount: aggregate.reduce((sum, group) => sum + group.tasks.length, 0),
    };
}
/**
 * Collapse every project's tasks into one row per task name, keeping the scan's
 * grouping and order.
 *
 * `:common:jar`, `:fabric:jar`, and `:neoforge:jar` are one entry here because
 * Gradle treats the bare name `jar` as "this task in every project that has it":
 * listing the three separately would suggest three separate actions for what is
 * one command. The project list on the entry records where it lands, and the
 * longest description wins because a subproject's description usually says more
 * than the root project's bare default.
 * @param groups - task groups returned by the Host.
 * @returns one group per scanned group, each holding one entry per task name.
 */
export function aggregateGroups(groups) {
    return groups.map((group) => {
        const byName = new Map();
        for (const task of group.tasks) {
            const name = moduleNameOf(task.path);
            const existing = byName.get(name);
            if (existing === undefined) {
                byName.set(name, { description: task.description, projects: [task.project] });
                continue;
            }
            if (!existing.projects.includes(task.project))
                existing.projects.push(task.project);
            if (task.description.length > existing.description.length)
                existing.description = task.description;
        }
        return {
            group: group.group,
            tasks: [...byName.entries()].map(([name, entry]) => ({
                name,
                description: entry.description,
                projects: entry.projects.sort(compareText),
            })),
        };
    });
}
/** The display name of a Gradle project path: `:app:core` reads `core`. */
export function moduleNameOf(path) {
    const tail = path.split(':').filter(part => part !== '').at(-1);
    return tail === undefined ? path : tail;
}
/**
 * Order groups the way a scan orders them: by name, with the bucket for tasks
 * that declared no group last. A stable sort keeps the scan's own order both
 * inside a project and between projects.
 */
function compareGroups(left, right) {
    if (left.group === '')
        return 1;
    if (right.group === '')
        return -1;
    return compareText(left.group, right.group);
}
/** Count the tasks one group list holds. */
function countTasks(groups) {
    return groups.reduce((sum, group) => sum + group.tasks.length, 0);
}
/** Case-insensitive comparison with a stable code-unit fallback. */
function compareText(left, right) {
    const folded = left.toLowerCase().localeCompare(right.toLowerCase());
    return folded !== 0 ? folded : left.localeCompare(right);
}
/**
 * Whether a build root matches a search term.
 *
 * The panel asks this before it has scanned a project, so a term that names the
 * project still shows its folded row: hiding a node whose tasks were never
 * scanned would make the filter look broken.
 * @param entry - the build root.
 * @param needle - search term, already trimmed and lower-cased.
 * @returns true when the name, path, or a declared module path contains it.
 */
export function projectMatches(entry, needle) {
    if (needle === '')
        return true;
    return entry.name.toLowerCase().includes(needle)
        || entry.relativePath.toLowerCase().includes(needle)
        || entry.rootDir.toLowerCase().includes(needle)
        || entry.modules.some(module => module.toLowerCase().includes(needle));
}
/**
 * Whether a task matches a search term.
 * @param task - one Gradle task, or one aggregated row under its `name`.
 * @param needle - search term, already trimmed and lower-cased.
 * @returns true when the task's path (or aggregate name) or its description contains it.
 */
export function taskMatches(task, needle) {
    if (needle === '')
        return true;
    const path = (task.path ?? task.name ?? '').toLowerCase();
    return path.includes(needle) || task.description.toLowerCase().includes(needle);
}
