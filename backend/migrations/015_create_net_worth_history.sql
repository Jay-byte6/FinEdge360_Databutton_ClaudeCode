-- Migration 015: Create Net Worth History Table
-- Purpose: Track net worth changes over time for change indicators and graphs
-- Date: 2025-12-21

-- Create net_worth_history table
CREATE TABLE IF NOT EXISTS public.net_worth_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    net_worth DECIMAL(15, 2) NOT NULL,
    total_assets DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_liabilities DECIMAL(15, 2) NOT NULL DEFAULT 0,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one snapshot per user per day
    UNIQUE(user_id, snapshot_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_net_worth_history_user_date
ON public.net_worth_history(user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_net_worth_history_user_created
ON public.net_worth_history(user_id, created_at DESC);

-- Add RLS policies
ALTER TABLE public.net_worth_history ENABLE ROW LEVEL SECURITY;

-- Users can only read their own net worth history
CREATE POLICY "Users can view own net worth history"
ON public.net_worth_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own net worth snapshots
CREATE POLICY "Users can insert own net worth snapshots"
ON public.net_worth_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.net_worth_history IS 'Stores daily net worth snapshots for tracking changes over time';
COMMENT ON COLUMN public.net_worth_history.net_worth IS 'Total net worth (assets - liabilities) at snapshot time';
COMMENT ON COLUMN public.net_worth_history.total_assets IS 'Total assets at snapshot time';
COMMENT ON COLUMN public.net_worth_history.total_liabilities IS 'Total liabilities at snapshot time';
COMMENT ON COLUMN public.net_worth_history.snapshot_date IS 'Date of the snapshot (one per day per user)';

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 015 completed successfully!';
  RAISE NOTICE 'Created net_worth_history table with indexes and RLS policies';
  RAISE NOTICE 'Users can now track net worth changes over time';
END $$;
