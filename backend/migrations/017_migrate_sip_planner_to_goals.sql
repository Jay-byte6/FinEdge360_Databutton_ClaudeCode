-- Migration 017: Copy FIRE Planner data from sip_planner_data to goals table
-- Date: 2024-12-25
-- Purpose: Migrate existing FIRE Planner goal details to goals table

-- This script updates goals table with data from sip_planner_data JSON column
-- Run this ONLY if you have existing FIRE Planner data

DO $$
DECLARE
    planner_record RECORD;
    goal_json JSONB;
    goal_name TEXT;
    goal_amount NUMERIC;
    goal_available NUMERIC;
    goal_future NUMERIC;
    goal_inflation NUMERIC;
    goal_stepup NUMERIC;
    goal_sip NUMERIC;
    goal_calculated BOOLEAN;
BEGIN
    -- Loop through all sip_planner_data records
    FOR planner_record IN
        SELECT user_id, goals FROM sip_planner_data WHERE goals IS NOT NULL
    LOOP
        -- Loop through each goal in the JSON array
        FOR goal_json IN SELECT * FROM jsonb_array_elements(planner_record.goals)
        LOOP
            -- Extract goal fields
            goal_name := goal_json->>'name';
            goal_amount := COALESCE((goal_json->>'amountRequiredToday')::NUMERIC, 0);
            goal_available := COALESCE((goal_json->>'amountAvailableToday')::NUMERIC, 0);
            goal_future := COALESCE((goal_json->>'amountRequiredFuture')::NUMERIC, 0);
            goal_inflation := COALESCE((goal_json->>'goalInflation')::NUMERIC, 6.0);
            goal_stepup := COALESCE((goal_json->>'stepUp')::NUMERIC, 10.0);
            goal_sip := COALESCE((goal_json->>'sipRequired')::NUMERIC, 0);
            goal_calculated := COALESCE((goal_json->>'sipCalculated')::BOOLEAN, false);

            -- Update matching goal in goals table
            UPDATE goals
            SET
                amount_available_today = goal_available,
                amount_required_future = goal_future,
                goal_inflation = goal_inflation,
                step_up_percentage = goal_stepup,
                sip_required = goal_sip
            WHERE
                user_id = planner_record.user_id
                AND name = goal_name
                AND goal_calculated = true;  -- Only update if it was calculated

            RAISE NOTICE 'Updated goal: % for user: % (available: %, future: %, SIP: %)',
                goal_name, planner_record.user_id, goal_available, goal_future, goal_sip;
        END LOOP;
    END LOOP;
END $$;

-- Verify the migration
SELECT
    name,
    amount,
    amount_available_today,
    amount_required_future,
    goal_inflation,
    step_up_percentage,
    sip_required
FROM goals
WHERE user_id = '25e8b401-7fc4-4637-82e6-c574129fae82'
ORDER BY years ASC;
