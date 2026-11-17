/* Additional SAMPLE content: more essays, more resources, richer resource
   pages, motions, glossary terms and past prompts. Placeholder text written
   to show how the archive looks when it is full. Replace before launch. */

import type { Article, Motion, Resource, ResourceDetail, ResourceSection, Term } from './sample'
import type { ArticleDetail } from './articles'

const BIO = 'Guest Author is a placeholder byline. Real essays carry the writer’s name, school and circuit.'
const NOTE = 'This is sample text written to show how an essay page looks. Replace it with a real essay before launch.'

/* ======================= ESSAYS ======================= */

export const extraArticles: Article[] = [
  {
    slug: 'the-whip-is-a-judge',
    title: 'The whip speaks like a judge',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-11-15',
    ramz: 'A good whip speech is the adjudication you hope the panel will write, delivered before they write it.',
    excerpt: 'Whips are told to summarise. The best ones do something harder. They decide the debate out loud and dare the panel to disagree.',
    category: 'Craft',
    readMins: 6,
  },
  {
    slug: 'set-motions-at-home',
    title: 'Set the motion where the speakers live',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-11-09',
    ramz: 'A motion about your own city asks for judgement, and judgement is what we claim to be training.',
    excerpt: 'Our tournaments debate London congestion charges more confidently than Lahore’s buses. A case for motions set at home, and the objections worth taking seriously.',
    category: 'Circuit',
    readMins: 6,
  },
  {
    slug: 'speed-is-not-depth',
    title: 'Speaking faster does not make the argument longer',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-10-24',
    ramz: 'Every extra word per minute is borrowed from the judge’s attention, and the loan is called in at the decision.',
    excerpt: 'Speed feels like depth from the podium. From the panel it sounds like a list. On pace, pauses and the arithmetic of a seven-minute speech.',
    category: 'Craft',
    readMins: 5,
  },
  {
    slug: 'judge-a-round-this-term',
    title: 'Every debater should judge a round this term',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-10-18',
    ramz: 'You learn what persuades a judge fastest by being the one who has to decide.',
    excerpt: 'Most speakers have never filled in a ballot. Sitting on the other side of the table for one afternoon will change how you speak for a year.',
    category: 'Opinion',
    readMins: 5,
  },
  {
    slug: 'prep-is-a-conversation',
    title: 'Prep is a conversation, not two monologues',
    authorName: 'Guest Author',
    postedBy: 'Publication Team',
    date: '2026-10-11',
    ramz: 'Two partners writing separately in silence have prepared two speeches, not one case.',
    excerpt: 'The fifteen minutes before a round are the only time a team can argue with itself. Most teams spend them writing quietly side by side.',
    category: 'Craft',
    readMins: 5,
  },
]

