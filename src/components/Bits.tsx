/* Small interactive pieces shared by the inner pages. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark, CalendarDays, Heart, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_CALM, EASE_SNAP, motion, useReducedMotion } from '../utils/motion'
import { Link } from '../utils/router'
import { useSession } from '../services/session'
import { actions, useStore } from '../services/store'
import { CONNECTED } from '../services/supabase'

/** Tabs with an ink underline that slides between them. */
export function Tabs<T extends string>({
  id,
  tabs,
  value,
  onChange,
}: {
  id: string
  tabs: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-ink/70">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`relative min-h-11 px-3 font-display text-lg font-bold md:px-4 ${
            value === t.value ? 'text-oxblood' : 'text-charcoal hover:text-ink'
          }`}
        >
          {t.label}
          {value === t.value && (
            <motion.span
              layoutId={`tab-${id}`}
              className="absolute inset-x-0 -bottom-px h-[3px] bg-oxblood"
              transition={{ duration: DUR.slow, ease: EASE_SNAP }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

/** Typewriter toggle buttons for filtering a list. */
export function Filter<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T | 'All'
  onChange: (v: T | 'All') => void
}) {
  const all = ['All', ...options] as (T | 'All')[]
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1" role="group" aria-label={label}>
      <span className="label mr-2">{label}</span>
      {all.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`min-h-11 border px-3 font-mono text-[0.8125rem] transition-transform duration-200 active:scale-95 md:min-h-9 ${
            value === o ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm text-ink hover:border-oxblood'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** Like or bookmark. Signed-out visitors are sent to sign in. */
export function Reaction({ kind, itemKey, base = 0 }: { kind: 'like' | 'bookmark'; itemKey: string; base?: number }) {
  const { user } = useSession()
  const store = useStore()
  const reduced = !!useReducedMotion()
  const on = (kind === 'like' ? store.likes : store.bookmarks).includes(itemKey)
  // connected: the true number of likes. Local preview: a sample number plus your own.
  const count = (CONNECTED ? 0 : base) + (store.likeCounts[itemKey] ?? 0)
  const Icon = kind === 'like' ? Heart : Bookmark
  const text = kind === 'like' ? (on ? 'Liked' : 'Like') : on ? 'Saved' : 'Save'
  const cls =
    'inline-flex min-h-11 items-center gap-2 border border-border-warm px-3 font-mono text-[0.8125rem] hover:border-oxblood'

  if (!user)
    return (
      <Link to="/signin" className={cls} title="Sign in to use this">
        <Icon size={16} aria-hidden="true" /> {text}
        {kind === 'like' && count > 0 && <span className="text-charcoal">· {count}</span>}
      </Link>
    )
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => (kind === 'like' ? actions.toggleLike(itemKey) : actions.toggleBookmark(itemKey))}
      className={`${cls} ${on ? 'border-oxblood text-oxblood' : ''}`}
    >
      <motion.span
        key={String(on)}
        initial={reduced ? false : { scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: DUR.base, ease: EASE_SNAP }}
        className="inline-flex"
      >
        <Icon size={16} aria-hidden="true" fill={on ? 'currentColor' : 'none'} />
      </motion.span>
      {text}
      {kind === 'like' && <span className="text-charcoal">· {count}</span>}
    </button>
  )
}

