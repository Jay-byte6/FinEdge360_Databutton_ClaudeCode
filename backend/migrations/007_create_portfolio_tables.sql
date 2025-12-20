-- Migration 007: Create Portfolio Holdings Tables
-- Purpose: Enable CAMS statement upload, mutual fund tracking, NAV updates, and 10% change notifications
-- Date: 2025-12-17

-- =======================
-- 1. PORTFOLIO HOLDINGS TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- CAMS Statement Data
  folio_number VARCHAR(50) NOT NULL,
  scheme_code VARCHAR(10) NOT NULL,  -- MFAPI scheme code
  scheme_name VARCHAR(255) NOT NULL,
  amc_name VARCHAR(100),  -- Asset Management Company

  -- Units & Cost
  unit_balance DECIMAL(18, 4) NOT NULL DEFAULT 0,
  avg_cost_per_unit DECIMAL(15, 4) NOT NULL DEFAULT 0,
  cost_value DECIMAL(15, 2) NOT NULL DEFAULT 0,  -- Total investment

  -- NAV Data
  current_nav DECIMAL(15, 4) NOT NULL DEFAULT 0,
  nav_date DATE NOT NULL,
  market_value DECIMAL(15, 2) NOT NULL DEFAULT 0,  -- Current worth

  -- Returns Calculation
  absolute_profit DECIMAL(15, 2) NOT NULL DEFAULT 0,  -- market_value - cost_value
  absolute_return_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0,
  xirr_percentage DECIMAL(10, 4),  -- Extended Internal Rate of Return

  -- Metadata
  is_active BOOLEAN DEFAULT true,  -- False if redeemed
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, folio_number, scheme_code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_scheme_code ON public.portfolio_holdings(scheme_code);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_folio ON public.portfolio_holdings(folio_number);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_active ON public.portfolio_holdings(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own portfolio holdings"
  ON public.portfolio_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio holdings"
  ON public.portfolio_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio holdings"
  ON public.portfolio_holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio holdings"
  ON public.portfolio_holdings FOR DELETE
  USING (auth.uid() = user_id);


-- =======================
-- 2. NAV HISTORY TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.nav_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE,
  scheme_code VARCHAR(10) NOT NULL,

  -- NAV Snapshot
  nav_value DECIMAL(15, 4) NOT NULL,
  nav_date DATE NOT NULL,

  -- Value at this NAV
  units DECIMAL(18, 4) NOT NULL,
  market_value DECIMAL(15, 2) NOT NULL,
  profit_loss DECIMAL(15, 2) NOT NULL,
  return_percentage DECIMAL(10, 4) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(holding_id, nav_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nav_history_holding_id ON public.nav_history(holding_id);
CREATE INDEX IF NOT EXISTS idx_nav_history_scheme_code ON public.nav_history(scheme_code);
CREATE INDEX IF NOT EXISTS idx_nav_history_date ON public.nav_history(nav_date DESC);

-- RLS Policies (access through holding_id relationship)
ALTER TABLE public.nav_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own NAV history"
  ON public.nav_history FOR SELECT
  USING (
    holding_id IN (
      SELECT id FROM public.portfolio_holdings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own NAV history"
  ON public.nav_history FOR INSERT
  WITH CHECK (
    holding_id IN (
      SELECT id FROM public.portfolio_holdings WHERE user_id = auth.uid()
    )
  );


-- =======================
-- 3. PORTFOLIO NOTIFICATIONS TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.portfolio_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE,

  -- Notification Details
  notification_type VARCHAR(50) NOT NULL,  -- 'GAIN_10_PERCENT', 'LOSS_10_PERCENT', 'NAV_UPDATE_FAILED'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Trigger Data
  folio_number VARCHAR(50),
  scheme_name VARCHAR(255),
  change_percentage DECIMAL(10, 2),
  old_value DECIMAL(15, 2),
  new_value DECIMAL(15, 2),

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.portfolio_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.portfolio_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.portfolio_notifications(created_at DESC);

-- RLS Policies
ALTER TABLE public.portfolio_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.portfolio_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.portfolio_notifications FOR UPDATE
  USING (auth.uid() = user_id);


-- =======================
-- 4. UPLOADED FILES TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.uploaded_portfolio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Info
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL,  -- 'PDF' or 'XLSX'
  file_size INTEGER NOT NULL,
  file_url TEXT,  -- Supabase storage URL

  -- Processing Status
  processing_status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, PROCESSING, COMPLETED, FAILED
  error_message TEXT,

  -- Extracted Data Summary
  folios_extracted INTEGER DEFAULT 0,
  holdings_created INTEGER DEFAULT 0,
  total_investment DECIMAL(15, 2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_portfolio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON public.uploaded_portfolio_files(processing_status);

-- RLS Policies
ALTER TABLE public.uploaded_portfolio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploaded files"
  ON public.uploaded_portfolio_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploaded files"
  ON public.uploaded_portfolio_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- =======================
-- 5. NAV UPDATE JOBS TABLE
-- =======================
CREATE TABLE IF NOT EXISTS public.nav_update_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job Metadata
  job_date DATE NOT NULL,
  job_status VARCHAR(50) DEFAULT 'RUNNING',  -- RUNNING, COMPLETED, FAILED
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Statistics
  total_schemes_to_update INTEGER DEFAULT 0,
  schemes_updated_successfully INTEGER DEFAULT 0,
  schemes_failed INTEGER DEFAULT 0,
  notifications_created INTEGER DEFAULT 0,

  error_log TEXT,

  UNIQUE(job_date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_nav_update_jobs_date ON public.nav_update_jobs(job_date DESC);

-- RLS: No RLS needed - admin/system table


-- =======================
-- 6. SCHEME MAPPINGS TABLE (for CAMS scheme name to MFAPI code mapping)
-- =======================
CREATE TABLE IF NOT EXISTS public.scheme_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Mapping Data
  scheme_name VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(10) NOT NULL,
  amc_name VARCHAR(100),

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(scheme_name, scheme_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheme_mappings_name ON public.scheme_mappings(scheme_name);
CREATE INDEX IF NOT EXISTS idx_scheme_mappings_code ON public.scheme_mappings(scheme_code);

-- RLS: Public read access for scheme mappings
ALTER TABLE public.scheme_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheme mappings"
  ON public.scheme_mappings FOR SELECT
  TO public
  USING (true);


-- =======================
-- TRIGGERS
-- =======================

-- Auto-update last_updated timestamp on portfolio_holdings
CREATE OR REPLACE FUNCTION update_portfolio_holdings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_holdings_timestamp
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_holdings_timestamp();


-- =======================
-- INITIAL DATA (Sample Scheme Mappings)
-- =======================

-- Insert some popular mutual fund scheme mappings
-- These will help with initial CAMS statement parsing
-- Scheme codes from MFAPI (https://api.mfapi.in)

INSERT INTO public.scheme_mappings (scheme_name, scheme_code, amc_name, is_verified, usage_count) VALUES
('SBI Bluechip Fund - Direct Plan - Growth', '119551', 'SBI Mutual Fund', true, 0),
('HDFC Index Fund-NIFTY 50 Plan - Direct Plan - Growth', '119600', 'HDFC Mutual Fund', true, 0),
('ICICI Prudential Bluechip Fund - Direct Plan - Growth', '120503', 'ICICI Prudential Mutual Fund', true, 0),
('Axis Bluechip Fund - Direct Plan - Growth', '120506', 'Axis Mutual Fund', true, 0),
('Parag Parikh Flexi Cap Fund - Direct Plan - Growth', '122639', 'PPFAS Mutual Fund', true, 0),
('Mirae Asset Large Cap Fund - Direct Plan - Growth', '125497', 'Mirae Asset Mutual Fund', true, 0),
('Kotak Flexicap Fund - Direct Plan - Growth', '118989', 'Kotak Mutual Fund', true, 0),
('Nippon India Small Cap Fund - Direct Plan - Growth', '120579', 'Nippon India Mutual Fund', true, 0)
ON CONFLICT (scheme_name, scheme_code) DO NOTHING;


-- =======================
-- COMMENTS
-- =======================

COMMENT ON TABLE public.portfolio_holdings IS 'Stores user mutual fund holdings from CAMS statements with current NAV and return calculations';
COMMENT ON TABLE public.nav_history IS 'Historical NAV snapshots for tracking portfolio performance over time';
COMMENT ON TABLE public.portfolio_notifications IS 'Notification system for 10%+ portfolio value changes';
COMMENT ON TABLE public.uploaded_portfolio_files IS 'Tracks uploaded CAMS PDF/Excel files and processing status';
COMMENT ON TABLE public.nav_update_jobs IS 'Monitors daily NAV update job execution and statistics';
COMMENT ON TABLE public.scheme_mappings IS 'Maps CAMS scheme names to MFAPI scheme codes for NAV fetching';


-- =======================
-- COMPLETION MESSAGE
-- =======================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 007 completed successfully!';
  RAISE NOTICE 'Created tables: portfolio_holdings, nav_history, portfolio_notifications, uploaded_portfolio_files, nav_update_jobs, scheme_mappings';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create Supabase storage bucket: portfolio-uploads';
  RAISE NOTICE '2. Configure RLS policies for the bucket';
  RAISE NOTICE '3. Deploy backend APIs for file upload and NAV tracking';
END $$;
