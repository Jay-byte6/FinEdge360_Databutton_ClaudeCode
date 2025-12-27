/**
 * PortfolioHoldingsOverview - Full-width horizontal component showing portfolio breakdown
 * Displays all investment holdings with current values, allocation percentages, and gains/losses
 */

import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Holding {
  id: string;
  name: string;
  type: 'equity' | 'debt' | 'gold' | 'realestate' | 'other';
  currentValue: number;
  investedValue: number;
  lastUpdated?: Date;
}

interface PortfolioHoldingsOverviewProps {
  holdings?: Holding[];
  totalValue: number;
}

const ASSET_COLORS = {
  equity: 'from-blue-500 to-blue-600',
  debt: 'from-green-500 to-green-600',
  gold: 'from-yellow-500 to-yellow-600',
  realestate: 'from-purple-500 to-purple-600',
  other: 'from-gray-500 to-gray-600',
};

const ASSET_LABELS = {
  equity: 'Equity',
  debt: 'Debt/FD',
  gold: 'Gold',
  realestate: 'Real Estate',
  other: 'Other',
};

export const PortfolioHoldingsOverview: React.FC<PortfolioHoldingsOverviewProps> = ({
  holdings = [],
  totalValue,
}) => {
  // Calculate totals by asset type
  const assetTotals = holdings.reduce((acc, holding) => {
    const existing = acc[holding.type] || { currentValue: 0, investedValue: 0 };
    return {
      ...acc,
      [holding.type]: {
        currentValue: existing.currentValue + holding.currentValue,
        investedValue: existing.investedValue + holding.investedValue,
      },
    };
  }, {} as Record<string, { currentValue: number; investedValue: number }>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateGainLoss = (current: number, invested: number) => {
    const diff = current - invested;
    const percentage = invested > 0 ? ((diff / invested) * 100).toFixed(2) : '0.00';
    return { diff, percentage };
  };

  if (holdings.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">No portfolio holdings added yet</p>
          <p className="text-sm mt-1">Add your investments to see your portfolio breakdown</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            📊 Portfolio Holdings Overview
          </h3>
          <div className="h-1 w-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Portfolio Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(assetTotals).map(([type, values]) => {
          const { diff, percentage } = calculateGainLoss(values.currentValue, values.investedValue);
          const allocation = totalValue > 0 ? ((values.currentValue / totalValue) * 100).toFixed(1) : '0.0';
          const isGain = diff >= 0;

          return (
            <div
              key={type}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{ASSET_LABELS[type as keyof typeof ASSET_LABELS]}</span>
                <span className="text-xs font-bold text-gray-500">{allocation}%</span>
              </div>

              <div className={`h-2 bg-gradient-to-r ${ASSET_COLORS[type as keyof typeof ASSET_COLORS]} rounded-full mb-3`}></div>

              <div className="text-xl font-bold text-gray-900 mb-1">
                {formatCurrency(values.currentValue)}
              </div>

              <div className="flex items-center gap-1 text-xs">
                {isGain ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-semibold">+{percentage}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-600" />
                    <span className="text-red-600 font-semibold">{percentage}%</span>
                  </>
                )}
                <span className="text-gray-500 ml-1">{formatCurrency(Math.abs(diff))}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Holdings Table */}
      <div className="overflow-x-auto">
        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Individual Holdings ({holdings.length})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {holdings.map((holding) => {
            const { diff, percentage } = calculateGainLoss(holding.currentValue, holding.investedValue);
            const isGain = diff >= 0;

            return (
              <div
                key={holding.id}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{holding.name}</h4>
                    <span className="text-xs text-gray-500">{ASSET_LABELS[holding.type]}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(holding.currentValue)}</div>
                    <div className="flex items-center gap-1 text-xs justify-end">
                      {isGain ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-semibold">+{percentage}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-red-600" />
                          <span className="text-red-600 font-semibold">{percentage}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Invested: {formatCurrency(holding.investedValue)} •
                  Gain/Loss: <span className={isGain ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {formatCurrency(Math.abs(diff))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Invested</div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(holdings.reduce((sum, h) => sum + h.investedValue, 0))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Current Value</div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Gain/Loss</div>
            <div className={`text-lg font-bold ${totalValue >= holdings.reduce((sum, h) => sum + h.investedValue, 0) ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalValue - holdings.reduce((sum, h) => sum + h.investedValue, 0))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Overall Return</div>
            <div className={`text-lg font-bold ${totalValue >= holdings.reduce((sum, h) => sum + h.investedValue, 0) ? 'text-green-600' : 'text-red-600'}`}>
              {holdings.reduce((sum, h) => sum + h.investedValue, 0) > 0
                ? (((totalValue - holdings.reduce((sum, h) => sum + h.investedValue, 0)) / holdings.reduce((sum, h) => sum + h.investedValue, 0)) * 100).toFixed(2)
                : '0.00'}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
