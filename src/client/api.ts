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
  type RunResponse,
  type StateResponse,
  type TasksResponse,
} from '../shared/protocol.ts'

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

/** What the panel asks about: one Session, and the options for this request. */
export interface SessionQuery {
  readonly sessionId: string
  /** Build root the request is about; the Host resolves it against the Session's own workspace. */
  readonly project?: string | null
  readonly javaHome?: string | null
  /** Add `--offline` to the Gradle invocation. */
  readonly offline?: boolean
  /** Ignore the project's task cache and configure the build again. */
  readonly force?: boolean
}

/** Build a route URL from the query's present fields. */
function url(route: string, query: SessionQuery): string {
  const params = new URLSearchParams({ sessionId: query.sessionId })
  if (query.project !== null && query.project !== undefined) params.set('project', query.project)
  if (query.javaHome !== null && query.javaHome !== undefined) params.set('javaHome', query.javaHome)
  if (query.offline === true) params.set('offline', '1')
  if (query.force === true) params.set('force', '1')
  return `${ROUTE_BASE}${route}?${params.toString()}`
}

/** Detect the project and enumerate JDKs. */
export function fetchState(sessionId: string): Promise<StateResponse> {
  return readJson<StateResponse>(url('/state', { sessionId }))
}

/** Run Gradle's task report for the Session's project. */
export function fetchTasks(query: SessionQuery): Promise<TasksResponse> {
  return readJson<TasksResponse>(url('/tasks', query))
}

/**
 * Type one task into the Session's terminal.
 * @param query - the Session, the build root, the JDK, and the offline choice.
 * @param taskPath - fully qualified task to run.
 * @param openTerminalIds - terminals the window currently shows, so a run can
 *   continue in the one this plugin already opened instead of opening another.
 */
export function startTaskRun(
  query: SessionQuery,
  taskPath: string,
  openTerminalIds: readonly string[],
): Promise<RunResponse> {
  return readJson<RunResponse>(`${ROUTE_BASE}/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sessionId: query.sessionId,
      project: query.project ?? undefined,
      taskPath,
      javaHome: query.javaHome ?? undefined,
      offline: query.offline === true,
      openTerminalIds: [...openTerminalIds],
    }),
  })
}
