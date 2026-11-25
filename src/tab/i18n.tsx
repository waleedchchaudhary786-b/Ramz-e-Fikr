/* Ramz Tab in English and Urdu. The English text is the key; ur.ts holds the
   Urdu. Urdu switches the whole section to right-to-left with Noto Nastaliq
   Urdu. scripts/i18n-check.ts fails the build check if a string has no Urdu. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import '@fontsource/noto-nastaliq-urdu/400.css'
import '@fontsource/noto-nastaliq-urdu/700.css'
import { UR } from './ur'

export type Lang = 'en' | 'ur'
type Vars = Record<string, string | number>
type Ctx = { lang: Lang; dir: 'ltr' | 'rtl'; setLang: (l: Lang) => void; t: (s: string, v?: Vars) => string }

const KEY = 'ramz.tab.lang'
const fill = (s: string, v?: Vars) => (v ? s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? '')) : s)
const I18n = createContext<Ctx>({ lang: 'en', dir: 'ltr', setLang: () => {}, t: (s, v) => fill(s, v) })

export function TabLangProvider({ children, force }: { children: ReactNode; force?: Lang }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (force) return force
    try {
      return window.localStorage.getItem(KEY) === 'ur' ? 'ur' : 'en'
    } catch {
      return 'en'
    }
  })
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
  }, [])
  useEffect(() => {
    if (force) setLangState(force)
  }, [force])
  const t = useCallback(
    (s: string, v?: Vars) => {
      if (lang === 'en') return fill(s, v)
      const ur = UR[s]
      if (ur === undefined && import.meta.env.DEV) console.warn('[tab i18n] no Urdu for:', s)
      return fill(ur ?? s, v)
    },
    [lang],
  )
  const value = useMemo<Ctx>(() => ({ lang, dir: lang === 'ur' ? 'rtl' : 'ltr', setLang, t }), [lang, setLang, t])
  return (
    <I18n.Provider value={value}>
      <div dir={value.dir} lang={lang} className={lang === 'ur' ? 'tab-ur' : 'tab-en'}>
        {children}
      </div>
    </I18n.Provider>
  )
}

export const useT = () => useContext(I18n)

/** English / اردو switch */
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang } = useT()
  return (
    <div role="group" aria-label="Language / زبان" className={`inline-flex border border-ink ${className}`} dir="ltr">
      {(
        [
          ['en', 'English'],
          ['ur', 'اردو'],
        ] as const
      ).map(([l, label]) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`min-h-11 px-3 text-sm transition-colors md:min-h-9 ${l === 'ur' ? 'urdu-ui' : 'font-mono'} ${
            lang === l ? 'bg-ink text-ivory' : 'hover:bg-parchment'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
