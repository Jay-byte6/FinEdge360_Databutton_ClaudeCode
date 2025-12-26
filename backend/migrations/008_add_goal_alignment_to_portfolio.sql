-- Migration 008: Add Goal Alignment to Portfolio Holdings
-- Allows users to assign mutual fund holdings to specific financial goals
-- and track asset class allocation per goal

-- Add goal_id column to link holdings to goals
ALTER TABLE portfolio_holdings
ADD COLUMN goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;

-- Add asset_class column for allocation analysis
ALTER TABLE portfolio_holdings
ADD COLUMN asset_class VARCHAR(20) DEFAULT 'Equity';

-- Add index for faster goal-based queries
CREATE INDEX idx_portfolio_holdings_goal_id ON portfolio_holdings(goal_id);
CREATE INDEX idx_portfolio_holdings_user_goal ON portfolio_holdings(user_id, goal_id);

-- Add comments for documentation
COMMENT ON COLUMN portfolio_holdings.goal_id IS 'Links this holding to a specific financial goal (Retirement, Education, etc.)';
COMMENT ON COLUMN portfolio_holdings.asset_class IS 'Asset class category: Equity, Debt, Hybrid, Gold, or Liquid';

-- Update existing holdings to have proper asset class based on scheme name patterns
UPDATE portfolio_holdings
SET asset_class = CASE
    -- Equity funds
    WHEN scheme_name ILIKE '%equity%' OR
         scheme_name ILIKE '%small cap%' OR
         scheme_name ILIKE '%mid cap%' OR
         scheme_name ILIKE '%large cap%' OR
         scheme_name ILIKE '%flexi cap%' OR
         scheme_name ILIKE '%multi cap%' OR
         scheme_name ILIKE '%focused%' OR
         scheme_name ILIKE '%infrastructure%' OR
         scheme_name ILIKE '%natural resources%' OR
         scheme_name ILIKE '%index%' OR
         scheme_name ILIKE '%nifty%' OR
         scheme_name ILIKE '%sensex%'
    THEN 'Equity'

    -- Debt funds
    WHEN scheme_name ILIKE '%debt%' OR
         scheme_name ILIKE '%bond%' OR
         scheme_name ILIKE '%gilt%' OR
         scheme_name ILIKE '%liquid%' OR
         scheme_name ILIKE '%income%' OR
         scheme_name ILIKE '%credit%' OR
         scheme_name ILIKE '%dynamic bond%' OR
         scheme_name ILIKE '%corporate bond%'
    THEN 'Debt'

    -- Hybrid funds
    WHEN scheme_name ILIKE '%hybrid%' OR
         scheme_name ILIKE '%balanced%' OR
         scheme_name ILIKE '%aggressive hybrid%' OR
         scheme_name ILIKE '%conservative hybrid%' OR
         scheme_name ILIKE '%multi asset%'
    THEN 'Hybrid'

    -- Gold funds
    WHEN scheme_name ILIKE '%gold%' OR
         scheme_name ILIKE '%commodity%' OR
         scheme_name ILIKE '%silver%'
    THEN 'Gold'

    -- Default to Equity if unclear
    ELSE 'Equity'
END
WHERE asset_class IS NULL OR asset_class = 'Equity';
