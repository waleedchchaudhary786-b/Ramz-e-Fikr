/* SAMPLE tournaments for the preview only (no database). Schools and people
   are invented. Draws, ballots and results are made by the real engine. */
import { allocateJudges, blankEvent, canVote, makeDraw, rng } from './engine'
import { FORMATS, SCORE_DEFAULTS, type Ballot, type Format, type TabDoc, type TabEvent } from './types'

const SCHOOLS = [
  { id: 'inst-ravi', name: 'Ravi Model School', code: 'RMS', token: 'demo-school-link-ravi-0001' },
  { id: 'inst-chenab', name: 'Chenab Grammar', code: 'CG', token: 'demo-school-link-chenab-002' },
  { id: 'inst-margalla', name: 'Margalla Academy', code: 'MA', token: 'demo-school-link-margalla-03' },
  { id: 'inst-indus', name: 'Indus College', code: 'IC', token: 'demo-school-link-indus-0004' },
]
const INITIALS = [
  'AK',
  'ZH',
  'MR',
  'SF',
  'HB',
  'NA',
  'UQ',
  'RT',
  'FS',
  'IM',
  'KJ',
  'LD',
  'OP',
  'WN',
  'YB',
  'EG',
  'TC',
  'DM',
  'AR',
  'BS',
  'CH',
  'GM',
  'HN',
  'JP',
  'MK',
  'NS',
  'QA',
  'RZ',
  'SU',
  'VI',
  'XA',
  'ZA',
  'AB',
  'MB',
  'SR',
  'TK',
]
const JUDGES = ['Ayesha Malik', 'Bilal Ahmed', 'Hira Shah', 'Omar Siddiqui', 'Sana Javed', 'Usman Tariq', 'Mehak Raza', 'Faraz Iqbal']
const day = 864e5

function teamsFor(doc: TabDoc, perSchool: number) {
  const nspk = FORMATS[doc.format].speakers
  let k = 0
  for (const s of SCHOOLS)
    for (let i = 0; i < perSchool; i++) {
      const id = `${s.id}-t${i + 1}`
      doc.teams.push({
        id,
        name: `${s.code} ${String.fromCharCode(65 + i)}`,
        inst: s.id,
        active: true,
        speakers: Array.from({ length: nspk }, (_, j) => ({ id: `${id}-s${j}`, name: INITIALS[k++ % INITIALS.length] })),
      })
    }
}

function judgesFor(doc: TabDoc, codes: string[]) {
  JUDGES.slice(0, codes.length).forEach((name, i) =>
    doc.judges.push({ id: `judge-${i}`, name, inst: i < 4 ? SCHOOLS[i].id : null, rating: [5, 4, 4, 3, 3, 2, 2, 1][i], code: codes[i], active: true }),
  )
}

/** play a round: draw, allocate, then ballots from every voting judge (all of them, or some) */
function play(doc: TabDoc, n: number, motion: string, status: 'confirmed' | 'motion', ballotShare = 1, when = Date.now()) {
  const debates = allocateJudges(doc, makeDraw(doc, n, 900 + n)).debates
  const r = rng(77 * n)
  const f = FORMATS[doc.format]
  const ballots: Ballot[] = []
  debates.forEach((d, di) => {
    if (di >= Math.ceil(debates.length * ballotShare)) return
    for (const s of d.panel) {
      if (!canVote(doc, s)) continue
      const scores: Record<string, number[]> = {}
      const used = new Set<number>()
      for (const t of d.teams) {
        let arr: number[]
        let total: number
        do {
          const base = doc.format === 'BP' ? 72 : 72
          arr = Array.from({ length: f.speakers }, () => Math.min(doc.scoreMax, base + Math.round(r() * 12) / 2))
          if (f.reply) arr.push(doc.replyMin + Math.round(r() * (doc.replyMax - doc.replyMin) * 2) / 2)
          total = arr.reduce((a, b) => a + b, 0)
        } while (used.has(total))
        used.add(total)
        scores[t] = arr
      }
      ballots.push({ debate: d.id, judge: s.judge, at: when, scores, reason: 'Sample ballot.' })
    }
  })
  doc.rounds.push({
    n,
    motion,
    info: '',
    status,
    seed: 900 + n,
    motionAt: when - 25 * 60e3,
    lastBallotAt: ballots.length ? when : undefined,
    confirmedAt: status === 'confirmed' ? when + 9 * 60e3 : undefined,
    debates,
    ballots,
  })
}

