# Migration 014: Portfolio-to-Net Worth Sync Control

## Purpose
Enable user-controlled portfolio-to-net worth syncing **WITHOUT overwriting existing manual entries**. This gives users the choice to auto-sync portfolio values or maintain manual control.

## Problem Solved
**Before**: When portfolio sync ran, it would **replace** `mutual_funds_value` in `assets_liabilities`, destroying any manual entries the user had made.

**After**: Users can toggle sync on/off. Manual entries are preserved and can be restored anytime.

## How to Apply

### Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `014_add_portfolio_sync_fields.sql`
5. Click **Run** to execute the migration

## What Changed

### Database Changes
Added 3 new columns to `assets_liabilities` table:

1. **`portfolio_sync_enabled`** (BOOLEAN, default: `false`)
   - Controls whether portfolio auto-syncs to net worth
   - User must explicitly enable this toggle

2. **`mutual_funds_manual_value`** (DECIMAL)
   - Stores user's manual entry for mutual funds
   - Preserved when switching between sync modes

3. **`mutual_funds_portfolio_value`** (DECIMAL)
   - Auto-calculated sum of `portfolio_holdings.market_value`
   - Always updated, but only applied when sync is enabled

### Backend Changes

**Updated Function: `update_net_worth_from_portfolio()`**
- Now checks `portfolio_sync_enabled` flag
- If **ENABLED**: Sets `mutual_funds_value = portfolio_total`
- If **DISABLED**: Sets `mutual_funds_value = manual_value` (preserves user entry)
- Always updates `mutual_funds_portfolio_value` (for transparency)

**New Endpoints:**

1. **GET `/routes/portfolio-sync-status/{user_id}`**
   - Returns current sync status and all 3 values
   - Response:
     ```json
     {
       "sync_enabled": false,
       "mutual_funds_value": 50000,
       "manual_value": 50000,
       "portfolio_value": 137234
     }
     ```

2. **POST `/routes/toggle-portfolio-sync`**
   - Toggles sync on/off
   - Request:
     ```json
     {
       "user_id": "xxx",
       "enabled": true
     }
     ```
   - Handles value transitions:
     - **Enabling sync**: Saves current manual value, switches to portfolio value
     - **Disabling sync**: Preserves current value as manual entry

## User Flow Examples

### Scenario 1: User with Manual Entry Enables Sync
**Initial State:**
- Manual entry: ₹50,000
- Portfolio value: ₹137,234 (calculated from holdings)
- Sync: OFF

**User clicks "Enable Sync":**
1. System saves ₹50,000 to `mutual_funds_manual_value`
2. System sets `mutual_funds_value = ₹137,234` (portfolio total)
3. Net worth now shows ₹137,234
4. Manual entry ₹50,000 is **preserved** for future use

**User clicks "Disable Sync":**
1. System keeps current value (₹137,234) as manual entry
2. User can now edit it manually in Net Worth page

### Scenario 2: User with No Prior Entry
**Initial State:**
- No manual entry (₹0)
- Portfolio value: ₹100,000
- Sync: OFF

**User enables sync:**
1. `mutual_funds_value` updates to ₹100,000
2. Automatic updates when portfolio changes

**User adds/deletes portfolio holdings:**
- If sync ON: Net worth auto-updates
- If sync OFF: Net worth stays manual, portfolio value tracked separately

## Verification

After applying migration:

```sql
-- Check new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'assets_liabilities'
AND column_name IN ('portfolio_sync_enabled', 'mutual_funds_manual_value', 'mutual_funds_portfolio_value');

-- Expected output:
-- portfolio_sync_enabled      | boolean  | false
-- mutual_funds_manual_value   | numeric  | NULL
-- mutual_funds_portfolio_value| numeric  | 0

-- Verify existing data was preserved
SELECT
  user_id,
  mutual_funds_value,
  mutual_funds_manual_value,
  portfolio_sync_enabled
FROM assets_liabilities
LIMIT 5;

-- Should show:
-- - mutual_funds_manual_value = mutual_funds_value (existing entries preserved)
-- - portfolio_sync_enabled = false (default, no auto-sync)
```

## Benefits

1. **No Data Loss**: Existing manual entries are **never overwritten**
2. **User Control**: Sync is **opt-in**, defaults to OFF
3. **Transparency**: Both manual and portfolio values are visible
4. **Flexibility**: Users can switch between modes anytime
5. **Auditability**: Clear separation of manual vs auto-calculated values

## Rollback (if needed)

```sql
-- Remove new columns
ALTER TABLE public.assets_liabilities
DROP COLUMN IF EXISTS portfolio_sync_enabled,
DROP COLUMN IF EXISTS mutual_funds_manual_value,
DROP COLUMN IF EXISTS mutual_funds_portfolio_value;

-- Note: This will lose the sync settings but preserve mutual_funds_value
```

## Frontend Integration (Next Step)

After migration, implement:
1. **Toggle Switch** in Portfolio page: "Auto-sync to Net Worth"
2. **Status Indicator**: "Synced ✓" or "Manual Entry"
3. **Value Comparison**: Show both portfolio and net worth values side-by-side
4. **Warning Dialog**: When enabling sync, warn user that net worth will update

## Testing Checklist

- [ ] Apply migration in Supabase
- [ ] Verify existing `mutual_funds_value` preserved as `mutual_funds_manual_value`
- [ ] Test GET `/routes/portfolio-sync-status/{user_id}` endpoint
- [ ] Test POST `/routes/toggle-portfolio-sync` with `enabled: true`
- [ ] Verify portfolio value replaces manual value when sync enabled
- [ ] Add a portfolio holding, verify auto-sync updates net worth (if enabled)
- [ ] Toggle sync OFF, verify manual value is preserved
- [ ] Delete a holding, verify net worth updates (if sync ON) or stays same (if OFF)

## Next Steps

1. **Apply Migration 014** in Supabase dashboard
2. **Implement Frontend Toggle** (Portfolio page UI)
3. **Test with Real User**: Add holdings, toggle sync, verify net worth
4. **Add to User Guide**: Document the sync toggle feature
