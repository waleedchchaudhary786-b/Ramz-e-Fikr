/* Ramz Tab engine: pure functions, no React, no network. Every screen and the
   tests use the same code, so the draw a director sees is the draw that runs. */
import { FORMATS, type Ballot, type Debate, type Judge, type PublicDoc, type Round, type Seat, type TabDoc, type Team } from './types'

/* ============================ helpers ============================ */

/** small seeded random generator, so a draw can be shown again exactly */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function shuffle<T>(xs: T[], r: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))
/** a short code that is easy to read aloud: no 0/O or 1/I */
export function makeCode(len = 8) {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => abc[b % abc.length]).join('')
}
export const teamsPerRoom = (doc: Pick<TabDoc, 'format'>) => FORMATS[doc.format].teamsPerRoom
export const isBP = (doc: Pick<TabDoc, 'format'>) => doc.format === 'BP'
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/* ============================ ballots ============================ */

/** who may submit a ballot in this format: BP panels confer, so only the chair; in two-team formats every voting judge does */
export const canVote = (doc: Pick<TabDoc, 'format'>, seat: Seat) => (isBP(doc) ? seat.role === 'chair' : seat.role !== 'trainee')

/** Check a ballot. Returns a plain-language problem, or null if it is valid. */
export function checkBallot(doc: TabDoc, round: Round, b: Pick<Ballot, 'debate' | 'judge' | 'scores'>): string | null {
  if (round.status !== 'released' && round.status !== 'motion') return 'Ballots for this round are closed.'
  const d = round.debates.find((x) => x.id === b.debate)
  if (!d) return 'That debate is not in this round.'
  const seat = d.panel.find((s) => s.judge === b.judge)
  if (!seat) return 'You are not on the panel for this room.'
  if (!canVote(doc, seat)) return isBP(doc) ? 'In British Parliamentary only the chair submits the ballot.' : 'Trainee judges do not submit ballots.'
  const f = FORMATS[doc.format]
  const want = f.speakers + (f.reply ? 1 : 0)
  const totals: number[] = []
  for (const t of d.teams) {
    const s = b.scores[t]
    if (!s || s.length !== want) return 'Every speaker needs a score.'
    for (let i = 0; i < s.length; i++) {
      const v = s[i]
      const reply = f.reply && i === f.speakers
      const lo = reply ? doc.replyMin : doc.scoreMin
      const hi = reply ? doc.replyMax : doc.scoreMax
      if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) return `${reply ? 'Reply' : 'Speaker'} scores must be between ${lo} and ${hi}.`
      if (Math.round(v * 2) !== v * 2) return 'Scores go up in half points.'
    }
    totals.push(sum(s))
  }
  if (Object.keys(b.scores).length !== d.teams.length) return 'Scores are for the wrong teams.'
  if (new Set(totals).size !== totals.length) return 'Two teams have the same total. Adjust a score so every team has a different total.'
  return null
}

/** team order in a ballot, best first */
export const ballotOrder = (b: Ballot, d: Debate) => [...d.teams].sort((x, y) => sum(b.scores[y]) - sum(b.scores[x]))

/* ============================ results and standings ============================ */

export type DebateResult = {
  /** team ids best first */
  order: string[]
  /** two-team: judges who voted for each team */
  votes: Record<string, number>
  /** average speaker scores per team over the ballots counted */
  scores: Record<string, number[]>
  ballots: number
}

/** Result of one debate from its ballots, or null if not every voting judge has submitted. */
export function debateResult(doc: TabDoc, round: Round, d: Debate): DebateResult | null {
  const voters = d.panel.filter((s) => canVote(doc, s)).map((s) => s.judge)
  if (voters.length === 0) return null
  const bs = voters.map((j) => round.ballots.find((b) => b.debate === d.id && b.judge === j)).filter((b): b is Ballot => !!b)
  if (bs.length < voters.length) return null
  const scores: Record<string, number[]> = {}
  for (const t of d.teams) {
    const n = bs[0].scores[t].length
    scores[t] = Array.from({ length: n }, (_, i) => Math.round((sum(bs.map((b) => b.scores[t][i])) / bs.length) * 100) / 100)
  }
  const votes: Record<string, number> = Object.fromEntries(d.teams.map((t) => [t, 0]))
  for (const b of bs) votes[ballotOrder(b, d)[0]] += 1
  let order: string[]
  if (isBP(doc)) order = ballotOrder(bs[0], d)
  else order = [...d.teams].sort((x, y) => votes[y] - votes[x] || sum(scores[y]) - sum(scores[x]))
  return { order, votes, scores, ballots: bs.length }
}

