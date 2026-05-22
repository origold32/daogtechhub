-- =============================================================================
-- DAOG Tech Hub — PRIMARY ADMIN ACCOUNTS SETUP
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Ensures adegbesanadebola1@gmail.com and daogstore@gmail.com
-- always have role = 'admin' and is_active = true.
--
-- IMPORTANT: The users must have signed up first (auth.users entry must exist).
-- This script only promotes existing accounts — it does not create new auth users.
-- =============================================================================

-- Promote accounts to admin by email (safe to run multiple times)
UPDATE profiles
SET
  role      = 'admin',
  is_active = true,
  updated_at = now()
WHERE email IN (
  'adegbesanadebola1@gmail.com',
  'daogstore@gmail.com'
);

-- Confirm which accounts were found
SELECT id, email, role, is_active
FROM profiles
WHERE email IN (
  'adegbesanadebola1@gmail.com',
  'daogstore@gmail.com'
);
