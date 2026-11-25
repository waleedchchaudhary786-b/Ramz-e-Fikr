-- =====================================================================
-- Ramz-e-Fikr database. Paste this whole file into the Supabase SQL
-- Editor and press Run. It is safe to run again: nothing is duplicated
-- and no data is deleted.
--
-- AFTER THIS: run supabase/owners.example.sql with the three real owner
-- emails filled in (keep your filled-in copy out of GitHub).
-- =====================================================================

-- ---------- tables ----------

-- Who the three owners are. Clients can never read or change this table.
create table if not exists public.owner_emails (
  email text primary key
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  role text not null default 'member' check (role in ('member', 'editor', 'owner')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  author_name text not null default '',          -- credited author; may differ from the poster
  posted_by uuid not null references public.profiles (id) on delete cascade,
  ramz_line text not null default '' check (char_length(ramz_line) <= 140),
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'rejected')),
  review_note text,                              -- shown to the author when an essay is returned
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  thread text not null,                          -- 'prompt' or 'article-<slug>'
  author uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  stance text check (stance in ('For', 'Against', 'Unsure')),
  flagged boolean not null default false,        -- held for owner review
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists comments_thread_idx on public.comments (thread, created_at);

create table if not exists public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_key text not null,                        -- e.g. 'article:rebuttal-is-listening'
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,                            -- 'mention' | 'decision'
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_prompts (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,               -- the Monday the prompt goes up
  prompt text not null,
  created_by uuid references public.profiles (id) on delete set null
);

create table if not exists public.banned_terms (
  term text primary key                          -- lower case, one word
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  reporter uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- helpers ----------

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'owner' from public.profiles where id = auth.uid()), false)
$$;

-- Does this text contain a banned word? Handles capitals, simple
-- number-for-letter swaps (st0pid) and spaced-out letters (s t u p i d).
-- Whole words only, so ordinary words that contain a banned word are fine.
create or replace function public.contains_banned(txt text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  t text := translate(lower(coalesce(txt, '')), '013457@$!', 'oieastasi');
  joined text;
begin
  -- join single letters that were spaced or dotted apart
  joined := regexp_replace(t, '\m(\w)[\s.\-_*]+(?=\w\M)', '\1', 'g');
  return exists (
    select 1 from public.banned_terms b
    where b.term = any (regexp_split_to_array(t, '[^[:alnum:]' || U&'\0600-\06FF' || ']+'))
       or b.term = any (regexp_split_to_array(joined, '[^[:alnum:]' || U&'\0600-\06FF' || ']+'))
  );
end $$;

-- ---------- triggers ----------

-- A new sign-up gets a profile. Emails listed in owner_emails become owners.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  wanted text := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
  base text := coalesce(wanted, split_part(new.email, '@', 1));
begin
  if char_length(base) < 2 or public.contains_banned(base) then
    base := 'Reader ' || substr(new.id::text, 1, 4);
  end if;
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    left(base, 40),
    case when exists (select 1 from public.owner_emails o where lower(o.email) = lower(new.email))
         then 'owner' else 'member' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only owners can change anyone's role. Display names are language-checked.
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_owner() then
    raise exception 'Only an owner can change roles.';
  end if;
  if new.display_name is distinct from old.display_name and public.contains_banned(new.display_name) then
    raise exception 'That display name is not allowed.';
  end if;
  return new;
end $$;

drop trigger if exists guard_profile on public.profiles;
create trigger guard_profile before update on public.profiles
  for each row execute function public.guard_profile();

-- Never more than three owner emails.
create or replace function public.guard_owner_count() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from public.owner_emails where email = new.email)
     and (select count(*) from public.owner_emails) >= 3 then
    raise exception 'There can be at most three owners. Remove one first.';
  end if;
  return new;
end $$;

drop trigger if exists guard_owner_count on public.owner_emails;
create trigger guard_owner_count before insert on public.owner_emails
  for each row execute function public.guard_owner_count();

-- Comments: language check, edited label, and nobody but an owner can un-flag.
-- Replies (comments) are guarded in the FORUM section below, which also
-- checks forum threads.

-- @Name tagging is set up in the FORUM section below.


-- Essays: only owners approve or return; authors hear about the decision.
create or replace function public.guard_article() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    if new.status in ('approved', 'rejected') and auth.uid() is not null and not public.is_owner() then
      new.status := 'pending';
    end if;
    return new;
  end if;
  new.posted_by := old.posted_by;
  if new.status is distinct from old.status then
    if new.status in ('approved', 'rejected') and auth.uid() is not null and not public.is_owner() then
      raise exception 'Only an owner can approve or return an essay.';
    end if;
    if new.status = 'approved' then new.published_at := coalesce(old.published_at, now()); end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_article on public.articles;
