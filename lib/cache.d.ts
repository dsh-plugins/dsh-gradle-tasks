import type { GradleTaskGroup } from './shared/protocol.ts';
/**
 * Format version of a cache entry. Bumping it makes every existing cache a
 * miss, which is what a change to the parsing or grouping rules requires.
 */
export declare const CACHE_VERSION = 1;
/** One cached task list, valid only for the configuration that produced it. */
export interface TaskCacheEntry {
    readonly version: number;
    /** Digest of the configuration inputs and conditions; see `fingerprintConfiguration`. */
    readonly fingerprint: string;
    /** JDK the scan ran with, recorded so a cache explains itself when inspected. */
    readonly javaHome: string | null;
    readonly groups: readonly GradleTaskGroup[];
    /** When the scan that produced this entry finished, as epoch milliseconds. */
    readonly scannedAt: number;
    /** How long that scan took, so a cache hit can report the original cost. */
    readonly durationMs: number;
}
/** Directory holding this plugin's cache inside a project. */
export declare function cacheDirectoryOf(rootDir: string): string;
/** File holding the task list for one project. */
export declare function cacheFileOf(rootDir: string): string;
/**
 * Read a cached task list.
 *
 * Anything unusable — a missing file, a body another tool wrote, a shape from a
 * future version — is reported as absent, because the only consequence of a
 * miss is one Gradle run that then rewrites the entry.
 * @param rootDir - build root.
 * @returns the entry, or null when there is nothing usable to read.
 */
export declare function readTaskCache(rootDir: string): TaskCacheEntry | null;
/**
 * Store a task list for reuse.
 *
 * A project on a read-only volume cannot keep a cache; the scan it is paired
 * with still stands, so the failure is reported and dropped.
 * @param rootDir - build root.
 * @param entry - the entry to store.
 */
export declare function writeTaskCache(rootDir: string, entry: TaskCacheEntry): void;
/**
 * Whether a parsed value is a cache entry this plugin wrote.
 * @param value - parsed JSON.
 * @returns true for an entry whose shape and version this build understands.
 */
export declare function isTaskCacheEntry(value: unknown): value is TaskCacheEntry;
