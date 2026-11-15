/* Full text of the essays (SAMPLE content, written as placeholders).
   An essay is a list of blocks: paragraphs, sub-headings, pull quotes, lists. */

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'q'; text: string }
  | { t: 'ul'; items: string[] }

export type ArticleDetail = {
  /** three one-line takeaways shown before the essay */
  brief: string[]
  blocks: Block[]
  /** how to use the idea in an actual round */
  inARound: string[]
  bio: string
  /** a correction or source note, marked with a dagger */
  note?: string
}

export const articleDetails: Record<string, ArticleDetail> = {
  'rebuttal-is-listening': {
    brief: [
      'Answer the argument your opponent meant, not the sentence they fumbled.',
      'Flow the strongest version of their case in your own notes.',
      'Say out loud that you are doing it. Judges reward it.',
    ],
    blocks: [
      { t: 'p', text: 'Ask a novice what rebuttal is and you will hear a list of verbs: attack, dismantle, destroy. Ask a finalist and you will hear one: listen. The difference shows up on the flow sheet long before it shows up in the speech.' },
      { t: 'p', text: 'Most of us learn rebuttal as a hunt for mistakes. The speaker misquotes a number, stumbles over a mechanism, forgets to finish an example, and we pounce. It feels like winning. It is usually the cheapest point available in the room, and the judge knows it.' },
      { t: 'h', text: 'The sentence and the argument' },
      { t: 'p', text: 'A weak rebuttal answers the sentence the opponent happened to say. A strong one answers the argument they were reaching for. Those are different targets. The sentence is whatever came out under pressure with thirty seconds left. The argument is the thing their partner will repair in the next speech if you leave it standing.' },
      { t: 'p', text: 'Judges notice which one you chose, because the second kind leaves the other bench with nowhere to retreat to. If you beat the best version of a case, the worse versions fall with it. If you beat only the fumble, you have beaten one speaker on one afternoon.' },
      { t: 'q', text: 'If you beat the best version of a case, the worse versions fall with it.' },
      { t: 'h', text: 'What it looks like on the page' },
      { t: 'p', text: 'This is uncomfortable in practice. It means writing your opponent a better argument than they gave you, in your own notes, with ninety seconds on the clock. A useful habit is to split the rebuttal column of your flow in two: on the left, what they said; on the right, what they needed to say for the point to work.' },
      { t: 'ul', items: [
        'Left column: their words, as close to verbatim as you can manage.',
        'Right column: the missing step. Usually it is the mechanism, sometimes the impact.',
        'Your answer goes against the right column, never the left.',
      ] },
      { t: 'p', text: 'It feels like helping them. It is the opposite: it is refusing to win on a technicality that the next speaker can repair. You are closing the door they had not yet noticed was open.' },
      { t: 'h', text: 'The objection: there is no time' },
      { t: 'p', text: 'The honest objection is time. In a seven-minute speech with four arguments to answer, nobody can rebuild each one before knocking it down. True. So do it for the one argument the round will turn on, and deal with the rest quickly. Choosing which argument deserves that treatment is itself the skill, and it is also a kind of listening.' },
      { t: 'p', text: 'So flow generously. Write down what they meant. Then answer that, out loud, and say that you are doing so: "Even at its strongest, this argument needs X to be true, and here is why it is not." The room will hear the difference between a debater who was waiting to speak and one who was listening.' },
    ],
    inARound: [
      'Pick the one opposing argument the round turns on.',
      'State it better than they did, in one sentence.',
      'Name the step it depends on, and attack that step.',
    ],
    bio: 'Guest Author is a placeholder byline. Real essays carry the writer’s name, school and circuit.',
    note: 'This is sample text written to show how an essay page looks. Replace it with a real essay before launch.',
  },

  'urdu-debate-is-not-a-translation': {
    brief: [
      'Our Urdu rounds run on a structure borrowed from parliamentary English.',
      'The mushaira and the munazara are older traditions of public argument.',
      'A format can be rigorous without sounding translated.',
    ],
    blocks: [
      { t: 'p', text: 'Our bilingual circuits run Urdu rounds on English rails. Seven-minute speeches, points of information, a whip who summarises: the skeleton is parliamentary, and the language is poured in afterwards. We rarely stop to ask whether the skeleton fits.' },
      { t: 'p', text: 'You can hear the strain in the vocabulary. Speakers switch to English for "framework", "burden" and "extension" because the format arrived with those words attached. The speech is in Urdu; the thinking about the speech is not.' },
      { t: 'h', text: 'Two traditions we already have' },
      { t: 'p', text: 'Urdu has its own inherited ways of arguing in public. The mushaira has turn-taking, a presiding voice and an audience that answers back, line by line. The munazara has a long history of structured disputation between named positions, with rules about who speaks and what counts as an answer. Neither maps neatly onto a British parliamentary bench, and neither was built for a stopwatch.' },
      { t: 'q', text: 'The speech is in Urdu; the thinking about the speech is not.' },
      { t: 'h', text: 'What a different format might reward' },
      { t: 'p', text: 'A format built from those traditions might reward different things. The well-chosen couplet would count as evidence of a shared premise, not as decoration. The pause that invites the room to respond would be a technique, not dead air. A speaker could be interrupted by approval as well as by challenge, and would have to handle both.' },
      { t: 'ul', items: [
        'A presiding chair who can ask a speaker to answer the previous point directly.',
        'Audience response recorded as part of the adjudication, within limits.',
        'Shorter turns, more of them, so that argument moves like a conversation.',
      ] },
      { t: 'h', text: 'The worry about rigour' },
      { t: 'p', text: 'The fair worry is that this trades analysis for performance. It does not have to. A munazara is nothing if not a contest of reasons. The question is whether our adjudication sheets can recognise persuasion that does not sound like a translated first proposition, and whether we are willing to train judges for it.' },
      { t: 'p', text: 'A modest first step would be a single trial round at one tournament, judged on a sheet written in Urdu from scratch. If it fails, we have lost an afternoon. If it works, we have a format that belongs to the language it is spoken in.' },
    ],
    inARound: [
      'Prepare your key terms in Urdu before the round, not during it.',
      'Use one couplet or proverb as a premise, then argue from it.',
      'Ask your judge afterwards which moments persuaded them, and note the language.',
    ],
    bio: 'Guest Author is a placeholder byline. Real essays carry the writer’s name, school and circuit.',
    note: 'This is sample text written to show how an essay page looks. Replace it with a real essay before launch.',
  },

  'the-case-for-losing': {
    brief: [
      'Most debaters who last three years lost their first ten rounds.',
      'Early losses teach what no workshop can.',
      'Clubs should protect a novice’s right to be bad for a term.',
    ],
    blocks: [
      { t: 'p', text: 'Look at who is still debating in their third year, and then look at their first ten rounds. Very few of them broke. Most of them lost, repeatedly, in rooms where nobody was keeping count.' },
      { t: 'h', text: 'What a loss actually teaches' },
      { t: 'p', text: 'Early losses are the cheapest lessons this activity sells. You find out that your signposting was only clear to you, that your example was a statistic nobody believed, that speaking faster did not make the argument longer. None of that survives being told. It has to happen to you, in front of a judge, with a ballot at the end.' },
      { t: 'ul', items: [
        'Round two: you learn that a judge cannot credit what they could not follow.',
        'Round five: you learn that the other side also prepared.',
        'Round nine: you learn to enjoy the feedback more than the result.',
      ] },
      { t: 'q', text: 'Early losses are tuition, and the debaters who pay it stay longest.' },
      { t: 'h', text: 'What clubs get wrong' },
      { t: 'p', text: 'Clubs that panic about novice results end up selecting for the students who arrived already polished: the ones with a debating sibling, an English-medium school, a confident voice. Everyone else reads the results sheet, draws the obvious conclusion and stops coming.' },
      { t: 'p', text: 'Clubs that protect the right to be bad for a term end up with more debaters, and better ones. That means not posting novice rankings, pairing new speakers with patient seniors, and treating the first tournament as a field trip.' },
      { t: 'h', text: 'A note to the novice' },
      { t: 'p', text: 'If you are in your first ten rounds: keep the ballots. Write one sentence on each about what you would do differently. In a year those ten sentences will be the most useful coaching you ever received, and you will have written it yourself.' },
    ],
    inARound: [
      'After every loss, write one sentence: what would I change?',
      'Ask the judge for one thing to fix, not five.',
      'Fix that one thing in the next round and nothing else.',
    ],
    bio: 'Guest Author is a placeholder byline. Real essays carry the writer’s name, school and circuit.',
    note: 'This is sample text written to show how an essay page looks. Replace it with a real essay before launch.',
  },
}

/** Turn plain typed text into blocks: "## " starts a heading, "> " a pull quote, "- " a list item. */
export function toBlocks(text: string): Block[] {
  const out: Block[] = []
  for (const chunk of text.split(/\n\s*\n/)) {
    const c = chunk.trim()
    if (!c) continue
    if (c.startsWith('## ')) out.push({ t: 'h', text: c.slice(3) })
    else if (c.startsWith('> ')) out.push({ t: 'q', text: c.slice(2) })
    else if (c.split('\n').every((l) => l.trim().startsWith('- ')))
      out.push({ t: 'ul', items: c.split('\n').map((l) => l.trim().slice(2)) })
    else out.push({ t: 'p', text: c.replace(/\n/g, ' ') })
  }
  return out
}

export function wordCount(blocks: Block[]): number {
  const text = blocks.map((b) => (b.t === 'ul' ? b.items.join(' ') : b.text)).join(' ')
  return text.split(/\s+/).filter(Boolean).length
}
