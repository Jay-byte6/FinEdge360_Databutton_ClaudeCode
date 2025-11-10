import React, { useState, useEffect } from "react";
import { AccessCodeForm } from "components/AccessCodeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from "sonner";
import useFinancialDataStore from "utils/financialDataStore";
import useAuthStore from "utils/authStore";
import FinancialRoadmap from "@/components/FinancialRoadmap";
import FinancialLadder from "@/components/FinancialLadder";
import GuidelineBox from "@/components/GuidelineBox";

// Define interfaces for goals and SIP data
interface Goal {
  id: string;
  name: string;
  amount: number;
  deadline: number; // years
  type: 'Short-Term' | 'Mid-Term' | 'Long-Term';
}

interface SipCalculation {
  goalName: string;
  monthlySip: number;
}

const SIP_PLANNER_ACCESS_KEY = 'sip_planner_access_granted';

const SIPPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const { financialData } = useFinancialDataStore();

  // Check localStorage for persisted access
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem(SIP_PLANNER_ACCESS_KEY) === 'true';
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({ name: "", amount: 0, deadline: 0, type: 'Short-Term' });
  const [sipCalculations, setSipCalculations] = useState<SipCalculation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const ACCESS_CODE = "123456"; // Hardcoded access code

  // Load SIP planner data from database on mount and when access is granted
  useEffect(() => {
    const loadSIPPlannerData = async () => {
      if (!user || !user.id || !hasAccess) {
        setIsLoadingData(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8001/routes/get-sip-planner/${user.id}`);

        if (response.ok) {
          const data = await response.json();
          if (data && data.goals) {
            setGoals(data.goals);
            if (data.sipCalculations) {
              setSipCalculations(data.sipCalculations);
            }
          }
        }
      } catch (error) {
        console.error('Error loading SIP planner data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadSIPPlannerData();
  }, [user, hasAccess]);

  // Save SIP planner data to database
  const saveSIPPlannerData = async (updatedGoals: Goal[], calculations: SipCalculation[]) => {
    if (!user || !user.id) {
      toast.error("Authentication required", {
        description: "Please log in to save your SIP planner data.",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8001/routes/save-sip-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          goals: updatedGoals,
          sipCalculations: calculations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save SIP planner data');
      }

      toast.success("Data Saved!", {
        description: "Your SIP planner data has been saved to your profile.",
      });
    } catch (error) {
      console.error('Error saving SIP planner data:', error);
      toast.error("Save Failed", {
        description: "Could not save your SIP planner data. Please try again.",
      });
    }
  };

  const handleAccessGranted = () => {
    setHasAccess(true);
    // Persist access to localStorage
    localStorage.setItem(SIP_PLANNER_ACCESS_KEY, 'true');
  };

  const pmt = (rate: number, nper: number, pv: number, fv: number = 0, type: number = 0): number => {
    if (rate === 0) return -(pv + fv) / nper;
    const pvif = Math.pow(1 + rate, nper);
    let pmtVal = rate / (pvif - 1) * -(pv * pvif + fv);
    if (type === 1) {
      pmtVal /= (1 + rate);
    }
    return pmtVal;
  };

  const calculateSip = async () => {
    if (goals.length === 0) {
      toast.info("No goals added", { description: "Please add at least one financial goal to calculate SIPs." });
      return;
    }
    const calculations: SipCalculation[] = goals.map(goal => {
      let annualRate = 0;
      if (goal.type === 'Short-Term') annualRate = 0.06;
      else if (goal.type === 'Mid-Term') annualRate = 0.09;
      else if (goal.type === 'Long-Term') annualRate = 0.11;

      const monthlyRate = annualRate / 12;
      const nper = goal.deadline * 12; // months
      const monthlySip = -pmt(monthlyRate, nper, 0, goal.amount);
      return { goalName: goal.name, monthlySip: parseFloat(monthlySip.toFixed(2)) };
    });
    setSipCalculations(calculations);
    toast.success("SIPs Calculated", { description: `Successfully calculated SIPs for ${calculations.length} goal(s).` });

    // Save to database
    await saveSIPPlannerData(goals, calculations);
  };

  const handleAddGoal = async () => {
    if (!newGoal.name || newGoal.amount <= 0 || newGoal.deadline <= 0) {
      toast.error("Invalid Goal Input", { description: "Please ensure all fields are filled correctly for the new goal." });
      return;
    }
    const updatedGoals = [...goals, { ...newGoal, id: `goal${Date.now()}` }];
    setGoals(updatedGoals);
    setNewGoal({ name: "", amount: 0, deadline: 0, type: 'Short-Term' }); // Reset form
    toast.success("Goal Added", { description: `Successfully added goal: ${newGoal.name}.` });

    // Save to database (without calculations yet - those will be saved when user clicks "Calculate Required SIPs")
    await saveSIPPlannerData(updatedGoals, sipCalculations);
  };

  const totalMonthlySip = sipCalculations.reduce((sum, sip) => sum + sip.monthlySip, 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#33AAAA'];

  if (!hasAccess) {
    return (
      <AccessCodeForm expectedCode={ACCESS_CODE} onAccessGranted={handleAccessGranted}>
        {/* Placeholder for teaser content for MYA-36 */}
        <div className="text-center p-4 border-t border-gray-200 mt-6">
            <p className="text-lg font-semibold text-gray-700">Unlock Powerful Financial Planning Tools!</p>
            <p className="text-sm text-gray-500">Enter the access code to discover your SIP requirements and optimal portfolio allocation.</p>
        </div>
      </AccessCodeForm>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">SIP Goal Planner</h1>
        <p className="text-lg text-gray-600">Plan your investments to achieve your financial goals.</p>
      </header>

      {/* Guideline Box */}
      <GuidelineBox />

      {/* Loading State */}
      {isLoadingData && hasAccess && (
        <Card className="mb-8 shadow-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-blue-700 font-medium">Loading your SIP planner data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - only show when not loading */}
      {!isLoadingData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Add New Financial Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                  <Input
                    id="goalName"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    placeholder="e.g., Dream Car, Europe Trip"
                  />
                </div>
                <div>
                  <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={newGoal.amount}
                    onChange={(e) => setNewGoal({ ...newGoal, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 500000"
                  />
                </div>
                <div>
                  <label htmlFor="goalDeadline" className="block text-sm font-medium text-gray-700 mb-1">Deadline (Years)</label>
                  <Input
                    id="goalDeadline"
                    type="number"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label htmlFor="goalType" className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                  <Select
                    value={newGoal.type}
                    onValueChange={(value: 'Short-Term' | 'Mid-Term' | 'Long-Term') => setNewGoal({ ...newGoal, type: value })}
                  >
                    <SelectTrigger id="goalType">
                      <SelectValue placeholder="Select goal term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Short-Term">Short-Term (6% p.a.)</SelectItem>
                      <SelectItem value="Mid-Term">Mid-Term (9% p.a.)</SelectItem>
                      <SelectItem value="Long-Term">Long-Term (11% p.a.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddGoal} className="w-full bg-green-600 hover:bg-green-700">
                  Add Goal
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Financial Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <p className="text-gray-500 italic">No goals added yet. Add some goals to get started!</p>
                ) : (
                  <ul className="space-y-3">
                    {goals.map(goal => (
                      <li key={goal.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                        <p className="font-semibold text-gray-700">{goal.name}</p>
                        <p className="text-sm text-gray-600">Amount: ₹{goal.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Deadline: {goal.deadline} years ({goal.type})</p>
                      </li>
                    ))}
                  </ul>
                )}
                {goals.length > 0 && (
                    <Button onClick={calculateSip} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        Calculate Required SIPs
                    </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {sipCalculations.length > 0 && (
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Monthly SIP Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {sipCalculations.map(sip => (
                    <li key={sip.goalName} className="flex justify-between items-center p-3 bg-indigo-50 rounded-md">
                      <span className="font-medium text-indigo-700">{sip.goalName}:</span>
                      <span className="font-semibold text-indigo-900">₹{sip.monthlySip.toLocaleString()} per month</span>
                    </li>
                  ))}
                  <li className="flex justify-between items-center p-3 bg-green-100 rounded-md mt-4 border-t-2 border-green-500">
                    <span className="text-lg font-bold text-green-700">Total Monthly SIP:</span>
                    <span className="text-lg font-bold text-green-900">₹{totalMonthlySip.toLocaleString()}</span>
                  </li>
                </ul>

                {totalMonthlySip > 0 && (
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sipCalculations}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="monthlySip"
                          nameKey="goalName"
                        >
                          {sipCalculations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-6 text-xs text-gray-500 text-center">
                  Disclaimer: Assumed returns are indicative: Short-Term @ 6% p.a., Mid-Term @ 9% p.a., Long-Term @ 11% p.a. Actual returns may vary. Please consult a financial advisor.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Financial Roadmap Component */}
      {!isLoadingData && financialData && Object.keys(financialData).length > 0 && (
        <div className="mt-8">
          <FinancialRoadmap financialData={financialData} />
        </div>
      )}

      {/* Financial Ladder Component */}
      {!isLoadingData && financialData && Object.keys(financialData).length > 0 && (
        <div className="mt-8">
          <FinancialLadder financialData={financialData} />
        </div>
      )}
    </div>
  );
};

export default SIPPlanner;
