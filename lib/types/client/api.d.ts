/**
 * The browser end of this plugin's Host routes.
 *
 * Plain `fetch` against the plugin's own path prefix keeps the panel free of
 * generated Remote code; the browser's cookie travels with each same-origin
 * request, which is the same admission the shipped routes rely on.
 */
import { type RunEvent, type RunResponse, type StateResponse, type TasksResponse } from '../shared/protocol.ts';
/** Where the panel is looking: a Session, an explicit directory, or both. */
export interface Locator {
    readonly sessionId?: string | undefined;
    readonly path?: string | undefined;
}
/** Detect the project and enumerate JDKs. */
export declare function fetchState(locator: Locator): Promise<StateResponse>;
/** Run Gradle's task report for the located project. */
export declare function fetchTasks(locator: Locator, javaHome: string | null): Promise<TasksResponse>;
/** Start one task run. */
export declare function startTaskRun(locator: Locator, taskPath: string, javaHome: string | null): Promise<RunResponse>;
/** Ask the Host to terminate a run. */
export declare function stopTaskRun(runId: string): Promise<boolean>;
/**
 * Stream one run's events until the Host closes the stream.
 * @param runId - run to follow.
 * @param onEvent - receives each decoded event.
 * @param onError - receives a transport failure after the stream began.
 * @returns an abort function that detaches without stopping the build.
 */
export declare function streamTaskRun(runId: string, onEvent: (event: RunEvent) => void, onError: (error: Error) => void): () => void;
