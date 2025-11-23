import React, { useState, useEffect, useMemo } from "react";
import { AccessCodeForm } from "components/AccessCodeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import useFinancialDataStore from "utils/financialDataStore";
import useAuthStore from "utils/authStore";
import { API_ENDPOINTS } from "@/config/api";
import { AlertCircle, Plus, Trash2, Calculator, X, Info, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AssetAllocationStrategy } from "@/components/AssetAllocationStrategy";

// Enhanced Goal interface with all required fields
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
  amountRequiredFuture: number | null; // Calculated
  sipRequired: number | null; // Calculated or null if not calculated yet
  sipCalculated: boolean; // Track if SIP has been calculated for this goal
}

const SIP_PLANNER_ACCESS_KEY = 'sip_planner_access_granted';

// Column header with tooltip component
const ColumnHeader: React.FC<{ title: string; tooltip: string }> = ({ title, tooltip }) => (
  <div className="flex items-center justify-center gap-1">
    <span>{title}</span>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-blue-300 hover:text-blue-100 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-gray-900 text-white p-3">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

const SIPPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const { financialData, fetchFinancialData } = useFinancialDataStore();

  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem(SIP_PLANNER_ACCESS_KEY) === 'true';
  });

  const [goals, setGoals] = useState<DetailedGoal[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [assetAllocations, setAssetAllocations] = useState<any[]>([]);

  const ACCESS_CODE = "123456";

  // Expected returns based on goal type (industry standard)
  const EXPECTED_RETURNS = {
    'Short-Term': 0.06,  // 6% p.a.
    'Mid-Term': 0.09,    // 9% p.a.
    'Long-Term': 0.11,   // 11% p.a.
  };

  // Load financial data and calculate monthly savings
  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.id || !hasAccess) {
        setIsLoadingData(false);
        return;
      }

      try {
        // Fetch financial data to get monthly savings
        await fetchFinancialData(user.id);

        // Load asset allocations first
        const allocResponse = await fetch(API_ENDPOINTS.getAssetAllocation(user.id));
        if (allocResponse.ok) {
          const allocData = await allocResponse.json();
          if (allocData && allocData.allocations) {
            setAssetAllocations(allocData.allocations);
            console.log('[SIP Planner] Loaded asset allocations:', allocData.allocations);
          }
        }

        // Load SIP planner data
        console.log('Loading SIP planner data for user:', user.id);
        const response = await fetch(API_ENDPOINTS.getSIPPlanner(user.id));
        console.log('SIP planner response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[SIP Planner] Data loaded from database:', data);

          if (data && data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
            console.log('[SIP Planner] ✅ Loading', data.goals.length, 'goals from database');
            console.log('[SIP Planner] Goals data:', JSON.stringify(data.goals, null, 2));

            // Ensure all goal fields are properly initialized
            const loadedGoals = data.goals.map((goal: any) => ({
              ...goal,
              // Ensure all required fields exist with defaults
              sipCalculated: goal.sipCalculated ?? false,
              sipRequired: goal.sipRequired ?? null,
              amountRequiredFuture: goal.amountRequiredFuture ?? null,
            }));

            setGoals(loadedGoals);
            console.log('[SIP Planner] ✅ Goals loaded successfully into state');
          } else {
            console.log('[SIP Planner] ⚠️ No goals found in database response');
            console.log('[SIP Planner] Response data:', data);
          }
        } else {
          console.log('[SIP Planner] ❌ Failed to load - HTTP', response.status);
        }
      } catch (error) {
        console.error('Error loading SIP planner data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [user, hasAccess, fetchFinancialData]);

  // Calculate monthly savings and total investable assets from financial data
  const [totalInvestableAssets, setTotalInvestableAssets] = useState<number>(0);

  useEffect(() => {
    if (financialData?.personalInfo) {
      const salary = financialData.personalInfo.monthlySalary || 0;
      const expenses = financialData.personalInfo.monthlyExpenses || 0;
      setMonthlySavings(salary - expenses);
    }

    // Calculate Current Investable Asset Allocation (same logic as NetWorth page)
    if (financialData?.assets) {
      const assets = financialData.assets;
      const investableCategories = {
        'Real Estate / REITs': assets.liquid?.reits || 0,
        'Domestic Equity': (assets.liquid?.domestic_stock_market || 0) + (assets.liquid?.domestic_equity_mutual_funds || 0) + (assets.illiquid?.ulips || 0),
        'Debt': (assets.liquid?.fixed_deposit || 0) + (assets.liquid?.debt_funds || 0) + (assets.illiquid?.epf_ppf_vpf || 0) + (assets.liquid?.liquid_savings_cash || 0) + (assets.liquid?.cash_from_equity_mutual_funds || 0),
        'Gold': (assets.illiquid?.sgb || 0) + (assets.liquid?.gold_etf_digital_gold || 0), // Excludes jewellery
        'Crypto': assets.liquid?.crypto || 0,
      };

      let total = 0;
      for (const value of Object.values(investableCategories)) {
        total += value;
      }
      setTotalInvestableAssets(total);
    }
  }, [financialData]);

  const handleAccessGranted = () => {
    setHasAccess(true);
    localStorage.setItem(SIP_PLANNER_ACCESS_KEY, 'true');
  };

  // Calculate future value with inflation
  const calculateFutureValue = (goal: DetailedGoal): number => {
    // Validate inputs - return 0 for invalid inputs
    const amountToday = parseFloat(String(goal.amountRequiredToday || 0));
    const years = parseInt(String(goal.timeYears || 0));
    const inflation = parseFloat(String(goal.goalInflation || 0));
    const amountAvailable = parseFloat(String(goal.amountAvailableToday || 0));

    if (isNaN(amountToday) || amountToday <= 0) return 0;
    if (isNaN(years) || years <= 0) return 0;
    if (isNaN(inflation)) return 0;

    // Calculate future value of the goal with inflation
    const futureGoal = amountToday * Math.pow(1 + inflation / 100, years);

    // If amount available today, calculate its future value with expected returns
    if (!isNaN(amountAvailable) && amountAvailable > 0) {
      const expectedReturn = EXPECTED_RETURNS[goal.goalType];
      const futureValueOfAvailable = amountAvailable * Math.pow(1 + expectedReturn, years);

      // Actual gap after considering future value of available amount
      return Math.max(0, futureGoal - futureValueOfAvailable);
    }

    // No amount available, so entire future goal needs to be funded
    return futureGoal;
  };

  // Calculate SIP with step-up using correct formula
  const calculateSIPWithStepUp = (
    futureValue: number,
    years: number,
    annualReturn: number,
    stepUpPercent: number
  ): number => {
    if (futureValue <= 0 || years <= 0) return 0;

    const monthlyReturn = annualReturn / 12;
    const months = years * 12;
    const annualStepUp = stepUpPercent / 100;

    // For step-up SIP calculation using formula:
    // FV = P × [((1+r)^n - (1+s)^n) / (r-s)] where s is annual step-up rate converted to monthly

    if (stepUpPercent === 0) {
      // Standard SIP formula without step-up
      const numerator = futureValue * monthlyReturn;
      const denominator = Math.pow(1 + monthlyReturn, months) - 1;
      return numerator / denominator;
    }

    // With step-up - using yearly compounding approach
    let totalFV = 0;
    let currentSIP = 0;

    // Binary search to find the right SIP amount
    let low = 0;
    let high = futureValue / months;
    let iterations = 0;
    const maxIterations = 100;
    const tolerance = 1; // ₹1 tolerance

    while (low <= high && iterations < maxIterations) {
      currentSIP = (low + high) / 2;
      totalFV = 0;

      // Calculate future value with step-up
      for (let year = 0; year < years; year++) {
        const yearSIP = currentSIP * Math.pow(1 + annualStepUp, year);
        const monthsRemaining = (years - year) * 12;
        const yearFV = yearSIP * 12 * ((Math.pow(1 + monthlyReturn, monthsRemaining / 12) - 1) / monthlyReturn);
        totalFV += yearFV;
      }

      if (Math.abs(totalFV - futureValue) < tolerance) {
        break;
      } else if (totalFV < futureValue) {
        low = currentSIP + 0.01;
      } else {
        high = currentSIP - 0.01;
      }
      iterations++;
    }

    return Math.round(currentSIP);
  };

  // Add new goal
  const handleAddGoal = () => {
    const newGoal: DetailedGoal = {
      id: `goal_${Date.now()}`,
      name: "",
      priority: goals.length + 1,
      timeYears: 1,
      goalType: 'Short-Term',
      amountRequiredToday: 0,
      amountAvailableToday: 0,
      goalInflation: 6, // Default 6% inflation
      stepUp: 10, // Default 10% step-up (typical salary increment)
      amountRequiredFuture: 0,
      sipRequired: 0,
      sipCalculated: false,
    };
    setGoals([...goals, newGoal]);
    setHasUnsavedChanges(true);
  };

  // Delete goal
  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    setHasUnsavedChanges(true);
    toast.success("Goal deleted");
  };

  // Auto-determine goal type based on years
  const determineGoalType = (years: number): 'Short-Term' | 'Mid-Term' | 'Long-Term' => {
    if (years <= 3) return 'Short-Term';
    if (years <= 7) return 'Mid-Term';
    return 'Long-Term';
  };

  // Update goal field
  const handleUpdateGoal = (id: string, field: keyof DetailedGoal, value: any) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        // Convert empty string to 0 for numeric fields
        let processedValue = value;
        if (['amountRequiredToday', 'amountAvailableToday', 'goalInflation', 'stepUp', 'timeYears', 'priority'].includes(field)) {
          processedValue = value === '' ? 0 : value;
        }

        const updated = { ...goal, [field]: processedValue };

        // Auto-determine goal type when years change
        if (field === 'timeYears') {
          const years = parseInt(String(processedValue)) || 1;
          updated.goalType = determineGoalType(years);
        }

        // Recalculate future value whenever relevant fields change
        if (['amountRequiredToday', 'amountAvailableToday', 'goalInflation', 'timeYears', 'goalType'].includes(field)) {
          updated.amountRequiredFuture = calculateFutureValue(updated);
        }

        return updated;
      }
      return goal;
    }));
    setHasUnsavedChanges(true);
  };

  // Calculate SIP for a specific goal
  const handleCalculateSIP = (id: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const futureValue = calculateFutureValue(goal);
        const expectedReturn = EXPECTED_RETURNS[goal.goalType];
        const sip = calculateSIPWithStepUp(futureValue, goal.timeYears, expectedReturn, goal.stepUp);

        return {
          ...goal,
          amountRequiredFuture: futureValue,
          sipRequired: sip,
          sipCalculated: true,
        };
      }
      return goal;
    }));
    setHasUnsavedChanges(true);
    toast.success("SIP calculated for goal");
  };

  // Remove SIP calculation for a goal
  const handleRemoveSIP = (id: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        return {
          ...goal,
          sipRequired: null,
          sipCalculated: false,
        };
      }
      return goal;
    }));
    setHasUnsavedChanges(true);
    toast.info("SIP removed for goal");
  };

  // Sort goals by priority
  useEffect(() => {
    const sorted = [...goals].sort((a, b) => a.priority - b.priority);
    if (JSON.stringify(sorted) !== JSON.stringify(goals)) {
      setGoals(sorted);
    }
  }, [goals.map(g => g.priority).join(',')]);

  // Debug: Track goals state changes
  useEffect(() => {
    console.log('Goals state changed. Current goals count:', goals.length);
    console.log('Current goals:', goals);
  }, [goals]);

  // Save to database
  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Please log in to save");
      return;
    }

    try {
      console.log('Saving SIP plan for user:', user.id);
      console.log('Goals to save:', goals);

      // Clean up goals data - ensure all required fields are present and properly formatted
      const cleanedGoals = goals.map(goal => ({
        id: goal.id,
        name: goal.name || '',
        priority: goal.priority || 1,
        timeYears: goal.timeYears || 1,
        goalType: goal.goalType || 'Short-Term',
        amountRequiredToday: goal.amountRequiredToday || 0,
        amountAvailableToday: goal.amountAvailableToday || 0,
        goalInflation: goal.goalInflation || 0,
        stepUp: goal.stepUp || 0,
        amountRequiredFuture: goal.amountRequiredFuture || 0,
        sipRequired: goal.sipRequired || 0,
        sipCalculated: goal.sipCalculated || false,
      }));

      console.log('Cleaned goals to save:', cleanedGoals);

      const response = await fetch(API_ENDPOINTS.saveSIPPlanner, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goals: cleanedGoals,
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        // Better error handling for validation errors
        if (Array.isArray(responseData.detail)) {
          const errorMessages = responseData.detail.map((err: any) =>
            `${err.loc?.join('.') || 'unknown'}: ${err.msg}`
          ).join('\n');
          console.error('Validation errors:', errorMessages);
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        throw new Error(responseData.detail || 'Failed to save');
      }

      setHasUnsavedChanges(false);
      toast.success("SIP Plan saved successfully!");
    } catch (error: any) {
      console.error('Error saving SIP plan:', error);
      console.error('Error message:', error.message);
      toast.error(`Failed to save SIP plan: ${error.message}`);
    }
  };

  // Calculate totals with NaN protection
  const totalAmountAvailableToday = goals.reduce((sum, g) => {
    const val = g.amountAvailableToday || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalSIPRequired = goals.reduce((sum, g) => {
    if (g.sipCalculated && g.sipRequired) {
      const val = g.sipRequired || 0;
      return sum + (isNaN(val) ? 0 : val);
    }
    return sum;
  }, 0);

  // Ensure values are always numbers (never undefined/null/NaN)
  const availableToAllocate = (totalInvestableAssets || 0) - (totalAmountAvailableToday || 0);
  const sipSurplusOrDeficit = (monthlySavings || 0) - (totalSIPRequired || 0);

  // Calculate SIP Plan with Asset Allocation Breakdown - memoized to prevent re-computation
  const sipPlanData = useMemo(() => {
    // Calculate asset breakdown for each goal
    const goalsWithBreakdown = goals
      .filter(g => g.sipCalculated && g.sipRequired && g.sipRequired > 0)
      .map(goal => {
        const allocation = assetAllocations.find(a => a.goal_type === goal.goalType);
        if (!allocation) {
          return {
            ...goal,
            assetBreakdown: null
          };
        }

        return {
          ...goal,
          assetBreakdown: {
            equity: Math.round((goal.sipRequired || 0) * (allocation.equity_pct / 100)),
            us_equity: Math.round((goal.sipRequired || 0) * (allocation.us_equity_pct / 100)),
            debt: Math.round((goal.sipRequired || 0) * (allocation.debt_pct / 100)),
            gold: Math.round((goal.sipRequired || 0) * (allocation.gold_pct / 100)),
            reits: Math.round((goal.sipRequired || 0) * (allocation.reits_pct / 100)),
            crypto: Math.round((goal.sipRequired || 0) * (allocation.crypto_pct / 100)),
            cash: Math.round((goal.sipRequired || 0) * (allocation.cash_pct / 100)),
          }
        };
      });

    // Calculate totals
    const totals = goalsWithBreakdown.reduce((acc, goal) => {
      if (!goal.assetBreakdown) return acc;
      return {
        totalSIP: acc.totalSIP + (goal.sipRequired || 0),
        equity: acc.equity + goal.assetBreakdown.equity,
        us_equity: acc.us_equity + goal.assetBreakdown.us_equity,
        debt: acc.debt + goal.assetBreakdown.debt,
        gold: acc.gold + goal.assetBreakdown.gold,
        reits: acc.reits + goal.assetBreakdown.reits,
        crypto: acc.crypto + goal.assetBreakdown.crypto,
        cash: acc.cash + goal.assetBreakdown.cash,
      };
    }, {
      totalSIP: 0,
      equity: 0,
      us_equity: 0,
      debt: 0,
      gold: 0,
      reits: 0,
      crypto: 0,
      cash: 0,
    });

    return { goalsWithBreakdown, totals };
  }, [goals, assetAllocations]);

  if (!hasAccess) {
    return (
      <AccessCodeForm expectedCode={ACCESS_CODE} onAccessGranted={handleAccessGranted}>
        <div className="text-center p-4 border-t border-gray-200 mt-6">
          <p className="text-lg font-semibold text-gray-700">Unlock Powerful Financial Planning Tools!</p>
          <p className="text-sm text-gray-500">Enter the access code to discover your detailed SIP requirements.</p>
        </div>
      </AccessCodeForm>
    );
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto p-4">
        <Card className="mb-8 shadow-lg border-2 border-blue-300">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-blue-700 font-medium">Loading your SIP planner data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Detailed SIP Goal Planner</h1>
        <p className="text-lg text-gray-600">Plan your investments with inflation-adjusted calculations</p>
      </header>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-4 bg-orange-100 border-l-4 border-orange-500 text-orange-700 animate-pulse">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p className="font-semibold">You have unsaved changes! Click the "⚠️ Save Goals" button to save your goals to the database.</p>
          </div>
        </div>
      )}

      {/* Monthly Savings Info */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Your Monthly Savings Available for Investment</p>
              <p className="text-3xl font-bold text-blue-700">₹{monthlySavings.toLocaleString()}</p>
            </div>
            {totalSIPRequired > monthlySavings && (
              <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Exceeds Budget!</p>
                  <p className="text-xs text-red-600">Over by ₹{(totalSIPRequired - monthlySavings).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="goals" className="w-full" onValueChange={(value) => {
        // Refresh asset allocations when switching to Goal Planning tab
        if (value === 'sipplan' && user?.id) {
          fetch(API_ENDPOINTS.getAssetAllocation(user.id))
            .then(response => response.json())
            .then(data => {
              if (data && data.allocations) {
                setAssetAllocations(data.allocations);
                console.log('[SIP Planner] ✅ Refreshed asset allocations for Goal Planning tab');
              }
            })
            .catch(error => console.error('[SIP Planner] Error refreshing allocations:', error));
        }
      }}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="goals">
            <span className="flex items-center gap-1">
              Step 1: Set Goals
            </span>
          </TabsTrigger>
          <TabsTrigger value="allocation">
            <span className="flex items-center gap-1">
              Step 2: Asset Allocation
            </span>
          </TabsTrigger>
          <TabsTrigger value="sipplan">
            <span className="flex items-center gap-1">
              Step 3: Goal Planning
            </span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Set Goals (existing goal planning table) */}
        <TabsContent value="goals">

        {/* Step-by-step Guide */}
        <Card className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Step 1: Define Your Financial Goals</h3>
                <p className="text-sm text-green-700">
                  Add your goals (house, education, vacation, etc.), enter the amount needed and timeline.
                  Click <strong>Calculate</strong> to see monthly SIP required. Click <strong>Save Goals</strong> when done.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Button onClick={handleAddGoal} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Goal
        </Button>
        <Button
          onClick={handleSave}
          className={hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700 animate-pulse" : "bg-blue-600 hover:bg-blue-700"}
        >
          {hasUnsavedChanges ? "⚠️ Save Goals" : "Save Goals"}
        </Button>
      </div>

      {/* Goals Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Goal"
                  tooltip="Enter a descriptive name for your financial goal (e.g., 'Emergency Fund', 'Home Down Payment')"
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Priority"
                  tooltip="Rank your goals by importance. Lower numbers = higher priority. Goals are auto-sorted by priority."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Time (Years)"
                  tooltip="Number of years until you need to achieve this goal. This affects expected returns and calculations."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Goal Type"
                  tooltip="Auto-determined based on years: ≤3 years = Short-Term (6% return), 4-7 years = Mid-Term (9% return), 8+ years = Long-Term (11% return)."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Amount Required (Today)"
                  tooltip="The total amount you need for this goal in today's money (without inflation). This is what the goal would cost right now."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Amount Available (Today)"
                  tooltip="Lump sum amount from your current investments/savings that you plan to allocate to this goal. Max available from your investable assets shown in summary."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Goal Inflation %"
                  tooltip="Expected annual inflation rate for this specific goal. Typically 5-7% for general goals, higher for education/healthcare."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Amount Required (Future)"
                  tooltip="Auto-calculated: Goal amount adjusted for inflation and reduced by the future value of amount available today. This is the gap you need to fill with SIP."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Step Up %"
                  tooltip="Annual increase in your SIP amount (typically matches your expected salary increment). For example, 10% means you'll increase your SIP by 10% each year."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="SIP Required"
                  tooltip="Monthly SIP amount needed to achieve this goal. Click 'Calculate' to compute. Considers step-up, time horizon, and expected returns."
                />
              </th>
              <th className="border border-gray-300 px-3 py-2 text-sm">
                <ColumnHeader
                  title="Actions"
                  tooltip="Calculate SIP for this goal, Remove SIP calculation, or Delete the goal entirely."
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, index) => (
              <tr key={goal.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {/* Goal Name - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    value={goal.name}
                    onChange={(e) => handleUpdateGoal(goal.id, 'name', e.target.value)}
                    placeholder="Goal name"
                    className="min-w-[150px] bg-green-50"
                  />
                </td>

                {/* Priority - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={goal.priority || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 1 : parseInt(e.target.value);
                      handleUpdateGoal(goal.id, 'priority', isNaN(val) ? 1 : Math.max(1, val));
                    }}
                    className="w-20 bg-green-50"
                    min="1"
                  />
                </td>

                {/* Time (Years) - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={goal.timeYears || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 1 : parseInt(e.target.value);
                      handleUpdateGoal(goal.id, 'timeYears', isNaN(val) ? 1 : Math.max(1, val));
                    }}
                    className="w-20 bg-green-50"
                    min="1"
                  />
                </td>

                {/* Goal Type - Auto-determined (read-only display) */}
                <td className="border border-gray-300 px-2 py-1 bg-blue-50">
                  <div className="text-sm font-semibold text-gray-700 text-center">
                    {goal.goalType ? goal.goalType.replace('-', ' ') : 'Short Term'}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    (Auto)
                  </div>
                </td>

                {/* Amount Required (Today) - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={goal.amountRequiredToday || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleUpdateGoal(goal.id, 'amountRequiredToday', isNaN(val) ? 0 : val);
                    }}
                    className="w-32 bg-green-50"
                    placeholder="0"
                  />
                </td>

                {/* Amount Available (Today) - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={goal.amountAvailableToday || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleUpdateGoal(goal.id, 'amountAvailableToday', isNaN(val) ? 0 : val);
                    }}
                    className="w-32 bg-green-50"
                    placeholder="0"
                  />
                </td>

                {/* Goal Inflation % - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={goal.goalInflation === 0 ? '' : goal.goalInflation}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleUpdateGoal(goal.id, 'goalInflation', isNaN(val) ? 0 : val);
                    }}
                    className="w-20 bg-green-50"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="6%"
                  />
                </td>

                {/* Amount Required (Future) - Calculated */}
                <td className="border border-gray-300 px-2 py-1 bg-red-50">
                  <span className="text-sm font-semibold text-gray-700">
                    {goal.amountRequiredFuture !== null && !isNaN(goal.amountRequiredFuture) && goal.amountRequiredFuture > 0
                      ? `₹${Math.round(goal.amountRequiredFuture).toLocaleString()}`
                      : '₹0'}
                  </span>
                </td>

                {/* Step Up % - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={goal.stepUp === 0 ? '' : goal.stepUp}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleUpdateGoal(goal.id, 'stepUp', isNaN(val) ? 0 : val);
                    }}
                    className="w-20 bg-green-50"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="10%"
                  />
                </td>

                {/* SIP Required - Calculated */}
                <td className="border border-gray-300 px-2 py-1 bg-red-50">
                  <span className="text-sm font-semibold text-gray-700">
                    {goal.sipCalculated && goal.sipRequired !== null
                      ? `₹${Math.round(goal.sipRequired).toLocaleString()}`
                      : '-'}
                  </span>
                </td>

                {/* Actions */}
                <td className="border border-gray-300 px-2 py-1">
                  <div className="flex gap-1">
                    {!goal.sipCalculated ? (
                      <Button
                        size="sm"
                        onClick={() => handleCalculateSIP(goal.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        <Calculator className="w-3 h-3 mr-1" />
                        Calculate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleRemoveSIP(goal.id)}
                        className="bg-orange-600 hover:bg-orange-700 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section - Now on the same page */}
      <div className="space-y-6 mt-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Lump Sum Summary</CardTitle>
              <p className="text-sm text-gray-500">From Current Investable Asset Allocation (NetWorth page)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Investable Assets:</span>
                  <span className="font-bold text-blue-600">₹{(totalInvestableAssets || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Already Allocated to Goals:</span>
                  <span className="font-bold">₹{(totalAmountAvailableToday || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Still Available to Allocate:</span>
                  <span className={`font-bold text-xl ${availableToAllocate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(availableToAllocate || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              {availableToAllocate < 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Warning: You've allocated more than your available investable assets!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`shadow-lg ${sipSurplusOrDeficit < 0 ? 'border-2 border-red-500' : 'border-2 border-green-500'}`}>
            <CardHeader>
              <CardTitle>Monthly SIP Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total SIP Required:</span>
                  <span className="font-bold">₹{(totalSIPRequired || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Max Monthly Capacity:</span>
                  <span className="font-bold">₹{(monthlySavings || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">
                    {sipSurplusOrDeficit >= 0 ? 'Surplus:' : 'Deficit:'}
                  </span>
                  <span className={`font-bold text-xl ${sipSurplusOrDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs(sipSurplusOrDeficit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              {sipSurplusOrDeficit < 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Warning: Your total SIP requirements exceed your monthly savings by ₹{Math.abs(sipSurplusOrDeficit || 0).toLocaleString()}.
                    You need to either increase your income, reduce expenses, or adjust your goals.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="bg-yellow-50 border-2 border-yellow-300">
          <CardContent className="py-4">
            <p className="text-sm text-gray-700">
              <strong>Disclaimer:</strong> The calculations are based on assumed returns: Short-Term @ 6% p.a.,
              Mid-Term @ 9% p.a., Long-Term @ 11% p.a. Actual returns may vary. All inflation and step-up
              percentages are user-defined assumptions. Please consult a certified financial advisor before
              making investment decisions.
            </p>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        {totalSIPRequired > 0 && (
          <Card className="bg-green-50 border-2 border-green-300">
            <CardHeader>
              <CardTitle>Financial Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    {sipSurplusOrDeficit >= 0
                      ? `Great job! You have a surplus of ₹${(sipSurplusOrDeficit || 0).toLocaleString()} per month. Consider increasing your SIP amounts or adding new goals.`
                      : `You need to find an additional ₹${Math.abs(sipSurplusOrDeficit || 0).toLocaleString()} per month. Consider increasing your income, reducing expenses, or extending goal timelines.`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Review and rebalance your portfolio annually to stay aligned with your goals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Prioritize high-priority goals and consider automating your SIP investments to ensure consistency.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Build an emergency fund (3-6 months of expenses) before investing in long-term goals.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
        </TabsContent>

        {/* TAB 2: Asset Allocation Strategy */}
        <TabsContent value="allocation">
          {/* Step-by-step Guide */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
            <CardContent className="py-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Step 2: Set Your Investment Strategy</h3>
                  <p className="text-sm text-blue-700">
                    Choose how to split your investments across Equity, Debt, Gold, etc. for each goal type.
                    Ideal allocations are shown based on your risk profile. Customize if needed, then <strong>Save</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AssetAllocationStrategy />
        </TabsContent>

        {/* TAB 3: Goal Planning (SIP Plan with Asset Allocation Breakdown) */}
        <TabsContent value="sipplan">
          <div className="space-y-6">
            {/* Check if asset allocations exist */}
            {assetAllocations.length === 0 ? (
              <Card className="bg-yellow-50 border-2 border-yellow-300">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-xl font-bold mb-2">Asset Allocation Required</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Please set your asset allocation strategy before viewing your SIP plan.
                  </p>
                  <Button onClick={() => {
                    const tab = document.querySelector('[value="allocation"]') as HTMLElement;
                    if (tab) tab.click();
                  }} className="bg-blue-600 hover:bg-blue-700">
                    Set Asset Allocation
                  </Button>
                </CardContent>
              </Card>
            ) : goals.filter(g => g.sipCalculated).length === 0 ? (
              <Card className="bg-blue-50 border-2 border-blue-300">
                <CardContent className="py-8 text-center">
                  <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-xl font-bold mb-2">No Goals Found</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Add your financial goals to see your personalized SIP plan.
                  </p>
                  <Button onClick={() => {
                    const tab = document.querySelector('[value="goals"]') as HTMLElement;
                    if (tab) tab.click();
                  }} className="bg-green-600 hover:bg-green-700">
                    Add Goals
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Step-by-step Guide */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-purple-900 mb-1">Step 3: Your Complete Investment Plan</h3>
                          <p className="text-sm text-purple-700">
                            See exactly how much to invest in Equity, Debt, Gold, etc. for each goal.
                            Use this as your investment roadmap! <strong>Next:</strong> Start your SIPs and track progress.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (user?.id) {
                            fetch(API_ENDPOINTS.getAssetAllocation(user.id))
                              .then(response => response.json())
                              .then(data => {
                                if (data && data.allocations) {
                                  setAssetAllocations(data.allocations);
                                  toast.success("Asset allocations refreshed!");
                                }
                              })
                              .catch(error => {
                                console.error('[SIP Planner] Error refreshing allocations:', error);
                                toast.error("Failed to refresh allocations");
                              });
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity Warning if exceeded */}
                {totalSIPRequired > monthlySavings && (
                  <Card className="bg-red-50 border-2 border-red-300">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-red-900">Investment Capacity Exceeded</p>
                          <p className="text-sm text-red-700">
                            Your total monthly SIP (₹{totalSIPRequired.toLocaleString()}) exceeds your available monthly capacity (₹{monthlySavings.toLocaleString()}) by ₹{(totalSIPRequired - monthlySavings).toLocaleString()}.
                            Please adjust your goals or increase your monthly savings.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SIP Plan Table with Asset Class Breakdown */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>SIP Plan with Asset Class Breakdown</CardTitle>
                    <p className="text-sm text-gray-600">Monthly investment split by asset class for each goal</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead>
                          <tr className="bg-gray-900 text-white">
                            <th className="border border-gray-300 px-3 py-2 text-left sticky left-0 bg-gray-900">Goal</th>
                            <th className="border border-gray-300 px-3 py-2">Years</th>
                            <th className="border border-gray-300 px-3 py-2">Type</th>
                            <th className="border border-gray-300 px-3 py-2">Future Value</th>
                            <th className="border border-gray-300 px-3 py-2 bg-gray-800">Total SIP</th>
                            <th className="border border-gray-300 px-3 py-2 bg-blue-600">Equity</th>
                            <th className="border border-gray-300 px-3 py-2 bg-purple-600">US Equity</th>
                            <th className="border border-gray-300 px-3 py-2 bg-green-600">Debt</th>
                            <th className="border border-gray-300 px-3 py-2 bg-yellow-600">Gold</th>
                            <th className="border border-gray-300 px-3 py-2 bg-orange-600">REITs</th>
                            <th className="border border-gray-300 px-3 py-2 bg-indigo-600">Crypto</th>
                            <th className="border border-gray-300 px-3 py-2 bg-gray-600">Cash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sipPlanData.goalsWithBreakdown.map((goal, index) => (
                            <tr key={goal.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-300 px-3 py-2 font-semibold sticky left-0 bg-inherit">{goal.name}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">{goal.timeYears}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center text-xs">{goal.goalType.replace('-', ' ')}</td>
                              <td className="border border-gray-300 px-3 py-2 text-right">₹{(goal.amountRequiredFuture || 0).toLocaleString()}</td>
                              <td className="border border-gray-300 px-3 py-2 text-right font-bold bg-gray-100">₹{(goal.sipRequired || 0).toLocaleString()}</td>
                              {goal.assetBreakdown ? (
                                <>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-blue-50">₹{goal.assetBreakdown.equity.toLocaleString()}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-purple-50">₹{goal.assetBreakdown.us_equity.toLocaleString()}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-green-50">₹{goal.assetBreakdown.debt.toLocaleString()}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-yellow-50">₹{goal.assetBreakdown.gold.toLocaleString()}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-orange-50">₹{goal.assetBreakdown.reits.toLocaleString()}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-indigo-50">₹{goal.assetBreakdown.crypto.toLocaleString()}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right bg-gray-50">₹{goal.assetBreakdown.cash.toLocaleString()}</td>
                                </>
                              ) : (
                                <td colSpan={7} className="border border-gray-300 px-3 py-2 text-center text-red-600 text-xs">
                                  No allocation found for {goal.goalType}
                                </td>
                              )}
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr className="bg-gray-800 text-white font-bold">
                            <td className="border border-gray-300 px-3 py-2 sticky left-0 bg-gray-800">TOTAL</td>
                            <td colSpan={3} className="border border-gray-300 px-3 py-2"></td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-lg">₹{sipPlanData.totals.totalSIP.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-blue-700">₹{sipPlanData.totals.equity.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-purple-700">₹{sipPlanData.totals.us_equity.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-green-700">₹{sipPlanData.totals.debt.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-yellow-700">₹{sipPlanData.totals.gold.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-orange-700">₹{sipPlanData.totals.reits.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-indigo-700">₹{sipPlanData.totals.crypto.toLocaleString()}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right bg-gray-700">₹{sipPlanData.totals.cash.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Capacity Summary */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Monthly Capacity</p>
                        <p className="text-2xl font-bold text-blue-600">₹{monthlySavings.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total SIP Used</p>
                        <p className="text-2xl font-bold text-green-600">₹{totalSIPRequired.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{Math.round((totalSIPRequired / monthlySavings) * 100)}% of capacity</p>
                      </div>
                      <div className={`p-4 rounded-lg ${sipSurplusOrDeficit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm text-gray-600">{sipSurplusOrDeficit >= 0 ? 'Remaining' : 'Deficit'}</p>
                        <p className={`text-2xl font-bold ${sipSurplusOrDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{Math.abs(sipSurplusOrDeficit).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Recommendations */}
                <Card className="bg-green-50 border-2 border-green-300">
                  <CardHeader>
                    <CardTitle className="text-green-900">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                        <span>
                          <strong>Diversify within asset classes:</strong> Don't put all your money in one fund. Spread your equity allocation across large-cap, mid-cap, and small-cap funds.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                        <span>
                          <strong>Review annually:</strong> Rebalance your portfolio if allocation drifts by more than 5% from your target.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                        <span>
                          <strong>Automate your SIPs:</strong> Set up automatic payments to ensure consistent investing regardless of market conditions.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                        <span>
                          <strong>Tax optimization:</strong> Consider ELSS funds for equity allocation to save tax under Section 80C (up to ₹1.5L annually).
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SIPPlanner;
