# Portfolio Daily Tracking System

## Overview
Automatically tracks portfolio value changes every day and stores historical data for analysis, graphs, and insights.

---

## What Was Created

### 1. Database Table ✅
**File**: `backend/migrations/create_portfolio_snapshots_table.sql`

**Table**: `portfolio_daily_snapshots`
- Stores daily portfolio value snapshots
- One snapshot per user per day (unique constraint)
- Includes helper views for analysis

**Columns**:
- `user_id` - User identifier
- `snapshot_date` - Date of snapshot (YYYY-MM-DD)
- `total_investment` - Total invested amount
- `current_value` - Current portfolio value
- `total_profit` - Total profit/loss
- `overall_return` - Return percentage
- `holdings_count` - Number of holdings
- `holdings_details` - Optional detailed holdings data (JSONB)

**Helper Views**:
- `portfolio_latest_snapshots` - Latest snapshot for each user
- `portfolio_daily_changes` - Daily changes compared to previous day

---

### 2. Backend API ✅
**File**: `backend/app/apis/portfolio_snapshots/__init__.py`

**Endpoints**:
1. `POST /routes/portfolio-snapshots` - Save/update daily snapshot
2. `GET /routes/portfolio-snapshots/{user_id}` - Get historical snapshots
3. `GET /routes/portfolio-snapshots/{user_id}/daily-change` - Get today vs yesterday
4. `GET /routes/portfolio-snapshots/{user_id}/weekly` - Get weekly aggregated data
5. `GET /routes/portfolio-snapshots/{user_id}/monthly` - Get monthly aggregated data
6. `DELETE /routes/portfolio-snapshots/{user_id}` - Delete all user snapshots

---

### 3. Frontend Utilities ✅
**File**: `frontend/src/utils/portfolioSnapshotTracker.ts`

**Functions**:
- `savePortfolioSnapshot()` - Manually save a snapshot
- `hasSnapshotForToday()` - Check if already saved today
- `getDailyChange()` - Get daily change data
- `getPortfolioHistory()` - Get historical snapshots (days)
- `getWeeklySnapshots()` - Get weekly snapshots
- `getMonthlySnapshots()` - Get monthly snapshots
- `autoSaveSnapshot()` - Auto-save with duplicate prevention

---

### 4. Automatic Tracking ✅
**File**: `frontend/src/utils/portfolioStore.ts`