create trigger guard_article before insert or update on public.articles
  for each row execute function public.guard_article();

create or replace function public.notify_decision() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    insert into public.notifications (user_id, kind, body, link)
    values (
      new.posted_by, 'decision',
      case when new.status = 'approved'
           then 'Your essay "' || new.title || '" was published.'
           else 'Your essay "' || new.title || '" was returned: ' || coalesce(new.review_note, 'see the note in the studio.') end,
      '/write'
    );
  end if;
  return new;
end $$;

drop trigger if exists notify_decision on public.articles;
create trigger notify_decision after update on public.articles
  for each row execute function public.notify_decision();

-- ---------- row level security: the real permission rules ----------

alter table public.owner_emails   enable row level security;
alter table public.profiles       enable row level security;
alter table public.articles       enable row level security;
alter table public.comments       enable row level security;
alter table public.likes          enable row level security;
alter table public.bookmarks      enable row level security;
alter table public.notifications  enable row level security;
alter table public.weekly_prompts enable row level security;
alter table public.banned_terms   enable row level security;
alter table public.reports        enable row level security;

-- owner_emails: no policies at all, so no visitor or member can touch it.

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_owner())
  with check (id = auth.uid() or public.is_owner());

-- articles: everyone reads approved; authors see their own; owners see all
drop policy if exists articles_read on public.articles;
create policy articles_read on public.articles for select
  using (status = 'approved' or posted_by = auth.uid() or public.is_owner());
drop policy if exists articles_insert on public.articles;
create policy articles_insert on public.articles for insert to authenticated
  with check (posted_by = auth.uid());
drop policy if exists articles_update on public.articles;
create policy articles_update on public.articles for update to authenticated
  using (public.is_owner() or (posted_by = auth.uid() and status in ('draft', 'pending', 'rejected')))
  with check (public.is_owner() or (posted_by = auth.uid() and status in ('draft', 'pending')));
drop policy if exists articles_delete on public.articles;
create policy articles_delete on public.articles for delete to authenticated
  using (public.is_owner() or (posted_by = auth.uid() and status <> 'approved'));

-- comments: flagged ones are visible only to their author and to owners
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select
  using (not flagged or author = auth.uid() or public.is_owner());
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author = auth.uid());
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update to authenticated
  using (author = auth.uid() or public.is_owner())
  with check (author = auth.uid() or public.is_owner());
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete to authenticated
  using (author = auth.uid() or public.is_owner());

drop policy if exists likes_read on public.likes;
create policy likes_read on public.likes for select using (true);
drop policy if exists likes_write on public.likes;
create policy likes_write on public.likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists likes_delete on public.likes;
create policy likes_delete on public.likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists bookmarks_read on public.bookmarks;
create policy bookmarks_read on public.bookmarks for select to authenticated using (user_id = auth.uid());
drop policy if exists bookmarks_write on public.bookmarks;
create policy bookmarks_write on public.bookmarks for insert to authenticated with check (user_id = auth.uid());
drop policy if exists bookmarks_delete on public.bookmarks;
create policy bookmarks_delete on public.bookmarks for delete to authenticated using (user_id = auth.uid());

drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists prompts_read on public.weekly_prompts;
create policy prompts_read on public.weekly_prompts for select using (true);
drop policy if exists prompts_write on public.weekly_prompts;
create policy prompts_write on public.weekly_prompts for all to authenticated
  using (public.my_role() in ('editor', 'owner'))
  with check (public.my_role() in ('editor', 'owner'));

drop policy if exists banned_owner on public.banned_terms;
create policy banned_owner on public.banned_terms for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert to authenticated with check (reporter = auth.uid());
drop policy if exists reports_read on public.reports;
create policy reports_read on public.reports for select to authenticated using (public.is_owner());

drop policy if exists reports_delete on public.reports;
create policy reports_delete on public.reports for delete to authenticated using (public.is_owner());
create unique index if not exists reports_once on public.reports (comment_id, reporter);