/* ---------- date filter: a small calendar that opens from a button ---------- */
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function DateFilter({
  value,
  onChange,
  marked,
}: {
  value: string | null
  onChange: (v: string | null) => void
  /** dates (YYYY-MM-DD) that have content: they get a gold dot */
  marked: string[]
}) {
  const reduced = !!useReducedMotion()
  const [open, setOpen] = useState(false)
  const latest = marked.slice().sort().at(-1)
  const [view, setView] = useState(() => new Date((value ?? latest ?? iso(new Date())) + 'T00:00:00'))
  const box = useRef<HTMLDivElement>(null)
  const markedSet = useMemo(() => new Set(marked), [marked])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const y = view.getFullYear()
  const m = view.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7 // Monday first
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const label = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Any date'

  return (
    <div ref={box} className="relative inline-block">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex min-h-11 items-center gap-2 border px-3 font-mono text-[0.8125rem] md:min-h-9 ${
            value ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm hover:border-oxblood'
          }`}
        >
          <CalendarDays size={15} aria-hidden="true" /> {label}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Clear date"
            className="grid h-11 w-11 place-items-center md:h-9 md:w-9"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose a date"
            className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-parchment p-5 pb-8 shadow-[0_-6px_0_rgba(23,23,23,0.06)] sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:left-0 sm:mt-2 sm:w-[19rem] sm:border sm:border-ink sm:p-4 sm:shadow-[4px_5px_0_rgba(23,23,23,0.1)]"
            initial={{ opacity: 0, y: reduced ? 0 : 14, rotate: reduced ? 0 : -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 10 }}
            transition={{ duration: DUR.base, ease: EASE_SNAP }}
          >
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setView(new Date(y, m - 1, 1))} aria-label="Previous month" className="grid h-11 w-11 place-items-center font-display text-xl">
                ‹
              </button>
              <p className="label !font-bold !text-ink" aria-live="polite">
                {view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
              <button type="button" onClick={() => setView(new Date(y, m + 1, 1))} aria-label="Next month" className="grid h-11 w-11 place-items-center font-display text-xl">
                ›
              </button>
            </div>
            <div className="mt-1 grid grid-cols-7 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="label py-1 !text-[0.625rem]">
                  {d}
                </span>
              ))}
              {cells.map((d, i) => {
                if (d === null) return <span key={i} />
                const key = iso(new Date(y, m, d))
                const has = markedSet.has(key)
                const sel = value === key
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!has}
                    aria-pressed={sel}
                    aria-label={`${d} ${view.toLocaleDateString('en-GB', { month: 'long' })}${has ? ', has entries' : ', no entries'}`}
                    onClick={() => {
                      onChange(sel ? null : key)
                      setOpen(false)
                    }}
                    className={`relative mx-auto grid h-10 w-10 place-items-center font-mono text-sm ${
                      sel ? 'bg-oxblood text-ivory' : has ? 'font-bold text-ink hover:bg-ivory' : 'text-charcoal/50'
                    }`}
                  >
                    {d}
                    {has && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${sel ? 'bg-ivory' : 'bg-gold'}`} />}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border-warm pt-2">
              <p className="meta !text-xs">Gold dot = something was added</p>
              <button
                type="button"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="min-h-11 px-2 text-sm font-bold text-oxblood"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* An answer that opens and closes. The panel stays mounted and its height is
   animated both ways, so closing is as smooth as opening. The plus sign folds
   into a minus, an oxblood rule grows down the left edge, and the text rises in. */
export function Fold({
  summary,
  children,
  defaultOpen = false,
  index,
}: {
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  /** optional number shown before the question, e.g. "01" */
  index?: string
}) {
  const reduced = !!useReducedMotion()
  const [open, setOpen] = useState(defaultOpen)
  const dur = reduced ? 0 : 0.38
  return (
    <div className="relative border-b border-border-warm pl-4">
      <motion.span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 w-[3px] origin-top bg-oxblood"
        initial={false}
        animate={{ scaleY: open ? 1 : 0 }}
        transition={{ duration: dur, ease: EASE_CALM }}
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group flex min-h-14 w-full items-center gap-4 py-3 text-left"
      >
        {index && <span className="font-mono text-sm font-bold text-gold">{index}</span>}
        <span className={`min-w-0 flex-1 transition-colors duration-300 ${open ? 'text-oxblood' : ''}`}>{summary}</span>
        <span
          aria-hidden="true"
          className={`relative grid h-8 w-8 shrink-0 place-items-center border-[1.5px] border-oxblood transition-colors duration-300 ${
            open ? 'bg-oxblood text-ivory' : 'text-oxblood group-hover:bg-parchment'
          }`}
        >
          <span className="absolute h-[2px] w-3.5 bg-current" />
          <span className="absolute h-3.5 w-[2px] bg-current transition-transform duration-300" style={{ transform: open ? 'scaleY(0)' : 'scaleY(1)' }} />
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: dur, ease: EASE_CALM }}
        style={{ overflow: 'hidden' }}
        aria-hidden={!open}
        inert={!open}
      >
        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0, y: open || reduced ? 0 : -8 }}
          transition={{ duration: dur * 0.8, ease: EASE_CALM, delay: open ? dur * 0.25 : 0 }}
          className="pt-1 pb-5"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  )
}
