/* Runs simulated tournaments through the engine and checks the rules. npx tsx scripts/engine-test.ts */
import {
  allocateJudges,
  blankEvent,
  checkBallot,
  clashes,
  debateResult,
  makeDraw,
  publicCopy,
  standings,
  speakerTab,
  breakingTeams,
  rng,
  uid,
  missingBallots,
  canVote,
} from '../src/tab/engine'
import { FORMATS, SCORE_DEFAULTS, type Format, type TabDoc, type Ballot } from '../src/tab/types'

let pass = 0,
  fail = 0
const ok = (c: boolean, m: string) => {
  c ? pass++ : fail++
  if (!c) console.log('FAIL', m)
}

function build(format: Format, nTeams: number, nSchools: number, nJudges: number): TabDoc {
  const doc = blankEvent({ name: 'Test', format, ...SCORE_DEFAULTS[format], breakSize: 4, roundsPlanned: 4 })
  const f = FORMATS[format]
  for (let i = 0; i < nSchools; i++) doc.institutions.push({ id: 'i' + i, name: 'School ' + i, code: 'S' + i, token: 'tok' + i })
  for (let i = 0; i < nTeams; i++)
    doc.teams.push({
      id: 't' + i,
      name: 'Team ' + i,
      inst: 'i' + (i % nSchools),
      active: true,
      speakers: Array.from({ length: f.speakers }, (_, k) => ({ id: `t${i}s${k}`, name: `S${i}.${k}` })),
    })
  for (let i = 0; i < nJudges; i++)
    doc.judges.push({ id: 'j' + i, name: 'Judge ' + i, inst: i % 3 === 0 ? null : 'i' + (i % nSchools), rating: 1 + (i % 5), code: 'CODE' + i, active: true })
  const rooms = nTeams / f.teamsPerRoom
  for (let i = 0; i < rooms; i++) doc.rooms.push({ id: 'r' + i, name: 'Room ' + (i + 1) })
  doc.conflicts.push({ a: 'j4', b: 't0' }, { a: 'j5', b: 'j7' })
  return doc
}

function playRound(doc: TabDoc, n: number, seed: number) {
  const debates = makeDraw(doc, n, seed)
  const { debates: withJ, problems } = allocateJudges(doc, debates)
  const round = { n, motion: 'THW test', info: '', status: 'motion' as const, seed, debates: withJ, ballots: [] as Ballot[] }
  doc.rounds.push(round)
  const f = FORMATS[doc.format]
  // checks on the draw
  const ids = withJ.flatMap((d) => d.teams)
  ok(new Set(ids).size === ids.length && ids.length === doc.teams.filter((t) => t.active).length, `${doc.format} r${n}: every team once`)
  const js = withJ.flatMap((d) => d.panel.map((s) => s.judge))
  ok(new Set(js).size === js.length, `${doc.format} r${n}: no judge twice`)
  const cl = clashes(doc, round)
  const judgeClash = Object.values(cl)
    .flat()
    .filter((x) => x.includes('conflict') || (x.includes('school') && x.includes('is from')))
  ok(judgeClash.length === 0, `${doc.format} r${n}: no judge conflicts ${JSON.stringify(judgeClash)}`)
  ok(problems.length === 0, `${doc.format} r${n}: allocation problems ${problems}`)
  const same = Object.values(cl)
    .flat()
    .filter((x) => x.includes('same school')).length
  if (!doc.format.startsWith('BP'))
    ok(
      withJ.every((d) => d.panel.filter((s) => s.role !== 'trainee').length % 2 === 1),
      `${doc.format} r${n}: odd voting panels`,
    )
  // ballots from every voting judge, random but valid
  const r = rng(seed * 7)
  for (const d of withJ) {
    for (const s of d.panel) {
      if (!canVote(doc, s)) continue
      const scores: Record<string, number[]> = {}
      let totals = new Set<number>()
      for (const t of d.teams) {
        let arr: number[]
        do {
          arr = Array.from(
            { length: f.speakers },
            () => doc.scoreMin + (Math.round(r() * (doc.scoreMax - doc.scoreMin) * 2) / 2) * 0.5 + (doc.scoreMax - doc.scoreMin) / 4,
          )
          arr = arr.map((v) => Math.min(doc.scoreMax, Math.round(v * 2) / 2))
          if (f.reply) arr.push(doc.replyMin + Math.round(r() * (doc.replyMax - doc.replyMin) * 2) / 2)
        } while (totals.has(arr.reduce((a, b) => a + b, 0)))
        totals.add(arr.reduce((a, b) => a + b, 0))
        scores[t] = arr
      }
      const b = { debate: d.id, judge: s.judge, at: Date.now(), scores, reason: 'test' }
      const problem = checkBallot(doc, round, b)
      ok(problem === null, `${doc.format} r${n}: valid ballot accepted (${problem})`)
      round.ballots.push(b)
    }
  }
  ok(missingBallots(doc, round).length === 0, `${doc.format} r${n}: no ballots missing`)
  ok(
    withJ.every((d) => debateResult(doc, round, d) !== null),
    `${doc.format} r${n}: every room has a result`,
  )
  ;(round as { status: string }).status = 'confirmed'
  return same
}

