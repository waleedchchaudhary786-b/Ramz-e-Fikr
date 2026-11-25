# Connecting Ramz-e-Fikr to its database

The site works without a database (local preview mode), but then likes, replies and
essays stay in each visitor's own browser. Follow these steps once to give the site real
accounts and shared data. It takes about 15 minutes and the free Supabase plan is enough.

You only ever copy two **public** values out of Supabase: the Project URL and the
"anon public" key. Never copy the `service_role` key anywhere.

## 1. Create the Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Name it `ramz-e-fikr`, choose a database password (save it
   somewhere safe; the site does not need it), and pick the region closest to Pakistan
   (Mumbai or Singapore).
3. Wait a minute or two for the project to finish setting up.

## 2. Create the tables, then set the three owners

1. In Supabase, open **SQL Editor**, click **New query**, paste in the whole of
   `supabase/schema.sql` and press **Run**. You should see "Success. No rows returned".
2. Copy `supabase/owners.example.sql` to `supabase/owners.sql`, replace the three example
   addresses with the real owner emails (the addresses they will sign in with), then paste
   that into a new query and **Run** it.

`owners.sql` is ignored by git, so the owner emails are never uploaded with the code.
Running either file again later is safe.

**Already set up before the forum existed?** Run `supabase/forum.sql` once in a new query.
It adds the forum's tables and rules and changes nothing else. (A new setup does not
need it, because the same block is inside `schema.sql`.) Until it is run, the Forum page
shows a short note asking an owner to do this, and the rest of the site works normally.

**Already set up before Ramz Tab (tournaments) existed?** Run `supabase/tab.sql` once in a
new query, after `forum.sql` if you have not run that yet. It adds the tournament tables,
the judge and school functions, and switches on live updates for them. It changes nothing
else and is safe to run again.

Then check live updates are on: in Supabase open **Database > Publications**, open
`supabase_realtime`, and make sure `tab_public` and `tab_events` are ticked. (The SQL does
this for you when that publication exists. If live updates are off, screens still refresh
every 20 seconds.)

## 3. Set up sign-in emails

1. In Supabase go to **Authentication > Emails** (Email Templates) and open the
   **Magic Link** template. Add this line so the email shows a code people can type:
   `Your sign-in code is: {{ .Token }}`
   Do the same in the **Confirm signup** template.
2. Go to **Authentication > URL Configuration**:
   - **Site URL**: the address of your site (for testing on your computer: `http://localhost:5173`)
   - **Redirect URLs**: add `http://localhost:5173/**` and, once the site is online, its real address followed by `/**`

Note: Supabase's built-in email sender is limited to a few emails an hour. That is fine
for testing. Before launch, add your own sender under **Authentication > SMTP Settings**
(a Gmail app password or a free Resend account both work).

## 4. Give the site the two public values

1. In Supabase go to **Project Settings > API** (or **Data API** / **API Keys**).
2. In this folder, make a copy of `.env.example` and name the copy `.env`.
3. Fill it in:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=the public key
   ```

   The public key is the one Supabase labels **Publishable key** (it starts with `sb_publishable_`)
   or, on older projects, **anon public**. Supabase's own "Connect" screen shows Next.js instructions
   with `NEXT_PUBLIC_...` names: ignore those files. This site only needs the two values above.

4. Stop the site if it is running (Ctrl+C in the terminal) and start it again with `npm run dev`.

The `.env` file is ignored by git on purpose, so it is never uploaded.

## 5. Test it

1. Open the site, click **Sign in**, enter an owner email, and type the code from the email.
2. "My Dashboard" should appear beside the logo, and the dashboard should say your role is Owner.
3. Post a reply on The Floor, then open the site in a different browser: the reply should be there.
4. Sign in with a non-owner email in the other browser, write an essay in the writing studio and
   send it. It should appear in the owner's dashboard under "essays awaiting review".

If something fails, a message appears at the top of the page saying why. The most common
causes are a typo in `.env` or step 2 not having been run.

## What the database enforces (not just the buttons)

- Visitors can read; only signed-in members can reply, like and save.
- People can edit or delete only their own replies. Edited replies are stamped.
- Only owners can approve or return essays, change roles, and see held replies.
- Replies containing a banned word are **held for owner review**, not deleted. Owners edit
  the word list in **Table Editor > banned_terms** (one lower-case word per row).
- `@Name` in a reply sends that person a notice on their dashboard.
- There can never be more than three owner emails.
- Forum: any member can start a thread. Only the writer can edit it; the writer or an owner
  can delete it, and its replies go with it. Editors and owners can pin and lock threads.
  Nobody else can reply to a locked thread. Threads with a banned word are held like
  replies. Writers get a notice when someone replies to their thread.
- Tournaments (Ramz Tab): editors and owners can start an event and become its director.
  Only an event's directors and the owners can see or change its private data (judge
  codes, school links, ratings, conflicts, drafts, ballots). The public only ever reads a
  cleaned copy. Two directors saving at once cannot overwrite each other.
- Judges have no accounts. Their private code lets them see only their own room and send
  only their own ballot, and the database checks every score, rank and tie before saving.
- Each school's private link edits only that school's teams and judges, and stops working
  once the first round is drawn. Directors can reissue any code or link if it leaks.

## Putting the site online (GitHub Pages)

1. Put this folder in a GitHub repository and push it to the `main` branch.
2. In the repository: **Settings > Secrets and variables > Actions > New repository secret**.
   Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same two values as your `.env`.
3. **Settings > Pages > Source**: choose **GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and publishes the site on every push.
5. Add the published address to Supabase's Site URL and Redirect URLs (step 3 above).

## Still stored in the code, not the database

Motions, resources, glossary terms, the three sample essays and the weekly prompt live in
`src/data/`. Reader essays, replies, likes, saves, roles and notices are in the database.
