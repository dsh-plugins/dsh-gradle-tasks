/**
 * The browser end of this plugin's Host routes.
 *
 * Plain `fetch` against the plugin's own path prefix keeps the panel free of
 * generated Remote code; the browser's cookie travels with each same-origin
 * request, which is the same admission the shipped routes rely on.
 */
import {
  ROUTE_BASE,
  type FailureCode,
  type RunEvent,
  type RunResponse,
  type StateResponse,
  type TasksResponse,
} from '../shared/protocol.ts'

/** Where the panel is looking: a Session, an explicit directory, or both. */
export interface Locator {
  readonly sessionId?: string | undefined
  readonly path?: string | undefined
}

/** A failure that happened before the Host could answer, reported like any other. */
export class TransportFailure extends Error {
  readonly code: FailureCode = 'transport'

  constructor(readonly detail: string) {
    super(detail)
    this.name = 'TransportFailure'
  }
}

/** Read one JSON answer, turning a transport failure into a routable code. */
async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (error) {
    throw new TransportFailure(error instanceof Error ? error.message : String(error))
  }
  if (!response.ok) throw new TransportFailure(`${url} → HTTP ${response.status}`)
  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch {
    // A non-JSON body means the request reached something other than this route.
    throw new TransportFailure(`${url} → ${text.slice(0, 200)}`)
  }
}

/** Append the locator to a route URL. */
function locate(route: string, locator: Locator, extra?: Record<string, string>): string {
  const query = new URLSearchParams()
  if (locator.sessionId !== undefined && locator.sessionId !== '') query.set('sessionId', locator.sessionId)
  if (locator.path !== undefined && locator.path !== '') query.set('path', locator.path)
  for (const [key, value] of Object.entries(extra ?? {})) query.set(key, value)
  const suffix = query.toString()
  return suffix === '' ? `${ROUTE_BASE}${route}` : `${ROUTE_BASE}${route}?${suffix}`
}

/** Detect the project and enumerate JDKs. */
export function fetchState(locator: Locator): Promise<StateResponse> {
  return readJson<StateResponse>(locate('/state', locator))
}

/** Run Gradle's task report for the located project. */
export function fetchTasks(locator: Locator, javaHome: string | null): Promise<TasksResponse> {
  return readJson<TasksResponse>(locate('/tasks', locator, javaHome === null ? {} : { javaHome }))
}

/** Start one task run. */
export function startTaskRun(
  locator: Locator,
  taskPath: string,
  javaHome: string | null,
): Promise<RunResponse> {
  return readJson<RunResponse>(`${ROUTE_BASE}/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      taskPath,
      javaHome: javaHome ?? undefined,
      sessionId: locator.sessionId,
      path: locator.path,
    }),
  })
}

/** Ask the Host to terminate a run. */
export async function stopTaskRun(runId: string): Promise<boolean> {
  const answer = await readJson<{ ok: boolean }>(`${ROUTE_BASE}/run/stop`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ runId }),
  })
  return answer.ok
}

/**
 * Stream one run's events until the Host closes the stream.
 * @param runId - run to follow.
 * @param onEvent - receives each decoded event.
 * @param onError - receives a transport failure after the stream began.
 * @returns an abort function that detaches without stopping the build.
 */
export function streamTaskRun(
  runId: string,
  onEvent: (event: RunEvent) => void,
  onError: (error: Error) => void,
): () => void {
  const abort = new AbortController()
  void (async () => {
    try {
      const response = await fetch(`${ROUTE_BASE}/run/stream?id=${encodeURIComponent(runId)}`, {
        signal: abort.signal,
        headers: { accept: 'application/x-ndjson' },
      })
      if (response.body === null) throw new TransportFailure(`/run/stream → HTTP ${response.status}`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline = buffer.indexOf('\n')
        while (newline >= 0) {
          const line = buffer.slice(0, newline)
          buffer = buffer.slice(newline + 1)
          if (line !== '') onEvent(JSON.parse(line) as RunEvent)
          newline = buffer.indexOf('\n')
        }
      }
      if (buffer.trim() !== '') onEvent(JSON.parse(buffer) as RunEvent)
    } catch (error) {
      if (abort.signal.aborted) return
      onError(error instanceof Error ? error : new TransportFailure(String(error)))
    }
  })()
  return () => { abort.abort() }
}
