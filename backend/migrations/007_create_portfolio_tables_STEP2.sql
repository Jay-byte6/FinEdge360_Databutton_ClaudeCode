-- Migration 007 - STEP 2: Create Indexes
-- Run this AFTER Step 1 completes successfully

-- Indexes for portfolio_holdings
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_scheme_code ON public.portfolio_holdings(scheme_code);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_folio ON public.portfolio_holdings(folio_number);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_active ON public.portfolio_holdings(user_id, is_active);

-- Indexes for nav_history
CREATE INDEX IF NOT EXISTS idx_nav_history_holding_id ON public.nav_history(holding_id);
CREATE INDEX IF NOT EXISTS idx_nav_history_scheme_code ON public.nav_history(scheme_code);
CREATE INDEX IF NOT EXISTS idx_nav_history_date ON public.nav_history(nav_date DESC);

-- Indexes for portfolio_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.portfolio_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.portfolio_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.portfolio_notifications(created_at DESC);

-- Indexes for uploaded_portfolio_files
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_portfolio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON public.uploaded_portfolio_files(processing_status);

-- Indexes for nav_update_jobs
CREATE INDEX IF NOT EXISTS idx_nav_update_jobs_date ON public.nav_update_jobs(job_date DESC);

-- Indexes for scheme_mappings
CREATE INDEX IF NOT EXISTS idx_scheme_mappings_name ON public.scheme_mappings(scheme_name);
CREATE INDEX IF NOT EXISTS idx_scheme_mappings_code ON public.scheme_mappings(scheme_code);
