# Session 13 - SIP Plan with Asset Allocation Integration
## Feature Specification Document

**Status**: 📋 READY FOR IMPLEMENTATION
**Priority**: HIGH
**Estimated Complexity**: HIGH
**Implementation Time**: 2-3 hours

---

## 📋 Feature Overview

Build a comprehensive SIP Plan display that integrates user's asset allocation preferences with their financial goals. The plan will show how each goal's SIP should be split across different asset classes based on the user's saved allocation strategy.

---

## 🎯 Business Requirements

### Primary Goal
Enable users to see a detailed breakdown of their SIP investments across different asset classes for each goal, ensuring their investments align with their risk profile and allocation strategy.

### User Value
- Clear visibility of where their money should be invested
- Asset allocation automatically applied to each goal
- Validation that total SIP doesn't exceed monthly capacity
- Comprehensive view of total investment per asset class

---

## 📊 Feature Components

### 1. New Tab: "SIP Plan"
**Location**: SIP Planner page → New tab after "Asset Allocation"
**Purpose**: Display calculated SIP plan with asset class breakdown

### 2. Data Integration
- Fetch saved goals from SIP Planner
- Fetch saved asset allocation preferences
- Fetch financial data for capacity validation
- Calculate SIP splits based on allocations

### 3. Validation & Warnings
- Check if asset allocation exists
- Validate total SIP vs monthly capacity
- Display warnings/errors when issues found

---

## 🗂️ Data Structures

### Input Data Sources

#### 1. Goals Data (from SIP Planner)
```typescript
interface DetailedGoal {
  id: string;
  name: string;
  priority: number;
  timeYears: number;
  goalType: 'Short-Term' | 'Mid-Term' | 'Long-Term';
  amountRequiredToday: number;
  amountAvailableToday: number;
  goalInflation: number;
  stepUp: number;
  amountRequiredFuture: number;  // Future value
  sipRequired: number;            // Monthly SIP needed
  sipCalculated: boolean;
}
```

#### 2. Asset Allocation Data
```typescript
interface AssetAllocation {
  goal_type: 'Short-Term' | 'Mid-Term' | 'Long-Term';
  equity_pct: number;
  us_equity_pct: number;
  debt_pct: number;
  gold_pct: number;
  reits_pct: number;
  crypto_pct: number;
  cash_pct: number;
  expected_cagr_min: number;
  expected_cagr_max: number;
}
```

#### 3. Financial Data (for capacity)
```typescript
interface FinancialCapacity {
  monthlySalary: number;
  monthlyExpenses: number;
  monthlyCapacity: number;  // Calculated: salary - expenses
}
```

### Output Data Structure

```typescript
interface SIPPlanGoal {
  // Goal Information
  goalName: string;
  yearsLeft: number;
  goalType: 'Short-Term' | 'Mid-Term' | 'Long-Term';
  futureValue: number;

  // SIP Breakdown
  totalSIP: number;
  assetBreakdown: {
    equity: number;
    usEquity: number;
    debt: number;
    gold: number;
    reits: number;
    crypto: number;
    cash: number;
  };

  // Metadata
  allocationUsed: AssetAllocation;  // Which allocation was applied
  calculatedCAGR: number;            // CAGR used for this goal
}

interface SIPPlanSummary {
  goals: SIPPlanGoal[];
  totals: {
    totalMonthlyInvestment: number;
    equity: number;
    usEquity: number;
    debt: number;
    gold: number;
    reits: number;
    crypto: number;
    cash: number;
  };
  capacity: {
    available: number;
    used: number;
    remaining: number;
    percentUsed: number;
    isOverCapacity: boolean;
  };
  validations: {
    hasAssetAllocation: boolean;
    hasGoals: boolean;
    isWithinCapacity: boolean;
  };
}
```

---

## 🧮 Calculation Logic

### 1. Map Goals to Asset Allocations

```typescript
const getAssetAllocationForGoal = (goal: DetailedGoal, allocations: AssetAllocation[]) => {
  // Find allocation matching the goal's type
  return allocations.find(a => a.goal_type === goal.goalType);
};
```

### 2. Calculate Weighted CAGR (if needed for recalculation)

