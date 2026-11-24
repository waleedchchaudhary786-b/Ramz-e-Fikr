/* Forum boards and SAMPLE threads for the local preview. In connected mode
   the threads come from the database and these samples are not shown. */

export type BoardId = 'prep' | 'tournaments' | 'urdu' | 'judging' | 'clubs' | 'lounge'
export type Board = { id: BoardId; name: string; urdu: string; blurb: string }

export const BOARDS: Board[] = [
  { id: 'prep', name: 'Motions & prep', urdu: 'تیاری', blurb: 'Stuck on a motion? Ask how others would build it.' },
  { id: 'tournaments', name: 'Tournaments', urdu: 'ٹورنامنٹ', blurb: 'Dates, partners wanted, results and round recaps.' },
  { id: 'urdu', name: 'Urdu debate', urdu: 'اردو مباحثہ', blurb: 'Vocabulary, style and everything about Urdu rounds.' },
  { id: 'judging', name: 'Judging', urdu: 'منصفی', blurb: 'Decisions you disagreed with, and how to judge well.' },
  { id: 'clubs', name: 'Clubs & coaching', urdu: 'کلب', blurb: 'Running a society, training novices, practice formats.' },
  { id: 'lounge', name: 'The lounge', urdu: 'بیٹھک', blurb: 'Anything else worth arguing about, kindly.' },
]
export const boardOf = (id: string) => BOARDS.find((b) => b.id === id) ?? BOARDS[0]

export type SeedTopic = {
  id: string
  board: BoardId
  title: string
  body: string
  author: string
  pinned?: boolean
  locked?: boolean
  daysAgo: number
}
export type SeedReply = { topic: string; author: string; text: string; daysAgo: number }

export const seedTopics: SeedTopic[] = [
  {
    id: 'f-welcome',
    board: 'lounge',
    title: 'Welcome to the forum: read this first',
    body: 'This is the place for longer conversations than the Floor allows. Start a thread on any board, reply to others, and tag people with @.\n\nThree house rules. Argue the point, not the person. Keep it in English or Urdu so everyone can moderate it. Report anything that crosses the line and an owner will look at it.\n\nThis is sample text for the preview.',
    author: 'Ramz Team',
    pinned: true,
    locked: true,
    daysAgo: 20,
  },
  {
    id: 'f-closing-ext',
    board: 'prep',
    title: 'How do you find an extension when opening takes everything?',
    body: 'Closing Government last weekend, motion on free public transport. Opening took cost, access and the environment in the first two speeches and we sat there with nothing. What do you actually do in that moment?',
    author: 'Hamza',
    daysAgo: 3,
  },
  {
    id: 'f-partner-wanted',
    board: 'tournaments',
    title: 'Looking for a partner for the December invitational',
    body: 'Second year, usually speak second, comfortable in both English and Urdu rounds. Based in Lahore. Reply or tag me if your partner has dropped out.',
    author: 'Areeba',
    daysAgo: 2,
  },
  {
    id: 'f-urdu-terms',
    board: 'urdu',
    title: 'What is your Urdu word for "mechanism"?',
    body: 'I keep switching to English in the middle of an Urdu speech because I do not have a word I like for mechanism. طریقۂ کار feels too clunky. What do you use?',
    author: 'Zoya',
    daysAgo: 5,
  },
  {
    id: 'f-judge-knowledge',
    board: 'judging',
    title: 'Should judges ignore an obviously false fact nobody challenged?',
    body: 'A speaker stated a statistic I knew to be wrong. The other side never challenged it. Do I credit it as if it were true, or do I discount it? Curious what other judges do.',
    author: 'Bilal',
    daysAgo: 6,
  },
  {
    id: 'f-novice-drills',
    board: 'clubs',
    title: 'Best twenty-minute drill for brand new novices?',
    body: 'Starting a society at our school with about fifteen students who have never debated. We get twenty minutes after school on Wednesdays. What would you do in the first session?',
    author: 'Mahnoor',
    daysAgo: 8,
  },
  {
    id: 'f-best-motion',
    board: 'lounge',
    title: 'Best motion you have ever debated?',
    body: 'Not the one you won, the one that made you think hardest. Mine was about whether museums should return colonial artefacts. I still change my mind about it.',
    author: 'Saad',
    daysAgo: 10,
  },
]

export const seedReplies: SeedReply[] = [
  { topic: 'f-closing-ext', author: 'Zoya', daysAgo: 3, text: 'Look for who they left out. On transport the obvious gap is women who avoid buses for safety reasons, which changes who rides and makes the network safer for everyone.' },
  { topic: 'f-closing-ext', author: 'Bilal', daysAgo: 2, text: 'Timeframe works too. Opening talks about the first year. Talk about what the city looks like in ten years when car habits have changed.' },
  { topic: 'f-closing-ext', author: 'Hamza', daysAgo: 2, text: 'Both of these are better than what we ran. Thank you. @Zoya the safety angle is going straight into my notes.' },
  { topic: 'f-partner-wanted', author: 'Saad', daysAgo: 1, text: 'My partner might be free, I will ask and tag you.' },
  { topic: 'f-urdu-terms', author: 'Saad', daysAgo: 4, text: 'I say "یہ کیسے ہوگا" and then explain. Shorter than any noun and the judge always follows.' },
  { topic: 'f-urdu-terms', author: 'Areeba', daysAgo: 4, text: 'عمل works for me if I have already said what the claim is.' },
  { topic: 'f-judge-knowledge', author: 'Mahnoor', daysAgo: 5, text: 'The usual guidance is to judge as an informed, reasonable listener. Obviously false is different from contested, so I would give it less weight but not invent a rebuttal.' },
  { topic: 'f-novice-drills', author: 'Areeba', daysAgo: 7, text: 'One-minute speeches on silly motions. This House would ban homework on Fridays. Nobody is scared and everyone speaks.' },
  { topic: 'f-novice-drills', author: 'Hamza', daysAgo: 7, text: 'Pair it with the motion analysis worksheet in Resources. Ten minutes each.' },
  { topic: 'f-best-motion', author: 'Bilal', daysAgo: 9, text: 'Whether exams should be abolished. Everyone in the room had a personal stake, which made it the most honest round I have seen.' },
]
