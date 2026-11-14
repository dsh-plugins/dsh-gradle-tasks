/**
 * The slice of the browser Cordis context this client plugin consumes.
 *
 * The interfaces are declared locally instead of imported from the shipped UI
 * packages: a client plugin is compiled into `window.__ModuleLoader__` and must
 * not carry a value dependency on packages the Host owns, and these are the
 * only members used here.
 */

/** A disposer returned by every registration. */
export type Disposer = () => void

/** One slot registration. */
export interface SlotRegistrationOptions {
  readonly [key: string]: unknown
}

/** The slot registry as this plugin uses it. */
export interface SlotRegistry {
  inject(key: string, callback: () => Disposer): Disposer
  register(options: SlotRegistrationOptions, component: unknown): Disposer
}

/** One entry box the right Sidebar's guide page offers. */
export interface GuideEntry {
  readonly id: string
  readonly order: number
  readonly title: () => string
  readonly description?: () => string
  readonly icon?: unknown
}

/** One right-Sidebar tab type: its identity, its guide box, and its chip title. */
export interface TabTypeDefinition {
  readonly id: string
  readonly kind: string
  readonly multiple?: boolean
  readonly keepMounted?: boolean
  readonly priority?: 'extension' | 'builtin' | 'fallback'
  readonly title: () => string
  readonly guide?: readonly GuideEntry[]
}

/** The right Sidebar's tab-type registry, stage one of a tab type's registration. */
export interface TabTypeRegistry {
  register(definition: TabTypeDefinition): Disposer
}

/** Locale registry members used to publish this plugin's dictionaries. */
export interface LocaleRegistry {
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): Disposer
  getSnapshot?(): { readonly active?: string } | undefined
  getLocale?(): { readonly active?: string } | undefined
  subscribe?(listener: () => void): Disposer
}

/** Browser context members this plugin requires. */
export interface ClientContext {
  effect(callback: () => Disposer | void, label?: string): Disposer
  inject(dependencies: readonly string[], callback: (ctx: ClientContext) => void): Disposer
  get(name: string): unknown
  readonly slots: SlotRegistry
  readonly sidebarRightTabs: TabTypeRegistry
}
