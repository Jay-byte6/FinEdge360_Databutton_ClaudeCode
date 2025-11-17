-- Create user_asset_allocations table to store user's custom asset allocation preferences
-- Stores allocation strategy for each goal type (Short-Term, Mid-Term, Long-Term)

CREATE TABLE IF NOT EXISTS user_asset_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('Short-Term', 'Mid-Term', 'Long-Term')),

    -- Asset allocations (percentages, must sum to 100)
    equity_pct INTEGER NOT NULL DEFAULT 0 CHECK (equity_pct >= 0 AND equity_pct <= 100),
    us_equity_pct INTEGER NOT NULL DEFAULT 0 CHECK (us_equity_pct >= 0 AND us_equity_pct <= 100),
    debt_pct INTEGER NOT NULL DEFAULT 0 CHECK (debt_pct >= 0 AND debt_pct <= 100),
    gold_pct INTEGER NOT NULL DEFAULT 0 CHECK (gold_pct >= 0 AND gold_pct <= 100),
    reits_pct INTEGER NOT NULL DEFAULT 0 CHECK (reits_pct >= 0 AND reits_pct <= 100),
    crypto_pct INTEGER NOT NULL DEFAULT 0 CHECK (crypto_pct >= 0 AND crypto_pct <= 100),
    cash_pct INTEGER NOT NULL DEFAULT 0 CHECK (cash_pct >= 0 AND cash_pct <= 100),

    -- Calculated fields
    total_allocation_pct INTEGER GENERATED ALWAYS AS (
        equity_pct + us_equity_pct + debt_pct + gold_pct + reits_pct + crypto_pct + cash_pct
    ) STORED CHECK (total_allocation_pct = 100),

    expected_cagr_min DECIMAL(5, 2), -- e.g., 10.5
    expected_cagr_max DECIMAL(5, 2), -- e.g., 12.3

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- One allocation per user per goal type
    UNIQUE(user_id, goal_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_asset_allocations_user_id ON user_asset_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_asset_allocations_goal_type ON user_asset_allocations(goal_type);

-- Create updated_at trigger
CREATE TRIGGER update_user_asset_allocations_updated_at
BEFORE UPDATE ON user_asset_allocations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE user_asset_allocations IS 'Stores user-customized asset allocation percentages for each goal type (Short/Mid/Long-Term)';
COMMENT ON COLUMN user_asset_allocations.goal_type IS 'Type of goals this allocation applies to: Short-Term (1-3yr), Mid-Term (3-7yr), Long-Term (7+yr)';
COMMENT ON COLUMN user_asset_allocations.equity_pct IS 'Percentage allocated to Indian Equity (Equity Mutual Funds, Index Funds)';
COMMENT ON COLUMN user_asset_allocations.us_equity_pct IS 'Percentage allocated to US/International Equity (International Mutual Funds)';
COMMENT ON COLUMN user_asset_allocations.debt_pct IS 'Percentage allocated to Debt instruments (Debt Funds, Government Bonds, FDs)';
COMMENT ON COLUMN user_asset_allocations.gold_pct IS 'Percentage allocated to Gold (Gold ETFs, Sovereign Gold Bonds)';
COMMENT ON COLUMN user_asset_allocations.reits_pct IS 'Percentage allocated to Real Estate Investment Trusts (REIT Mutual Funds)';
COMMENT ON COLUMN user_asset_allocations.crypto_pct IS 'Percentage allocated to Cryptocurrency (Highly speculative, high volatility)';
COMMENT ON COLUMN user_asset_allocations.cash_pct IS 'Percentage allocated to Cash/Liquid instruments (Savings Account, Liquid Funds)';
COMMENT ON COLUMN user_asset_allocations.total_allocation_pct IS 'Auto-calculated total allocation percentage (must equal 100)';
COMMENT ON COLUMN user_asset_allocations.expected_cagr_min IS 'Calculated minimum expected CAGR based on user allocation (weighted average)';
COMMENT ON COLUMN user_asset_allocations.expected_cagr_max IS 'Calculated maximum expected CAGR based on user allocation (weighted average)';
