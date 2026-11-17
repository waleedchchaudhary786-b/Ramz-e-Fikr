import { extraArticles, extraMotions, extraPrompts, extraResourceDetails, extraResources, extraTerms, resourceAdditions } from './extra-content'

/* SAMPLE CONTENT for local preview. Replace with real entries (or connect
   Supabase in Phase 5) before launch. Every item here is a placeholder. */

export type Article = {
  slug: string
  title: string
  /** credited author: may differ from the account that posted it */
  authorName: string
  postedBy: string
  date: string // YYYY-MM-DD
  /** "Latest Ramz": the one-sentence core idea, max 140 chars */
  ramz: string
  excerpt: string
  category: string
  readMins: number
}

export type Motion = {
  slug: string
  text: string
  format: 'BP' | 'AP' | 'WSDC' | 'Bilingual'
  theme: string
  date: string
}

export type Resource = {
  slug: string
  title: string
  kind: 'Guide' | 'Casefile' | 'Worksheet' | 'Lecture notes'
  summary: string
  date: string
}

const baseArticles: Article[] = [
  {
    slug: 'rebuttal-is-listening',
    title: 'Rebuttal is mostly listening',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-11-12',
    ramz: 'The best rebuttal answers the argument your opponent meant, not the one they fumbled.',
    excerpt:
      'Most rounds are lost in the notes, not at the podium. A case for flowing the strongest version of the other side, and why judges reward it.',
    category: 'Craft',
    readMins: 6,
  },
  {
    slug: 'urdu-debate-is-not-a-translation',
    title: 'Urdu debating is not English debating, translated',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-11-05',
    ramz: 'A language carries its own way of arguing, and our circuits should let it.',
    excerpt:
      'Bilingual formats keep importing structure from parliamentary English. What would a format built from the mushaira up look like?',
    category: 'Circuit',
    readMins: 8,
  },
  {
    slug: 'evidence-is-not-an-argument',
    title: 'Evidence is not an argument',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-11-01',
    ramz: 'A fact tells the room what is happening; only reasoning tells it why your side should win.',
    excerpt: 'The speaker with the thickest folder is often the most surprised by the ballot. On the difference between knowing something and arguing from it.',
    category: 'Craft',
    readMins: 4,
  },
  {
    slug: 'the-case-for-losing',
    title: 'The case for losing your first ten rounds',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-10-28',
    ramz: 'Early losses are tuition, and the debaters who pay it stay longest.',
    excerpt: 'Novice break rates say less about talent than about who was allowed to be bad for long enough.',
    category: 'Opinion',
    readMins: 5,
  },
]

/** every essay, newest first */
export const articles: Article[] = [...baseArticles, ...extraArticles].sort((a, b) => b.date.localeCompare(a.date))

export const motions: Motion[] = [
  {
    slug: 'private-academies',
    text: 'This House would cap the fees of private tuition academies',
    format: 'BP',
    theme: 'Education',
    date: '2026-11-13',
  },
  {
    slug: 'smog-shutdowns',
    text: 'This House would shut factories, not schools, on high-smog days',
    format: 'AP',
    theme: 'Environment',
    date: '2026-11-11',
  },
  {
    slug: 'regional-languages',
    text: 'This House believes regional languages should be the medium of primary schooling',
    format: 'Bilingual',
    theme: 'Language',
    date: '2026-11-08',
  },
  {
    slug: 'student-unions',
    text: 'This House would restore student unions on every public campus',
    format: 'WSDC',
    theme: 'Politics',
    date: '2026-11-04',
  },
  {
    slug: 'textile-subsidies',
    text: 'This House regrets subsidising the textile sector over small farmers',
    format: 'BP',
    theme: 'Economy',
    date: '2026-10-30',
  },
]

export const resources: Resource[] = [
  {
    slug: 'first-principles-casebuilding',
    title: 'Casebuilding from first principles',
    kind: 'Guide',
    summary: 'A fifteen-minute method for turning any motion into two clean arguments.',
    date: '2026-11-10',
  },
  {
    slug: 'weighing-worksheet',
    title: 'The weighing worksheet',
    kind: 'Worksheet',
    summary: 'Scale, likelihood, reversibility: fill it in before you write a single extension.',
    date: '2026-11-02',
  },
  {
    slug: 'pk-economy-casefile',
    title: 'Casefile: the IMF programme in six arguments',
    kind: 'Casefile',
    summary: 'Background, both benches, and the clashes that keep coming up.',
    date: '2026-10-26',
  },
]

