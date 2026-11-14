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
  /** Value of `java.version` read from the JDK's `release` file, when readable. */
  readonly version: string | null
  /** Whether this candidate is the one selected by default (`JAVA_HOME`). */
  readonly isDefault: boolean
}

/** Answer to the panel's first request: what the directory is and which JDKs exist. */
export interface StateResponse {
  readonly ok: boolean
  /** Absolute directory the panel inspects. */
  readonly path: string
  /** Detected project, or null when the directory is not inside a Gradle build. */
  readonly project: GradleProjectInfo | null
  /** Every JDK found in the Host environment, best first. */
  readonly jdks: readonly JdkCandidate[]
  /** Host execution platform, so the panel can name the wrapper it will run. */
  readonly platform: 'posix' | 'windows'
  /** Present when the request itself failed; a non-Gradle directory is not an error. */
  readonly error?: string
}

/** Answer to a task-listing request. */
export interface TasksResponse {
  readonly ok: boolean
  readonly project: GradleProjectInfo | null
  /** Tasks bucketed by declared group, groups in display order. */
  readonly groups: readonly GradleTaskGroup[]
  /** Wall-clock time the Gradle invocation took, in milliseconds. */
  readonly durationMs: number
  /** Present when the invocation failed; the trailing output explains why. */
  readonly error?: string
  /** Tail of the Gradle output, always populated so a failure is diagnosable. */
  readonly output: string
}

/** Answer to a run request. */
export interface RunResponse {
  readonly ok: boolean
  readonly runId?: string
  readonly command?: string
  readonly error?: string
}

/** One line of the newline-delimited JSON stream a run publishes. */
export type RunEvent =
  | { readonly type: 'chunk'; readonly stream: 'stdout' | 'stderr'; readonly text: string }
  | { readonly type: 'exit'; readonly code: number | null; readonly durationMs: number }
  | { readonly type: 'error'; readonly message: string }
