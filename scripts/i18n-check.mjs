/* Lists every English string Ramz Tab shows, and fails if any has no Urdu. node scripts/i18n-check.mjs */
import fs from 'node:fs'
const files = fs.readdirSync('src/tab').filter((f) => f.endsWith('.tsx') || f.endsWith('.ts')).map((f) => 'src/tab/' + f)
const found = new Set()
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8')
  for (const m of s.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) found.add(m[1].replace(/\\u2019/g, '’').replace(/\\'/g, "'"))
  for (const m of s.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) found.add(m[1])
  for (const m of s.matchAll(/t\(\s*[a-z.]+\s*\?\s*'([^']*)'\s*:\s*'([^']*)'/g)) { found.add(m[1]); found.add(m[2]) }
}
// strings passed to t() through variables
const indirect = [
  'Not drawn yet', 'Draw in progress', 'Draw released', 'Motion out', 'Results in',
  'to draw', 'draft', 'drawn', 'live', 'done',
  'Opening Government', 'Opening Opposition', 'Closing Government', 'Closing Opposition', 'Government', 'Opposition', 'Proposition',
  'British Parliamentary', 'Asian Parliamentary', 'World Schools', 'Urdu parliamentary',
  '1st', '2nd', '3rd', '4th', 'chair', 'panel', 'trainee',
  'Basics', 'Format', 'Rooms and motions', 'Schools', 'Check and create',
  'Events run', 'Teams', 'Delegates', 'Rounds', 'Ballots submitted',
  'Best Delegate', 'Outstanding Delegate', 'Honourable Mention', 'absent', 'present', 'present and voting',
  // messages from the engine and the database
  'That code is not valid.', 'Ballots for this round are closed.', 'That debate is not in this round.', 'You are not on the panel for this room.',
  'In British Parliamentary only the chair submits the ballot.', 'Trainee judges do not submit ballots.', 'Every speaker needs a score.', 'Scores are for the wrong teams.',
  'Scores go up in half points.', 'Two teams have the same total. Adjust a score so every team has a different total.', 'Keep the reason under 800 characters.',
  'That registration link is not valid.', 'Registration is closed. Ask the tournament director to make changes.', 'A school can register at most 30 teams and 30 judges.',
  'Team names must be 1 to 60 characters.', 'Each speaker needs a name or initials (up to 60 characters).', 'Judge names must be 1 to 60 characters.',
  'You do not have permission to do that.', 'That web address is already taken. Try another.', 'This event no longer exists.', 'The event is changing quickly. Try again in a moment.',
  'Adding directors by email works on the live site, where people have accounts.', 'No account uses that email yet. Ask them to sign in to Ramz-e-Fikr once first.',
  'Only this event\'s directors can add directors.',
  // messages the console shows after saving
  'Round added.', 'Draw generated. Only directors can see it until you release it.', 'Judges allocated again.', 'Draw released to every screen.',
  'Motion released. Prep has started on every screen.', 'Draw taken back to draft.', 'Results confirmed.', 'Round reopened for ballots.', 'Motion saved.',
  'Ballot saved.', 'Saved.', 'School added.', 'New link made. The old one no longer works.', 'Team added.', 'Team removed.', 'New code made. The old one no longer works.',
  'Judge added.', 'Conflict added.', 'Conflict removed.', 'Results are private again.', 'Results are public.', 'Event reopened.', 'Event finished. Its motions are now in the archive.',
  'Announcement sent to every screen.', 'Removed.', 'Setup saved.', 'Committee added.', 'Countries allocated.', 'Next speaker.', 'Awards are private again.', 'Awards are public.',
  'You need at least 2 active teams.', 'You need at least 4 active teams.',
]
indirect.forEach((s) => found.add(s))
const ur = fs.readFileSync('src/tab/ur.ts', 'utf8')
const have = new Set([
  ...[...ur.matchAll(/^\s*'((?:[^'\\]|\\.)*)':/gm)].map((m) => m[1].replace(/\\'/g, "'")),
  ...[...ur.matchAll(/^\s*"((?:[^"\\]|\\.)*)":/gm)].map((m) => m[1]),
  ...[...ur.matchAll(/^\s*([A-Za-z]\w*):/gm)].map((m) => m[1]),
])
const missing = [...found].filter((s) => !have.has(s)).sort()
if (process.argv.includes('--list')) { console.log(JSON.stringify(missing, null, 1)); process.exit(0) }
console.log(`${found.size} strings, ${found.size - missing.length} with Urdu, ${missing.length} missing`)
if (missing.length) { console.log(missing.join('\n')); process.exit(1) }
