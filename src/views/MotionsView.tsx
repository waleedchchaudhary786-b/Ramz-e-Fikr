import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { DUR, EASE_SNAP, motion, StampIn, Stick, useReducedMotion } from '../utils/motion'
import { DateFilter, Filter, Reaction, Tabs } from '../components/Bits'
import { Stamp, Sym } from '../components/Symbols'
import { Scribble, Sparks } from '../components/Doodles'
import { PageHead } from './PlaceholderView'
import { allMotions, formatDate, type Motion } from '../data/sample'

const FORMATS = ['BP', 'AP', 'WSDC', 'Bilingual'] as const
const PICK_KEY = 'ramz.pick-motion'

/** Call before linking to /motions so that motion is the one on the prep desk. */
export function pickMotion(slug: string) {
  try {
    window.sessionStorage.setItem(PICK_KEY, slug)
  } catch {
    /* ignore */
  }
}

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
  const [chosen, setChosen] = useState<Motion>(() => {
    // another page can hand over a motion to put on the desk (see pickMotion)
    let slug: string | null = null
    try {
      slug = window.sessionStorage.getItem(PICK_KEY)
      window.sessionStorage.removeItem(PICK_KEY)
    } catch {
      /* ignore */
    }
    return allMotions.find((m) => m.slug === slug) ?? allMotions[0]
  })

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
      <PageHead symbol="pilcrow" title="Motions" purpose="A bank of motions to practise on, with a random draw and a prep timer."
        note="Draw one. Fifteen minutes. On your feet."
      />
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
                className="paper-input mt-1"
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
const CARD_H = 188 // px: height of the motion card, fixed so nothing jumps
const DECK = [0, 1, 2, 3, 4]

/** The back of a motion card: the ف monogram in a ruled frame. */
function CardBack() {
  return (
    <div className="absolute inset-0 grid place-items-center border border-oxblood bg-oxblood">
      <div className="absolute inset-1.5 border border-gold/70" />
      <span className="urdu text-6xl leading-none text-gold">ف</span>
    </div>
  )
}

/* The draw. Three beats:
   1. the motion card flips face-down and becomes a deck
   2. the deck riffles: cards cut left and right and fall back in order
   3. the top card flips over on the new motion, sparks fly and a stamp lands */
function DrawStage({ motion: m, drawNo, phase }: { motion: Motion; drawNo: number; phase: 'idle' | 'shuffle' | 'reveal' }) {
  return (
    <div className="relative [perspective:900px]" style={{ height: CARD_H }}>
      {/* the riffling deck */}
      {phase === 'shuffle' &&
        DECK.map((i) => {
          const dir = i % 2 === 0 ? 1 : -1
          return (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{ zIndex: i }}
              initial={{ x: 0, y: -i * 2, rotate: 0 }}
              animate={{
                x: [0, dir * (42 + i * 6), 0, -dir * (28 + i * 4), 0],
                y: [-i * 2, -14 - i * 3, -i * 2, -10, -i * 2],
                rotate: [0, dir * (7 + i), 0, -dir * 5, 0],
              }}
              transition={{ duration: 0.95, delay: i * 0.05, ease: 'easeInOut', times: [0, 0.28, 0.5, 0.76, 1] }}
            >
              <CardBack />
            </motion.div>
          )
        })}

      {/* the card itself: two faces */}
      {phase !== 'shuffle' && (
        <motion.div
          key={drawNo}
          className="coin absolute inset-0"
          initial={drawNo === 0 ? false : { rotateY: 180, y: -18, scale: 1.04 }}
          animate={{ rotateY: 0, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_SNAP }}
        >
          {/* .index-card sets its own position, so it sits inside an absolutely placed face */}
          <div className="absolute inset-0 [backface-visibility:hidden]" aria-live="polite">
          <div className="index-card h-full overflow-hidden px-5 pt-2.5" style={{ transform: 'none' }}>
            <p className="flex items-baseline justify-between font-mono text-xs tracking-[0.12em] uppercase">
              <span className="text-oxblood">{m.format}</span>
              <span className="text-charcoal">{m.theme}</span>
            </p>
            <p className="mt-5 line-clamp-4 font-display text-[1.3125rem] leading-snug font-bold">{m.text}</p>
          </div>
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: 'rotateY(180deg)' }}>
            <CardBack />
          </div>
        </motion.div>
      )}

      {/* the flourish when a drawn card lands */}
      {phase === 'reveal' && (
        <>
          {[
            ['-top-4 -left-3', -40, 0.35],
            ['-top-5 -right-2', 60, 0.42],
            ['-bottom-3 -right-4', 150, 0.5],
          ].map(([pos, rot, delay]) => (
            <motion.span
              key={String(pos)}
              aria-hidden="true"
              className={`absolute z-10 text-oxblood ${pos}`}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.25, 1, 1] }}
              transition={{ duration: 0.9, delay: delay as number, times: [0, 0.3, 0.7, 1] }}
            >
              <Sparks size={34} style={{ transform: `rotate(${rot}deg)` }} />
            </motion.span>
          ))}
          <StampIn delay={0.5} className="absolute right-3 bottom-3 z-10">
            <Stamp className="bg-ivory/90">Drawn</Stamp>
          </StampIn>
        </>
      )}
    </div>
  )
}

