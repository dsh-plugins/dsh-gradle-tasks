/**
 * Live Gradle invocations owned by this plugin.
 *
 * A run owns one spawned Gradle process and a bounded transcript of its
 * output. The panel attaches to the transcript over the plugin's HTTP stream,
 * so a dropped connection never kills the build and a re-attach replays what
 * it missed.
 */
import { randomUUID } from 'node:crypto'
import { StringDecoder } from 'node:string_decoder'
import type { Readable } from 'node:stream'
import type { RunEvent } from './shared/protocol.ts'

/**
 * The part of a subprocess handle this plugin uses. Declared locally so the
 * plugin depends on the seam's documented behavior rather than on a package
 * version, exactly as the seam's own contract describes it.
 */
export interface SpawnedProcess {
  readonly stdout: Readable | undefined
  readonly stderr: Readable | undefined
  readonly done: Promise<{ readonly exitCode: number | null }>
  terminate(): void
}

/** The process seam members this registry calls. */
export interface SubprocessFace {
  spawn(spec: {
    argv: readonly string[]
    cwd: string
    stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' }
    graceMs: number
    env?: Readonly<Record<string, string>>
  }): SpawnedProcess
}

/** Transcript ceiling per run, in characters; older output is dropped first. */
const MAX_TRANSCRIPT_CHARS = 400_000

/** How long a finished run stays available for a late attach, in milliseconds. */
const RETAIN_FINISHED_MS = 5 * 60 * 1000

/** A run's subscriber; receives every event from the point of subscription. */
export type RunListener = (event: RunEvent) => void

/** One owned Gradle process and its transcript. */
interface Run {
  readonly id: string
  readonly startedAt: number
  readonly listeners: Set<RunListener>
  transcript: RunEvent[]
  transcriptChars: number
  finished: boolean
  timer?: NodeJS.Timeout
  handle?: SpawnedProcess
}

/** What the Host hands the registry to start one Gradle invocation. */
export interface RunSpec {
  readonly argv: readonly string[]
  readonly cwd: string
  readonly env: Readonly<Record<string, string>>
  readonly graceMs: number
}

/** Owns every live run and their transcripts. */
export class RunRegistry {
  private readonly runs = new Map<string, Run>()
  private disposed = false

  /** @param subprocess - process seam that spawns the builds. */
  constructor(private readonly subprocess: SubprocessFace) {}

  /**
   * Spawn one Gradle invocation and start collecting its output.
   * @param spec - argv, directory, environment, and the command line shown to the person.
   * @returns the new run identity.
   */
  start(spec: RunSpec): string {
    if (this.disposed) throw new Error('gradle-tasks: the run registry is disposed')
    const id = randomUUID()
    const run: Run = {
      id,
      startedAt: Date.now(),
      listeners: new Set(),
      transcript: [],
      transcriptChars: 0,
      finished: false,
    }
    this.runs.set(id, run)
    let handle: SpawnedProcess
    try {
      handle = this.subprocess.spawn({
        argv: [...spec.argv],
        cwd: spec.cwd,
        stdio: { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
        graceMs: spec.graceMs,
        env: { ...spec.env },
      })
    } catch (error) {
      this.runs.delete(id)
      throw error
    }
    run.handle = handle
    this.pump(run, handle.stdout, 'stdout')
    this.pump(run, handle.stderr, 'stderr')
    handle.done.then(outcome => {
      this.finish(run, outcome.exitCode)
    }, (error: unknown) => {
      this.publish(run, { type: 'error', message: error instanceof Error ? error.message : String(error) })
      this.finish(run, null)
    })
    return id
  }

  /**
   * Attach to a run's transcript and future output.
   * @param id - run identity.
   * @param listener - receives the backlog first, then live events.
   * @returns the detach callback, or undefined when no such run is retained.
   */
  subscribe(id: string, listener: RunListener): (() => void) | undefined {
    const run = this.runs.get(id)
    if (run === undefined) return undefined
    for (const event of run.transcript) listener(event)
    if (run.finished) return () => {}
    run.listeners.add(listener)
    return () => { run.listeners.delete(listener) }
  }

  /**
   * Terminate a running build.
   * @param id - run identity.
   * @returns false when the run is unknown or already finished.
   */
  stop(id: string): boolean {
    const run = this.runs.get(id)
    if (run === undefined || run.finished || run.handle === undefined) return false
    run.handle.terminate()
    return true
  }

  /**
   * Whether a run is retained, so a stream can be opened for it.
   * @param id - run identity.
   * @returns true while the transcript is available.
   */
  has(id: string): boolean {
    return this.runs.has(id)
  }

  /** Terminate every running build and forget every transcript. */
  dispose(): void {
    this.disposed = true
    for (const run of this.runs.values()) {
      if (run.timer !== undefined) clearTimeout(run.timer)
      run.listeners.clear()
      if (!run.finished) run.handle?.terminate()
    }
    this.runs.clear()
  }

  /** Decode one piped stream into the transcript, splitting frames on characters, not bytes. */
  private pump(run: Run, stream: Readable | undefined, kind: 'stdout' | 'stderr'): void {
    if (stream === undefined) return
    const decoder = new StringDecoder('utf8')
    stream.on('data', (chunk: Buffer | string) => {
      const text = typeof chunk === 'string' ? chunk : decoder.write(chunk)
      if (text !== '') this.publish(run, { type: 'chunk', stream: kind, text })
    })
    stream.on('end', () => {
      const rest = decoder.end()
      if (rest !== '') this.publish(run, { type: 'chunk', stream: kind, text: rest })
    })
    stream.on('error', (error: unknown) => {
      this.publish(run, { type: 'error', message: error instanceof Error ? error.message : String(error) })
    })
  }

  /** Append one event to the transcript and hand it to every listener. */
  private publish(run: Run, event: RunEvent): void {
    run.transcript.push(event)
    if (event.type === 'chunk') {
      run.transcriptChars += event.text.length
      while (run.transcriptChars > MAX_TRANSCRIPT_CHARS && run.transcript.length > 1) {
        const dropped = run.transcript.shift()
        if (dropped?.type === 'chunk') run.transcriptChars -= dropped.text.length
      }
    }
    for (const listener of [...run.listeners]) listener(event)
  }

  /** Publish the exit event, release listeners, and schedule retention expiry. */
  private finish(run: Run, code: number | null): void {
    if (run.finished) return
    run.finished = true
    this.publish(run, { type: 'exit', code, durationMs: Date.now() - run.startedAt })
    run.listeners.clear()
    run.timer = setTimeout(() => { this.runs.delete(run.id) }, RETAIN_FINISHED_MS)
    run.timer.unref()
  }
}
