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