/** rooms still missing ballots, with the judges who owe them */
export function missingBallots(doc: TabDoc, round: Round) {
  return round.debates
    .map((d) => ({
      debate: d,
      waiting: d.panel.filter((s) => canVote(doc, s) && !round.ballots.some((b) => b.debate === d.id && b.judge === s.judge)).map((s) => s.judge),
    }))
    .filter((x) => x.waiting.length > 0)
}

export type TeamStanding = {
  team: Team
  points: number
  wins: number
  ballots: number
  speaks: number
  /** how many times in each position (BP) or side (two-team) */
  positions: number[]
  opponents: string[]
  rank: number
}

/** Standings from confirmed rounds only. */
export function standings(doc: TabDoc): TeamStanding[] {
  const per = teamsPerRoom(doc)
  const rows = new Map<string, TeamStanding>(
    doc.teams.map((t) => [t.id, { team: t, points: 0, wins: 0, ballots: 0, speaks: 0, positions: Array(per).fill(0), opponents: [], rank: 0 }]),
  )
  for (const r of doc.rounds) {
    for (const d of r.debates) {
      d.teams.forEach((t, i) => {
        const row = rows.get(t)
        if (!row) return
        if (r.status !== 'setup' && r.status !== 'draft') row.positions[i] += 1
        row.opponents.push(...d.teams.filter((x) => x !== t))
      })
      if (r.status !== 'confirmed') continue
      const res = debateResult(doc, r, d)
      if (!res) continue
      res.order.forEach((t, place) => {
        const row = rows.get(t)
        if (!row) return
        row.speaks += sum(res.scores[t])
        if (isBP(doc)) row.points += 3 - place
        else {
          if (place === 0) {
            row.wins += 1
            row.points += 1
          }
          row.ballots += res.votes[t]
        }
      })
    }
  }
  const list = [...rows.values()].filter((r) => r.team.active)
  list.sort(compareStanding(doc))
  list.forEach((r, i) => (r.rank = i + 1))
  return list
}

export function compareStanding(doc: TabDoc) {
  return (a: TeamStanding, b: TeamStanding) =>
    isBP(doc)
      ? b.points - a.points || b.speaks - a.speaks || a.team.name.localeCompare(b.team.name)
      : doc.format === 'WSDC'
        ? b.wins - a.wins || b.ballots - a.ballots || b.speaks - a.speaks || a.team.name.localeCompare(b.team.name)
        : b.wins - a.wins || b.speaks - a.speaks || a.team.name.localeCompare(b.team.name)
}

export type SpeakerStanding = { id: string; name: string; team: Team; total: number; rounds: number; average: number; rank: number }

/** Speaker tab from confirmed rounds: substantive speeches only, replies left out. */
export function speakerTab(doc: TabDoc): SpeakerStanding[] {
  const f = FORMATS[doc.format]
  const rows = new Map<string, SpeakerStanding>()
  for (const t of doc.teams) for (const s of t.speakers) rows.set(s.id, { id: s.id, name: s.name, team: t, total: 0, rounds: 0, average: 0, rank: 0 })
  for (const r of doc.rounds) {
    if (r.status !== 'confirmed') continue
    for (const d of r.debates) {
      const res = debateResult(doc, r, d)
      if (!res) continue
      for (const tid of d.teams) {
        const t = doc.teams.find((x) => x.id === tid)
        if (!t) continue
        t.speakers.slice(0, f.speakers).forEach((s, i) => {
          const row = rows.get(s.id)
          if (!row) return
          row.total += res.scores[tid][i]
          row.rounds += 1
        })
      }
    }
  }
  const list = [...rows.values()].filter((r) => r.rounds > 0 && !r.team.swing)
  list.forEach((r) => (r.average = Math.round((r.total / r.rounds) * 100) / 100))
  list.sort((a, b) => b.total - a.total || b.average - a.average || a.name.localeCompare(b.name))
  list.forEach((r, i) => (r.rank = i + 1))
  return list
}

/** teams that break, by ranking; swing teams never break */
export const breakingTeams = (doc: TabDoc) =>
  standings(doc)
    .filter((s) => !s.team.swing)
    .slice(0, doc.breakSize)
    .map((s) => s.team.id)

/* ============================ the draw ============================ */

type Pairing = { teams: string[]; bracket: number }

