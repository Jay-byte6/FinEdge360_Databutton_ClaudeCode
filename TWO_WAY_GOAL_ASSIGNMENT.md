# Two-Way Goal Assignment System

## Overview
Users can assign portfolio holdings to financial goals from **BOTH** the Portfolio page AND the FIRE Planner page. The assignments sync automatically across both pages in real-time.

---

## User Flows

### Flow 1: First-Time User (Recommended Path)

**Step 1: Portfolio Page**
1. User uploads CAMS statement or manually adds holdings
2. Sees banner: "Track Your Investment Goals"
3. Banner says: "Create financial goals in the FIRE Planner page to track which holdings contribute to each goal"
4. Clicks "Create Goals in FIRE Planner" button

**Step 2: FIRE Planner Page**
1. User creates financial goals (Retirement, Child Education, House, etc.)
2. Scrolls to "Goal Investment Tracking" section
3. Each goal card shows: "No holdings assigned yet"
4. Message says: "Assign mutual fund holdings to this goal from the Portfolio page or click the button below"
5. Clicks **"Assign Holdings"** button
6. Modal opens showing all holdings with checkboxes
7. Selects holdings for this goal
8. Clicks "Save Assignments"
9. Goal card immediately updates with progress, holdings, asset allocation

**Step 3: Back to Portfolio (Optional)**
1. Holdings table now shows "Assign to Goal" column
2. Each holding's dropdown shows currently assigned goal
3. Can change assignments using dropdown if needed

---

### Flow 2: Power User (Quick Assignment in Portfolio)

**If user already has goals created:**

1. **Portfolio Page** shows "Assign to Goal" dropdown column
2. Select goal from dropdown for each holding
3. Toast notification confirms assignment
4. Navigate to **FIRE Planner**
5. Goal cards automatically show assigned holdings and progress

---

### Flow 3: Manage Assignments in FIRE Planner

**For users who want to bulk-manage assignments:**

1. Go to **FIRE Planner** page
2. Scroll to "Goal Investment Tracking" section
3. Find the goal card you want to manage
4. Click **"Manage Holdings"** button (appears even if holdings already assigned)
5. Modal shows:
   - **Available Holdings** - Can be assigned to this goal
   - **Already Assigned to Other Goals** - Grayed out, shows which goal they belong to
   - Holdings already assigned to THIS goal are pre-checked
6. Check/uncheck holdings
7. Click "Save Assignments"
8. Goal card updates immediately

---

## UI Components

### 1. Portfolio Page

**No Goals Banner** (when `goals.length === 0` and `holdings.length > 0`):
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Track Your Investment Goals                         │
│                                                         │
│ Create financial goals in the FIRE Planner page to     │
│ track which holdings contribute to each goal. This     │
│ helps you visualize your progress and maintain proper  │
│ asset allocation.                                       │
│                                                         │
│ [🚀 Create Goals in FIRE Planner]                      │
└─────────────────────────────────────────────────────────┘
```

**Holdings Table** (when `goals.length > 0`):
- Additional column: "Assign to Goal"
- Dropdown with all goals
- Shows currently assigned goal (if any)
- Loading state while assigning
- Toast notification on success/error

### 2. FIRE Planner - Goal Cards

**Empty State** (no holdings assigned):
```
┌─────────────────────────────────────────────────────────┐
│              📊 No holdings assigned yet                │
│                                                         │
│ Assign mutual fund holdings to this goal from the      │
│ Portfolio page or click the button below               │
│                                                         │
│              [🔗 Assign Holdings]                       │
└─────────────────────────────────────────────────────────┘
```

**With Holdings**:
- Progress bar showing current vs target
- Summary stats (Invested, Current Value, Profit, Holdings Count)
- Asset allocation comparison (Recommended vs Actual)
- Holdings table
- **[🔗 Manage Holdings]** button at bottom

### 3. Assign Holdings Modal

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Assign Holdings to Retirement                          │
│ Select which mutual fund holdings should be assigned   │
│ to this goal. (3 selected)                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Available Holdings (5)                                 │
│ ☑ HDFC Equity Fund - Large Cap        Equity  ₹2.5L   │
│ ☑ ICICI Prudential Debt Fund          Debt    ₹1.2L   │
│ ☐ SBI Balanced Hybrid Fund           Hybrid   ₹800K   │
│ ☑ Axis Gold Fund                      Gold    ₹500K   │
│ ☐ Kotak Flexi Cap Fund               Equity   ₹1.8L   │
│                                                         │
│ Already Assigned to Other Goals (2)                    │
│   Nippon India Small Cap Fund        Equity   ₹1.5L   │
│   (Assigned to another goal - grayed out)              │
│   HDFC Banking & PSU Debt Fund       Debt     ₹900K   │
│   (Assigned to another goal - grayed out)              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 3 holdings will be assigned to this goal               │
│                              [Cancel] [Save Assignments]│
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Shows all user's holdings
- Pre-selects holdings already assigned to this goal
- Grays out holdings assigned to other goals (can't reassign)
- Checkbox UI for easy multi-select
- Real-time count of selected holdings
- Loader during save
- Calls `onSuccess()` callback to refresh parent

---

## Technical Implementation

### Components Created/Modified

**NEW: AssignHoldingsModal.tsx**
- Modal dialog for bulk assignment
- Fetches all user holdings
- Checkboxes for selection
- Handles assign/unassign API calls
- Shows loading states
- Groups holdings: Available vs Already Assigned

**MODIFIED: GoalInvestmentSummary.tsx**
- Added state for modal (`assignModalOpen`, `selectedGoal`)
- Added "Assign Holdings" button in empty state
- Added "Manage Holdings" button after holdings table
- Renders `AssignHoldingsModal` component
- Refreshes data after assignment (`fetchGoalSummaries()`)

**MODIFIED: PortfolioHoldingsTable.tsx**
- Already has goal dropdown (existing)
- Calls `onRefresh()` callback after assignment
- Toast notifications for success/error

**MODIFIED: Portfolio.tsx**
- Added "No Goals" banner with navigation to FIRE Planner
- Added `Rocket` icon import
- Fetches goals from goal-investment-summary endpoint
- Passes goals to PortfolioHoldingsTable

---

## API Flow

### Assigning a Holding

**From Portfolio Page (Dropdown)**:
```
User selects goal from dropdown
  ↓
