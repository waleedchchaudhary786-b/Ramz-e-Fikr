# Ramz-e-Fikr (رمزِ فکر)

An open archive of debate resources. React 19, Vite, Tailwind v4, Motion.

## Run it on your computer

1. Install Node.js 20 or newer from https://nodejs.org
2. Open a terminal in this folder and run `npm install`
3. Run `npm run dev` and open the address it prints (usually http://localhost:5173)

`npm run build` makes the production site in `dist/`.

## Where things live

- `src/index.css`: colour and font tokens (the palette is frozen), paper grain, stamps, zones
- `src/utils/motion.tsx`: the single motion kit. Tune every animation here
- `src/components/Ticker.tsx`: the hold-to-speed-up ticker
- `src/components/Symbols.tsx`: the symbol set (☞ ❦ ⁂ § ¶ † ⟶ ف)
- `src/data/sample.ts`: SAMPLE content. Replace before launch
- `src/services/session.tsx`: preview sign-in (member, editor, owner) for local testing
- `src/tab/`: Ramz Tab, the tournament section. `engine.ts` (draw, judges, standings,
  ballot checks) is plain code with no screens; `ur.ts` holds all the Urdu

## Running a tournament with Ramz Tab

Ramz Tab lives at **Tournaments** in the menu. It runs British Parliamentary, Asian
Parliamentary, World Schools and two-team Urdu rounds, plus Model UN, in English or Urdu.

1. **Start the event** (editors and owners): Tournaments > Start an event. Five steps: name and
   dates, format and scores, rooms and motions, schools, then a check before creating.
2. **Registration**: in the console, People > Copy registration link, and send each school
   its own link. Schools add their teams (speakers by initials if they like) and judges.
   Add independent judges yourself, rate every judge 1 to 5, and add any conflicts.
3. **Each round**: Rounds > Generate the draw. Fix anything by tapping one team or judge, then
   another (or drag on a computer); clashes show in red. Release the draw, then release the
   motion, which starts the prep clock on every screen at once.
4. **Ballots**: send each judge their ballot link (Rounds shows them). Judges score on their
   phone; a ballot sent with no signal waits on the phone and sends itself later. You see
   which rooms are still waiting, and can enter or correct a ballot for a judge. When every
   room has a result, Confirm results.
5. **Results**: Results shows the team and speaker standings and the break. Publish results
   when you are ready, export CSV, or Print or save as PDF. Mark the event finished to add
   its motions to the Motions archive.
6. **Hall screen**: open Projector view on the hall computer and press Full screen.

Model UN events have committees instead of rounds: allocate countries to schools, then run
roll call, the speakers list and timer, and award scoring from the console.

Owners see totals across every event, with a CSV export, at Tournaments > Impact numbers.

Tests: `npx tsx scripts/engine-test.ts` runs simulated tournaments through the draw;
`node scripts/i18n-check.mjs` fails if any Ramz Tab text has no Urdu.

## Database

The site runs in local preview mode until you connect Supabase. Follow `SETUP.md`.
The tables and every permission rule are in `supabase/schema.sql`.

## Status

Done: all pages, the writing studio with owner review, search, prep and speech timers, the
motion draw, reporting and moderation, the forum, Ramz Tab (tournaments), and the Supabase
connection (email-code sign-in, shared replies, likes, saves, essays, notices).

Not yet in the database: motions, resources, glossary, the weekly prompt and the four sample
essays, which are still edited in `src/data/`. There is no admin screen for those yet.

To preview without the database, start the site with `VITE_SUPABASE_URL=off`.