/** Draw a round. Throws a plain-language error the director can act on. */
export function makeDraw(doc: TabDoc, n: number, seed: number): Debate[] {
  const r = rng(seed)
  const per = teamsPerRoom(doc)
  const active = doc.teams.filter((t) => t.active)
  if (active.length < per) throw new Error(`You need at least ${per} active teams.`)
  if (active.length % per !== 0)
    throw new Error(
      per === 4
        ? `British Parliamentary needs a multiple of 4 teams. You have ${active.length}. Add ${4 - (active.length % 4)} swing team(s) or withdraw a team.`
        : `You have an odd number of teams (${active.length}). Add a swing team or withdraw a team.`,
    )
  const rooms = active.length / per
  if (doc.rooms.length < rooms) throw new Error(`You need ${rooms} rooms for this draw and have ${doc.rooms.length}. Add rooms in Setup.`)

  const st = standings(doc)
  const rankOf = new Map(st.map((s) => [s.team.id, s]))
  const anyResults = doc.rounds.some((x) => x.status === 'confirmed' && x.n < n)
  const inst = new Map(active.map((t) => [t.id, t.inst]))
  const met = (a: string, b: string) => rankOf.get(a)?.opponents.includes(b) ?? false
  const teamConflict = (a: string, b: string) => doc.conflicts.some((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a))

  // cost of putting a group of teams in one room
  const groupCost = (g: string[]) => {
    let c = 0
    for (let i = 0; i < g.length; i++)
      for (let j = i + 1; j < g.length; j++) {
        if (inst.get(g[i]) === inst.get(g[j])) c += 1000
        if (teamConflict(g[i], g[j])) c += 1000
        if (per === 2 && met(g[i], g[j])) c += 500
      }
    return c
  }
  const scoreOf = (t: string) => (isBP(doc) ? (rankOf.get(t)?.points ?? 0) : (rankOf.get(t)?.wins ?? 0))

  let groups: Pairing[]
  if (!anyResults) {
    const order = shuffle(
      active.map((t) => t.id),
      r,
    )
    groups = Array.from({ length: rooms }, (_, i) => ({ teams: order.slice(i * per, i * per + per), bracket: 0 }))
  } else if (per === 4) {
    // BP: rooms of four in ranked order, so short brackets fill from the one below (pull-ups)
    const ranked = st.filter((s) => s.team.active).map((s) => s.team.id)
    groups = Array.from({ length: rooms }, (_, i) => {
      const g = ranked.slice(i * 4, i * 4 + 4)
      return { teams: g, bracket: Math.max(...g.map(scoreOf)) }
    })
  } else {
    // two-team: brackets by wins, odd brackets pull up the best team from below, then slide or fold
    const ranked = st.filter((s) => s.team.active)
    const byWins = new Map<number, string[]>()
    for (const s of ranked) byWins.set(s.wins, [...(byWins.get(s.wins) ?? []), s.team.id])
    const levels = [...byWins.keys()].sort((a, b) => b - a)
    groups = []
    for (let li = 0; li < levels.length; li++) {
      const b = byWins.get(levels[li])!
      if (b.length % 2 === 1) {
        const below = levels.slice(li + 1).find((l) => (byWins.get(l) ?? []).length > 0)
        if (below !== undefined) {
          const lower = byWins.get(below)!
          b.push(lower.shift()!)
        }
      }
      const h = b.length / 2
      for (let i = 0; i < h; i++) groups.push({ teams: doc.pairing === 'fold' ? [b[i], b[b.length - 1 - i]] : [b[i], b[i + h]], bracket: levels[li] })
    }
  }

  // repair: swap teams between rooms while that lowers the total clash cost.
  // Moving a team to another bracket costs a little, so power pairing bends only when it must.
  const bracketPenalty = (t: string, g: Pairing) => (anyResults ? Math.abs(scoreOf(t) - g.bracket) * (per === 4 ? 30 : 60) : 0)
  const roomCost = (g: Pairing) => groupCost(g.teams) + sum(g.teams.map((t) => bracketPenalty(t, g)))
  for (let pass = 0; pass < 50; pass++) {
    let improved = false
    for (let a = 0; a < groups.length; a++) {
      if (groupCost(groups[a].teams) === 0) continue
      let best: { b: number; i: number; j: number; gain: number } | null = null
      for (let b = 0; b < groups.length; b++) {
        if (b === a) continue
        for (let i = 0; i < per; i++)
          for (let j = 0; j < per; j++) {
            const ga = { ...groups[a], teams: [...groups[a].teams] }
            const gb = { ...groups[b], teams: [...groups[b].teams] }
            ;[ga.teams[i], gb.teams[j]] = [gb.teams[j], ga.teams[i]]
            const gain = roomCost(groups[a]) + roomCost(groups[b]) - roomCost(ga) - roomCost(gb)
            if (gain > 0 && (!best || gain > best.gain)) best = { b, i, j, gain }
          }
      }
      if (best) {
        const ga = groups[a].teams
        const gb = groups[best.b].teams
        ;[ga[best.i], gb[best.j]] = [gb[best.j], ga[best.i]]
        improved = true
      }
    }
    if (!improved) break
  }

  // positions: balance each team's history, solved exactly per room
  const hist = (t: string) => rankOf.get(t)?.positions ?? Array(per).fill(0)
  const perms = permutations(per)
  const debates: Debate[] = groups.map((g) => {
    let best = perms[0]
    let bestCost = Infinity
    for (const p of shuffle(perms, r)) {
      const c = sum(p.map((teamIdx, pos) => (hist(g.teams[teamIdx])[pos] + 1) ** 2))
      if (c < bestCost) {
        bestCost = c
        best = p
      }
    }
    return { id: uid(), room: '', teams: best.map((i) => g.teams[i]), panel: [], bracket: g.bracket }
  })
  // strongest brackets get the first rooms
  debates.sort((a, b) => b.bracket - a.bracket)
  debates.forEach((d, i) => (d.room = doc.rooms[i].id))
  return debates
}

