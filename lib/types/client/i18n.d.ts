import type { ClientContext } from './context.ts';
import { type CopyKey } from './locales.ts';
/** Translate one key, substituting `{name}` placeholders when given. */
export interface Translator {
    t(key: CopyKey, values?: Record<string, string | number>): string;
    subscribe(listener: () => void): () => void;
}
/**
 * Build the translator for this panel.
 * @param ctx - browser context, used to reach the optional locale service.
 * @returns the translator bound to the live locale.
 */
export declare function createTranslator(ctx: ClientContext): Translator;
/**
 * Subscribe a component to locale changes and return the live translate function.
 * @param translator - translator built by {@link createTranslator}.
 * @returns the translate function, re-read on every render.
 */
export declare function useCopy(translator: Translator): Translator['t'];
