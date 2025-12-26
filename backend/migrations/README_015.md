# Migration 015: Net Worth History Tracking

## Purpose
Create a table to store daily net worth snapshots for:
- **Change indicators** (e.g., "↑ +₹50,000 (+5.2%) from last snapshot")
- **Historical graphs** showing net worth trends over time
- **FIRE progress tracking** over weeks/months

## How to Apply

### Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `015_create_net_worth_history.sql`
5. Click **Run** to execute the migration

## What Changed

### New Table: `net_worth_history`

Stores one snapshot per user per day:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User reference |
| `net_worth` | DECIMAL | Total net worth at snapshot time |
| `total_assets` | DECIMAL | Total assets at snapshot time |
| `total_liabilities` | DECIMAL | Total liabilities at snapshot time |
| `snapshot_date` | DATE | Date of snapshot (unique per user) |
| `created_at` | TIMESTAMP | When snapshot was created |

**Constraints:**
- `UNIQUE(user_id, snapshot_date)` - One snapshot per user per day
- Foreign key to `auth.users(id)` with CASCADE delete

**Indexes:**
- `idx_net_worth_history_user_date` - Fast queries by user and date
- `idx_net_worth_history_user_created` - Fast queries by creation time

**RLS Policies:**
- Users can only view their own snapshots
- Users can insert their own snapshots

## How It Works

### Automatic Snapshot Creation
When user visits Net Worth page:
1. Backend checks if snapshot exists for today
2. If not, creates new snapshot with current net worth
3. Compares with previous snapshot to show change

### Change Calculation
```sql
-- Get latest 2 snapshots
SELECT net_worth, snapshot_date
FROM net_worth_history
WHERE user_id = :user_id
ORDER BY snapshot_date DESC
LIMIT 2
```

If 2 snapshots exist:
- `change_amount = current_net_worth - previous_net_worth`
- `change_percentage = (change_amount / previous_net_worth) * 100`

### Example Display
```
┌─────────────────────────────────────────────────┐
│ 📈 Your net worth increased by ₹50,000 (+5.2%) │
│    since last snapshot (7 days ago)             │
└─────────────────────────────────────────────────┘
```

## Verification

After applying the migration:

```sql
-- Check table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'net_worth_history';

-- Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename = 'net_worth_history';

-- Check RLS policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'net_worth_history';
```

## Rollback (if needed)

```sql
-- Remove table and all data
DROP TABLE IF EXISTS public.net_worth_history CASCADE;
```

## Next Steps

1. **Apply this migration** in Supabase dashboard
2. **Implement backend endpoint** to create/fetch snapshots
3. **Create frontend banner** to display net worth change
4. **Test with sample data** - create snapshots manually then view change

## Sample Data (for testing)

```sql
-- Insert test snapshots (replace :user_id with your actual user UUID)
INSERT INTO net_worth_history (user_id, net_worth, total_assets, total_liabilities, snapshot_date)
VALUES
  (:user_id, 1000000, 1500000, 500000, CURRENT_DATE - INTERVAL '7 days'),
  (:user_id, 1050000, 1550000, 500000, CURRENT_DATE);

-- Verify change calculation
WITH snapshots AS (
  SELECT net_worth, snapshot_date,
         LAG(net_worth) OVER (ORDER BY snapshot_date) as prev_net_worth
  FROM net_worth_history
  WHERE user_id = :user_id
  ORDER BY snapshot_date DESC
  LIMIT 1
)
SELECT
  net_worth as current,
  prev_net_worth as previous,
  (net_worth - prev_net_worth) as change_amount,
  ROUND(((net_worth - prev_net_worth) / prev_net_worth * 100), 2) as change_pct
FROM snapshots;

-- Should return: current=1050000, previous=1000000, change_amount=50000, change_pct=5.00
```

## Benefits

1. **User Motivation** - See progress over time
2. **FIRE Tracking** - Monitor journey to financial independence
3. **Historical Insights** - Understand financial trends
4. **Graph Data** - Visualize net worth growth
5. **Milestone Celebrations** - Celebrate hitting targets