export const extraArticleDetails: Record<string, ArticleDetail> = {
  'the-whip-is-a-judge': {
    brief: [
      'A summary repeats the debate. A whip speech decides it.',
      'Organise by the two or three clashes that matter, not by speaker.',
      'Tell the panel how to weigh, then show your bench winning on that weighing.',
    ],
    blocks: [
      { t: 'p', text: 'Ask a novice whip what the job is and they will say that the whip summarises. Then they stand up and do exactly that, walking through the round speaker by speaker, in order, as if reading the minutes of a meeting. It is accurate and it rarely wins, because the panel already sat through the meeting.' },
      { t: 'p', text: 'The whip has a stranger and more powerful job. By the time they speak, every argument in the round has been made. Nothing new can be added. What remains is the question the judges are about to discuss in private, which is who won the debate and why. The whip is the only speaker who gets to answer that question out loud before the panel does.' },
      { t: 'h', text: 'Speaker by speaker is the judge’s nightmare' },
      { t: 'p', text: 'When a panel leaves the room they do not discuss the round in speaking order. They name the points of disagreement, decide who won each, and then decide which of those mattered most. A whip who organises by speaker forces the judge to do that sorting alone, and judges sorting alone tend to sort in favour of whoever they already preferred.' },
      { t: 'p', text: 'A whip who organises by clash does the sorting for them. The speech becomes a draft of the adjudication. If it is a fair draft, the panel will find it easier to agree with than to rewrite.' },
      { t: 'q', text: 'If it is a fair draft, the panel will find it easier to agree with than to rewrite.' },
      { t: 'h', text: 'Three moves, in order' },
      { t: 'ul', items: [
        'Name the clashes. Two is usually right, three at most. Use the words both benches used so the judge recognises them.',
        'For each clash, say what the other side needed to prove, show that they did not, and show what your bench proved instead.',
        'Weigh the clashes against each other. Even if they win the smaller one, your win on the larger one decides the round.',
      ] },
      { t: 'p', text: 'Notice that the third move is the one most whips skip. They win two clashes on paper and assume the judge will add them up. Judges do not add. They rank. The whip who ranks the clashes for them is the whip whose ranking they are most likely to use.' },
      { t: 'h', text: 'Fairness is a tactic' },
      { t: 'p', text: 'The strongest whip speeches concede things. They admit that the other side won a point, then explain why it does not matter enough. That concession buys credibility for everything that follows. A whip who claims to have won every exchange sounds like a partisan, and the judge stops listening as a judge and starts listening as a sceptic.' },
      { t: 'p', text: 'There is a test worth running in your notes before you stand. Could you give this speech as the chair of the panel, explaining the decision to both teams? If the answer is yes, it is probably a good whip speech. If you would be embarrassed to say it to the losing side’s face, the panel will hear the spin.' },
      { t: 'h', text: 'What the whip should not do' },
      { t: 'p', text: 'New arguments are out, and so are new examples that do the work of new arguments. Less obviously, so is rebuilding your partner’s case at length. If an argument needed rebuilding, say in one line why it still stands and move to the weighing. The time belongs to the clash, not to repair.' },
    ],
    counter: 'Judges are trained to resist being told what to think, and a whip who sounds too much like an adjudicator can come across as presumptuous. Some panels also prefer a whip who answers the other bench line by line, because it shows engagement. The answer is tone. Frame the decision as an argument, not a verdict, and keep enough direct response that nobody can say you ignored the last speech.',
    terms: ['Whip', 'Clash', 'Weighing', 'Extension'],
    questions: [
      'Watch a whip speech from your last tournament. Was it organised by speaker or by clash?',
      'What is the most a whip should concede to the other side?',
      'Should a whip ever be allowed to introduce a new example? Where is the line between example and argument?',
    ],
    inARound: [
      'During the round, keep a separate sheet with one heading per clash.',
      'Before you stand, rank the clashes and decide which one you can lose and still win.',
      'Open with one sentence that names the clashes, so the judge can follow your structure.',
    ],
    bio: BIO,
    note: NOTE,
  },

  'set-motions-at-home': {
    brief: [
      'Our motions travel well and land nowhere in particular.',
      'Local motions reward judgement over borrowed facts.',
      'They need fairer briefings, not fewer local topics.',
    ],
    blocks: [
      { t: 'p', text: 'Look at the motion packs from a season of tournaments in Pakistan and count how many are set here. The number is lower than you would expect. We debate congestion charging in London, gun laws in the United States and housing in Scandinavia with confidence, and then fall silent when someone suggests a motion about the Orange Line or canal water.' },
      { t: 'p', text: 'There are reasons for this, and some are good. International motions are portable. A team that has practised them can compete abroad. They also feel neutral, because nobody in the room has a cousin who works for the policy. But there is a cost to never setting a debate at home, and it is paid in the one skill we claim to be teaching.' },
      { t: 'h', text: 'What a local motion asks for' },
      { t: 'p', text: 'A motion about a city you have never visited is mostly a test of what you have read. You reach for the examples the articles used, because you have nothing else. A motion about your own city is a test of judgement. You know how the buses actually run and who rides them. You have to decide which of the things you know matter, and that is harder and more useful than recalling what someone else decided.' },
      { t: 'q', text: 'A motion about your own city is a test of judgement, not of reading.' },
      { t: 'p', text: 'Local motions also change who is good at debating. Students who have not travelled, or who went to schools without libraries full of foreign magazines, suddenly have as much material as anyone. Their observation of a ration queue or a factory gate is evidence. That is not lowering the bar. It is moving it to a place where more people can reach it honestly.' },
      { t: 'h', text: 'The objections worth taking seriously' },
      { t: 'ul', items: [
        'Bias: a judge from Lahore may know the topic better than a team from Quetta. Briefings help, and so does setting motions from every province over a season.',
        'Sensitivity: some local topics are hard to debate safely. That is a reason to choose carefully, not a reason to choose nothing.',
        'Portability: teams heading abroad need international practice. Keep some international motions; nobody is asking for none.',
      ] },
      { t: 'h', text: 'A practical proposal' },
      { t: 'p', text: 'Every tournament could commit to one round in five being set in Pakistan, with a short neutral briefing in the motion release. The briefing would give the background a team from another city might lack, so that the debate is about judgement and not about who happened to live nearby. Clubs could do the same in their weekly sessions at no cost at all.' },
      { t: 'p', text: 'If we want debaters who can think clearly about the place they live, the least we can do is let them practise on it.' },
    ],
    counter: 'Local motions risk turning debates into contests of personal anecdote, where the team with the most vivid story from home beats the team with the better argument. They can also put students in the awkward position of arguing against their own families’ livelihoods or politics. Portable motions give everyone the same distance from the topic, and some would say that distance is exactly what makes debating fair.',
    terms: ['Motion', 'Framing', 'Burden'],
    questions: [
      'How many motions at your last tournament were set in Pakistan?',
      'Is personal experience evidence in a debate? When does it stop counting?',
      'Which local topic would you most like to debate, and which would you avoid?',
    ],
    inARound: [
      'On a local motion, use what you have seen, then explain why it is typical and not just yours.',
      'Ask yourself what a team from another province would need to know, and say it briefly.',
      'Treat anecdote as an example of a mechanism, never as the mechanism itself.',
    ],
    bio: BIO,
    note: NOTE,
  },

  'speed-is-not-depth': {
    brief: [
      'A judge can only credit what they could write down.',
      'Pace should vary with importance, not stay high throughout.',
      'Pausing after your key line is the cheapest emphasis there is.',
    ],
    blocks: [
      { t: 'p', text: 'There is a moment in most novices’ first year when they discover speed. They have too much to say and seven minutes to say it, so they say it faster. It feels like a solution. The speech now fits. Unfortunately it no longer lands, and the ballot that comes back says something vague about clarity.' },
      { t: 'h', text: 'The arithmetic of attention' },
      { t: 'p', text: 'A judge is not a recording device. They are a person with a pen, trying to write down the shape of your argument while you are still making it. When you speak faster, you do not give them more argument. You give them more words to choose between, and they choose the ones they managed to catch. The mechanism you rushed through in the middle of a sentence is usually the first thing to go.' },
      { t: 'p', text: 'So the real question is not how much you can say but how much the judge can record. That number is lower than most speakers think, and it does not rise because you are excited.' },
      { t: 'q', text: 'You do not give the judge more argument. You give them more words to choose between.' },
      { t: 'h', text: 'Pace is a tool, not a setting' },
      { t: 'p', text: 'The speakers who sound most persuasive are rarely the slowest. They change speed on purpose. Background and signposting can go quickly, because the judge does not need to write them down. The claim, the key step in the mechanism and the weighing go slowly, because those are what the decision will rest on. The contrast itself tells the judge where to look.' },
      { t: 'ul', items: [
        'Fast: context, transitions, examples the room already knows.',
        'Slow: the one sentence each argument depends on.',
        'Stop: after the line you most want quoted in the adjudication.',
      ] },
      { t: 'h', text: 'The pause' },
      { t: 'p', text: 'A two-second pause after your most important sentence costs you about five words. In return, the judge finishes writing, looks up, and is ready for what comes next. It is the cheapest emphasis available, and most speakers never use it because silence at the podium feels like failure. It is not. It is the room catching up with you.' },
      { t: 'h', text: 'If you really have too much to say' },
      { t: 'p', text: 'Then you have too much material, and the answer is to cut it in prep, not to compress it at the podium. Two arguments explained fully beat four arguments listed. If your partner wants to keep a fourth point, give it ten seconds and call it what it is, a backup.' },
    ],
    counter: 'In some circuits and formats, judges are trained to flow fast speech, and coverage really does matter. A speaker who slows down there may simply drop arguments the other side then claims went unanswered. The advice in this essay fits our circuits as they are now. Speakers who compete abroad should learn what the local panel can follow and adjust.',
    terms: ['Signposting', 'Mechanism', 'Weighing'],
    questions: [
      'Record yourself speaking for two minutes. Where did you speed up, and was that where the important part was?',
      'How can a team decide which argument to drop when the case is too long?',
      'Is it ever right to speak fast on purpose?',
    ],
    inARound: [
      'Underline one sentence per argument in your notes. Slow down for those.',
      'Pause after your framing and after your weighing. Count two in your head.',
      'If your partner signals "slow", drop an example, not a mechanism.',
    ],
    bio: BIO,
    note: NOTE,
  },

  'judge-a-round-this-term': {
    brief: [
      'Most debaters have never had to make a decision on a close round.',
      'Judging shows you what a panel can and cannot hear.',
      'Clubs should make one judged round a term part of training.',
    ],
    blocks: [
      { t: 'p', text: 'Speakers spend years arguing about decisions and very little time making them. We complain that a panel missed our best argument, then sit down in the next round and speak in exactly the way that made it easy to miss. It is hard to see your own speech from the outside. Judging one round is the quickest way to try.' },
      { t: 'h', text: 'What you notice from the chair' },
      { t: 'p', text: 'The first thing most new judges say afterwards is how tiring it was. Following four teams for an hour, trying to keep track of which argument answered which, is real work. The second thing they say is how much of what was said never reached their notes. A speaker who rushed, who used three different names for the same argument, or who never said which clash mattered, simply vanished from the decision.' },
      { t: 'p', text: 'The third thing, and the most useful, is that close rounds really are close. When you have to choose between two good teams and justify the choice to them, you start to understand why the reasons you are given as a speaker sometimes feel thin. Often the panel was weighing the same thing you were, and came down the other way by a small margin.' },
      { t: 'q', text: 'Close rounds really are close, and you only believe it once you have had to decide one.' },
      { t: 'h', text: 'How a club could do this' },
      { t: 'ul', items: [
        'Once a term, every senior judges one practice round between novices, with an experienced chair on the panel.',
        'The trainee gives the oral adjudication, and the chair gives feedback on the adjudication itself.',
        'Afterwards, the trainee writes one sentence about something they will change in their own speaking.',
      ] },
      { t: 'p', text: 'This costs an afternoon and makes the club’s judging pool deeper, which every tournament organiser will thank you for. It also gives novices more feedback, from people closer to their own level who remember what it was like.' },
      { t: 'h', text: 'Judging makes you kinder' },
      { t: 'p', text: 'There is a softer benefit too. Debaters who have judged are less likely to argue with a decision and more likely to ask the useful question, which is what one thing would have changed it. They have been on the other side of that conversation, and they know how much easier it is to answer a good question than a grievance.' },
    ],
    counter: 'Inexperienced judges make inexperienced decisions, and novices on the receiving end deserve a fair hearing. A club that asks seniors to judge before they are ready may teach the seniors and shortchange the novices. The fix is to pair every trainee with a chair who can overrule them, and to tell the teams which judge is learning.',
    terms: ['Clash', 'Weighing', 'Burden'],
    questions: [
      'Have you ever judged a round? What surprised you most?',
      'What should a trainee judge do if they disagree with the chair?',
      'How much should a novice be told about how a decision was reached?',
    ],
    inARound: [
      'Before you speak, ask: if I were judging, where would I need this argument to be clear?',
      'Name your clashes in the same words your opponents used, so the judge can match them.',
      'After the round, ask the judge what one thing would have changed the result.',
    ],
    bio: BIO,
    note: NOTE,
  },

  'prep-is-a-conversation': {
    brief: [
      'Silent parallel prep produces two speeches that do not fit together.',
      'Spend the first five minutes talking, not writing.',
      'Agree the names of your arguments before anyone drafts a word.',
    ],
    blocks: [
      { t: 'p', text: 'Watch a room of teams in prep and you will see two habits. Some pairs talk the whole time and write almost nothing. Most pairs split the motion, sit side by side and write in silence. The second habit feels efficient. It usually produces a first speaker who promises one thing and a second speaker who delivers another.' },
      { t: 'h', text: 'Why silence fails' },
      { t: 'p', text: 'When partners prepare separately, each builds a private picture of the debate. Those pictures overlap, but never exactly. One partner thinks the round is about fairness and the other thinks it is about cost. One calls an argument "access" and the other calls it "affordability". On paper this looks like a small difference. In the round, the judge hears two teams wearing the same badge.' },
      { t: 'q', text: 'Two partners writing separately in silence have prepared two speeches, not one case.' },
      { t: 'h', text: 'What talking does' },
      { t: 'p', text: 'Five minutes of argument between partners at the start of prep does three things that silent writing cannot. It tests the case, because your partner will ask the question the other side is going to ask. It fixes the vocabulary, because you have to agree what to call things in order to discuss them. And it divides the work by argument rather than by speaker, which is how the judge will remember it.' },
      { t: 'ul', items: [
        'Minute one: each partner says, in one sentence, what they think the debate is about.',
        'Minutes two to four: argue until those two sentences are the same sentence.',
        'Minute five: name your two arguments and write the names at the top of both sheets.',
      ] },
      { t: 'h', text: 'Then write' },
      { t: 'p', text: 'After that, separate writing is fine. In fact it is necessary, because two people cannot write one speech in ten minutes. But they are now writing parts of the same case, with the same names and the same order. The last two minutes should be a quick read-back: each partner says their structure aloud while the other listens for anything that contradicts their own.' },
      { t: 'h', text: 'When you disagree' },
      { t: 'p', text: 'Sometimes partners disagree about the case and the clock is running. Agree a rule before tournament day. A common one is that the first speaker decides the framing and the second decides the extension. It does not matter much which rule you choose, as long as you do not spend minute twelve still arguing.' },
    ],
    counter: 'Talking takes time, and some teams genuinely work better apart, especially when one partner is much more experienced and already knows the shape of the case. For those teams, a quick check at the end may be enough. The essay’s method is most useful for new partnerships and for motions neither partner has seen before.',
    terms: ['Framing', 'Burden', 'Signposting', 'Extension'],
    questions: [
      'How does your team usually spend the first five minutes of prep?',
      'What rule should partners use when they disagree with the clock running?',
      'Have you ever lost a round because you and your partner named the same argument differently?',
    ],
    inARound: [
      'Start prep by each saying what the debate is about in one sentence.',
      'Write the agreed names of your arguments at the top of both sheets.',
      'Finish with a sixty-second read-back of each speech’s structure.',
    ],
    bio: BIO,
    note: NOTE,
  },
}

