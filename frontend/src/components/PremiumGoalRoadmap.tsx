import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Calendar, ArrowRight, Flag, Home, GraduationCap, Palmtree, Wallet, Heart, Users } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';

interface Goal {
  id: string;
  name: string;
  timeYears: number;
  goalType: string;
  amountRequiredToday: number;
  amountRequiredFuture: number;
  sipRequired: number;
  amountAvailableToday?: number;
}

interface PremiumGoalRoadmapProps {
  userId: string;
  isPremium: boolean;
}

const getGoalIcon = (goalName: string) => {
  const name = goalName.toLowerCase();
  if (name.includes('house') || name.includes('home')) return Home;
  if (name.includes('education') || name.includes('college')) return GraduationCap;
  if (name.includes('vacation') || name.includes('travel')) return Palmtree;
  if (name.includes('retirement') || name.includes('fire')) return Wallet;
  if (name.includes('wedding') || name.includes('marriage')) return Heart;
  if (name.includes('car') || name.includes('vehicle')) return Users;
  return Target;
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

export const PremiumGoalRoadmap: React.FC<PremiumGoalRoadmapProps> = ({ userId, isPremium }) => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPremium) {
      setIsLoading(false);
      return;
    }

    const fetchGoals = async () => {
      try {
        // Try to fetch from goal-investment-summary first (includes portfolio data)
        let goalsData: Goal[] = [];

        try {
          const summaryResponse = await fetch(API_ENDPOINTS.getGoalInvestmentSummary(userId));
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            if (summaryData.success && summaryData.goals && Array.isArray(summaryData.goals)) {
              // Map summary data to Goal format
              goalsData = summaryData.goals
                .filter((g: any) => g.sipRequired && g.sipRequired > 0)
                .map((g: any) => ({
                  id: g.id,
                  name: g.name,
                  timeYears: g.timeYears,
                  goalType: g.goalType,
                  amountRequiredToday: g.amountRequiredToday,
                  amountRequiredFuture: g.targetAmount || g.amountRequiredFuture,
                  sipRequired: g.sipRequired,
                  amountAvailableToday: g.totalValue || g.amountAvailableToday || 0, // Use totalValue from summary
                }))
                .sort((a: Goal, b: Goal) => a.timeYears - b.timeYears);
            }
          }
        } catch (summaryError) {
          console.log('[PremiumGoalRoadmap] Goal investment summary not available, falling back to SIP planner');
        }

        // Fallback to getSIPPlanner if summary doesn't work
        if (goalsData.length === 0) {
          const response = await fetch(API_ENDPOINTS.getSIPPlanner(userId));
          if (response.ok) {
            const data = await response.json();
            if (data.goals && Array.isArray(data.goals)) {
              goalsData = data.goals
                .filter((g: Goal) => g.sipRequired && g.sipRequired > 0)
                .sort((a: Goal, b: Goal) => a.timeYears - b.timeYears);
            }
          }
        }

        setGoals(goalsData);
      } catch (error) {
        console.error('[PremiumGoalRoadmap] Error fetching goals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [userId, isPremium]);

  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-600" />
            Goals in Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      {!isPremium && <LockedFeatureOverlay featureName="Goals in Action" />}

      <CardHeader className={!isPremium ? 'filter blur-sm' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 shadow-md">
              <Flag className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Goals in Action
            </span>
          </CardTitle>
          {isPremium && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/fire-planner?tab=set-goals')}
              className="text-xs"
            >
              Manage Goals <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">Your active goals with SIP plans underway</p>
      </CardHeader>

      <CardContent className={!isPremium ? 'filter blur-sm' : ''}>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No active goals yet</p>
            <p className="text-sm text-gray-500 mb-4">Set goals in FIRE Planner and create SIP plans to see them here</p>
            <Button onClick={() => navigate('/fire-planner?tab=set-goals')} size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Start Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              {goals.map((goal, index) => {
                const GoalIcon = getGoalIcon(goal.name);
                const targetYear = currentYear + goal.timeYears;
                const progress = goal.amountAvailableToday
                  ? (goal.amountAvailableToday / goal.amountRequiredFuture) * 100
                  : 0;

                return (
                  <div key={goal.id} className="relative pb-8">
                    {/* Timeline Line */}
                    {index < goals.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200" />
                    )}

                    {/* Goal Card */}
                    <div
                      onClick={() => navigate('/fire-planner?tab=set-goals')}
                      className="flex gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      {/* Icon & Year Badge with Sticky Effect */}
                      <div className="flex-shrink-0 sticky top-16 self-start z-20">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative shadow-lg">
                          <GoalIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="mt-2 text-center bg-white rounded-md px-1.5 py-1 shadow-sm">
                          <div className="text-xs font-bold text-blue-600">{targetYear}</div>
                          <div className="text-xs text-gray-500 font-medium">{goal.timeYears}Y</div>
                        </div>
                      </div>

                      {/* Goal Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                            <p className="text-sm text-gray-600">{goal.goalType.replace('-', ' ')}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(goal.amountRequiredFuture)}
                            </p>
                            <p className="text-xs text-gray-500">Target</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Monthly SIP */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">{formatCurrency(goal.sipRequired)}/mo</span>
                          </div>
                          {goal.amountAvailableToday > 0 && (
                            <div className="text-gray-600">
                              <span className="text-xs">Available: </span>
                              <span className="font-medium">{formatCurrency(goal.amountAvailableToday)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Footer */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{goals.length}</span> active {goals.length === 1 ? 'goal' : 'goals'}
                </div>
                <Button
                  onClick={() => navigate('/fire-planner?tab=sip-plan')}
                  variant="outline"
                  size="sm"
                >
                  View SIP Plan <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
