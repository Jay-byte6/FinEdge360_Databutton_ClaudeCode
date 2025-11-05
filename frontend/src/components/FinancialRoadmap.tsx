import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FinancialDataValues } from '../utils/formSchema';

interface FinancialRoadmapProps {
  financialData: FinancialDataValues;
}

const FinancialRoadmap: React.FC<FinancialRoadmapProps> = ({ financialData }) => {
  if (!financialData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Financial Roadmap</CardTitle>
          <CardDescription>Your journey to financial independence</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Please enter your financial details to see your personalized roadmap.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { personalInfo, goals, riskAppetite, assets, liabilities } = financialData;

  // Calculate current net worth
  const calculateNetWorth = () => {
    const totalIlliquidAssets = Object.values(assets?.illiquid || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalLiquidAssets = Object.values(assets?.liquid || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalAssets = totalIlliquidAssets + totalLiquidAssets;
    const totalLiabilities = Object.values(liabilities || {}).reduce((sum, val) => sum + (val || 0), 0);
    return totalAssets - totalLiabilities;
  };

  const netWorth = calculateNetWorth();
  const currentAge = personalInfo?.age || 30;
  const retirementAge = riskAppetite?.retirementAge || 60;
  const yearsToRetirement = retirementAge - currentAge;

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  // Combine all goals with their categories
  const allGoals = [
    ...(goals?.shortTermGoals || []).map(g => ({ ...g, type: 'Short-term', color: 'bg-blue-500' })),
    ...(goals?.midTermGoals || []).map(g => ({ ...g, type: 'Mid-term', color: 'bg-purple-500' })),
    ...(goals?.longTermGoals || []).map(g => ({ ...g, type: 'Long-term', color: 'bg-green-500' })),
  ].sort((a, b) => a.years - b.years);

  // Calculate timeline milestones
  const milestones = [
    { age: currentAge, label: 'Today', description: `Net Worth: ${formatCurrency(netWorth)}`, color: 'bg-gray-600' },
    ...allGoals.map(goal => ({
      age: currentAge + goal.years,
      label: goal.name,
      description: `Target: ${formatCurrency(goal.amount)}`,
      color: goal.color,
      type: goal.type,
    })),
    { age: retirementAge, label: 'Retirement', description: `Age ${retirementAge}`, color: 'bg-amber-600' },
  ].sort((a, b) => a.age - b.age);

  // Calculate position percentages for timeline
  const timelineStart = currentAge;
  const timelineEnd = retirementAge + 5; // Add some buffer after retirement
  const timelineSpan = timelineEnd - timelineStart;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Financial Roadmap
        </CardTitle>
        <CardDescription>Your personalized journey to financial independence</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Current Age</div>
            <div className="text-2xl font-bold text-blue-600">{currentAge} years</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="text-sm text-gray-600 mb-1">Years to Retirement</div>
            <div className="text-2xl font-bold text-purple-600">{yearsToRetirement} years</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">Current Net Worth</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(netWorth)}</div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Financial Timeline</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 right-0 top-6 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

            {/* Milestones */}
            <div className="relative flex justify-between items-start" style={{ minHeight: '180px' }}>
              {milestones.map((milestone, index) => {
                const position = ((milestone.age - timelineStart) / timelineSpan) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center absolute"
                    style={{
                      left: `${Math.min(Math.max(position, 0), 100)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {/* Dot */}
                    <div className={`w-4 h-4 rounded-full ${milestone.color} border-4 border-white shadow-md z-10`}></div>

                    {/* Label card */}
                    <div className="mt-3 bg-white rounded-lg shadow-md p-3 border border-gray-200 min-w-[140px] max-w-[160px]">
                      <div className="text-xs font-semibold text-gray-800 mb-1 truncate" title={milestone.label}>
                        {milestone.label}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">{milestone.description}</div>
                      <div className="text-xs font-medium text-gray-500">Age {milestone.age}</div>
                      {milestone.type && (
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded text-white ${milestone.color}`}>
                            {milestone.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Goals Breakdown */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Goals Breakdown</h3>
          <div className="space-y-3">
            {allGoals.map((goal, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className={`w-3 h-3 rounded-full ${goal.color} flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{goal.name}</div>
                  <div className="text-sm text-gray-600">
                    {goal.type} • In {goal.years} {goal.years === 1 ? 'year' : 'years'} (Age {currentAge + goal.years})
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-gray-800">{formatCurrency(goal.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Key Insights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You have {yearsToRetirement} years until retirement to build your corpus</li>
                <li>• Total goal amount: {formatCurrency(allGoals.reduce((sum, g) => sum + g.amount, 0))}</li>
                <li>• With consistent investing, you can achieve all your financial goals</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialRoadmap;
