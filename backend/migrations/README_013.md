# Migration 013: Add NAV Last Fetched Timestamp

## Purpose
Add `nav_last_fetched_at` column to track when NAV was last fetched from MFAPI, providing users with transparency about data freshness.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `013_add_nav_last_fetched_at.sql`
5. Click **Run** to execute the migration

### Option 2: Supabase CLI
```bash
# From the backend directory
supabase db push --include-all
```

## Verification

After applying the migration, verify it worked:

```sql
-- Check that the column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'portfolio_holdings'
AND column_name = 'nav_last_fetched_at';

-- Should return:
-- column_name          | data_type
-- nav_last_fetched_at  | timestamp with time zone
```

## What Changed

1. **Added column**: `nav_last_fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
2. **Added index**: For efficient querying by last fetch time
3. **Backfilled data**: Existing rows set to `last_updated` value
4. **Backend updated**: NAV fetch now captures this timestamp
5. **Frontend updated**: Displays "Last updated: X hours ago" in portfolio table

## User Impact

Users will now see:
- **Before**: Only NAV date (e.g., "19 Dec 2025")
- **After**: NAV date + "Last updated: 2 hours ago"

This helps users understand data freshness and when to click "Refresh Data" button.

## Rollback (if needed)

```sql
-- Remove the column if you need to rollback
ALTER TABLE public.portfolio_holdings DROP COLUMN IF EXISTS nav_last_fetched_at;

-- Remove the index
DROP INDEX IF EXISTS idx_portfolio_holdings_nav_fetch;
```

## Next Steps

After applying this migration, you can:
1. Test by adding a new portfolio holding
2. Check that "Last updated" shows in the frontend table
3. Proceed with implementing the "Refresh Data" button (next feature)
