/**
 * Wire vocabulary shared by the Host routes and the browser panel: the base
 * path of this plugin's HTTP surface and the JSON shapes both halves agree on.
 * The module holds no runtime behavior beyond constants, so the client bundle
 * inlines it without pulling Host-only code into the browser.
 */
/** Prefix every route of this plugin is registered under. */
export const ROUTE_BASE = '/gradle-tasks';
