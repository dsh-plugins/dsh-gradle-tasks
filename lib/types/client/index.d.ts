/**
 * Browser half of dsh-gradle-tasks.
 *
 * The page is a right-Sidebar tab type: `sidebarRightTabs` carries its static
 * face — the kind, the chip title, and the guide card that opens it — and the
 * keyed `sidebar.right.pane.tab` seat carries its body. Detection, listing and
 * runs all happen over the HTTP routes this plugin's Host half serves.
 */
import type { ClientContext } from './context.ts';
export declare const name = "dsh-gradle-tasks";
/**
 * Browser services this plugin needs.
 *
 * `webTerminals` and `sidebarRight` are what turn a run into a visible terminal
 * tab; they are declared here rather than read optionally because without them
 * a task could run where nobody can see it.
 */
export declare const inject: string[];
/**
 * Mount the page: its tab type, its body, and its copy.
 * @param ctx - browser Context with the slot, tab-type, and terminal faces.
 */
export declare function apply(ctx: ClientContext): void;
