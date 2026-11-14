/**
 * The Gradle Tasks page: a project header with the JDK selector, the task
 * folders on the left, and the build terminal on the right.
 *
 * The panel owns no Gradle knowledge of its own — it asks the Host what the
 * project is and which tasks it declares, and streams one run at a time.
 */
import * as React from 'react';
import type { Translator } from './i18n.ts';
/** Services the panel is registered with. */
export interface GradleTasksPanelServices {
    /** Copy bound to the Host language. */
    readonly translator: Translator;
    /** The Session most recently shown on screen, tracked across panel switches. */
    readonly currentSessionId: () => string | undefined;
    /** Host directory picker, when the surrounding UI provides one. */
    readonly pickDirectory?: (() => Promise<string | null>) | undefined;
}
/**
 * The Gradle Tasks page component.
 * @param props - injected services described by {@link GradleTasksPanelServices}.
 * @returns the rendered page.
 */
export declare function GradleTasksPanel(props: GradleTasksPanelServices): React.ReactElement;