function debateEvent(): TabEvent {
  const fmt: Format = 'BP'
  const now = Date.now()
  const doc = blankEvent({
    name: 'Ramz Winter Open (sample)',
    urdu: 'رمز سرمائی مقابلہ',
    format: fmt,
    ...SCORE_DEFAULTS[fmt],
    start: new Date(now).toISOString().slice(0, 10),
    end: new Date(now + day).toISOString().slice(0, 10),
    venue: 'Lahore',
    roundsPlanned: 4,
    breakSize: 4,
    prep: 15,
    regOpen: false,
    resultsPublic: true,
    paperMinutes: 45,
  })
  doc.institutions = SCHOOLS.map((s) => ({ ...s }))
  teamsFor(doc, 3)
  judgesFor(doc, ['DEMOJUDGE1', 'DEMOJUDGE2', 'DEMOJUDGE3', 'DEMOJUDGE4', 'DEMOJUDGE5', 'DEMOJUDGE6'])
  doc.rooms = ['Hall A', 'Room 104', 'Library'].map((name, i) => ({ id: `room-${i}`, name }))
  doc.conflicts = [{ a: 'judge-4', b: 'inst-indus' }]
  play(doc, 1, 'This House would ban private tuition academies', 'confirmed', 1, now - 5 * 3600e3)
  play(doc, 2, 'This House regrets the rise of influencer culture', 'confirmed', 1, now - 3 * 3600e3)
  play(doc, 3, 'This House would make voting compulsory', 'motion', 0.34, now - 4 * 60e3)
  doc.announcements = [
    { id: 'a1', text: 'Round 3 motion is out. Prep ends in 15 minutes.', at: now - 4 * 60e3 },
    { id: 'a2', text: 'Lunch is in the courtyard after round 3.', at: now - 50 * 60e3 },
    { id: 'a3', text: 'Welcome to the Ramz Winter Open. Registration desk is in Hall A.', at: now - 6 * 3600e3 },
  ]
  return { id: 'sample-winter-open', slug: 'winter-open-sample', version: 1, doc, staff: ['preview-owner', 'preview-editor'], createdAt: now - 7 * day }
}

function finishedEvent(): TabEvent {
  const fmt: Format = 'WSDC'
  const now = Date.now()
  const doc = blankEvent({
    name: 'Autumn Novice Cup (sample)',
    urdu: 'خزاں نوآموز کپ',
    format: fmt,
    ...SCORE_DEFAULTS[fmt],
    start: new Date(now - 30 * day).toISOString().slice(0, 10),
    end: new Date(now - 30 * day).toISOString().slice(0, 10),
    venue: 'Faisalabad',
    roundsPlanned: 2,
    breakSize: 2,
    regOpen: false,
    resultsPublic: true,
    finished: true,
    paperMinutes: 40,
  })
  doc.institutions = SCHOOLS.map((s) => ({ ...s, token: s.token + '-autumn' }))
  teamsFor(doc, 2)
  judgesFor(doc, ['AUTUMNJ01', 'AUTUMNJ02', 'AUTUMNJ03', 'AUTUMNJ04', 'AUTUMNJ05', 'AUTUMNJ06', 'AUTUMNJ07'])
  doc.rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4'].map((name, i) => ({ id: `room-${i}`, name }))
  play(doc, 1, 'This House would replace homework with supervised study', 'confirmed', 1, now - 30 * day)
  play(doc, 2, 'This House believes that schools should teach in the mother tongue until grade 5', 'confirmed', 1, now - 30 * day + 3600e3)
  return { id: 'sample-autumn-cup', slug: 'autumn-cup-sample', version: 1, doc, staff: ['preview-owner'], createdAt: now - 40 * day }
}

function munEvent(): TabEvent {
  const now = Date.now()
  const doc = blankEvent({
    name: 'Ramz Model UN (sample)',
    urdu: 'رمز ماڈل اقوامِ متحدہ',
    kind: 'mun',
    start: new Date(now + 14 * day).toISOString().slice(0, 10),
    end: new Date(now + 15 * day).toISOString().slice(0, 10),
    venue: 'Lahore',
    regOpen: true,
  })
  doc.institutions = SCHOOLS.map((s) => ({ ...s, token: s.token + '-mun' }))
  doc.committees = [
    { id: 'c-unsc', name: 'Security Council', agenda: 'Protecting civilians in urban conflict', speakers: [], speakSeconds: 90 },
    { id: 'c-unep', name: 'Environment Programme', agenda: 'Cross-border air pollution in South Asia', speakers: [], speakSeconds: 90 },
  ]
  const countries = {
    'c-unsc': ['China', 'France', 'Russia', 'United Kingdom', 'United States', 'Pakistan', 'Japan', 'Brazil'],
    'c-unep': ['Pakistan', 'India', 'Bangladesh', 'Nepal', 'Sri Lanka', 'China', 'Norway', 'Kenya'],
  } as Record<string, string[]>
  let k = 0
  for (const c of doc.committees)
    countries[c.id].forEach((country, i) =>
      doc.delegates.push({
        id: `del-${c.id}-${i}`,
        committee: c.id,
        country,
        inst: SCHOOLS[(i + (c.id === 'c-unep' ? 1 : 0)) % 4].id,
        name: INITIALS[k++ % INITIALS.length],
        attendance: 'absent',
        score: 0,
        award: '',
      }),
    )
  doc.announcements = [{ id: 'm1', text: 'Country allocations are out. Position papers are due a week before the conference.', at: now - day }]
  return { id: 'sample-mun', slug: 'model-un-sample', version: 1, doc, staff: ['preview-owner'], createdAt: now - 3 * day }
}

export function sampleEvents(): TabEvent[] {
  return [debateEvent(), finishedEvent(), munEvent()]
}