export const weeklyPrompt = {
  week: 'Week of 9 November 2026',
  text: 'Should a debater ever argue a side they find indefensible?',
  replies: 14,
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ---------- more sample content for the inner pages ---------- */

export const moreMotions: Motion[] = [
  { slug: 'ai-in-classrooms', text: 'This House would allow AI tutors in public school classrooms', format: 'WSDC', theme: 'Technology', date: '2026-10-27' },
  { slug: 'cricket-funding', text: 'This House would redirect cricket board funding to school sports', format: 'AP', theme: 'Sport', date: '2026-10-22' },
  { slug: 'metro-fares', text: 'This House believes public transport in Lahore should be free', format: 'BP', theme: 'Cities', date: '2026-10-22' },
  { slug: 'dowry-ban', text: 'This House would criminalise the giving and taking of dowry', format: 'Bilingual', theme: 'Society', date: '2026-10-15' },
  { slug: 'exam-boards', text: 'This House would abolish matriculation board exams', format: 'WSDC', theme: 'Education', date: '2026-10-09' },
  { slug: 'water-pricing', text: 'This House would price canal water at its true cost', format: 'BP', theme: 'Environment', date: '2026-10-02' },
]
export const allMotions: Motion[] = [...motions, ...moreMotions, ...extraMotions]

export const moreResources: Resource[] = [
  { slug: 'poi-drills', title: 'Twenty drills for points of information', kind: 'Worksheet', summary: 'Short partner exercises for offering and taking POIs without losing your thread.', date: '2026-10-20' },
  { slug: 'adjudication-notes', title: 'How adjudicators actually decide', kind: 'Lecture notes', summary: 'What a panel discusses after you leave the room, and how to speak to it.', date: '2026-10-12' },
  { slug: 'smog-casefile', title: 'Casefile: smog season', kind: 'Casefile', summary: 'Sources, numbers and the usual clashes on air quality in Punjab.', date: '2026-10-05' },
]
export const allResources: Resource[] = [...resources, ...moreResources, ...extraResources].sort((a, b) => b.date.localeCompare(a.date))

export type Term = { term: string; urdu: string; meaning: string }
const baseGlossary: Term[] = [
  { term: 'Burden', urdu: 'بارِ ثبوت', meaning: 'What a side must prove to win. Name yours early and hold the other side to theirs.' },
  { term: 'Clash', urdu: 'ٹکراؤ', meaning: 'A point where the two sides directly disagree. Rounds are decided on clashes, not on speeches.' },
  { term: 'Extension', urdu: 'توسیع', meaning: 'New material a closing team adds that the opening team on its bench did not make.' },
  { term: 'Framing', urdu: 'زاویہ', meaning: 'Telling the judge how to look at the debate before telling them what to conclude.' },
  { term: 'Mechanism', urdu: 'طریقۂ کار', meaning: 'The step-by-step reason your claim leads to your impact. No mechanism, no argument.' },
  { term: 'Motion', urdu: 'قرارداد', meaning: 'The statement being debated, usually beginning "This House".' },
  { term: 'Point of information', urdu: 'نکتۂ معلومات', meaning: 'A short interruption offered to the speaker by the other side, which they may accept or decline.' },
  { term: 'Rebuttal', urdu: 'تردید', meaning: 'A direct answer to an argument the other side has made.' },
  { term: 'Signposting', urdu: 'نشان دہی', meaning: 'Telling the room where you are in your speech so nobody has to guess.' },
  { term: 'Weighing', urdu: 'موازنہ', meaning: 'Explaining why your impact matters more than theirs: bigger, likelier, or harder to undo.' },
  { term: 'Whip', urdu: 'وہپ', meaning: 'The last speaker on a bench, who summarises the debate and adds no new arguments.' },
]

export const glossary: Term[] = [...baseGlossary, ...extraTerms].sort((a, b) => a.term.localeCompare(b.term))

export const pastPrompts = [
  { week: 'Week of 2 November 2026', text: 'Is a persuasive speech with a false statistic still a good speech?' },
  { week: 'Week of 26 October 2026', text: 'Should novices be allowed to choose their side?' },
  ...extraPrompts,
]

/* ---------- resource pages (sample text) ---------- */
export type ResourceSection = { heading: string; body?: string; points: string[] }
export type ResourceDetail = {
  level: 'Novice' | 'Intermediate' | 'Any level'
  time: string
  /** when to reach for this resource */
  useWhen: string
  intro: string
  sections: ResourceSection[]
  example?: { title: string; lines: string[] }
  mistakes: string[]
  /** short definitions of the ideas the resource relies on */
  keyIdeas?: { term: string; text: string }[]
  /** practice exercises */
  drills?: { name: string; time: string; steps: string[] }[]
  /** lines a speaker can borrow */
  phrases?: string[]
  /** a pre-round checklist */
  checklist?: string[]
  /** links onward: "article:slug" or "resource:slug" */
  related?: string[]
}

export const resourceDetails: Record<string, ResourceDetail> = {
  'first-principles-casebuilding': {
    level: 'Novice',
    time: '15 minutes of prep',
    useWhen: 'You have a motion you know nothing about and a clock running.',
    intro: 'Most weak cases are not short of ideas. They are short of structure: five half-arguments where two whole ones would win. This method spends the first third of prep on understanding the debate, the middle on building exactly two arguments, and the end on the other side.',
    sections: [
      { heading: 'Minutes 0 to 5: what is this debate about?', body: 'Do not write arguments yet. A team that agrees on what the debate is about will out-prepare a team that started writing at minute one.', points: ['Rewrite the motion in your own words, in one sentence.', 'Name who is affected and what changes for them.', 'Write down what your side must prove to win. That is your burden.', 'Agree a one-line answer to "why now?"'] },
      { heading: 'Minutes 5 to 12: two arguments, not five', body: 'Each argument gets three lines and no more. If a line is empty, the argument is not ready.', points: ['Claim: what is true?', 'Mechanism: why does it happen, step by step?', 'Impact: who is better or worse off, and how much?', 'One example a stranger would believe.'] },
      { heading: 'Minutes 12 to 15: their best case', body: 'Spend the last three minutes on the other bench. It is the cheapest rebuttal you will ever prepare.', points: ['Write the strongest thing the other side will say.', 'Prepare one answer to it, and decide who delivers it.', 'Decide the order of speakers and who takes which argument.'] },
    ],
    example: { title: 'Worked example: "This House would cap academy fees"', lines: ['Burden (Prop): a cap makes tuition fairer without destroying supply.', 'Claim: fees are set by parental fear, not by cost.', 'Mechanism: exam pressure, little information, so parents pay whatever is asked.', 'Impact: low-income families either overspend or drop out of the race.', 'Their best case: capped academies close or go informal. Our answer: cap at a level tied to verified costs.'] },
    mistakes: ['Starting to write arguments before agreeing what the debate is about.', 'Five arguments with no mechanisms.', 'Examples only your own city would recognise.'],
  },
  'weighing-worksheet': {
    level: 'Intermediate',
    time: '5 minutes, mid-round',
    useWhen: 'Both sides have landed an argument and the judge needs a reason to prefer yours.',
    intro: 'Weighing is the part of a speech where you stop proving your argument is true and start proving it matters more. Most close rounds are decided here, and most speakers skip it. The worksheet gives you three questions to ask of both impacts.',
    sections: [
      { heading: 'Fill in for your impact, then theirs', body: 'Be honest in the second column. If you write their impact as smaller than it is, your weighing will not survive their next speech.', points: ['Scale: how many people, and how badly?', 'Likelihood: how sure are we that it happens?', 'Reversibility: can it be undone later?', 'Timeframe: does it happen now, or in ten years?'] },
      { heading: 'Pick one row and say it out loud', body: 'You win weighing on one comparison made clearly, not on four made quickly.', points: ['"Even if they are right about X, our impact matters more because…"', 'Use one of the rows above as the reason, not all of them.', 'Say what the judge should do with it: "so prefer our side on this clash."'] },
      { heading: 'When they weigh back', points: ['Do not repeat your row. Answer theirs, then return to yours.', 'If they win scale, contest likelihood. If they win likelihood, contest reversibility.'] },
    ],
    example: { title: 'Worked example: smog shutdowns', lines: ['Our impact: children miss three weeks of school a year.', 'Their impact: factory workers lose wages on shutdown days.', 'Row chosen: reversibility. Lost wages can be compensated; a lost month of early schooling is much harder to give back.'] },
    mistakes: ['Weighing only your own impact.', 'Saying "our impact is bigger" with no reason.', 'Leaving weighing to the last ten seconds.'],
  },
  'pk-economy-casefile': {
    level: 'Intermediate',
    time: '20 minutes to read',
    useWhen: 'An economics motion about Pakistan comes up and you need the shape of the argument fast.',
    intro: 'This casefile is a map, not a script. It sets out what each bench usually argues about an IMF programme and where the two sides actually collide, so that your prep time goes on the clash and not on background.',
    sections: [
      { heading: 'Background you need', body: 'Learn the vocabulary first; half of these debates are lost on a muddled definition.', points: ['What a programme is, what conditions are, and who signs.', 'The difference between stabilisation (stopping a crisis) and growth (getting richer).', 'Why subsidies, the exchange rate and tax collection keep appearing in conditions.'] },
      { heading: 'What Proposition benches usually run', points: ['Credibility: lenders and investors return once a programme is in place.', 'Discipline: conditions force reforms that governments avoid on their own.', 'No alternative: the other sources of money come with worse terms.'] },
      { heading: 'What Opposition benches usually run', points: ['Burden: the cost of adjustment falls on those least able to pay.', 'Cycle: repeated programmes suggest the cure does not work.', 'Sovereignty: policy is set by lenders, not voters.'] },
      { heading: 'Clashes that keep coming up', points: ['Short-term pain against long-term credibility.', 'Who bears the cost of subsidy removal.', 'Whether the reforms would have been needed anyway.'] },
    ],
    mistakes: ['Quoting figures you cannot source. Say "roughly" or leave the number out.', 'Treating the lender as a villain or a saviour; judges reward the mechanism.', 'Forgetting to say what happens without a programme.'],
  },
  'poi-drills': {
    level: 'Any level',
    time: '10 minutes per drill',
    useWhen: 'Your team goes quiet during the other side\u2019s speeches, or loses its thread when interrupted.',
    intro: 'Points of information are a skill you can train like any other, in pairs, in ten minutes. These drills are grouped by which half of the exchange they practise.',
    sections: [
      { heading: 'Offering', body: 'A good POI is a question the speaker would rather not answer, short enough that they cannot wave it away.', points: ['Fifteen words or fewer. Partner counts on their fingers.', 'Ask a question the speaker cannot answer in one word.', 'Stand, say "on that point", and sit the moment you are declined.', 'Drill: partner reads any paragraph aloud; you offer three POIs in two minutes.'] },
      { heading: 'Taking', body: 'You are in charge of your own speech. Take a point when it suits you, not when it suits them.', points: ['Finish your sentence first, then accept.', 'Answer in two sentences and return to your signpost by name.', 'Take two in a seven-minute speech; decline the rest politely.', 'Drill: speak for three minutes on anything; partner interrupts every thirty seconds.'] },
      { heading: 'As a team', points: ['Agree who offers on which argument before the speech starts.', 'Pass a note, not a whisper.'] },
    ],
    mistakes: ['A POI that is really a speech.', 'Accepting mid-sentence and losing the argument you were making.', 'Offering every ten seconds; it reads as barracking.'],
  },
  'adjudication-notes': {
    level: 'Any level',
    time: '10 minutes to read',
    useWhen: 'You keep losing rounds you thought you won.',
    intro: 'Debaters imagine that judges score speeches. Mostly they do not. They identify the two or three places where the sides disagreed, decide who won each, and then decide which of those mattered most. Once you know that is the conversation, you can write your speech for it.',
    sections: [
      { heading: 'What the panel talks about', points: ['Which clashes decided the round, in order.', 'Who won each clash and why, in the debaters\u2019 own words.', 'Whether a team did what its role required (opening, closing, whip).'] },
      { heading: 'What the panel does not talk about', points: ['Who sounded most confident.', 'Arguments that were asserted but never explained.', 'Things a speaker clearly knew but did not say.'] },
      { heading: 'What that means for your speech', body: 'Make the judge\u2019s job easy and they will tend to write down your version of the round.', points: ['Tell the judge which clash matters most. They are looking for it anyway.', 'Use the same names for arguments that your partner used.', 'Arguments nobody answered are not automatically won; they still need weighing.'] },
    ],
    mistakes: ['Assuming the judge filled in your missing step.', 'Arguing with the decision instead of asking for one thing to fix.'],
  },
  'smog-casefile': {
    level: 'Novice',
    time: '15 minutes to read',
    useWhen: 'Any environment or public-health motion set in Punjab.',
    intro: 'Smog motions come up every winter. This casefile gives you the causes, the usual policy options and the clashes, so you can spend prep on argument and not on trying to remember what a brick kiln has to do with it.',
    sections: [
      { heading: 'Sources of the problem', body: 'Be careful with shares: they vary by study and by month. Describe the sources; do not invent percentages.', points: ['Crop residue burning after the rice harvest.', 'Vehicle exhaust, especially older diesel engines.', 'Brick kilns and small industry.', 'Weather: cold, still air traps what is emitted, which is why it peaks in November.'] },
      { heading: 'Policy options that get debated', points: ['Closing schools and offices on the worst days.', 'Shutting or converting kilns and factories.', 'Paying farmers not to burn, or supplying machinery.', 'Restricting vehicles by age, type or day.'] },
      { heading: 'Usual clashes', points: ['School closures against factory closures: whose loss is easier to repair?', 'Provincial action against causes that cross the border.', 'New laws against the capacity to enforce the ones that exist.'] },
    ],
    example: { title: 'A framing line you can borrow', lines: ['"This debate is not about whether smog is bad. It is about who should pay to reduce it, and whether they can."'] },
    mistakes: ['Making up statistics.', 'Blaming a single source.', 'Ignoring enforcement: a ban nobody enforces is not a policy.'],
  },
}

/* fold in the extra resource pages and the richer sections for the originals */
Object.assign(resourceDetails, extraResourceDetails)
for (const [slug, add] of Object.entries(resourceAdditions)) {
  const base = resourceDetails[slug]
  if (!base) continue
  const { moreSections, ...rest } = add
  resourceDetails[slug] = { ...base, ...rest, sections: [...base.sections, ...(moreSections ?? [])] }
}
