/* Public event page, and the projector view for the hall screen. Updates live. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, MonitorUp } from 'lucide-react'
import { Link } from '../utils/router'
import { Reveal } from '../utils/motion'
import { useSession } from '../services/session'
import Ticker, { type TickerItem } from '../components/Ticker'
import { Tabs } from '../components/Bits'
import { Scribble } from '../components/Doodles'
import { LangSwitch, useT } from './i18n'
import { tab } from './backend'
import { quorum } from './engine'
import { FORMATS, type PublicDoc } from './types'
import { BackLink, DrawTable, MotionCard, Notice, PrepClock, RoundStamp, SpeakerTable, StandingsTable, dateRange, mmss } from './ui'

/** load the public copy by slug, then follow its changes */
function usePublic(slug: string) {
  const [state, setState] = useState<{ id: string | null; doc: PublicDoc | null; missing: boolean }>({ id: null, doc: null, missing: false })
  useEffect(() => {
    let alive = true
    let stop = () => {}
    const load = () =>
      tab.loadPublic(slug).then((r) => {
        if (!alive) return
        setState(r ? { id: r.id, doc: r.doc, missing: false } : { id: null, doc: null, missing: true })
        if (r && stop === noop) stop = tab.watch(r.id, false, load)
      })
    const noop = stop
    void load()
    return () => {
      alive = false
      stop()
    }
  }, [slug])
  return state
}

type Tab = 'draw' | 'results' | 'motions' | 'teams' | 'committees'

