-- Simple SQL to manually confirm all OAuth users
-- Run this in Supabase SQL Editor

-- First, check which users need to be confirmed
SELECT
  id,
  email,
  email_confirmed_at,
  raw_app_meta_data->>'provider' as provider
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- If you see OAuth users that are unconfirmed, run this:
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE
  email_confirmed_at IS NULL
  AND (
    raw_app_meta_data->>'provider' = 'google'
    OR raw_app_meta_data->>'provider' = 'github'
    OR raw_app_meta_data->>'provider' = 'facebook'
  );

-- Verify the update
SELECT
  id,
  email,
  email_confirmed_at,
  raw_app_meta_data->>'provider' as provider
FROM auth.users
WHERE raw_app_meta_data->>'provider' IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
