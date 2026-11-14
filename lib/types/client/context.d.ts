/**
 * The slice of the browser Cordis context this client plugin consumes.
 *
 * The interface is declared locally instead of imported from the shipped UI
 * packages: a client plugin is compiled into `window.__ModuleLoader__` and
 * must not carry a value dependency on packages the Host owns, and these are
 * the only members used here.
 */
/** A disposer returned by every registration. */
export type Disposer = () => void;
/** One slot registration. */
export interface SlotRegistrationOptions {
    readonly [key: string]: unknown;
}
/** The slot registry as this plugin uses it. */
export interface SlotRegistry {
    inject(key: string, callback: () => Disposer): Disposer;
    register(options: SlotRegistrationOptions, component: unknown): Disposer;
}
/** Locale registry members used to publish this plugin's dictionaries. */
export interface LocaleRegistry {
    register(namespace: string, dictionaries: Record<string, Record<string, string>>): Disposer;
    getSnapshot?(): {
        readonly active?: string;
    } | undefined;
    subscribe?(listener: () => void): Disposer;
}
/** Browser context members this plugin requires. */
export interface ClientContext {
    effect(callback: () => Disposer | void, label?: string): Disposer;
    inject(dependencies: readonly string[], callback: (ctx: ClientContext) => void): Disposer;
    get(name: string): unknown;
    readonly slots: SlotRegistry;
}
