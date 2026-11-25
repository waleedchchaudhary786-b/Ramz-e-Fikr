/* Pages for people without accounts:
   a judge's ballot (by private code) and a school's registration (by private link). */
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2, WifiOff } from 'lucide-react'
import { LangSwitch, useT } from './i18n'
import { tab, type JudgeView, type SchoolPayload, type SchoolView } from './backend'
import { FORMATS } from './types'
import { BackLink, MotionCard, Notice, POSITION_NAMES, RoundStamp } from './ui'
import { PageHead } from '../views/PlaceholderView'

export default function Access({ kind, code }: { kind: 'judge' | 'school'; code: string }) {
  return kind === 'judge' ? <JudgePage code={code} /> : <SchoolPage token={code} />
}

/* ============================ judge ============================ */

const PENDING = (code: string) => `ramz.tab.pending.${code}`
type Pending = { round: number; debate: string; scores: Record<string, number[]>; reason: string }

function JudgePage({ code }: { code: string }) {
  const { t, lang } = useT()
  const [view, setView] = useState<JudgeView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Pending | null>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(PENDING(code)) ?? 'null')
    } catch {
      return null
    }
  })

  const load = useCallback(
    () =>
      tab.judgeView(code).then(
        (v) => {
          setView(v)
          setError(null)
        },
        (e: Error) => (navigator.onLine ? setError(e.message) : undefined),
      ),
    [code],
  )

  // send a ballot that was saved while offline
  const flush = useCallback(async () => {
    const p: Pending | null = JSON.parse(window.localStorage.getItem(PENDING(code)) ?? 'null')
    if (!p || !navigator.onLine) return
    try {
      await tab.submitBallot(code, p.round, p.debate, p.scores, p.reason)
      window.localStorage.removeItem(PENDING(code))
      setPending(null)
      void load()
    } catch (e) {
      if (navigator.onLine && !(e instanceof TypeError)) {
        // the database refused it: show why and stop retrying
        window.localStorage.removeItem(PENDING(code))
        setPending(null)
        setError((e as Error).message)
      }
    }
  }, [code, load])

  useEffect(() => {
    void load()
    void flush()
    const id = window.setInterval(() => {
      void load()
      void flush()
    }, 10000)
    const stop = tab.connected ? () => {} : tab.watch('', true, () => void load())
    const online = () => void flush()
    window.addEventListener('online', online)
    window.addEventListener('focus', online)
    return () => {
      window.clearInterval(id)
      stop()
      window.removeEventListener('online', online)
      window.removeEventListener('focus', online)
    }
  }, [load, flush])

  if (error && !view)
    return (
      <div className="wrap max-w-2xl py-16">
        <Notice tone="error">{t(error)}</Notice>
        <div className="mt-6">
          <BackLink to="/tab">{t('Try another code')}</BackLink>
        </div>
      </div>
    )
  if (!view) return <p className="wrap meta py-20">…</p>

  const { event, round, debate } = view
  const f = FORMATS[event.format]
  return (
    <div className="wrap max-w-3xl pt-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label">{lang === 'ur' && event.urdu ? event.urdu : event.name}</p>
        <LangSwitch />
      </div>
      <h1 className="mt-4 text-3xl font-black md:text-5xl">{t('Hello, {name}', { name: view.judge.name })}</h1>

      {pending && (
        <div className="mt-6">
          <Notice>
            <WifiOff aria-hidden="true" className="me-1 inline h-4 w-4" />
            {t('Your ballot is saved on this phone. It will send by itself when you are back online.')}
          </Notice>
        </div>
      )}
      {error && (
        <div className="mt-6">
          <Notice tone="error">{t(error)}</Notice>
        </div>
      )}

      {!round || !debate ? (
        <div className="mt-8">
          <Notice>{t('You have no room right now. This page updates by itself when the next draw is released.')}</Notice>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-bold">{t('Round {n}', { n: round.n })}</h2>
            <RoundStamp status={round.status as 'released'} />
          </div>
          <p className="mt-2 text-lg">
            {t('Your room')}: <strong className="font-display text-2xl">{debate.room}</strong> ·{' '}
            {debate.role === 'chair' ? t('You are the chair') : debate.role === 'panel' ? t('You are a panellist') : t('You are a trainee')}
          </p>
          <p className="meta mt-1">
            {t('Panel')}:{' '}
            {debate.panel.map((p) => `${p.name}${p.role === 'chair' ? ` (${t('chair')})` : p.role === 'trainee' ? ` (${t('trainee')})` : ''}`).join(', ')}
          </p>
          {round.motion && (
            <div className="mt-6">
              <MotionCard n={round.n} motion={round.motion} info={round.info} motionAt={round.motionAt} prep={event.prep} />
            </div>
          )}

          {debate.role === 'trainee' ? (
            <div className="mt-8">
              <Notice>{t('Trainees watch, take notes and give feedback. The panel submits the ballot.')}</Notice>
            </div>
          ) : event.format === 'BP' && debate.role !== 'chair' ? (
            <div className="mt-8">
              <Notice>{t('In British Parliamentary the chair submits one ballot after the panel agrees.')}</Notice>
            </div>
          ) : (
            <BallotForm
              key={`${round.n}-${debate.id}`}
              view={view}
              onSubmit={async (scores, reason) => {
                const p: Pending = { round: round.n, debate: debate.id, scores, reason }
                try {
                  await tab.submitBallot(code, p.round, p.debate, p.scores, p.reason)
                  await load()
                  return null
                } catch (e) {
                  if (!navigator.onLine || e instanceof TypeError) {
                    window.localStorage.setItem(PENDING(code), JSON.stringify(p))
                    setPending(p)
                    return null
                  }
                  return (e as Error).message
                }
              }}
            />
          )}
          <p className="meta mt-8">
            {f.speakers} {t('speakers per team')} · {t('Scores {a} to {b}', { a: event.scoreMin, b: event.scoreMax })}
            {f.reply && ` · ${t('Reply {a} to {b}', { a: event.replyMin, b: event.replyMax })}`}
          </p>
        </>
      )}
    </div>
  )
}

