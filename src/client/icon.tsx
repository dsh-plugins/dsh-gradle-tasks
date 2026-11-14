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