-- ===================== FORUM =====================
-- Member-started threads, grouped into boards. Replies to a thread are
-- ordinary comments whose thread is 'forum-<thread id>', so the language
-- check, editing, reporting and @tagging all work the same as on the Floor.
-- This block is also inside schema.sql. On a database that already ran
-- schema.sql before the forum existed, run this file once on its own.
-- Safe to run more than once.

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  board text not null check (board in ('prep', 'tournaments', 'urdu', 'judging', 'clubs', 'lounge')),
  title text not null check (char_length(title) between 4 and 140),
  body text not null check (char_length(body) between 1 and 4000),
  author uuid not null references public.profiles (id) on delete cascade,
  pinned boolean not null default false,          -- editors and owners only
  locked boolean not null default false,          -- editors and owners only
  flagged boolean not null default false,         -- held by the language check
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists forum_topics_board_idx on public.forum_topics (board, created_at desc);

create table if not exists public.topic_reports (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics (id) on delete cascade,
  reporter uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '' check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);
create unique index if not exists topic_reports_once on public.topic_reports (topic_id, reporter);

-- editors and owners
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('editor', 'owner') from public.profiles where id = auth.uid()), false)
$$;

-- Threads: the database decides who wrote it, when, and whether it is held.
-- Only editors and owners can pin or lock. An editor can pin or lock someone
-- else's thread but cannot change its words; only an owner can do that.
create or replace function public.guard_topic() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.flagged := public.contains_banned(new.title || ' ' || new.body);
    new.created_at := now();
    new.edited_at := null;
    if auth.uid() is not null and not public.is_staff() then
      new.pinned := false;
      new.locked := false;
    end if;
    return new;
  end if;
  new.author := old.author;
  new.created_at := old.created_at;
  if auth.uid() is not null and not public.is_staff() then
    new.pinned := old.pinned;
    new.locked := old.locked;
    if old.locked and (new.title is distinct from old.title or new.body is distinct from old.body) then
      raise exception 'This thread is locked.';
    end if;
  end if;
  if auth.uid() is not null and new.author <> auth.uid() and not public.is_owner() then
    new.title := old.title;
    new.body := old.body;
  end if;
  if new.title is distinct from old.title or new.body is distinct from old.body then
    new.edited_at := now();
    new.flagged := public.contains_banned(new.title || ' ' || new.body);
  elsif new.flagged is distinct from old.flagged and auth.uid() is not null and not public.is_owner() then
    new.flagged := old.flagged;
  end if;
  return new;
end $$;

drop trigger if exists guard_topic on public.forum_topics;
create trigger guard_topic before insert or update on public.forum_topics
  for each row execute function public.guard_topic();

-- deleting a thread deletes its replies
create or replace function public.clear_topic_replies() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.comments where thread = 'forum-' || old.id::text;
  return old;
end $$;

drop trigger if exists clear_topic_replies on public.forum_topics;
create trigger clear_topic_replies after delete on public.forum_topics
  for each row execute function public.clear_topic_replies();

-- Replies everywhere (Floor, essays and forum threads). The database sets the
-- held flag, keeps the author and the thread fixed, and refuses replies to a
-- forum thread that is missing or locked.
create or replace function public.guard_comment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.thread like 'forum-%' then
      if not exists (select 1 from public.forum_topics where id::text = substr(new.thread, 7)) then
        raise exception 'That thread no longer exists.';
      end if;
      if auth.uid() is not null and not public.is_staff()
         and exists (select 1 from public.forum_topics where id::text = substr(new.thread, 7) and locked) then
        raise exception 'This thread is locked.';
      end if;
    end if;
    new.flagged := public.contains_banned(new.body);
    new.edited_at := null;
    return new;
  end if;
  new.author := old.author;
  new.thread := old.thread;
  new.created_at := old.created_at;
  if new.body is distinct from old.body then
    new.edited_at := now();
    new.flagged := public.contains_banned(new.body);
  elsif new.flagged is distinct from old.flagged and auth.uid() is not null and not public.is_owner() then
    new.flagged := old.flagged;
  end if;
  return new;
end $$;

drop trigger if exists guard_comment on public.comments;
create trigger guard_comment before insert or update on public.comments
  for each row execute function public.guard_comment();

-- where a reply lives, as a link for notifications
create or replace function public.reply_link(thread text) returns text
language sql immutable as $$
  select case
    when thread like 'forum-%' then '/forum/' || substr(thread, 7)
    when thread like 'article-%' then '/articles/' || substr(thread, 9)
    else '/floor'
  end
$$;

