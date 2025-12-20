-- CLEANUP: Drop all portfolio tables if they exist
-- Run this FIRST to clean up any incomplete previous attempts
-- WARNING: This will delete all data in these tables!

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.nav_history CASCADE;
DROP TABLE IF EXISTS public.portfolio_notifications CASCADE;
DROP TABLE IF EXISTS public.uploaded_portfolio_files CASCADE;
DROP TABLE IF EXISTS public.nav_update_jobs CASCADE;
DROP TABLE IF EXISTS public.scheme_mappings CASCADE;
DROP TABLE IF EXISTS public.portfolio_holdings CASCADE;

-- Drop function if exists
DROP FUNCTION IF EXISTS update_portfolio_holdings_timestamp() CASCADE;

-- Verify cleanup
DO $$
BEGIN
  RAISE NOTICE '✅ Cleanup completed!';
  RAISE NOTICE 'All portfolio tables have been dropped.';
  RAISE NOTICE 'You can now run Step 1 fresh.';
END $$;
