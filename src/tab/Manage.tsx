/* The director console. Every change is saved straight away; if another
   director saved first, the change is applied again to their newer copy. */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Copy, Download, Lock, MonitorUp, Plus, Printer, RefreshCw, Trash2, Users } from 'lucide-react'
import { Link } from '../utils/router'
import { DUR, EASE_SNAP, motion, useReducedMotion } from '../utils/motion'
import { useSession } from '../services/session'
import { Tabs } from '../components/Bits'
import { LangSwitch, useT } from './i18n'
import { tab } from './backend'
import {
  allocateCountries,
  allocateJudges,
  breakingTeams,
  canVote,
  checkBallot,
  clashes,
  debateResult,
  makeCode,
  makeDraw,
  missingBallots,
  quorum,
  roomName,
  speakerTab,
  standings,
  uid,
} from './engine'
import { FORMATS, type Debate, type Delegate, type Round, type Seat, type TabDoc, type TabEvent } from './types'
import { BackLink, DrawTable, Notice, POSITION_SHORT, PrepClock, RoundStamp, Scroll, SpeakerTable, StandingsTable, Td, Th, dateRange, mmss } from './ui'
import { Choice, Field, NumberIn, lines } from './TabView'

type Act = (change: (d: TabDoc) => TabDoc | void, done?: string) => Promise<boolean>

function useEvent(slug: string) {
  const [ev, setEv] = useState<TabEvent | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const { user } = useSession()

  const reload = useCallback(async () => {
    const e = await tab.load(slug)
    setEv(e)
    setState(e ? 'ok' : 'denied')
  }, [slug])

  useEffect(() => {
    void reload()
  }, [reload, user?.id])
  useEffect(() => {
    if (!ev) return
    return tab.watch(ev.id, true, () => void reload())
  }, [ev?.id, reload]) // eslint-disable-line react-hooks/exhaustive-deps

  const act: Act = useCallback(
    async (change, done) => {
      if (!ev) return false
      setSaving(true)
      setMsg(null)
      try {
        const next = await tab.save(ev, (d) => change(d) ?? d)
        setEv(next)
        if (done) setMsg({ tone: 'ok', text: done })
        return true
      } catch (e) {
        setMsg({ tone: 'error', text: (e as Error).message })
        return false
      } finally {
        setSaving(false)
      }
    },
    [ev],
  )
  return { ev, state, saving, msg, act, setMsg }
}

type Section = 'rounds' | 'people' | 'setup' | 'results' | 'news' | 'mun'

