-- Migration 010: Add monthly SIP amount to portfolio holdings
-- This allows users to track monthly SIP contributions for each holding
-- Used for goal planning, asset allocation validation, and SIP sufficiency calculations

-- Add monthly_sip_amount column
ALTER TABLE portfolio_holdings
ADD COLUMN monthly_sip_amount NUMERIC(15, 2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN portfolio_holdings.monthly_sip_amount IS 'Monthly SIP amount being invested in this holding (used for goal planning)';

-- Create index for efficient querying by goal with SIP amounts
CREATE INDEX idx_portfolio_holdings_goal_sip ON portfolio_holdings(goal_id, monthly_sip_amount) WHERE goal_id IS NOT NULL;
