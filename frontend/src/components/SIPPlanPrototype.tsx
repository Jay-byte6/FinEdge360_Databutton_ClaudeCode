/**
 * Enterprise-Level SIP Plan Prototype
 * Minimalist, sophisticated UI/UX with extraordinary user experience
 * Color palette: Grayscale + Brand Green + Semantic colors only
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, Target, DollarSign, Calendar, PieChart, CheckCircle2, AlertCircle } from 'lucide-react';

interface AssetBreakdown {
  equity: number;
  us_equity: number;
  debt: number;
  gold: number;
  reits: number;
  crypto: number;
  cash: number;
}

interface Goal {
  id: string;
  name: string;
  timeYears: number;
  goalType: string;
  amountRequiredFuture: number;
  sipRequired: number;
  assetBreakdown?: AssetBreakdown;
}

interface SIPPlanPrototypeProps {
  goals: Goal[];
  monthlySavings: number;
  totalSIPRequired: number;
  sipSurplusOrDeficit: number;
}

export const SIPPlanPrototype: React.FC<SIPPlanPrototypeProps> = ({
  goals,
  monthlySavings,
  totalSIPRequired,
  sipSurplusOrDeficit
}) => {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const getProgressPercentage = () => {
    if (monthlySavings === 0) return 0;
    return Math.min((totalSIPRequired / monthlySavings) * 100, 100);
  };

  const assetClassColors: Record<string, string> = {
    equity: 'bg-gray-700',
    us_equity: 'bg-gray-600',
    debt: 'bg-gray-500',
    gold: 'bg-gray-400',
    reits: 'bg-gray-300',
    crypto: 'bg-gray-200',
    cash: 'bg-gray-100'
  };

  const assetClassLabels: Record<string, string> = {
    equity: 'Equity',
    us_equity: 'US Equity',
    debt: 'Debt',
    gold: 'Gold',
    reits: 'REITs',
    crypto: 'Crypto',
    cash: 'Cash'
  };

  return (
    <div className="space-y-8">
      {/* Hero Metrics Section - Enterprise Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary Metric - Total SIP Required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">Total Monthly SIP</p>
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSIPRequired)}</p>
              <p className="text-xs text-gray-500 mt-1">Required for all goals</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Metric - Monthly Capacity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">Monthly Capacity</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(monthlySavings)}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      getProgressPercentage() > 100 ? 'bg-red-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(getProgressPercentage())}% utilized</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Metric - Surplus/Deficit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
            sipSurplusOrDeficit >= 0 ? 'bg-green-50/30' : 'bg-red-50/30'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">
                  {sipSurplusOrDeficit >= 0 ? 'Remaining' : 'Deficit'}
                </p>
                {sipSurplusOrDeficit >= 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className={`text-3xl font-bold ${
                sipSurplusOrDeficit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(sipSurplusOrDeficit))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {sipSurplusOrDeficit >= 0 ? 'Available for investment' : 'Adjust goals or increase savings'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goals Breakdown - Accordion Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Investment Breakdown by Goal</h3>
          <p className="text-sm text-gray-500">{goals.length} {goals.length === 1 ? 'goal' : 'goals'}</p>
        </div>

        <div className="space-y-3">
          {goals.map((goal, index) => {
            const isExpanded = expandedGoal === goal.id;
            const totalAssets = goal.assetBreakdown
              ? Object.values(goal.assetBreakdown).reduce((sum, val) => sum + val, 0)
              : 0;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all">
                  {/* Goal Header - Always Visible */}
                  <button
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                    className="w-full text-left"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-700">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base font-semibold text-gray-900">{goal.name}</CardTitle>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {goal.timeYears} {goal.timeYears === 1 ? 'year' : 'years'} • {goal.goalType.replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-500">Target</p>
                            <p className="text-base font-semibold text-gray-900">
                              {formatCurrency(goal.amountRequiredFuture)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">Monthly SIP</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(goal.sipRequired)}
                            </p>
                          </div>

                          <div className="ml-2">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </button>

                  {/* Expanded Content - Asset Breakdown */}
                  <AnimatePresence>
                    {isExpanded && goal.assetBreakdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0 border-t border-gray-100">
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <PieChart className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">Asset Allocation</p>
                            </div>

                            {/* Visual Bar Chart */}
                            <div className="mb-4">
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                {Object.entries(goal.assetBreakdown).map(([key, value]) => {
                                  if (value === 0) return null;
                                  const percentage = (value / totalAssets) * 100;
                                  return (
                                    <div
                                      key={key}
                                      className={`${assetClassColors[key]} transition-all`}
                                      style={{ width: `${percentage}%` }}
                                      title={`${assetClassLabels[key]}: ${formatCurrency(value)}`}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {/* Asset Breakdown Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(goal.assetBreakdown)
                                .filter(([_, value]) => value > 0)
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`h-2 w-2 rounded-full ${assetClassColors[key]}`} />
                                      <p className="text-xs font-medium text-gray-600">
                                        {assetClassLabels[key]}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(value)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {((value / totalAssets) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Next Steps - Minimal CTA */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Ready to Start Investing?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Use this plan as your investment roadmap. Start SIPs in recommended asset classes and track your progress.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" className="bg-gray-900 hover:bg-gray-800">
                  Download Report
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300">
                  Track Progress
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
