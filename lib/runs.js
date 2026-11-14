/**
 * Live Gradle invocations owned by this plugin.
 *
 * A run owns one spawned Gradle process and a bounded transcript of its
 * output. The panel attaches to the transcript over the plugin's HTTP stream,
 * so a dropped connection never kills the build and a re-attach replays what
 * it missed.
 */
import { randomUUID } from 'node:crypto';
import { StringDecoder } from 'node:string_decoder';
/** Transcript ceiling per run, in characters; older output is dropped first. */
const MAX_TRANSCRIPT_CHARS = 400_000;
/** How long a finished run stays available for a late attach, in milliseconds. */
const RETAIN_FINISHED_MS = 5 * 60 * 1000;
/** Owns every live run and their transcripts. */
export class RunRegistry {
    subprocess;
    runs = new Map();
    disposed = false;
    /** @param subprocess - process seam that spawns the builds. */
    constructor(subprocess) {
        this.subprocess = subprocess;
    }
    /**
     * Spawn one Gradle invocation and start collecting its output.
     * @param spec - argv, directory, environment, and the command line shown to the person.
     * @returns the new run identity.
     */
    start(spec) {
        if (this.disposed)
            throw new Error('gradle-tasks: the run registry is disposed');
        const id = randomUUID();
        const run = {
            id,
            displayCommand: spec.displayCommand,
            startedAt: Date.now(),
            listeners: new Set(),
            transcript: [],
            transcriptChars: 0,
            finished: false,
        };
        this.runs.set(id, run);
        let handle;
        try {
            handle = this.subprocess.spawn({
                argv: [...spec.argv],
                cwd: spec.cwd,
                stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
                graceMs: spec.graceMs,
                env: { ...spec.env },
            });
        }
        catch (error) {
            this.runs.delete(id);
            throw error;
        }
        run.handle = handle;
        this.pump(run, handle.stdout, 'stdout');
        this.pump(run, handle.stderr, 'stderr');
        handle.done.then(outcome => {
            this.finish(run, outcome.exitCode);
        }, (error) => {
            this.publish(run, { type: 'error', message: error instanceof Error ? error.message : String(error) });
            this.finish(run, null);
        });
        return id;
    }
    /**
     * Attach to a run's transcript and future output.
     * @param id - run identity.
     * @param listener - receives the backlog first, then live events.
     * @returns the detach callback, or undefined when no such run is retained.
     */
    subscribe(id, listener) {
        const run = this.runs.get(id);
        if (run === undefined)
            return undefined;
        for (const event of run.transcript)
            listener(event);
        if (run.finished)
            return () => { };
        run.listeners.add(listener);
        return () => { run.listeners.delete(listener); };
    }
    /**
     * Terminate a running build.
     * @param id - run identity.
     * @returns false when the run is unknown or already finished.
     */
    stop(id) {
        const run = this.runs.get(id);
        if (run === undefined || run.finished || run.handle === undefined)
            return false;
        run.handle.terminate();
        return true;
    }
    /**
     * Report the command line and start time of a retained run.
     * @param id - run identity.
     * @returns the description, or undefined when the run is gone.
     */
    describe(id) {
        const run = this.runs.get(id);
        if (run === undefined)
            return undefined;
        return { displayCommand: run.displayCommand, startedAt: run.startedAt, finished: run.finished };
    }
    /** Terminate every running build and forget every transcript. */
    dispose() {
        this.disposed = true;
        for (const run of this.runs.values()) {
            if (run.timer !== undefined)
                clearTimeout(run.timer);
            run.listeners.clear();
            if (!run.finished)
                run.handle?.terminate();
        }
        this.runs.clear();
    }
    /** Decode one piped stream into the transcript, splitting frames on characters, not bytes. */
    pump(run, stream, kind) {
        if (stream === undefined)
            return;
        const decoder = new StringDecoder('utf8');
        stream.on('data', (chunk) => {
            const text = typeof chunk === 'string' ? chunk : decoder.write(chunk);
            if (text !== '')
                this.publish(run, { type: 'chunk', stream: kind, text });
        });
        stream.on('end', () => {
            const rest = decoder.end();
            if (rest !== '')
                this.publish(run, { type: 'chunk', stream: kind, text: rest });
        });
        stream.on('error', (error) => {
            this.publish(run, { type: 'error', message: error instanceof Error ? error.message : String(error) });
        });
    }
    /** Append one event to the transcript and hand it to every listener. */
    publish(run, event) {
        run.transcript.push(event);
        if (event.type === 'chunk') {
            run.transcriptChars += event.text.length;
            while (run.transcriptChars > MAX_TRANSCRIPT_CHARS && run.transcript.length > 1) {
                const dropped = run.transcript.shift();
                if (dropped?.type === 'chunk')
                    run.transcriptChars -= dropped.text.length;
            }
        }
        for (const listener of [...run.listeners])
            listener(event);
    }
    /** Publish the exit event, release listeners, and schedule retention expiry. */
    finish(run, code) {
        if (run.finished)
            return;
        run.finished = true;
        this.publish(run, { type: 'exit', code, durationMs: Date.now() - run.startedAt });
        run.listeners.clear();
        run.timer = setTimeout(() => { this.runs.delete(run.id); }, RETAIN_FINISHED_MS);
        run.timer.unref();
    }
}
