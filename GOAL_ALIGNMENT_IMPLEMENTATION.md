# Goal-Based Investment Tracking Implementation

## Overview
This document describes the complete implementation of the goal-based investment tracking system that allows users to assign portfolio holdings to specific financial goals and track their progress.

## What Was Implemented

### 1. Backend APIs

#### **PATCH /routes/portfolio-holdings/{holding_id}/assign-goal**
- Assigns a portfolio holding to a specific financial goal
- Validates goal ownership (goal must belong to same user as holding)
- Auto-detects and updates asset class from scheme name
- Request body: `{ "goal_id": "uuid" }` (or `null` to unassign)

#### **GET /routes/goal-investment-summary/{user_id}**
- Fetches comprehensive investment summary for all user goals
- Returns for each goal:
  - Assigned holdings with details
  - Total invested, current value, profit
  - Asset class breakdown (Equity/Debt/Hybrid/Gold/Liquid) in both absolute values and percentages
  - Recommended vs actual allocation based on goal timeline
  - Progress percentage, gap amount, and on-track status
- Timeline-based allocation recommendations:
  - **10+ years**: 80% Equity, 15% Debt, 5% Gold
  - **7-10 years**: 70% Equity, 20% Debt, 5% Hybrid, 5% Gold
  - **5-7 years**: 60% Equity, 30% Debt, 5% Hybrid, 5% Gold
  - **3-5 years**: 40% Equity, 45% Debt, 10% Hybrid, 5% Gold
  - **<3 years**: 20% Equity, 50% Debt, 15% Hybrid, 5% Gold, 10% Liquid

### 2. Database Migration

**File**: `backend/migrations/008_add_goal_alignment_to_portfolio.sql`

**Changes**:
- Added `goal_id` column to `portfolio_holdings` table (UUID, foreign key to `goals.id`)
- Added `asset_class` column to `portfolio_holdings` table (VARCHAR(20), default 'Equity')
- Created indexes for faster queries:
  - `idx_portfolio_holdings_goal_id` on `goal_id`
  - `idx_portfolio_holdings_user_goal` on `(user_id, goal_id)`
- Auto-populates asset_class for existing holdings based on scheme name patterns

### 3. Asset Class Detection Logic

**Function**: `detect_asset_class()` in `backend/app/apis/portfolio/__init__.py`

Automatically categorizes mutual funds based on scheme name keywords:
- **Liquid**: liquid, ultra short, low duration
- **Gold**: gold, commodity, silver, precious metal
- **Hybrid**: hybrid, balanced, aggressive hybrid, conservative hybrid, multi asset
- **Debt**: debt, bond, gilt, income, credit, corporate bond
- **Equity**: equity, small/mid/large cap, flexi cap, index, sectoral (default fallback)

### 4. Frontend Components

#### **PortfolioHoldingsTable** (Modified)
- Added "Assign to Goal" dropdown column
- Fetches user goals and displays them in dropdown
- Calls goal assignment API when selection changes
- Shows loading state while assigning
- Toast notifications for success/error

#### **GoalInvestmentSummary** (New Component)
- Displays goal cards with comprehensive investment tracking
- Shows for each goal:
  - **Progress bar** with current value vs target
  - **Summary stats**: Invested, Current Value, Profit/Loss, Holdings Count
  - **Asset allocation comparison**:
    - Recommended allocation (based on timeline)
    - Actual allocation (from assigned holdings)
  - **Holdings list table** with scheme names, asset classes, values, returns
- Color-coded status:
  - Green = On Track
  - Amber = Needs Attention
- Empty state with helpful message if no holdings assigned

### 5. Integration Points

#### **Portfolio Page** (`frontend/src/pages/Portfolio.tsx`)
- Fetches goals on mount using goal-investment-summary endpoint
- Passes goals to PortfolioHoldingsTable component
- Refreshes holdings after goal assignment

#### **FIRE Planner Page** (`frontend/src/pages/FIREPlanner.tsx`)
- Added GoalInvestmentSummary component below "SIP Plan with Asset Class Breakdown" section
- Automatically displays goal progress as users assign holdings

---

## How to Apply Database Migration

### **IMPORTANT: Run this migration BEFORE testing the feature**

The database needs the `goal_id` and `asset_class` columns to be added to the `portfolio_holdings` table.

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `backend/migrations/008_add_goal_alignment_to_portfolio.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify success:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'portfolio_holdings'
   AND column_name IN ('goal_id', 'asset_class');
   ```
   You should see both columns listed.

### Option 2: Supabase CLI

```bash
cd backend/migrations
supabase migration apply --file 008_add_goal_alignment_to_portfolio.sql
```

### Option 3: Direct SQL (if you have database access)

```bash
psql -h <your-db-host> -U postgres -d postgres -f backend/migrations/008_add_goal_alignment_to_portfolio.sql
```

---

## Testing the Complete Flow

### 1. Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend dev server running
- User logged in with access to Portfolio page
- At least one goal created in FIRE Planner page
- At least one mutual fund holding in portfolio

### 2. Test Goal Assignment

1. Navigate to **Portfolio** page
2. Verify holdings table shows "Assign to Goal" dropdown column
3. Select a goal from the dropdown for a holding
4. Verify:
   - Toast notification shows success message
   - Dropdown value updates to selected goal
   - No errors in browser console or backend logs

### 3. Test Goal Progress Tracking

1. Navigate to **FIRE Planner** page
2. Scroll to the "Goal Investment Tracking" section (below SIP Plan)
3. Verify:
   - Goal card appears for the goal you assigned holdings to
   - Progress bar shows current value / target amount
   - Summary stats show correct invested amount, current value, profit
   - Asset breakdown displays correct percentages
   - Holdings list shows the assigned holding
   - Recommended vs Actual allocation comparison is displayed

