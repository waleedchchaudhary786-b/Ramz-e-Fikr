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
