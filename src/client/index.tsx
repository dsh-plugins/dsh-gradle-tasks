/**
 * Browser half of dsh-gradle-tasks.
 *
 * Two registrations make the page reachable: a `main` panel keyed by this
 * plugin's panel id, and the matching `sidebar.panellist` icon that selects it.
 * Everything else — detection, task listing, runs — happens over the Host
 * routes this plugin's Node half serves.
 */
import type { ClientContext, Disposer, LocaleRegistry } from './context.ts'
import { GradleTasksIcon } from './icon.tsx'
import { createTranslator } from './i18n.ts'
import { DICTIONARIES, NAMESPACE } from './locales.ts'
import { GradleTasksPanel, type GradleTasksPanelServices } from './panel.tsx'
import { STYLES } from './styles.ts'

export const name = 'dsh-gradle-tasks'

/** The browser services this plugin needs; the rest are read optionally. */
export const inject = ['slots']

/** Identity of this plugin's page, shared by the `main` panel and its icon. */
const PANEL_ID = 'gradle-tasks'

/** The sidebar service face used to remember which Session is on screen. */
interface SidebarRightFace {
  readonly mounted?: {
    getSnapshot(): string | undefined
    subscribe(listener: () => void): Disposer
  }
}

/** The workspace service face used to offer a native directory picker. */
interface UiWorkspaceFace {
  pickDirectory(): Promise<string | null>
}

/**
 * Mount the panel and its icon.
 * @param ctx - browser Context with the slot registry.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => installStyles(), 'gradle-tasks: styles')
  registerDictionaries(ctx)

  const translator = createTranslator(ctx)
  const sessions = trackSessions(ctx)
  ctx.effect(() => sessions.start(), 'gradle-tasks: session tracking')

  const workspace = ctx.get('uiWorkspace') as UiWorkspaceFace | undefined
  const services: GradleTasksPanelServices = {
    translator,
    currentSessionId: () => sessions.current(),
    ...workspace === undefined
      ? {}
      : { pickDirectory: () => workspace.pickDirectory() },
  }

  ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NAMESPACE,
    inject: () => services,
  }, GradleTasksPanel)), 'gradle-tasks: main panel')

  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 10,
    locale: NAMESPACE,
    label: () => translator.t('panel.title'),
  }, GradleTasksIcon)), 'gradle-tasks: panel icon')
}

/**
 * Attach the stylesheet, once per page, tagged so the Host can remove it when
 * this plugin unloads.
 * @returns the disposer removing the tag this call created.
 */
function installStyles(): Disposer {
  const id = `${name}/styles.css`
  const existing = document.querySelector(`style[data-plugin-css=${JSON.stringify(id)}]`)
  if (existing !== null) return () => { existing.remove() }
  const tag = document.createElement('style')
  tag.dataset.plugin = name
  tag.dataset.pluginCss = id
  tag.textContent = STYLES
  document.head.appendChild(tag)
  return () => { tag.remove() }
}

/**
 * Publish this plugin's copy through the Host locale service when it is
 * mounted. Without it the panel falls back to its own dictionary lookup.
 * @param ctx - browser Context.
 */
function registerDictionaries(ctx: ClientContext): void {
  const locale = ctx.get('locale') as LocaleRegistry | undefined
  if (locale === undefined) return
  ctx.effect(() => locale.register(NAMESPACE, DICTIONARIES), 'gradle-tasks: dictionaries')
}

/** Tracks the Session on screen even while this plugin's own panel is showing. */
interface SessionTracker {
  /** The Session to ask the Host about. */
  current(): string | undefined
  /** Begin observing selection changes. */
  start(): Disposer
}

/**
 * Follow the right Sidebar's on-screen Session.
 *
 * A global panel replaces the centre column, which clears the service's live
 * value, so the last Session seen is retained: a person who opens this page
 * from a Session still expects that Session's project.
 * @param ctx - browser Context.
 * @returns the tracker.
 */
function trackSessions(ctx: ClientContext): SessionTracker {
  const sidebar = ctx.get('sidebarRight') as SidebarRightFace | undefined
  const mounted = sidebar?.mounted
  let latest = mounted?.getSnapshot()
  return {
    current: () => {
      const live = mounted?.getSnapshot()
      if (live !== undefined) latest = live
      return latest
    },
    start: () => mounted?.subscribe(() => {
      const next = mounted.getSnapshot()
      if (next !== undefined) latest = next
    }) ?? (() => {}),
  }
}