function BallotForm({ view, onSubmit }: { view: JudgeView; onSubmit: (scores: Record<string, number[]>, reason: string) => Promise<string | null> }) {
  const { t } = useT()
  const { event, debate } = view
  const f = FORMATS[event.format]
  const width = f.speakers + (f.reply ? 1 : 0)
  const [scores, setScores] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(debate!.teams.map((tm) => [tm.id, (view.ballot?.scores[tm.id] ?? []).map(String).concat(Array(width).fill('')).slice(0, width)])),
  )
  const [reason, setReason] = useState(view.ballot?.reason ?? '')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [done, setDone] = useState(!!view.ballot)
  if (!debate) return null

  const num = (s: string) => (s.trim() === '' ? NaN : Number(s))
  const totals = Object.fromEntries(debate.teams.map((tm) => [tm.id, scores[tm.id].map(num).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0)]))
  const complete = debate.teams.every((tm) => scores[tm.id].every((s) => Number.isFinite(num(s))))
  const order = [...debate.teams].sort((a, b) => totals[b.id] - totals[a.id])
  const tied = complete && new Set(Object.values(totals)).size !== debate.teams.length
  const places = ['1st', '2nd', '3rd', '4th']

  async function submit(e: FormEvent) {
    e.preventDefault()
    setProblem(null)
    // the same checks the database runs, so most mistakes are caught before sending
    for (const tm of debate!.teams)
      for (let i = 0; i < width; i++) {
        const v = num(scores[tm.id][i])
        const reply = f.reply && i === f.speakers
        const lo = reply ? event.replyMin : event.scoreMin
        const hi = reply ? event.replyMax : event.scoreMax
        if (!Number.isFinite(v) || v < lo || v > hi)
          return setProblem(t(reply ? 'Reply scores must be between {a} and {b}.' : 'Speaker scores must be between {a} and {b}.', { a: lo, b: hi }))
        if (Math.round(v * 2) !== v * 2) return setProblem(t('Scores go up in half points.'))
      }
    if (tied) return setProblem(t('Two teams have the same total. Adjust a score so every team has a different total.'))
    setBusy(true)
    const err = await onSubmit(Object.fromEntries(debate!.teams.map((tm) => [tm.id, scores[tm.id].map(num)])), reason.trim())
    setBusy(false)
    if (err) setProblem(t(err))
    else setDone(true)
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 border border-ink bg-ivory px-4 py-5 md:px-7 md:py-7" onChange={() => setDone(false)}>
      <h2 className="text-2xl font-bold">{t('Your ballot')}</h2>
      {done && view.ballot && (
        <div className="mt-3">
          <Notice tone="ok">{t('Ballot received. You can still change it until the director confirms the round.')}</Notice>
        </div>
      )}
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {debate.teams.map((tm, ti) => (
          <fieldset key={tm.id} className="border-t-2 border-ink pt-3">
            <legend className="sr-only">{tm.name}</legend>
            <p className="label">{t(POSITION_NAMES[event.format][ti])}</p>
            <p className="flex items-baseline justify-between gap-2">
              <span className="font-display text-xl font-bold">{tm.name}</span>
              <span dir="ltr" className="font-mono text-sm">
                {totals[tm.id].toFixed(1)}
              </span>
            </p>
            <div className="mt-2 grid gap-2">
              {Array.from({ length: width }, (_, i) => {
                const reply = f.reply && i === f.speakers
                const name = reply ? t('Reply') : (tm.speakers[i]?.name ?? t('Speaker {n}', { n: i + 1 }))
                return (
                  <label key={i} className="flex items-center justify-between gap-3">
                    <span className={reply ? 'italic' : ''}>{name}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step={0.5}
                      min={reply ? event.replyMin : event.scoreMin}
                      max={reply ? event.replyMax : event.scoreMax}
                      dir="ltr"
                      value={scores[tm.id][i]}
                      onChange={(e) => setScores((s) => ({ ...s, [tm.id]: s[tm.id].map((x, k) => (k === i ? e.target.value : x)) }))}
                      className="paper-input !w-24 text-center font-mono"
                      aria-label={`${tm.name}: ${name}`}
                    />
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {complete && !tied && (
        <p className="mt-5 border-s-2 border-gold ps-3" aria-live="polite">
          {event.format === 'BP' ? order.map((tm, i) => `${t(places[i])}: ${tm.name}`).join(' · ') : t('Winner: {team}', { team: order[0].name })}
        </p>
      )}

      <label className="mt-5 block">
        <span className="label">{t('Short reason for your decision')}</span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={800} className="paper-area mt-1" />
      </label>
      {problem && (
        <div className="mt-3">
          <Notice tone="error">{problem}</Notice>
        </div>
      )}
      <button type="submit" disabled={busy || !complete} className="btn btn-primary mt-5 w-full justify-center disabled:opacity-50 sm:w-auto">
        {busy ? t('Sending…') : view.ballot ? t('Update ballot') : t('Submit ballot')}
      </button>
    </form>
  )
}

/* ============================ school ============================ */

function SchoolPage({ token }: { token: string }) {
  const { t, lang } = useT()
  const [view, setView] = useState<SchoolView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [teams, setTeams] = useState<{ id?: string; name: string; speakers: string[] }[]>([])
  const [judges, setJudges] = useState<{ id?: string; name: string }[]>([])
  const [saved, setSaved] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      tab.schoolView(token).then(
        (v) => {
          setView(v)
          setTeams(v.teams.map((x) => ({ id: x.id, name: x.name, speakers: x.speakers.map((s) => s.name) })))
          setJudges(v.judges.map((x) => ({ id: x.id, name: x.name })))
        },
        (e: Error) => setError(e.message),
      ),
    [token],
  )
  useEffect(() => void load(), [load])

  if (error && !view)
    return (
      <div className="wrap max-w-2xl py-16">
        <Notice tone="error">{t(error)}</Notice>
      </div>
    )
  if (!view) return <p className="wrap meta py-20">…</p>
  const nspk = FORMATS[view.event.format].speakers
  const open = view.event.regOpen

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(null)
    try {
      const payload: SchoolPayload = { teams, judges }
      await tab.schoolSave(token, payload)
      await load()
      setSaved(t('Saved. You can come back to this link and change it until registration closes.'))
    } catch (err) {
      setError((err as Error).message)
    }
    setBusy(false)
  }

  return (
    <>
      <PageHead
        symbol="asterism"
        title={t('Registration')}
        purpose={`${view.institution.name} · ${lang === 'ur' && view.event.urdu ? view.event.urdu : view.event.name}`}
      />
      <div className="wrap max-w-3xl pb-16">
        <div className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="meta">{t('Keep this link private. Anyone with it can change your school’s entries.')}</p>
          <LangSwitch />
        </div>
        {!open && (
          <div className="mb-6">
            <Notice>{t('Registration is closed. Ask the tournament director to make changes.')}</Notice>
          </div>
        )}
        <form onSubmit={save} className="grid gap-10">
          <section>
            <h2 className="text-2xl font-bold">{t('Teams')}</h2>
            <p className="meta mt-1">{t('You may register speakers by initials only. Nothing else about them is asked for.')}</p>
            <ol className="mt-4 grid gap-5">
              {teams.map((tm, i) => (
                <li key={tm.id ?? i} className="border border-ink bg-ivory px-4 py-4">
                  <div className="flex items-end gap-3">
                    <label className="min-w-0 flex-1">
                      <span className="label">{t('Team name')}</span>
                      <input
                        value={tm.name}
                        disabled={!open}
                        maxLength={60}
                        required
                        onChange={(e) => setTeams((xs) => xs.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
                        className="paper-input mt-1"
                      />
                    </label>
                    {open && (
                      <button
                        type="button"
                        onClick={() => setTeams((xs) => xs.filter((_, k) => k !== i))}
                        className="btn btn-ghost"
                        aria-label={t('Remove {name}', { name: tm.name || t('team') })}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: nspk }, (_, k) => (
                      <label key={k}>
                        <span className="label">{t('Speaker {n}', { n: k + 1 })}</span>
                        <input
                          value={tm.speakers[k] ?? ''}
                          disabled={!open}
                          maxLength={60}
                          required
                          placeholder={t('Name or initials')}
                          onChange={(e) =>
                            setTeams((xs) =>
                              xs.map((x, j) =>
                                j === i ? { ...x, speakers: Array.from({ length: nspk }, (_, z) => (z === k ? e.target.value : (x.speakers[z] ?? ''))) } : x,
                              ),
                            )
                          }
                          className="paper-input mt-1"
                        />
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            {open && (
              <button type="button" onClick={() => setTeams((xs) => [...xs, { name: '', speakers: Array(nspk).fill('') }])} className="btn btn-ghost mt-4">
                <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add a team')}
              </button>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('Judges')}</h2>
            <p className="meta mt-1">{t('Judges never judge their own school. The director gives each judge a private ballot code.')}</p>
            <ul className="mt-4 grid gap-3">
              {judges.map((j, i) => (
                <li key={j.id ?? i} className="flex items-end gap-3">
                  <label className="min-w-0 flex-1">
                    <span className="label">{t('Judge {n}', { n: i + 1 })}</span>
                    <input
                      value={j.name}
                      disabled={!open}
                      maxLength={60}
                      required
                      onChange={(e) => setJudges((xs) => xs.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
                      className="paper-input mt-1"
                    />
                  </label>
                  {open && (
                    <button
                      type="button"
                      onClick={() => setJudges((xs) => xs.filter((_, k) => k !== i))}
                      className="btn btn-ghost"
                      aria-label={t('Remove {name}', { name: j.name || t('judge') })}
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {open && (
              <button type="button" onClick={() => setJudges((xs) => [...xs, { name: '' }])} className="btn btn-ghost mt-4">
                <Plus aria-hidden="true" className="h-4 w-4" /> {t('Add a judge')}
              </button>
            )}
          </section>

          {error && <Notice tone="error">{t(error)}</Notice>}
          {saved && <Notice tone="ok">{saved}</Notice>}
          {open && (
            <button type="submit" disabled={busy} className="btn btn-primary justify-self-start disabled:opacity-50">
              {busy ? t('Saving…') : t('Save registration')}
            </button>
          )}
        </form>
      </div>
    </>
  )
}
