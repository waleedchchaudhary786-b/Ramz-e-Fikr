/* Search everything (Ctrl+K or the magnifier). Results rise in one by one. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion, useReducedMotion } from '../utils/motion'
import { useRouter } from '../utils/router'
import { useArticles, useStore } from '../services/store'
import { boardOf } from '../data/forum'
import { Sym, type SymbolName } from './Symbols'
import { allMotions, allResources, glossary } from '../data/sample'
import { pickMotion } from '../views/MotionsView'

type Hit = { key: string; motion?: string; to: string; symbol: SymbolName; kind: string; title: string; sub: string }

export const OPEN_SEARCH = 'ramz:open-search'

export default function SearchPalette() {
  const reduced = !!useReducedMotion()
  const { navigate } = useRouter()
  const articles = useArticles()
  const { topics } = useStore()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_SEARCH, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_SEARCH, onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      window.setTimeout(() => input.current?.focus(), 30)
    }
  }, [open])

  const index = useMemo<Hit[]>(
    () => [
      ...articles.map((a) => ({ key: 'a' + a.slug, to: `/articles/${a.slug}`, symbol: 'hand' as const, kind: 'Essay', title: a.title, sub: a.ramz })),
      ...allMotions.map((m) => ({ key: 'm' + m.slug, motion: m.slug, to: '/motions', symbol: 'pilcrow' as const, kind: 'Motion', title: m.text, sub: `${m.format} · ${m.theme}` })),
      ...allResources.map((r) => ({ key: 'r' + r.slug, to: `/resources/${r.slug}`, symbol: 'section' as const, kind: r.kind, title: r.title, sub: r.summary })),
      ...glossary.map((g) => ({ key: 'g' + g.term, to: '/glossary', symbol: 'dagger' as const, kind: 'Term', title: `${g.term} · ${g.urdu}`, sub: g.meaning })),
      ...topics.filter((t) => !t.flagged).map((t) => ({ key: 'f' + t.id, to: `/forum/${t.id}`, symbol: 'asterism' as const, kind: 'Thread', title: t.title, sub: `${boardOf(t.board).name} · ${t.author}` })),
    ],
    [articles, topics],
  )
  const hits = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return index.slice(0, 6)
    return index.filter((h) => words.every((w) => (h.title + ' ' + h.sub + ' ' + h.kind).toLowerCase().includes(w))).slice(0, 8)
  }, [q, index])

  const go = (h: Hit) => {
    setOpen(false)
    if (h.motion) pickMotion(h.motion)
    navigate(h.to)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/45 px-3 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast }}
          onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the archive"
            className="w-full max-w-xl border border-ink bg-ivory shadow-[6px_7px_0_rgba(23,23,23,0.18)]"
            initial={{ opacity: 0, y: reduced ? 0 : -24, rotate: reduced ? 0 : -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -12 }}
            transition={{ duration: DUR.base, ease: EASE_SNAP }}
          >
            <label className="flex items-center gap-3 border-b-2 border-ink px-4">
              <SearchIcon size={18} aria-hidden="true" className="text-oxblood" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setActive(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActive((a) => Math.min(hits.length - 1, a + 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActive((a) => Math.max(0, a - 1))
                  } else if (e.key === 'Enter' && hits[active]) go(hits[active])
                }}
                placeholder="Search essays, motions, resources, terms…"
                aria-label="Search"
                className="min-h-14 flex-1 bg-transparent font-mono focus:outline-none"
              />
              <kbd className="label hidden sm:block">Esc</kbd>
            </label>
            <ul className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
              {hits.map((h, i) => (
                <motion.li
                  key={h.key}
                  role="option"
                  aria-selected={i === active}
                  initial={{ opacity: 0, x: reduced ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: DUR.fast, delay: i * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => go(h)}
                    onPointerMove={() => setActive(i)}
                    className={`flex w-full items-start gap-3 px-3 py-2.5 text-left ${i === active ? 'bg-parchment' : ''}`}
                  >
                    <Sym name={h.symbol} className="mt-0.5 w-5 shrink-0 text-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display leading-snug font-bold">{h.title}</span>
                      <span className="meta block truncate !text-xs">
                        {h.kind} · {h.sub}
                      </span>
                    </span>
                    {i === active && (
                      <span aria-hidden="true" className="text-oxblood">
                        ⟶
                      </span>
                    )}
                  </button>
                </motion.li>
              ))}
              {hits.length === 0 && <li className="px-3 py-6 font-display text-lg italic">Nothing in the archive matches that.</li>}
            </ul>
            <p className="meta border-t border-border-warm px-4 py-2 !text-xs">↑ ↓ to move · Enter to open · Ctrl+K to toggle</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
