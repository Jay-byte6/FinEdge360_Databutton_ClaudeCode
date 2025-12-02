-- Check if data exists for jsjaiho5@gmail.com
-- Run this in Supabase SQL Editor to verify data before merging

-- Step 1: Find all users with this email
SELECT
  id as user_id,
  email,
  raw_app_meta_data->>'provider' as auth_provider,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'jsjaiho5@gmail.com'
ORDER BY created_at;

-- Step 2: Check personal_info data
SELECT
  'personal_info' as table_name,
  pi.id,
  pi.user_id,
  pi.name,
  pi.age,
  pi.monthly_salary,
  pi.monthly_expenses,
  pi.created_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM personal_info pi
JOIN auth.users u ON pi.user_id = u.id
WHERE u.email = 'jsjaiho5@gmail.com'
ORDER BY pi.created_at;

-- Step 3: Check assets_liabilities data
SELECT
  'assets_liabilities' as table_name,
  al.id,
  al.user_id,
  al.real_estate_value,
  al.mutual_funds_value,
  al.epf_balance,
  al.ppf_balance,
  al.created_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM assets_liabilities al
JOIN auth.users u ON al.user_id = u.id
WHERE u.email = 'jsjaiho5@gmail.com'
ORDER BY al.created_at;

-- Step 4: Check goals data
SELECT
  'goals' as table_name,
  g.id,
  g.user_id,
  g.name,
  g.amount,
  g.years,
  g.goal_type,
  g.created_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM goals g
JOIN auth.users u ON g.user_id = u.id
WHERE u.email = 'jsjaiho5@gmail.com'
ORDER BY g.created_at;

-- Step 5: Check milestone_progress data
SELECT
  'milestone_progress' as table_name,
  mp.id,
  mp.user_id,
  mp.milestone_id,
  mp.completed,
  mp.completed_at,
  mp.created_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM milestone_progress mp
JOIN auth.users u ON mp.user_id = u.id
WHERE u.email = 'jsjaiho5@gmail.com'
ORDER BY mp.milestone_id;

-- Step 6: Check sip_planner data (if exists)
SELECT
  'sip_planner' as table_name,
  sp.id,
  sp.user_id,
  sp.goal_name,
  sp.target_amount,
  sp.time_horizon,
  sp.created_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM sip_planner sp
JOIN auth.users u ON sp.user_id = u.id
WHERE u.email = 'jsjaiho5@gmail.com'
ORDER BY sp.created_at;

-- Step 7: Check risk_appetite data
SELECT
  'risk_appetite' as table_name,
  ra.id,
  ra.user_id,
  ra.risk_tolerance,
  ra.created_at,
  u.raw_app_meta_data->>'provider' as auth_provider
FROM risk_appetite ra
JOIN auth.users u ON ra.user_id = u.id
WHERE u.email = 'jsjaiho5@gmail.com'
ORDER BY ra.created_at;

-- Summary: Count of records per table
SELECT
  'Summary' as info,
  (SELECT COUNT(*) FROM personal_info pi JOIN auth.users u ON pi.user_id = u.id WHERE u.email = 'jsjaiho5@gmail.com') as personal_info_count,
  (SELECT COUNT(*) FROM assets_liabilities al JOIN auth.users u ON al.user_id = u.id WHERE u.email = 'jsjaiho5@gmail.com') as assets_liabilities_count,
  (SELECT COUNT(*) FROM goals g JOIN auth.users u ON g.user_id = u.id WHERE u.email = 'jsjaiho5@gmail.com') as goals_count,
  (SELECT COUNT(*) FROM milestone_progress mp JOIN auth.users u ON mp.user_id = u.id WHERE u.email = 'jsjaiho5@gmail.com') as milestone_progress_count,
  (SELECT COUNT(*) FROM risk_appetite ra JOIN auth.users u ON ra.user_id = u.id WHERE u.email = 'jsjaiho5@gmail.com') as risk_appetite_count;
