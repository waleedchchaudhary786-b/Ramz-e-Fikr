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

Done: design foundation, home page, and working inner pages (Articles and reader, Motions with
calendar filter, random draw and prep timer, Resources, Glossary, The Floor with replies,
About and user guide, The Desk, Dashboard, login note).

Likes, saves and Floor replies are stored in the visitor's own browser for now
(`src/services/store.ts`). Real accounts, database-enforced roles and moderation, the writing
studio and the Supabase schema are the next phases.
