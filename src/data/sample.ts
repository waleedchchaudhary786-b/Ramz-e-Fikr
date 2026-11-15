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

export const articles: Article[] = [
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
export const allMotions: Motion[] = [...motions, ...moreMotions]

export const moreResources: Resource[] = [
  { slug: 'poi-drills', title: 'Twenty drills for points of information', kind: 'Worksheet', summary: 'Short partner exercises for offering and taking POIs without losing your thread.', date: '2026-10-20' },
  { slug: 'adjudication-notes', title: 'How adjudicators actually decide', kind: 'Lecture notes', summary: 'What a panel discusses after you leave the room, and how to speak to it.', date: '2026-10-12' },
  { slug: 'smog-casefile', title: 'Casefile: smog season', kind: 'Casefile', summary: 'Sources, numbers and the usual clashes on air quality in Punjab.', date: '2026-10-05' },
]
export const allResources: Resource[] = [...resources, ...moreResources]

export type Term = { term: string; urdu: string; meaning: string }
export const glossary: Term[] = [
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

export const pastPrompts = [
  { week: 'Week of 2 November 2026', text: 'Is a persuasive speech with a false statistic still a good speech?' },
  { week: 'Week of 26 October 2026', text: 'Should novices be allowed to choose their side?' },
]

/* ---------- resource pages (sample text) ---------- */
export type ResourceSection = { heading: string; points: string[] }
export const resourceBodies: Record<string, ResourceSection[]> = {
  'first-principles-casebuilding': [
    { heading: 'Minutes 0 to 5: what is this debate about?', points: ['Rewrite the motion in your own words, in one sentence.', 'Name who is affected and what changes for them.', 'Write down what your side must prove to win. That is your burden.'] },
    { heading: 'Minutes 5 to 12: two arguments, not five', points: ['For each argument write claim, mechanism, impact on three separate lines.', 'If you cannot write the mechanism, you do not have an argument yet.', 'Pick one example per argument that a stranger would believe.'] },
    { heading: 'Minutes 12 to 15: their best case', points: ['Write the strongest thing the other side will say.', 'Prepare one answer to it, and decide who delivers it.'] },
  ],
  'weighing-worksheet': [
    { heading: 'Fill in for your impact, then theirs', points: ['Scale: how many people, and how badly?', 'Likelihood: how sure are we that it happens?', 'Reversibility: can it be undone later?'] },
    { heading: 'Then say it out loud', points: ['"Even if they are right about X, our impact matters more because…"', 'Use one of the three rows above as the reason, not all three.'] },
  ],
  'pk-economy-casefile': [
    { heading: 'Background', points: ['What a programme is, what conditions are, and who signs.', 'The difference between stabilisation and growth.'] },
    { heading: 'Clashes that keep coming up', points: ['Short-term pain against long-term credibility.', 'Who bears the cost of subsidy removal.', 'Whether conditions would have been needed anyway.'] },
  ],
  'poi-drills': [
    { heading: 'Offering', points: ['Fifteen words or fewer. Practise with a partner counting.', 'Ask a question the speaker cannot answer in one word.'] },
    { heading: 'Taking', points: ['Finish your sentence first, then accept.', 'Answer in two sentences and return to your signpost by name.'] },
  ],
  'adjudication-notes': [
    { heading: 'What the panel talks about', points: ['Which clashes decided the round, in order.', 'Who won each clash and why, in the debaters’ own words.'] },
    { heading: 'What that means for you', points: ['Tell the judge which clash matters most. They are looking for it anyway.', 'Arguments nobody answered are not automatically won; they still need weighing.'] },
  ],
  'smog-casefile': [
    { heading: 'Sources of the problem', points: ['Crop burning, vehicles, brick kilns and industry: learn rough shares before quoting them.', 'Why the season peaks in November.'] },
    { heading: 'Usual clashes', points: ['School closures against factory closures.', 'Provincial action against cross-border causes.', 'Enforcement capacity against new laws.'] },
  ],
}
