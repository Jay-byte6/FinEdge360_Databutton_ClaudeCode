-- Migration 009: Fix goal_id column type to support FIRE Planner goal IDs
-- FIRE Planner uses string IDs (e.g., "goal_1763896509052") not UUIDs
-- This allows both UUID-based goals and string-based FIRE Planner goals

-- Change goal_id from UUID to TEXT to support both formats
ALTER TABLE portfolio_holdings
ALTER COLUMN goal_id TYPE TEXT USING goal_id::TEXT;

-- Update the comment to reflect the new usage
COMMENT ON COLUMN portfolio_holdings.goal_id IS 'ID of the goal from FIRE Planner (can be UUID or string format)';
