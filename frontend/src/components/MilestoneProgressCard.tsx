import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Flag, Trophy } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';

interface Milestone {
  step: number;
  title: string;
  description: string;
  path: string;
  completed: boolean;
}

interface MilestoneProgressCardProps {
  userId: string;
  isPremium: boolean;
  hasFinancialData?: boolean;
}

export const MilestoneProgressCard: React.FC<MilestoneProgressCardProps> = ({
  userId,
  isPremium,
  hasFinancialData = false
}) => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([
    { step: 0, title: 'Enter Your Details', description: 'Basic financial information', path: '/enter-details', completed: false },
    { step: 1, title: 'Know Your Net Worth', description: 'Calculate total assets & liabilities', path: '/net-worth', completed: false },
    { step: 2, title: 'Discover Your FIRE', description: 'Calculate FIRE scenarios', path: '/fire-calculator', completed: false },
    { step: 3, title: 'Optimize Your Taxes', description: 'Tax-saving strategies', path: '/tax-planning', completed: false },
    { step: 4, title: 'Assess Yourself', description: 'Upload portfolio & track holdings', path: '/portfolio', completed: false },
    { step: 5, title: 'Set Your Goals', description: 'Define financial goals', path: '/fire-planner?tab=set-goals', completed: false },
    { step: 6, title: 'Design Asset Allocation', description: 'Optimize investment strategy', path: '/fire-planner?tab=asset-allocation', completed: false },
    { step: 7, title: 'FIRE Planning', description: 'Create SIP investment plan', path: '/fire-planner?tab=sip-plan', completed: false },
  ]);

  // Smart auto-detection of milestone completion based on actual data
  useEffect(() => {
    const checkMilestoneCompletion = async () => {
      try {
        const completionStatus: Record<number, boolean> = {
          0: hasFinancialData, // Step 0: Has entered financial details
          1: hasFinancialData, // Step 1: Has net worth (same as financial data)
          2: hasFinancialData, // Step 2: Can calculate FIRE if they have data
          3: hasFinancialData, // Step 3: Tax planning available if they have data
        };

        // Check Step 4: Portfolio holdings
        if (userId) {
          try {
            const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(userId));
            if (portfolioRes.ok) {
              const portfolioData = await portfolioRes.json();
              completionStatus[4] = portfolioData.holdings && portfolioData.holdings.length > 0;
            }
          } catch (err) {
            completionStatus[4] = false;
          }

          // Check Step 5, 6, 7: FIRE Planner data
          try {
            const sipRes = await fetch(API_ENDPOINTS.getSIPPlanner(userId));
            if (sipRes.ok) {
              const sipData = await sipRes.json();
              const hasGoals = sipData.goals && sipData.goals.length > 0;
              const hasSIPCalculated = sipData.goals?.some((g: any) => g.sipRequired && g.sipRequired > 0);

              completionStatus[5] = hasGoals; // Has set goals
              completionStatus[7] = hasSIPCalculated; // Has calculated SIP
            }
          } catch (err) {
            completionStatus[5] = false;
            completionStatus[7] = false;
          }

          // Check Step 6: Asset allocations
          try {
            const allocRes = await fetch(API_ENDPOINTS.getAssetAllocation(userId));
            if (allocRes.ok) {
              const allocData = await allocRes.json();
              completionStatus[6] = allocData.allocations && allocData.allocations.length > 0;
            }
          } catch (err) {
            completionStatus[6] = false;
          }
        }

        // Update milestones with detected completion status
        setMilestones(prev => prev.map(milestone => ({
          ...milestone,
          completed: completionStatus[milestone.step] || false
        })));

      } catch (error) {
        console.error('[MilestoneProgressCard] Error checking milestone completion:', error);
      }
    };

    checkMilestoneCompletion();
  }, [userId, hasFinancialData]);

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercentage = (completedCount / milestones.length) * 100;
  const nextMilestone = milestones.find(m => !m.completed);

  return (
    <Card className="relative">
      {!isPremium && <LockedFeatureOverlay featureName="Milestone Progress Tracking" />}

      <CardHeader className={!isPremium ? 'filter blur-sm' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-purple-600" />
            Your FIRE Journey Progress
          </CardTitle>
          {isPremium && completedCount === milestones.length && (
            <div className="flex items-center gap-1 text-green-600">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-semibold">Complete!</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {completedCount} of {milestones.length} milestones completed
        </p>
      </CardHeader>

      <CardContent className={!isPremium ? 'filter blur-sm' : ''}>
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-2 mb-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.step}
              onClick={() => isPremium && navigate(milestone.path)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isPremium ? 'cursor-pointer hover:bg-gray-50' : ''
              } ${milestone.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
            >
              {/* Completion Icon */}
              <div className="flex-shrink-0">
                {milestone.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Milestone Details */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${milestone.completed ? 'text-green-900' : 'text-gray-900'}`}>
                  Step {milestone.step}: {milestone.title}
                </p>
                <p className="text-xs text-gray-600 truncate">{milestone.description}</p>
              </div>

              {/* Arrow Icon */}
              {isPremium && (
                <ArrowRight className={`h-4 w-4 flex-shrink-0 ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Next Milestone CTA */}
        {isPremium && nextMilestone && (
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">
                🎯 Next: {nextMilestone.title}
              </p>
              <p className="text-xs text-purple-700 mb-3">
                {nextMilestone.description}
              </p>
              <Button
                onClick={() => navigate(nextMilestone.path)}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Continue Your Journey <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isPremium && completedCount === milestones.length && (
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
              <Trophy className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-900 mb-1">Congratulations! 🎉</p>
              <p className="text-sm text-green-700">
                You've completed all milestones on your journey to financial freedom!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