PortfolioHoldingsTable.handleGoalAssignment()
  ↓
PATCH /routes/portfolio-holdings/{holding_id}/assign-goal
  Body: { "goal_id": "uuid" }
  ↓
Backend updates holding.goal_id
  ↓
Returns updated holding
  ↓
Toast notification
  ↓
onRefresh() callback → fetchHoldings()
```

**From FIRE Planner (Modal)**:
```
User clicks "Assign Holdings" button
  ↓
Modal opens, fetches all holdings
  ↓
GET /routes/portfolio-holdings/{user_id}
  ↓
User checks/unchecks holdings
  ↓
Clicks "Save Assignments"
  ↓
Multiple PATCH calls in parallel:
  - PATCH assign-goal for each newly selected holding
  - PATCH assign-goal with goal_id=null for unassigned holdings
  ↓
Toast notification with count
  ↓
onSuccess() callback → fetchGoalSummaries()
  ↓
Modal closes
```

---

## Synchronization

**Both pages stay in sync automatically:**

1. **Portfolio → FIRE Planner**:
   - Assign holding in Portfolio dropdown
   - Navigate to FIRE Planner
   - Goal card shows the holding immediately
   - Progress bar updates

2. **FIRE Planner → Portfolio**:
   - Assign holdings via modal in FIRE Planner
   - Navigate to Portfolio
   - Dropdown shows correct goal for each holding

3. **Real-time on same page**:
   - In FIRE Planner: Assign via modal → Goal card updates instantly
   - In Portfolio: Select from dropdown → Selection persists

---

## User Messages Guide

### Portfolio Page Messages

**No goals exist**:
> **Track Your Investment Goals**
>
> Create financial goals in the FIRE Planner page to track which holdings contribute to each goal. This helps you visualize your progress and maintain proper asset allocation.
>
> [🚀 Create Goals in FIRE Planner]

**Goals exist**:
- Table shows "Assign to Goal" column with dropdown
- Dropdown shows: "-- Select Goal --" if unassigned
- Dropdown shows goal name if assigned

### FIRE Planner Messages

**Goal has no holdings**:
> 📊 **No holdings assigned yet**
>
> Assign mutual fund holdings to this goal from the Portfolio page or click the button below
>
> [🔗 Assign Holdings]

**Goal has holdings**:
- Shows progress, stats, allocation, holdings table
- **[🔗 Manage Holdings]** button to modify assignments

### Modal Messages

**No holdings exist**:
> **No holdings found**
>
> Add holdings in the Portfolio page first

**During assignment**:
> Saving... (with spinner)

**After success**:
> ✅ Updated assignments: 3 assigned, 1 unassigned

**On error**:
> ❌ Failed to save assignments

---

## Edge Cases Handled

### 1. No Holdings
- Portfolio: Normal view, no banner (nothing to assign)
- FIRE Planner: Goal cards show "No holdings assigned yet" with button
- Modal: Shows "No holdings found" message

### 2. No Goals
- Portfolio: Shows blue banner directing to FIRE Planner
- Holdings table: No "Assign to Goal" column
- User must create goals first

### 3. All Holdings Assigned
- Portfolio: All dropdowns show goal names
- Modal: All checkboxes in "Available" section are checked
- Can still open modal to unassign or reassign

### 4. Holding Assigned to Another Goal
- Portfolio: Dropdown shows current goal
- Modal: Shows in "Already Assigned to Other Goals" section
- **NOT** selectable for new assignment (one-to-one relationship)
- Must unassign from current goal first

### 5. Concurrent Assignment
- If holding already has goal_id, API updates it
- Previous assignment automatically broken (one holding → one goal)
- Frontend reflects change immediately

---

## Best Practices for Users

### Recommended Workflow
1. ✅ Add all holdings in Portfolio first
2. ✅ Create all goals in FIRE Planner
3. ✅ Assign holdings in FIRE Planner using modal (better for bulk operations)
4. ✅ Adjust individual assignments in Portfolio if needed

### Why Two-Way is Better
- **Flexibility**: Assign from wherever you are
- **First-time users**: Clear guided path (Portfolio → FIRE Planner → Assign)
- **Power users**: Quick dropdown in Portfolio for one-off changes
- **Bulk operations**: Modal in FIRE Planner for managing multiple holdings
- **Visual feedback**: FIRE Planner shows immediate impact on goal progress

---

## Testing Checklist

### Test Portfolio Page
- [ ] No holdings, no goals → No banner
- [ ] Has holdings, no goals → Blue banner appears
- [ ] Click banner button → Navigate to FIRE Planner
- [ ] Has holdings, has goals → "Assign to Goal" column appears
- [ ] Select goal from dropdown → Toast notification
- [ ] Dropdown updates to show selected goal
- [ ] Navigate to FIRE Planner → Assignment reflects there

### Test FIRE Planner Page
- [ ] No goals → Message: "Create goals first"
- [ ] Goal with no holdings → "Assign Holdings" button
- [ ] Click button → Modal opens
- [ ] Modal shows all holdings
- [ ] Select holdings → Click Save
- [ ] Goal card updates with holdings, progress, stats
- [ ] Goal with holdings → "Manage Holdings" button appears
- [ ] Click "Manage Holdings" → Modal opens with pre-selected holdings
- [ ] Uncheck some → Save → Goal card updates

### Test Modal
- [ ] Shows available holdings with checkboxes
- [ ] Shows holdings assigned to other goals (grayed)
- [ ] Pre-selects holdings assigned to THIS goal
- [ ] Counter shows selected count
- [ ] Save button disabled if no holdings
- [ ] Spinner appears during save
- [ ] Toast shows count: "X assigned, Y unassigned"
- [ ] Modal closes on success
- [ ] Parent component refreshes data

### Test Synchronization
- [ ] Assign in Portfolio → Refresh FIRE Planner → Shows there
- [ ] Assign in FIRE Planner → Go to Portfolio → Dropdown shows goal
- [ ] Unassign in one place → Other place updates
- [ ] Multiple users: Each sees only their goals/holdings

---

## Success Criteria

✅ **User can assign holdings from Portfolio page** (if goals exist)
✅ **User can assign holdings from FIRE Planner page** (via modal)
✅ **Assignments sync across both pages automatically**
✅ **Clear messages guide users to create goals first**
✅ **Visual feedback: progress bars, stats, allocation all update**
✅ **No confusion about where to assign**
✅ **Flexible workflow supports both first-time and power users**
✅ **One-to-one relationship enforced** (one holding → one goal max)
✅ **Beautiful UI with smooth interactions**

---

## Future Enhancements (Optional)

1. **Bulk Actions in Portfolio**:
   - "Select multiple" mode in holdings table
   - Assign all selected to one goal at once

2. **Smart Suggestions**:
   - AI suggests which holdings to assign to which goal
   - Based on asset class, timeline, risk profile

3. **Drag & Drop**:
   - Drag holdings from unassigned pool to goal cards
   - Visual reordering

4. **Analytics**:
   - "Most assigned goal" indicator
   - "Unassigned holdings" count badge
   - Goal completion predictions

---

**Implementation Complete! Ready to test both flows!** 🎉