-- @Name in a reply notifies that person.
create or replace function public.notify_mentions() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.flagged then return new; end if;
  insert into public.notifications (user_id, kind, body, link)
  select p.id, 'mention',
         (select display_name from public.profiles where id = new.author) || ' tagged you: ' || left(new.body, 120),
         public.reply_link(new.thread)
  from public.profiles p
  where p.id <> new.author
    and new.body ~* ('@' || regexp_replace(split_part(p.display_name, ' ', 1), '([^[:alnum:]])', '\\\1', 'g') || '\M');
  return new;
end $$;

drop trigger if exists notify_mentions on public.comments;
create trigger notify_mentions after insert on public.comments
  for each row execute function public.notify_mentions();

-- A reply to your forum thread notifies you.
create or replace function public.notify_topic_reply() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.flagged or new.thread not like 'forum-%' then return new; end if;
  insert into public.notifications (user_id, kind, body, link)
  select t.author, 'reply',
         (select display_name from public.profiles where id = new.author) || ' replied to your thread: ' || left(t.title, 80),
         public.reply_link(new.thread)
  from public.forum_topics t
  where t.id::text = substr(new.thread, 7)
    and t.author <> new.author;
  return new;
end $$;

drop trigger if exists notify_topic_reply on public.comments;
create trigger notify_topic_reply after insert on public.comments
  for each row execute function public.notify_topic_reply();

alter table public.forum_topics  enable row level security;
alter table public.topic_reports enable row level security;

-- held threads are visible only to their author and to owners
drop policy if exists topics_read on public.forum_topics;
create policy topics_read on public.forum_topics for select
  using (not flagged or author = auth.uid() or public.is_owner());
drop policy if exists topics_insert on public.forum_topics;
create policy topics_insert on public.forum_topics for insert to authenticated
  with check (author = auth.uid());
drop policy if exists topics_update on public.forum_topics;
create policy topics_update on public.forum_topics for update to authenticated
  using (author = auth.uid() or public.is_staff())
  with check (author = auth.uid() or public.is_staff());
drop policy if exists topics_delete on public.forum_topics;
create policy topics_delete on public.forum_topics for delete to authenticated
  using (author = auth.uid() or public.is_owner());

drop policy if exists topic_reports_insert on public.topic_reports;
create policy topic_reports_insert on public.topic_reports for insert to authenticated with check (reporter = auth.uid());
drop policy if exists topic_reports_read on public.topic_reports;
create policy topic_reports_read on public.topic_reports for select to authenticated using (public.is_owner());
drop policy if exists topic_reports_delete on public.topic_reports;
create policy topic_reports_delete on public.topic_reports for delete to authenticated using (public.is_owner());

-- ===================== END FORUM =====================

-- ===================== RAMZ TAB (tournaments) =====================
-- One event = one document (tab_events.doc). Its directors edit it.
-- Judges and schools have no accounts: they reach it only through the
-- functions below, which check their private code or link first.
-- tab_public holds the cleaned copy anyone may read (no codes, tokens,
-- judge ratings, conflicts, drafts or private results); directors write it.
-- This block is also inside schema.sql. On a database set up before Ramz Tab
-- existed, run this file once on its own. Safe to run more than once.

create table if not exists public.tab_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  doc jsonb not null,
  version integer not null default 1,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tab_staff (
  event_id uuid not null references public.tab_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (event_id, user_id)
);

create table if not exists public.tab_public (
  event_id uuid primary key references public.tab_events (id) on delete cascade,
  slug text not null unique,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

-- editors and owners (also defined in forum.sql; repeated so this file runs on its own)
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('editor', 'owner') from public.profiles where id = auth.uid()), false)
$$;

