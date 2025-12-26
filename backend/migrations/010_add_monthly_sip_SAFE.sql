-- Migration 010: Add monthly SIP amount to portfolio holdings (SAFE VERSION)
-- This allows users to track monthly SIP contributions for each holding
-- Used for goal planning, asset allocation validation, and SIP sufficiency calculations

-- Add monthly_sip_amount column (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'portfolio_holdings'
        AND column_name = 'monthly_sip_amount'
    ) THEN
        ALTER TABLE portfolio_holdings
        ADD COLUMN monthly_sip_amount NUMERIC(15, 2) DEFAULT 0;

        RAISE NOTICE 'Column monthly_sip_amount added successfully';
    ELSE
        RAISE NOTICE 'Column monthly_sip_amount already exists, skipping...';
    END IF;
END $$;

-- Add comment (always safe to run)
COMMENT ON COLUMN portfolio_holdings.monthly_sip_amount IS 'Monthly SIP amount being invested in this holding (used for goal planning)';

-- Create index for efficient querying by goal with SIP amounts (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'portfolio_holdings'
        AND indexname = 'idx_portfolio_holdings_goal_sip'
    ) THEN
        CREATE INDEX idx_portfolio_holdings_goal_sip
        ON portfolio_holdings(goal_id, monthly_sip_amount)
        WHERE goal_id IS NOT NULL;

        RAISE NOTICE 'Index idx_portfolio_holdings_goal_sip created successfully';
    ELSE
        RAISE NOTICE 'Index idx_portfolio_holdings_goal_sip already exists, skipping...';
    END IF;
END $$;
