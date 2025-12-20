-- Migration 007 - STEP 1: Create Basic Tables Only
-- Run this first, then check for errors before proceeding to Step 2

-- 1. PORTFOLIO HOLDINGS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  folio_number VARCHAR(50) NOT NULL,
  scheme_code VARCHAR(10) NOT NULL,
  scheme_name VARCHAR(255) NOT NULL,
  amc_name VARCHAR(100),

  unit_balance DECIMAL(18, 4) NOT NULL DEFAULT 0,
  avg_cost_per_unit DECIMAL(15, 4) NOT NULL DEFAULT 0,
  cost_value DECIMAL(15, 2) NOT NULL DEFAULT 0,

  current_nav DECIMAL(15, 4) NOT NULL DEFAULT 0,
  nav_date DATE NOT NULL,
  market_value DECIMAL(15, 2) NOT NULL DEFAULT 0,

  absolute_profit DECIMAL(15, 2) NOT NULL DEFAULT 0,
  absolute_return_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0,
  xirr_percentage DECIMAL(10, 4),

  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, folio_number, scheme_code)
);

-- 2. NAV HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.nav_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE,
  scheme_code VARCHAR(10) NOT NULL,

  nav_value DECIMAL(15, 4) NOT NULL,
  nav_date DATE NOT NULL,

  units DECIMAL(18, 4) NOT NULL,
  market_value DECIMAL(15, 2) NOT NULL,
  profit_loss DECIMAL(15, 2) NOT NULL,
  return_percentage DECIMAL(10, 4) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(holding_id, nav_date)
);

-- 3. PORTFOLIO NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE,

  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  folio_number VARCHAR(50),
  scheme_name VARCHAR(255),
  change_percentage DECIMAL(10, 2),
  old_value DECIMAL(15, 2),
  new_value DECIMAL(15, 2),

  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- 4. UPLOADED FILES TABLE
CREATE TABLE IF NOT EXISTS public.uploaded_portfolio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,

  processing_status VARCHAR(50) DEFAULT 'PENDING',
  error_message TEXT,

  folios_extracted INTEGER DEFAULT 0,
  holdings_created INTEGER DEFAULT 0,
  total_investment DECIMAL(15, 2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. NAV UPDATE JOBS TABLE
CREATE TABLE IF NOT EXISTS public.nav_update_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  job_date DATE NOT NULL,
  job_status VARCHAR(50) DEFAULT 'RUNNING',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  total_schemes_to_update INTEGER DEFAULT 0,
  schemes_updated_successfully INTEGER DEFAULT 0,
  schemes_failed INTEGER DEFAULT 0,
  notifications_created INTEGER DEFAULT 0,

  error_log TEXT,

  UNIQUE(job_date)
);

-- 6. SCHEME MAPPINGS TABLE
CREATE TABLE IF NOT EXISTS public.scheme_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scheme_name VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(10) NOT NULL,
  amc_name VARCHAR(100),

  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,

  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(scheme_name, scheme_code)
);