function permutations(n: number): number[][] {
  if (n === 1) return [[0]]
  const out: number[][] = []
  for (const p of permutations(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)])
  return out
}

/* ============================ judges ============================ */

/** Can this judge sit in this debate, given the judges already there? */
export function judgeConflict(doc: TabDoc, j: Judge, d: Debate, others: string[] = []): string | null {
  for (const tid of d.teams) {
    const t = doc.teams.find((x) => x.id === tid)
    if (!t) continue
    if (j.inst && t.inst === j.inst) return `${j.name} is from ${t.name}'s school`
    if (doc.conflicts.some((c) => (c.a === j.id && (c.b === t.id || c.b === t.inst)) || (c.b === j.id && (c.a === t.id || c.a === t.inst))))
      return `${j.name} has a conflict with ${t.name}`
  }
  for (const o of others) {
    if (o === j.id) continue
    if (doc.conflicts.some((c) => (c.a === j.id && c.b === o) || (c.b === j.id && c.a === o))) {
      const other = doc.judges.find((x) => x.id === o)
      return `${j.name} has a conflict with ${other?.name ?? 'another judge'}`
    }
  }
  return null
}

/** Allocate judges. Debates should already be in importance order (the draw does this). Conflicts are never broken. */
export function allocateJudges(doc: TabDoc, debates: Debate[]): { debates: Debate[]; problems: string[] } {
  const pool = doc.judges.filter((j) => j.active).sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
  const used = new Set<string>()
  const out = debates.map((d) => ({ ...d, panel: [] as Seat[] }))
  const problems: string[] = []
  const fits = (j: Judge, d: Debate) =>
    !used.has(j.id) &&
    !judgeConflict(
      doc,
      j,
      d,
      d.panel.map((s) => s.judge),
    )

  // chairs, most important room first; a room with no free chair takes one from a later room if a swap works
  for (const d of out) {
    const j = pool.find((x) => x.rating >= 2 && fits(x, d)) ?? pool.find((x) => fits(x, d))
    if (j) {
      d.panel.push({ judge: j.id, role: 'chair' })
      used.add(j.id)
    }
  }
  for (const d of out) {
    if (d.panel.length) continue
    // try to free a chair elsewhere that this room can take
    for (const other of out) {
      if (other === d || !other.panel.length) continue
      const chair = doc.judges.find((x) => x.id === other.panel[0].judge)!
      if (judgeConflict(doc, chair, d)) continue
      const replacement = pool.find((x) => !used.has(x.id) && !judgeConflict(doc, x, other))
      if (!replacement) continue
      d.panel.push({ judge: chair.id, role: 'chair' })
      other.panel[0] = { judge: replacement.id, role: 'chair' }
      used.add(replacement.id)
      break
    }
    if (!d.panel.length) problems.push(`No judge without a conflict is free for room ${roomName(doc, d.room)}.`)
  }

  // panellists, spread from the most important room down; rating 1 judges sit as trainees
  let changed = true
  while (changed) {
    changed = false
    for (const d of out) {
      const j = pool.find((x) => x.rating >= 2 && fits(x, d))
      if (!j) continue
      // keep two-team panels odd: add panellists in pairs where possible
      d.panel.push({ judge: j.id, role: 'panel' })
      used.add(j.id)
      changed = true
    }
  }
  for (const d of out) {
    const j = pool.find((x) => fits(x, d))
    if (j) {
      d.panel.push({ judge: j.id, role: 'trainee' })
      used.add(j.id)
    }
  }
  for (const j of pool) {
    if (used.has(j.id)) continue
    const d = out.find((x) => fits(j, x))
    if (d) {
      d.panel.push({ judge: j.id, role: j.rating >= 2 ? 'panel' : 'trainee' })
      used.add(j.id)
    }
  }
  if (!isBP(doc)) {
    // a two-team panel needs an odd number of voting judges, so the weakest extra panellist becomes a trainee
    for (const d of out) {
      const voting = d.panel.filter((s) => s.role !== 'trainee')
      if (voting.length > 1 && voting.length % 2 === 0) {
        const weakest = [...voting].sort((a, b) => rating(doc, a.judge) - rating(doc, b.judge))[0]
        if (weakest.role === 'panel') weakest.role = 'trainee'
      }
    }
  }
  return { debates: out, problems }
}

