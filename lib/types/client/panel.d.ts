/**
 * The Gradle Tasks page: the project header with the JDK selector, the task
 * folders, and the build terminal, stacked for the right Sidebar's narrow
 * column.
 *
 * The panel owns no Gradle knowledge of its own — it asks the Host what the
 * project is and which tasks it declares, and streams one run at a time.
 */
import * as React from 'react';
import type { Translator } from './i18n.ts';
/** Props the tab seat injects for one occurrence. */
export interface GradleTasksPanelProps {
    /** Session whose directory the page inspects by default. */
    readonly sessionId: string;
    /** Copy bound to the Host language. */
    readonly translator: Translator;
    /** Host directory picker, when the surrounding UI provides one. */
    readonly pickDirectory?: (() => Promise<string | null>) | undefined;
}
/**
 * The Gradle Tasks page component.
 * @param props - injected services described by {@link GradleTasksPanelProps}.
 * @returns the rendered page.
 */
export declare function GradleTasksPanel(props: GradleTasksPanelProps): React.ReactElement;