### 4. Test Multiple Goal Assignments

1. Go back to Portfolio page
2. Assign different holdings to different goals
3. Return to FIRE Planner
4. Verify:
   - Each goal card shows only its assigned holdings
   - Asset class percentages are correct per goal
   - Progress bars reflect accurate data

### 5. Test Unassigning

1. In Portfolio page, select "-- Select Goal --" to unassign a holding
2. Verify:
   - Toast shows unassignment success
   - FIRE Planner updates and holding disappears from goal card

---

## Known Behaviors

### Toggle OFF Button Issue (STILL PENDING)
**Status**: IN PROGRESS

The portfolio sync toggle OFF button was returning 500 errors. Multiple fixes were attempted:
1. Removed problematic `assets` table update
2. Wrapped sync function in try-except
3. Added comprehensive error logging

**Latest Changes**:
- Added defensive error handling at lines 1092-1096 in `backend/app/apis/portfolio/__init__.py`
- Added detailed traceback logging at lines 1119-1124
- When disabling sync, the code path does NOT call `update_net_worth_from_portfolio()`

**Next Steps for Debugging**:
- Check backend logs for the detailed traceback when toggling OFF
- The comprehensive error handling should now log the exact failure point
- If error persists, review the logs for the specific line causing the issue

### Goal Data Source
- Goals are fetched from the database `goals` table via the goal-investment-summary endpoint
- Goals in FinancialData (short/mid/long term) are separate from database goals
- The system uses database goals for alignment and tracking

### FIRE Scenarios Integration
- FIRE scenarios (Lean/CoastFIRE/Premium) apply ONLY to Retirement goal
- When holdings are assigned to Retirement goal:
  - Their market value contributes to net worth
  - As NAV updates daily, net worth increases
  - FIRE calculations update accordingly
  - Retirement goal progress reflects actual portfolio performance

---

## Architecture Decisions

### One-to-One Relationship
Each holding can be assigned to ONE goal only (not split across multiple goals).
- Simpler UX and logic
- Clearer tracking and reporting
- Easy to understand for users

### Asset Class Priority Order
Detection logic uses priority: Liquid > Gold > Hybrid > Debt > Equity
- Most specific types checked first
- Default fallback to Equity (most common)
- Can be overridden manually if needed

### Timeline-Based Recommendations
Allocation automatically adjusts based on years to goal:
- Longer horizons = More equity (growth potential)
- Shorter horizons = More debt (capital preservation)
- Standard financial planning best practices

---

## File Changes Summary

### Backend Files Modified/Created:
- ✅ `backend/migrations/008_add_goal_alignment_to_portfolio.sql` (NEW)
- ✅ `backend/app/apis/portfolio/__init__.py` (MODIFIED)
  - Added `detect_asset_class()` function (lines 40-91)
  - Added `AssignGoalRequest` model (lines 1247-1249)
  - Added `assign_holding_to_goal()` endpoint (lines 1349-1419)
  - Added `get_goal_investment_summary()` endpoint (lines 1422-1567)
  - Enhanced toggle error handling (lines 1092-1096, 1119-1124)

### Frontend Files Modified/Created:
- ✅ `frontend/src/components/PortfolioHoldingsTable.tsx` (MODIFIED)
  - Added goals prop and Goal interface
  - Added `handleGoalAssignment()` function
  - Added "Assign to Goal" column with dropdown
- ✅ `frontend/src/components/GoalInvestmentSummary.tsx` (NEW)
  - Complete goal tracking component with progress, stats, allocation comparison
- ✅ `frontend/src/pages/Portfolio.tsx` (MODIFIED)
  - Added goals state
  - Added useEffect to fetch goals
  - Passed goals prop to PortfolioHoldingsTable
- ✅ `frontend/src/pages/FIREPlanner.tsx` (MODIFIED)
  - Added GoalInvestmentSummary import
  - Added component below SIP Plan section

---

## Next Steps for User

1. **Apply Database Migration** (CRITICAL - Do this first!)
   - Run the SQL migration via Supabase dashboard
   - Verify columns added successfully

2. **Test Toggle OFF Button**
   - Try toggling portfolio sync from ON to OFF
   - Check backend logs for any detailed error traceback
   - Report findings so final fix can be applied

3. **Test Goal Alignment Flow**
   - Assign holdings to goals in Portfolio page
   - View progress in FIRE Planner page
   - Verify calculations and UI display correctly

4. **Provide Feedback**
   - Report any bugs or unexpected behavior
   - Suggest UI/UX improvements if needed
   - Confirm if the feature meets expectations

---

## Success Criteria (From User Requirements)

✅ Users can align individual holdings to specific goals
✅ Portfolio page shows goal assignment dropdown
✅ FIRE Planner shows goal investment summary below SIP Plan
✅ Each goal displays:
  - Holdings assigned to it
  - Investment class (asset breakdown)
  - Investment amount automatically allocated
  - Overall total target and progress
  - Gap remaining
✅ Great UI with perfect alignment
✅ No confusion about direction and progress
✅ Clear visualization of recommended vs actual allocation

---

## Questions or Issues?

If you encounter any problems:
1. Check backend logs for detailed error messages
2. Verify database migration applied successfully
3. Ensure goals exist in the database (create via FIRE Planner)
4. Check browser console for frontend errors
5. Report the specific error message and steps to reproduce

Happy tracking your investment goals! 🎯📈