/* ======================= RESOURCES ======================= */

export const extraResources: Resource[] = [
  { slug: 'speaker-roles', title: 'Every speaker role, explained', kind: 'Guide', summary: 'What each of the eight positions in a British Parliamentary round must do, and how they are judged.', date: '2026-11-14' },
  { slug: 'extensions-guide', title: 'Closing half: finding an extension', kind: 'Guide', summary: 'Five places to look for new material when the opening teams have taken the obvious arguments.', date: '2026-11-06' },
  { slug: 'models-and-definitions', title: 'Models, definitions and counter-props', kind: 'Lecture notes', summary: 'How to set up a debate fairly, what to do when the other side does not, and when to run your own policy.', date: '2026-10-30' },
  { slug: 'motion-analysis-drills', title: 'Motion analysis in five minutes', kind: 'Worksheet', summary: 'A stakeholder map, a burden box and a "why now" line. Fill it in on any motion, any day.', date: '2026-10-24' },
  { slug: 'student-unions-casefile', title: 'Casefile: student unions', kind: 'Casefile', summary: 'The history, both benches and the clashes on restoring student unions in Pakistan.', date: '2026-10-16' },
  { slug: 'medium-of-instruction-casefile', title: 'Casefile: medium of instruction', kind: 'Casefile', summary: 'Urdu, English and regional languages in schools. The arguments and the evidence each side reaches for.', date: '2026-10-08' },
  { slug: 'tech-ai-casefile', title: 'Casefile: technology and AI', kind: 'Casefile', summary: 'The recurring frames for tech motions, from classrooms to the courts.', date: '2026-09-30' },
  { slug: 'urdu-speaking-toolkit', title: 'Speaking in Urdu rounds', kind: 'Guide', summary: 'Debate vocabulary, signposting phrases and how to use a couplet as a premise without losing the judge.', date: '2026-09-22' },
  { slug: 'first-time-judging', title: 'Judging your first round', kind: 'Lecture notes', summary: 'How to take notes, reach a decision and give feedback that helps.', date: '2026-09-15' },
]

