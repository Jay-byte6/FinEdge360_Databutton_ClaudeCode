-- Migration 007 - STEP 4: Create Triggers and Insert Sample Data
-- Run this AFTER Step 3 completes successfully

-- =============================
-- TRIGGER
-- =============================
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

-- =============================
-- SAMPLE SCHEME MAPPINGS
-- =============================
-- Insert popular mutual fund scheme mappings
-- These help with initial CAMS statement parsing
-- Scheme codes from MFAPI (https://api.mfapi.in)

INSERT INTO public.scheme_mappings (scheme_name, scheme_code, amc_name, is_verified, usage_count) VALUES
('SBI Bluechip Fund - Direct Plan - Growth', '119551', 'SBI Mutual Fund', true, 0),
('HDFC Index Fund-NIFTY 50 Plan - Direct Plan - Growth', '119600', 'HDFC Mutual Fund', true, 0),
('ICICI Prudential Bluechip Fund - Direct Plan - Growth', '120503', 'ICICI Prudential Mutual Fund', true, 0),
('Axis Bluechip Fund - Direct Plan - Growth', '120506', 'Axis Mutual Fund', true, 0),
('Parag Parikh Flexi Cap Fund - Direct Plan - Growth', '122639', 'PPFAS Mutual Fund', true, 0),
('Mirae Asset Large Cap Fund - Direct Plan - Growth', '125497', 'Mirae Asset Mutual Fund', true, 0),
('Kotak Flexicap Fund - Direct Plan - Growth', '118989', 'Kotak Mutual Fund', true, 0),
('Nippon India Small Cap Fund - Direct Plan - Growth', '120579', 'Nippon India Mutual Fund', true, 0),
('SBI Small Cap Fund - Direct Plan - Growth', '119597', 'SBI Mutual Fund', true, 0),
('HDFC Flexi Cap Fund - Direct Plan - Growth', '120505', 'HDFC Mutual Fund', true, 0)
ON CONFLICT (scheme_name, scheme_code) DO NOTHING;

-- =============================
-- COMPLETION MESSAGE
-- =============================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 007 completed successfully!';
  RAISE NOTICE 'Created 6 tables: portfolio_holdings, nav_history, portfolio_notifications,';
  RAISE NOTICE '                  uploaded_portfolio_files, nav_update_jobs, scheme_mappings';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create Supabase storage bucket: portfolio-uploads';
  RAISE NOTICE '2. Configure RLS policies for the storage bucket';
  RAISE NOTICE '3. Deploy backend APIs';
END $$;
