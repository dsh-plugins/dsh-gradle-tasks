import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-gradle-tasks";
/** Host services this plugin reads. */
export declare const inject: string[];
/**
 * Mount the routes.
 * @param ctx - Host Context with the declared services.
 */
export declare function apply(ctx: Context): void;
