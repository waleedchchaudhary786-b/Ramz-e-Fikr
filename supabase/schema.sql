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
