/**
 * The panel's glyph: a task list with a run mark.
 *
 * Drawn with `currentColor` so the sidebar decides the tone for the active and
 * inactive states, exactly like the shipped panel icons.
 */
import * as React from 'react'

/** Props the sidebar passes to a panel icon. */
export interface PanelIconProps {
  readonly size?: number | undefined
  readonly active?: boolean | undefined
}

/**
 * Render the Gradle Tasks panel icon.
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