```typescript
const calculateWeightedCAGR = (allocation: AssetAllocation): number => {
  // Asset class expected returns (industry standard)
  const returns = {
    equity: 0.12,      // 12%
    usEquity: 0.11,    // 11%
    debt: 0.07,        // 7%
    gold: 0.08,        // 8%
    reits: 0.10,       // 10%
    crypto: 0.15,      // 15% (high risk)
    cash: 0.04         // 4%
  };

  const weightedReturn = (
    (allocation.equity_pct / 100) * returns.equity +
    (allocation.us_equity_pct / 100) * returns.usEquity +
    (allocation.debt_pct / 100) * returns.debt +
    (allocation.gold_pct / 100) * returns.gold +
    (allocation.reits_pct / 100) * returns.reits +
    (allocation.crypto_pct / 100) * returns.crypto +
    (allocation.cash_pct / 100) * returns.cash
  );

  return weightedReturn;
};
```

### 3. Split SIP Across Asset Classes

```typescript
const splitSIPByAllocation = (
  totalSIP: number,
  allocation: AssetAllocation
): AssetBreakdown => {
  return {
    equity: Math.round(totalSIP * (allocation.equity_pct / 100)),
    usEquity: Math.round(totalSIP * (allocation.us_equity_pct / 100)),
    debt: Math.round(totalSIP * (allocation.debt_pct / 100)),
    gold: Math.round(totalSIP * (allocation.gold_pct / 100)),
    reits: Math.round(totalSIP * (allocation.reits_pct / 100)),
    crypto: Math.round(totalSIP * (allocation.crypto_pct / 100)),
    cash: Math.round(totalSIP * (allocation.cash_pct / 100))
  };
};
```

### 4. Calculate Totals

```typescript
const calculateTotals = (goals: SIPPlanGoal[]) => {
  return goals.reduce((acc, goal) => ({
    totalMonthlyInvestment: acc.totalMonthlyInvestment + goal.totalSIP,
    equity: acc.equity + goal.assetBreakdown.equity,
    usEquity: acc.usEquity + goal.assetBreakdown.usEquity,
    debt: acc.debt + goal.assetBreakdown.debt,
    gold: acc.gold + goal.assetBreakdown.gold,
    reits: acc.reits + goal.assetBreakdown.reits,
    crypto: acc.crypto + goal.assetBreakdown.crypto,
    cash: acc.cash + goal.assetBreakdown.cash
  }), {
    totalMonthlyInvestment: 0,
    equity: 0,
    usEquity: 0,
    debt: 0,
    gold: 0,
    reits: 0,
    crypto: 0,
    cash: 0
  });
};
```

---

## 🎨 UI Design Specification

### Tab Structure

```
SIP Planner
├── Set Goals (existing)
├── Asset Allocation (existing)
└── SIP Plan (NEW) ← Build this
```

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        SIP Plan                              │
│ Your personalized investment plan based on your goals and    │
│ asset allocation strategy                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⚠️ WARNING (if capacity exceeded)                           │
│ Your total SIP (₹X) exceeds monthly capacity (₹Y)          │
│ Please adjust your goals or increase capacity               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💡 Allocation Strategy Info                                 │
│ Short-Term: 6-8% CAGR | Mid-Term: 8-10% CAGR | Long-Term: 10-12% CAGR │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    SIP Plan Table                                    │
├──────┬──────┬──────┬────────┬────────┬────────┬──────────┬──────┬──────┬───────┬──────┬──────┤
│ Goal │Years │ Type │ Future │ Total  │ Equity │US Equity │ Debt │ Gold │ REITs │Crypto│ Cash │
│ Name │ Left │      │ Value  │  SIP   │        │          │      │      │       │      │      │
├──────┼──────┼──────┼────────┼────────┼────────┼──────────┼──────┼──────┼───────┼──────┼──────┤
│Goal1 │  5   │Short │₹10L    │ ₹5000  │ ₹2000  │  ₹1000   │₹1500 │ ₹500 │   -   │  -   │  -   │
│Goal2 │  10  │Mid   │₹25L    │ ₹8000  │ ₹4000  │  ₹2000   │₹1500 │ ₹500 │   -   │  -   │  -   │
│Goal3 │  20  │Long  │₹1Cr    │₹15000  │ ₹9000  │  ₹3000   │₹2000 │₹1000 │   -   │  -   │  -   │
├──────┼──────┼──────┼────────┼────────┼────────┼──────────┼──────┼──────┼───────┼──────┼──────┤
│TOTAL │      │      │        │₹28000  │₹15000  │  ₹6000   │₹5000 │₹2000 │   -   │  -   │  -   │
└──────┴──────┴──────┴────────┴────────┴────────┴──────────┴──────┴──────┴───────┴──────┴──────┘

