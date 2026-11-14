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

/** Browser services this plugin needs: the slot registry and the tab-type registry. */
export const inject = ['slots', 'sidebarRightTabs']

/** Identity of this tab type in the Sidebar's registry, and the key its body registers under. */
const TAB_ID = 'dsh-gradle-tasks'

/** The tab kind callers name when opening the page. */
const TAB_KIND = 'gradle-tasks'

/** The guide card that opens this page. */
const GUIDE_ENTRY_ID = 'gradle-tasks'

/** The workspace service face used to offer the Host's directory picker. */
interface UiWorkspaceFace {
  pickDirectory(): Promise<string | null>
}

/**
 * Mount the page: its tab type, its body, and its copy.
 * @param ctx - browser Context with the slot and tab-type registries.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => installStyles(), 'gradle-tasks: styles')
  registerDictionaries(ctx)

  const translator = createTranslator(ctx)
  const workspace = ctx.get('uiWorkspace') as UiWorkspaceFace | undefined

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
      ...workspace === undefined ? {} : { pickDirectory: () => workspace.pickDirectory() },
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
