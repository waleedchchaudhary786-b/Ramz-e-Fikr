/* Ramz Tab routes:
   /tab                      tournaments (live, upcoming, past; yours)
   /tab/new                  event setup wizard (editors and owners)
   /tab/judge/<code>         a judge's ballot page
   /tab/impact               owner's impact numbers
   /tab/<slug>               public event page
   /tab/<slug>/manage        director console
   /tab/<slug>/screen        projector view
   /tab/<slug>/school/<tok>  a school's registration page */
import { lazy, Suspense, useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useRouter } from '../utils/router'
import { Reveal, RevealItem } from '../utils/motion'
import { useSession } from '../services/session'
import { PageHead } from '../views/PlaceholderView'
import { Scribble } from '../components/Doodles'
import { LangSwitch, TabLangProvider, useT } from './i18n'
import { tab, useLive, type EventSummary } from './backend'
import { blankEvent, makeCode, slugify, uid } from './engine'
import { FORMATS, SCORE_DEFAULTS, type Format, type Kind } from './types'
import { BackLink, Notice, dateRange } from './ui'

const EventPage = lazy(() => import('./EventPage'))
const Manage = lazy(() => import('./Manage'))
const Access = lazy(() => import('./Access'))
const Impact = lazy(() => import('./Impact'))

export default function TabView() {
  const { path } = useRouter()
  const p = path.split('/').filter(Boolean).slice(1)
  let page
  if (p.length === 0) page = <TabHome />
  else if (p[0] === 'new') page = <NewEvent />
  else if (p[0] === 'judge') page = <Access kind="judge" code={p[1] ?? ''} />
  else if (p[0] === 'impact') page = <Impact />
  else if (p[1] === 'manage') page = <Manage slug={p[0]} />
  else if (p[1] === 'screen') page = <EventPage slug={p[0]} screen />
  else if (p[1] === 'school') page = <Access kind="school" code={p[2] ?? ''} />
  else page = <EventPage slug={p[0]} />
  return (
    <TabLangProvider>
      <Suspense fallback={<p className="wrap meta py-20">…</p>}>{page}</Suspense>
    </TabLangProvider>
  )
}

/* ============================ home ============================ */

function TabHome() {
  const { t, lang } = useT()
  const { user } = useSession()
  const { navigate } = useRouter()
  const { data, loading } = useLive(() => tab.list(), null, false, [user?.id])
  const [code, setCode] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const open = data?.open ?? []
  const live = open.filter((e) => !e.finished && e.start <= today && (e.end || e.start) >= today)
  const upcoming = open.filter((e) => !e.finished && e.start > today)
  const past = open.filter((e) => e.finished || ((e.end || e.start) < today && !live.includes(e)))
  const canCreate = user && (user.role === 'editor' || user.role === 'owner')

  return (
    <>
      <PageHead
        symbol="asterism"
        title={t('Tournaments')}
        purpose={t('Run a debate tournament or MUN conference from phones. Draws, ballots and results in one place, in English and Urdu.')}
        note={t('Ramz Tab')}
      />
      <div className="wrap">
        <div className="-mt-4 mb-10 flex flex-wrap items-center gap-3">
          <LangSwitch />
          {canCreate && (
            <Link to="/tab/new" className="btn btn-primary">
              {t('Start an event')} <span aria-hidden="true">+</span>
            </Link>
          )}
          {user?.role === 'owner' && (
            <Link to="/tab/impact" className="btn btn-ghost">
              {t('Impact numbers')}
            </Link>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (code.trim()) navigate(`/tab/judge/${code.trim().toUpperCase()}`)
          }}
          className="mb-12 flex max-w-xl flex-wrap items-end gap-3 border border-ink bg-ivory px-5 py-5"
        >
          <label className="min-w-0 flex-1">
            <span className="label">{t('Judging today? Enter your judge code')}</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              dir="ltr"
              className="paper-input mt-1 font-mono tracking-widest uppercase"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            {t('Open ballot')} <ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
          </button>
        </form>

        {loading && <p className="meta">…</p>}
        {!loading && data && data.mine.length > 0 && <EventList title={t('Events you direct')} list={data.mine} lang={lang} manage />}
        {live.length > 0 && <EventList title={t('Live now')} list={live} lang={lang} />}
        {upcoming.length > 0 && <EventList title={t('Upcoming')} list={upcoming} lang={lang} />}
        {past.length > 0 && <EventList title={t('Past')} list={past} lang={lang} />}
        {!loading && open.length === 0 && (data?.mine.length ?? 0) === 0 && <p className="font-display text-xl italic">{t('No tournaments yet.')}</p>}
      </div>
    </>
  )
}

