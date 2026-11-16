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
create or replace function public.guard_comment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
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

-- @Name in a reply notifies that person.
create or replace function public.notify_mentions() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.flagged then return new; end if;
  insert into public.notifications (user_id, kind, body, link)
  select p.id, 'mention',
         (select display_name from public.profiles where id = new.author) || ' tagged you: ' || left(new.body, 120),
         '/floor'
  from public.profiles p
  where p.id <> new.author
    and new.body ~* ('@' || regexp_replace(split_part(p.display_name, ' ', 1), '([^[:alnum:]])', '\\\1', 'g') || '\M');
  return new;
end $$;

drop trigger if exists notify_mentions on public.comments;
create trigger notify_mentions after insert on public.comments
  for each row execute function public.notify_mentions();

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
