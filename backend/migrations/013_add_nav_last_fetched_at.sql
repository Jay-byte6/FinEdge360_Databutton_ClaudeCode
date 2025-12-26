-- Migration 013: Add nav_last_fetched_at column to portfolio_holdings
-- Purpose: Track when NAV was last fetched from MFAPI for user transparency
-- Date: 2025-12-21

-- Add nav_last_fetched_at column to portfolio_holdings
ALTER TABLE public.portfolio_holdings
ADD COLUMN IF NOT EXISTS nav_last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_nav_fetch
ON public.portfolio_holdings(nav_last_fetched_at DESC);

-- Update existing rows to set nav_last_fetched_at to last_updated
UPDATE public.portfolio_holdings
SET nav_last_fetched_at = last_updated
WHERE nav_last_fetched_at IS NULL;

-- Add comment
COMMENT ON COLUMN public.portfolio_holdings.nav_last_fetched_at IS 'Timestamp when NAV was last fetched from MFAPI (for user transparency on data freshness)';

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 013 completed successfully!';
  RAISE NOTICE 'Added nav_last_fetched_at column to portfolio_holdings table';
  RAISE NOTICE 'Users can now see "Last updated: X hours ago" for NAV data';
END $$;