function EventList({ title, list, lang, manage = false }: { title: string; list: EventSummary[]; lang: string; manage?: boolean }) {
  const { t } = useT()
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Scribble className="mt-1 block h-2.5 w-24 text-oxblood" />
      <Reveal stagger onMount className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e, i) => (
          <RevealItem key={e.id}>
            <Link
              to={manage ? `/tab/${e.slug}/manage` : `/tab/${e.slug}`}
              className="index-card group block h-full px-5 pt-2.5 pb-8"
              style={{ '--tilt': ['-0.7deg', '0.6deg', '-0.4deg'][i % 3] } as React.CSSProperties}
            >
              <span className="meta block">{e.kind === 'mun' ? t('Model UN') : t(FORMATS[e.format].name)}</span>
              <span className="mt-1 block font-display text-xl leading-snug font-bold group-hover:text-oxblood">
                {lang === 'ur' && e.urdu ? e.urdu : e.name}
              </span>
              <span className="meta mt-2 block">
                {dateRange(e.start, e.end, lang)}
                {e.venue && ` · ${e.venue}`}
              </span>
              {manage && <span className="mt-3 block text-sm font-bold text-oxblood">{t('Open the console')} ⟶</span>}
            </Link>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  )
}

/* ============================ setup wizard ============================ */

const STEPS = ['Basics', 'Format', 'Rooms and motions', 'Schools', 'Check and create'] as const

