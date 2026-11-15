import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion, Stick, useReducedMotion } from '../utils/motion'
import { DateFilter, Filter, Reaction } from '../components/Bits'
import { Sym } from '../components/Symbols'
import { Scribble } from '../components/Doodles'
import { PageHead } from './PlaceholderView'
import { allMotions, formatDate, type Motion } from '../data/sample'

const FORMATS = ['BP', 'AP', 'WSDC', 'Bilingual'] as const

/* ?date=YYYY-MM-DD in the address makes a filtered view shareable. */
function readDate(): string | null {
  const d = new URLSearchParams(window.location.search).get('date')
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}
function writeDate(d: string | null) {
  try {
    const url = new URL(window.location.href)
    if (d) url.searchParams.set('date', d)
    else url.searchParams.delete('date')
    window.history.replaceState({}, '', url)
  } catch {
    /* some preview hosts do not allow changing the address: the filter still works */
  }
}

export default function MotionsView() {
  const [format, setFormat] = useState<(typeof FORMATS)[number] | 'All'>('All')
  const [date, setDate] = useState<string | null>(readDate)
  const [q, setQ] = useState('')
  const [chosen, setChosen] = useState<Motion>(allMotions[0])

  const list = useMemo(
    () =>
      allMotions.filter(
        (m) =>
          (format === 'All' || m.format === format) &&
          (!date || m.date === date) &&
          (!q || (m.text + ' ' + m.theme).toLowerCase().includes(q.toLowerCase())),
      ),
    [format, date, q],
  )

  return (
    <>
      <PageHead symbol="pilcrow" title="Motions" purpose="A bank of motions to practise on, with a random draw and a prep timer." />
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="label">Search</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="smog, schools, unions…"
                className="mt-1 block min-h-11 w-full border border-border-warm bg-white/60 px-3 font-mono focus:border-oxblood focus:outline-none"
              />
            </label>
            <Filter label="Format" options={FORMATS} value={format} onChange={setFormat} />
            <div className="flex items-center gap-3">
              <span className="label">Added on</span>
              <DateFilter
                value={date}
                marked={allMotions.map((m) => m.date)}
                onChange={(d) => {
                  setDate(d)
                  writeDate(d)
                }}
              />
            </div>
          </div>

          <p className="meta mt-6" aria-live="polite">
            {list.length} {list.length === 1 ? 'motion' : 'motions'}
            {date ? ` added on ${formatDate(date)}` : ''}
          </p>
          <ol className="mt-2">
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((m, i) => (
                <motion.li
                  key={m.slug}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: DUR.base, ease: EASE_SNAP }}
                  className="border-b border-border-warm"
                >
                  <div className="toc flex gap-4 py-4">
                    <span className="relative w-10 shrink-0 pt-0.5" aria-hidden="true">
                      <span className="toc-no numeral block text-[1.75rem]">{String(i + 1).padStart(2, '0')}</span>
                      <Sym name="hand" className="toc-hand absolute top-0 left-0 block text-2xl" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-snug font-bold">{m.text}</p>
                      <p className="meta mt-1.5 flex items-baseline gap-2">
                        <span className="whitespace-nowrap">
                          {m.format} · {m.theme}
                        </span>
                        <span className="leader" aria-hidden="true" />
                        <span className="whitespace-nowrap">{formatDate(m.date)}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setChosen(m)
                            document.getElementById('prep')?.scrollIntoView({ block: 'center' })
                          }}
                          className="min-h-11 border border-border-warm px-3 font-mono text-[0.8125rem] hover:border-oxblood"
                        >
                          Prep this <span className="arrow">⟶</span>
                        </button>
                        <Reaction kind="bookmark" itemKey={`motion:${m.slug}`} />
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {list.length === 0 && (
            <p className="mt-6 font-display text-xl italic">Nothing matches. Clear a filter and try again.</p>
          )}
        </div>

        <aside className="lg:col-span-5" id="prep" aria-label="Prep desk">
          <div className="lg:sticky lg:top-28">
            <PrepDesk chosen={chosen} onDraw={setChosen} />
          </div>
        </aside>
      </div>
    </>
  )
}

