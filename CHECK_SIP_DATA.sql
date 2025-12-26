-- Check if your FIRE Planner data is in sip_planner_data table
-- Run this in Supabase SQL Editor

SELECT
    id,
    user_id,
    goals,
    sip_calculations,
    created_at,
    updated_at
FROM sip_planner_data
WHERE user_id = '25e8b401-7fc4-4637-82e6-c574129fae82';
