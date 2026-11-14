/**
 * Wire vocabulary shared by the Host routes and the browser panel: the base
 * path of this plugin's HTTP surface and the JSON shapes both halves agree on.
 * The module holds no runtime behavior beyond constants, so the client bundle
 * inlines it without pulling Host-only code into the browser.
 */

/** Prefix every route of this plugin is registered under. */
export const ROUTE_BASE = '/gradle-tasks'

/** One task as Gradle reported it during the initialization-script dump. */
export interface GradleTask {
  /** Fully qualified task path, such as `:app:build`. */
  readonly path: string
  /** The Gradle project path the task belongs to, derived from `path`. */
  readonly project: string
  /** The `group` the task declared, or an empty string when it declared none. */
  readonly group: string
  /** The `description` the task declared, or an empty string when it declared none. */
  readonly description: string
}

/** Tasks bucketed by their declared group, ready to render as folders. */
export interface GradleTaskGroup {
  /** Group name; an empty string is the bucket for tasks that declared no group. */
  readonly group: string
  readonly tasks: readonly GradleTask[]
}

/** A Gradle project detected from a directory. */
export interface GradleProjectInfo {
  /** Directory holding the settings script, or the build script when no settings script exists. */
  readonly rootDir: string
  /** Build and settings script file names found in `rootDir`. */
  readonly buildFiles: readonly string[]
  /** Wrapper script name relative to `rootDir`, or null when the project ships no wrapper. */
  readonly wrapper: string | null
  /** `distributionUrl` from `gradle/wrapper/gradle-wrapper.properties`, when declared. */
  readonly wrapperDistribution: string | null
}

/** One JDK discovered from the Host environment. */
export interface JdkCandidate {
  /** Environment variable the JDK was read from, such as `JAVA_HOME` or `JAVA_21`. */
  readonly variable: string
  /** JDK installation directory, always with a `bin/java` executable inside it. */
  readonly home: string
  /** Value of `JAVA_VERSION` read from the JDK's `release` file, when readable. */
  readonly version: string | null
  /** Whether this candidate is the one selected by default (`JAVA_HOME`). */
  readonly isDefault: boolean
}

/**
 * Why a request could not be answered.
 *
 * The Host reports the cause as one of these codes and the panel renders it in
 * the active language, so a message never has to be written twice and a single
 * failure never reads in the wrong language.
 */
export type FailureCode =
  | 'no-session'
  | 'session-inactive'
  | 'directory-missing'
  | 'directory-relative'
  | 'not-gradle'
  | 'wrapper-mismatch'
  | 'gradle-missing'
  | 'scan-failed'
  | 'scan-timeout'
  | 'no-report'
  | 'java-invalid'
  | 'task-missing'
  | 'field-missing'
  | 'body-invalid'
  | 'body-too-large'
  | 'run-not-found'
  | 'transport'

/** Fields every failing answer carries. */
export interface FailureShape {
  readonly ok: false
  /** Machine-readable cause, rendered by the panel in the active language. */
  readonly error: FailureCode
  /** Path, environment variable, or exit code the message should quote. */
  readonly detail?: string
}

/** Answer to the panel's first request: what the directory is and which JDKs exist. */
export type StateResponse = {
  readonly ok: true
  /** Absolute directory the panel inspects. */
  readonly path: string
  /** Detected project, or null when the directory is not inside a Gradle build. */
  readonly project: GradleProjectInfo | null
  /** Every JDK found in the Host environment, best first. */
  readonly jdks: readonly JdkCandidate[]
  /** Host execution platform, so the panel can name the wrapper it will run. */
  readonly platform: 'posix' | 'windows'
} | FailureShape

/** Answer to a task-listing request. */
export type TasksResponse = {
  readonly ok: true
  readonly project: GradleProjectInfo
  /** Tasks bucketed by declared group, groups in display order. */
  readonly groups: readonly GradleTaskGroup[]
  /** How long producing this list took; a cache hit reports the original scan. */
  readonly durationMs: number
  /** Tail of the Gradle output, empty for a cache hit. */
  readonly output: string
  /** True when the list came from the project's cache instead of a Gradle run. */
  readonly cached: boolean
  /** When the list's scan finished, as epoch milliseconds. */
  readonly scannedAt: number
} | (FailureShape & {
  /** Project identified before the failure, when detection got that far. */
  readonly project?: GradleProjectInfo
  /** Tail of the Gradle output; present when a scan actually ran. */
  readonly output?: string
  readonly durationMs?: number
})

/** Answer to a run request. */
export type RunResponse = {
  readonly ok: true
  readonly runId: string
  /** Command line the Host executed, shown above the terminal. */
  readonly command: string
} | FailureShape

/** One line of the newline-delimited JSON stream a run publishes. */
export type RunEvent =
  | { readonly type: 'chunk'; readonly stream: 'stdout' | 'stderr'; readonly text: string }
  | { readonly type: 'exit'; readonly code: number | null; readonly durationMs: number }
  | { readonly type: 'error'; readonly message: string }
