/* Shared Ramz Tab pieces, all in the Ramz-e-Fikr style. */
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from '../utils/router'
import { StampIn } from '../utils/motion'
import { Stamp } from '../components/Symbols'
import { useT } from './i18n'
import { FORMATS, type Format, type PublicDoc, type PublicSpeakerRow, type PublicTeamRow, type RoundStatus, type Seat } from './types'

export const POSITION_NAMES: Record<Format, string[]> = {
  BP: ['Opening Government', 'Opening Opposition', 'Closing Government', 'Closing Opposition'],
  AP: ['Government', 'Opposition'],
  WSDC: ['Proposition', 'Opposition'],
  URDU: ['Government', 'Opposition'],
}
export const POSITION_SHORT: Record<Format, string[]> = { BP: ['OG', 'OO', 'CG', 'CO'], AP: ['Gov', 'Opp'], WSDC: ['Prop', 'Opp'], URDU: ['Gov', 'Opp'] }

export function formatName(f: Format, t: (s: string) => string) {
  return t(FORMATS[f].name)
}

export function dateRange(a: string, b: string, lang: string) {
  if (!a) return ''
  const fmt = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return !b || a === b ? fmt(a) : `${fmt(a)} – ${fmt(b)}`
}

const STATUS_LABEL: Record<RoundStatus, string> = {
  setup: 'Not drawn yet',
  draft: 'Draw in progress',
  released: 'Draw released',
  motion: 'Motion out',
  confirmed: 'Results in',
}
export function RoundStamp({ status }: { status: RoundStatus }) {
  const { t } = useT()
  return (
    <StampIn>
      <Stamp className={status === 'motion' ? '' : status === 'confirmed' ? '!text-ink' : '!text-charcoal'}>{t(STATUS_LABEL[status])}</Stamp>
    </StampIn>
  )
}

/** minutes and seconds left in prep, counted from when the motion was released */
export function usePrepLeft(motionAt: number | null | undefined, prepMinutes: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!motionAt) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [motionAt])
  if (!motionAt) return null
  return Math.max(0, Math.round((motionAt + prepMinutes * 60e3 - now) / 1000))
}

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function PrepClock({ motionAt, prep, big = false }: { motionAt?: number | null; prep: number; big?: boolean }) {
  const { t } = useT()
  const left = usePrepLeft(motionAt, prep)
  if (left === null) return null
  return (
    <p className={`flex flex-wrap items-baseline gap-x-3 ${big ? '' : 'mt-3'}`} aria-live="polite">
      <span className="label !text-current">{left > 0 ? t('Prep ends in') : t('Prep time is over')}</span>
      {left > 0 && (
        <span dir="ltr" className={`numeral tabular-nums ${big ? 'text-[min(22vw,12rem)] leading-none' : 'text-4xl'}`}>
          {mmss(left)}
        </span>
      )}
    </p>
  )
}

/** the motion card: oxblood with a gold frame, like the Floor's lectern */
export function MotionCard({ n, motion, info, motionAt, prep }: { n: number; motion: string; info?: string; motionAt?: number | null; prep: number }) {
  const { t } = useT()
  return (
    <div className="relative bg-oxblood px-6 py-8 text-ivory md:px-10 md:py-10">
      <div className="pointer-events-none absolute inset-2 border border-gold/60" aria-hidden="true" />
      <p className="label !text-ivory/85">{t('Round {n} · Motion', { n })}</p>
      <p className="mt-3 max-w-3xl font-display text-2xl leading-snug font-bold italic md:text-4xl">{motion}</p>
      {info && <p className="mt-4 max-w-2xl text-[0.9375rem] text-ivory/90">{info}</p>}
      <div className="text-gold">
        <PrepClock motionAt={motionAt} prep={prep} />
      </div>
    </div>
  )
}

type DrawRow = { id: string; room: string; teams: string[]; panel: Seat[] }

