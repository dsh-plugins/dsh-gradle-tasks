/**
 * Browser half of dsh-gradle-tasks.
 *
 * Two registrations make the page reachable: a `main` panel keyed by this
 * plugin's panel id, and the matching `sidebar.panellist` icon that selects it.
 * Everything else — detection, task listing, runs — happens over the Host
 * routes this plugin's Node half serves.
 */
import type { ClientContext } from './context.ts';
export declare const name = "dsh-gradle-tasks";
/** The browser services this plugin needs; the rest are read optionally. */
export declare const inject: string[];
/**
 * Mount the panel and its icon.
 * @param ctx - browser Context with the slot registry.
 */
export declare function apply(ctx: ClientContext): void;
