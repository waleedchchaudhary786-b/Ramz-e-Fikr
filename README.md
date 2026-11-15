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

## Status

Done: design foundation, home page, and working inner pages: Articles (detailed reader with
contents, takeaways and pull quotes), Motions (calendar filter, random draw, coin toss, prep timer),
Resources, Glossary, The Floor (replies, editing, @tags), About and user guide, The Desk, Dashboard,
writing studio with owner review, and Ctrl+K search.

Everything a visitor does (likes, saves, replies, drafts, approvals) is stored in their own
browser for now (`src/services/store.ts`). Real accounts, database-enforced roles and moderation,
and the Supabase schema are the next phase.

Essay text lives in `src/data/articles.ts`; all of it is sample content.
