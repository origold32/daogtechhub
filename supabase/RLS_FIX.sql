-- =============================================================================
-- DAOG Tech Hub — RLS Infinite Recursion Fix
-- Run this in Supabase Dashboard → SQL Editor if you see:
-- "infinite recursion detected in policy for relation profiles"
-- =============================================================================

drop policy if exists "profiles: admin read all"              on profiles;
drop policy if exists "profiles: admin update role"           on profiles;
drop policy if exists "profiles: own update (no role change)" on profiles;
drop policy if exists "profiles: own update"                  on profiles;

-- Own read
drop policy if exists "profiles: own read" on profiles;
create policy "profiles: own read"
  on profiles for select using (auth.uid() = id);

-- Own update (role changes are always done via service role key server-side)
create policy "profiles: own update"
  on profiles for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin read — uses auth.users metadata, NOT a subquery back into profiles
create policy "profiles: admin read all"
  on profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and (u.raw_app_meta_data ->> 'role') = 'admin'
    )
  );
