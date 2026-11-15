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
