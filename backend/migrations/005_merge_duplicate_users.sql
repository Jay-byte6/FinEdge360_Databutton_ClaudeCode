-- Merge Duplicate Users by Email
-- This script merges data from email/password users to Google OAuth users with the same email

-- Step 1: Find duplicate users with the same email
-- Run this first to see which accounts need merging
SELECT
  id,
  email,
  raw_app_meta_data->>'provider' as provider,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'jsjaiho5@gmail.com'
ORDER BY created_at;

-- Expected output: Two users with same email, different providers
-- Copy the OLD user_id (email provider) and NEW user_id (google provider)

-- Step 2: Update all data tables to point to the new Google OAuth user
-- IMPORTANT: Replace OLD_USER_ID and NEW_USER_ID with actual values from Step 1

-- Before running, get the actual user IDs:
-- OLD_USER_ID = the one with provider='email' (created first)
-- NEW_USER_ID = the one with provider='google' (created second)

DO $$
DECLARE
  old_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Get the old email/password user ID
  SELECT id INTO old_user_id
  FROM auth.users
  WHERE email = 'jsjaiho5@gmail.com'
    AND (raw_app_meta_data->>'provider' = 'email' OR raw_app_meta_data->>'provider' IS NULL)
  ORDER BY created_at ASC
  LIMIT 1;

  -- Get the new Google OAuth user ID
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'jsjaiho5@gmail.com'
    AND raw_app_meta_data->>'provider' = 'google'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Log the IDs
  RAISE NOTICE 'Old User ID: %', old_user_id;
  RAISE NOTICE 'New User ID: %', new_user_id;

  -- Only proceed if both users exist
  IF old_user_id IS NOT NULL AND new_user_id IS NOT NULL THEN

    -- Update personal_info table
    UPDATE personal_info
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated personal_info';

    -- Update assets_liabilities table
    UPDATE assets_liabilities
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated assets_liabilities';

    -- Update goals table
    UPDATE goals
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated goals';

    -- Update risk_appetite table
    UPDATE risk_appetite
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated risk_appetite';

    -- Update milestone_progress table (if exists)
    UPDATE milestone_progress
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated milestone_progress';

    -- Update sip_planner table (if exists)
    UPDATE sip_planner
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated sip_planner';

    -- Update user_asset_allocations table (if exists)
    UPDATE user_asset_allocations
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated user_asset_allocations';

    -- Update risk_assessments table (if exists)
    UPDATE risk_assessments
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated risk_assessments';

    -- Update consent_tracking table (if exists)
    UPDATE consent_tracking
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated consent_tracking';

    -- Update audit_logs table (if exists)
    UPDATE audit_logs
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated audit_logs';

    -- Update subscriptions table (if exists)
    UPDATE subscriptions
    SET user_id = new_user_id
    WHERE user_id = old_user_id;
    RAISE NOTICE 'Updated subscriptions';

    -- Update profiles table (if exists)
    UPDATE profiles
    SET id = new_user_id, user_id = new_user_id
    WHERE id = old_user_id;
    RAISE NOTICE 'Updated profiles';

    -- Delete the old email/password user (optional - uncomment if you want to delete)
    -- DELETE FROM auth.users WHERE id = old_user_id;
    -- RAISE NOTICE 'Deleted old user';

    RAISE NOTICE 'Migration completed successfully!';
  ELSE
    RAISE NOTICE 'Could not find both users. Old: %, New: %', old_user_id, new_user_id;
  END IF;
END $$;

-- Step 3: Verify the migration
SELECT
  'personal_info' as table_name,
  COUNT(*) as count,
  user_id
FROM personal_info
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com'
)
GROUP BY user_id

UNION ALL

SELECT
  'goals' as table_name,
  COUNT(*) as count,
  user_id
FROM goals
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com'
)
GROUP BY user_id

UNION ALL

SELECT
  'milestone_progress' as table_name,
  COUNT(*) as count,
  user_id
FROM milestone_progress
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com'
)
GROUP BY user_id;
