-- Sets who the three owners are. Run this in the Supabase SQL Editor AFTER schema.sql.
-- Copy this file to owners.sql, put in the real emails, and run that copy.
-- owners.sql is ignored by git so the addresses are never uploaded.
-- To replace an owner later: delete their row in Table Editor > owner_emails,
-- set their role to 'member' in profiles, then run this again with the new address.
insert into public.owner_emails (email) values
  ('owner-one@example.com'),
  ('owner-two@example.com'),
  ('owner-three@example.com')
on conflict do nothing;

-- Promote anyone on the list who has already signed up.
update public.profiles p set role = 'owner'
from auth.users u
where u.id = p.id
  and p.role <> 'owner'
  and lower(u.email) in (select lower(email) from public.owner_emails);