export const extraResourceDetails: Record<string, ResourceDetail> = {
  'speaker-roles': {
    level: 'Novice',
    time: '20 minutes to read',
    useWhen: 'You have been drawn in a position you have never spoken in before.',
    intro: 'A British Parliamentary round has four teams and eight speakers, and every one of them has a different job. Most speakers know their own role and only half know the others. That is a problem, because you are judged partly on whether you did your job, and partly on how well you handled everyone else doing theirs. This guide goes through each position in speaking order.',
    keyIdeas: [
      { term: 'Bench', text: 'The two teams on the same side of the motion, Government or Opposition.' },
      { term: 'Half', text: 'Opening half (first two teams) or closing half (last two). Closing teams must add new material.' },
      { term: 'Role fulfilment', text: 'Whether a speaker did what their position requires. It is not scored separately, but a missed role weakens everything else.' },
    ],
    sections: [
      { heading: 'Opening Government', body: 'The first team sets up the debate. If the setup is unclear, every other team suffers and the judge will notice who caused it.', points: ['Prime Minister defines the motion, sets out the model if there is one, and makes the first constructive arguments.', 'Deputy Prime Minister answers the Leader of the Opposition, then adds or deepens arguments.', 'Both speakers should make the case simple enough that the closing team can build on it.'] },
      { heading: 'Opening Opposition', body: 'The first opposition team decides what the opposing bench stands for. Their choice shapes the whole debate.', points: ['Leader of the Opposition responds to the definition and model, then sets out the opposition case.', 'Say early whether you accept the model or are running a counter-proposal.', 'Deputy Leader rebuilds after the Deputy Prime Minister and adds substance.'] },
      { heading: 'Closing Government', body: 'The third team must agree with the opening government and still be different from it.', points: ['Member of Government gives an extension, a new argument or a new depth the opening team did not reach.', 'Make the extension clearly yours. Name it and say why it matters more.', 'Government Whip summarises the debate from the government side, by clash, with no new arguments.'] },
      { heading: 'Closing Opposition', body: 'The last team has the most information and the least time. Use both.', points: ['Member of Opposition extends the opposition case and answers the closing government’s extension.', 'Opposition Whip gives the final speech of the round and should weigh the whole debate.', 'Closing Opposition often wins on the weighing alone. Prepare for it from the start.'] },
    ],
    drills: [
      { name: 'Role swap', time: '15 minutes', steps: ['Take a motion and prepare it as Opening Government.', 'Swap papers with your partner and prepare the same motion as Closing Opposition.', 'Compare. What did the second role need that the first one did not?'] },
      { name: 'Ninety-second role pitch', time: '10 minutes', steps: ['Partner draws a role at random.', 'You have thirty seconds to plan and ninety seconds to explain what that speaker must do on a given motion.', 'Switch and repeat until each of you has done all eight.'] },
    ],
    checklist: ['I know whether I am opening or closing.', 'I know who I must answer directly.', 'If closing, I can name my extension in one sentence.', 'If whip, I have a sheet organised by clash, not by speaker.'],
    mistakes: ['Opening Government running too many arguments and leaving nothing clean to extend.', 'Closing teams repeating their opening team with more enthusiasm.', 'Whips introducing new arguments in the last minute.'],
    related: ['article:the-whip-is-a-judge', 'resource:extensions-guide', 'resource:models-and-definitions'],
  },

  'extensions-guide': {
    level: 'Intermediate',
    time: '15 minutes of prep',
    useWhen: 'You are in the closing half and the opening team will almost certainly take the arguments you thought of first.',
    intro: 'The closing half of a round lives or dies by its extension, the new material that makes the team worth listening to. Most closing teams look for a new argument and panic when they cannot find one. But an extension does not have to be a new argument. It can be a new actor, a new timescale, a new mechanism for an old claim, or a new way of weighing the debate. This guide gives you five places to look.',
    keyIdeas: [
      { term: 'Extension', text: 'Material that moves the debate forward from where your opening team left it.' },
      { term: 'Knifing', text: 'Contradicting your own opening team. Judges penalise it heavily.' },
      { term: 'Shelf life', text: 'How long your extension will stay relevant once the opposing closing team responds.' },
    ],
    sections: [
      { heading: 'Five places to look', body: 'Write one line in each box during prep. You need one good extension, not five weak ones.', points: ['A new stakeholder: who has the opening team ignored?', 'A new timescale: what happens in ten years that does not happen in one?', 'A new mechanism: why does the opening team’s claim really happen?', 'A new comparison: what is the real alternative to the motion?', 'A new principle: what right or duty sits underneath the practical arguments?'] },
      { heading: 'Protect it in prep', body: 'Assume the opening team will steal your first idea. Prepare a second, and only decide between them after you hear the opening speeches.', points: ['Rank your two best extensions before the round starts.', 'Listen for which one the opening team does not reach.', 'Rewrite the one you keep in your own words, so it sounds fresh.'] },
      { heading: 'Make it obviously yours', body: 'A judge who cannot tell where the opening team ended and you began will not credit the difference.', points: ['Say "our extension is" out loud.', 'Give it a name the judge can write down.', 'Explain why it matters more than anything the opening team said.'] },
      { heading: 'Make it last', points: ['The closing team on the other side will attack it. Prepare the answer.', 'Your whip should weigh it as the most important part of the round.', 'If it is still standing at the end, it is usually enough.'] },
    ],
    example: { title: 'Worked example: free public transport', lines: ['Opening Government argued that free fares help low-income workers commute.', 'Extension chosen: a new stakeholder. Women who avoid buses because of cost and safety now gain a reason to use them, which makes the buses themselves safer.', 'Why it is new: the opening team spoke about cost; this is about who uses the network and what that changes.', 'Why it lasts: it does not depend on the fare level, so the opposition cannot answer it by proposing cheaper tickets.'] },
    phrases: ['"Our extension takes this debate somewhere neither opening team went."', '"Even if you accept everything our opening said, there is a group they left out."', '"This is the part of the debate that still matters in ten years."'],
    checklist: ['My extension has a name.', 'It does not contradict my opening team.', 'I can say why it matters more than the opening material.', 'My whip knows to weigh it.'],
    mistakes: ['Repeating the opening team with more examples and calling it an extension.', 'An extension so narrow that it can be dismissed in one line.', 'Not telling the judge where the extension starts.'],
    related: ['resource:speaker-roles', 'resource:weighing-worksheet', 'article:the-whip-is-a-judge'],
  },

  'models-and-definitions': {
    level: 'Intermediate',
    time: '15 minutes to read',
    useWhen: 'You are opening the round, or the opening team has set up the debate in a way you think is unfair.',
    intro: 'Before anyone argues about whether a policy is good, someone has to say what the policy is. That is the job of the definition and, where there is one, the model. A clear model makes for a fair debate. A vague one lets everybody argue about different things. These notes cover how to set up well, how to respond to a bad setup, and when an opposition team should run its own alternative.',
    keyIdeas: [
      { term: 'Definition', text: 'The meaning given to the words in the motion that might be unclear.' },
      { term: 'Model', text: 'The specific policy the government proposes: who does what, when, and how it is enforced.' },
      { term: 'Counter-proposal', text: 'An alternative policy run by the opposition. It must be genuinely different from the government’s model.' },
      { term: 'Squirrel', text: 'A definition that twists the motion into something easier for one side. Judges punish it.' },
    ],
    sections: [
      { heading: 'Setting up as Prime Minister', body: 'A good model is short. If it takes more than a minute, it is probably too detailed or trying to dodge something.', points: ['Define only the words that could reasonably be read two ways.', 'Say who carries out the policy, who it applies to, and when it starts.', 'Include one line on enforcement or funding if the other side will obviously ask.', 'Do not define the debate into something the opposition cannot contest.'] },
      { heading: 'Responding as Leader of the Opposition', body: 'You have three choices, and you should say which one you are making in the first minute.', points: ['Accept the model and argue against it. This is the default and usually the best choice.', 'Accept the model but challenge one detail that matters, explaining why.', 'Challenge the definition only if it is unreasonable. Explain what a fair reading would be, then debate it anyway.'] },
      { heading: 'When to run a counter-proposal', body: 'A counter-proposal changes the debate from "this policy or nothing" to "this policy or ours". It is powerful and risky.', points: ['Only run one if doing nothing is genuinely hard to defend.', 'It must be mutually exclusive with the government’s model. If both could happen, it is not a counter.', 'Keep it as short and clear as the government’s model.', 'Remember that you now have a burden too: you must defend your policy.'] },
      { heading: 'For closing teams', points: ['You are bound by the model your opening team set. You may clarify it, never change it.', 'If the model is weak, extend in a way that does not depend on the weak part.'] },
    ],
    example: { title: 'Worked example: capping academy fees', lines: ['Definition: "private tuition academies" means commercial after-school coaching centres, not schools.', 'Model: the provincial education department sets a fee ceiling by grade, reviewed each year against audited costs.', 'Enforcement: registration required to operate. Fines for charging above the cap.', 'Opposition choice: accept the model, contest whether audits can be trusted.'] },
    phrases: ['"To be clear about what we are debating..."', '"We accept the model, and we will show that even on its own terms it fails."', '"This definition is unreasonable because it excludes the obvious case. We will debate the fair reading."'],
    mistakes: ['Models with so many conditions that nobody can find the real policy.', 'Opposition teams that spend four minutes on the definition and lose the debate.', 'Counter-proposals that could happen alongside the government policy.'],
    related: ['resource:speaker-roles', 'resource:first-principles-casebuilding', 'resource:motion-analysis-drills'],
  },

  'motion-analysis-drills': {
    level: 'Any level',
    time: '5 minutes per motion',
    useWhen: 'You want to practise without a full round, or you are coaching a group and have only half an hour.',
    intro: 'The first five minutes of prep decide what kind of case you will build. This worksheet turns those minutes into a habit. Fill in the four boxes for any motion, then compare with a partner. Repeat it on three motions a week and you will notice that your prep gets calmer and your cases get tighter.',
    sections: [
      { heading: 'Box one: who is affected?', body: 'List at least four groups. The obvious ones first, then the ones that take a second thought.', points: ['Who gains directly if the motion passes?', 'Who loses directly?', 'Who is affected indirectly, a year or more later?', 'Who decides, and what do they want?'] },
      { heading: 'Box two: what must each side prove?', body: 'Write one line for Proposition and one for Opposition. If the lines are not opposites, rewrite them.', points: ['Proposition must show that...', 'Opposition must show that...', 'Is there a reasonable middle ground either side will try to occupy?'] },
      { heading: 'Box three: why now?', body: 'Motions are usually set because something has changed. Name it.', points: ['What has happened recently that makes this a live question?', 'What happens if nobody acts?'] },
      { heading: 'Box four: the likely clash', points: ['Write the one question the round will turn on.', 'Write which side you would rather be, and why. Then argue the other side for a minute.'] },
    ],
    drills: [
      { name: 'Three motions, fifteen minutes', time: '15 minutes', steps: ['Pick three motions from the archive at random.', 'Five minutes on each, all four boxes.', 'Compare with a partner and argue about box two.'] },
      { name: 'The missing stakeholder', time: '10 minutes', steps: ['One partner fills in box one.', 'The other must add one group they missed.', 'Build a thirty-second argument around that group.'] },
      { name: 'Clash in one line', time: '5 minutes', steps: ['Read a motion aloud.', 'Each person writes the clash in a single sentence without talking.', 'Read them out. If they differ, discuss which is right.'] },
    ],
    checklist: ['I listed at least four stakeholders.', 'My two burdens are opposites.', 'I can say why this motion is being debated now.', 'I have written the clash as one question.'],
    mistakes: ['Listing only the obvious stakeholders.', 'Writing burdens that both sides could agree with.', 'Skipping "why now" because it seems obvious.'],
    related: ['resource:first-principles-casebuilding', 'article:prep-is-a-conversation', 'resource:models-and-definitions'],
  },

  'student-unions-casefile': {
    level: 'Novice',
    time: '20 minutes to read',
    useWhen: 'A motion about campus politics, student rights, youth participation or education governance.',
    intro: 'Student unions come up regularly in Pakistani motion packs because the question is unresolved and personal to everyone in the room. This casefile gives you the background, the arguments each bench tends to run and the clashes that decide the round. Treat dates and legal status as things to check before quoting. The debate rarely depends on them; it depends on mechanisms.',
    keyIdeas: [
      { term: 'Union', text: 'An elected body that represents students to the university administration and organises on their behalf.' },
      { term: 'Restoration', text: 'Bringing back elected unions on campuses where they have been absent for decades.' },
      { term: 'Proxy wing', text: 'A student group linked to a national political party. Much of the debate is about their role.' },
    ],
    sections: [
      { heading: 'Background you need', body: 'Student unions were banned by martial law orders in February 1984 under General Zia-ul-Haq. They were briefly revived in 1989, but a Supreme Court ruling in 1993 ended that before elections could be held. In February 2022 the Sindh Assembly unanimously passed a law to restore them, the first province to do so, though students questioned whether it would be implemented. In early 2026 the Sindh High Court dismissed a petition seeking restoration. [1][2][3][4][5]', points: ['Campus politics did not stop with the ban. Party-linked student groups continued, without elected structures.', 'Supporters point to unions as a training ground for national leaders in earlier decades. [1]', 'Opponents point to campus violence linked to student politics, before and after the ban. [3]', 'The Sindh law pairs restoration with a ban on weapons and hate speech on campus, which is a model either bench can use. [2]'] },
      { heading: 'What Proposition benches usually run', points: ['Voice: students have no formal way to influence fees, hostels, harassment policy or curriculum.', 'Accountability: elections replace unelected, party-linked groups with representatives who can be voted out.', 'Training: unions teach organising, negotiation and public speaking to people outside elite schools.', 'Rights: freedom of association should not stop at the university gate.'] },
      { heading: 'What Opposition benches usually run', points: ['Capture: national parties will dominate union elections, bringing their conflicts onto campus.', 'Safety: contested elections can escalate into violence where enforcement is weak.', 'Distraction: campus politics competes with study in an already struggling system.', 'Alternatives: student councils, ombudspersons and surveys can provide voice with less risk.'] },
      { heading: 'Clashes that keep coming up', points: ['Does banning formal unions reduce campus conflict, or just remove accountability from it?', 'Who protects students now, and is it working?', 'Can rules on elections, finance and party links make unions safer than the current informal system?'] },
    ],
    example: { title: 'A framing line you can borrow', lines: ['"The choice is not between campus politics and no campus politics. It is between politics with elections and politics without them."'] },
    phrases: ['"The status quo is not neutral. Someone already holds power on campus; the question is whether students chose them."', '"Restoration without safeguards repeats the past. With them, it is a different policy."'],
    mistakes: ['Asserting the exact legal position in a province without being sure.', 'Treating every student group as violent, or none of them.', 'Forgetting to compare with what students have now.'],
    related: ['resource:pk-economy-casefile', 'resource:weighing-worksheet', 'article:set-motions-at-home'],
  },

  'medium-of-instruction-casefile': {
    level: 'Intermediate',
    time: '20 minutes to read',
    useWhen: 'Any motion on the language of schooling, national curriculum, regional languages or English-medium education.',
    intro: 'Language-in-education motions are among the most common and most emotional on our circuit. Everyone in the room was schooled in some language and has a view on it. This casefile separates the questions that usually get blurred together, gives each bench its strongest material and warns you about the claims that are easiest to get wrong.',
    keyIdeas: [
      { term: 'Medium of instruction', text: 'The language subjects are taught in, which is different from the languages taught as subjects.' },
      { term: 'Mother tongue', text: 'The language a child speaks at home. In much of Pakistan that is neither Urdu nor English.' },
      { term: 'Transition', text: 'Moving from one medium to another at a set grade. Many proposals hinge on when that happens.' },
    ],
    sections: [
      { heading: 'Separate the questions first', body: 'Most bad debates on this topic argue about three things at once. Decide which one your motion is about.', points: ['Which language should early primary teaching be in?', 'Which language should exams and higher education use?', 'Should every school follow the same rule, or can private and public schools differ?'] },
      { heading: 'Arguments for mother tongue or regional languages in early years', points: ['Comprehension: children learn to read and reason faster in a language they already speak. UNESCO has encouraged mother-tongue instruction since 1953. [3]', 'Inclusion: children whose home language is not the school language are more likely to fail early grades or drop out. In the 2023 census only about 9% of Pakistanis gave Urdu as their mother tongue, and about 37% gave Punjabi. [1][2][4]', 'Identity: regional languages and literatures survive when they are used in school.', 'A strong early foundation can make learning a second language easier, not harder.'] },
      { heading: 'Arguments for Urdu or English throughout', points: ['Mobility: English is the language of higher education, much professional work and international opportunity.', 'Cohesion: a shared national language helps students move between provinces.', 'Practicality: textbooks, exams and trained teachers exist in Urdu and English already.', 'Parents’ choice: many families pay for English-medium schools because they see it as the way up.', 'Mixed evidence: some mother-tongue policies, for example in Kenya and Ethiopia, have shown mixed results on later literacy in the second language. [5]'] },
      { heading: 'Clashes that decide rounds', points: ['Early comprehension against later mobility: can a transition at the right grade give both?', 'Who pays for teachers and materials in regional languages?', 'Does a single rule for all schools help equality, or does it push wealthier families further into private schooling?', 'Pakistani schools already teaching in home languages first, then moving to official languages, give you a local example. [6]'] },
    ],
    example: { title: 'A weighing line you can borrow', lines: ['"A child who does not understand the language of the classroom does not learn English or physics. They learn to copy. Fix comprehension first and the rest becomes possible."'] },
    phrases: ['"This is a debate about when, not whether, children learn English."', '"The real comparison is not the ideal English-medium school. It is the classroom most children actually sit in."'],
    mistakes: ['Assuming all English-medium schools teach good English.', 'Ignoring the cost and availability of teachers in regional languages.', 'Citing international studies without explaining why they apply here.'],
    related: ['article:urdu-debate-is-not-a-translation', 'resource:urdu-speaking-toolkit', 'resource:student-unions-casefile'],
  },

  'tech-ai-casefile': {
    level: 'Any level',
    time: '20 minutes to read',
    useWhen: 'Any motion involving artificial intelligence, social media, surveillance or digital services.',
    intro: 'Technology motions change their examples every year and keep their structure. Whether the motion is about AI tutors, facial recognition or social media for teenagers, the same few frames do most of the work. Learn the frames and you can prepare any tech motion in fifteen minutes, without needing to know the latest product names.',
    keyIdeas: [
      { term: 'Displacement', text: 'What the technology replaces. Most tech debates turn on whether that thing was better.' },
      { term: 'Access gap', text: 'Who can use the technology and who is left behind, often by connectivity, cost or language.' },
      { term: 'Accountability', text: 'Who is responsible when an automated system gets it wrong.' },
    ],
    sections: [
      { heading: 'Frame one: compared to what?', body: 'Tech debates are almost never "technology against perfection". They are "technology against what people actually have now". Win this comparison and you usually win the round.', points: ['An AI tutor compared to an overcrowded classroom, not to a brilliant private teacher.', 'Facial recognition compared to existing police practice, not to a world without policing.', 'Ask what the realistic alternative is for the people most affected.'] },
      { heading: 'Frame two: who gets it first?', points: ['New technology usually reaches wealthy, urban, English-speaking users first.', 'Policies that assume universal access can widen the gap they claim to close.', 'Ask whether the motion helps those at the bottom or only those already ahead.'] },
      { heading: 'Frame three: who answers for mistakes?', body: 'UNESCO\u2019s 2023 guidance on generative AI in education warns about risks to equity and inclusion, calls for data privacy protection and suggests an age limit for use. Either bench can cite it. [1]', points: ['Automated decisions can be wrong at scale and hard to appeal.', 'Ask whether there is a human who can be held responsible.', 'Consider whether errors fall more heavily on some groups than others.'] },
      { heading: 'Frame four: what is hard to undo?', points: ['Data, once collected, is hard to delete.', 'Habits and dependencies form quickly and fade slowly.', 'Reversibility is often the best weighing tool on tech motions.'] },
    ],
    drills: [
      { name: 'Frame rotation', time: '12 minutes', steps: ['Pick any tech motion.', 'Three minutes per frame, one argument per frame.', 'Choose the strongest and explain why in one sentence.'] },
    ],
    phrases: ['"The other side is comparing this technology to an ideal world. We are comparing it to the one we live in."', '"The question is not whether it works on average. It is who it fails, and whether they can appeal."'],
    mistakes: ['Relying on the latest product name instead of the mechanism.', 'Assuming everyone has a smartphone and a stable connection.', 'Treating technology as purely good or purely sinister.'],
    related: ['resource:weighing-worksheet', 'article:evidence-is-not-an-argument', 'resource:motion-analysis-drills'],
  },

  'urdu-speaking-toolkit': {
    level: 'Any level',
    time: '15 minutes to read',
    useWhen: 'You have a bilingual or Urdu round coming up and keep reaching for English words mid-speech.',
    intro: 'Many debaters think in Urdu and prepare in English, which makes Urdu rounds harder than they should be. The fix is not a better vocabulary list on the day. It is deciding your key words before the round, practising signposts until they are automatic, and learning when a couplet helps your argument and when it decorates it. This toolkit covers all three.',
    keyIdeas: [
      { term: 'دعویٰ (claim)', text: 'What you are asserting. Say it plainly before you explain it.' },
      { term: 'دلیل (reasoning)', text: 'Why the claim is true. This is the mechanism, and the part judges credit.' },
      { term: 'نتیجہ (conclusion)', text: 'What follows for the motion. Never leave it for the judge to infer.' },
    ],
    sections: [
      { heading: 'Signposts you should know by heart', body: 'These phrases tell the judge where you are. Practise them until you stop thinking about them.', points: ['میرا پہلا نکتہ یہ ہے کہ... (My first point is that...)', 'اب میں فریقِ مخالف کی دلیل کی طرف آتا ہوں (Now I turn to the other side’s argument)', 'یہ اس لیے اہم ہے کیونکہ... (This matters because...)', 'اگر ہم ان کی بات مان بھی لیں، تب بھی... (Even if we accept their point...)'] },
      { heading: 'Prepare your key terms before the round', body: 'Mid-speech translation is where most Urdu speeches lose their thread.', points: ['Write the three or four technical terms the motion needs, in Urdu, before prep starts.', 'Agree them with your partner so you both use the same word.', 'If no good Urdu term exists, choose one English word and use it consistently.'] },
      { heading: 'Using a couplet as a premise', body: 'A well-chosen couplet can establish a shared value faster than a paragraph. A badly chosen one wastes thirty seconds.', points: ['Use it to state something the room already believes, then argue from it.', 'Explain in one sentence what it means for this motion.', 'One per speech is plenty. Two starts to sound like performance.', 'If you cannot explain why it is relevant, leave it out.'] },
      { heading: 'Register', points: ['Formal enough to sound prepared, plain enough to be followed.', 'Avoid heavy Persianised vocabulary the judge has to decode.', 'Speak to the room, not over it.'] },
    ],
    drills: [
      { name: 'Signpost sprint', time: '5 minutes', steps: ['Partner calls out a signpost type: first point, rebuttal, weighing, conclusion.', 'You say the Urdu phrase immediately and one sentence of content.', 'Go until you do not hesitate on any of them.'] },
      { name: 'Couplet test', time: '10 minutes', steps: ['Pick a motion and a couplet you know well.', 'Explain in thirty seconds how it supports one side.', 'Partner explains how it could support the other. Decide if it is still worth using.'] },
    ],
    phrases: ['"فریقِ مخالف یہ ثابت نہیں کر سکا کہ..." (The other side has failed to prove that...)', '"اصل سوال یہ ہے کہ..." (The real question is...)'],
    mistakes: ['Switching to English for every technical word.', 'Quoting poetry without explaining its relevance.', 'Speaking in a register too formal for the room to follow.'],
    related: ['article:urdu-debate-is-not-a-translation', 'resource:medium-of-instruction-casefile', 'resource:first-principles-casebuilding'],
  },

  'first-time-judging': {
    level: 'Novice',
    time: '15 minutes to read',
    useWhen: 'You have been asked to judge a round and have never done it before.',
    intro: 'Your first round as a judge will feel harder than your first round as a speaker. You have to follow four teams, decide a ranking and then explain it to people who are hoping you got it wrong. These notes cover how to take notes, how to reach a decision and how to deliver feedback that people can use.',
    keyIdeas: [
      { term: 'Flow', text: 'Notes laid out so you can see which argument answered which.' },
      { term: 'Oral adjudication', text: 'The spoken explanation of the decision given to the teams after the round.' },
      { term: 'Chair', text: 'The judge who leads the panel’s discussion and usually gives the oral adjudication.' },
    ],
    sections: [
      { heading: 'During the round', body: 'Your job is to record what was said, not what you think should have been said.', points: ['Divide your page into columns, one per bench, and draw arrows when one argument answers another.', 'Write the names speakers give their arguments.', 'Mark anything that was asserted without a reason.', 'Do not fill in missing steps from your own knowledge.'] },
      { heading: 'Reaching a decision', body: 'Do not start by asking who was the best speaker. Start with the clashes.', points: ['List the two or three points the round turned on.', 'Decide who won each, using only what was said.', 'Decide which clash mattered most.', 'Rank the teams, then check the ranking against your notes once more.'] },
      { heading: 'Giving feedback', body: 'Teams remember about one thing from an oral adjudication. Make sure it is useful.', points: ['Start with the result, then the main reason.', 'Go through the clashes, not through the speeches.', 'Give each team one thing to keep and one to change.', 'Keep it under ten minutes for the whole room.'] },
      { heading: 'When you are not sure', points: ['Say what made it close. Teams find that more useful than false certainty.', 'If you are on a panel, disagreeing with the chair is part of the job. Explain your reasoning calmly.'] },
    ],
    checklist: ['I have a column for every bench.', 'I can name the main clashes.', 'I decided each clash on what was said.', 'I have one keep and one change for every team.'],
    mistakes: ['Deciding on style before substance.', 'Crediting arguments a team should have made but did not.', 'Feedback that lists every flaw and fixes none.'],
    related: ['article:judge-a-round-this-term', 'resource:adjudication-notes', 'resource:weighing-worksheet'],
  },
}

