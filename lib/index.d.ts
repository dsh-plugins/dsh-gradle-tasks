import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-gradle-tasks";
/** Host services this plugin reads: routes, peer vetting, processes, and Session directories. */
export declare const inject: string[];
/**
 * Mount the routes and the run registry.
 * @param ctx - Host Context with the declared services.
 */
export declare function apply(ctx: Context): void;
