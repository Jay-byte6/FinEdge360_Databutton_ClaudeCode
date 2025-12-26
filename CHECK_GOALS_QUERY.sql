-- Check if goals exist for your user
-- Run this in Supabase SQL Editor

-- Step 1: Find your user_id_db (UUID) from email
SELECT id as user_id_db, email
FROM users
WHERE email LIKE '%711a5a16%';

-- Step 2: Check goals for that user (replace UUID below with result from Step 1)
SELECT
    id,
    name,
    amount,
    amount_available_today,
    amount_required_future,
    years,
    goal_type,
    goal_inflation,
    step_up_percentage,
    sip_required,
    created_at
FROM goals
WHERE user_id = '25e8b401-7fc4-4637-82e6-c574129fae82'  -- Your user_id_db
ORDER BY years ASC;

-- Step 3: Check if goals are in sip_planner_data instead
SELECT
    id,
    user_id,
    goals,
    created_at
FROM sip_planner_data
WHERE user_id = '25e8b401-7fc4-4637-82e6-c574129fae82';
