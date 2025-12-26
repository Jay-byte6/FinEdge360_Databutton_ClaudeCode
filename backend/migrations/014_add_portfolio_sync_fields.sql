-- Migration 014: Add Portfolio Sync Control Fields
-- Purpose: Enable user-controlled portfolio-to-net worth syncing without overwriting manual entries
-- Date: 2025-12-21

-- Add portfolio sync control fields to assets_liabilities table
ALTER TABLE public.assets_liabilities
ADD COLUMN IF NOT EXISTS portfolio_sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mutual_funds_manual_value DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS mutual_funds_portfolio_value DECIMAL(15, 2) DEFAULT 0;

-- Migrate existing data: Move current mutual_funds_value to manual_value
-- This preserves user's existing manual entries
UPDATE public.assets_liabilities
SET mutual_funds_manual_value = COALESCE(mutual_funds_value, 0),
    mutual_funds_portfolio_value = 0
WHERE mutual_funds_manual_value IS NULL;

-- Add comments
COMMENT ON COLUMN public.assets_liabilities.portfolio_sync_enabled IS 'If true, mutual_funds_value uses portfolio_value; if false, uses manual_value';
COMMENT ON COLUMN public.assets_liabilities.mutual_funds_manual_value IS 'User-entered mutual fund value (used when portfolio_sync_enabled = false)';
COMMENT ON COLUMN public.assets_liabilities.mutual_funds_portfolio_value IS 'Auto-calculated value from portfolio_holdings (used when portfolio_sync_enabled = true)';

-- Update the mutual_funds_value calculation logic:
-- If portfolio sync is enabled, use portfolio value; otherwise use manual value
-- This is now handled in the backend, but we set a default here
UPDATE public.assets_liabilities
SET mutual_funds_value = CASE
  WHEN portfolio_sync_enabled THEN COALESCE(mutual_funds_portfolio_value, 0)
  ELSE COALESCE(mutual_funds_manual_value, 0)
END;

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 014 completed successfully!';
  RAISE NOTICE 'Added portfolio sync control fields to assets_liabilities';
  RAISE NOTICE 'Existing mutual_funds_value preserved as mutual_funds_manual_value';
  RAISE NOTICE 'portfolio_sync_enabled defaults to FALSE (no auto-sync until user enables)';
END $$;
