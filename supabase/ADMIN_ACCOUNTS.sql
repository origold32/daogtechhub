-- =============================================================================
-- DAOG Tech Hub — PRIMARY ADMIN ACCOUNTS SETUP
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- Promote by email stored directly in profiles table
UPDATE profiles
SET role = 'admin', is_active = true, updated_at = now()
WHERE email IN ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com');

-- Fallback: promote by matching auth.users email (covers cases where
-- profiles.email was not populated by the trigger)
UPDATE profiles p
SET role = 'admin', is_active = true, updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND u.email IN ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com');

-- Also sync the email column in profiles from auth.users for these accounts
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND u.email IN ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com')
  AND (p.email IS NULL OR p.email = '');

-- Verify — should show both rows with role = 'admin'
SELECT p.id, u.email, p.role, p.is_active
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('adegbesanadebola1@gmail.com', 'daogstore@gmail.com');
