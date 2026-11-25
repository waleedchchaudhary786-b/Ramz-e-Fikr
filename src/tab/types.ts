/* Ramz Tab: one event is one document. Directors edit it; judges and schools
   write to it only through checked functions; the public sees a cleaned copy. */

export type Format = 'BP' | 'AP' | 'WSDC' | 'URDU'
export type Kind = 'debate' | 'mun'
/** setup: not drawn · draft: drawn, private · released: draw public · motion: motion out, ballots open · confirmed: results counted */
export type RoundStatus = 'setup' | 'draft' | 'released' | 'motion' | 'confirmed'

export type Institution = { id: string; name: string; code: string; token: string }
export type Speaker = { id: string; name: string }
export type Team = { id: string; name: string; inst: string; speakers: Speaker[]; active: boolean; swing?: boolean }
export type Judge = { id: string; name: string; inst: string | null; rating: number; code: string; active: boolean }
/** two ids that must not meet: judge–team, judge–institution, judge–judge or team–team */
export type Conflict = { a: string; b: string }
export type Room = { id: string; name: string }
export type Seat = { judge: string; role: 'chair' | 'panel' | 'trainee' }
/** teams in position order: BP = OG, OO, CG, CO · two-team = Proposition, Opposition */
export type Debate = { id: string; room: string; teams: string[]; panel: Seat[]; bracket: number }
/** scores per team id: one per speaker in order, then the reply speech in two-team formats */
export type Ballot = { debate: string; judge: string; at: number; scores: Record<string, number[]>; reason: string }
export type Round = {
  n: number
  motion: string
  info: string
  status: RoundStatus
  seed: number
  motionAt?: number
  lastBallotAt?: number
  confirmedAt?: number
  debates: Debate[]
  ballots: Ballot[]
}
export type Announcement = { id: string; text: string; at: number }

export type Committee = { id: string; name: string; agenda: string; speakers: string[]; speakSeconds: number }
export type Delegate = {
  id: string
  committee: string
  country: string
  inst: string
  name: string
  attendance: 'absent' | 'present' | 'voting'
  score: number
  award: '' | 'Best Delegate' | 'Outstanding Delegate' | 'Honourable Mention'
}

export type TabDoc = {
  name: string
  urdu: string
  kind: Kind
  format: Format
  start: string
  end: string
  venue: string
  prep: number
  scoreMin: number
  scoreMax: number
  replyMin: number
  replyMax: number
  breakSize: number
  roundsPlanned: number
  pairing: 'slide' | 'fold'
  regOpen: boolean
  resultsPublic: boolean
  finished: boolean
  /** the director's estimate of minutes from round end to results on paper */
  paperMinutes: number | null
  rooms: Room[]
  institutions: Institution[]
  teams: Team[]
  judges: Judge[]
  conflicts: Conflict[]
  rounds: Round[]
  announcements: Announcement[]
  committees: Committee[]
  delegates: Delegate[]
}

export type TabEvent = { id: string; slug: string; version: number; doc: TabDoc; staff: string[]; createdAt: number }

/* ---------- the public copy: no codes, tokens, ratings, conflicts or private results ---------- */
export type PublicTeamRow = { id: string; name: string; inst: string; points: number; wins: number; ballots: number; speaks: number; rank: number }
export type PublicSpeakerRow = { id: string; name: string; team: string; total: number; rounds: number; average: number; rank: number }
export type PublicDoc = {
  name: string
  urdu: string
  kind: Kind
  format: Format
  start: string
  end: string
  venue: string
  prep: number
  finished: boolean
  resultsPublic: boolean
  roundsPlanned: number
  rooms: Room[]
  institutions: { id: string; name: string }[]
  teams: { id: string; name: string; inst: string; speakers: string[] }[]
  judges: { id: string; name: string }[]
  rounds: {
    n: number
    status: RoundStatus
    motion: string
    info: string
    motionAt?: number
    debates: { id: string; room: string; teams: string[]; panel: Seat[] }[]
    results?: Record<string, number[]>
  }[]
  announcements: Announcement[]
  committees: { id: string; name: string; agenda: string; speakers: string[]; speakSeconds: number }[]
  delegates: { id: string; committee: string; country: string; inst: string; name: string; award: Delegate['award'] }[]
  standings?: PublicTeamRow[]
  speakerTab?: PublicSpeakerRow[]
  breaking?: string[]
}

export const FORMATS: Record<Format, { name: string; urdu: string; teamsPerRoom: 2 | 4; speakers: number; reply: boolean; positions: string[] }> = {
  BP: { name: 'British Parliamentary', urdu: 'برطانوی پارلیمانی', teamsPerRoom: 4, speakers: 2, reply: false, positions: ['OG', 'OO', 'CG', 'CO'] },
  AP: { name: 'Asian Parliamentary', urdu: 'ایشیائی پارلیمانی', teamsPerRoom: 2, speakers: 3, reply: true, positions: ['Gov', 'Opp'] },
  WSDC: { name: 'World Schools', urdu: 'ورلڈ اسکولز', teamsPerRoom: 2, speakers: 3, reply: true, positions: ['Prop', 'Opp'] },
  URDU: { name: 'Urdu parliamentary', urdu: 'اردو پارلیمانی', teamsPerRoom: 2, speakers: 3, reply: true, positions: ['حکومت', 'حزبِ اختلاف'] },
}

export const SCORE_DEFAULTS: Record<Format, Pick<TabDoc, 'scoreMin' | 'scoreMax' | 'replyMin' | 'replyMax'>> = {
  BP: { scoreMin: 50, scoreMax: 100, replyMin: 0, replyMax: 0 },
  AP: { scoreMin: 70, scoreMax: 80, replyMin: 35, replyMax: 40 },
  WSDC: { scoreMin: 60, scoreMax: 80, replyMin: 30, replyMax: 40 },
  URDU: { scoreMin: 70, scoreMax: 80, replyMin: 35, replyMax: 40 },
}