function NewEvent() {
  const { t } = useT()
  const { user } = useSession()
  const { navigate } = useRouter()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [f, setF] = useState({
    name: '',
    urdu: '',
    slug: '',
    kind: 'debate' as Kind,
    start: '',
    end: '',
    venue: '',
    format: 'BP' as Format,
    rounds: 4,
    prep: 15,
    breakSize: 8,
    pairing: 'slide' as 'slide' | 'fold',
    ...SCORE_DEFAULTS.BP,
    rooms: 'Hall A\nRoom 1\nRoom 2\nRoom 3',
    motions: '',
    schools: '',
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  if (!user || (user.role !== 'editor' && user.role !== 'owner'))
    return (
      <div className="wrap max-w-2xl py-16">
        <Notice>{t('Only editors and owners can start an event. Ask an owner to make you an editor.')}</Notice>
        <div className="mt-6">
          <BackLink to="/tab">{t('Tournaments')}</BackLink>
        </div>
      </div>
    )

  const slug = f.slug || slugify(f.name)
  const ok = [f.name.trim().length >= 3 && !!f.start, f.scoreMin < f.scoreMax && f.rounds >= 1, f.kind === 'mun' || lines(f.rooms).length > 0, true, true]

  async function create(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      const motions = lines(f.motions)
      const doc = blankEvent({
        name: f.name.trim(),
        urdu: f.urdu.trim(),
        kind: f.kind,
        format: f.format,
        start: f.start,
        end: f.end || f.start,
        venue: f.venue.trim(),
        prep: f.prep,
        scoreMin: f.scoreMin,
        scoreMax: f.scoreMax,
        replyMin: f.replyMin,
        replyMax: f.replyMax,
        breakSize: f.breakSize,
        roundsPlanned: f.rounds,
        pairing: f.pairing,
        rooms: lines(f.rooms).map((name) => ({ id: uid(), name })),
        institutions: lines(f.schools).map((name) => ({ id: uid(), name, code: name.slice(0, 3).toUpperCase(), token: makeCode(24).toLowerCase() })),
        rounds:
          f.kind === 'debate'
            ? Array.from({ length: f.rounds }, (_, i) => ({
                n: i + 1,
                motion: motions[i] ?? '',
                info: '',
                status: 'setup' as const,
                seed: Math.floor(Math.random() * 1e9),
                debates: [],
                ballots: [],
              }))
            : [],
      })
      const ev = await tab.create(slug, doc, user.id)
      navigate(`/tab/${ev.slug}/manage`)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <>
      <PageHead symbol="asterism" title={t('Start an event')} purpose={t('Five short steps. Everything can be changed later in the console.')} />
      <div className="wrap max-w-3xl">
        <div className="-mt-4 mb-8 flex flex-wrap items-center justify-between gap-3">
          <BackLink to="/tab">{t('Tournaments')}</BackLink>
          <LangSwitch />
        </div>
        <ol className="mb-8 flex flex-wrap gap-2" aria-label={t('Steps')}>
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                aria-current={i === step ? 'step' : undefined}
                className={`min-h-11 border px-3 font-mono text-[0.8125rem] md:min-h-9 ${i === step ? 'border-oxblood bg-oxblood text-ivory' : i < step ? 'border-ink' : 'border-border-warm text-charcoal'}`}
              >
                {i + 1}. {t(s)}
              </button>
            </li>
          ))}
        </ol>

        <form onSubmit={create} className="border border-ink bg-ivory px-5 py-6 md:px-8 md:py-8">
          {step === 0 && (
            <div className="grid gap-5">
              <Field label={t('Event name')}>
                <input value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={80} className="paper-input" required />
              </Field>
              <Field label={t('Name in Urdu (optional)')}>
                <input value={f.urdu} onChange={(e) => set('urdu', e.target.value)} maxLength={80} dir="rtl" lang="ur" className="paper-input urdu-ui" />
              </Field>
              <Field label={t('Web address')} hint={`/tab/${slug}`}>
                <input
                  value={f.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder={slugify(f.name || 'event')}
                  dir="ltr"
                  className="paper-input font-mono"
                />
              </Field>
              <fieldset>
                <legend className="label">{t('Kind of event')}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['debate', 'mun'] as const).map((k) => (
                    <Choice key={k} on={f.kind === k} onClick={() => set('kind', k)}>
                      {k === 'debate' ? t('Debate tournament') : t('Model UN')}
                    </Choice>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t('First day')}>
                  <input type="date" value={f.start} onChange={(e) => set('start', e.target.value)} className="paper-input" required />
                </Field>
                <Field label={t('Last day')}>
                  <input type="date" value={f.end} min={f.start} onChange={(e) => set('end', e.target.value)} className="paper-input" />
                </Field>
              </div>
              <Field label={t('Venue')}>
                <input value={f.venue} onChange={(e) => set('venue', e.target.value)} maxLength={80} className="paper-input" />
              </Field>
            </div>
          )}

          {step === 1 &&
            (f.kind === 'mun' ? (
              <Notice>{t('Model UN has no draw. Committees and countries are set up in the console.')}</Notice>
            ) : (
              <div className="grid gap-5">
                <fieldset>
                  <legend className="label">{t('Format')}</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Object.keys(FORMATS) as Format[]).map((k) => (
                      <Choice
                        key={k}
                        on={f.format === k}
                        onClick={() => setF((x) => ({ ...x, format: k, ...SCORE_DEFAULTS[k], breakSize: FORMATS[k].teamsPerRoom === 4 ? 8 : 4 }))}
                      >
                        {t(FORMATS[k].name)}
                      </Choice>
                    ))}
                  </div>
                  <p className="meta mt-2">
                    {t('{n} teams per room', { n: FORMATS[f.format].teamsPerRoom })} · {t('{n} speakers per team', { n: FORMATS[f.format].speakers })}
                    {FORMATS[f.format].reply && ` · ${t('reply speeches')}`}
                  </p>
                </fieldset>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label={t('Preliminary rounds')}>
                    <NumberIn value={f.rounds} min={1} max={9} onChange={(v) => set('rounds', v)} />
                  </Field>
                  <Field label={t('Prep minutes')}>
                    <NumberIn value={f.prep} min={1} max={60} onChange={(v) => set('prep', v)} />
                  </Field>
                  <Field label={t('Teams that break')}>
                    <NumberIn value={f.breakSize} min={0} max={64} onChange={(v) => set('breakSize', v)} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t('Speaker scores from')}>
                    <NumberIn value={f.scoreMin} min={0} max={200} onChange={(v) => set('scoreMin', v)} />
                  </Field>
                  <Field label={t('to')}>
                    <NumberIn value={f.scoreMax} min={0} max={200} onChange={(v) => set('scoreMax', v)} />
                  </Field>
                  {FORMATS[f.format].reply && (
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
                {FORMATS[f.format].teamsPerRoom === 2 && (
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
              </div>
            ))}

          {step === 2 && (
            <div className="grid gap-5">
              {f.kind === 'debate' && (
                <Field label={t('Rooms, one per line')}>
                  <textarea value={f.rooms} onChange={(e) => set('rooms', e.target.value)} rows={6} className="paper-area" />
                </Field>
              )}
              {f.kind === 'debate' && (
                <Field label={t('Motions, one per line in round order (optional, private until you release them)')}>
                  <textarea value={f.motions} onChange={(e) => set('motions', e.target.value)} rows={5} className="paper-area" />
                </Field>
              )}
              {f.kind === 'mun' && <Notice>{t('Nothing to set here for Model UN.')}</Notice>}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <Field label={t('Schools taking part, one per line')} hint={t('Each school gets a private link to register its own teams and judges.')}>
                <textarea value={f.schools} onChange={(e) => set('schools', e.target.value)} rows={6} className="paper-area" />
              </Field>
            </div>
          )}

          {step === 4 && (
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[12rem_1fr]">
              <dt className="label">{t('Event name')}</dt>
              <dd>
                {f.name} {f.urdu && <span className="urdu-ui">· {f.urdu}</span>}
              </dd>
              <dt className="label">{t('Web address')}</dt>
              <dd dir="ltr" className="font-mono text-sm">
                /tab/{slug}
              </dd>
              <dt className="label">{t('Dates')}</dt>
              <dd>{dateRange(f.start, f.end || f.start, 'en')}</dd>
              {f.kind === 'debate' && (
                <>
                  <dt className="label">{t('Format')}</dt>
                  <dd>
                    {t(FORMATS[f.format].name)} · {t('{n} rounds', { n: f.rounds })} · {t('{n} break', { n: f.breakSize })}
                  </dd>
                  <dt className="label">{t('Rooms')}</dt>
                  <dd>{lines(f.rooms).join(', ')}</dd>
                  <dt className="label">{t('Motions ready')}</dt>
                  <dd>
                    {lines(f.motions).length} / {f.rounds}
                  </dd>
                </>
              )}
              <dt className="label">{t('Schools')}</dt>
              <dd>{lines(f.schools).join(', ') || t('None yet. Add them in the console.')}</dd>
            </dl>
          )}

          {error && (
            <div className="mt-5">
              <Notice tone="error">{error}</Notice>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border-warm pt-5">
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn btn-ghost disabled:opacity-40">
              {t('Back')}
            </button>
            {step < STEPS.length - 1 ? (
              // separate keys: reusing one element would let this click finish as a submit on the last step
              <button key="next" type="button" onClick={() => setStep((s) => s + 1)} disabled={!ok[step]} className="btn btn-primary disabled:opacity-50">
                {t('Next')} <ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
              </button>
            ) : (
              <button key="create" type="submit" disabled={busy || !ok[0]} className="btn btn-primary disabled:opacity-50">
                {busy ? t('Creating…') : t('Create event')}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

export const lines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="mt-1 block">{children}</span>
      {hint && <span className="meta mt-1 block">{hint}</span>}
    </label>
  )
}

export function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 border px-3 text-[0.9375rem] transition-colors md:min-h-9 ${on ? 'border-oxblood bg-oxblood text-ivory' : 'border-border-warm hover:border-oxblood'}`}
    >
      {children}
    </button>
  )
}

export function NumberIn({ value, min, max, step = 1, onChange }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      dir="ltr"
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
      className="paper-input font-mono"
    />
  )
}
