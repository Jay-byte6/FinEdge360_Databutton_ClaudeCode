-- Migration 017: Copy FIRE Planner data from sip_planner_data to goals table
-- Date: 2024-12-25
-- Purpose: Migrate existing FIRE Planner goal details to goals table

-- This script updates goals table with data from sip_planner_data JSON column
-- Run this ONLY if you have existing FIRE Planner data

DO $$
DECLARE
    planner_record RECORD;
    goal_json JSONB;
    v_goal_name TEXT;
    v_goal_amount NUMERIC;
    v_goal_available NUMERIC;
    v_goal_future NUMERIC;
    v_goal_inflation NUMERIC;
    v_goal_stepup NUMERIC;
    v_goal_sip NUMERIC;
    v_goal_calculated BOOLEAN;
    v_rows_updated INTEGER;
BEGIN
    -- Loop through all sip_planner_data records
    FOR planner_record IN
        SELECT user_id, goals FROM sip_planner_data WHERE goals IS NOT NULL
    LOOP
        -- Loop through each goal in the JSON array
        FOR goal_json IN SELECT * FROM jsonb_array_elements(planner_record.goals)
        LOOP
            -- Extract goal fields
            v_goal_name := goal_json->>'name';
            v_goal_amount := COALESCE((goal_json->>'amountRequiredToday')::NUMERIC, 0);
            v_goal_available := COALESCE((goal_json->>'amountAvailableToday')::NUMERIC, 0);
            v_goal_future := COALESCE((goal_json->>'amountRequiredFuture')::NUMERIC, 0);
            v_goal_inflation := COALESCE((goal_json->>'goalInflation')::NUMERIC, 6.0);
            v_goal_stepup := COALESCE((goal_json->>'stepUp')::NUMERIC, 10.0);
            v_goal_sip := COALESCE((goal_json->>'sipRequired')::NUMERIC, 0);
            v_goal_calculated := COALESCE((goal_json->>'sipCalculated')::BOOLEAN, false);

            -- Update matching goal in goals table
            -- Only update if the goal was actually calculated (has SIP value)
            IF v_goal_calculated = true OR v_goal_sip > 0 THEN
                UPDATE goals
                SET
                    amount_available_today = v_goal_available,
                    amount_required_future = v_goal_future,
                    goal_inflation = v_goal_inflation,
                    step_up_percentage = v_goal_stepup,
                    sip_required = v_goal_sip
                WHERE
                    user_id = planner_record.user_id
                    AND name = v_goal_name;

                GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

                RAISE NOTICE 'Updated % row(s) for goal: % | Available: ₹%, Future: ₹%, SIP: ₹%',
                    v_rows_updated, v_goal_name, v_goal_available, v_goal_future, v_goal_sip;
            ELSE
                RAISE NOTICE 'Skipped goal: % (not calculated yet)', v_goal_name;
            END IF;
        END LOOP;
    END LOOP;

    RAISE NOTICE '✅ Migration complete!';
END $$;

-- Verify the migration
SELECT
    name,
    amount as "Amount Required Today",
    amount_available_today as "Amount Available Today",
    amount_required_future as "Future Value",
    goal_inflation as "Inflation %",
    step_up_percentage as "Step-up %",
    sip_required as "SIP Required",
    years as "Years"
FROM goals
WHERE user_id = '25e8b401-7fc4-4637-82e6-c574129fae82'
ORDER BY years ASC;
