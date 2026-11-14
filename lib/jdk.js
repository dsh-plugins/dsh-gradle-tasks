/**
 * JDK discovery from the Host environment.
 *
 * The scan is deliberately environment-driven: a developer's installed JDKs
 * are already enumerated by the variables their shell exports (`JAVA_HOME`,
 * `JAVA_17`, `JAVA_21`, `JDK_HOME`, …), so reading them costs nothing and
 * always agrees with the shell the person actually builds in.
 */
import { join } from 'node:path';
/** Environment variable names that conventionally point at a JDK. */
const JDK_VARIABLE = /^(?:JAVA|JDK)/i;
/** The part after `JAVA`/`JDK`: a version, a home marker, or both, and nothing else. */
const JDK_SUFFIX = /^(?:_HOME|HOME|_?\d+|_HOME_?\d+|_?\d+_?HOME)?$/i;
/** Variables whose name alone already implies a JDK regardless of the pattern above. */
const EXPLICIT_VARIABLES = ['JAVA_HOME', 'JDK_HOME', 'JAVA_HOME_OVERRIDE', 'GRADLE_JAVA_HOME'];
/** The variable whose value is selected when it names a usable JDK. */
export const DEFAULT_JDK_VARIABLE = 'JAVA_HOME';
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
export function collectJdkVariables(env) {
    const explicit = new Set(EXPLICIT_VARIABLES.map(name => name.toUpperCase()));
    const found = [];
    for (const [variable, raw] of Object.entries(env)) {
        const upper = variable.toUpperCase();
        if (!explicit.has(upper) && !isJdkVariable(upper))
            continue;
        const home = raw?.trim();
        if (home === undefined || home === '')
            continue;
        found.push({ variable, home, rank: rankOf(upper) });
    }
    found.sort((left, right) => left.rank - right.rank || compareVariables(left.variable, right.variable));
    const seenHomes = new Set();
    const unique = [];
    for (const { variable, home } of found) {
        const key = home.toLowerCase();
        if (seenHomes.has(key))
            continue;
        seenHomes.add(key);
        unique.push({ variable, home });
    }
    return unique;
}
/**
 * Whether a variable name denotes a JDK installation rather than, say, the
 * `JAVA_TOOL_OPTIONS` launcher flags: after the `JAVA`/`JDK` prefix only a
 * version, a home marker, or both may follow.
 * @param upper - upper-cased variable name.
 * @returns true for names such as `JAVA_17`, `JDK_HOME`, or `JAVA_HOME_21`.
 */
function isJdkVariable(upper) {
    const prefix = JDK_VARIABLE.exec(upper);
    if (prefix === null)
        return false;
    return JDK_SUFFIX.test(upper.slice(prefix[0].length));
}
/**
 * Priority of one variable name: an exact `JAVA_HOME` beats `JDK_HOME` beats
 * every versioned alias, and versioned aliases sort numerically so `JAVA_8`
 * precedes `JAVA_17`.
 */
function rankOf(upper) {
    if (upper === 'JAVA_HOME')
        return 0;
    if (upper === 'JDK_HOME')
        return 1;
    return 2;
}
/** Compare variable names, ordering embedded numbers as numbers. */
function compareVariables(left, right) {
    const leftNumbers = left.match(/\d+/g) ?? [];
    const rightNumbers = right.match(/\d+/g) ?? [];
    for (let index = 0; index < Math.min(leftNumbers.length, rightNumbers.length); index += 1) {
        const difference = Number(leftNumbers[index]) - Number(rightNumbers[index]);
        if (difference !== 0)
            return difference;
    }
    if (leftNumbers.length !== rightNumbers.length)
        return leftNumbers.length - rightNumbers.length;
    return left.toUpperCase().localeCompare(right.toUpperCase());
}
/**
 * Read one `KEY="value"` entry from a JDK `release` file.
 * @param text - raw file content.
 * @param key - entry name, for example `JAVA_VERSION`.
 * @returns the unquoted value, or null when the entry is absent.
 */
export function readReleaseEntry(text, key) {
    for (const line of text.split(/\r?\n/)) {
        const prefix = `${key}=`;
        if (!line.startsWith(prefix))
            continue;
        const value = line.slice(prefix.length).trim().replace(/^"(.*)"$/, '$1');
        return value === '' ? null : value;
    }
    return null;
}
/**
 * Whether a JDK directory hosts an executable `java` for the given platform
 * naming convention.
 * @param home - candidate JDK directory.
 * @param isFile - filesystem probe.
 * @param names - executable names to try, in order.
 * @returns true when at least one expected executable exists.
 */
export function hasJavaExecutable(home, isFile, names = ['java', 'java.exe']) {
    return names.some(name => isFile(join(home, 'bin', name)));
}
/**
 * Mark the default candidate and drop entries whose variable repeats a home.
 * @param candidates - verified candidates, already in priority order.
 * @returns candidates carrying `isDefault`.
 */
export function markDefault(candidates) {
    return candidates.map((candidate, index) => ({ ...candidate, isDefault: index === 0 }));
}
