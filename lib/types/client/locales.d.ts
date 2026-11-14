/**
 * This plugin's copy, in both languages the Host ships.
 *
 * Dictionaries are published through the Host locale service when it is
 * mounted, and read directly otherwise, so the panel is never blank because a
 * neighbouring plugin is absent.
 */
/** Copy namespace registered with the locale service. */
export declare const NAMESPACE = "gradleTasks";
declare const zh: {
    'panel.title': string;
    'panel.description': string;
    'panel.open': string;
    'toolbar.refresh': string;
    'toolbar.reloadTasks': string;
    'toolbar.pickDirectory': string;
    'toolbar.java': string;
    'toolbar.javaDefault': string;
    'toolbar.javaMissing': string;
    'toolbar.javaHint': string;
    'path.placeholder': string;
    'path.useSession': string;
    'status.notGradle': string;
    'status.noProject': string;
    'status.scanning': string;
    'status.scanned': string;
    'status.failed': string;
    'status.wrapper': string;
    'status.noWrapper': string;
    'tasks.filter': string;
    'tasks.empty': string;
    'tasks.ungrouped': string;
    'tasks.runHint': string;
    'run.idle': string;
    'run.running': string;
    'run.succeeded': string;
    'run.failed': string;
    'run.stopped': string;
    'run.stop': string;
    'run.clear': string;
    'run.elapsed': string;
    'run.task': string;
    'error.noSession': string;
};
/** Every language this plugin ships, keyed the way the locale service expects. */
export declare const DICTIONARIES: Record<string, Record<string, string>>;
/** One copy key. */
export type CopyKey = keyof typeof zh;
/** Substitute `{name}` placeholders in one template. */
export declare function format(template: string, values: Record<string, string | number>): string;
export {};