Monthly Capacity: ₹30,000
Used: ₹28,000 (93%)
Remaining: ₹2,000
```

### Color Scheme for Asset Class Columns

```typescript
const assetClassColors = {
  equity: {
    header: 'bg-blue-600',
    cell: 'bg-blue-50',
    text: 'text-blue-900'
  },
  usEquity: {
    header: 'bg-purple-600',
    cell: 'bg-purple-50',
    text: 'text-purple-900'
  },
  debt: {
    header: 'bg-green-600',
    cell: 'bg-green-50',
    text: 'text-green-900'
  },
  gold: {
    header: 'bg-yellow-600',
    cell: 'bg-yellow-50',
    text: 'text-yellow-900'
  },
  reits: {
    header: 'bg-orange-600',
    cell: 'bg-orange-50',
    text: 'text-orange-900'
  },
  crypto: {
    header: 'bg-indigo-600',
    cell: 'bg-indigo-50',
    text: 'text-indigo-900'
  },
  cash: {
    header: 'bg-gray-600',
    cell: 'bg-gray-50',
    text: 'text-gray-900'
  }
};
```

### Capacity Warning Modal

```typescript
// Show when capacity exceeded
<Dialog open={isCapacityExceeded}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-red-600">
        ⚠️ Investment Capacity Exceeded
      </DialogTitle>
    </DialogHeader>
    <p>
      Your total monthly SIP (₹{totalSIP}) exceeds your available
      monthly capacity (₹{monthlyCapacity}).
    </p>
    <p className="mt-2">
      <strong>Options:</strong>
    </p>
    <ul className="list-disc ml-6 mt-2">
      <li>Adjust your goals to reduce required SIPs</li>
      <li>Extend goal timelines to reduce monthly burden</li>
      <li>Increase your monthly savings capacity</li>
    </ul>
    <DialogFooter>
      <Button onClick={() => navigate('?tab=set-goals')}>
        Adjust Goals
      </Button>
      <Button variant="outline" onClick={closeModal}>
        I Understand
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## ✅ Validation Rules

### 1. Pre-Display Validations