const rating = (doc: TabDoc, id: string) => doc.judges.find((j) => j.id === id)?.rating ?? 0
export const roomName = (doc: Pick<TabDoc, 'rooms'>, id: string) => doc.rooms.find((r) => r.id === id)?.name ?? '?'

/** Every clash in a drafted round, for the director's screen. */
export function clashes(doc: TabDoc, round: Round): Record<string, string[]> {
  const st = standings({ ...doc, rounds: doc.rounds.filter((r) => r.n < round.n) })
  const met = new Map(st.map((s) => [s.team.id, s.opponents]))
  const out: Record<string, string[]> = {}
  const seen = new Map<string, number>()
  for (const d of round.debates) for (const s of d.panel) seen.set(s.judge, (seen.get(s.judge) ?? 0) + 1)
  for (const d of round.debates) {
    const list: string[] = []
    const ts = d.teams.map((id) => doc.teams.find((t) => t.id === id)).filter((t): t is Team => !!t)
    for (let i = 0; i < ts.length; i++)
      for (let j = i + 1; j < ts.length; j++) {
        if (ts[i].inst === ts[j].inst) list.push(`${ts[i].name} and ${ts[j].name} are from the same school`)
        else if (!isBP(doc) && met.get(ts[i].id)?.includes(ts[j].id)) list.push(`${ts[i].name} and ${ts[j].name} have met before`)
      }
    for (const s of d.panel) {
      const j = doc.judges.find((x) => x.id === s.judge)
      if (!j) continue
      const c = judgeConflict(
        doc,
        j,
        d,
        d.panel.map((p) => p.judge),
      )
      if (c) list.push(c)
      if ((seen.get(j.id) ?? 0) > 1) list.push(`${j.name} is in two rooms`)
    }
    if (!d.panel.some((s) => s.role === 'chair')) list.push('No chair')
    if (list.length) out[d.id] = list
  }
  return out
}

/* ============================ the public copy ============================ */

/** What anyone may see. Codes, tokens, ratings, conflicts, drafts and unreleased motions stay out;
    results only once the director switches them on. */
