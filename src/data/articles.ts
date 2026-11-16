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
  /** the strongest objection to the essay, stated fairly */
  counter?: string
  /** glossary terms the essay leans on */
  terms?: string[]
  /** questions for a club to discuss after reading */
  questions?: string[]
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
      { t: 'h', text: 'A short example' },
      { t: 'p', text: 'Take a motion to cap private academy fees. An opposition speaker says, in a rush, that "the academies will just close". Taken as a sentence it is easy to mock: nobody shuts a profitable business overnight. Taken as an argument it is serious. What they are reaching for is that a cap set below cost pushes tuition into unregulated homes, where it is dearer and harder to inspect.' },
      { t: 'p', text: 'The weak reply says closures are unrealistic and moves on. The strong reply names the better version, then answers it: a cap tied to audited costs leaves a margin, so the incentive to go underground is small, and here is how the policy checks it. Only the second reply survives the next opposition speech.' },
      { t: 'h', text: 'The objection: there is no time' },
      { t: 'p', text: 'The honest objection is time. In a seven-minute speech with four arguments to answer, nobody can rebuild each one before knocking it down. True. So do it for the one argument the round will turn on, and deal with the rest quickly. Choosing which argument deserves that treatment is itself the skill, and it is also a kind of listening.' },
      { t: 'p', text: 'So flow generously. Write down what they meant. Then answer that, out loud, and say that you are doing so: "Even at its strongest, this argument needs X to be true, and here is why it is not." The room will hear the difference between a debater who was waiting to speak and one who was listening.' },
    ],
    counter: 'Charity can be overdone. If you rebuild every argument for the other side, you spend your speech making their case, and a judge may credit them with reasoning they never supplied. The answer is selectivity: steelman the one argument that decides the round, and say plainly that the improvement is yours.',
    terms: ['Rebuttal', 'Mechanism', 'Clash', 'Weighing'],
    questions: [
      'Think of your last loss. Which opposing argument did you answer as a sentence and not as an argument?',
      'Is it ever fair to win on an opponent\u2019s slip? Where is the line?',
      'How would you flow a speech so that the "what they meant" column is quick to fill in?',
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
      { t: 'h', text: 'What judges would need' },
      { t: 'p', text: 'None of this works without adjudicators who can score it. A sheet for such a round would need new rows: how well a speaker used shared references, how they handled the room, whether an interruption was turned to advantage. Judges would need a briefing with examples, and the first few panels should explain their decisions at length so that speakers can learn the standard.' },
      { t: 'p', text: 'There is also a fairness question. Students from Urdu-medium schools often arrive with exactly these skills and are told to unlearn them. A format that scores them would change who feels at home on the circuit.' },
      { t: 'h', text: 'The worry about rigour' },
      { t: 'p', text: 'The fair worry is that this trades analysis for performance. It does not have to. A munazara is nothing if not a contest of reasons. The question is whether our adjudication sheets can recognise persuasion that does not sound like a translated first proposition, and whether we are willing to train judges for it.' },
      { t: 'p', text: 'A modest first step would be a single trial round at one tournament, judged on a sheet written in Urdu from scratch. If it fails, we have lost an afternoon. If it works, we have a format that belongs to the language it is spoken in.' },
    ],
    counter: 'A shared format has a real benefit: a debater trained in Lahore can walk into a round anywhere and know the rules. Every local variation costs some of that portability, and tournaments already struggle to train enough judges for one format. The case for a new format has to show that the gain is worth a smaller, harder-to-staff circuit.',
    terms: ['Motion', 'Framing', 'Point of information', 'Whip'],
    questions: [
      'Which English debate terms do you use in Urdu rounds because no Urdu word comes to mind?',
      'Would audience response make rounds fairer or less fair? For whom?',
      'What would you put on an adjudication sheet written in Urdu from scratch?',
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
      { t: 'h', text: 'What a good first term looks like' },
      { t: 'p', text: 'A club that takes this seriously plans for it. Novices debate each other before they debate seniors. Feedback is limited to one thing to keep and one thing to change. Results from the first tournament are not announced at the next meeting. A senior sits with each new pair for the first three rounds, not to coach the speech, but to explain afterwards what the judge was looking for.' },
      { t: 'p', text: 'None of that lowers the standard. It moves the standard to where it belongs for a beginner: did you speak for the full time, did you make one argument a stranger could follow, did you come back next week.' },
      { t: 'h', text: 'A note to the novice' },
      { t: 'p', text: 'If you are in your first ten rounds: keep the ballots. Write one sentence on each about what you would do differently. In a year those ten sentences will be the most useful coaching you ever received, and you will have written it yourself.' },
    ],
    counter: 'Losing teaches only if someone helps you read the loss. Ten defeats with no feedback can teach a novice one thing, that they are bad at this, and they will leave. The essay\u2019s claim holds for clubs with patient seniors and time to debrief; without those, protecting early wins may keep more people in the room.',
    terms: ['Signposting', 'Burden', 'Extension'],
    questions: [
      'What did your own first ten rounds teach you that no workshop had?',
      'Does your club publish novice results? What would change if it stopped?',
      'How many losses in a row is too many, and what should a club do then?',
    ],
    inARound: [
      'After every loss, write one sentence: what would I change?',
      'Ask the judge for one thing to fix, not five.',
      'Fix that one thing in the next round and nothing else.',
    ],
    bio: 'Guest Author is a placeholder byline. Real essays carry the writer’s name, school and circuit.',
    note: 'This is sample text written to show how an essay page looks. Replace it with a real essay before launch.',
  },

  'evidence-is-not-an-argument': {
    brief: [
      'A statistic tells the room what is happening, not why.',
      'Judges credit the reasoning that connects a fact to your side.',
      'Use one fact per argument, and spend your time on the link.',
    ],
    blocks: [
      { t: 'p', text: 'Every tournament has a speaker who arrives with a folder. They have the report, the percentage, the year it was published. They read three numbers in the first minute, sit down certain they have won, and are baffled by the ballot. The numbers were true. They were also doing nothing.' },
      { t: 'h', text: 'What a fact can and cannot do' },
      { t: 'p', text: 'A fact establishes that something is the case. It does not say why it is the case, whether it will continue, or what follows from it for the motion. Those are the three things a judge needs, and all three are reasoning. A debater who supplies the number and leaves the reasoning out has handed the judge a brick and asked them to imagine the wall.' },
      { t: 'q', text: 'A debater who supplies the number and leaves the reasoning out has handed the judge a brick and asked them to imagine the wall.' },
      { t: 'h', text: 'The link is the argument' },
      { t: 'p', text: 'Suppose the motion is about free public transport, and you say that most low-income workers in the city spend a large share of their wages on commuting. Good. Now the work starts. Why does that share stay high? Because routes are fixed and wages are not. What changes if fares go to zero? The cheapest job a person can afford to accept moves further away. Why does that matter more than the cost to the budget? Because it compounds: a better job this year is a better wage every year after.' },
      { t: 'ul', items: [
        'The fact took one sentence.',
        'The link took four, and it is the part the other side must answer.',
        'If they only dispute your number, they have left your argument standing.',
      ] },
      { t: 'h', text: 'When you do not have the number' },
      { t: 'p', text: 'Most rounds give you fifteen minutes and no internet. That is not a handicap; it is the format telling you what it values. Say "many" where you cannot say "sixty per cent", and then earn the claim with a mechanism the room can check against its own experience. An honest "many" with a clear reason beats an invented statistic every time, and an invented statistic can lose you the round on its own if the other side knows the real one.' },
      { t: 'h', text: 'How to practise it' },
      { t: 'p', text: 'Take any fact from this week\u2019s news. Give yourself two minutes to write three different arguments that begin from it, for different motions. You will find that the fact barely changes and the reasoning changes completely. That is the skill, and it is the part of debating that no folder can do for you.' },
    ],
    counter: 'Some debates really are settled by evidence. If the motion turns on whether a policy worked where it was tried, the side that knows what happened should win, and elegant reasoning that ignores the record is just confident guessing. The essay is aimed at prepared-on-the-day formats; in researched formats, the balance shifts.',
    terms: ['Mechanism', 'Weighing', 'Burden', 'Framing'],
    questions: [
      'Recall a round where a statistic was decisive. Was it the number, or the explanation that came with it?',
      'How should a judge treat a number they suspect is invented?',
      'Is "many" ever dishonest?',
    ],
    inARound: [
      'Allow yourself one fact per argument.',
      'After stating it, say "and this matters because", then keep going for three sentences.',
      'If the other side attacks only the number, point that out to the judge.',
    ],
    bio: 'Guest Author is a placeholder byline. Real essays carry the writer\u2019s name, school and circuit.',
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
