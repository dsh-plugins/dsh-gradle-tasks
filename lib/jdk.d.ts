import type { JdkCandidate } from './shared/protocol.ts';
/** The variable whose value is selected when it names a usable JDK. */
export declare const DEFAULT_JDK_VARIABLE = "JAVA_HOME";
/** A JDK read from the environment, before its installation is verified. */
export interface JdkVariable {
    readonly variable: string;
    readonly home: string;
}
/**
 * Read every environment entry that points at a JDK installation.
 *
 * Names are matched case-insensitively because Windows exposes environment
 * variables case-insensitively. Entries are ranked first and deduplicated
 * second, so two variables naming the same installation keep the
 * higher-priority one: a `JAVA_HOME` that repeats an alias still wins, and the
 * default JDK is the one `JAVA_HOME` names rather than whichever alias the
 * environment happened to list first.
 * @param env - environment entries, typically the Host process environment.
 * @returns candidates ordered by variable priority, `JAVA_HOME` first.
 */
export declare function collectJdkVariables(env: Readonly<Record<string, string | undefined>>): JdkVariable[];
/**
 * Read one `KEY="value"` entry from a JDK `release` file.
 * @param text - raw file content.
 * @param key - entry name, for example `JAVA_VERSION`.
 * @returns the unquoted value, or null when the entry is absent.
 */
export declare function readReleaseEntry(text: string, key: string): string | null;
/**
 * Whether a JDK directory hosts an executable `java` for the given platform
 * naming convention.
 * @param home - candidate JDK directory.
 * @param isFile - filesystem probe.
 * @param names - executable names to try, in order.
 * @returns true when at least one expected executable exists.
 */
export declare function hasJavaExecutable(home: string, isFile: (path: string) => boolean, names?: readonly string[]): boolean;
/**
 * Mark the default candidate and drop entries whose variable repeats a home.
 * @param candidates - verified candidates, already in priority order.
 * @returns candidates carrying `isDefault`.
 */
export declare function markDefault(candidates: readonly Omit<JdkCandidate, 'isDefault'>[]): JdkCandidate[];