export default function EventPage({ slug, screen = false }: { slug: string; screen?: boolean }) {
  const { t, lang } = useT()
  const { user } = useSession()
  const { doc, missing } = usePublic(slug)
  const [tabSel, setTab] = useState<Tab>('draw')
  const [mine, setMine] = useState('')

  if (missing)
    return (
      <div className="wrap max-w-2xl py-16">
        <Notice>{t('This event does not exist, or it is not public yet.')}</Notice>
        <div className="mt-6">
          <BackLink to="/tab">{t('Tournaments')}</BackLink>
        </div>
      </div>
    )
  if (!doc) return <p className="wrap meta py-20">…</p>
  if (screen) return <ScreenView doc={doc} />

  const current = [...doc.rounds].sort((a, b) => b.n - a.n)[0]
  const school = (id: string) => doc.institutions.find((i) => i.id === id)?.name ?? ''
  const teamSchool = (tid: string) => school(doc.teams.find((x) => x.id === tid)?.inst ?? '')
  const tabs: { value: Tab; label: string }[] =
    doc.kind === 'mun'
      ? [
          { value: 'committees', label: t('Committees') },
          { value: 'teams', label: t('Schools') },
        ]
      : [
          { value: 'draw', label: t('Draw') },
          { value: 'results', label: t('Results') },
          { value: 'motions', label: t('Motions') },
          { value: 'teams', label: t('Teams') },
        ]
  const sel = tabs.some((x) => x.value === tabSel) ? tabSel : tabs[0].value

  return (
    <>
      <EventTicker doc={doc} slug={slug} />
      <header className="wrap pt-10 md:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink to="/tab">{t('Tournaments')}</BackLink>
          <div className="flex flex-wrap items-center gap-2">
            <LangSwitch />
            <Link to={`/tab/${slug}/screen`} className="btn btn-ghost">
              <MonitorUp aria-hidden="true" className="h-4 w-4" /> {t('Projector view')}
            </Link>
            {user && (user.role === 'editor' || user.role === 'owner') && (
              <Link to={`/tab/${slug}/manage`} className="btn btn-ghost">
                {t('Console')}
              </Link>
            )}
          </div>
        </div>
        <p className="label mt-8">{doc.kind === 'mun' ? t('Model UN') : t(FORMATS[doc.format].name)}</p>
        <h1 className="mt-2 max-w-4xl text-4xl leading-tight font-black md:text-6xl">{lang === 'ur' && doc.urdu ? doc.urdu : doc.name}</h1>
        {lang === 'en' && doc.urdu && <p className="urdu mt-2 text-2xl text-oxblood">{doc.urdu}</p>}
        <Scribble className="mt-2 block h-3 w-40 text-oxblood" />
        <p className="meta mt-3">
          {dateRange(doc.start, doc.end, lang)}
          {doc.venue && ` · ${doc.venue}`}
          {doc.finished && ` · ${t('Finished')}`}
        </p>
      </header>

      <div className="wrap mt-10">
        <Tabs id="event-tabs" tabs={tabs} value={sel} onChange={setTab} />

        <div className="mt-8" role="tabpanel">
          {sel === 'draw' && (
            <>
              {!current ? (
                <Notice>{t('The first draw has not been released yet. This page updates by itself.')}</Notice>
              ) : (
                <section aria-labelledby="round-h">
                  <div className="flex flex-wrap items-center gap-4">
                    <h2 id="round-h" className="text-3xl font-bold">
                      {t('Round {n}', { n: current.n })}
                    </h2>
                    <RoundStamp status={current.status} />
                  </div>
                  {current.motion ? (
                    <div className="mt-6">
                      <MotionCard
                        n={current.n}
                        motion={current.motion}
                        info={current.info}
                        motionAt={current.status === 'motion' ? current.motionAt : null}
                        prep={doc.prep}
                      />
                    </div>
                  ) : (
                    <p className="meta mt-3">{t('The motion is released at the start of prep, on every screen at once.')}</p>
                  )}
                  <label className="mt-8 flex max-w-sm flex-col gap-1">
                    <span className="label">{t('Find your team')}</span>
                    <select value={mine} onChange={(e) => setMine(e.target.value)} className="paper-input">
                      <option value="">{t('All rooms')}</option>
                      {doc.teams.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-4">
                    <DrawTable
                      doc={doc}
                      debates={mine ? current.debates.filter((d) => d.teams.includes(mine)) : current.debates}
                      highlight={mine}
                      results={current.results}
                    />
                  </div>
                </section>
              )}
            </>
          )}

          {sel === 'results' &&
            (doc.resultsPublic && doc.standings ? (
              <div className="grid gap-14">
                {doc.breaking && doc.breaking.length > 0 && (
                  <Reveal>
                    <section className="torn-wrap relative max-w-2xl">
                      <span className="tape -top-2.5 left-10 z-10 -rotate-3" aria-hidden="true" />
                      <div className="torn bg-parchment px-6 py-7">
                        <h2 className="hand text-3xl text-oxblood">{t('Breaking teams')}</h2>
                        <ol className="mt-3 grid gap-1 sm:grid-cols-2">
                          {doc.breaking.map((id, i) => (
                            <li key={id} className="flex items-baseline gap-3">
                              <span className="numeral text-xl text-oxblood">{i + 1}</span>
                              <span className="font-bold">{doc.teams.find((x) => x.id === id)?.name}</span>
                              <span className="meta">{teamSchool(id)}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </section>
                  </Reveal>
                )}
                <section>
                  <h2 className="text-2xl font-bold">{t('Team standings')}</h2>
                  <div className="mt-4">
                    <StandingsTable rows={doc.standings} format={doc.format} breaking={doc.breaking} teamSchool={teamSchool} />
                  </div>
                </section>
                <section>
                  <h2 className="text-2xl font-bold">{t('Speaker standings')}</h2>
                  <div className="mt-4">
                    <SpeakerTable rows={doc.speakerTab ?? []} />
                  </div>
                </section>
                <section>
                  <h2 className="text-2xl font-bold">{t('Results by round')}</h2>
                  {[...doc.rounds]
                    .filter((r) => r.results)
                    .sort((a, b) => b.n - a.n)
                    .map((r) => (
                      <div key={r.n} className="mt-6">
                        <h3 className="label !text-ink">{t('Round {n}', { n: r.n })}</h3>
                        <div className="mt-2">
                          <DrawTable doc={doc} debates={r.debates} results={r.results} />
                        </div>
                      </div>
                    ))}
                </section>
              </div>
            ) : (
              <Notice>{t('Results will appear here when the director releases them.')}</Notice>
            ))}

          {sel === 'motions' && (
            <ol className="grid gap-4">
              {doc.rounds.filter((r) => r.motion).length === 0 && <Notice>{t('No motions released yet.')}</Notice>}
              {doc.rounds
                .filter((r) => r.motion)
                .map((r) => (
                  <li key={r.n} className="border-b border-border-warm pb-4">
                    <p className="label">{t('Round {n}', { n: r.n })}</p>
                    <p className="mt-1 font-display text-xl font-bold italic">{r.motion}</p>
                    {r.info && <p className="meta mt-1">{r.info}</p>}
                  </li>
                ))}
            </ol>
          )}

          {sel === 'teams' && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {doc.institutions.map((i) => {
                const ts = doc.kind === 'mun' ? [] : doc.teams.filter((x) => x.inst === i.id)
                const ds = doc.kind === 'mun' ? doc.delegates.filter((x) => x.inst === i.id) : []
                return (
                  <section key={i.id} className="border-t-2 border-ink pt-3">
                    <h2 className="font-display text-xl font-bold">{i.name}</h2>
                    <ul className="mt-2 grid gap-1">
                      {ts.map((x) => (
                        <li key={x.id}>
                          <span className="font-bold">{x.name}</span> <span className="meta">{x.speakers.join(', ')}</span>
                        </li>
                      ))}
                      {ds.map((x) => (
                        <li key={x.id}>
                          <span className="font-bold">{x.country}</span> <span className="meta">{doc.committees.find((c) => c.id === x.committee)?.name}</span>
                        </li>
                      ))}
                      {ts.length + ds.length === 0 && <li className="meta">{t('Not registered yet')}</li>}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}

          {sel === 'committees' && (
            <div className="grid gap-10 lg:grid-cols-2">
              {doc.committees.map((c) => {
                const ds = doc.delegates.filter((d) => d.committee === c.id)
                return (
                  <section key={c.id} className="border border-ink bg-ivory px-5 py-5">
                    <h2 className="font-display text-2xl font-bold">{c.name}</h2>
                    <p className="meta mt-1">{c.agenda}</p>
                    <h3 className="label mt-4 !text-ink">{t('Speakers list')}</h3>
                    {c.speakers.length === 0 ? (
                      <p className="meta mt-1">{t('Empty')}</p>
                    ) : (
                      <ol className="mt-1 list-decimal ps-5">
                        {c.speakers.map((id) => (
                          <li key={id}>{ds.find((d) => d.id === id)?.country}</li>
                        ))}
                      </ol>
                    )}
                    <h3 className="label mt-4 !text-ink">{t('Delegations')}</h3>
                    <ul className="mt-1 grid grid-cols-2 gap-x-4 text-[0.9375rem]">
                      {ds.map((d) => (
                        <li key={d.id}>
                          {d.country}
                          {d.award && <span className="ms-1 font-mono text-[0.7rem] text-oxblood">· {t(d.award)}</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function EventTicker({ doc, slug }: { doc: PublicDoc; slug: string }) {
  const { t } = useT()
  const items: TickerItem[] = useMemo(
    () =>
      doc.announcements.length
        ? doc.announcements.map((a) => ({ key: a.id, to: `/tab/${slug}`, symbol: 'hand' as const, text: a.text }))
        : [{ key: 'none', to: `/tab/${slug}`, symbol: 'hand' as const, text: t('Announcements from the directors appear here.') }],
    [doc.announcements, t, slug],
  )
  return (
    <div dir="ltr" className="border-b border-ink/80 bg-parchment">
      <Ticker items={items} label={t('Announcements')} />
    </div>
  )
}

/* ============================ projector ============================ */

function ScreenView({ doc }: { doc: PublicDoc }) {
  const { t, lang } = useT()
  const ref = useRef<HTMLDivElement>(null)
  const current = [...doc.rounds].sort((a, b) => b.n - a.n)[0]
  const committee = doc.committees[0]
  return (
    <div ref={ref} className="min-h-[80vh] bg-ivory px-6 py-8 md:px-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl font-bold md:text-4xl">{lang === 'ur' && doc.urdu ? doc.urdu : doc.name}</p>
        <div className="flex gap-2">
          <LangSwitch />
          <button type="button" onClick={() => void ref.current?.requestFullscreen?.()} className="btn btn-ghost">
            <Maximize2 aria-hidden="true" className="h-4 w-4" /> {t('Full screen')}
          </button>
        </div>
      </div>
      {doc.kind === 'mun' && committee ? (
        <MunScreen doc={doc} />
      ) : !current ? (
        <p className="mt-16 font-display text-4xl italic">{t('The first draw has not been released yet.')}</p>
      ) : current.status === 'motion' && current.motion ? (
        <div className="mt-10 bg-oxblood px-8 py-12 text-ivory md:px-14">
          <p className="label !text-ivory/85">{t('Round {n} · Motion', { n: current.n })}</p>
          <p className="mt-4 font-display text-[clamp(2rem,5vw,4.5rem)] leading-tight font-bold italic">{current.motion}</p>
          {current.info && <p className="mt-4 text-xl text-ivory/90">{current.info}</p>}
          <div className="mt-8 text-gold">
            <PrepClock motionAt={current.motionAt} prep={doc.prep} big />
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center gap-4">
            <p className="text-4xl font-black md:text-6xl">{t('Round {n}', { n: current.n })}</p>
            <RoundStamp status={current.status} />
          </div>
          <div className="mt-6 text-xl md:text-2xl">
            <DrawTable doc={doc} debates={current.debates} results={current.results} />
          </div>
        </div>
      )}
      {doc.announcements[0] && <p className="mt-10 border-t border-ink pt-4 font-mono text-lg md:text-2xl">{doc.announcements[0].text}</p>}
    </div>
  )
}

function MunScreen({ doc }: { doc: PublicDoc }) {
  const { t } = useT()
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      {doc.committees.map((c) => {
        const ds = doc.delegates.filter((d) => d.committee === c.id)
        const q = quorum(ds.map(() => ({ attendance: 'present' })))
        return (
          <section key={c.id} className="border border-ink px-6 py-6">
            <p className="font-display text-3xl font-bold">{c.name}</p>
            <p className="meta mt-1 text-lg">{c.agenda}</p>
            <p className="label mt-6 !text-ink">{t('Speakers list')}</p>
            <ol className="mt-2 list-decimal ps-6 text-2xl">
              {c.speakers.slice(0, 6).map((id) => (
                <li key={id}>{ds.find((d) => d.id === id)?.country}</li>
              ))}
            </ol>
            <p className="meta mt-4">
              {t('Speaking time')}: <span dir="ltr">{mmss(c.speakSeconds)}</span> · {t('{n} delegations', { n: q.present })}
            </p>
          </section>
        )
      })}
    </div>
  )
}
