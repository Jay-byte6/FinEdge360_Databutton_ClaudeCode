import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FinancialDataValues } from '../utils/formSchema';

interface FinancialLadderProps {
  financialData: FinancialDataValues;
}

const FinancialLadder: React.FC<FinancialLadderProps> = ({ financialData }) => {
  if (!financialData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Financial Ladder</CardTitle>
          <CardDescription>Your investment allocation across asset classes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Please enter your financial details to see your investment ladder.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { assets, riskAppetite, personalInfo } = financialData;

  // Calculate total assets by category
  const calculateAssetBreakdown = () => {
    const illiquidAssets = {
      'Real Estate (Home)': assets?.illiquid?.home || 0,
      'Other Real Estate': assets?.illiquid?.other_real_estate || 0,
      'Jewellery': assets?.illiquid?.jewellery || 0,
      'Sovereign Gold Bonds': assets?.illiquid?.sgb || 0,
      'ULIPs': assets?.illiquid?.ulips || 0,
      'EPF/PPF/VPF': assets?.illiquid?.epf_ppf_vpf || 0,
    };

    const liquidAssets = {
      'Fixed Deposits': assets?.liquid?.fixed_deposit || 0,
      'Debt Funds': assets?.liquid?.debt_funds || 0,
      'Domestic Stocks': assets?.liquid?.domestic_stock_market || 0,
      'Equity Mutual Funds': assets?.liquid?.domestic_equity_mutual_funds || 0,
      'ELSS Funds': assets?.liquid?.cash_from_equity_mutual_funds || 0,
      'US Equity': assets?.liquid?.us_equity || 0,
      'Cash/Savings': assets?.liquid?.liquid_savings_cash || 0,
      'Gold ETF/Digital': assets?.liquid?.gold_etf_digital_gold || 0,
      'Cryptocurrency': assets?.liquid?.crypto || 0,
      'REITs': assets?.liquid?.reits || 0,
    };

    return { illiquidAssets, liquidAssets };
  };

  const { illiquidAssets, liquidAssets } = calculateAssetBreakdown();

  // Calculate totals
  const totalIlliquid = Object.values(illiquidAssets).reduce((sum, val) => sum + val, 0);
  const totalLiquid = Object.values(liquidAssets).reduce((sum, val) => sum + val, 0);
  const totalAssets = totalIlliquid + totalLiquid;

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  // Calculate percentage
  const calcPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Define investment ladder rungs with risk levels
  const investmentLadder = [
    {
      level: 5,
      riskLabel: 'Very High Risk',
      color: 'bg-red-500',
      borderColor: 'border-red-300',
      bgLight: 'bg-red-50',
      assets: [
        { name: 'Cryptocurrency', value: liquidAssets['Cryptocurrency'] },
        { name: 'US Equity', value: liquidAssets['US Equity'] },
      ]
    },
    {
      level: 4,
      riskLabel: 'High Risk',
      color: 'bg-orange-500',
      borderColor: 'border-orange-300',
      bgLight: 'bg-orange-50',
      assets: [
        { name: 'Domestic Stocks', value: liquidAssets['Domestic Stocks'] },
        { name: 'Equity Mutual Funds', value: liquidAssets['Equity Mutual Funds'] },
        { name: 'REITs', value: liquidAssets['REITs'] },
      ]
    },
    {
      level: 3,
      riskLabel: 'Medium Risk',
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-300',
      bgLight: 'bg-yellow-50',
      assets: [
        { name: 'ELSS Funds', value: liquidAssets['ELSS Funds'] },
        { name: 'Debt Funds', value: liquidAssets['Debt Funds'] },
        { name: 'Gold ETF/Digital', value: liquidAssets['Gold ETF/Digital'] },
      ]
    },
    {
      level: 2,
      riskLabel: 'Low Risk',
      color: 'bg-blue-500',
      borderColor: 'border-blue-300',
      bgLight: 'bg-blue-50',
      assets: [
        { name: 'Fixed Deposits', value: liquidAssets['Fixed Deposits'] },
        { name: 'EPF/PPF/VPF', value: illiquidAssets['EPF/PPF/VPF'] },
        { name: 'Sovereign Gold Bonds', value: illiquidAssets['Sovereign Gold Bonds'] },
      ]
    },
    {
      level: 1,
      riskLabel: 'Very Low Risk',
      color: 'bg-green-500',
      borderColor: 'border-green-300',
      bgLight: 'bg-green-50',
      assets: [
        { name: 'Cash/Savings', value: liquidAssets['Cash/Savings'] },
        { name: 'ULIPs', value: illiquidAssets['ULIPs'] },
      ]
    },
    {
      level: 0,
      riskLabel: 'Non-Liquid Assets',
      color: 'bg-gray-500',
      borderColor: 'border-gray-300',
      bgLight: 'bg-gray-50',
      assets: [
        { name: 'Real Estate (Home)', value: illiquidAssets['Real Estate (Home)'] },
        { name: 'Other Real Estate', value: illiquidAssets['Other Real Estate'] },
        { name: 'Jewellery', value: illiquidAssets['Jewellery'] },
      ]
    },
  ];

  // Get recommended allocation based on risk tolerance
  const getRecommendedAllocation = (riskTolerance: number) => {
    // Risk tolerance: 1 (conservative) to 5 (aggressive)
    const allocations = {
      1: { veryHigh: 5, high: 15, medium: 20, low: 40, veryLow: 20 },  // Very Conservative
      2: { veryHigh: 10, high: 20, medium: 25, low: 30, veryLow: 15 }, // Conservative
      3: { veryHigh: 15, high: 30, medium: 25, low: 20, veryLow: 10 }, // Moderate
      4: { veryHigh: 20, high: 35, medium: 25, low: 15, veryLow: 5 },  // Aggressive
      5: { veryHigh: 25, high: 40, medium: 20, low: 10, veryLow: 5 },  // Very Aggressive
    };

    const risk = Math.min(Math.max(riskTolerance || 3, 1), 5) as 1 | 2 | 3 | 4 | 5;
    return allocations[risk];
  };

  const riskTolerance = riskAppetite?.risk_tolerance || 3;
  const recommendedAllocation = getRecommendedAllocation(riskTolerance);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Financial Ladder
        </CardTitle>
        <CardDescription>Your investment allocation across risk levels</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="text-sm text-gray-600 mb-1">Total Assets</div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalAssets)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Liquid Assets</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalLiquid)}</div>
            <div className="text-xs text-gray-500">{calcPercentage(totalLiquid, totalAssets)}% of total</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Illiquid Assets</div>
            <div className="text-2xl font-bold text-gray-600">{formatCurrency(totalIlliquid)}</div>
            <div className="text-xs text-gray-500">{calcPercentage(totalIlliquid, totalAssets)}% of total</div>
          </div>
        </div>

        {/* Risk Tolerance Indicator */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Your Risk Tolerance:</span>
            <span className="text-lg font-bold text-blue-600">
              {riskTolerance}/5 {riskTolerance <= 2 ? '(Conservative)' : riskTolerance <= 3 ? '(Moderate)' : '(Aggressive)'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(riskTolerance / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Investment Ladder Visualization */}
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Investment Ladder by Risk Level</h3>
        <div className="space-y-3">
          {investmentLadder.map((rung, index) => {
            const rungTotal = rung.assets.reduce((sum, asset) => sum + asset.value, 0);
            const rungPercentage = calcPercentage(rungTotal, totalAssets);
            const hasAssets = rungTotal > 0;

            // Map risk level to recommended allocation
            const recommendedKey = index === 0 ? 'veryHigh' :
                                   index === 1 ? 'high' :
                                   index === 2 ? 'medium' :
                                   index === 3 ? 'low' :
                                   index === 4 ? 'veryLow' : null;

            return (
              <div key={index} className={`border ${rung.borderColor} rounded-lg p-4 ${rung.bgLight}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${rung.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {rung.level}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{rung.riskLabel}</div>
                      {recommendedKey && (
                        <div className="text-xs text-gray-600">
                          Recommended: {recommendedAllocation[recommendedKey as keyof typeof recommendedAllocation]}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{formatCurrency(rungTotal)}</div>
                    <div className="text-sm text-gray-600">{rungPercentage}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`${rung.color} h-2 rounded-full transition-all`}
                    style={{ width: `${rungPercentage}%` }}
                  ></div>
                </div>

                {/* Asset details */}
                {hasAssets && (
                  <div className="space-y-2">
                    {rung.assets.filter(asset => asset.value > 0).map((asset, assetIndex) => (
                      <div key={assetIndex} className="flex items-center justify-between text-sm bg-white rounded p-2">
                        <span className="text-gray-700">{asset.name}</span>
                        <span className="font-medium text-gray-800">
                          {formatCurrency(asset.value)} ({calcPercentage(asset.value, totalAssets)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!hasAssets && (
                  <div className="text-sm text-gray-500 italic">No investments in this category</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">Portfolio Insights</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Your portfolio is spread across {investmentLadder.filter(r => r.assets.reduce((s, a) => s + a.value, 0) > 0).length} risk levels</li>
                <li>• Liquid assets make up {calcPercentage(totalLiquid, totalAssets)}% of your portfolio</li>
                <li>• Consider rebalancing to match recommended allocation for your risk profile</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialLadder;