export default function Manage({ slug }: { slug: string }) {
  const { t, lang } = useT()
  const { user, ready } = useSession()
  const { ev, state, saving, msg, act } = useEvent(slug)
  const [section, setSection] = useState<Section>('rounds')

  if (!ready || state === 'loading') return <p className="wrap meta py-20">…</p>
  if (!user || state === 'denied' || !ev)
    return (
      <div className="wrap max-w-2xl py-16">
        <Notice>{user ? t('Only this event’s directors can open its console.') : t('Sign in to open the console.')}</Notice>
        <div className="mt-6 flex gap-4">
          <BackLink to="/tab">{t('Tournaments')}</BackLink>
          {!user && (
            <Link to="/signin" className="btn btn-primary">
              {t('Sign in')}
            </Link>
          )}
        </div>
      </div>
    )

  const d = ev.doc
  const sections: { value: Section; label: string }[] =
    d.kind === 'mun'
      ? [
          { value: 'mun', label: t('Committees') },
          { value: 'people', label: t('Schools') },
          { value: 'news', label: t('Announcements') },
          { value: 'setup', label: t('Setup') },
        ]
      : [
          { value: 'rounds', label: t('Rounds') },
          { value: 'people', label: t('People') },
          { value: 'results', label: t('Results') },
          { value: 'news', label: t('Announcements') },
          { value: 'setup', label: t('Setup') },
        ]
  const sel = sections.some((s) => s.value === section) ? section : sections[0].value

  return (
    <div className="wrap pt-8 pb-20">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <BackLink to="/tab">{t('Tournaments')}</BackLink>
        <div className="flex flex-wrap gap-2">
          <LangSwitch />
          <Link to={`/tab/${slug}`} className="btn btn-ghost">
            {t('Public page')}
          </Link>
          <Link to={`/tab/${slug}/screen`} className="btn btn-ghost">
            <MonitorUp aria-hidden="true" className="h-4 w-4" /> {t('Projector view')}
          </Link>
        </div>
      </div>
      <p className="label mt-8">
        {t('Console')} · {d.kind === 'mun' ? t('Model UN') : t(FORMATS[d.format].name)}
      </p>
      <h1 className="mt-2 text-3xl leading-tight font-black md:text-5xl">{lang === 'ur' && d.urdu ? d.urdu : d.name}</h1>
      <p className="meta mt-2">
        {dateRange(d.start, d.end, lang)}
        {d.venue && ` · ${d.venue}`} · {d.finished ? t('Finished') : d.resultsPublic ? t('Results public') : t('Results private')}
      </p>

      <div className="no-print mt-6 pt-2">
        <Tabs id="console" tabs={sections} value={sel} onChange={setSection} />
        <div className="flex min-h-8 items-center py-1.5" aria-live="polite">
          {saving ? (
            <span className="meta">{t('Saving…')}</span>
          ) : msg ? (
            <span className={`meta ${msg.tone === 'error' ? '!text-oxblood font-bold' : ''}`}>{t(msg.text)}</span>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        {sel === 'rounds' && <RoundsPanel ev={ev} act={act} />}
        {sel === 'people' && <PeoplePanel ev={ev} act={act} />}
        {sel === 'results' && <ResultsPanel ev={ev} act={act} />}
        {sel === 'news' && <NewsPanel ev={ev} act={act} />}
        {sel === 'setup' && <SetupPanel ev={ev} act={act} />}
        {sel === 'mun' && <MunPanel ev={ev} act={act} />}
      </div>
    </div>
  )
}

/* ============================ rounds ============================ */

function RoundsPanel({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const live = [...d.rounds].sort((a, b) => a.n - b.n).find((r) => r.status !== 'confirmed')
  const [n, setN] = useState<number>(live?.n ?? d.rounds.at(-1)?.n ?? 1)
  const round = d.rounds.find((r) => r.n === n)

  return (
    <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
      <nav aria-label={t('Rounds')} className="flex flex-wrap gap-2 lg:flex-col">
        {[...d.rounds]
          .sort((a, b) => a.n - b.n)
          .map((r) => (
            <button
              key={r.n}
              type="button"
              aria-current={r.n === n ? 'true' : undefined}
              onClick={() => setN(r.n)}
              className={`flex min-h-11 items-center justify-between gap-3 border px-3 text-start ${r.n === n ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm hover:border-oxblood'}`}
            >
              <span className="font-display font-bold">{t('Round {n}', { n: r.n })}</span>
              <span className="font-mono text-[0.7rem] uppercase opacity-80">{t(STATUS_SHORT[r.status])}</span>
            </button>
          ))}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            void act((x) => {
              const next = Math.max(0, ...x.rounds.map((r) => r.n)) + 1
              x.rounds.push({ n: next, motion: '', info: '', status: 'setup', seed: Math.floor(Math.random() * 1e9), debates: [], ballots: [] })
              setN(next)
            }, 'Round added.')
          }
        >
          <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add a round')}
        </button>
      </nav>
      {round ? <RoundWork key={round.n} ev={ev} round={round} act={act} /> : <Notice>{t('Add a round to begin.')}</Notice>}
    </div>
  )
}

const STATUS_SHORT: Record<Round['status'], string> = { setup: 'to draw', draft: 'draft', released: 'drawn', motion: 'live', confirmed: 'done' }

function RoundWork({ ev, round, act }: { ev: TabEvent; round: Round; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const [motionText, setMotionText] = useState(round.motion)
  const [info, setInfo] = useState(round.info)
  const [problem, setProblem] = useState<string | null>(null)
  const idx = d.rounds.findIndex((r) => r.n === round.n)
  const upd = (change: (r: Round) => void, done?: string) =>
    act((x) => {
      const r = x.rounds.find((y) => y.n === round.n)
      if (r) change(r)
    }, done)

  const earlierOpen = d.rounds.some((r) => r.n < round.n && r.status !== 'confirmed')

  function generate() {
    setProblem(null)
    try {
      const seed = Math.floor(Math.random() * 1e9)
      // draw against the newest copy, so results confirmed a moment ago count
      void act((x) => {
        const drawn = makeDraw(x, round.n, seed)
        const { debates, problems } = allocateJudges(x, drawn)
        const r = x.rounds.find((y) => y.n === round.n)!
        r.debates = debates
        r.ballots = []
        r.seed = seed
        r.status = 'draft'
        if (problems.length) setProblem(problems.join(' '))
      }, 'Draw generated. Only directors can see it until you release it.')
    } catch (e) {
      setProblem((e as Error).message)
    }
  }
  // makeDraw can throw inside act's change; catch that too
  const safeGenerate = () => {
    try {
      makeDraw(d, round.n, 1)
      generate()
    } catch (e) {
      setProblem((e as Error).message)
    }
  }

  const missing = round.status === 'motion' || round.status === 'released' ? missingBallots(d, round) : []
  // a room with no judges, or ballots still to come, has no result yet; confirming would leave its teams with nothing
  const unresolved = round.status === 'motion' ? round.debates.filter((x) => !debateResult(d, round, x)).length : 0
  const results = useMemo(() => {
    if (round.status !== 'confirmed') return undefined
    const res: Record<string, number[]> = {}
    for (const deb of round.debates) {
      const r = debateResult(d, round, deb)
      if (r) res[deb.id] = deb.teams.map((tid) => r.order.indexOf(tid))
    }
    return res
  }, [d, round])

  return (
    <section aria-labelledby="round-work-h">
      <div className="flex flex-wrap items-center gap-4">
        <h2 id="round-work-h" className="text-3xl font-bold">
          {t('Round {n}', { n: round.n })}
        </h2>
        <RoundStamp status={round.status} />
      </div>

      {/* motion, private until released */}
      <div className="mt-5 grid gap-4 border border-ink bg-ivory px-5 py-5">
        <Field label={t('Motion (private until you release it)')}>
          <textarea
            value={motionText}
            onChange={(e) => setMotionText(e.target.value)}
            rows={2}
            maxLength={400}
            className="paper-area"
            disabled={round.status === 'confirmed'}
          />
        </Field>
        <Field label={t('Info slide (optional)')}>
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            rows={2}
            maxLength={1200}
            className="paper-area"
            disabled={round.status === 'confirmed'}
          />
        </Field>
        {(motionText !== round.motion || info !== round.info) && (
          <button
            type="button"
            className="btn btn-ghost justify-self-start"
            onClick={() =>
              void upd((r) => {
                r.motion = motionText.trim()
                r.info = info.trim()
              }, 'Motion saved.')
            }
          >
            {t('Save motion')}
          </button>
        )}
      </div>

      {problem && (
        <div className="mt-4">
          <Notice tone="error">{t(problem)}</Notice>
        </div>
      )}

      {/* the step the round is on */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {round.status === 'setup' && (
          <>
            <button type="button" onClick={safeGenerate} disabled={earlierOpen} className="btn btn-primary disabled:opacity-50">
              {t('Generate the draw')}
            </button>
            {earlierOpen && <span className="meta">{t('Confirm the earlier round first, so this draw is power-paired on its results.')}</span>}
          </>
        )}
        {round.status === 'draft' && (
          <>
            <button type="button" onClick={() => void upd((r) => void (r.status = 'released'), 'Draw released to every screen.')} className="btn btn-primary">
              {t('Release the draw')}
            </button>
            <button type="button" onClick={safeGenerate} className="btn btn-ghost">
              <RefreshCw aria-hidden="true" className="h-4 w-4" /> {t('Draw again')}
            </button>
            <button
              type="button"
              onClick={() =>
                void act((x) => {
                  const r = x.rounds.find((y) => y.n === round.n)!
                  const { debates, problems } = allocateJudges(x, r.debates)
                  r.debates = debates
                  setProblem(problems.length ? problems.join(' ') : null)
                }, 'Judges allocated again.')
              }
              className="btn btn-ghost"
            >
              <Users aria-hidden="true" className="h-4 w-4" /> {t('Allocate judges again')}
            </button>
          </>
        )}
        {round.status === 'released' && (
          <>
            <button
              type="button"
              disabled={!round.motion}
              onClick={() =>
                void upd((r) => {
                  r.status = 'motion'
                  r.motionAt = Date.now()
                }, 'Motion released. Prep has started on every screen.')
              }
              className="btn btn-primary disabled:opacity-50"
            >
              {t('Release the motion and start prep')}
            </button>
            {!round.motion && <span className="meta">{t('Write and save the motion first.')}</span>}
            <button type="button" onClick={() => void upd((r) => void (r.status = 'draft'), 'Draw taken back to draft.')} className="btn btn-ghost">
              {t('Take the draw back')}
            </button>
          </>
        )}
        {round.status === 'motion' && (
          <>
            <button
              type="button"
              onClick={() =>
                void upd((r) => {
                  r.status = 'confirmed'
                  r.confirmedAt = Date.now()
                }, 'Results confirmed.')
              }
              disabled={unresolved > 0}
              className="btn btn-primary disabled:opacity-50"
            >
              {t('Confirm results')}
            </button>
            {unresolved > 0 && <span className="meta">{t('{n} room(s) still waiting for ballots.', { n: unresolved })}</span>}
          </>
        )}
        {round.status === 'confirmed' && idx >= 0 && (
          <button type="button" onClick={() => void upd((r) => void (r.status = 'motion'), 'Round reopened for ballots.')} className="btn btn-ghost">
            {t('Reopen for corrections')}
          </button>
        )}
      </div>

      {round.status === 'motion' && (
        <div className="mt-6 bg-oxblood px-5 py-4 text-gold">
          <PrepClock motionAt={round.motionAt} prep={d.prep} />
        </div>
      )}

      {round.status === 'draft' && <DraftEditor ev={ev} round={round} act={act} />}
      {(round.status === 'released' || round.status === 'motion') && <BallotDesk ev={ev} round={round} act={act} missing={missing} />}
      {round.status === 'confirmed' && (
        <div className="mt-8">
          <DrawTable doc={pubShape(d)} debates={round.debates} results={results} />
        </div>
      )}
    </section>
  )
}

const pubShape = (d: TabDoc) => ({
  format: d.format,
  rooms: d.rooms,
  teams: d.teams.map((x) => ({ ...x, speakers: x.speakers.map((s) => s.name) })),
  judges: d.judges,
})

/* ---------- the draft: tap one, then another, to swap (or drag on a computer) ---------- */

type Pick = { kind: 'team'; debate: string; pos: number } | { kind: 'judge'; judge: string } | null

function DraftEditor({ ev, round, act }: { ev: TabEvent; round: Round; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const reduced = !!useReducedMotion()
  const [pick, setPick] = useState<Pick>(null)
  const cl = clashes(d, round)
  const placed = new Set(round.debates.flatMap((x) => x.panel.map((s) => s.judge)))
  const pool = d.judges.filter((j) => j.active && !placed.has(j.id))
  const teamName = (id: string) => d.teams.find((x) => x.id === id)?.name ?? '?'
  const judge = (id: string) => d.judges.find((x) => x.id === id)

  const edit = (change: (debates: Debate[]) => void) =>
    act((x) => {
      const r = x.rounds.find((y) => y.n === round.n)
      if (r && r.status === 'draft') change(r.debates)
    })

  function tapTeam(debate: string, pos: number) {
    if (!pick || pick.kind !== 'team') return setPick({ kind: 'team', debate, pos })
    const a = pick
    setPick(null)
    if (a.debate === debate && a.pos === pos) return
    void edit((ds) => {
      const da = ds.find((x) => x.id === a.debate)!
      const db = ds.find((x) => x.id === debate)!
      ;[da.teams[a.pos], db.teams[pos]] = [db.teams[pos], da.teams[a.pos]]
    })
  }
  function tapJudge(j: string) {
    if (!pick || pick.kind !== 'judge') return setPick({ kind: 'judge', judge: j })
    const a = pick.judge
    setPick(null)
    if (a === j) return
    void edit((ds) => {
      const sa = ds.flatMap((x) => x.panel).find((s) => s.judge === a)
      const sb = ds.flatMap((x) => x.panel).find((s) => s.judge === j)
      if (sa && sb) [sa.judge, sb.judge] = [sb.judge, sa.judge]
      else if (sa) sa.judge = j
      else if (sb) sb.judge = a
    })
  }
  function placeJudge(debate: string) {
    if (!pick || pick.kind !== 'judge') return
    const j = pick.judge
    setPick(null)
    void edit((ds) => {
      for (const x of ds) x.panel = x.panel.filter((s) => s.judge !== j)
      const target = ds.find((x) => x.id === debate)!
      target.panel.push({ judge: j, role: target.panel.some((s) => s.role === 'chair') ? 'panel' : 'chair' })
    })
  }
  function unplace(j: string) {
    void edit((ds) => {
      for (const x of ds) x.panel = x.panel.filter((s) => s.judge !== j)
    })
  }
  function cycleRole(debate: string, j: string) {
    const order: Seat['role'][] = ['chair', 'panel', 'trainee']
    void edit((ds) => {
      const x = ds.find((y) => y.id === debate)!
      const s = x.panel.find((y) => y.judge === j)!
      const next = order[(order.indexOf(s.role) + 1) % 3]
      if (next === 'chair') for (const o of x.panel) if (o.role === 'chair') o.role = 'panel'
      s.role = next
    })
  }

  // drag on a computer does the same as tapping twice
  const dragProps = (p: NonNullable<Pick>) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(p))
      setPick(p)
    },
  })
  const dropOn = (onDrop: () => void) => ({
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      onDrop()
    },
  })

  const isPicked = (p: NonNullable<Pick>) => JSON.stringify(p) === JSON.stringify(pick)

  return (
    <div className="mt-8">
      <Notice>
        {t(
          'Tap a team, then another team, to swap them. Tap a judge, then another judge or “Put here”, to move them. On a computer you can drag instead. Clashes show in red.',
        )}
      </Notice>
      <ul className="mt-5 grid gap-4 xl:grid-cols-2">
        {round.debates.map((deb) => (
          <motion.li
            layout={!reduced}
            transition={{ duration: DUR.base, ease: EASE_SNAP }}
            key={deb.id}
            className={`border bg-ivory px-4 py-4 ${cl[deb.id] ? 'border-oxblood' : 'border-ink'}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-display text-lg font-bold">{roomName(d, deb.room)}</p>
              <p className="meta">{t('Bracket {n}', { n: deb.bracket })}</p>
            </div>
            <ol className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {deb.teams.map((tid, i) => {
                const p = { kind: 'team' as const, debate: deb.id, pos: i }
                return (
                  <li key={tid}>
                    <button
                      type="button"
                      onClick={() => tapTeam(deb.id, i)}
                      {...dragProps(p)}
                      {...dropOn(() => tapTeam(deb.id, i))}
                      aria-pressed={isPicked(p)}
                      className={`flex min-h-11 w-full items-center gap-2 border px-2 text-start ${isPicked(p) ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm hover:border-oxblood'}`}
                    >
                      <span className="w-9 shrink-0 font-mono text-[0.7rem] opacity-75">{POSITION_SHORT[d.format][i]}</span>
                      <span className="font-bold">{teamName(tid)}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-1.5" {...dropOn(() => placeJudge(deb.id))}>
              {deb.panel.map((s) => {
                const j = judge(s.judge)
                const p = { kind: 'judge' as const, judge: s.judge }
                return (
                  <span key={s.judge} className="inline-flex items-stretch">
                    <button
                      type="button"
                      onClick={() => tapJudge(s.judge)}
                      {...dragProps(p)}
                      aria-pressed={isPicked(p)}
                      className={`min-h-11 border px-2 text-[0.875rem] md:min-h-9 ${isPicked(p) ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm'}`}
                    >
                      {j?.name} <span className="font-mono text-[0.7rem] opacity-70">★{j?.rating}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cycleRole(deb.id, s.judge)}
                      className={`min-h-11 border border-s-0 px-2 font-mono text-[0.7rem] uppercase md:min-h-9 ${s.role === 'chair' ? 'border-oxblood text-oxblood' : 'border-border-warm text-charcoal'}`}
                      aria-label={t('Change role of {name}', { name: j?.name ?? '' })}
                    >
                      {t(s.role)}
                    </button>
                  </span>
                )
              })}
              {pick?.kind === 'judge' && (
                <button
                  type="button"
                  onClick={() => placeJudge(deb.id)}
                  className="min-h-11 border border-dashed border-oxblood px-2 text-[0.875rem] text-oxblood md:min-h-9"
                >
                  {t('Put here')}
                </button>
              )}
            </div>
            {cl[deb.id] && (
              <ul className="mt-2 text-[0.8125rem] font-bold text-oxblood">
                {cl[deb.id].map((c) => (
                  <li key={c}>⚠ {c}</li>
                ))}
              </ul>
            )}
          </motion.li>
        ))}
      </ul>
      <section className="mt-6" {...dropOn(() => pick?.kind === 'judge' && (unplace(pick.judge), setPick(null)))}>
        <h3 className="label !text-ink">{t('Judges not placed')}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pool.length === 0 && <span className="meta">{t('Everyone is placed.')}</span>}
          {pool.map((j) => {
            const p = { kind: 'judge' as const, judge: j.id }
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => tapJudge(j.id)}
                {...dragProps(p)}
                aria-pressed={isPicked(p)}
                className={`min-h-11 border px-2 text-[0.875rem] md:min-h-9 ${isPicked(p) ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm'}`}
              >
                {j.name} <span className="font-mono text-[0.7rem] opacity-70">★{j.rating}</span>
              </button>
            )
          })}
          {pick?.kind === 'judge' && placed.has(pick.judge) && (
            <button
              type="button"
              onClick={() => {
                unplace(pick.judge)
                setPick(null)
              }}
              className="min-h-11 border border-dashed border-charcoal px-2 text-[0.875rem] md:min-h-9"
            >
              {t('Take out of the room')}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

/* ---------- ballots coming in ---------- */

function BallotDesk({ ev, round, act, missing }: { ev: TabEvent; round: Round; act: Act; missing: ReturnType<typeof missingBallots> }) {
  const { t } = useT()
  const d = ev.doc
  const [entering, setEntering] = useState<{ debate: string; judge: string } | null>(null)
  const judge = (id: string) => d.judges.find((x) => x.id === id)
  const total = round.debates.reduce((a, x) => a + x.panel.filter((s) => canVote(d, s)).length, 0)
  const inCount = round.ballots.length
  return (
    <div className="mt-8 grid gap-8">
      <div>
        <p className="font-display text-2xl font-bold">{t('{a} of {b} ballots in', { a: inCount, b: total })}</p>
        <div className="mt-2 h-2 w-full max-w-md bg-parchment" aria-hidden="true">
          <motion.div
            className="h-full origin-left bg-oxblood"
            initial={false}
            animate={{ scaleX: total ? inCount / total : 0 }}
            transition={{ duration: DUR.slow, ease: EASE_SNAP }}
          />
        </div>
      </div>
      <Scroll>
        <table className="w-full min-w-[40rem] text-[0.9375rem]">
          <thead>
            <tr className="border-b-2 border-ink">
              <Th>{t('Room')}</Th>
              <Th>{t('Teams')}</Th>
              <Th>{t('Ballots')}</Th>
              <Th>{t('Result so far')}</Th>
            </tr>
          </thead>
          <tbody>
            {round.debates.map((deb) => {
              const waiting = missing.find((m) => m.debate.id === deb.id)?.waiting ?? []
              const res = debateResult(d, round, deb)
              return (
                <tr key={deb.id} className={`border-b border-border-warm align-top ${waiting.length ? '' : 'bg-gold/10'}`}>
                  <Td>
                    <span className="font-bold">{roomName(d, deb.room)}</span>
                  </Td>
                  <Td>{deb.teams.map((x) => d.teams.find((y) => y.id === x)?.name).join(' · ')}</Td>
                  <Td>
                    <ul className="grid gap-1">
                      {deb.panel
                        .filter((s) => canVote(d, s))
                        .map((s) => {
                          const has = round.ballots.some((b) => b.debate === deb.id && b.judge === s.judge)
                          return (
                            <li key={s.judge} className="flex flex-wrap items-center gap-2">
                              <span className={has ? '' : 'font-bold text-oxblood'}>
                                {has ? '✓' : '…'} {judge(s.judge)?.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEntering({ debate: deb.id, judge: s.judge })}
                                className="font-mono text-[0.75rem] text-oxblood underline"
                              >
                                {has ? t('correct') : t('enter for them')}
                              </button>
                            </li>
                          )
                        })}
                    </ul>
                  </Td>
                  <Td>
                    {res
                      ? res.order
                          .map((x, i) => `${d.format === 'BP' ? i + 1 + '. ' : i === 0 ? '✓ ' : ''}${d.teams.find((y) => y.id === x)?.name}`)
                          .join(d.format === 'BP' ? ', ' : '')
                      : '—'}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Scroll>
      <AnimatePresence>
        {entering && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR.base, ease: EASE_SNAP }}>
            <DirectorBallot ev={ev} round={round} act={act} debate={entering.debate} judge={entering.judge} onClose={() => setEntering(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      <JudgeCodes ev={ev} round={round} />
    </div>
  )
}

function DirectorBallot({
  ev,
  round,
  act,
  debate,
  judge,
  onClose,
}: {
  ev: TabEvent
  round: Round
  act: Act
  debate: string
  judge: string
  onClose: () => void
}) {
  const { t } = useT()
  const d = ev.doc
  const f = FORMATS[d.format]
  const deb = round.debates.find((x) => x.id === debate)!
  const width = f.speakers + (f.reply ? 1 : 0)
  const old = round.ballots.find((b) => b.debate === debate && b.judge === judge)
  const [vals, setVals] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(deb.teams.map((x) => [x, (old?.scores[x] ?? []).map(String).concat(Array(width).fill('')).slice(0, width)])),
  )
  const [err, setErr] = useState<string | null>(null)
  async function save() {
    const scores = Object.fromEntries(deb.teams.map((x) => [x, vals[x].map(Number)]))
    const p = checkBallot(d, round, { debate, judge, scores })
    if (p) return setErr(p)
    const ok = await act((x) => {
      const r = x.rounds.find((y) => y.n === round.n)!
      const at = Date.now()
      r.ballots = [
        ...r.ballots.filter((b) => !(b.debate === debate && b.judge === judge)),
        { debate, judge, at, scores, reason: old?.reason ?? 'Entered by a director.' },
      ]
      r.lastBallotAt = at
    }, 'Ballot saved.')
    if (ok) onClose()
  }
  return (
    <section className="border border-oxblood bg-ivory px-5 py-5">
      <h3 className="font-display text-xl font-bold">
        {t('Ballot from {name}', { name: d.judges.find((j) => j.id === judge)?.name ?? '' })} · {roomName(d, deb.room)}
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {deb.teams.map((tid) => {
          const tm = d.teams.find((x) => x.id === tid)!
          return (
            <fieldset key={tid}>
              <legend className="font-bold">{tm.name}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from({ length: width }, (_, i) => (
                  <input
                    key={i}
                    type="number"
                    step={0.5}
                    inputMode="decimal"
                    dir="ltr"
                    value={vals[tid][i]}
                    onChange={(e) => setVals((v) => ({ ...v, [tid]: v[tid].map((x, k) => (k === i ? e.target.value : x)) }))}
                    aria-label={`${tm.name} ${f.reply && i === f.speakers ? t('Reply') : tm.speakers[i]?.name}`}
                    placeholder={f.reply && i === f.speakers ? t('Reply') : tm.speakers[i]?.name}
                    className="paper-input !w-20 text-center font-mono"
                  />
                ))}
              </div>
            </fieldset>
          )
        })}
      </div>
      {err && (
        <div className="mt-3">
          <Notice tone="error">{t(err)}</Notice>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => void save()} className="btn btn-primary">
          {t('Save ballot')}
        </button>
        <button type="button" onClick={onClose} className="btn btn-ghost">
          {t('Cancel')}
        </button>
      </div>
    </section>
  )
}

/** each judge's private ballot link, to send by message or print */
function JudgeCodes({ ev, round }: { ev: TabEvent; round?: Round }) {
  const { t } = useT()
  const d = ev.doc
  const [copied, setCopied] = useState<string | null>(null)
  const linkFor = (code: string) => `${window.location.origin}${window.location.pathname}${hrefFor(`/tab/judge/${code}`)}`
  const seated = round ? new Set(round.debates.flatMap((x) => x.panel.map((s) => s.judge))) : null
  const list = d.judges.filter((j) => j.active && (!seated || seated.has(j.id)))
  return (
    <section>
      <h3 className="label !text-ink">
        <Lock aria-hidden="true" className="me-1 inline h-3.5 w-3.5" />
        {t('Judge ballot links (private: send each judge only their own)')}
      </h3>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((j) => (
          <li key={j.id} className="flex items-center justify-between gap-2 border-b border-border-warm py-1.5">
            <span className="min-w-0 truncate">{j.name}</span>
            <span className="flex items-center gap-2">
              <code dir="ltr" className="font-mono text-[0.8125rem]">
                {j.code}
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(linkFor(j.code))
                  setCopied(j.id)
                  window.setTimeout(() => setCopied(null), 1600)
                }}
                className="grid h-9 w-9 place-items-center hover:text-oxblood"
                aria-label={t('Copy the ballot link for {name}', { name: j.name })}
              >
                {copied === j.id ? '✓' : <Copy aria-hidden="true" className="h-4 w-4" />}
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** the router's own link format, without importing the router in a helper */
function hrefFor(to: string) {
  return import.meta.env.VITE_ROUTER === 'hash' ? '#' + to.replace(/^\//, '').split('/').join('--') : to
}

/* ============================ people ============================ */

function PeoplePanel({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const f = FORMATS[d.format]
  const [school, setSchool] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [newTeam, setNewTeam] = useState({ name: '', inst: d.institutions[0]?.id ?? '', speakers: '' })
  const [newJudge, setNewJudge] = useState({ name: '', inst: '', rating: 3 })
  const [conflict, setConflict] = useState({ a: '', b: '' })
  const drawn = d.rounds.some((r) => r.status !== 'setup')
  const linkFor = (token: string) => `${window.location.origin}${window.location.pathname}${hrefFor(`/tab/${ev.slug}/school/${token}`)}`
  const instName = (id: string | null) => d.institutions.find((i) => i.id === id)?.name ?? t('Independent')
  const nameOf = (id: string) => d.teams.find((x) => x.id === id)?.name ?? d.judges.find((x) => x.id === id)?.name ?? instName(id)

  return (
    <div className="grid gap-14">
      {/* schools */}
      <section>
        <h2 className="text-2xl font-bold">{t('Schools')}</h2>
        <p className="meta mt-1">
          {d.regOpen && !drawn ? t('Registration is open. Send each school its own link.') : t('Registration is closed.')}{' '}
          <button type="button" onClick={() => void act((x) => void (x.regOpen = !x.regOpen), 'Saved.')} className="text-oxblood underline">
            {d.regOpen ? t('Close registration') : t('Open registration')}
          </button>
        </p>
        <ul className="mt-4 grid gap-2">
          {d.institutions.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border-warm py-2">
              <span className="font-bold">{i.name}</span>
              <span className="meta">
                {d.kind === 'mun'
                  ? t('{n} delegates', { n: d.delegates.filter((x) => x.inst === i.id).length })
                  : `${t('{n} teams', { n: d.teams.filter((x) => x.inst === i.id).length })} · ${t('{n} judges', { n: d.judges.filter((x) => x.inst === i.id).length })}`}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    void navigator.clipboard?.writeText(linkFor(i.token))
                    setCopied(i.id)
                    window.setTimeout(() => setCopied(null), 1600)
                  }}
                >
                  {copied === i.id ? '✓ ' + t('Copied') : t('Copy registration link')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  title={t('Make a new link and stop the old one working')}
                  onClick={() =>
                    void act(
                      (x) => void (x.institutions.find((y) => y.id === i.id)!.token = makeCode(24).toLowerCase()),
                      'New link made. The old one no longer works.',
                    )
                  }
                >
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">{t('Make a new link and stop the old one working')}</span>
                </button>
              </span>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const name = school.trim()
            if (!name) return
            void act(
              (x) => void x.institutions.push({ id: uid(), name, code: name.slice(0, 3).toUpperCase(), token: makeCode(24).toLowerCase() }),
              'School added.',
            )
            setSchool('')
          }}
        >
          <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder={t('School name')} maxLength={80} className="paper-input max-w-xs" />
          <button type="submit" className="btn btn-ghost">
            <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add school')}
          </button>
        </form>
      </section>

      {d.kind === 'debate' && (
        <>
          {/* teams */}
          <section>
            <h2 className="text-2xl font-bold">
              {t('Teams')} · {d.teams.filter((x) => x.active).length}
            </h2>
            <p className="meta mt-1">
              {f.teamsPerRoom === 4
                ? t('British Parliamentary needs a multiple of 4 teams. Mark a team as a swing team to fill a room; swing teams never break.')
                : t('Two-team formats need an even number of teams. Add a swing team if one is short.')}
            </p>
            <Scroll>
              <table className="mt-4 w-full min-w-[40rem] text-[0.9375rem]">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <Th>{t('Team')}</Th>
                    <Th>{t('School')}</Th>
                    <Th>{t('Speakers')}</Th>
                    <Th>{t('Status')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {d.teams.map((tm) => (
                    <tr key={tm.id} className={`border-b border-border-warm ${tm.active ? '' : 'opacity-50'}`}>
                      <Td>
                        <span className="font-bold">{tm.name}</span>
                        {tm.swing && <span className="ms-2 font-mono text-[0.7rem] text-charcoal uppercase">{t('swing')}</span>}
                      </Td>
                      <Td>{instName(tm.inst)}</Td>
                      <Td>{tm.speakers.map((s) => s.name).join(', ')}</Td>
                      <Td>
                        <span className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="font-mono text-[0.75rem] text-oxblood underline"
                            onClick={() => void act((x) => void (x.teams.find((y) => y.id === tm.id)!.active = !tm.active), 'Saved.')}
                          >
                            {tm.active ? t('withdraw') : t('reinstate')}
                          </button>
                          <button
                            type="button"
                            className="font-mono text-[0.75rem] text-oxblood underline"
                            onClick={() => void act((x) => void (x.teams.find((y) => y.id === tm.id)!.swing = !tm.swing), 'Saved.')}
                          >
                            {tm.swing ? t('not swing') : t('make swing')}
                          </button>
                          {!drawn && (
                            <button
                              type="button"
                              className="font-mono text-[0.75rem] text-charcoal underline"
                              onClick={() => void act((x) => void (x.teams = x.teams.filter((y) => y.id !== tm.id)), 'Team removed.')}
                            >
                              {t('remove')}
                            </button>
                          )}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Scroll>
            <form
              className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]"
              onSubmit={(e) => {
                e.preventDefault()
                const sp = newTeam.speakers
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                if (!newTeam.name.trim() || !newTeam.inst) return
                void act(
                  (x) =>
                    void x.teams.push({
                      id: uid(),
                      name: newTeam.name.trim(),
                      inst: newTeam.inst,
                      active: true,
                      speakers: Array.from({ length: f.speakers }, (_, k) => ({ id: uid(), name: sp[k] ?? `${t('Speaker {n}', { n: k + 1 })}` })),
                    }),
                  'Team added.',
                )
                setNewTeam({ ...newTeam, name: '', speakers: '' })
              }}
            >
              <input
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder={t('Team name')}
                maxLength={60}
                className="paper-input"
              />
              <select value={newTeam.inst} onChange={(e) => setNewTeam({ ...newTeam, inst: e.target.value })} className="paper-input" aria-label={t('School')}>
                {d.institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <input
                value={newTeam.speakers}
                onChange={(e) => setNewTeam({ ...newTeam, speakers: e.target.value })}
                placeholder={t('Speakers, separated by commas (initials are fine)')}
                className="paper-input"
              />
              <button type="submit" className="btn btn-ghost" disabled={!d.institutions.length}>
                <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add team')}
              </button>
            </form>
          </section>

          {/* judges */}
          <section>
            <h2 className="text-2xl font-bold">
              {t('Judges')} · {d.judges.filter((x) => x.active).length}
            </h2>
            <p className="meta mt-1">{t('Ratings from 1 to 5 decide who chairs. Only directors see them. Rating 1 judges sit as trainees.')}</p>
            <Scroll>
              <table className="mt-4 w-full min-w-[40rem] text-[0.9375rem]">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <Th>{t('Judge')}</Th>
                    <Th>{t('School')}</Th>
                    <Th>{t('Rating')}</Th>
                    <Th>{t('Code')}</Th>
                    <Th>{t('Status')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {d.judges.map((j) => (
                    <tr key={j.id} className={`border-b border-border-warm ${j.active ? '' : 'opacity-50'}`}>
                      <Td>
                        <span className="font-bold">{j.name}</span>
                      </Td>
                      <Td>{instName(j.inst)}</Td>
                      <Td>
                        <span className="inline-flex" role="group" aria-label={t('Rating')}>
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              type="button"
                              aria-pressed={j.rating === r}
                              onClick={() => void act((x) => void (x.judges.find((y) => y.id === j.id)!.rating = r))}
                              className={`grid h-9 w-8 place-items-center font-mono text-[0.8125rem] ${j.rating >= r ? 'text-oxblood' : 'text-border-warm'}`}
                              aria-label={`${r}`}
                            >
                              ★
                            </button>
                          ))}
                        </span>
                      </Td>
                      <Td>
                        <code dir="ltr" className="font-mono text-[0.8125rem]">
                          {j.code}
                        </code>
                        <button
                          type="button"
                          className="ms-2 font-mono text-[0.7rem] text-charcoal underline"
                          onClick={() =>
                            void act((x) => void (x.judges.find((y) => y.id === j.id)!.code = makeCode(10)), 'New code made. The old one no longer works.')
                          }
                        >
                          {t('new code')}
                        </button>
                      </Td>
                      <Td>
                        <button
                          type="button"
                          className="font-mono text-[0.75rem] text-oxblood underline"
                          onClick={() => void act((x) => void (x.judges.find((y) => y.id === j.id)!.active = !j.active), 'Saved.')}
                        >
                          {j.active ? t('mark away') : t('mark here')}
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Scroll>
            <form
              className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newJudge.name.trim()) return
                void act(
                  (x) =>
                    void x.judges.push({
                      id: uid(),
                      name: newJudge.name.trim(),
                      inst: newJudge.inst || null,
                      rating: newJudge.rating,
                      code: makeCode(10),
                      active: true,
                    }),
                  'Judge added.',
                )
                setNewJudge({ ...newJudge, name: '' })
              }}
            >
              <input
                value={newJudge.name}
                onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })}
                placeholder={t('Judge name')}
                maxLength={60}
                className="paper-input"
              />
              <select
                value={newJudge.inst}
                onChange={(e) => setNewJudge({ ...newJudge, inst: e.target.value })}
                className="paper-input"
                aria-label={t('School')}
              >
                <option value="">{t('Independent')}</option>
                {d.institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <select
                value={newJudge.rating}
                onChange={(e) => setNewJudge({ ...newJudge, rating: Number(e.target.value) })}
                className="paper-input"
                aria-label={t('Rating')}
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    ★ {r}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-ghost">
                <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add judge')}
              </button>
            </form>
            <div className="mt-8">
              <JudgeCodes ev={ev} />
            </div>
          </section>

          {/* conflicts */}
          <section>
            <h2 className="text-2xl font-bold">{t('Conflicts')}</h2>
            <p className="meta mt-1">
              {t(
                'Judges never sit with teams from their own school. Add anything else here: a judge and a team, a judge and a school, two judges, or two teams.',
              )}
            </p>
            <ul className="mt-3 grid gap-1">
              {d.conflicts.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-b border-border-warm py-1.5">
                  <span>
                    {nameOf(c.a)} <span className="text-oxblood">×</span> {nameOf(c.b)}
                  </span>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center hover:text-oxblood"
                    onClick={() => void act((x) => void x.conflicts.splice(i, 1), 'Conflict removed.')}
                    aria-label={t('Remove')}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault()
                if (!conflict.a || !conflict.b || conflict.a === conflict.b) return
                void act((x) => void x.conflicts.push({ ...conflict }), 'Conflict added.')
                setConflict({ a: '', b: '' })
              }}
            >
              {(['a', 'b'] as const).map((k) => (
                <select
                  key={k}
                  value={conflict[k]}
                  onChange={(e) => setConflict({ ...conflict, [k]: e.target.value })}
                  className="paper-input"
                  aria-label={k === 'a' ? t('First') : t('Second')}
                >
                  <option value="">{k === 'a' ? t('Choose a judge or team') : t('Choose who they conflict with')}</option>
                  <optgroup label={t('Judges')}>
                    {d.judges.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={t('Teams')}>
                    {d.teams.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </optgroup>
                  {k === 'b' && (
                    <optgroup label={t('Schools')}>
                      {d.institutions.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              ))}
              <button type="submit" className="btn btn-ghost">
                <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add conflict')}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  )
}

/* ============================ results ============================ */

function ResultsPanel({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const st = standings(d)
  const sp = speakerTab(d)
  const brk = breakingTeams(d)
  const school = (id: string) => d.institutions.find((i) => i.id === id)?.name ?? ''
  const rows = st.map((s) => ({
    id: s.team.id,
    name: s.team.name,
    inst: s.team.inst,
    points: s.points,
    wins: s.wins,
    ballots: s.ballots,
    speaks: Math.round(s.speaks * 100) / 100,
    rank: s.rank,
  }))
  const confirmed = d.rounds.filter((r) => r.status === 'confirmed').length

  const exportCsv = (name: string, head: string[], body: (string | number)[][]) => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const csv = '﻿' + [head, ...body].map((r) => r.map(esc).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${ev.slug}-${name}.csv`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  return (
    <div className="grid gap-12">
      <div className="no-print flex flex-wrap gap-2">
        <button
          type="button"
          className={d.resultsPublic ? 'btn btn-ghost' : 'btn btn-primary'}
          onClick={() => void act((x) => void (x.resultsPublic = !x.resultsPublic), d.resultsPublic ? 'Results are private again.' : 'Results are public.')}
        >
          {d.resultsPublic ? t('Hide results from the public') : t('Publish results')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            exportCsv(
              'team-tab',
              ['Rank', 'Team', 'School', d.format === 'BP' ? 'Points' : 'Wins', 'Ballots', 'Speaker points', 'Breaks'],
              rows.map((r) => [r.rank, r.name, school(r.inst), d.format === 'BP' ? r.points : r.wins, r.ballots, r.speaks, brk.includes(r.id) ? 'yes' : '']),
            )
          }
        >
          <Download aria-hidden="true" className="h-4 w-4" /> {t('Team tab CSV')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            exportCsv(
              'speaker-tab',
              ['Rank', 'Speaker', 'Team', 'Total', 'Rounds', 'Average'],
              sp.map((s) => [s.rank, s.name, s.team.name, s.total, s.rounds, s.average]),
            )
          }
        >
          <Download aria-hidden="true" className="h-4 w-4" /> {t('Speaker tab CSV')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            exportCsv(
              'ballots',
              ['Round', 'Room', 'Judge', 'Team', 'Scores', 'Total', 'Reason', 'Submitted'],
              d.rounds.flatMap((r) =>
                r.ballots.flatMap((b) => {
                  const deb = r.debates.find((x) => x.id === b.debate)
                  return Object.entries(b.scores).map(([tid, s]) => [
                    r.n,
                    deb ? roomName(d, deb.room) : '',
                    d.judges.find((j) => j.id === b.judge)?.name ?? '',
                    d.teams.find((x) => x.id === tid)?.name ?? '',
                    s.join(' '),
                    s.reduce((a, c) => a + c, 0),
                    b.reason,
                    new Date(b.at).toISOString(),
                  ])
                }),
              ),
            )
          }
        >
          <Download aria-hidden="true" className="h-4 w-4" /> {t('All ballots CSV')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          <Printer aria-hidden="true" className="h-4 w-4" /> {t('Print or save as PDF')}
        </button>
      </div>

      {confirmed === 0 ? (
        <Notice>{t('Standings appear here once a round is confirmed.')}</Notice>
      ) : (
        <>
          <section>
            <h2 className="text-2xl font-bold">
              {t('Team standings')} · {t('after round {n}', { n: confirmed })}
            </h2>
            <div className="mt-4">
              <StandingsTable rows={rows} format={d.format} breaking={brk} teamSchool={(id) => school(d.teams.find((x) => x.id === id)?.inst ?? '')} />
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold">{t('Speaker standings')}</h2>
            <div className="mt-4">
              <SpeakerTable
                rows={sp.map((s) => ({
                  id: s.id,
                  name: s.name,
                  team: s.team.name,
                  total: Math.round(s.total * 100) / 100,
                  rounds: s.rounds,
                  average: s.average,
                  rank: s.rank,
                }))}
              />
            </div>
          </section>
        </>
      )}

      <section className="no-print border-t-2 border-oxblood pt-4">
        <h2 className="text-2xl font-bold">{t('Finish the event')}</h2>
        <p className="meta mt-1">{t('Finishing adds this event’s motions to the Ramz-e-Fikr motions archive. You can undo it.')}</p>
        <button
          type="button"
          className="btn btn-ghost mt-3"
          onClick={() =>
            void act((x) => void (x.finished = !x.finished), d.finished ? 'Event reopened.' : 'Event finished. Its motions are now in the archive.')
          }
        >
          {d.finished ? t('Reopen the event') : t('Mark the event finished')}
        </button>
      </section>
    </div>
  )
}

/* ============================ announcements ============================ */

function NewsPanel({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const [text, setText] = useState('')
  const list = [...ev.doc.announcements].sort((a, b) => b.at - a.at)
  return (
    <div className="grid max-w-3xl gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          void act((x) => void x.announcements.push({ id: uid(), text: text.trim(), at: Date.now() }), 'Announcement sent to every screen.')
          setText('')
        }}
        className="grid gap-2"
      >
        <Field label={t('New announcement (shows on the event ticker and the projector)')}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={240} className="paper-area" />
        </Field>
        <button type="submit" className="btn btn-primary justify-self-start">
          {t('Announce')}
        </button>
      </form>
      <ul>
        {list.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 border-b border-border-warm py-3">
            <span>
              <span className="block">{a.text}</span>
              <span className="meta">{new Date(a.at).toLocaleString()}</span>
            </span>
            <button
              type="button"
              onClick={() => void act((x) => void (x.announcements = x.announcements.filter((y) => y.id !== a.id)), 'Removed.')}
              className="grid h-9 w-9 shrink-0 place-items-center hover:text-oxblood"
              aria-label={t('Remove')}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================ setup ============================ */

function SetupPanel({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const { user } = useSession()
  const d = ev.doc
  const [f, setF] = useState({ ...d, roomsText: d.rooms.map((r) => r.name).join('\n') })
  const [email, setEmail] = useState('')
  const [dirs, setDirs] = useState<{ id: string; name: string }[]>([])
  const [dirMsg, setDirMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => void tab.directors(ev).then(setDirs), [ev])
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))
  const used = new Set(d.rounds.flatMap((r) => r.debates.map((x) => x.room)))

  function save() {
    void act((x) => {
      x.name = f.name.trim() || x.name
      x.urdu = f.urdu.trim()
      x.start = f.start
      x.end = f.end || f.start
      x.venue = f.venue.trim()
      x.prep = f.prep
      x.scoreMin = f.scoreMin
      x.scoreMax = f.scoreMax
      x.replyMin = f.replyMin
      x.replyMax = f.replyMax
      x.breakSize = f.breakSize
      x.roundsPlanned = f.roundsPlanned
      x.pairing = f.pairing
      x.paperMinutes = Number.isFinite(f.paperMinutes as number) ? f.paperMinutes : null
      // keep room ids for rooms that are still listed, so existing draws stay valid
      const names = lines(f.roomsText)
      const kept = names.map((name) => x.rooms.find((r) => r.name === name) ?? { id: uid(), name })
      for (const r of x.rooms) if (used.has(r.id) && !kept.includes(r)) kept.push(r)
      x.rooms = kept
    }, 'Setup saved.')
  }

  return (
    <div className="grid max-w-3xl gap-12">
      <section className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('Event name')}>
            <input value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={80} className="paper-input" />
          </Field>
          <Field label={t('Name in Urdu (optional)')}>
            <input value={f.urdu} onChange={(e) => set('urdu', e.target.value)} maxLength={80} dir="rtl" lang="ur" className="paper-input urdu-ui" />
          </Field>
          <Field label={t('First day')}>
            <input type="date" value={f.start} onChange={(e) => set('start', e.target.value)} className="paper-input" />
          </Field>
          <Field label={t('Last day')}>
            <input type="date" value={f.end} onChange={(e) => set('end', e.target.value)} className="paper-input" />
          </Field>
          <Field label={t('Venue')}>
            <input value={f.venue} onChange={(e) => set('venue', e.target.value)} maxLength={80} className="paper-input" />
          </Field>
          {d.kind === 'debate' && (
            <Field label={t('Prep minutes')}>
              <NumberIn value={f.prep} min={1} max={60} onChange={(v) => set('prep', v)} />
            </Field>
          )}
        </div>
        {d.kind === 'debate' && (
          <>
            <div className="grid gap-5 sm:grid-cols-4">
              <Field label={t('Speaker scores from')}>
                <NumberIn value={f.scoreMin} min={0} max={200} onChange={(v) => set('scoreMin', v)} />
              </Field>
              <Field label={t('to')}>
                <NumberIn value={f.scoreMax} min={0} max={200} onChange={(v) => set('scoreMax', v)} />
              </Field>
              {FORMATS[d.format].reply && (
                <>
                  <Field label={t('Reply scores from')}>
                    <NumberIn value={f.replyMin} min={0} max={100} onChange={(v) => set('replyMin', v)} />
                  </Field>
                  <Field label={t('to')}>
                    <NumberIn value={f.replyMax} min={0} max={100} onChange={(v) => set('replyMax', v)} />
                  </Field>
                </>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('Preliminary rounds')}>
                <NumberIn value={f.roundsPlanned} min={1} max={9} onChange={(v) => set('roundsPlanned', v)} />
              </Field>
              <Field label={t('Teams that break')}>
                <NumberIn value={f.breakSize} min={0} max={64} onChange={(v) => set('breakSize', v)} />
              </Field>
              <Field label={t('Minutes from round end to results, on paper (your estimate)')}>
                <NumberIn value={f.paperMinutes ?? NaN} min={0} max={600} onChange={(v) => set('paperMinutes', v)} />
              </Field>
            </div>
            {FORMATS[d.format].teamsPerRoom === 2 && (
              <fieldset>
                <legend className="label">{t('Power pairing inside a bracket')}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Choice on={f.pairing === 'slide'} onClick={() => set('pairing', 'slide')}>
                    {t('Slide: first meets the middle')}
                  </Choice>
                  <Choice on={f.pairing === 'fold'} onClick={() => set('pairing', 'fold')}>
                    {t('Fold: first meets last')}
                  </Choice>
                </div>
              </fieldset>
            )}
            <Field label={t('Rooms, one per line')} hint={t('Rooms already used in a draw are kept.')}>
              <textarea value={f.roomsText} onChange={(e) => set('roomsText', e.target.value)} rows={5} className="paper-area" />
            </Field>
          </>
        )}
        <button type="button" onClick={save} className="btn btn-primary justify-self-start">
          {t('Save setup')}
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-bold">{t('Directors')}</h2>
        <ul className="mt-3 grid gap-1">
          {dirs.map((x) => (
            <li key={x.id} className="border-b border-border-warm py-1.5">
              {x.name}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setDirMsg(null)
            tab.addDirector(ev, email).then(
              (name) => {
                setDirMsg(t('{name} is now a director.', { name }))
                setEmail('')
                void tab.load(ev.slug).then((x) => x && void tab.directors(x).then(setDirs))
              },
              (err: Error) => setDirMsg(err.message),
            )
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('Their sign-in email')}
            dir="ltr"
            className="paper-input max-w-xs"
            required
          />
          <button type="submit" className="btn btn-ghost">
            {t('Add director')}
          </button>
        </form>
        {dirMsg && <p className="meta mt-2">{t(dirMsg)}</p>}
      </section>

      {user?.role === 'owner' && (
        <section className="border-t-2 border-oxblood pt-4">
          <h2 className="text-2xl font-bold">{t('Delete this event')}</h2>
          <p className="meta mt-1">{t('Deletes every team, judge, ballot and result for this event. This cannot be undone.')}</p>
          {confirmDelete ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  void tab.remove(ev).then(() => {
                    window.location.hash = ''
                    window.location.assign(window.location.pathname + hrefFor('/tab'))
                  })
                }
              >
                {t('Yes, delete it')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                {t('Cancel')}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost mt-3" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" className="h-4 w-4" /> {t('Delete event')}
            </button>
          )}
        </section>
      )}
    </div>
  )
}

/* ============================ MUN ============================ */

function MunPanel({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const [cid, setCid] = useState(d.committees[0]?.id ?? '')
  const [newC, setNewC] = useState({ name: '', agenda: '' })
  const [alloc, setAlloc] = useState(false)
  const c = d.committees.find((x) => x.id === cid) ?? d.committees[0]

  return (
    <div className="grid gap-12">
      <section>
        <div className="flex flex-wrap gap-2">
          {d.committees.map((x) => (
            <Choice key={x.id} on={c?.id === x.id} onClick={() => setCid(x.id)}>
              {x.name}
            </Choice>
          ))}
        </div>
        <form
          className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
          onSubmit={(e) => {
            e.preventDefault()
            if (!newC.name.trim()) return
            const id = uid()
            void act(
              (x) => void x.committees.push({ id, name: newC.name.trim(), agenda: newC.agenda.trim(), speakers: [], speakSeconds: 90 }),
              'Committee added.',
            )
            setCid(id)
            setNewC({ name: '', agenda: '' })
          }}
        >
          <input value={newC.name} onChange={(e) => setNewC({ ...newC, name: e.target.value })} placeholder={t('Committee name')} className="paper-input" />
          <input value={newC.agenda} onChange={(e) => setNewC({ ...newC, agenda: e.target.value })} placeholder={t('Agenda')} className="paper-input" />
          <button type="submit" className="btn btn-ghost">
            <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add committee')}
          </button>
        </form>
      </section>

      <section>
        <button type="button" className="btn btn-ghost" aria-expanded={alloc} onClick={() => setAlloc((a) => !a)}>
          {t('Allocate countries to schools')}
        </button>
        {alloc && <Allocation ev={ev} act={act} />}
      </section>

      {c && <CommitteeRoom key={c.id} ev={ev} act={act} committee={c.id} />}
    </div>
  )
}

function Allocation({ ev, act }: { ev: TabEvent; act: Act }) {
  const { t } = useT()
  const d = ev.doc
  const [countries, setCountries] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      d.committees.map((c) => [
        c.id,
        d.delegates
          .filter((x) => x.committee === c.id)
          .map((x) => x.country)
          .join('\n'),
      ]),
    ),
  )
  const [req, setReq] = useState<Record<string, number>>(() =>
    Object.fromEntries(d.institutions.map((i) => [i.id, d.delegates.filter((x) => x.inst === i.id).length || 2])),
  )
  return (
    <div className="mt-4 grid gap-6 border border-ink bg-ivory px-5 py-5">
      <Notice>
        {t(
          'List the countries in each committee, and how many delegates each school brings. Seats are spread so a school does not hold two seats in one committee when that can be avoided.',
        )}
      </Notice>
      <div className="grid gap-5 md:grid-cols-2">
        {d.committees.map((c) => (
          <Field key={c.id} label={t('Countries in {name}, one per line', { name: c.name })}>
            <textarea value={countries[c.id] ?? ''} onChange={(e) => setCountries({ ...countries, [c.id]: e.target.value })} rows={6} className="paper-area" />
          </Field>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {d.institutions.map((i) => (
          <Field key={i.id} label={t('Delegates from {name}', { name: i.name })}>
            <NumberIn value={req[i.id] ?? 0} min={0} max={60} onChange={(v) => setReq({ ...req, [i.id]: v })} />
          </Field>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary justify-self-start"
        onClick={() =>
          void act((x) => {
            const seats = allocateCountries(
              x,
              Object.fromEntries(Object.entries(countries).map(([k, v]) => [k, lines(v)])),
              Object.entries(req).map(([inst, n]) => ({ inst, delegates: Number.isFinite(n) ? n : 0 })),
            )
            x.delegates = seats.map((s): Delegate => {
              const old = x.delegates.find((o) => o.committee === s.committee && o.country === s.country)
              return {
                id: old?.id ?? uid(),
                committee: s.committee,
                country: s.country,
                inst: s.inst,
                name: old?.name ?? '',
                attendance: 'absent',
                score: old?.score ?? 0,
                award: old?.award ?? '',
              }
            })
            for (const c of x.committees) c.speakers = c.speakers.filter((id) => x.delegates.some((dl) => dl.id === id))
          }, 'Countries allocated.')
        }
      >
        {t('Allocate')}
      </button>
    </div>
  )
}

function CommitteeRoom({ ev, act, committee }: { ev: TabEvent; act: Act; committee: string }) {
  const { t } = useT()
  const d = ev.doc
  const c = d.committees.find((x) => x.id === committee)!
  const ds = d.delegates.filter((x) => x.committee === committee).sort((a, b) => a.country.localeCompare(b.country))
  const q = quorum(ds)
  const school = (id: string) => d.institutions.find((i) => i.id === id)?.name ?? ''
  const upd = (change: (cm: typeof c, all: TabDoc) => void, done?: string) =>
    act((x) => {
      const cm = x.committees.find((y) => y.id === committee)
      if (cm) change(cm, x)
    }, done)
  const updDel = (id: string, change: (dl: Delegate) => void) => act((x) => void change(x.delegates.find((y) => y.id === id)!))

  // the speaking timer runs on this screen only
  const [left, setLeft] = useState(c.speakSeconds)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [running])

  return (
    <div className="grid gap-10">
      <header>
        <h2 className="text-3xl font-bold">{c.name}</h2>
        <p className="meta mt-1">{c.agenda}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* roll call */}
        <section>
          <h3 className="text-xl font-bold">{t('Roll call')}</h3>
          <p className="meta mt-1">
            {t('{n} present', { n: q.present })} · {t('simple majority {n}', { n: q.simple })} · {t('two thirds {n}', { n: q.twoThirds })}
          </p>
          <ul className="mt-3 grid gap-1">
            {ds.map((dl) => (
              <li key={dl.id} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-border-warm py-1.5">
                <span className="min-w-0">
                  <span className="font-bold">{dl.country}</span> <span className="meta">{school(dl.inst)}</span>
                </span>
                <span className="inline-flex flex-wrap" role="group" aria-label={dl.country}>
                  {(['absent', 'present', 'voting'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={dl.attendance === a}
                      onClick={() => void updDel(dl.id, (x) => void (x.attendance = a))}
                      className={`min-h-9 border px-2 font-mono text-[0.7rem] ${dl.attendance === a ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm'}`}
                    >
                      {t(a === 'voting' ? 'present and voting' : a)}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          {ds.length === 0 && <p className="meta mt-2">{t('No delegates yet. Allocate countries first.')}</p>}
        </section>

        {/* speakers list */}
        <section>
          <h3 className="text-xl font-bold">{t('Speakers list')}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-3 bg-oxblood px-4 py-3 text-ivory">
            <span dir="ltr" className="numeral text-4xl text-gold tabular-nums">
              {mmss(left)}
            </span>
            <button type="button" className="btn !border-ivory !text-ivory" onClick={() => setRunning((r) => !r)}>
              {running ? t('Pause') : t('Start')}
            </button>
            <button
              type="button"
              className="btn !border-ivory !text-ivory"
              onClick={() => {
                setRunning(false)
                setLeft(c.speakSeconds)
              }}
            >
              {t('Reset')}
            </button>
            <label className="ms-auto flex items-center gap-2 text-sm">
              {t('Seconds')}
              <input
                type="number"
                dir="ltr"
                min={15}
                max={600}
                step={15}
                value={c.speakSeconds}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (v >= 15) {
                    setLeft(v)
                    void upd((cm) => void (cm.speakSeconds = v))
                  }
                }}
                className="w-20 border border-ivory bg-transparent px-2 py-1 text-ivory"
              />
            </label>
          </div>
          <ol className="mt-3 grid gap-1">
            {c.speakers.map((id, i) => (
              <li
                key={id + i}
                className={`flex items-center justify-between gap-2 border-b border-border-warm py-1.5 ${i === 0 ? 'font-bold text-oxblood' : ''}`}
              >
                <span>
                  {i + 1}. {ds.find((x) => x.id === id)?.country}
                </span>
                <button
                  type="button"
                  onClick={() => void upd((cm) => void cm.speakers.splice(i, 1))}
                  className="grid h-9 w-9 place-items-center"
                  aria-label={t('Remove')}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!c.speakers.length}
              onClick={() => {
                setRunning(false)
                setLeft(c.speakSeconds)
                void upd((cm) => void cm.speakers.shift(), 'Next speaker.')
              }}
            >
              {t('Next speaker')}
            </button>
            <select
              value=""
              onChange={(e) => e.target.value && void upd((cm) => void cm.speakers.push(e.target.value))}
              className="paper-input max-w-[14rem]"
              aria-label={t('Add a country to the list')}
            >
              <option value="">{t('Add a country to the list')}</option>
              {ds
                .filter((x) => x.attendance !== 'absent')
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.country}
                  </option>
                ))}
            </select>
          </div>
        </section>
      </div>

      {/* awards */}
      <section>
        <h3 className="text-xl font-bold">{t('Award scoring')}</h3>
        <p className="meta mt-1">
          {t(
            'Chairs score each delegate out of 50 across the conference. The director confirms the awards. Awards are public only when results are published.',
          )}
        </p>
        <Scroll>
          <table className="mt-3 w-full min-w-[36rem] text-[0.9375rem]">
            <thead>
              <tr className="border-b-2 border-ink">
                <Th>{t('Country')}</Th>
                <Th>{t('Delegate')}</Th>
                <Th num>{t('Score')}</Th>
                <Th>{t('Award')}</Th>
              </tr>
            </thead>
            <tbody>
              {[...ds]
                .sort((a, b) => b.score - a.score)
                .map((dl) => (
                  <tr key={dl.id} className="border-b border-border-warm">
                    <Td>
                      <span className="font-bold">{dl.country}</span>
                    </Td>
                    <Td>
                      <input
                        defaultValue={dl.name}
                        maxLength={60}
                        placeholder={t('Name or initials')}
                        onBlur={(e) => e.target.value !== dl.name && void updDel(dl.id, (x) => void (x.name = e.target.value.trim()))}
                        className="paper-input !py-1"
                        aria-label={t('Delegate for {country}', { country: dl.country })}
                      />
                    </Td>
                    <Td num>
                      <input
                        type="number"
                        dir="ltr"
                        min={0}
                        max={50}
                        defaultValue={dl.score}
                        onBlur={(e) =>
                          Number(e.target.value) !== dl.score &&
                          void updDel(dl.id, (x) => void (x.score = Math.max(0, Math.min(50, Number(e.target.value) || 0))))
                        }
                        className="paper-input !w-20 !py-1 text-center font-mono"
                        aria-label={t('Score for {country}', { country: dl.country })}
                      />
                    </Td>
                    <Td>
                      <select
                        value={dl.award}
                        onChange={(e) => void updDel(dl.id, (x) => void (x.award = e.target.value as Delegate['award']))}
                        className="paper-input !py-1"
                        aria-label={t('Award')}
                      >
                        <option value="">—</option>
                        {(['Best Delegate', 'Outstanding Delegate', 'Honourable Mention'] as const).map((a) => (
                          <option key={a} value={a}>
                            {t(a)}
                          </option>
                        ))}
                      </select>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Scroll>
        <button
          type="button"
          className={d.resultsPublic ? 'btn btn-ghost mt-4' : 'btn btn-primary mt-4'}
          onClick={() => void act((x) => void (x.resultsPublic = !x.resultsPublic), d.resultsPublic ? 'Awards are private again.' : 'Awards are public.')}
        >
          {d.resultsPublic ? t('Hide awards from the public') : t('Publish awards')}
        </button>
      </section>
    </div>
  )
}
