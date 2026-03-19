-- =============================================================================
-- DAOG Tech Hub — Profile Auto-Creation Trigger
-- =============================================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This ensures EVERY new signup automatically gets a profiles row,
-- even if the callback/verify route doesn't run (e.g. network issues).
-- =============================================================================

-- Step 1: Create the function that fires on new auth.users row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_meta  jsonb;
  full_name text;
  parts     text[];
  fname     text;
  lname     text;
begin
  raw_meta  := new.raw_user_meta_data;

  -- Extract name from OAuth metadata (Google, Facebook) or fall back to email prefix
  full_name := coalesce(
    raw_meta->>'full_name',
    raw_meta->>'name',
    split_part(new.email, '@', 1),
    'User'
  );

  parts := string_to_array(full_name, ' ');
  fname := coalesce(parts[1], 'User');
  lname := coalesce(array_to_string(parts[2:], ' '), '');

  insert into public.profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    fname,
    lname,
    new.email,
    new.phone,
    coalesce(raw_meta->>'avatar_url', raw_meta->>'picture'),
    'customer',
    now(),
    now()
  )
  on conflict (id) do nothing;  -- Safe: won't overwrite existing profiles

  return new;
end;
$$;

-- Step 2: Drop old trigger if it exists, then create fresh
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- Step 3: Fix RLS — prevent users from changing their own role
-- (Currently the "own update" policy allows it — this closes that gap)
-- =============================================================================

-- Drop old permissive update policy
drop policy if exists "profiles: own update" on profiles;

-- New policy: users can update their own profile but NOT the role column
-- We do this by allowing update only when the role isn't being changed
create policy "profiles: own update (no role change)"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from profiles where id = auth.uid())
  );

-- Admin can update anything including role
drop policy if exists "profiles: admin update role" on profiles;
create policy "profiles: admin update role"
  on profiles for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =============================================================================
-- Step 4: Backfill — create profiles for any auth users who don't have one yet
-- =============================================================================
insert into public.profiles (id, first_name, last_name, email, phone, role, created_at, updated_at)
select
  u.id,
  coalesce(split_part(u.email, '@', 1), 'User'),
  '',
  u.email,
  u.phone,
  'customer',
  u.created_at,
  now()
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- =============================================================================
-- Step 5: Make yourself admin (replace with your own email)
-- =============================================================================
-- update profiles set role = 'admin' where email = 'your@email.com';

-- =============================================================================
-- Verification queries — run these to confirm everything is working:
-- =============================================================================
-- select count(*) from profiles;
-- select id, email, role, created_at from profiles order by created_at desc limit 10;
-- select trigger_name, event_manipulation from information_schema.triggers
--   where event_object_table = 'users' and trigger_schema = 'auth';
