import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';

interface DailyInsightsCardProps {
  netWorth: number;
  netWorthChange?: number; // Optional: change from yesterday
  totalGoalsProgress: number; // Average progress across all goals (0-100)
  goalsOnTrack: number; // Number of goals on track
  totalGoals: number; // Total number of goals
  isPremium: boolean;
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

export const DailyInsightsCard: React.FC<DailyInsightsCardProps> = ({
  netWorth,
  netWorthChange,
  totalGoalsProgress,
  goalsOnTrack,
  totalGoals,
  isPremium
}) => {
  const navigate = useNavigate();

  const isPositiveChange = netWorthChange !== undefined && netWorthChange >= 0;
  const allGoalsOnTrack = goalsOnTrack === totalGoals && totalGoals > 0;

  return (
    <Card className="relative">
      {!isPremium && <LockedFeatureOverlay featureName="Daily Insights & Progress Tracking" />}

      <CardHeader className={!isPremium ? 'filter blur-sm' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            Today's Insights
          </CardTitle>
          {isPremium && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/net-worth')}
              className="text-xs text-blue-600"
            >
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${!isPremium ? 'filter blur-sm' : ''}`}>
        {/* Net Worth */}
        <div
          onClick={() => isPremium && navigate('/net-worth')}
          className={`p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 font-medium">Your Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(netWorth)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          {/* Net Worth Change */}
          {netWorthChange !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={isPositiveChange ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                {isPositiveChange ? '+' : ''}{formatCurrency(Math.abs(netWorthChange))}
              </span>
              <span className="text-gray-500">vs yesterday</span>
            </div>
          )}
        </div>

        {/* Overall Goals Progress */}
        <div
          onClick={() => isPremium && navigate('/fire-planner?tab=sip-plan')}
          className={`p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 font-medium">Overall Goals Progress</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(totalGoalsProgress)}%</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                style={{ width: `${Math.min(totalGoalsProgress, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-600">
            Average progress across all your financial goals
          </p>
        </div>

        {/* On-Track Status */}
        <div
          onClick={() => isPremium && navigate('/fire-planner?tab=set-goals')}
          className={`p-4 rounded-lg ${
            allGoalsOnTrack
              ? 'bg-gradient-to-br from-green-50 to-teal-50 border border-green-200'
              : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200'
          } ${isPremium ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                allGoalsOnTrack ? 'bg-green-100' : 'bg-orange-100'
              }`}
            >
              {allGoalsOnTrack ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              )}
            </div>

            <div className="flex-1">
              <p className={`font-semibold ${allGoalsOnTrack ? 'text-green-900' : 'text-orange-900'}`}>
                {allGoalsOnTrack ? "You're on track! 🎯" : 'Some goals need attention'}
              </p>
              <p className="text-sm text-gray-600">
                {goalsOnTrack} of {totalGoals} goals are on track
              </p>
            </div>
          </div>

          {!allGoalsOnTrack && totalGoals > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs text-orange-700">
                💡 Consider increasing monthly SIP or adjusting timelines for better progress
              </p>
            </div>
          )}
        </div>

        {/* Peace of Mind Message */}
        {isPremium && allGoalsOnTrack && totalGoals > 0 && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900 text-center">
              ✨ Great job! You're making steady progress towards financial freedom. Keep it up!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
