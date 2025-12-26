import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, ArrowRight } from 'lucide-react';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';

interface FIREScenariosCardProps {
  financialData: any;
  isPremium: boolean;
  retirementAge?: number;
  inflationRate?: number;
  stepUpPercentage?: number;
  supposeRetireAge?: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

export const FIREScenariosCard: React.FC<FIREScenariosCardProps> = ({
  financialData,
  isPremium,
  retirementAge = 60,
  inflationRate = 6,
  stepUpPercentage = 10,
  supposeRetireAge = 50
}) => {
  const navigate = useNavigate();

  if (!financialData) return null;

  const currentAge = financialData?.personalInfo.age || 30;
  const monthlyExpenses = financialData?.personalInfo.monthlyExpenses || 0;
  const monthlySalary = financialData?.personalInfo.monthlySalary || 0;
  const monthlySavings = monthlySalary - monthlyExpenses;
  const annualExpenses = monthlyExpenses * 12;
  const annualSavings = monthlySavings * 12;

  // Calculate net worth
  const calculateNetWorth = () => {
    const { assets, liabilities } = financialData;
    const totalIlliquidAssets = Object.values(assets?.illiquid || {}).reduce((sum: number, val: any) => sum + (val || 0), 0);
    const totalLiquidAssets = Object.values(assets?.liquid || {}).reduce((sum: number, val: any) => sum + (val || 0), 0);
    const totalAssets = totalIlliquidAssets + totalLiquidAssets;
    const totalLiabilities = Object.values(liabilities || {}).reduce((sum: number, val: any) => sum + (val || 0), 0);
    return totalAssets - totalLiabilities;
  };

  const currentNetWorth = calculateNetWorth();
  const yearsToRetirement = retirementAge - currentAge;

  // SCENARIO 1: RETIRE NOW (Coast FIRE)
  const totalExpensesTillRetirement = annualExpenses * yearsToRetirement;
  const survivalYears = currentNetWorth / annualExpenses;
  const shortfallYears = Math.max(0, yearsToRetirement - survivalYears);
  const shortfall1 = shortfallYears * annualExpenses;

  // SCENARIO 2: WHEN CAN I RETIRE
  const stepUpRate = stepUpPercentage / 100;
  let yearCount = 0;
  let totalSavings = 0;
  let currentSavingsCalc = annualSavings;

  while (yearCount < 50) {
    totalSavings += currentSavingsCalc;
    const expensesCovered = annualExpenses * yearCount;
    if (totalSavings >= expensesCovered) break;
    currentSavingsCalc *= (1 + stepUpRate);
    yearCount++;
  }

  const retireAge = currentAge + yearCount;
  const canRetireEarly = retireAge < retirementAge;

  // SCENARIO 3: SUPPOSE I RETIRE AT
  const yearsToSuppose = supposeRetireAge - currentAge;
  const netWorthAtSuppose = yearsToSuppose > 0
    ? currentNetWorth * Math.pow(1.06, yearsToSuppose)
    : currentNetWorth;

  const savingsAccumulated = yearsToSuppose > 0 && stepUpRate > 0
    ? annualSavings * ((Math.pow(1 + stepUpRate, yearsToSuppose) - 1) / stepUpRate)
    : 0;

  const totalWealthAtSuppose = netWorthAtSuppose + savingsAccumulated;
  const inflationFactor3 = Math.pow(1 + (inflationRate / 100), yearsToSuppose);
  const expensesAtSuppose = monthlyExpenses * inflationFactor3;
  const fireNumberAtSuppose = expensesAtSuppose * 12 * 25;
  const shortfall3 = Math.max(0, fireNumberAtSuppose - totalWealthAtSuppose);
  const canRetireAtSuppose = shortfall3 === 0;

  // SCENARIO 4: ACTUAL FIRE AT RETIREMENT AGE
  const inflationFactor4 = Math.pow(1 + (inflationRate / 100), yearsToRetirement);
  const expensesAtRetirement = monthlyExpenses * inflationFactor4;
  const fireNumberAtRetirement = expensesAtRetirement * 12 * 25;

  const netWorthAtRetirement = yearsToRetirement > 0
    ? currentNetWorth * Math.pow(1.06, yearsToRetirement)
    : currentNetWorth;
  const savingsAtRetirement = yearsToRetirement > 0 && stepUpRate > 0
    ? annualSavings * ((Math.pow(1 + stepUpRate, yearsToRetirement) - 1) / stepUpRate)
    : 0;
  const totalWealthAtRetirement = netWorthAtRetirement + savingsAtRetirement;
  const shortfall4 = Math.max(0, fireNumberAtRetirement - totalWealthAtRetirement);
  const surplus4 = Math.max(0, totalWealthAtRetirement - fireNumberAtRetirement);

  return (
    <Card className="relative">
      {!isPremium && <LockedFeatureOverlay featureName="4 FIRE Scenarios Overview" />}

      <CardHeader className={!isPremium ? 'filter blur-sm' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600" />
            Your 4 FIRE Scenarios
          </CardTitle>
          {isPremium && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/fire-calculator')}
              className="text-xs text-blue-600"
            >
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Four personalized scenarios showing when and how you can achieve Financial Independence
        </p>
      </CardHeader>

      <CardContent className={`space-y-3 ${!isPremium ? 'filter blur-sm' : ''}`}>
        {/* Scenario 1: RETIRE NOW */}
        <div
          onClick={() => isPremium && navigate('/fire-calculator')}
          className={`p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-orange-900 flex items-center gap-1">
                <span className="text-lg">🏖️</span>
                What if I RETIRE NOW?
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Money needed: {formatCurrency(totalExpensesTillRetirement)}
              </p>
            </div>
          </div>
          {shortfall1 > 0 ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-700">⚠️ Shortfall</span>
              <span className="font-bold text-red-800">{formatCurrency(shortfall1)}</span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-green-700">✅ Can Retire NOW till age {retirementAge}!</p>
          )}
        </div>

        {/* Scenario 2: WHEN CAN I RETIRE */}
        <div
          onClick={() => isPremium && navigate('/fire-calculator')}
          className={`p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900 flex items-center gap-1">
                <span className="text-lg">⏰</span>
                When Can I RETIRE?
              </p>
              {canRetireEarly ? (
                <p className="text-xs text-green-700 font-semibold mt-1">
                  ✨ Can retire in {yearCount} years (at age {retireAge})
                </p>
              ) : (
                <p className="text-xs text-yellow-700 font-semibold mt-1">
                  ⏳ Need to work {yearCount} years (retire at {retireAge})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scenario 3: SUPPOSE I RETIRE AT */}
        <div
          onClick={() => isPremium && navigate('/fire-calculator')}
          className={`p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-bold text-purple-900 flex items-center gap-1">
                <span className="text-lg">🎯</span>
                SUPPOSE I RETIRE at {supposeRetireAge}?
              </p>
              <p className="text-xs text-purple-700 mt-1">
                FIRE needed: {formatCurrency(fireNumberAtSuppose)}
              </p>
            </div>
          </div>
          {canRetireAtSuppose ? (
            <p className="text-xs font-semibold text-green-700">✅ On track to retire at {supposeRetireAge}!</p>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-700">⚠️ Shortfall</span>
              <span className="font-bold text-yellow-800">{formatCurrency(shortfall3)}</span>
            </div>
          )}
        </div>

        {/* Scenario 4: ACTUAL FIRE AT RETIREMENT AGE */}
        <div
          onClick={() => isPremium && navigate('/fire-calculator')}
          className={`p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900 flex items-center gap-1">
                <span className="text-lg">💰</span>
                My ACTUAL FIRE at {retirementAge}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Projected wealth: {formatCurrency(totalWealthAtRetirement)}
              </p>
            </div>
          </div>
          {shortfall4 > 0 ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-700">⚠️ Shortfall</span>
              <span className="font-bold text-yellow-800">{formatCurrency(shortfall4)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-700 font-semibold">✅ Surplus</span>
              <span className="font-bold text-green-800">{formatCurrency(surplus4)}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        {isPremium && (
          <div className="pt-2">
            <Button
              onClick={() => navigate('/fire-calculator')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              size="sm"
            >
              <Flame className="h-4 w-4 mr-2" />
              Explore All Scenarios in Detail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