for (const [format, teams, schools, judges] of [
  ['BP', 16, 5, 14],
  ['AP', 12, 4, 15],
  ['WSDC', 10, 4, 12],
  ['URDU', 8, 3, 9],
  ['BP', 8, 2, 6],
] as [Format, number, number, number][]) {
  const doc = build(format, teams, schools, judges)
  let sameTotal = 0
  for (let n = 1; n <= 4; n++) sameTotal += playRound(doc, n, 1000 + n)
  const st = standings(doc)
  ok(st.length === teams, `${format}: standings has every team`)
  if (format === 'BP') ok(st.reduce((a, s) => a + s.points, 0) === (teams / 4) * 6 * 4, `${format}: BP points add up`)
  else ok(st.reduce((a, s) => a + s.wins, 0) === (teams / 2) * 4, `${format}: wins add up`)
  // power pairing: in round 4, rooms should be roughly ordered by bracket
  const r4 = doc.rounds[3]
  ok(
    r4.debates.every((d, i) => i === 0 || d.bracket <= r4.debates[i - 1].bracket),
    `${format}: rooms in bracket order`,
  )
  if (format !== 'BP') {
    // rematches avoided where possible
    const pairs = doc.rounds.flatMap((r) => r.debates.map((d) => [...d.teams].sort().join('-')))
    ok(new Set(pairs).size === pairs.length, `${format}: no rematches`)
  }
  console.log(`${format} ${teams} teams/${schools} schools: same-school rooms across 4 rounds = ${sameTotal}`)
  ok(speakerTab(doc).length > 0, `${format}: speaker tab`)
  ok(breakingTeams(doc).length === 4, `${format}: break of 4`)
  // public copy must not leak
  const pubPrivate = JSON.stringify(publicCopy(doc))
  ok(
    !pubPrivate.includes('CODE') && !pubPrivate.includes('tok') && !pubPrivate.includes('rating') && !pubPrivate.includes('conflicts'),
    `${format}: public copy hides codes, tokens, ratings`,
  )
  ok(!('standings' in publicCopy(doc)), `${format}: results hidden until public`)
  doc.resultsPublic = true
  ok((publicCopy(doc).standings?.length ?? 0) === teams, `${format}: results shown when public`)
}

// ballot checks refuse bad input
{
  const doc = build('WSDC', 4, 2, 3)
  const debates = allocateJudges(doc, makeDraw(doc, 1, 5)).debates
  const round = { n: 1, motion: '', info: '', status: 'motion' as const, seed: 5, debates, ballots: [] }
  const d = debates[0]
  const chair = d.panel[0].judge
  const good = { debate: d.id, judge: chair, scores: { [d.teams[0]]: [70, 70, 70, 35], [d.teams[1]]: [71, 70, 70, 35] } }
  ok(checkBallot(doc, round, good) === null, 'good ballot ok')
  ok(checkBallot(doc, round, { ...good, scores: { [d.teams[0]]: [70, 70, 70, 35], [d.teams[1]]: [70, 70, 70, 35] } }) !== null, 'tie refused')
  ok(checkBallot(doc, round, { ...good, scores: { [d.teams[0]]: [90, 70, 70, 35], [d.teams[1]]: [71, 70, 70, 35] } }) !== null, 'out of range refused')
  ok(checkBallot(doc, round, { ...good, scores: { [d.teams[0]]: [70.3, 70, 70, 35], [d.teams[1]]: [71, 70, 70, 35] } }) !== null, 'non half-point refused')
  ok(checkBallot(doc, round, { ...good, judge: 'nobody' }) !== null, 'judge not on panel refused')
  ok(checkBallot(doc, { ...round, status: 'confirmed' }, good) !== null, 'closed round refused')
  let threw = false
  try {
    makeDraw(build('BP', 6, 2, 3), 1, 1)
  } catch {
    threw = true
  }
  ok(threw, 'BP with 6 teams asks for swing teams')
}
console.log(`\n${pass} passed, ${fail} failed`)
