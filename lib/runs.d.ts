import type { Readable } from 'node:stream';
import type { RunEvent } from './shared/protocol.ts';
/**
 * The part of a subprocess handle this plugin uses. Declared locally so the
 * plugin depends on the seam's documented behavior rather than on a package
 * version, exactly as the seam's own contract describes it.
 */
export interface SpawnedProcess {
    readonly stdout: Readable | undefined;
    readonly stderr: Readable | undefined;
    readonly done: Promise<{
        readonly exitCode: number | null;
    }>;
    terminate(): void;
}
/** The process seam members this registry calls. */
export interface SubprocessFace {
    spawn(spec: {
        argv: readonly string[];
        cwd: string;
        stdio: {
            stdin: 'ignore';
            stdout: 'pipe';
            stderr: 'pipe';
        };
        graceMs: number;
        env?: Readonly<Record<string, string>>;
    }): SpawnedProcess;
}
/** A run's subscriber; receives every event from the point of subscription. */
export type RunListener = (event: RunEvent) => void;
/** What the Host hands the registry to start one Gradle invocation. */
export interface RunSpec {
    readonly argv: readonly string[];
    readonly cwd: string;
    readonly env: Readonly<Record<string, string>>;
    readonly graceMs: number;
}
/** Owns every live run and their transcripts. */
export declare class RunRegistry {
    private readonly subprocess;
    private readonly runs;
    private disposed;
    /** @param subprocess - process seam that spawns the builds. */
    constructor(subprocess: SubprocessFace);
    /**
     * Spawn one Gradle invocation and start collecting its output.
     * @param spec - argv, directory, environment, and the command line shown to the person.
     * @returns the new run identity.
     */
    start(spec: RunSpec): string;
    /**
     * Attach to a run's transcript and future output.
     * @param id - run identity.
     * @param listener - receives the backlog first, then live events.
     * @returns the detach callback, or undefined when no such run is retained.
     */
    subscribe(id: string, listener: RunListener): (() => void) | undefined;
    /**
     * Terminate a running build.
     * @param id - run identity.
     * @returns false when the run is unknown or already finished.
     */
    stop(id: string): boolean;
    /**
     * Whether a run is retained, so a stream can be opened for it.
     * @param id - run identity.
     * @returns true while the transcript is available.
     */
    has(id: string): boolean;
    /** Terminate every running build and forget every transcript. */
    dispose(): void;
    /** Decode one piped stream into the transcript, splitting frames on characters, not bytes. */
    private pump;
    /** Append one event to the transcript and hand it to every listener. */
    private publish;
    /** Publish the exit event, release listeners, and schedule retention expiry. */
    private finish;
}