**How it works**:
- When `fetchHoldings()` is called, it automatically saves a snapshot
- Uses `autoSaveSnapshot()` to prevent duplicate saves
- Runs in background (doesn't block UI)
- Only saves if user has portfolio holdings

**Integration**: `Dashboard.tsx`
- Fetches daily change on load
- Displays change in Today's Insights card
- Shows green/red indicators for profit/loss

---

## How It Works

### Automatic Daily Tracking

```typescript
// User visits Dashboard → Portfolio is fetched
fetchHoldings(userId)
  ↓
// After successful fetch, auto-save snapshot
autoSaveSnapshot(userId, summary, holdings)
  ↓
// Check: Already saved today?
hasSnapshotForToday(userId)
  ↓
// If NO → Save to database
POST /routes/portfolio-snapshots
  ↓
// Store in portfolio_daily_snapshots table
```

### Displaying Daily Change

```typescript
// Dashboard loads
useEffect(() => {
  getDailyChange(userId)
    ↓
  // Returns: { daily_change: +5000, daily_change_percentage: +2.5 }
    ↓
  // Display in Today's Insights card
  <DailyInsightsCard portfolioChange={5000} />
})
```

---

## Setup Instructions

### Step 1: Create Database Table

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your FIREMap project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Migration**
   - Open: `backend/migrations/create_portfolio_snapshots_table.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" (or Ctrl+Enter)

4. **Verify Success**
   - Go to "Table Editor"
   - You should see `portfolio_daily_snapshots` table
   - Verify columns and indexes

### Step 2: Test Automatic Tracking

1. **Login to FIREMap**
2. **Upload CAMS statement** (or have existing portfolio)
3. **Visit Dashboard**
   - Portfolio is automatically fetched
   - Snapshot is automatically saved
4. **Check Database**
   - Go to Supabase Table Editor
   - Open `portfolio_daily_snapshots`
   - Verify today's snapshot exists

### Step 3: Verify Daily Change

1. **Next day, visit Dashboard again**
2. **Check Today's Insights card**
3. **Should show**:
   - Portfolio value
   - Total profit/loss
   - Daily change (green/red indicator)

---

## Usage Examples

### Get Daily Change

```typescript
import { getDailyChange } from '@/utils/portfolioSnapshotTracker';

const changeData = await getDailyChange(userId);

if (changeData.has_data) {
  console.log('Daily Change:', changeData.daily_change); // +5000
  console.log('Percentage:', changeData.daily_change_percentage); // +2.5%
}
```

### Get Historical Data (Last 30 Days)

```typescript
import { getPortfolioHistory } from '@/utils/portfolioSnapshotTracker';

const snapshots = await getPortfolioHistory(userId, 30);

// Use for charts/graphs
snapshots.forEach(snapshot => {
  console.log(snapshot.snapshot_date, snapshot.current_value);
});
```

### Get Weekly Aggregated Data

```typescript
import { getWeeklySnapshots } from '@/utils/portfolioSnapshotTracker';

const weeklyData = await getWeeklySnapshots(userId, 12); // Last 12 weeks

// Returns last snapshot of each week
weeklyData.forEach(snapshot => {
  console.log(`Week ending ${snapshot.snapshot_date}: ₹${snapshot.current_value}`);
});
```

### Get Monthly Aggregated Data

```typescript
import { getMonthlySnapshots } from '@/utils/portfolioSnapshotTracker';

const monthlyData = await getMonthlySnapshots(userId, 12); // Last 12 months

// Returns last snapshot of each month
monthlyData.forEach(snapshot => {
  console.log(`${snapshot.snapshot_date}: ₹${snapshot.current_value}`);
});
```

---

## API Reference

### Save Snapshot

```bash
POST /routes/portfolio-snapshots

Body:
{
  "user_id": "user-123",
  "snapshot_date": "2025-12-27",
  "total_investment": 100000,
  "current_value": 105000,
  "total_profit": 5000,
  "overall_return": 5.0,
  "holdings_count": 5,
  "holdings_details": { ... }  // Optional
}

Response:
{
  "success": true,
  "message": "Portfolio snapshot saved successfully",
  "snapshot_date": "2025-12-27"
}
```

### Get Daily Change

```bash
GET /routes/portfolio-snapshots/{user_id}/daily-change

Response:
{
  "success": true,
  "has_data": true,
  "daily_change": 5000,
  "daily_change_percentage": 2.5,
  "today": {
    "date": "2025-12-27",
    "current_value": 105000,
    "total_profit": 5000,
    "overall_return": 5.0
  },
  "yesterday": {
    "date": "2025-12-26",
    "current_value": 100000,
    "total_profit": 0,
    "overall_return": 0
  }
}
```

### Get Historical Snapshots

```bash
GET /routes/portfolio-snapshots/{user_id}?days=30

Response:
{
  "success": true,
  "user_id": "user-123",
  "snapshots": [
    {
      "snapshot_date": "2025-12-27",
      "total_investment": 100000,
      "current_value": 105000,
      "total_profit": 5000,
      "overall_return": 5.0,
      "holdings_count": 5
    },
    ...
  ],
  "count": 30
}
```

---

## Data Analysis Use Cases

### 1. Performance Charts
Use daily/weekly/monthly snapshots to create line charts showing portfolio growth over time.

### 2. Volatility Analysis
Calculate standard deviation of daily changes to measure portfolio volatility.

### 3. Return Comparison
Compare returns across different time periods (7D, 30D, 90D, 1Y).

### 4. Goal Progress Tracking
Track how portfolio value is progressing towards FIRE goals.

### 5. Best/Worst Days
Identify days with highest gains/losses for pattern analysis.

---

## Database Queries for Analysis

### Get Last 7 Days Performance

```sql
SELECT
  snapshot_date,
  current_value,
  total_profit,
  overall_return
FROM portfolio_daily_snapshots
WHERE user_id = 'user-123'
  AND snapshot_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY snapshot_date DESC;
```

### Calculate 30-Day Return

```sql
SELECT
  (latest.current_value - oldest.current_value) / oldest.current_value * 100 AS return_30d
FROM
  (SELECT current_value FROM portfolio_daily_snapshots
   WHERE user_id = 'user-123' ORDER BY snapshot_date DESC LIMIT 1) latest,
  (SELECT current_value FROM portfolio_daily_snapshots
   WHERE user_id = 'user-123'
   AND snapshot_date = CURRENT_DATE - INTERVAL '30 days') oldest;
```

### Average Weekly Growth

```sql
SELECT
  AVG(current_value - LAG(current_value) OVER (ORDER BY snapshot_date)) AS avg_weekly_growth
FROM portfolio_daily_snapshots
WHERE user_id = 'user-123'
  AND EXTRACT(DOW FROM snapshot_date) = 0  -- Sundays only
ORDER BY snapshot_date;
```

---

## Future Enhancements

### 1. Automated Daily Job
Set up a cron job or scheduled task to automatically save snapshots at 6 PM every day (after NAV updates).

### 2. Performance Analytics Dashboard
Create a dedicated analytics page showing:
- Line charts (daily, weekly, monthly)
- Return comparisons (7D, 30D, 90D, 1Y)
- Volatility metrics
- Best/worst performing periods

### 3. Email Reports
Send weekly/monthly performance reports via email with charts.

### 4. Goal Progress Alerts
Notify users when portfolio reaches milestone percentages towards their goals.

### 5. AI Insights
Use historical data to provide AI-generated insights:
- "Your portfolio grew 15% in the last quarter"
- "You're on track to reach your FIRE goal by 2030"
- "Consider rebalancing - equities are up 20% this month"

---

## Troubleshooting

### Issue: No daily change showing

**Possible Causes**:
1. Only one snapshot exists (no yesterday data)
2. Snapshot not saved yet today
3. User hasn't visited Dashboard yet

**Solution**:
- Wait until second day of tracking
- Manually visit Dashboard to trigger snapshot
- Check database for snapshot records

### Issue: Snapshot not saving

**Check**:
1. Database table exists (run migration)
2. Backend API is running
3. Portfolio has holdings (holdings_count > 0)
4. No console errors in browser DevTools

### Issue: Duplicate snapshots

**Note**: This should NOT happen due to unique constraint `UNIQUE(user_id, snapshot_date)`

If it does:
1. Check database constraints
2. Verify `hasSnapshotForToday()` is working
3. Check localStorage key format

---

## Summary

✅ **Automatic daily tracking** - No manual action needed
✅ **Historical data** - Day/week/month aggregations
✅ **Daily change display** - Shows in Today's Insights
✅ **Analysis ready** - Data structured for charts/graphs
✅ **Scalable** - Efficient indexes and queries
✅ **Privacy protected** - RLS policies in place

The system now tracks portfolio changes every day automatically. This data will be used for:
- Performance charts
- Weekly/monthly reports
- Goal progress tracking
- AI-powered insights

**Next Step**: Run the SQL migration to create the `portfolio_daily_snapshots` table!
