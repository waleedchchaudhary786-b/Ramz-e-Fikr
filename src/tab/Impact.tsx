/* Owner's impact numbers across every Ramz Tab event, with a CSV export. */
import { Download } from 'lucide-react'
import { useSession } from '../services/session'
import { CountUp } from '../utils/motion'
import { PageHead } from '../views/PlaceholderView'
import { LangSwitch, useT } from './i18n'
import { tab, useLive } from './backend'
import { BackLink, Notice, Scroll, Td, Th } from './ui'
import type { TabEvent } from './types'

/** minutes from the last ballot of a round to its confirmed results, averaged over the event's rounds */
function minutesToResults(e: TabEvent) {
  const gaps = e.doc.rounds.filter((r) => r.confirmedAt && r.lastBallotAt).map((r) => Math.max(0, (r.confirmedAt! - r.lastBallotAt!) / 60e3))
  return gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null
}

export function eventRow(e: TabEvent) {
  const d = e.doc
  const rounds = d.rounds.filter((r) => r.status === 'confirmed').length
  return {
    event: d.name,
    kind: d.kind,
    date: d.start,
    schools: d.institutions.length,
    teams: d.teams.filter((t) => t.active && !t.swing).length,
    delegates: d.delegates.length,
    rounds,
    ballots: d.rounds.reduce((a, r) => a + r.ballots.length, 0),
    minutes: minutesToResults(e),
    paper: d.paperMinutes,
    run: rounds > 0 || d.finished || d.delegates.some((x) => x.attendance !== 'absent'),
  }
}

export default function Impact() {
  const { t } = useT()
  const { user } = useSession()
  const { data } = useLive(() => tab.allEvents(), null, true, [user?.id])
  if (!user || user.role !== 'owner')
    return (
      <div className="wrap max-w-2xl py-16">
        <Notice>{t('Only owners can see the impact numbers.')}</Notice>
      </div>
    )
  const rows = (data ?? []).map(eventRow)
  const run = rows.filter((r) => r.run)
  const schools = new Set((data ?? []).flatMap((e) => e.doc.institutions.map((i) => i.name.trim().toLowerCase()))).size
  const timed = run.filter((r) => r.minutes !== null)
  const avg = timed.length ? timed.reduce((a, r) => a + (r.minutes ?? 0), 0) / timed.length : null
  const paper = run.filter((r) => r.paper !== null)
  const avgPaper = paper.length ? paper.reduce((a, r) => a + (r.paper ?? 0), 0) / paper.length : null
  const tiles: [string, number][] = [
    ['Events run', run.length],
    ['Schools', schools],
    ['Teams', run.reduce((a, r) => a + r.teams, 0)],
    ['Delegates', run.reduce((a, r) => a + r.delegates, 0)],
    ['Rounds', run.reduce((a, r) => a + r.rounds, 0)],
    ['Ballots submitted', run.reduce((a, r) => a + r.ballots, 0)],
  ]

  function exportCsv() {
    const head = [
      'Event',
      'Kind',
      'Date',
      'Schools',
      'Teams',
      'Delegates',
      'Rounds',
      'Ballots',
      'Minutes to results (Ramz Tab)',
      'Minutes to results (paper estimate)',
    ]
    const body = rows.map((r) => [
      r.event,
      r.kind,
      r.date,
      r.schools,
      r.teams,
      r.delegates,
      r.rounds,
      r.ballots,
      r.minutes === null ? '' : r.minutes.toFixed(1),
      r.paper ?? '',
    ])
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const csv = '﻿' + [head, ...body].map((r) => r.map(esc).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'ramz-tab-impact.csv'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  return (
    <>
      <PageHead symbol="asterism" title={t('Impact numbers')} purpose={t('What Ramz Tab has done so far, across every event. Owners only.')} />
      <div className="wrap pb-16">
        <div className="-mt-4 mb-8 flex flex-wrap items-center justify-between gap-3">
          <BackLink to="/tab">{t('Tournaments')}</BackLink>
          <div className="flex gap-2">
            <LangSwitch />
            <button type="button" onClick={exportCsv} className="btn btn-primary">
              <Download aria-hidden="true" className="h-4 w-4" /> {t('Export CSV')}
            </button>
          </div>
        </div>
        <dl className="grid grid-cols-2 border-y border-ink sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map(([label, n], i) => (
            <div key={label} className={`px-4 py-5 ${i ? 'border-s border-border-warm' : ''}`}>
              <dt className="label">{t(label)}</dt>
              <dd className="numeral mt-1 text-4xl text-oxblood">
                <CountUp to={n} />
              </dd>
            </div>
          ))}
        </dl>
        <section className="mt-10 max-w-2xl border border-ink bg-ivory px-6 py-6">
          <h2 className="text-2xl font-bold">{t('From the last ballot to results')}</h2>
          {avg === null ? (
            <p className="meta mt-2">{t('Appears once a round has been confirmed.')}</p>
          ) : (
            <p className="mt-3 text-lg">
              {t('{a} minutes on average with Ramz Tab', { a: avg.toFixed(1) })}
              {avgPaper !== null && (
                <>
                  {' · '}
                  {t('{b} minutes on paper, by the directors’ estimate', { b: avgPaper.toFixed(0) })}
                </>
              )}
            </p>
          )}
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">{t('Every event')}</h2>
          <Scroll>
            <table className="mt-4 w-full min-w-[44rem] text-[0.9375rem]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>{t('Event')}</Th>
                  <Th num>{t('Schools')}</Th>
                  <Th num>{t('Teams')}</Th>
                  <Th num>{t('Delegates')}</Th>
                  <Th num>{t('Rounds')}</Th>
                  <Th num>{t('Ballots')}</Th>
                  <Th num>{t('Minutes to results')}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.event + r.date} className="border-b border-border-warm">
                    <Td>
                      <span className="font-bold">{r.event}</span> <span className="meta">{r.date}</span>
                    </Td>
                    <Td num>{r.schools}</Td>
                    <Td num>{r.teams}</Td>
                    <Td num>{r.delegates}</Td>
                    <Td num>{r.rounds}</Td>
                    <Td num>{r.ballots}</Td>
                    <Td num>{r.minutes === null ? '—' : r.minutes.toFixed(1)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
        </section>
      </div>
    </>
  )
}
