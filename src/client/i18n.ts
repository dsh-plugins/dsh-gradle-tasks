/**
 * Copy resolution for this panel.
 *
 * The Host locale service is used when it is mounted, and the dictionary this
 * plugin ships is used otherwise. Either way the active language is read on
 * every lookup, so switching the Host language re-renders the panel without a
 * reload.
 */
import * as React from 'react'
import type { ClientContext } from './context.ts'
import { DICTIONARIES, format, type CopyKey } from './locales.ts'

/** Translate one key, substituting `{name}` placeholders when given. */
export interface Translator {
  t(key: CopyKey, values?: Record<string, string | number>): string
  subscribe(listener: () => void): () => void
}

/** The locale service members this panel reads. */
interface LocaleService {
  getSnapshot?(): { readonly active?: string } | undefined
  getLocale?(): { readonly active?: string } | undefined
  subscribe?(listener: () => void): () => void
}

/** The language to use when no Host choice is available. */
function documentLanguage(): string {
  const language = typeof navigator === 'undefined' ? '' : navigator.language
  return language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/** Pick the dictionary for one language, falling back to English, then Chinese. */
function dictionaryFor(language: string): Record<string, string> {
  const base = language.split('-')[0] ?? language
  return DICTIONARIES[language] ?? DICTIONARIES[base] ?? DICTIONARIES.en ?? DICTIONARIES.zh ?? {}
}

/**
 * Build the translator for this panel.
 * @param ctx - browser context, used to reach the optional locale service.
 * @returns the translator bound to the live locale.
 */
export function createTranslator(ctx: ClientContext): Translator {
  const locale = ctx.get('locale') as LocaleService | undefined
  const active = (): string => locale?.getSnapshot?.()?.active ?? locale?.getLocale?.()?.active ?? documentLanguage()
  return {
    t: (key, values) => {
      const template = dictionaryFor(active())[key] ?? DICTIONARIES.en?.[key] ?? key
      return values === undefined ? template : format(template, values)
    },
    subscribe: (listener) => locale?.subscribe?.(listener) ?? (() => {}),
  }
}

/**
 * Subscribe a component to locale changes and return the live translate function.
 * @param translator - translator built by {@link createTranslator}.
 * @returns the translate function, re-read on every render.
 */
export function useCopy(translator: Translator): Translator['t'] {
  const [, force] = React.useReducer((count: number) => count + 1, 0)
  React.useEffect(() => translator.subscribe(() => { force() }), [translator])
  return translator.t
}
