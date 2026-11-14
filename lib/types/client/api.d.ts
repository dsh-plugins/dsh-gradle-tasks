/**
 * The browser end of this plugin's Host routes.
 *
 * Plain `fetch` against the plugin's own path prefix keeps the panel free of
 * generated Remote code; the browser's cookie travels with each same-origin
 * request, which is the same admission the shipped routes rely on.
 */
import { type FailureCode, type RunResponse, type StateResponse, type TasksResponse } from '../shared/protocol.ts';
/** A failure that happened before the Host could answer, reported like any other. */
export declare class TransportFailure extends Error {
    readonly detail: string;
    readonly code: FailureCode;
    constructor(detail: string);
}
/** What the panel asks about: one Session, and the options for this request. */
export interface SessionQuery {
    readonly sessionId: string;
    /** Build root the request is about; the Host resolves it against the Session's own workspace. */
    readonly project?: string | null;
    readonly javaHome?: string | null;
    /** Add `--offline` to the Gradle invocation. */
    readonly offline?: boolean;
    /** Ignore the project's task cache and configure the build again. */
    readonly force?: boolean;
}
/** Detect the project and enumerate JDKs. */
export declare function fetchState(sessionId: string): Promise<StateResponse>;
/** Run Gradle's task report for the Session's project. */
export declare function fetchTasks(query: SessionQuery): Promise<TasksResponse>;
/**
 * Type one task into the Session's terminal.
 * @param query - the Session, the build root, the JDK, and the offline choice.
 * @param taskPath - fully qualified task to run.
 * @param openTerminalIds - terminals the window currently shows, so a run can
 *   continue in the one this plugin already opened instead of opening another.
 */
export declare function startTaskRun(query: SessionQuery, taskPath: string, openTerminalIds: readonly string[]): Promise<RunResponse>;
