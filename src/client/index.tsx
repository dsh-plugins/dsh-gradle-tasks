/**
 * Browser half of dsh-gradle-tasks.
 *
 * The page is a right-Sidebar tab type: `sidebarRightTabs` carries its static
 * face — the kind, the chip title, and the guide card that opens it — and the
 * keyed `sidebar.right.pane.tab` seat carries its body. Detection, listing and
 * runs all happen over the HTTP routes this plugin's Host half serves.
 */
import type { ClientContext, Disposer, LocaleRegistry } from './context.ts'
import { GradleTasksIcon } from './icon.tsx'
import { createTranslator } from './i18n.ts'
import { DICTIONARIES, NAMESPACE } from './locales.ts'
import { GradleTasksPanel, type GradleTasksPanelProps } from './panel.tsx'
import { STYLES } from './styles.ts'

export const name = 'dsh-gradle-tasks'

/**
 * Browser services this plugin needs.
 *
 * `webTerminals` and `sidebarRight` are what turn a run into a visible terminal
 * tab; they are declared here rather than read optionally because without them
 * a task could run where nobody can see it.
 */
export const inject = ['slots', 'sidebarRightTabs', 'sidebarRight', 'webTerminals']

/** Identity of this tab type in the Sidebar's registry, and the key its body registers under. */
const TAB_ID = 'dsh-gradle-tasks'

/** The tab kind callers name when opening the page. */
const TAB_KIND = 'gradle-tasks'

/** The guide card that opens this page. */
const GUIDE_ENTRY_ID = 'gradle-tasks'

/** The Sidebar face used to reveal a terminal tab. */
interface SidebarFace {
  tabsIn(sessionId: string): readonly { readonly id: string, readonly contentId: string, readonly kind: string }[]
  openTabIn(sessionId: string, kind: string, options: { readonly params?: unknown }): void
  focus(tabId: string): void
}

/** The terminal model face used to map a tab to the terminal it shows. */
interface TerminalsFace {
  boundTerminal(sessionId: string, contentId: string): string | undefined
}

/**
 * Mount the page: its tab type, its body, and its copy.
 * @param ctx - browser Context with the slot, tab-type, and terminal faces.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => installStyles(), 'gradle-tasks: styles')
  registerDictionaries(ctx)

  const translator = createTranslator(ctx)
  const sidebar = ctx.sidebarRight
  const terminals = ctx.webTerminals

  /** Terminal identities this Session currently shows as tabs. */
  const openTerminalIds = (sessionId: string): readonly string[] =>
    sidebar.tabsIn(sessionId).flatMap((tab) => {
      if (tab.kind !== 'terminal') return []
      const id = terminals.boundTerminal(sessionId, tab.contentId)
      return id === undefined ? [] : [id]
    })

  /**
   * Bring a terminal's tab to the front, opening it when it is not there yet.
   *
   * The terminal panel also opens a tab by itself for a terminal an Agent
   * creates, so the tab this opens is bound to the terminal straight away: an
   * unbound tab is invisible to that check, and the panel would open a second
   * tab for the same terminal.
   * @param sessionId - Session the run belongs to.
   * @param terminalId - the terminal the command went to.
   */
  const revealTerminal = (sessionId: string, terminalId: string): void => {
    const shown = sidebar.tabsIn(sessionId).find(tab =>
      tab.kind === 'terminal' && terminals.boundTerminal(sessionId, tab.contentId) === terminalId)
    if (shown !== undefined) {
      sidebar.focus(shown.id)
      return
    }
    const before = new Set(sidebar.tabsIn(sessionId).map(tab => tab.id))
    sidebar.openTabIn(sessionId, 'terminal', { params: { terminalId } })
    const opened = sidebar.tabsIn(sessionId).find(tab => tab.kind === 'terminal' && !before.has(tab.id))
    if (opened === undefined) {
      console.warn(`gradle-tasks: the terminal tab for ${terminalId} did not open`)
      return
    }
    terminals.bind(sessionId, opened.contentId, terminalId)
  }

  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: TAB_ID,
    kind: TAB_KIND,
    priority: 'extension',
    title: () => translator.t('panel.title'),
    guide: [{
      id: GUIDE_ENTRY_ID,
      order: 30,
      title: () => translator.t('panel.title'),
      description: () => translator.t('panel.description'),
      icon: GradleTasksIcon,
    }],
  }), 'gradle-tasks: tab type')

  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab',
    key: TAB_ID,
    inject: (sessionId: string): GradleTasksPanelProps => ({
      sessionId,
      translator,
      openTerminalIds: () => openTerminalIds(sessionId),
      revealTerminal: (terminalId) => { revealTerminal(sessionId, terminalId) },
    }),
  }, GradleTasksPanel)), 'gradle-tasks: tab body')
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