-- directors of an event, and owners for every event
create or replace function public.is_tab_staff(eid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_owner() or exists (select 1 from public.tab_staff where event_id = eid and user_id = auth.uid())
$$;

-- Every change bumps the version by exactly one, so two directors saving at
-- once cannot overwrite each other: the second save fails and the app retries
-- on the newer copy.
create or replace function public.guard_tab_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.version := 1;
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.created_at := now();
    new.updated_at := now();
  else
    if new.version <> old.version + 1 then
      raise exception 'Someone else changed this event. Reloading the newest copy.' using errcode = '40001';
    end if;
    new.slug := old.slug;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  if octet_length(new.doc::text) > 3000000 then
    raise exception 'This event has grown too large to save.';
  end if;
  return new;
end $$;

drop trigger if exists guard_tab_event on public.tab_events;
create trigger guard_tab_event before insert or update on public.tab_events
  for each row execute function public.guard_tab_event();

-- whoever creates an event directs it
create or replace function public.tab_creator_is_director() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.tab_staff (event_id, user_id) values (new.id, new.created_by) on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists tab_creator_is_director on public.tab_events;
create trigger tab_creator_is_director after insert on public.tab_events
  for each row execute function public.tab_creator_is_director();

alter table public.tab_events enable row level security;
alter table public.tab_staff  enable row level security;
alter table public.tab_public enable row level security;

drop policy if exists tab_events_read on public.tab_events;
create policy tab_events_read on public.tab_events for select to authenticated using (created_by = auth.uid() or public.is_tab_staff(id));
-- editors and owners can start an event
drop policy if exists tab_events_insert on public.tab_events;
create policy tab_events_insert on public.tab_events for insert to authenticated with check (public.is_staff());
drop policy if exists tab_events_update on public.tab_events;
create policy tab_events_update on public.tab_events for update to authenticated
  using (public.is_tab_staff(id)) with check (public.is_tab_staff(id));
drop policy if exists tab_events_delete on public.tab_events;
create policy tab_events_delete on public.tab_events for delete to authenticated using (public.is_owner());

drop policy if exists tab_staff_read on public.tab_staff;
create policy tab_staff_read on public.tab_staff for select to authenticated using (user_id = auth.uid() or public.is_tab_staff(event_id));
drop policy if exists tab_staff_write on public.tab_staff;
create policy tab_staff_write on public.tab_staff for insert to authenticated with check (public.is_tab_staff(event_id));
drop policy if exists tab_staff_delete on public.tab_staff;
create policy tab_staff_delete on public.tab_staff for delete to authenticated using (public.is_tab_staff(event_id));

drop policy if exists tab_public_read on public.tab_public;
create policy tab_public_read on public.tab_public for select using (true);
drop policy if exists tab_public_insert on public.tab_public;
create policy tab_public_insert on public.tab_public for insert to authenticated with check (public.is_tab_staff(event_id));
drop policy if exists tab_public_update on public.tab_public;
create policy tab_public_update on public.tab_public for update to authenticated
  using (public.is_tab_staff(event_id)) with check (public.is_tab_staff(event_id));
drop policy if exists tab_public_delete on public.tab_public;
create policy tab_public_delete on public.tab_public for delete to authenticated using (public.is_owner());

-- add a director by the email they sign in with
create or replace function public.tab_add_director(p_event uuid, p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid; nm text;
begin
  if not public.is_tab_staff(p_event) then raise exception 'Only this event''s directors can add directors.'; end if;
  select u.id into uid from auth.users u where lower(u.email) = lower(trim(p_email));
  if uid is null then raise exception 'No account uses that email yet. Ask them to sign in to Ramz-e-Fikr once first.'; end if;
  insert into public.tab_staff (event_id, user_id) values (p_event, uid) on conflict do nothing;
  select display_name into nm from public.profiles where id = uid;
  return nm;
end $$;

-- ---------- judges: one private code each, no account ----------

-- a judge's current room, teams and motion
create or replace function public.tab_judge_view(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  eid uuid; d jsonb; j jsonb; r jsonb; deb jsonb; seat text; ballot jsonb;
begin
  if p_code is null or char_length(p_code) < 6 then raise exception 'That code is not valid.'; end if;
  select te.id, te.doc, jj into eid, d, j
    from public.tab_events te, jsonb_array_elements(te.doc->'judges') jj
    where jj->>'code' = upper(trim(p_code)) and coalesce((jj->>'active')::boolean, true)
    limit 1;
  if eid is null then raise exception 'That code is not valid.'; end if;

  select rr into r from jsonb_array_elements(d->'rounds') rr
    where rr->>'status' in ('released', 'motion')
    order by (rr->>'n')::int desc limit 1;

  if r is not null then
    select dd into deb from jsonb_array_elements(r->'debates') dd
      where exists (select 1 from jsonb_array_elements(dd->'panel') s where s->>'judge' = j->>'id') limit 1;
  end if;
  if deb is not null then
    select s->>'role' into seat from jsonb_array_elements(deb->'panel') s where s->>'judge' = j->>'id' limit 1;
    select b into ballot from jsonb_array_elements(r->'ballots') b
      where b->>'debate' = deb->>'id' and b->>'judge' = j->>'id' limit 1;
  end if;

  return jsonb_build_object(
    'event', jsonb_build_object('name', d->>'name', 'urdu', d->>'urdu', 'format', d->>'format',
      'scoreMin', d->'scoreMin', 'scoreMax', d->'scoreMax', 'replyMin', d->'replyMin', 'replyMax', d->'replyMax', 'prep', d->'prep'),
    'judge', jsonb_build_object('id', j->>'id', 'name', j->>'name'),
    'round', case when r is null then null else jsonb_build_object('n', r->'n', 'status', r->>'status',
      'motion', case when r->>'status' = 'motion' then r->>'motion' else '' end,
      'info', case when r->>'status' = 'motion' then r->>'info' else '' end,
      'motionAt', case when r->>'status' = 'motion' then r->'motionAt' else null end) end,
    'debate', case when deb is null then null else jsonb_build_object(
      'id', deb->>'id',
      'room', (select rm->>'name' from jsonb_array_elements(d->'rooms') rm where rm->>'id' = deb->>'room' limit 1),
      'role', seat,
      'teams', (select jsonb_agg(jsonb_build_object('id', t->>'id', 'name', t->>'name', 'speakers', t->'speakers') order by tt.pos)
                from jsonb_array_elements_text(deb->'teams') with ordinality as tt(tid, pos)
                join jsonb_array_elements(d->'teams') t on t->>'id' = tt.tid),
      'panel', (select jsonb_agg(jsonb_build_object('name', jx->>'name', 'role', s->>'role'))
                from jsonb_array_elements(deb->'panel') s
                join jsonb_array_elements(d->'judges') jx on jx->>'id' = s->>'judge')
    ) end,
    'ballot', ballot
  );
end $$;

-- Submit or replace a ballot. Every rule is checked here, not in the browser.
create or replace function public.tab_submit_ballot(p_code text, p_round int, p_debate text, p_scores jsonb, p_reason text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  eid uuid; d jsonb; j jsonb; r jsonb; ri int; deb jsonb; role text; fmt text;
  nspk int; want int; tid text; arr jsonb; v numeric; lo numeric; hi numeric;
  total numeric; totals numeric[] := '{}'; i int; bl jsonb; ms bigint;
begin
  if p_code is null or char_length(p_code) < 6 then raise exception 'That code is not valid.'; end if;
  select te.id into eid
    from public.tab_events te, jsonb_array_elements(te.doc->'judges') jj
    where jj->>'code' = upper(trim(p_code)) and coalesce((jj->>'active')::boolean, true) limit 1;
  if eid is null then raise exception 'That code is not valid.'; end if;
  -- lock the event so two ballots arriving together are both kept
  select doc into d from public.tab_events where id = eid for update;
  select jj into j from jsonb_array_elements(d->'judges') jj where jj->>'code' = upper(trim(p_code)) limit 1;
  fmt := d->>'format';

  select rr, (ord - 1)::int into r, ri from jsonb_array_elements(d->'rounds') with ordinality as x(rr, ord)
    where (rr->>'n')::int = p_round limit 1;
  if r is null or r->>'status' not in ('released', 'motion') then raise exception 'Ballots for this round are closed.'; end if;
  select dd into deb from jsonb_array_elements(r->'debates') dd where dd->>'id' = p_debate limit 1;
  if deb is null then raise exception 'That debate is not in this round.'; end if;
  select s->>'role' into role from jsonb_array_elements(deb->'panel') s where s->>'judge' = j->>'id' limit 1;
  if role is null then raise exception 'You are not on the panel for this room.'; end if;
  if fmt = 'BP' and role <> 'chair' then raise exception 'In British Parliamentary only the chair submits the ballot.'; end if;
  if fmt <> 'BP' and role = 'trainee' then raise exception 'Trainee judges do not submit ballots.'; end if;

  nspk := case when fmt = 'BP' then 2 else 3 end;
  want := nspk + case when fmt = 'BP' then 0 else 1 end;
  if p_scores is null or jsonb_typeof(p_scores) <> 'object'
     or (select count(*) from jsonb_object_keys(p_scores)) <> jsonb_array_length(deb->'teams') then
    raise exception 'Scores are for the wrong teams.';
  end if;
  for tid in select jsonb_array_elements_text(deb->'teams') loop
    arr := p_scores->tid;
    if arr is null or jsonb_typeof(arr) <> 'array' or jsonb_array_length(arr) <> want then
      raise exception 'Every speaker needs a score.';
    end if;
    total := 0;
    for i in 0 .. want - 1 loop
      if jsonb_typeof(arr->i) <> 'number' then raise exception 'Every speaker needs a score.'; end if;
      v := (arr->>i)::numeric;
      if i = nspk then lo := (d->>'replyMin')::numeric; hi := (d->>'replyMax')::numeric;
      else lo := (d->>'scoreMin')::numeric; hi := (d->>'scoreMax')::numeric; end if;
      if v < lo or v > hi then
        raise exception '% scores must be between % and %.', case when i = nspk then 'Reply' else 'Speaker' end, lo, hi;
      end if;
      if v * 2 <> trunc(v * 2) then raise exception 'Scores go up in half points.'; end if;
      total := total + v;
    end loop;
    totals := totals || total;
  end loop;
  if (select count(distinct x) from unnest(totals) x) <> array_length(totals, 1) then
    raise exception 'Two teams have the same total. Adjust a score so every team has a different total.';
  end if;
  if char_length(coalesce(p_reason, '')) > 800 then raise exception 'Keep the reason under 800 characters.'; end if;

  ms := (extract(epoch from now()) * 1000)::bigint;
  bl := coalesce((select jsonb_agg(b) from jsonb_array_elements(r->'ballots') b
                  where not (b->>'debate' = p_debate and b->>'judge' = j->>'id')), '[]'::jsonb)
        || jsonb_build_array(jsonb_build_object('debate', p_debate, 'judge', j->>'id', 'at', ms,
                                                'scores', p_scores, 'reason', coalesce(p_reason, '')));
  update public.tab_events
     set doc = jsonb_set(jsonb_set(doc, array['rounds', ri::text, 'ballots'], bl),
                         array['rounds', ri::text, 'lastBallotAt'], to_jsonb(ms)),
         version = version + 1
   where id = eid;
  return jsonb_build_object('ok', true, 'at', ms);
end $$;

-- ---------- schools: one private registration link each ----------

create or replace function public.tab_school_view(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d jsonb; inst jsonb;
begin
  if p_token is null or char_length(p_token) < 16 then raise exception 'That registration link is not valid.'; end if;
  select te.doc, ii into d, inst from public.tab_events te, jsonb_array_elements(te.doc->'institutions') ii
    where ii->>'token' = p_token limit 1;
  if inst is null then raise exception 'That registration link is not valid.'; end if;
  return jsonb_build_object(
    'event', jsonb_build_object('name', d->>'name', 'urdu', d->>'urdu', 'format', d->>'format', 'start', d->>'start',
      'regOpen', coalesce((d->>'regOpen')::boolean, false)
                 and not exists (select 1 from jsonb_array_elements(coalesce(d->'rounds', '[]'::jsonb)) r where r->>'status' <> 'setup')),
    'institution', jsonb_build_object('id', inst->>'id', 'name', inst->>'name'),
    'teams', coalesce((select jsonb_agg(jsonb_build_object('id', t->>'id', 'name', t->>'name', 'speakers', t->'speakers'))
              from jsonb_array_elements(d->'teams') t where t->>'inst' = inst->>'id'), '[]'::jsonb),
    'judges', coalesce((select jsonb_agg(jsonb_build_object('id', jx->>'id', 'name', jx->>'name'))
              from jsonb_array_elements(d->'judges') jx where jx->>'inst' = inst->>'id'), '[]'::jsonb)
  );
end $$;

-- Replace a school's own teams, speakers and judges. Other schools' entries,
-- judge codes and ratings are never touched. Closed once the first draw exists.
create or replace function public.tab_school_save(p_token text, p_payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  eid uuid; d jsonb; inst jsonb; iid text; fmt text; nspk int;
  t jsonb; old jsonb; nt jsonb := '[]'::jsonb; nj jsonb := '[]'::jsonb; sp jsonb; s jsonb; k int; nm text;
begin
  if p_token is null or char_length(p_token) < 16 then raise exception 'That registration link is not valid.'; end if;
  select te.id into eid from public.tab_events te, jsonb_array_elements(te.doc->'institutions') ii
    where ii->>'token' = p_token limit 1;
  if eid is null then raise exception 'That registration link is not valid.'; end if;
  select doc into d from public.tab_events where id = eid for update;
  select ii into inst from jsonb_array_elements(d->'institutions') ii where ii->>'token' = p_token limit 1;
  iid := inst->>'id';
  -- closed by the director, or once any round has been drawn (rounds planned but not drawn are fine)
  if not coalesce((d->>'regOpen')::boolean, false)
     or exists (select 1 from jsonb_array_elements(coalesce(d->'rounds', '[]'::jsonb)) r where r->>'status' <> 'setup') then
    raise exception 'Registration is closed. Ask the tournament director to make changes.';
  end if;
  fmt := d->>'format';
  nspk := case when fmt = 'BP' then 2 else 3 end;
  if jsonb_array_length(coalesce(p_payload->'teams', '[]'::jsonb)) > 30 or jsonb_array_length(coalesce(p_payload->'judges', '[]'::jsonb)) > 30 then
    raise exception 'A school can register at most 30 teams and 30 judges.';
  end if;

  for t in select * from jsonb_array_elements(coalesce(p_payload->'teams', '[]'::jsonb)) loop
    nm := trim(coalesce(t->>'name', ''));
    if char_length(nm) < 1 or char_length(nm) > 60 then raise exception 'Team names must be 1 to 60 characters.'; end if;
    select x into old from jsonb_array_elements(d->'teams') x where x->>'id' = t->>'id' and x->>'inst' = iid limit 1;
    sp := '[]'::jsonb;
    for k in 0 .. nspk - 1 loop
      s := (t->'speakers')->k;
      nm := trim(coalesce(s #>> '{}', ''));
      if char_length(nm) < 1 or char_length(nm) > 60 then raise exception 'Each speaker needs a name or initials (up to 60 characters).'; end if;
      sp := sp || jsonb_build_array(jsonb_build_object(
        'id', coalesce(old->'speakers'->k->>'id', gen_random_uuid()::text), 'name', nm));
    end loop;
    nt := nt || jsonb_build_array(jsonb_build_object(
      'id', coalesce(old->>'id', gen_random_uuid()::text),
      'name', trim(t->>'name'), 'inst', iid, 'speakers', sp,
      'active', coalesce((old->>'active')::boolean, true)));
  end loop;

  for t in select * from jsonb_array_elements(coalesce(p_payload->'judges', '[]'::jsonb)) loop
    nm := trim(coalesce(t->>'name', ''));
    if char_length(nm) < 1 or char_length(nm) > 60 then raise exception 'Judge names must be 1 to 60 characters.'; end if;
    select x into old from jsonb_array_elements(d->'judges') x where x->>'id' = t->>'id' and x->>'inst' = iid limit 1;
    nj := nj || jsonb_build_array(jsonb_build_object(
      'id', coalesce(old->>'id', gen_random_uuid()::text),
      'name', nm, 'inst', iid,
      'rating', coalesce((old->>'rating')::numeric, 3),
      'code', coalesce(old->>'code', upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
      'active', coalesce((old->>'active')::boolean, true)));
  end loop;

  d := jsonb_set(d, '{teams}', coalesce((select jsonb_agg(x) from jsonb_array_elements(d->'teams') x where x->>'inst' is distinct from iid), '[]'::jsonb) || nt);
  d := jsonb_set(d, '{judges}', coalesce((select jsonb_agg(x) from jsonb_array_elements(d->'judges') x where x->>'inst' is distinct from iid), '[]'::jsonb) || nj);
  update public.tab_events set doc = d, version = version + 1 where id = eid;
  return jsonb_build_object('ok', true, 'teams', jsonb_array_length(nt), 'judges', jsonb_array_length(nj));
end $$;

revoke all on function public.tab_judge_view(text) from public;
revoke all on function public.tab_submit_ballot(text, int, text, jsonb, text) from public;
revoke all on function public.tab_school_view(text) from public;
revoke all on function public.tab_school_save(text, jsonb) from public;
grant execute on function public.tab_judge_view(text) to anon, authenticated;
grant execute on function public.tab_submit_ballot(text, int, text, jsonb, text) to anon, authenticated;
grant execute on function public.tab_school_view(text) to anon, authenticated;
grant execute on function public.tab_school_save(text, jsonb) to anon, authenticated;
grant execute on function public.tab_add_director(uuid, text) to authenticated;

-- live updates for screens and directors (Supabase Realtime)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.tab_public; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.tab_events; exception when duplicate_object then null; end;
  end if;
end $$;

-- ===================== END RAMZ TAB =====================

-- ---------- starting data ----------

-- A short starter list. Owners: edit this in Table Editor > banned_terms.
insert into public.banned_terms (term) values
  ('idiot'), ('stupid'), ('moron'), ('bewakoof'), ('ullu'), ('jahil'), ('بیوقوف'), ('جاہل')
on conflict do nothing;

-- ===================== OWNER EMAILS =====================
-- The three owner emails are NOT kept in this file, so they are never
-- published with the code. After running this file, run a second small
-- query (see supabase/owners.example.sql) with the real addresses.
-- ========================================================

-- If an owner signed up before their email was added above, promote them now.
update public.profiles p set role = 'owner'
from auth.users u
where u.id = p.id
  and p.role <> 'owner'
  and lower(u.email) in (select lower(email) from public.owner_emails);
