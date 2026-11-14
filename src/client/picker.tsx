/**
 * The JDK selector: a themed listbox instead of a native `<select>`.
 *
 * A native select is drawn by the operating system, so its popup keeps the
 * system palette whatever theme the Host is in — the white list over a dark
 * Sidebar the screenshots showed. This component draws the trigger and the
 * popup itself, from the same `--dsw-alias-*` tokens as the rest of the panel,
 * and behaves like the Host's own pickers: arrows move, Enter chooses, Escape
 * closes and returns focus.
 */
import * as React from 'react'
import type { JdkCandidate } from '../shared/protocol.ts'
import { CheckIcon, ChevronDownIcon } from './icon.tsx'

/** Props of the JDK selector. */
export interface JdkPickerProps {
  /** Every JDK the Host reported, best first. */
  readonly candidates: readonly JdkCandidate[]
  /** Chosen JDK installation directory, or null when none is chosen yet. */
  readonly value: string | null
  /** Copy shown before the chosen JDK's name. */
  readonly label: string
  /** Copy for the empty state, shown when the Host found no JDK. */
  readonly emptyCopy: string
  /** Accessible name of the control. */
  readonly ariaLabel: string
  /** Called with the chosen installation directory. */
  readonly onChoose: (home: string) => void
}

/** How much room the popup may take before it scrolls, matching the stylesheet. */
const MAX_POPUP_HEIGHT = 320

/** The text one candidate shows: its variable, then its release version. */
function candidateText(candidate: JdkCandidate): string {
  return candidate.version === null ? candidate.variable : `${candidate.variable} (${candidate.version})`
}

/**
 * Render the JDK selector.
 * @param props - described by {@link JdkPickerProps}.
 * @returns the trigger and, while open, its popup.
 */
export function JdkPicker(props: JdkPickerProps): React.ReactElement {
  const { candidates, value, label, emptyCopy, ariaLabel, onChoose } = props
  const [open, setOpen] = React.useState(false)
  const [above, setAbove] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const selectedIndex = candidates.findIndex(candidate => candidate.home === value)
  const selected = selectedIndex >= 0 ? candidates[selectedIndex] : undefined
  const text = selected === undefined ? (candidates.length === 0 ? emptyCopy : '—') : candidateText(selected)

  /**
   * Decide whether the popup opens downward: a popup taller than the room below
   * the trigger would be clipped by the pane, so it flips when the space above
   * is larger.
   */
  const updatePlacement = React.useCallback((): void => {
    const trigger = triggerRef.current
    if (trigger === null) return
    const rect = trigger.getBoundingClientRect()
    const below = window.innerHeight - rect.bottom - 12
    const roomAbove = rect.top - 12
    setAbove(below < Math.min(MAX_POPUP_HEIGHT, roomAbove))
  }, [])

  /** Close the popup, optionally handing focus back to the trigger. */
  const close = React.useCallback((refocus: boolean): void => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }, [])

  /** Choose one candidate by index. */
  const choose = React.useCallback((index: number): void => {
    const candidate = candidates[index]
    if (candidate === undefined) return
    onChoose(candidate.home)
    close(true)
  }, [candidates, close, onChoose])

  React.useEffect(() => {
    if (!open) return undefined
    updatePlacement()
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    window.addEventListener('scroll', updatePlacement, true)
    window.addEventListener('resize', updatePlacement)
    // A pointer landing anywhere else means the person moved on; closing here
    // keeps the popup from surviving a tab switch or a scroll of the tree.
    const onPointerDown = (event: PointerEvent): void => {
      const wrapper = wrapperRef.current
      if (wrapper !== null && event.target instanceof Node && !wrapper.contains(event.target)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('scroll', updatePlacement, true)
      window.removeEventListener('resize', updatePlacement)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, selectedIndex, updatePlacement, close])

  /**
   * Keyboard handling for both the trigger and the popup.
   *
   * The popup keeps focus on the trigger, so one handler serves both states;
   * the highlighted option is announced through `aria-activedescendant`.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (candidates.length === 0) return
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(true)
      }
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(activeIndex)
      return
    }
    if (event.key === 'Tab') {
      close(false)
      return
    }
    const count = candidates.length
    let next: number | undefined
    if (event.key === 'ArrowDown') next = (activeIndex + 1) % count
    else if (event.key === 'ArrowUp') next = (activeIndex - 1 + count) % count
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = count - 1
    if (next === undefined) return
    event.preventDefault()
    setActiveIndex(next)
  }

  return (
    <div
      ref={wrapperRef}
      className="gt-java"
      data-open={open ? 'true' : undefined}
      onKeyDown={onKeyDown}
    >
      <span className="gt-java-label">{label}</span>
      <button
        ref={triggerRef}
        className="gt-picker-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${ariaLabel}: ${text}`}
        disabled={candidates.length === 0}
        title={selected?.home ?? text}
        onClick={() => { setOpen(previous => !previous) }}
      >
        <span className={selected === undefined ? 'gt-picker-text gt-picker-dim' : 'gt-picker-text'}>{text}</span>
        <span className="gt-picker-caret" aria-hidden="true"><ChevronDownIcon size={12} /></span>
      </button>
      {!open ? null : (
        <div
          className={above ? 'gt-popup gt-popup-above' : 'gt-popup'}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
        >
          {candidates.map((candidate, index) => (
            <button
              key={candidate.home}
              type="button"
              role="option"
              aria-selected={candidate.home === value}
              className={[
                'gt-option',
                candidate.home === value ? 'gt-option-selected' : '',
                index === activeIndex ? 'gt-option-active' : '',
              ].filter(Boolean).join(' ')}
              title={candidate.home}
              onMouseEnter={() => { setActiveIndex(index) }}
              onClick={() => { choose(index) }}
            >
              <span className="gt-option-main">
                <span className="gt-option-name">{candidateText(candidate)}</span>
                {candidate.home === value ? <span className="gt-option-check" aria-hidden="true"><CheckIcon size={13} /></span> : null}
              </span>
              <span className="gt-option-path">{candidate.home}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
