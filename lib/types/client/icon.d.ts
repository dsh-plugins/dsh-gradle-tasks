/**
 * The panel's glyphs: the guide card's artwork, and the two icon controls for
 * rescan and the offline toggle.
 *
 * All of them draw with `currentColor` so the surrounding control decides the
 * tone for the active and inactive states.
 */
import * as React from 'react';
/** Shared props for a small control glyph. */
export interface GlyphProps {
    readonly size?: number | undefined;
}
/** Props the Sidebar passes to a guide card artwork component. */
export interface PanelIconProps {
    readonly size?: number | undefined;
    readonly active?: boolean | undefined;
}
/**
 * Render the Gradle Tasks artwork used by the guide card.
 * @param props - the requested glyph size.
 * @returns the icon element.
 */
export declare function GradleTasksIcon({ size }: PanelIconProps): React.ReactElement;
/**
 * Render the rescan glyph.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function RefreshIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the offline glyph: a cloud with a slash through it.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function OfflineIcon({ size }: GlyphProps): React.ReactElement;