/* ---- speech timer: seven minutes, with the protected first and last minute marked ---- */
const SPEECH = 7 * 60
function SpeechTimer() {
  const [t, setT] = useState(0)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!on) return
    const id = window.setInterval(() => setT((x) => Math.min(SPEECH + 30, x + 1)), 1000)
    return () => window.clearInterval(id)
  }, [on])
  const state = t < 60 ? 'Protected time: no points' : t < SPEECH - 60 ? 'Points of information are open' : t < SPEECH ? 'Protected time: wrap up' : 'Time. Finish your sentence.'
  const open = t >= 60 && t < SPEECH - 60
  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return (
    <div>
      <p className={`font-mono text-6xl font-bold tabular-nums ${t >= SPEECH ? 'text-oxblood' : ''}`} role="timer" aria-live="off">
        {mm}:{ss}
      </p>
      {/* the seven minutes as a strip: gold ends are protected time */}
      <div className="relative mt-2 flex h-3" aria-hidden="true">
        <span className="w-[14.28%] bg-gold" />
        <span className="flex-1 bg-border-warm" />
        <span className="w-[14.28%] bg-gold" />
        <span className="absolute top-[-4px] bottom-[-4px] left-0 w-full transition-transform duration-1000 ease-linear" style={{ transform: `translateX(${Math.min(1, t / SPEECH) * 100}%)` }}>
          <span className="block h-full w-[3px] bg-oxblood" />
        </span>
      </div>
      <motion.p key={state} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mt-3 font-display text-lg font-bold ${open ? '' : 'text-oxblood italic'}`} aria-live="polite">
        {state}
      </motion.p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setOn((o) => !o)} className="btn btn-primary">
          {on ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {on ? 'Pause' : t > 0 ? 'Resume' : 'Start speech'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOn(false)
            setT(0)
          }}
          aria-label="Reset speech timer"
          className="grid h-11 w-11 place-items-center border border-border-warm hover:border-oxblood"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}

function PrepDesk({ chosen, onDraw }: { chosen: Motion; onDraw: (m: Motion) => void }) {
  const reduced = !!useReducedMotion()
  const [phase, setPhase] = useState<'idle' | 'shuffle' | 'reveal'>('idle')
  const [drawNo, setDrawNo] = useState(0)
  const [mode, setMode] = useState<'prep' | 'speech'>('prep')
  const [mins, setMins] = useState<(typeof LENGTHS)[number]>(15)
  const [left, setLeft] = useState(15 * 60)
  const [running, setRunning] = useState(false)
  const [turns, setTurns] = useState(0) // half-turns of the coin; even = Proposition
  const [tossed, setTossed] = useState(false)
  const side = turns % 2 === 0 ? 'Proposition' : 'Opposition'
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), [])

  function draw() {
    if (phase !== 'idle') return
    const others = allMotions.filter((x) => x.slug !== chosen.slug)
    const pick = others[Math.floor(Math.random() * others.length)]
    if (reduced) {
      onDraw(pick)
      return
    }
    setPhase('shuffle')
    timers.current.push(
      window.setTimeout(() => {
        onDraw(pick)
        setDrawNo((n) => n + 1)
        setPhase('reveal')
      }, 1250),
      window.setTimeout(() => setPhase('idle'), 2700),
    )
  }

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000)
    return () => window.clearInterval(id)
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
        <div className="mt-3">
          <DrawStage motion={chosen} drawNo={drawNo} phase={phase} />
        </div>
        <button type="button" onClick={draw} disabled={phase !== 'idle'} className="btn btn-ghost mt-4">
          <Shuffle size={16} aria-hidden="true" /> {phase === 'shuffle' ? 'Shuffling…' : 'Draw a random motion'}
        </button>

        {/* toss a coin for which side you argue */}
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              const wantOpp = Math.random() < 0.5
              setTurns((t) => {
                const next = t + 6
                return (next % 2 === 1) === wantOpp ? next : next + 1
              })
              setTossed(true)
            }}
            aria-label="Toss a coin for your side"
            className="relative h-16 w-16 shrink-0 [perspective:600px]"
          >
            <motion.span
              className="coin absolute inset-0 block"
              animate={{ rotateY: turns * 180, y: [0, -18, 0] }}
              transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <span className="coin-face border-2 border-gold bg-oxblood font-display text-2xl font-black text-ivory">P</span>
              <span className="coin-face border-2 border-oxblood bg-gold font-display text-2xl font-black text-burgundy" style={{ transform: 'rotateY(180deg)' }}>
                O
              </span>
            </motion.span>
          </button>
          <p aria-live="polite">
            <span className="label block">Your side</span>
            <span className="font-display text-xl font-bold">{tossed ? side : 'Tap the coin to toss'}</span>
          </p>
        </div>

        <Scribble className="my-6 block h-2.5 w-full text-border-warm" />

        <Tabs
          id="clock"
          value={mode}
          onChange={setMode}
          tabs={[
            { value: 'prep', label: 'Prep timer' },
            { value: 'speech', label: 'Speech timer' },
          ]}
        />
        <div className="pt-4">
          {mode === 'speech' ? (
            <SpeechTimer />
          ) : (
            <>
              <p className={`font-mono text-6xl font-bold tabular-nums ${done ? 'text-oxblood' : ''}`} role="timer" aria-live="off">
                {mm}:{ss}
              </p>
              {/* an ink line that drains as time runs out */}
              <div className="mt-2 h-1.5 bg-border-warm" aria-hidden="true">
                <div className="h-full origin-left bg-oxblood transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${left / total})` }} />
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
            </>
          )}
        </div>
      </div>
    </Stick>
  )
}
