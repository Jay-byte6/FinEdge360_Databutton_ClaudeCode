import React, { useState, useEffect } from "react";
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
import { AlertCircle, Plus, Trash2, Calculator, X, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

        // Load SIP planner data
        console.log('Loading SIP planner data for user:', user.id);
        const response = await fetch(API_ENDPOINTS.getSIPPlanner(user.id));
        console.log('SIP planner response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('SIP planner data loaded:', data);

          if (data && data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
            console.log('Setting goals from database:', data.goals);
            console.log('First goal structure:', JSON.stringify(data.goals[0], null, 2));
            console.log('Number of goals loaded:', data.goals.length);
            setGoals(data.goals);
            console.log('Goals state after setGoals - should trigger re-render');
          } else {
            console.log('No goals found in database, starting fresh');
          }
        } else {
          console.log('Failed to load SIP planner data');
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
      goalInflation: 5,
      stepUp: 5,
      amountRequiredFuture: null,
      sipRequired: null,
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

  // Update goal field
  const handleUpdateGoal = (id: string, field: keyof DetailedGoal, value: any) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const updated = { ...goal, [field]: value };

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

      const response = await fetch(API_ENDPOINTS.saveSIPPlanner, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goals: goals,
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
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

  const availableToAllocate = totalInvestableAssets - totalAmountAvailableToday;
  const sipSurplusOrDeficit = monthlySavings - totalSIPRequired;

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
            <p className="font-semibold">You have unsaved changes! Click the "⚠️ Save Changes" button to save your goals to the database.</p>
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
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="goals">Set Goals</TabsTrigger>
          <TabsTrigger value="sipplan">SIP Plan</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* TAB 1: Set Goals (existing goal planning table) */}
        <TabsContent value="goals">

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
          {hasUnsavedChanges ? "⚠️ Save Changes" : "Save SIP Plan"}
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
                  tooltip="Short-Term (6% return), Mid-Term (9% return), Long-Term (11% return). Based on time horizon and expected investment returns."
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

                {/* Goal Type - Editable */}
                <td className="border border-gray-300 px-2 py-1">
                  <Select
                    value={goal.goalType}
                    onValueChange={(value: 'Short-Term' | 'Mid-Term' | 'Long-Term') =>
                      handleUpdateGoal(goal.id, 'goalType', value)
                    }
                  >
                    <SelectTrigger className="w-32 bg-green-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Short-Term">Short Term</SelectItem>
                      <SelectItem value="Mid-Term">Medium Term</SelectItem>
                      <SelectItem value="Long-Term">Long Term</SelectItem>
                    </SelectContent>
                  </Select>
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
                    value={goal.goalInflation || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleUpdateGoal(goal.id, 'goalInflation', isNaN(val) ? 0 : val);
                    }}
                    className="w-20 bg-green-50"
                    min="0"
                    max="100"
                    step="0.1"
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
                    value={goal.stepUp || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleUpdateGoal(goal.id, 'stepUp', isNaN(val) ? 0 : val);
                    }}
                    className="w-20 bg-green-50"
                    min="0"
                    max="100"
                    step="1"
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
        </TabsContent>

        {/* TAB 2: SIP Plan (breakdown of each goal) */}
        <TabsContent value="sipplan">
          <div className="space-y-6">
            {goals.filter(g => g.sipCalculated).length === 0 ? (
              <Card className="bg-yellow-50 border-2 border-yellow-300">
                <CardContent className="py-8 text-center">
                  <p className="text-lg font-semibold text-gray-700">No SIP calculations yet</p>
                  <p className="text-sm text-gray-600 mt-2">Go to "Set Goals" tab and calculate SIP for your goals</p>
                </CardContent>
              </Card>
            ) : (
              goals.filter(g => g.sipCalculated).map((goal) => (
                <Card key={goal.id} className="shadow-lg border-2 border-blue-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                    <p className="text-sm text-gray-600">{goal.goalType} Goal | Priority: {goal.priority}</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 border-b pb-2">Goal Details</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Horizon:</span>
                          <span className="font-semibold">{goal.timeYears} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Required (Today):</span>
                          <span className="font-semibold">₹{goal.amountRequiredToday.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goal Inflation:</span>
                          <span className="font-semibold">{goal.goalInflation}% p.a.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Required (Future):</span>
                          <span className="font-semibold text-blue-600">₹{goal.amountRequiredFuture?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 border-b pb-2">Investment Strategy</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lump Sum Allocated:</span>
                          <span className="font-semibold">₹{goal.amountAvailableToday.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Return:</span>
                          <span className="font-semibold">{(EXPECTED_RETURNS[goal.goalType] * 100).toFixed(0)}% p.a.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SIP Step-Up:</span>
                          <span className="font-semibold">{goal.stepUp}% annually</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-700 font-semibold">Monthly SIP Required:</span>
                          <span className="font-bold text-xl text-green-600">₹{goal.sipRequired?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Investment Plan:</strong> Start with a monthly SIP of ₹{goal.sipRequired?.toLocaleString() || '0'},
                        increase it by {goal.stepUp}% every year, and invest the lump sum of ₹{goal.amountAvailableToday.toLocaleString()}
                        today. This will help you accumulate ₹{goal.amountRequiredFuture?.toLocaleString() || '0'} in {goal.timeYears} years.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 3: Summary (overall financial overview) */}
        <TabsContent value="summary">
      <div className="space-y-6">
      {/* Summary Section */}
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
                <span className="font-bold text-blue-600">₹{totalInvestableAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Already Allocated to Goals:</span>
                <span className="font-bold">₹{totalAmountAvailableToday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Still Available to Allocate:</span>
                <span className={`font-bold text-xl ${availableToAllocate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{availableToAllocate.toLocaleString()}
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
                <span className="font-bold">₹{totalSIPRequired.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Max Monthly Capacity:</span>
                <span className="font-bold">₹{monthlySavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">
                  {sipSurplusOrDeficit >= 0 ? 'Surplus:' : 'Deficit:'}
                </span>
                <span className={`font-bold text-xl ${sipSurplusOrDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(sipSurplusOrDeficit).toLocaleString()}
                </span>
              </div>
            </div>
            {sipSurplusOrDeficit < 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Warning: Your total SIP requirements exceed your monthly savings by ₹{Math.abs(sipSurplusOrDeficit).toLocaleString()}.
                  You need to either increase your income, reduce expenses, or adjust your goals.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="mt-6 bg-yellow-50 border-2 border-yellow-300">
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
        <Card className="mt-6 bg-green-50 border-2 border-green-300">
          <CardHeader>
            <CardTitle>Financial Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  {sipSurplusOrDeficit >= 0
                    ? `Great job! You have a surplus of ₹${sipSurplusOrDeficit.toLocaleString()} per month. Consider increasing your SIP amounts or adding new goals.`
                    : `You need to find an additional ₹${Math.abs(sipSurplusOrDeficit).toLocaleString()} per month. Consider increasing your income, reducing expenses, or extending goal timelines.`}
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
      </Tabs>
    </div>
  );
};

export default SIPPlanner;