const LENGTHS = [7, 15, 30] as const

function PrepDesk({ chosen, onDraw }: { chosen: Motion; onDraw: (m: Motion) => void }) {
  const reduced = !!useReducedMotion()
  const [shown, setShown] = useState(chosen)
  const [drawing, setDrawing] = useState(false)
  const [mins, setMins] = useState<(typeof LENGTHS)[number]>(15)
  const [left, setLeft] = useState(15 * 60)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => setShown(chosen), [chosen])

  // the draw: flick through motions like cards, then land on one
  function draw() {
    if (drawing) return
    const pick = allMotions[Math.floor(Math.random() * allMotions.length)]
    if (reduced) {
      onDraw(pick)
      return
    }
    setDrawing(true)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setShown(allMotions[Math.floor(Math.random() * allMotions.length)])
      if (n >= 9) {
        window.clearInterval(id)
        setDrawing(false)
        onDraw(pick)
        setShown(pick)
      }
    }, 85)
  }

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(timer.current)
  }, [running])
  useEffect(() => {
    if (left === 0) setRunning(false)
  }, [left])

  const total = mins * 60
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const done = left === 0

  return (
    <Stick rest={1} className="torn-wrap relative">
      <span className="tape -top-2.5 right-10 z-10 rotate-6" aria-hidden="true" />
      <div className="torn bg-parchment px-6 py-9 md:px-8">
        <p className="label">
          <Sym name="pilcrow" className="mr-1.5" />
          On the desk
        </p>
        <div className="mt-3 min-h-[5.5rem] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={shown.slug + (drawing ? Math.random() : '')}
              initial={{ opacity: 0, y: reduced ? 0 : 22, rotate: reduced ? 0 : 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -22 }}
              transition={{ duration: drawing ? 0.08 : DUR.slow, ease: EASE_SNAP }}
              className="font-display text-[1.375rem] leading-snug font-bold"
              aria-live="polite"
            >
              {shown.text}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="meta mt-2">
          {shown.format} · {shown.theme}
        </p>
        <button type="button" onClick={draw} disabled={drawing} className="btn btn-ghost mt-4">
          <Shuffle size={16} aria-hidden="true" /> Draw a random motion
        </button>

        <Scribble className="my-6 block h-2.5 w-full text-border-warm" />

        <p className="label">Prep timer</p>
        <p
          className={`mt-1 font-mono text-6xl font-bold tabular-nums ${done ? 'text-oxblood' : ''}`}
          role="timer"
          aria-live="off"
        >
          {mm}:{ss}
        </p>
        {/* an ink line that drains as time runs out */}
        <div className="mt-2 h-1.5 bg-border-warm" aria-hidden="true">
          <div
            className="h-full origin-left bg-oxblood transition-transform duration-1000 ease-linear"
            style={{ transform: `scaleX(${left / total})` }}
          />
        </div>
        {done && <p className="mt-3 font-display text-xl font-bold text-oxblood italic">Time. On your feet.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setRunning((r) => !r)} disabled={done} className="btn btn-primary">
            {running ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {running ? 'Pause' : left < total ? 'Resume' : 'Start prep'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false)
              setLeft(total)
            }}
            aria-label="Reset timer"
            className="grid h-11 w-11 place-items-center border border-border-warm hover:border-oxblood"
          >
            <RotateCcw size={16} />
          </button>
          <span className="ml-auto flex gap-1" role="group" aria-label="Prep length in minutes">
            {LENGTHS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={mins === l}
                onClick={() => {
                  setMins(l)
                  setLeft(l * 60)
                  setRunning(false)
                }}
                className={`h-11 w-11 border font-mono text-sm ${mins === l ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm'}`}
              >
                {l}
              </button>
            ))}
          </span>
        </div>
      </div>
    </Stick>
  )
}

