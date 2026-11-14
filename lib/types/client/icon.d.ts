/**
 * The panel's glyph: a task list with a run mark.
 *
 * Drawn with `currentColor` so the sidebar decides the tone for the active and
 * inactive states, exactly like the shipped panel icons.
 */
import * as React from 'react';
/** Props the sidebar passes to a panel icon. */
export interface PanelIconProps {
    readonly size?: number | undefined;
    readonly active?: boolean | undefined;
}
/**
 * Render the Gradle Tasks panel icon.
 * @param props - the requested glyph size.
 * @returns the icon element.
 */
export declare function GradleTasksIcon({ size }: PanelIconProps): React.ReactElement;