/** a round's draw as a ledger: one row per room */
export function DrawTable({
  doc,
  debates,
  results,
  highlight,
}: {
  doc: Pick<PublicDoc, 'format' | 'rooms' | 'teams' | 'judges'>
  debates: DrawRow[]
  results?: Record<string, number[]>
  highlight?: string
}) {
  const { t } = useT()
  const pos = POSITION_SHORT[doc.format]
  const team = (id: string) => doc.teams.find((x) => x.id === id)?.name ?? '?'
  const judge = (id: string) => doc.judges.find((x) => x.id === id)?.name ?? '?'
  const room = (id: string) => doc.rooms.find((x) => x.id === id)?.name ?? '?'
  const places = ['1st', '2nd', '3rd', '4th']
  return (
    <ul className="border-t border-ink">
      {debates.map((d) => (
        <li
          key={d.id}
          className={`grid gap-3 border-b border-border-warm py-4 md:grid-cols-[9rem_1fr_14rem] md:gap-6 ${d.teams.includes(highlight ?? '') ? 'bg-gold/10' : ''}`}
        >
          <p className="font-display text-lg font-bold">{room(d.room)}</p>
          <ol className={`grid gap-x-6 gap-y-1 ${d.teams.length === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
            {d.teams.map((id, i) => (
              <li key={id} className={`flex items-baseline gap-2 ${id === highlight ? 'font-bold text-oxblood' : ''}`}>
                <span className="w-10 shrink-0 font-mono text-[0.75rem] text-charcoal" title={t(POSITION_NAMES[doc.format][i])}>
                  {pos[i]}
                </span>
                <span>{team(id)}</span>
                {results?.[d.id] && (
                  <span className={`ms-auto font-mono text-[0.75rem] ${results[d.id][i] === 0 ? 'font-bold text-oxblood' : 'text-charcoal'}`}>
                    {doc.format === 'BP' ? t(places[results[d.id][i]]) : results[d.id][i] === 0 ? t('Won') : t('Lost')}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="meta">
            {d.panel.length === 0
              ? t('No judges yet')
              : d.panel.map((s, i) => (
                  <span key={s.judge}>
                    {i > 0 && ', '}
                    {judge(s.judge)}
                    {s.role === 'chair' ? ` (${t('chair')})` : s.role === 'trainee' ? ` (${t('trainee')})` : ''}
                  </span>
                ))}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function StandingsTable({
  rows,
  format,
  breaking = [],
  teamSchool,
}: {
  rows: PublicTeamRow[]
  format: Format
  breaking?: string[]
  teamSchool: (id: string) => string
}) {
  const { t } = useT()
  return (
    <Scroll>
      <table className="w-full text-start text-[0.9375rem] sm:min-w-[34rem]">
        <thead>
          <tr className="border-b-2 border-ink">
            <Th>{t('Rank')}</Th>
            <Th>{t('Team')}</Th>
            <Th className="hidden sm:table-cell">{t('School')}</Th>
            {format === 'BP' ? <Th num>{t('Points')}</Th> : <Th num>{t('Wins')}</Th>}
            {format === 'WSDC' && <Th num>{t('Ballots')}</Th>}
            <Th num>{t('Speaker points')}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={`border-b border-border-warm ${breaking.includes(r.id) ? 'bg-gold/10' : ''}`}>
              <Td>
                <span className="numeral text-xl text-oxblood">{r.rank}</span>
              </Td>
              <Td>
                <span className="font-bold">{r.name}</span>
                {breaking.includes(r.id) && <span className="ms-2 font-mono text-[0.7rem] text-oxblood uppercase">{t('breaks')}</span>}
              </Td>
              <Td className="hidden sm:table-cell">{teamSchool(r.id)}</Td>
              <Td num>{format === 'BP' ? r.points : r.wins}</Td>
              {format === 'WSDC' && <Td num>{r.ballots}</Td>}
              <Td num>{r.speaks.toFixed(1)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroll>
  )
}

export function SpeakerTable({ rows }: { rows: PublicSpeakerRow[] }) {
  const { t } = useT()
  return (
    <Scroll>
      <table className="w-full text-start text-[0.9375rem] sm:min-w-[30rem]">
        <thead>
          <tr className="border-b-2 border-ink">
            <Th>{t('Rank')}</Th>
            <Th>{t('Speaker')}</Th>
            <Th>{t('Team')}</Th>
            <Th num>{t('Total')}</Th>
            <Th num className="hidden sm:table-cell">
              {t('Average')}
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border-warm">
              <Td>
                <span className="numeral text-xl text-oxblood">{r.rank}</span>
              </Td>
              <Td>
                <span className="font-bold">{r.name}</span>
              </Td>
              <Td>{r.team}</Td>
              <Td num>{r.total.toFixed(1)}</Td>
              <Td num className="hidden sm:table-cell">
                {r.average.toFixed(2)}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroll>
  )
}

export function Scroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0" tabIndex={0} role="region" aria-label="Table">
      {children}
    </div>
  )
}
export function Th({ children, num = false, className = '' }: { children: ReactNode; num?: boolean; className?: string }) {
  return <th className={`label px-2 py-2 !text-ink ${num ? 'text-end' : 'text-start'} ${className}`}>{children}</th>
}
export function Td({ children, num = false, className = '' }: { children: ReactNode; num?: boolean; className?: string }) {
  return <td className={`px-2 py-2.5 align-baseline ${num ? 'text-end font-mono tabular-nums' : ''} ${className}`}>{children}</td>
}

export function Notice({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'error' | 'ok' }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`border-s-2 ps-3 text-[0.9375rem] ${tone === 'error' ? 'border-oxblood font-bold text-oxblood' : tone === 'ok' ? 'border-gold text-ink' : 'border-charcoal text-charcoal'}`}
    >
      {children}
    </p>
  )
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-mono text-[0.8125rem] text-oxblood underline underline-offset-2">
      <span aria-hidden="true" className="inline-block rtl:rotate-180">
        ⟵
      </span>{' '}
      {children}
    </Link>
  )
}
