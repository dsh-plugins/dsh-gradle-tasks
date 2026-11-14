/**
 * The task-list cache a project keeps beside its own build state.
 *
 * The cache lives in `<root>/.gradle/dsh-gradle-tasks/`, which Gradle already
 * treats as build-local scratch space and which project `.gitignore` files
 * invariably exclude, so a scan leaves nothing for a person to clean up.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
/**
 * Format version of a cache entry. Bumping it makes every existing cache a
 * miss, which is what a change to the parsing or grouping rules requires.
 */
export const CACHE_VERSION = 1;
/** Directory holding this plugin's cache inside a project. */
export function cacheDirectoryOf(rootDir) {
    return join(rootDir, '.gradle', 'dsh-gradle-tasks');
}
/** File holding the task list for one project. */
export function cacheFileOf(rootDir) {
    return join(cacheDirectoryOf(rootDir), 'tasks.json');
}
/**
 * Read a cached task list.
 *
 * Anything unusable — a missing file, a body another tool wrote, a shape from a
 * future version — is reported as absent, because the only consequence of a
 * miss is one Gradle run that then rewrites the entry.
 * @param rootDir - build root.
 * @returns the entry, or null when there is nothing usable to read.
 */
export function readTaskCache(rootDir) {
    const path = cacheFileOf(rootDir);
    let text;
    try {
        text = readFileSync(path, 'utf8');
    }
    catch (error) {
        const code = error.code;
        if (code !== 'ENOENT')
            console.warn(`gradle-tasks: cannot read ${path}`, error);
        return null;
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch (error) {
        console.warn(`gradle-tasks: ignoring ${path}, which is not JSON`, error);
        return null;
    }
    if (!isTaskCacheEntry(parsed)) {
        console.warn(`gradle-tasks: ignoring ${path}, which does not hold a task cache entry`);
        return null;
    }
    return parsed;
}
/**
 * Store a task list for reuse.
 *
 * A project on a read-only volume cannot keep a cache; the scan it is paired
 * with still stands, so the failure is reported and dropped.
 * @param rootDir - build root.
 * @param entry - the entry to store.
 */
export function writeTaskCache(rootDir, entry) {
    const path = cacheFileOf(rootDir);
    try {
        mkdirSync(cacheDirectoryOf(rootDir), { recursive: true });
        writeFileSync(path, JSON.stringify(entry), 'utf8');
    }
    catch (error) {
        console.warn(`gradle-tasks: cannot write ${path}; this project will be rescanned every time`, error);
    }
}
/**
 * Whether a parsed value is a cache entry this plugin wrote.
 * @param value - parsed JSON.
 * @returns true for an entry whose shape and version this build understands.
 */
export function isTaskCacheEntry(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return false;
    const entry = value;
    if (entry.version !== CACHE_VERSION)
        return false;
    if (typeof entry.fingerprint !== 'string' || entry.fingerprint === '')
        return false;
    if (entry.javaHome !== null && typeof entry.javaHome !== 'string')
        return false;
    if (typeof entry.scannedAt !== 'number' || typeof entry.durationMs !== 'number')
        return false;
    if (!Array.isArray(entry.groups))
        return false;
    return entry.groups.every(group => group !== null && typeof group === 'object'
        && typeof group.group === 'string'
        && Array.isArray(group.tasks));
}