export function publicCopy(doc: TabDoc): PublicDoc {
  const shown = doc.rounds.filter((r) => r.status !== 'setup' && r.status !== 'draft')
  const pub: PublicDoc = {
    name: doc.name,
    urdu: doc.urdu,
    kind: doc.kind,
    format: doc.format,
    start: doc.start,
    end: doc.end,
    venue: doc.venue,
    prep: doc.prep,
    finished: doc.finished,
    resultsPublic: doc.resultsPublic,
    roundsPlanned: doc.roundsPlanned,
    rooms: doc.rooms.map((r) => ({ id: r.id, name: r.name })),
    institutions: doc.institutions.map((i) => ({ id: i.id, name: i.name })),
    teams: doc.teams.filter((t) => t.active).map((t) => ({ id: t.id, name: t.name, inst: t.inst, speakers: t.speakers.map((s) => s.name) })),
    judges: doc.judges.filter((j) => j.active).map((j) => ({ id: j.id, name: j.name })),
    rounds: shown.map((r) => ({
      n: r.n,
      status: r.status,
      motion: r.status === 'motion' || r.status === 'confirmed' ? r.motion : '',
      info: r.status === 'motion' || r.status === 'confirmed' ? r.info : '',
      motionAt: r.status === 'motion' || r.status === 'confirmed' ? r.motionAt : undefined,
      debates: r.debates.map((d) => ({ id: d.id, room: d.room, teams: d.teams, panel: d.panel.map((s) => ({ judge: s.judge, role: s.role })) })),
    })),
    announcements: [...doc.announcements].sort((a, b) => b.at - a.at).slice(0, 30),
    committees: doc.committees.map((c) => ({ id: c.id, name: c.name, agenda: c.agenda, speakers: c.speakers, speakSeconds: c.speakSeconds })),
    delegates: doc.delegates.map((d) => ({
      id: d.id,
      committee: d.committee,
      country: d.country,
      inst: d.inst,
      name: d.name,
      award: doc.resultsPublic ? d.award : '',
    })),
  }
  if (doc.resultsPublic) {
    pub.standings = standings(doc).map((s) => ({
      id: s.team.id,
      name: s.team.name,
      inst: s.team.inst,
      points: s.points,
      wins: s.wins,
      ballots: s.ballots,
      speaks: Math.round(s.speaks * 100) / 100,
      rank: s.rank,
    }))
    pub.speakerTab = speakerTab(doc).map((s) => ({
      id: s.id,
      name: s.name,
      team: s.team.name,
      total: Math.round(s.total * 100) / 100,
      rounds: s.rounds,
      average: s.average,
      rank: s.rank,
    }))
    pub.breaking = breakingTeams(doc)
    pub.rounds.forEach((pr) => {
      const r = doc.rounds.find((x) => x.n === pr.n)!
      if (r.status !== 'confirmed') return
      const res: Record<string, number[]> = {}
      for (const d of r.debates) {
        const dr = debateResult(doc, r, d)
        if (dr) res[d.id] = d.teams.map((t) => dr.order.indexOf(t))
      }
      pr.results = res
    })
  }
  return pub
}

/* ============================ new events ============================ */

export function blankEvent(over: Partial<TabDoc> = {}): TabDoc {
  return {
    name: '',
    urdu: '',
    kind: 'debate',
    format: 'BP',
    start: '',
    end: '',
    venue: '',
    prep: 15,
    scoreMin: 50,
    scoreMax: 100,
    replyMin: 0,
    replyMax: 0,
    breakSize: 8,
    roundsPlanned: 3,
    pairing: 'slide',
    regOpen: true,
    resultsPublic: false,
    finished: false,
    paperMinutes: null,
    rooms: [],
    institutions: [],
    teams: [],
    judges: [],
    conflicts: [],
    rounds: [],
    announcements: [],
    committees: [],
    delegates: [],
    ...over,
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'event'

/* ============================ MUN ============================ */

/** Spread countries across schools: no school holds two seats in one committee if it can be avoided. */
export function allocateCountries(doc: TabDoc, countries: Record<string, string[]>, requests: { inst: string; delegates: number }[]) {
  const seats: { committee: string; country: string }[] = []
  for (const c of doc.committees) for (const country of countries[c.id] ?? []) seats.push({ committee: c.id, country })
  const out: { inst: string; committee: string; country: string }[] = []
  const left = requests.map((r) => ({ ...r }))
  const held = new Map<string, Set<string>>() // inst -> committees
  // round robin over schools, each taking the first seat in a committee it does not hold yet
  let progress = true
  while (progress && seats.length) {
    progress = false
    for (const r of left) {
      if (r.delegates <= 0 || !seats.length) continue
      const mine = held.get(r.inst) ?? new Set()
      let i = seats.findIndex((s) => !mine.has(s.committee))
      if (i < 0) i = 0
      const seat = seats.splice(i, 1)[0]
      out.push({ inst: r.inst, ...seat })
      mine.add(seat.committee)
      held.set(r.inst, mine)
      r.delegates -= 1
      progress = true
    }
  }
  return out
}

/** Roll call numbers for a committee: present, simple majority, two thirds. */
export function quorum(delegates: { attendance: string }[]) {
  const present = delegates.filter((d) => d.attendance !== 'absent').length
  return { present, simple: Math.floor(present / 2) + 1, twoThirds: Math.ceil((present * 2) / 3) }
}

export type { Team, Judge, Debate, Round, Ballot, TabDoc }