/* Richer pages for the original six resources: extra sections and panels. */
export const resourceAdditions: Record<string, Partial<ResourceDetail> & { moreSections?: ResourceSection[] }> = {
  'first-principles-casebuilding': {
    keyIdeas: [
      { term: 'Burden', text: 'What your side must prove to win. Write it before anything else.' },
      { term: 'Mechanism', text: 'The step-by-step reason your claim is true. Most weak arguments are missing this.' },
      { term: 'Impact', text: 'Who is better or worse off, and by how much. Judges compare impacts, not claims.' },
    ],
    moreSections: [
      { heading: 'After the round starts', body: 'Your case will be attacked. Know in advance which parts you can give up.', points: ['Mark one argument as the one you will defend to the end.', 'Know which example you can drop if it is challenged.', 'Keep thirty seconds of each speech for responding to what you did not expect.'] },
    ],
    drills: [
      { name: 'Two-argument sprint', time: '10 minutes', steps: ['Draw a motion at random from the archive.', 'Set a timer for five minutes and build two arguments, claim, mechanism and impact only.', 'Swap with a partner and try to break the mechanism in one sentence.'] },
      { name: 'Example hunt', time: '5 minutes', steps: ['Take an argument you have already written.', 'Find an example from a different city or country.', 'Ask a partner whether a stranger would believe it.'] },
    ],
    phrases: ['"Our burden in this debate is simple..."', '"Here is why that happens, step by step."', '"This matters because the people affected are..."'],
    checklist: ['I can state our burden in one sentence.', 'Each argument has a claim, mechanism and impact.', 'I have one example a stranger would believe.', 'We have prepared one answer to their best case.'],
    related: ['resource:motion-analysis-drills', 'article:prep-is-a-conversation', 'resource:weighing-worksheet'],
  },
  'weighing-worksheet': {
    keyIdeas: [
      { term: 'Scale', text: 'How many people are affected, and how severely.' },
      { term: 'Likelihood', text: 'How confident we can be that the impact actually happens.' },
      { term: 'Reversibility', text: 'Whether the harm or benefit can be undone later.' },
      { term: 'Timeframe', text: 'Whether the impact happens soon or far in the future.' },
    ],
    moreSections: [
      { heading: 'Weighing in each role', points: ['Opening teams weigh their arguments against the obvious objections.', 'Closing teams weigh their extension against the opening material.', 'Whips weigh the clashes against each other. That is most of the speech.'] },
    ],
    drills: [
      { name: 'Two impacts, one minute', time: '10 minutes', steps: ['Partner writes two opposing impacts on a motion.', 'You have one minute to weigh them using one row only.', 'Partner weighs back using a different row. Repeat.'] },
    ],
    phrases: ['"Even if they are right about this, our impact matters more because..."', '"Their harm can be fixed later. Ours cannot."', '"Prefer our side on this clash because it affects more people, more surely."'],
    checklist: ['I filled in both columns honestly.', 'I chose one row to argue.', 'I said what the judge should conclude.'],
    related: ['resource:extensions-guide', 'article:the-whip-is-a-judge', 'resource:tech-ai-casefile'],
  },
  'pk-economy-casefile': {
    keyIdeas: [
      { term: 'Conditionality', text: 'The policy changes a government agrees to make in return for a loan.' },
      { term: 'Stabilisation', text: 'Stopping an immediate crisis, such as running out of foreign currency.' },
      { term: 'Structural reform', text: 'Longer-term changes to taxes, subsidies or state firms meant to prevent the next crisis.' },
    ],
    moreSections: [
      { heading: 'Stakeholders to remember', points: ['Low-income households who feel price rises on fuel and electricity first.', 'Exporters and importers affected by the exchange rate.', 'Salaried taxpayers, often the easiest group to tax more.', 'Future governments who inherit the debt and the reforms.'] },
    ],
    phrases: ['"The alternative to a programme is not freedom. It is a different, harsher kind of adjustment."', '"The question is not whether reform hurts. It is who it hurts, and whether that can be changed."'],
    checklist: ['I know what conditionality means.', 'I can name who bears the cost.', 'I can say what happens without a programme.'],
    related: ['resource:weighing-worksheet', 'resource:student-unions-casefile', 'article:evidence-is-not-an-argument'],
  },
  'poi-drills': {
    keyIdeas: [
      { term: 'Protected time', text: 'The first and last minute of a speech, when points of information may not be offered.' },
      { term: 'Barracking', text: 'Offering points so often that it becomes a distraction. Judges notice.' },
    ],
    moreSections: [
      { heading: 'What makes a POI work', points: ['It exposes a contradiction between two things the speaker has said.', 'It asks for the mechanism the speaker skipped.', 'It names an example the speaker cannot explain away.'] },
    ],
    drills: [
      { name: 'Contradiction hunt', time: '10 minutes', steps: ['Partner gives a two-minute speech with one hidden contradiction.', 'You offer a POI the moment you hear it.', 'Swap and repeat.'] },
    ],
    phrases: ['"On that point: how does that square with what your partner said?"', '"Thank you, I’ll take one." (and then return to the signpost)', '"Not at the moment, thank you."'],
    checklist: ['I offered at least two POIs.', 'Each was under fifteen words.', 'I took two and answered in two sentences.'],
    related: ['resource:speaker-roles', 'article:rebuttal-is-listening', 'resource:first-time-judging'],
  },
  'adjudication-notes': {
    keyIdeas: [
      { term: 'Ordinary intelligent voter', text: 'The imagined listener judges try to be: informed, reasonable, not a specialist.' },
      { term: 'Panel', text: 'Usually a chair and wings who discuss the round and reach a decision together.' },
    ],
    moreSections: [
      { heading: 'Asking for feedback', body: 'The best question after a loss is specific.', points: ['"Which clash did you think decided it?"', '"What would we have needed to say to win that clash?"', '"Was there a point where you stopped following us?"'] },
    ],
    phrases: ['"The key question in this debate is..."', '"Even on their best case, this clash goes to us because..."'],
    related: ['resource:first-time-judging', 'article:judge-a-round-this-term', 'article:the-whip-is-a-judge'],
  },
  'smog-casefile': {
    keyIdeas: [
      { term: 'AQI', text: 'Air Quality Index. A scale that turns pollutant levels into categories from good to hazardous.' },
      { term: 'Temperature inversion', text: 'Warm air above cold air near the ground, which traps pollution in winter.' },
      { term: 'Stubble burning', text: 'Burning crop residue after harvest to clear fields quickly.' },
    ],
    moreSections: [
      { heading: 'Stakeholders to remember', points: ['Children and elderly people, most affected by poor air.', 'Small farmers who burn residue because alternatives cost money and time.', 'Kiln and factory workers whose wages stop during shutdowns.', 'Outdoor workers who cannot stay indoors on the worst days.'] },
    ],
    drills: [
      { name: 'Who pays?', time: '10 minutes', steps: ['Pick one policy option from the list above.', 'Name who bears the cost and who gains.', 'Argue for thirty seconds that the cost is fair, then thirty seconds that it is not.'] },
    ],
    phrases: ['"Smog is not one problem. It is four sources and one weather pattern."', '"A ban without enforcement moves the problem. It does not solve it."'],
    checklist: ['I can name the main sources without inventing shares.', 'I know who pays for each policy option.', 'I have considered enforcement.'],
    related: ['resource:tech-ai-casefile', 'resource:weighing-worksheet', 'article:set-motions-at-home'],
  },
}

