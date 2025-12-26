-- Migration 012: Add ISIN columns to scheme_master table
-- ISIN is critical for NAV tracking and goal mapping

-- Add ISIN columns (Growth and Dividend options)
ALTER TABLE scheme_master
ADD COLUMN IF NOT EXISTS isin_growth VARCHAR(20),
ADD COLUMN IF NOT EXISTS isin_div_reinvestment VARCHAR(20);

-- Create indexes on ISIN columns for fast lookups
CREATE INDEX IF NOT EXISTS idx_scheme_master_isin_growth
ON scheme_master(isin_growth) WHERE isin_growth IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scheme_master_isin_div
ON scheme_master(isin_div_reinvestment) WHERE isin_div_reinvestment IS NOT NULL;

-- Add comments
COMMENT ON COLUMN scheme_master.isin_growth IS 'ISIN for Growth/Accumulation plan - used for NAV tracking';
COMMENT ON COLUMN scheme_master.isin_div_reinvestment IS 'ISIN for Dividend Reinvestment plan - used for NAV tracking';

-- Update portfolio_holdings to make ISIN NOT NULL (after data migration)
-- First, let's allow NULL temporarily for migration
ALTER TABLE portfolio_holdings
ALTER COLUMN isin DROP NOT NULL;

COMMENT ON COLUMN portfolio_holdings.isin IS 'ISIN code from scheme_master - MANDATORY for NAV tracking and goal mapping';
