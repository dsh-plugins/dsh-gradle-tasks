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
/**
 * Render the caret a picker trigger shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function ChevronDownIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the tick a chosen listbox option shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function CheckIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the folder a collapsed group or an unloaded project shows.
 *
 * The open and closed variants differ only in the lid, so a tree that expands
 * reads as movement rather than as a swap of unrelated glyphs.
 * @param props - the requested size and whether the folder is open.
 * @returns the icon element.
 */
export declare function FolderIcon({ size, open }: GlyphProps & {
    readonly open?: boolean;
}): React.ReactElement;
/**
 * Render the glyph a build root shows: the stacked modules of a Gradle build.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function ProjectIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the glyph a subproject shows: one module box inside the build.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function ModuleIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the glyph one task shows: a cog, because a task is one unit of build
 * work rather than a thing that plays.
 *
 * The outline is the eight-toothed cog that still reads as a gear at 12px. A
 * photographic gear — curved flanks, a long tooth silhouette — collapses into a
 * smudge at this size, and a plain ring with detached ticks reads as a sun, so
 * the teeth are drawn as part of the rim.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function TaskIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the magnifier the filter box shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function SearchIcon({ size }: GlyphProps): React.ReactElement;
/**
 * Render the spinner a scanning project row shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export declare function SpinnerIcon({ size }: GlyphProps): React.ReactElement;