/* ======================= MOTIONS, TERMS, PROMPTS ======================= */

export const extraMotions: Motion[] = [
  { slug: 'compulsory-voting', text: 'This House would make voting compulsory in general elections', format: 'BP', theme: 'Politics', date: '2026-09-28' },
  { slug: 'social-media-age', text: 'This House would ban social media accounts for under-sixteens', format: 'WSDC', theme: 'Technology', date: '2026-09-24' },
  { slug: 'heritage-tourism', text: 'This House would let private firms run heritage sites in the Walled City', format: 'AP', theme: 'Cities', date: '2026-09-19' },
  { slug: 'remittance-tax', text: 'This House would tax incoming remittances to fund public hospitals', format: 'BP', theme: 'Economy', date: '2026-09-15' },
  { slug: 'mushaira-format', text: 'یہ ایوان مباحثے کو مشاعرے کے انداز میں منعقد کرنے کی حمایت کرتا ہے', format: 'Bilingual', theme: 'Language', date: '2026-09-10' },
  { slug: 'four-day-week', text: 'This House would move public offices to a four-day working week', format: 'WSDC', theme: 'Society', date: '2026-09-05' },
]

export const extraTerms: Term[] = [
  { term: 'Counter-proposal', urdu: 'متبادل تجویز', meaning: 'An alternative policy run by the opposition. It must be genuinely incompatible with the government’s.' },
  { term: 'Knifing', urdu: 'اپنوں سے اختلاف', meaning: 'When a closing team contradicts its own opening team. Heavily penalised.' },
  { term: 'Model', urdu: 'خاکہ', meaning: 'The specific policy the government proposes: who does what, when, and how it is enforced.' },
  { term: 'Stakeholder', urdu: 'متاثرہ فریق', meaning: 'Any group affected by the motion. Good cases name the ones others forget.' },
  { term: 'Steelman', urdu: 'مضبوط ترین صورت', meaning: 'Restating an opposing argument in its strongest form before answering it.' },
  { term: 'Flow', urdu: 'نوٹس کا نقشہ', meaning: 'Notes laid out so you can see which argument answered which.' },
]

export const extraPrompts = [
  { week: 'Week of 19 October 2026', text: 'Should judges be allowed to use their own knowledge to fill in a missing step?' },
  { week: 'Week of 12 October 2026', text: 'Is it ever right to concede an argument in your own speech?' },
]
