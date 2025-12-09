import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import useFinancialDataStore from '../utils/financialDataStore';
import useAuthStore from '../utils/authStore';
import { MilestoneCompletionCard } from '@/components/journey/MilestoneCompletionCard';
import { InfoTooltip } from '@/components/InfoTooltip';
import { calculateNetWorth, calculateBasicFIRENumber, calculateNewFIRENumber } from '../utils/financialCalculations';

type FIREMetrics = {
  annualExpenseInRetirement: number;
  requiredCorpus: number;
  yearsToFIRE: number;
  currentNetWorth: number;
  savingsRate: number;
  annualSavings: number;
  monthlyInvestmentNeeded: number;
  coastMonthlyInvestmentNeeded: number; // Added for Coast FIRE SIP
  leanFIRE: number;
  fatFIRE: number;
  coastFIRE: number;
  desiredCoastAge: number;
  inflationRate: number;
  retirementAge: number;
  yearlyExpensesToday: number;
  yearlyExpensesRetirement: number;
};

export default function FIRECalculator() {
  const navigate = useNavigate();
  const [fireMetrics, setFireMetrics] = useState<FIREMetrics | null>(null);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [calculationError, setCalculationError] = useState('');
  const [inflationRate, setInflationRate] = useState(6); // Default 6%
  const [retirementAge, setRetirementAge] = useState(60); // Default 60
  const [coastAge, setCoastAge] = useState(40); // Default 40 for Coast FIRE
  const [stepUpPercentage, setStepUpPercentage] = useState(10); // Default 10% savings step-up
  const [supposeRetireAge, setSupposeRetireAge] = useState(50); // Default 50 for Scenario 3

  // Use financial data store
  const { financialData, isLoading, error: storeError, fetchFinancialData } = useFinancialDataStore();
  const { user } = useAuthStore();

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers to show in lakhs/crores
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 crore = 10,000,000
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 lakh = 100,000
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  // Calculate FIRE metrics
  const calculateFIREMetrics = (data: any): FIREMetrics => {
    // Extract data
    const { personalInfo } = data;
    const monthlyExpenses = personalInfo.monthlyExpenses;
    const monthlySalary = personalInfo.monthlySalary;
    const age = personalInfo.age;

    // Calculate annual values
    const yearlyExpensesToday = monthlyExpenses * 12;
    const annualIncome = monthlySalary * 12;
    const annualSavings = Math.max(0, annualIncome - yearlyExpensesToday);

    // Calculate savings rate
    const savingsRate = annualIncome > 0 ? annualSavings / annualIncome : 0;

    // Calculate annual expenses in retirement with inflation adjustment
    // Formula: FV = PV * (1 + r)^n
    const yearsToRetirement = retirementAge - age;
    const inflationFactor = Math.pow(1 + (inflationRate / 100), yearsToRetirement);
    const yearlyExpensesRetirement = yearlyExpensesToday * inflationFactor;

    // Use centralized net worth calculation
    const currentNetWorth = calculateNetWorth(data);
    
    // Standard FIRE corpus calculation based on 4% safe withdrawal rate (25x multiplier)
    const requiredCorpus = yearlyExpensesRetirement * 25;
    
    // Lean FIRE (80% of expenses) - for more frugal lifestyle
    const leanFIRE = yearlyExpensesRetirement * 0.8 * 25;
    
    // FAT FIRE (200% of expenses) - for more luxurious lifestyle
    const fatFIRE = yearlyExpensesRetirement * 2 * 25;
    
    // Calculate years to FIRE
    // With conservative annual investment growth rate of 5%
    const growthRate = 0.05; // 5% conservative annual growth (FD/Debt funds)
    let years = 0;
    let currentCorpus = currentNetWorth;
    
    // Project growth until we reach the required corpus
    while (currentCorpus < requiredCorpus && years < 100) { // Cap at 100 years to prevent infinite loop
      currentCorpus = currentCorpus * (1 + growthRate) + annualSavings;
      years++;
    }
    
    // Calculate Coast FIRE
    // Coast FIRE is when your investments are enough that if left to grow until retirement age, you'll reach your FIRE number 
    // without further contributions
    const yearsToCoast = coastAge - age;
    const yearsCoastToRetirement = retirementAge - coastAge;
    const coastGrowthFactor = Math.pow(1 + growthRate, yearsCoastToRetirement);
    const coastFIRE = requiredCorpus / coastGrowthFactor;
    
    // Calculate monthly investment needed with 5% conservative returns
    // Using PMT formula: PMT = FV * r / ((1 + r)^n - 1)
    const monthlyRate = growthRate / 12; // Monthly growth rate
    const months = yearsToRetirement * 12; // Months to retirement
    
    let monthlyInvestmentNeeded = 0;
    if (months > 0 && monthlyRate > 0) {
      monthlyInvestmentNeeded = ((requiredCorpus - currentNetWorth * Math.pow(1 + monthlyRate, months)) * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    } else {
      // Simple division if we can't calculate using the formula
      monthlyInvestmentNeeded = Math.max(0, (requiredCorpus - currentNetWorth)) / (months || 1);
    }
    
    // Calculate monthly SIP required for Coast FIRE
    const coastMonths = yearsToCoast * 12; // Months to Coast FIRE age
    let coastMonthlyInvestmentNeeded = 0;
    if (coastMonths > 0 && monthlyRate > 0) {
      coastMonthlyInvestmentNeeded = ((coastFIRE - currentNetWorth * Math.pow(1 + monthlyRate, coastMonths)) * monthlyRate) / (Math.pow(1 + monthlyRate, coastMonths) - 1);
    } else {
      // Simple division if we can't calculate using the formula
      coastMonthlyInvestmentNeeded = Math.max(0, (coastFIRE - currentNetWorth)) / (coastMonths || 1);
    }
    
    // Generate projection data for charts
    const projections = [];
    let projectedCorpus = currentNetWorth;
    
    for (let year = 0; year <= Math.min(yearsToRetirement, 30); year++) { // Limit to 30 years for chart clarity
      projections.push({
        year: year,
        corpus: projectedCorpus,
        target: requiredCorpus,
      });
      
      projectedCorpus = projectedCorpus * (1 + growthRate) + annualSavings;
    }
    
    setProjectionData(projections);
    
    return {
      annualExpenseInRetirement: yearlyExpensesRetirement,
      requiredCorpus,
      yearsToFIRE: years,
      currentNetWorth,
      savingsRate,
      annualSavings,
      monthlyInvestmentNeeded,
      leanFIRE,
      fatFIRE,
      coastFIRE,
      coastMonthlyInvestmentNeeded,
      desiredCoastAge: coastAge,
      inflationRate,
      retirementAge,
      yearlyExpensesToday,
      yearlyExpensesRetirement,
    };
  };

  // Fetch financial data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the authenticated user's ID
        if (!user || !user.id) {
          if (!user) {
            console.log("No user logged in, redirecting to login");
            navigate('/login');
          }
          return;
        }
        await fetchFinancialData(user.id);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setCalculationError("Failed to load financial data. Have you entered your financial details?");
        toast.error("Could not load financial data");
      }
    };

    loadData();
  }, [user, fetchFinancialData, navigate]);

  // Calculate FIRE metrics when financial data changes or inputs change
  useEffect(() => {
    if (financialData) {
      try {
        const metrics = calculateFIREMetrics(financialData);
        setFireMetrics(metrics);
        setCalculationError('');
      } catch (error) {
        console.error("Error calculating FIRE metrics:", error);
        setCalculationError("Failed to calculate FIRE metrics. Please check your financial data.");
      }
    }
  }, [financialData, inflationRate, retirementAge, coastAge]);

  // Get consolidated error message
  const displayError = storeError || calculationError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-slate-200 h-24 w-24 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-gray-600">Calculating your path to financial independence...</p>
          </div>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{displayError}</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/enter-details')}>
                Enter Financial Details
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            FIRE Calculator
            <InfoTooltip content="FIRE stands for Financial Independence, Retire Early. It's a movement focused on saving and investing to retire much earlier than traditional retirement age." />
          </h1>
          <p className="text-gray-600">Track your journey to Financial Independence and Retire Early</p>
        </div>

        {/* FIRE Calculator Input Section */}
        <Card className="lg:col-span-3 mb-8 shadow-md">
          <CardHeader>
            <CardTitle>FIRE Calculator Settings</CardTitle>
            <CardDescription>Adjust parameters to see how your FIRE scenarios change in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="inflationRate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Inflation Rate (%)
                  <InfoTooltip content="The rate at which the general level of prices for goods and services rises, reducing purchasing power. In India, average inflation is around 5-6%." />
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="inflationRate"
                    min="1"
                    max="10"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 w-12">{inflationRate}%</span>
                </div>
              </div>
              <div>
                <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Retirement Age (Max)
                  <InfoTooltip content="The maximum age at which you want to retire. Used in Scenarios 1, 2, and 4." />
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="retirementAge"
                    min="40"
                    max="70"
                    step="1"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 w-12">{retirementAge}</span>
                </div>
              </div>
              <div>
                <label htmlFor="stepUpPercentage" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Savings Step-Up (%)
                  <InfoTooltip content="Annual increase in your savings amount. E.g., 10% means if you save ₹50k this year, you'll save ₹55k next year." />
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="stepUpPercentage"
                    min="0"
                    max="20"
                    step="1"
                    value={stepUpPercentage}
                    onChange={(e) => setStepUpPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 w-12">{stepUpPercentage}%</span>
                </div>
              </div>
              <div>
                <label htmlFor="supposeRetireAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Scenario 3: Retire Age
                  <InfoTooltip content="What age do you want to explore retiring at? Used only in Scenario 3." />
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="supposeRetireAge"
                    min={financialData?.personalInfo.age || 30}
                    max={retirementAge}
                    step="1"
                    value={supposeRetireAge}
                    onChange={(e) => setSupposeRetireAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 w-12">{supposeRetireAge}</span>
                </div>
              </div>
              <div>
                <label htmlFor="coastAge" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Coast FIRE Age
                  <InfoTooltip content="Coast FIRE: The age when you've saved enough that compound growth will reach your FIRE goal by retirement. You can stop saving and just 'coast' on investment returns." />
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="coastAge"
                    min={financialData?.personalInfo.age || 30}
                    max={retirementAge - 5}
                    step="1"
                    value={coastAge}
                    onChange={(e) => setCoastAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 w-12">{coastAge}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {fireMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Primary FIRE Metrics Card */}
            <Card className="lg:col-span-3 bg-gradient-to-r from-blue-50 to-green-50 border-blue-100 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-gray-800">Your FIRE Number</CardTitle>
                <CardDescription>The amount you need to retire comfortably at age {fireMetrics.retirementAge}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="text-4xl md:text-5xl font-bold text-center md:text-left mb-4 md:mb-0">
                    {formatIndianCurrency(fireMetrics.requiredCorpus)}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center min-w-40">
                      <p className="text-blue-700 text-sm font-medium">Years to FIRE</p>
                      <p className="text-blue-800 text-xl font-bold">{fireMetrics.yearsToFIRE.toFixed(1)} years</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-center min-w-40">
                      <p className="text-green-700 text-sm font-medium">Savings Rate</p>
                      <p className="text-green-800 text-xl font-bold">{(fireMetrics.savingsRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                {/* Expense table for current and retirement */}
                <div className="mt-6 bg-white rounded-lg border border-gray-100 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-green-50">Desired monthly expenses (today)</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-green-50">{formatCurrency(financialData?.personalInfo.monthlyExpenses || 0)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-green-50">Current age</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-green-50">{financialData?.personalInfo.age || 30}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-green-50">Retirement age</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-green-50">{fireMetrics.retirementAge}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-green-50">Inflation</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-green-50">{fireMetrics.inflationRate}%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-red-50">Yearly expenses (today)</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-red-50">{formatCurrency(fireMetrics.yearlyExpensesToday)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-red-50">Yearly expenses (retirement age)</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-red-50">{formatCurrency(fireMetrics.yearlyExpensesRetirement)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 bg-red-50">Lean FIRE</td>
                        <td className="px-4 py-2 text-sm text-right font-bold text-gray-900 bg-red-50">{formatCurrency(fireMetrics.leanFIRE)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 bg-red-50">FIRE</td>
                        <td className="px-4 py-2 text-sm text-right font-bold text-gray-900 bg-red-50">{formatCurrency(fireMetrics.requiredCorpus)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 bg-red-50">FAT FIRE</td>
                        <td className="px-4 py-2 text-sm text-right font-bold text-gray-900 bg-red-50">{formatCurrency(fireMetrics.fatFIRE)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900 bg-green-50">Desired Coast FIRE Age</td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 bg-green-50">{fireMetrics.desiredCoastAge}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 bg-red-50">Coast FIRE</td>
                        <td className="px-4 py-2 text-sm text-right font-bold text-gray-900 bg-red-50">{formatCurrency(fireMetrics.coastFIRE)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* FIRE Types Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>FIRE Types</CardTitle>
                <CardDescription>Different FIRE targets based on lifestyle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 flex items-center">
                        Lean FIRE (80% expenses)
                        <InfoTooltip content="Lean FIRE: Achieve financial independence with a more frugal lifestyle, requiring only 80% of your standard expenses. Faster to achieve but requires disciplined spending." />
                      </span>
                      <span className="text-sm font-medium">{formatIndianCurrency(fireMetrics.leanFIRE)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: `80%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Regular FIRE</span>
                      <span className="text-sm font-medium">{formatIndianCurrency(fireMetrics.requiredCorpus)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `100%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 flex items-center">
                        Fat FIRE (200% expenses)
                        <InfoTooltip content="Fat FIRE: Retire with a luxurious lifestyle, requiring 200% of your standard expenses. Takes longer to achieve but provides maximum financial comfort." />
                      </span>
                      <span className="text-sm font-medium">{formatIndianCurrency(fireMetrics.fatFIRE)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `100%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Current Progress</CardTitle>
                <CardDescription>Your net worth vs. required corpus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Current Net Worth</span>
                    <span className="text-sm font-medium text-gray-800">{formatIndianCurrency(fireMetrics.currentNetWorth)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min((fireMetrics.currentNetWorth / fireMetrics.requiredCorpus) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{(fireMetrics.currentNetWorth / fireMetrics.requiredCorpus * 100).toFixed(1)}% complete</span>
                    <span className="text-xs text-gray-500">Target: {formatIndianCurrency(fireMetrics.requiredCorpus)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Coast FIRE</CardTitle>
                <CardDescription>Save until age {fireMetrics.desiredCoastAge}, then cover only expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {formatIndianCurrency(fireMetrics.coastFIRE)}
                </div>
                <p className="text-sm text-gray-600">The amount you need by age {fireMetrics.desiredCoastAge} so your investments can grow until retirement at age {fireMetrics.retirementAge}</p>
                <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100">
                  <p className="text-xs text-amber-800">Your investments continue to grow at 5% annually (conservative) while you only cover your expenses after age {fireMetrics.desiredCoastAge}</p>
                </div>
              </CardContent>
            </Card>

          {/* Required Monthly SIPs Section - Simplified & Side-by-Side */}
          <div className="mb-10 lg:col-span-3">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Your SIP Investment Plan</h2>
            <p className="text-md text-gray-600 mb-8 text-center">Key monthly investments to reach your financial independence.</p>
          </div>
          {/* SIP boxes made significantly WIDER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 max-w-screen-2xl mx-auto px-4 lg:col-span-3">
            {/* Regular FIRE SIP Card - Simplified */}
            <Card className="shadow-xl border border-blue-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="bg-blue-100 p-5">
                <CardTitle className="text-xl font-semibold text-blue-800 text-center">Regular FIRE SIP Target</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-grow items-center justify-center">
                <div className="text-center mb-3">
                  <span className="text-5xl font-extrabold text-blue-800">{formatCurrency(fireMetrics.monthlyInvestmentNeeded)}</span>
                  <span className="text-xl font-normal text-gray-500"> /month</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2 text-center w-full">
                  <p className="text-sm text-blue-700">
                    Goal: <span className="font-bold text-blue-800">{formatIndianCurrency(fireMetrics.requiredCorpus)}</span> total corpus by age {fireMetrics.retirementAge} (includes current net worth). This SIP is the additional monthly investment needed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Coast FIRE SIP Card - Simplified */}
            <Card className="shadow-xl border border-green-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="bg-green-100 p-5">
                <CardTitle className="text-xl font-semibold text-green-800 text-center">Coast FIRE SIP Target</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-grow items-center justify-center">
                <div className="text-center mb-3">
                  <span className="text-5xl font-extrabold text-green-800">{formatCurrency(fireMetrics.coastMonthlyInvestmentNeeded)}</span>
                  <span className="text-xl font-normal text-gray-500"> /month</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-2 text-center w-full">
                  <p className="text-sm text-green-700">
                    Goal: <span className="font-bold text-green-800">{formatIndianCurrency(fireMetrics.coastFIRE)}</span> total corpus by age {fireMetrics.desiredCoastAge} (includes current net worth). This SIP is the additional monthly investment needed for this milestone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Removed Disclaimer Box */}

          <div className="text-center mb-12 lg:col-span-3">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-transform duration-150 ease-in-out transform hover:scale-105"
              onClick={() => navigate('/portfolio')}
            >
              Unlock Your Faster FIRE Path: Optimize with Portfolio Allocator!
            </Button>
          </div>

            {/* Projection Chart Card */}
            <Card className="lg:col-span-3 shadow-md">
              <CardHeader>
                <CardTitle>Corpus Growth Projection</CardTitle>
                <CardDescription>Projected growth of your investments over time</CardDescription>
              </CardHeader>
              <CardContent>
                {projectionData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={projectionData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis 
                          tickFormatter={(value) => {
                            if (value >= 10000000) return `${(value / 10000000).toFixed(0)}Cr`;
                            if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
                            return value;
                          }} 
                          label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Amount']} 
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="corpus" 
                          name="Projected Corpus" 
                          stroke="#4ade80" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          name="FIRE Target" 
                          stroke="#f87171" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <p>No projection data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FIRE Summary Card */}
            <Card className="lg:col-span-3 shadow-md">
              <CardHeader>
                <CardTitle>FIRE Strategy Dashboard</CardTitle>
                <CardDescription>Comprehensive overview of your financial independence path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Current Financial Snapshot</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Current Age</span>
                        <span className="font-medium">{financialData?.personalInfo.age || 30} years</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Monthly Income</span>
                        <span className="font-medium">{formatCurrency(financialData?.personalInfo.monthlySalary || 0)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Monthly Expenses</span>
                        <span className="font-medium">{formatCurrency(financialData?.personalInfo.monthlyExpenses || 0)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Monthly Savings</span>
                        <span className="font-medium">{formatCurrency((financialData?.personalInfo.monthlySalary || 0) - (financialData?.personalInfo.monthlyExpenses || 0))}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Current Net Worth</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.currentNetWorth)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Years to Retirement</span>
                        <span className="font-medium">{retirementAge - (financialData?.personalInfo.age || 30)} years</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">FIRE Strategies Comparison</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Lean FIRE (80% expenses)</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.leanFIRE)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Standard FIRE</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.requiredCorpus)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Fat FIRE (200% expenses)</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.fatFIRE)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Coast FIRE (at age {fireMetrics.desiredCoastAge})</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.coastFIRE)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Current Savings Rate</span>
                        <span className="font-medium">{(fireMetrics.savingsRate * 100).toFixed(1)}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Monthly SIP (Regular FIRE)</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.monthlyInvestmentNeeded)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Monthly SIP (Coast FIRE)</span>
                        <span className="font-medium">{formatCurrency(fireMetrics.coastMonthlyInvestmentNeeded)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">FIRE Timeline Insights</h3>
                    <p className="text-sm text-blue-700">
                      With your current savings rate of <span className="font-bold">{(fireMetrics.savingsRate * 100).toFixed(1)}%</span>, you could achieve financial independence in approximately <span className="font-bold">{fireMetrics.yearsToFIRE.toFixed(1)} years</span>. 
                      Increasing your monthly SIP to {formatCurrency(fireMetrics.monthlyInvestmentNeeded * 1.2)} could reduce this timeline by about {Math.max(1, Math.floor(fireMetrics.yearsToFIRE * 0.2))} years.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <h3 className="font-medium text-amber-800 mb-2">Coast FIRE Strategy</h3>
                    <p className="text-sm text-amber-700">
                      If you save {formatIndianCurrency(fireMetrics.coastFIRE)} by age {fireMetrics.desiredCoastAge}, you could potentially stop adding to investments and only cover your expenses until retirement. 
                      Your investments would continue growing at an assumed 5% annually (conservative) to reach your FIRE number of {formatIndianCurrency(fireMetrics.requiredCorpus)} by age {fireMetrics.retirementAge}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4 FIRE SCENARIOS SECTION */}
            <div className="lg:col-span-3 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  🔥 Your 4 FIRE Scenarios
                </h2>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Discover Your Path to Financial Freedom
                </p>
                <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                  Four personalized scenarios showing exactly when and how you can achieve Financial Independence.
                  Each scenario is tailored to your unique financial situation and goals.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Scenario 1: RETIRE NOW */}
                {(() => {
                  const currentAge = financialData?.personalInfo.age || 30;
                  const monthlyExpenses = financialData?.personalInfo.monthlyExpenses || 0;
                  const yearsToRetirement = retirementAge - currentAge;
                  const annualExpenses = monthlyExpenses * 12;

                  // Since inflation = returns (6%), real return = 0
                  const totalExpensesTillRetirement = annualExpenses * yearsToRetirement;
                  const survivalYears = fireMetrics ? fireMetrics.currentNetWorth / annualExpenses : 0;
                  const shortfallYears = Math.max(0, yearsToRetirement - survivalYears);
                  const shortfall = shortfallYears * annualExpenses;

                  return (
                    <Card className="border-2 border-orange-400 hover:border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b-2 border-orange-200">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
                            <span className="text-2xl">🏖️</span>
                            <span>What if I RETIRE NOW?</span>
                          </CardTitle>
                          <InfoTooltip content="Imagine retiring today and living off your current savings until age 60. This scenario assumes your money grows slowly (just matching inflation at 6% per year), with no additional income. It answers: 'Can I stop working right now and still maintain my lifestyle?' This is your 'Coast FIRE' dream - the ultimate freedom test!" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-2 pb-3">
                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Money Needed Today</span>
                          <span className="text-lg font-bold text-gray-900">₹{(totalExpensesTillRetirement / 10000000).toFixed(2)} Cr</span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">You Have</span>
                          <span className="text-base font-semibold text-gray-800">{fireMetrics && formatIndianCurrency(fireMetrics.currentNetWorth)}</span>
                        </div>

                        {shortfall > 0 ? (
                          <div className="border border-red-300 bg-red-50 p-2 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-red-900">⚠️ Shortfall</span>
                              <span className="text-base font-bold text-red-700">₹{(shortfall / 10000000).toFixed(2)} Cr</span>
                            </div>
                            <p className="text-xs text-red-700">
                              Can survive: {Math.floor(survivalYears)} yrs (till age {currentAge + Math.floor(survivalYears)}) • Need: {Math.ceil(shortfallYears)} more yrs
                            </p>
                          </div>
                        ) : (
                          <div className="border border-green-400 bg-green-50 p-2 rounded">
                            <p className="text-xs font-semibold text-green-900">✅ Can Retire NOW till age {retirementAge}!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Scenario 2: WHEN CAN I RETIRE */}
                {(() => {
                  const currentAge = financialData?.personalInfo.age || 30;
                  const monthlyExpenses = financialData?.personalInfo.monthlyExpenses || 0;
                  const monthlySavings = (financialData?.personalInfo.monthlySalary || 0) - monthlyExpenses;
                  const annualSavings = monthlySavings * 12;
                  const annualExpenses = monthlyExpenses * 12;

                  // Calculate years with dynamic step-up savings
                  const stepUpRate = stepUpPercentage / 100;
                  let yearCount = 0;
                  let totalSavings = 0;
                  let currentSavings = annualSavings;

                  while (yearCount < 50) {
                    totalSavings += currentSavings;
                    const expensesCovered = annualExpenses * yearCount;

                    if (totalSavings >= expensesCovered) {
                      break;
                    }

                    currentSavings *= (1 + stepUpRate);
                    yearCount++;
                  }

                  const retireAge = currentAge + yearCount;
                  const canRetireEarly = retireAge < retirementAge;

                  // Projected net worth at retirement age
                  const yearsToRetirement = retirementAge - currentAge;
                  const netWorthAtRetirement = fireMetrics
                    ? fireMetrics.currentNetWorth * Math.pow(1.06, yearsToRetirement) + (annualSavings * ((Math.pow(1 + stepUpRate, yearsToRetirement) - 1) / stepUpRate))
                    : 0;

                  return (
                    <Card className="border-2 border-blue-400 hover:border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-blue-100 to-cyan-100 border-b-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <span className="text-2xl">⏰</span>
                            <span>When Can I RETIRE?</span>
                          </CardTitle>
                          <InfoTooltip content="Your personalized retirement timeline! This shows exactly when you can retire if you keep saving consistently. We factor in your increasing savings (as your income grows by 10% yearly) and conservative 6% investment returns. It answers: 'When will I have enough to never work again?' This is your countdown to freedom - the date that changes your life!" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-2 pb-3">
                        {canRetireEarly ? (
                          <div className="border border-green-400 bg-green-50 p-2 rounded text-center">
                            <p className="text-xs font-semibold text-green-900 mb-1">✨ Can retire in</p>
                            <p className="text-2xl font-bold text-green-700">{yearCount} years</p>
                            <p className="text-xs text-green-800 mt-1">at age <strong>{retireAge}</strong> ({retirementAge - retireAge} yrs before {retirementAge}!)</p>
                          </div>
                        ) : (
                          <div className="border border-yellow-400 bg-yellow-50 p-2 rounded text-center">
                            <p className="text-xs font-semibold text-yellow-900 mb-1">⏳ Need to work</p>
                            <p className="text-2xl font-bold text-yellow-700">{yearCount} years</p>
                            <p className="text-xs text-yellow-800 mt-1">Retire at age <strong>{retireAge}</strong></p>
                          </div>
                        )}

                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Net Worth at {retirementAge}</span>
                          <span className="text-base font-semibold text-gray-800">₹{(netWorthAtRetirement / 10000000).toFixed(2)} Cr</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="py-1 px-2 bg-gray-50 rounded text-center">
                            <p className="text-xs text-gray-500">Current</p>
                            <p className="text-sm font-bold text-gray-900">{currentAge}</p>
                          </div>
                          <div className="py-1 px-2 bg-gray-50 rounded text-center">
                            <p className="text-xs text-gray-500">Retire</p>
                            <p className="text-sm font-bold text-gray-900">{retireAge}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Scenario 3: SUPPOSE I RETIRE AT */}
                {(() => {
                  const currentAge = financialData?.personalInfo.age || 30;
                  const yearsToSuppose = supposeRetireAge - currentAge;
                  const monthlyExpenses = financialData?.personalInfo.monthlyExpenses || 0;
                  const monthlySavings = (financialData?.personalInfo.monthlySalary || 0) - monthlyExpenses;

                  // Net worth at suppose age
                  const netWorthAtSuppose = fireMetrics && yearsToSuppose > 0
                    ? fireMetrics.currentNetWorth * Math.pow(1.06, yearsToSuppose)
                    : fireMetrics?.currentNetWorth || 0;

                  // Savings accumulated till suppose age
                  const annualSavings = monthlySavings * 12;
                  const stepUpRate = stepUpPercentage / 100;
                  const savingsAccumulated = yearsToSuppose > 0 && stepUpRate > 0
                    ? annualSavings * ((Math.pow(1 + stepUpRate, yearsToSuppose) - 1) / stepUpRate)
                    : 0;

                  const totalWealthAtSuppose = netWorthAtSuppose + savingsAccumulated;

                  // FIRE number at suppose age
                  const inflationFactor = Math.pow(1 + (inflationRate / 100), yearsToSuppose);
                  const expensesAtSuppose = monthlyExpenses * inflationFactor;
                  const fireNumberAtSuppose = expensesAtSuppose * 12 * 25;

                  const shortfall = Math.max(0, fireNumberAtSuppose - totalWealthAtSuppose);
                  const surplus = Math.max(0, totalWealthAtSuppose - fireNumberAtSuppose);

                  // Extra SIP needed (rough calculation)
                  const extraSIPNeeded = yearsToSuppose > 0 && shortfall > 0
                    ? shortfall / (yearsToSuppose * 12)
                    : 0;

                  return (
                    <Card className="border-2 border-purple-400 hover:border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            <span>SUPPOSE I RETIRE at {supposeRetireAge}?</span>
                          </CardTitle>
                          <InfoTooltip content={`Your 'What-If' early retirement scenario! Ever dreamed of retiring at a specific age? This shows if you can hit FIRE at your target age (currently set to ${supposeRetireAge}). We calculate your wealth at that age with your growing savings and see if it covers your expenses till 60. It answers: 'Can I really retire at ${supposeRetireAge}?' This is your early retirement reality check - turn your dream age into an actionable plan!`} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-2 pb-3">
                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">FIRE Need at {supposeRetireAge}</span>
                          <span className="text-lg font-bold text-gray-900">₹{(fireNumberAtSuppose / 10000000).toFixed(2)} Cr</span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Your Wealth at {supposeRetireAge}</span>
                          <span className="text-base font-semibold text-gray-800">₹{(totalWealthAtSuppose / 10000000).toFixed(2)} Cr</span>
                        </div>

                        {shortfall > 0 ? (
                          <>
                            <div className="border border-red-300 bg-red-50 p-2 rounded">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-red-900">⚠️ Shortfall</span>
                                <span className="text-base font-bold text-red-700">₹{(shortfall / 10000000).toFixed(2)} Cr</span>
                              </div>
                              <p className="text-xs text-red-700">
                                Need extra SIP: ₹{Math.round(extraSIPNeeded).toLocaleString()}/mo or increase step-up%
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="border border-green-400 bg-green-50 p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-green-900">✅ On Track!</span>
                              <span className="text-sm font-bold text-green-700">₹{(surplus / 10000000).toFixed(2)} Cr surplus</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Scenario 4: ACTUAL FIRE AT RETIREMENT AGE */}
                {(() => {
                  const currentAge = financialData?.personalInfo.age || 30;
                  const monthlyExpenses = financialData?.personalInfo.monthlyExpenses || 0;
                  const monthlySavings = (financialData?.personalInfo.monthlySalary || 0) - monthlyExpenses;
                  const yearsToRetirement = retirementAge - currentAge;

                  // FIRE number at retirement age
                  const inflationFactor = Math.pow(1 + (inflationRate / 100), yearsToRetirement);
                  const expensesAtRetirement = monthlyExpenses * inflationFactor;
                  const fireNumberAtRetirement = expensesAtRetirement * 12 * 25;

                  // Projected wealth at retirement age
                  const annualSavings = monthlySavings * 12;
                  const stepUpRate = stepUpPercentage / 100;
                  const netWorthAtRetirement = fireMetrics && yearsToRetirement > 0
                    ? fireMetrics.currentNetWorth * Math.pow(1.06, yearsToRetirement)
                    : fireMetrics?.currentNetWorth || 0;
                  const savingsAtRetirement = yearsToRetirement > 0 && stepUpRate > 0
                    ? annualSavings * ((Math.pow(1 + stepUpRate, yearsToRetirement) - 1) / stepUpRate)
                    : 0;
                  const totalWealthAtRetirement = netWorthAtRetirement + savingsAtRetirement;

                  const shortfall = Math.max(0, fireNumberAtRetirement - totalWealthAtRetirement);
                  const surplus = Math.max(0, totalWealthAtRetirement - fireNumberAtRetirement);

                  // With 10% lifestyle cut
                  const reducedExpenses = monthlyExpenses * 0.9;
                  const reducedExpensesAtRetirement = reducedExpenses * inflationFactor;
                  const reducedFIREAtRetirement = reducedExpensesAtRetirement * 12 * 25;
                  const newShortfall = Math.max(0, reducedFIREAtRetirement - totalWealthAtRetirement);
                  const newSurplus = Math.max(0, totalWealthAtRetirement - reducedFIREAtRetirement);

                  return (
                    <Card className="border-2 border-green-400 hover:border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-green-900 flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            <span>My ACTUAL FIRE at {retirementAge}</span>
                          </CardTitle>
                          <InfoTooltip content={`Your complete financial independence picture at traditional retirement age (${retirementAge})! This is the most realistic scenario - it shows exactly how much wealth you'll have if you keep saving and investing consistently. We account for inflation eating away at your money and your rising income boosting your savings. It answers: 'Will I have enough at 60, and by how much?' This is your financial security scorecard - your peace of mind number!`} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-2 pb-3">
                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">FIRE at {retirementAge}</span>
                          <span className="text-lg font-bold text-gray-900">₹{(fireNumberAtRetirement / 10000000).toFixed(2)} Cr</span>
                        </div>

                        <div className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs text-gray-600">Projected Wealth</span>
                          <span className="text-base font-semibold text-gray-800">₹{(totalWealthAtRetirement / 10000000).toFixed(2)} Cr</span>
                        </div>

                        {shortfall > 0 ? (
                          <div className="border border-yellow-400 bg-yellow-50 p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-yellow-900">⚠️ Shortfall</span>
                              <span className="text-base font-bold text-yellow-700">₹{(shortfall / 10000000).toFixed(2)} Cr</span>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-green-400 bg-green-50 p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-green-900">✅ Surplus!</span>
                              <span className="text-base font-bold text-green-700">₹{(surplus / 10000000).toFixed(2)} Cr</span>
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-100 border border-gray-300 p-2 rounded">
                          <p className="text-xs font-semibold text-gray-800 mb-1">💡 With 10% Lifestyle Cut</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Reduced FIRE:</span>
                            <span className="font-semibold text-gray-800">₹{(reducedFIREAtRetirement / 10000000).toFixed(2)} Cr</span>
                          </div>
                          {newShortfall > 0 ? (
                            <p className="text-xs text-red-700 mt-1">Gap: ₹{(newShortfall / 10000000).toFixed(2)} Cr</p>
                          ) : (
                            <p className="text-xs text-green-700 mt-1">✅ Surplus: ₹{(newSurplus / 10000000).toFixed(2)} Cr</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate('/enter-details')}>
            Update Financial Details
          </Button>
        </div>

        {/* Milestone 2 Completion Card */}
        {fireMetrics && (
          <MilestoneCompletionCard
            milestoneNumber={2}
            title="Calculate Your FIRE Number"
            completionCriteria={[
              {
                label: "FIRE number calculated",
                checked: fireMetrics.requiredCorpus > 0,
                description: "Your FIRE number represents the corpus needed for financial independence"
              },
              {
                label: "Retirement age defined",
                checked: fireMetrics.retirementAge > 0,
                description: "Set your desired retirement age to plan your FIRE journey"
              },
              {
                label: "Years to FIRE estimated",
                checked: fireMetrics.yearsToFIRE > 0,
                description: "Understand how long it will take to reach financial independence"
              },
              {
                label: "Monthly SIP calculated",
                checked: fireMetrics.monthlyInvestmentNeeded > 0,
                description: "Know how much to invest monthly to achieve FIRE"
              }
            ]}
            helpResources={{
              guide: "https://www.investopedia.com/terms/f/financial-independence-retire-early-fire.asp",
              tutorial: "https://youtu.be/example-fire-tutorial"
            }}
            onComplete={() => {
              toast.success('Milestone 2 completed! Your FIRE journey is mapped out.');
            }}
          />
        )}
      </div>
    </div>
  );
}
