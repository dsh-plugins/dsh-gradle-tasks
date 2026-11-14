/**
 * The Gradle Tasks page: the JDK selector and two icon controls, the task
 * folders, and one line describing what the last run did.
 *
 * The panel shows no build output of its own: a task runs in a real Session
 * terminal, which the Sidebar shows as its own tab, so the person keeps the
 * scrollback, the colours, and the ability to interrupt the build.
 */
import * as React from 'react';
import type { Translator } from './i18n.ts';
/** Props the tab seat injects for one occurrence. */
export interface GradleTasksPanelProps {
    /** Session whose working directory the page inspects. */
    readonly sessionId: string;
    /** Copy bound to the Host language. */
    readonly translator: Translator;
    /** Terminals the window currently shows as tabs. */
    readonly openTerminalIds: () => readonly string[];
    /** Bring a terminal's tab to the front, opening it when it is not shown. */
    readonly revealTerminal: (terminalId: string) => void;
}
/**
 * The Gradle Tasks page component.
 * @param props - injected services described by {@link GradleTasksPanelProps}.
 * @returns the rendered page.
 */
export declare function GradleTasksPanel(props: GradleTasksPanelProps): React.ReactElement;
