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
import * as React from 'react';
import type { JdkCandidate } from '../shared/protocol.ts';
/** Props of the JDK selector. */
export interface JdkPickerProps {
    /** Every JDK the Host reported, best first. */
    readonly candidates: readonly JdkCandidate[];
    /** Chosen JDK installation directory, or null when none is chosen yet. */
    readonly value: string | null;
    /** Copy shown before the chosen JDK's name. */
    readonly label: string;
    /** Copy for the empty state, shown when the Host found no JDK. */
    readonly emptyCopy: string;
    /** Accessible name of the control. */
    readonly ariaLabel: string;
    /** Called with the chosen installation directory. */
    readonly onChoose: (home: string) => void;
}
/**
 * Render the JDK selector.
 * @param props - described by {@link JdkPickerProps}.
 * @returns the trigger and, while open, its popup.
 */
export declare function JdkPicker(props: JdkPickerProps): React.ReactElement;
