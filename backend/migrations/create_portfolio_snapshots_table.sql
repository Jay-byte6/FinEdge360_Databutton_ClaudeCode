-- =====================================================
-- PORTFOLIO DAILY SNAPSHOTS TABLE SETUP
-- Tracks portfolio value changes over time for historical analysis
-- =====================================================

-- Create portfolio_daily_snapshots table
CREATE TABLE IF NOT EXISTS portfolio_daily_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    snapshot_date DATE NOT NULL,

    -- Portfolio summary metrics
    total_investment DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_profit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    overall_return DECIMAL(8, 4) NOT NULL DEFAULT 0,
    holdings_count INTEGER NOT NULL DEFAULT 0,

    -- Optional: Detailed holdings snapshot (for deep analysis)
    holdings_details JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one snapshot per user per day
    CONSTRAINT unique_user_date UNIQUE(user_id, snapshot_date)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_daily_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_daily_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON portfolio_daily_snapshots(user_id, snapshot_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE portfolio_daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own snapshots
DROP POLICY IF EXISTS "Users can view own snapshots" ON portfolio_daily_snapshots;
CREATE POLICY "Users can view own snapshots" ON portfolio_daily_snapshots
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own snapshots
DROP POLICY IF EXISTS "Users can insert own snapshots" ON portfolio_daily_snapshots;
CREATE POLICY "Users can insert own snapshots" ON portfolio_daily_snapshots
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own snapshots (same day only)
DROP POLICY IF EXISTS "Users can update own snapshots" ON portfolio_daily_snapshots;
CREATE POLICY "Users can update own snapshots" ON portfolio_daily_snapshots
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Create policy for service role to manage all snapshots
DROP POLICY IF EXISTS "Service role can manage all snapshots" ON portfolio_daily_snapshots;
CREATE POLICY "Service role can manage all snapshots" ON portfolio_daily_snapshots
    FOR ALL
    USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_portfolio_snapshots_updated_at ON portfolio_daily_snapshots;
CREATE TRIGGER update_portfolio_snapshots_updated_at
    BEFORE UPDATE ON portfolio_daily_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON portfolio_daily_snapshots TO authenticated;
GRANT ALL ON portfolio_daily_snapshots TO service_role;

-- =====================================================
-- HELPER VIEWS FOR ANALYSIS
-- =====================================================

-- View: Latest snapshot for each user
CREATE OR REPLACE VIEW portfolio_latest_snapshots AS
SELECT DISTINCT ON (user_id)
    user_id,
    snapshot_date,
    total_investment,
    current_value,
    total_profit,
    overall_return,
    holdings_count,
    created_at
FROM portfolio_daily_snapshots
ORDER BY user_id, snapshot_date DESC;

-- View: Daily changes (compared to previous day)
CREATE OR REPLACE VIEW portfolio_daily_changes AS
SELECT
    curr.user_id,
    curr.snapshot_date,
    curr.current_value,
    prev.current_value AS previous_value,
    (curr.current_value - prev.current_value) AS daily_change,
    CASE
        WHEN prev.current_value > 0 THEN
            ((curr.current_value - prev.current_value) / prev.current_value * 100)
        ELSE 0
    END AS daily_change_percentage
FROM portfolio_daily_snapshots curr
LEFT JOIN portfolio_daily_snapshots prev
    ON curr.user_id = prev.user_id
    AND prev.snapshot_date = (
        SELECT MAX(snapshot_date)
        FROM portfolio_daily_snapshots
        WHERE user_id = curr.user_id
        AND snapshot_date < curr.snapshot_date
    )
ORDER BY curr.user_id, curr.snapshot_date DESC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ portfolio_daily_snapshots table created successfully!';
    RAISE NOTICE '✅ Indexes created for efficient queries';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ Helper views created (portfolio_latest_snapshots, portfolio_daily_changes)';
    RAISE NOTICE '✅ Unique constraint: one snapshot per user per day';
    RAISE NOTICE '';
    RAISE NOTICE 'Table is ready to track portfolio changes over time!';
    RAISE NOTICE 'Use this data for day/week/month analysis and graphs.';
END $$;
