/**
 * This plugin's copy, in both languages the Host ships.
 *
 * Dictionaries are published through the Host locale service when it is
 * mounted, and read directly otherwise, so the panel is never blank because a
 * neighbouring plugin is absent.
 */
import type { FailureCode } from '../shared/protocol.ts';
/** Copy namespace registered with the locale service. */
export declare const NAMESPACE = "gradleTasks";
declare const zh: {
    'panel.title': string;
    'panel.description': string;
    'toolbar.reloadTasks': string;
    'toolbar.pickDirectory': string;
    'toolbar.java': string;
    'toolbar.javaMissing': string;
    'toolbar.javaHint': string;
    'path.placeholder': string;
    'status.noProject': string;
    'status.scanning': string;
    'status.scanned': string;
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
    'fail.no-session': string;
    'fail.session-inactive': string;
    'fail.directory-missing': string;
    'fail.directory-relative': string;
    'fail.not-gradle': string;
    'fail.wrapper-mismatch': string;
    'fail.gradle-missing': string;
    'fail.scan-failed': string;
    'fail.scan-timeout': string;
    'fail.no-report': string;
    'fail.java-invalid': string;
    'fail.task-missing': string;
    'fail.field-missing': string;
    'fail.body-invalid': string;
    'fail.body-too-large': string;
    'fail.run-not-found': string;
    'fail.transport': string;
};
/** Every language this plugin ships, keyed the way the locale service expects. */
export declare const DICTIONARIES: Record<string, Record<string, string>>;
/** One copy key. */
export type CopyKey = keyof typeof zh;
/**
 * Copy key for each failure code the Host can report.
 *
 * Spelled out rather than built as `` `fail.${code}` `` so a code added to the
 * protocol without copy is a type error instead of a panel showing a raw key.
 */
export declare const FAILURE_COPY: Record<FailureCode, CopyKey>;
/** Substitute `{name}` placeholders in one template. */
export declare function format(template: string, values: Record<string, string | number>): string;
export {};