```typescript
const validateSIPPlan = (
  goals: DetailedGoal[],
  allocations: AssetAllocation[],
  monthlyCapacity: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: Asset allocation exists
  if (!allocations || allocations.length === 0) {
    errors.push('No asset allocation found. Please set your allocation first.');
  }

  // Check 2: Goals exist
  if (!goals || goals.length === 0) {
    warnings.push('No goals found. Please add goals in the Set Goals tab.');
  }

  // Check 3: All goals have calculated SIPs
  const goalsWithoutSIP = goals.filter(g => !g.sipCalculated || !g.sipRequired);
  if (goalsWithoutSIP.length > 0) {
    warnings.push(`${goalsWithoutSIP.length} goal(s) don't have SIP calculated.`);
  }

  // Check 4: Allocation exists for each goal type
  const goalTypes = [...new Set(goals.map(g => g.goalType))];
  goalTypes.forEach(type => {
    const hasAllocation = allocations.some(a => a.goal_type === type);
    if (!hasAllocation) {
      errors.push(`No allocation found for ${type} goals.`);
    }
  });

  // Check 5: Capacity validation
  const totalSIP = goals.reduce((sum, g) => sum + (g.sipRequired || 0), 0);
  if (totalSIP > monthlyCapacity) {
    errors.push(
      `Total SIP (₹${totalSIP}) exceeds monthly capacity (₹${monthlyCapacity})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
```

### 2. Display States

```typescript
// State 1: No asset allocation
if (!hasAssetAllocation) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Asset Allocation Required</h3>
        <p className="text-gray-600 mb-4">
          Please set your asset allocation strategy before viewing your SIP plan.
        </p>
        <Button onClick={() => navigate('?tab=asset-allocation')}>
          Set Asset Allocation
        </Button>
      </CardContent>
    </Card>
  );
}

// State 2: No goals
if (!hasGoals || goals.length === 0) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Goals Found</h3>
        <p className="text-gray-600 mb-4">
          Add your financial goals to see your personalized SIP plan.
        </p>
        <Button onClick={() => navigate('?tab=set-goals')}>
          Add Goals
        </Button>
      </CardContent>
    </Card>
  );
}

// State 3: Capacity exceeded
if (isCapacityExceeded) {
  // Show modal + banner + red table highlighting
}

// State 4: Success - show table
```

---

## 🔧 Implementation Steps

### Step 1: Add Tab to SIP Planner
```typescript
// In SIPPlanner.tsx, add new tab
<TabsList>
  <TabsTrigger value="set-goals">Set Goals</TabsTrigger>
  <TabsTrigger value="asset-allocation">Asset Allocation</TabsTrigger>
  <TabsTrigger value="sip-plan">SIP Plan</TabsTrigger> {/* NEW */}
</TabsList>

<TabsContent value="sip-plan">
  <SIPPlanTab
    goals={goals}
    assetAllocations={assetAllocations}
    monthlyCapacity={monthlySavings}
  />
</TabsContent>
```

### Step 2: Create SIPPlanTab Component
```typescript
// File: frontend/src/components/SIPPlanTab.tsx

interface SIPPlanTabProps {
  goals: DetailedGoal[];
  assetAllocations: AssetAllocation[];
  monthlyCapacity: number;
}

export const SIPPlanTab: React.FC<SIPPlanTabProps> = ({
  goals,
  assetAllocations,
  monthlyCapacity
}) => {
  // Component implementation
};
```

### Step 3: Fetch Asset Allocations in Parent
```typescript
// In SIPPlanner.tsx
const [assetAllocations, setAssetAllocations] = useState<AssetAllocation[]>([]);

useEffect(() => {
  const fetchAllocations = async () => {
    if (!user?.id) return;

    const response = await fetch(API_ENDPOINTS.getAssetAllocation(user.id));
    if (response.ok) {
      const data = await response.json();
      setAssetAllocations(data.allocations || []);
    }
  };

  fetchAllocations();
}, [user?.id]);
```

### Step 4: Process Goals and Create SIP Plan
```typescript
const createSIPPlan = (): SIPPlanSummary => {
  const sipPlanGoals: SIPPlanGoal[] = goals
    .filter(g => g.sipCalculated && g.sipRequired > 0)
    .map(goal => {
      const allocation = getAssetAllocationForGoal(goal, assetAllocations);
      const assetBreakdown = splitSIPByAllocation(goal.sipRequired, allocation);

      return {
        goalName: goal.name,
        yearsLeft: goal.timeYears,
        goalType: goal.goalType,
        futureValue: goal.amountRequiredFuture,
        totalSIP: goal.sipRequired,
        assetBreakdown,
        allocationUsed: allocation,
        calculatedCAGR: calculateWeightedCAGR(allocation)
      };
    });

  const totals = calculateTotals(sipPlanGoals);

  return {
    goals: sipPlanGoals,
    totals,
    capacity: {
      available: monthlyCapacity,
      used: totals.totalMonthlyInvestment,
      remaining: monthlyCapacity - totals.totalMonthlyInvestment,
      percentUsed: (totals.totalMonthlyInvestment / monthlyCapacity) * 100,
      isOverCapacity: totals.totalMonthlyInvestment > monthlyCapacity
    },
    validations: {
      hasAssetAllocation: assetAllocations.length > 0,
      hasGoals: goals.length > 0,
      isWithinCapacity: totals.totalMonthlyInvestment <= monthlyCapacity
    }
  };
};
```

### Step 5: Build Table Component
```typescript
const SIPPlanTable = ({ sipPlan }: { sipPlan: SIPPlanSummary }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {/* Standard columns */}
            <th>Goal Name</th>
            <th>Years</th>
            <th>Type</th>
            <th>Future Value</th>
            <th>Total SIP</th>

            {/* Asset class columns with colors */}
            <th className={assetClassColors.equity.header}>Equity</th>
            <th className={assetClassColors.usEquity.header}>US Equity</th>
            <th className={assetClassColors.debt.header}>Debt</th>
            <th className={assetClassColors.gold.header}>Gold</th>
            <th className={assetClassColors.reits.header}>REITs</th>
            <th className={assetClassColors.crypto.header}>Crypto</th>
            <th className={assetClassColors.cash.header}>Cash</th>
          </tr>
        </thead>
        <tbody>
          {sipPlan.goals.map(goal => (
            <tr key={goal.goalName}>
              <td>{goal.goalName}</td>
              <td>{goal.yearsLeft}</td>
              <td>{goal.goalType}</td>
              <td>{formatCurrency(goal.futureValue)}</td>
              <td>{formatCurrency(goal.totalSIP)}</td>

              {/* Asset breakdown cells with colors */}
              <td className={assetClassColors.equity.cell}>
                {formatCurrency(goal.assetBreakdown.equity)}
              </td>
              <td className={assetClassColors.usEquity.cell}>
                {formatCurrency(goal.assetBreakdown.usEquity)}
              </td>
              {/* ... other asset classes */}
            </tr>
          ))}

          {/* Totals row */}
          <tr className="font-bold bg-gray-100">
            <td colSpan={4}>TOTAL</td>
            <td>{formatCurrency(sipPlan.totals.totalMonthlyInvestment)}</td>
            <td className={assetClassColors.equity.cell}>
              {formatCurrency(sipPlan.totals.equity)}
            </td>
            {/* ... other total cells */}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
```

### Step 6: Add Capacity Validation to Set Goals Tab
```typescript
// In Set Goals tab, before saving
const handleSaveGoals = async () => {
  // Calculate total SIP
  const totalSIP = goals.reduce((sum, g) =>
    sum + (g.sipRequired || 0), 0
  );

  // Check capacity
  if (totalSIP > monthlySavings) {
    // Show warning
    toast.error(
      `Total SIP (₹${totalSIP}) exceeds monthly capacity (₹${monthlySavings})`,
      {
        description: 'Please adjust your goals or increase savings capacity',
        duration: 5000
      }
    );

    // Still allow saving, but warn user
    const confirmed = window.confirm(
      'Your total SIP exceeds monthly capacity. Save anyway?'
    );

    if (!confirmed) return;
  }

  // Proceed with save
  // ...
};
```

---

## 🧪 Testing Checklist

### Test Cases

#### 1. No Asset Allocation
- [ ] Display appropriate message
- [ ] Show "Set Asset Allocation" button
- [ ] Button navigates to correct tab

#### 2. No Goals
- [ ] Display appropriate message
- [ ] Show "Add Goals" button
- [ ] Button navigates to Set Goals tab

#### 3. Valid Data
- [ ] Table displays all goals correctly
- [ ] Asset breakdown sums to total SIP (within rounding)
- [ ] Totals row calculated correctly
- [ ] Colors applied to asset class columns
- [ ] Future values formatted correctly

#### 4. Capacity Validation
- [ ] Within capacity: No warnings
- [ ] Exceeds capacity: Modal appears
- [ ] Exceeds capacity: Banner shows above table
- [ ] Exceeds capacity: Totals row highlighted in red
- [ ] Modal "Adjust Goals" button works
- [ ] Banner dismissible

#### 5. Different Goal Types
- [ ] Short-term goals use Short-Term allocation
- [ ] Mid-term goals use Mid-Term allocation
- [ ] Long-term goals use Long-Term allocation
- [ ] Mixed goals display correctly

#### 6. Edge Cases
- [ ] Goals with 0 SIP excluded
- [ ] Goals without SIP calculation excluded
- [ ] Missing allocation for goal type: error shown
- [ ] Very large numbers formatted correctly
- [ ] Mobile responsive

---

## 📝 Files to Create/Modify

### New Files
1. `frontend/src/components/SIPPlanTab.tsx` (300-400 lines)
2. `frontend/src/components/SIPPlanTable.tsx` (200-300 lines)
3. `frontend/src/utils/sipPlanCalculations.ts` (100-150 lines)

### Modified Files
1. `frontend/src/pages/SIPPlanner.tsx`
   - Add new tab
   - Fetch asset allocations
   - Pass data to SIPPlanTab
   - Add capacity validation to Set Goals

---

## 🎯 Success Criteria

1. ✅ User can view comprehensive SIP plan with asset breakdown
2. ✅ Asset allocation percentages correctly applied to each goal
3. ✅ Total investments per asset class calculated accurately
4. ✅ Capacity validation prevents over-commitment
5. ✅ Clear warnings when allocation missing or capacity exceeded
6. ✅ Table is responsive and mobile-friendly
7. ✅ Colors make asset classes easily distinguishable
8. ✅ All monetary values formatted as Indian Rupees

---

## 🚀 Implementation Priority

### Must Have (P0)
- Basic table with goal breakdown
- Asset allocation integration
- Totals calculation
- "No allocation" state

### Should Have (P1)
- Capacity validation with warnings
- Color-coded asset class columns
- Capacity usage indicator
- Modal for capacity exceeded

### Nice to Have (P2)
- Export to PDF/Excel
- Chart visualization of allocation
- Historical comparison
- Goal prioritization

---

## 📊 Expected Output Example

### Sample Data

**User:** Jay
**Monthly Capacity:** ₹30,000

**Goals:**
1. Emergency Fund (Short-Term, 2 years, ₹5L)
2. House Down Payment (Mid-Term, 5 years, ₹20L)
3. Retirement (Long-Term, 25 years, ₹2Cr)

**Allocations:**
- Short-Term: 40% Equity, 40% Debt, 20% Cash
- Mid-Term: 60% Equity, 20% Debt, 10% Gold, 10% REITs
- Long-Term: 70% Equity, 15% US Equity, 10% Debt, 5% Gold

**Expected SIP Plan:**

| Goal | Years | Type | Future Value | Total SIP | Equity | US Equity | Debt | Gold | REITs | Crypto | Cash |
|------|-------|------|--------------|-----------|--------|-----------|------|------|-------|--------|------|
| Emergency Fund | 2 | Short-Term | ₹5,00,000 | ₹5,000 | ₹2,000 | - | ₹2,000 | - | - | - | ₹1,000 |
| House Down Payment | 5 | Mid-Term | ₹20,00,000 | ₹10,000 | ₹6,000 | - | ₹2,000 | ₹1,000 | ₹1,000 | - | - |
| Retirement | 25 | Long-Term | ₹2,00,00,000 | ₹12,000 | ₹8,400 | ₹1,800 | ₹1,200 | ₹600 | - | - | - |
| **TOTAL** | | | | **₹27,000** | **₹16,400** | **₹1,800** | **₹5,200** | **₹1,600** | **₹1,000** | **-** | **₹1,000** |

**Capacity Check:**
- Available: ₹30,000
- Used: ₹27,000 (90%)
- Remaining: ₹3,000 ✅ Within capacity

---

## 🔄 Future Enhancements (Post-MVP)

1. **Rebalancing Suggestions**: Alert when actual allocation drifts from target
2. **Tax Optimization**: Show tax-saving investment options (ELSS, PPF, etc.)
3. **Goal Priority**: Allow reordering goals by priority when capacity limited
4. **What-If Analysis**: Show impact of adjusting goals or allocations
5. **Auto-Adjust**: Suggest goal timeline adjustments to fit capacity
6. **Investment Recommendations**: Specific fund suggestions per asset class
7. **Progress Tracking**: Compare actual vs planned investments over time

---

## ✅ Ready for Implementation

This specification provides everything needed to implement the SIP Plan feature in Session 13:

- ✅ Complete data structures
- ✅ Detailed calculation logic
- ✅ UI/UX specifications
- ✅ Validation rules
- ✅ Step-by-step implementation guide
- ✅ Testing checklist
- ✅ Success criteria

**Estimated Lines of Code:** 600-900 lines
**Implementation Time:** 2-3 hours
**Testing Time:** 30-45 minutes

---

**Document Version:** 1.0
**Created:** Session 12
**Status:** Ready for Session 13 Implementation
