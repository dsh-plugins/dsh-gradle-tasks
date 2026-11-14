/**
 * The panel's glyphs: the guide card's artwork, and the two icon controls for
 * rescan and the offline toggle.
 *
 * All of them draw with `currentColor` so the surrounding control decides the
 * tone for the active and inactive states.
 */
import * as React from 'react'

/** Shared props for a small control glyph. */
export interface GlyphProps {
  readonly size?: number | undefined
}

/** Props the Sidebar passes to a guide card artwork component. */
export interface PanelIconProps {
  readonly size?: number | undefined
  readonly active?: boolean | undefined
}

/**
 * Render the Gradle Tasks artwork used by the guide card.
 * @param props - the requested glyph size.
 * @returns the icon element.
 */
export function GradleTasksIcon({ size = 20 }: PanelIconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9.5l1.4 1.4L11 8.3" />
      <path d="M13.5 9.5H17" />
      <path d="M7 15.5l1.4 1.4L11 14.3" />
      <path d="M13.5 15.5H17" />
    </svg>
  )
}

/**
 * Render the rescan glyph.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function RefreshIcon({ size = 16 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  )
}

/**
 * Render the offline glyph: a cloud with a slash through it.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function OfflineIcon({ size = 16 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.5 18H7a4 4 0 0 1-.6-7.95A6 6 0 0 1 17.7 8.6a3.7 3.7 0 0 1-.2 9.4Z" />
      <path d="M4 4l16 16" />
    </svg>
  )
}

/**
 * Render the caret a picker trigger shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function ChevronDownIcon({ size = 12 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/**
 * Render the tick a chosen listbox option shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function CheckIcon({ size = 13 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/**
 * Render the folder a collapsed group or an unloaded project shows.
 *
 * The open and closed variants differ only in the lid, so a tree that expands
 * reads as movement rather than as a swap of unrelated glyphs.
 * @param props - the requested size and whether the folder is open.
 * @returns the icon element.
 */
export function FolderIcon({ size = 14, open = false }: GlyphProps & { readonly open?: boolean }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {open
        ? <path d="M3 9.5A2 2 0 0 1 5 7.5h3.6l1.7 1.8H19a2 2 0 0 1 2 2v5.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        : <path d="M3 7.5a2 2 0 0 1 2-2h3.6l1.7 1.8H19a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />}
    </svg>
  )
}

/**
 * Render the glyph a build root shows: the stacked modules of a Gradle build.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function ProjectIcon({ size = 15 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3.2 20.4 7.6 12 12 3.6 7.6Z" />
      <path d="M3.6 12 12 16.4 20.4 12" />
      <path d="M3.6 16.4 12 20.8l8.4-4.4" />
    </svg>
  )
}

/**
 * Render the glyph a subproject shows: one module box inside the build.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function ModuleIcon({ size = 14 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3.5" y="3.5" width="8" height="8" rx="1.6" />
      <rect x="12.5" y="12.5" width="8" height="8" rx="1.6" />
      <path d="M12.5 7.5h4.5a2 2 0 0 1 2 2v3" />
    </svg>
  )
}

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
export function TaskIcon({ size = 13 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.08A1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

/**
 * Render the magnifier the filter box shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function SearchIcon({ size = 12 }: GlyphProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" />
    </svg>
  )
}

/**
 * Render the spinner a scanning project row shows.
 * @param props - the requested size.
 * @returns the icon element.
 */
export function SpinnerIcon({ size = 12 }: GlyphProps): React.ReactElement {
  return (
    <svg
      className="gt-spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </svg>
  )
}
