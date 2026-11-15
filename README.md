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

## Database

The site runs in local preview mode until you connect Supabase. Follow `SETUP.md`.
The tables and every permission rule are in `supabase/schema.sql`.

## Status

Done: all pages, the writing studio with owner review, search, and the Supabase connection
(email-code sign-in, shared replies, likes, saves, essays, notices, held-reply moderation).

Not yet in the database: motions, resources, glossary, the weekly prompt and the three sample
essays, which are still edited in `src/data/`. There is no admin screen for those yet.
