import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Zap, TrendingUp, Shield, Target, FileText, Upload, Calculator, Flame } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actionPath: string;
  priority: number;
  category: 'financial-data' | 'goals' | 'portfolio' | 'tax' | 'insurance' | 'fire' | 'general';
  powerFireTip?: string;
}

interface ActionItemsCardProps {
  userId: string;
  financialData: any;
  isPremium: boolean;
}

export const ActionItemsCard: React.FC<ActionItemsCardProps> = ({ userId, financialData, isPremium }) => {
  const navigate = useNavigate();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Load completed actions from database
  useEffect(() => {
    const loadCompletedActions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getUserActionItems(userId));
        if (response.ok) {
          const data = await response.json();
          setCompletedActions(new Set(data.completedActionIds || []));
        }
      } catch (error) {
        console.error('[ActionItems] Error loading completed actions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadCompletedActions();
    }
  }, [userId]);

  // Generate personalized action items based on user's data
  useEffect(() => {
    const generateActionItems = async () => {
      const items: ActionItem[] = [];

      // 1. Financial Data Actions
      if (!financialData || Object.keys(financialData).length === 0) {
        items.push({
          id: 'enter-financial-details',
          title: 'Enter Your Financial Details',
          description: 'Start your FIRE journey by entering your income, expenses, assets, and liabilities',
          icon: <FileText className="h-5 w-5" />,
          actionPath: '/enter-details',
          priority: 1,
          category: 'financial-data',
          powerFireTip: '💡 PowerFIRE Tip: Tracking your finances is the first step to financial freedom. Know where you stand!'
        });
      }

      // 2. Insurance Planning
      const hasInsurance = financialData?.taxPlanning?.insurance &&
        (financialData.taxPlanning.insurance.lifeInsurance > 0 ||
         financialData.taxPlanning.insurance.healthInsurance > 0);

      if (!hasInsurance) {
        items.push({
          id: 'add-insurance-details',
          title: 'Add Insurance Coverage Details',
          description: 'Protect your wealth! Add your life and health insurance details for tax planning',
          icon: <Shield className="h-5 w-5" />,
          actionPath: '/tax-planning',
          priority: 2,
          category: 'insurance',
          powerFireTip: '🔥 PowerFIRE Tip: Insurance = Peace of mind. Life insurance should be 10-15x your annual income!'
        });
      }

      // 3. Portfolio Upload
      try {
        const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(userId));
        const portfolioData = await portfolioRes.json();

        if (!portfolioData.holdings || portfolioData.holdings.length === 0) {
          items.push({
            id: 'upload-portfolio',
            title: 'Upload Your Portfolio Holdings',
            description: 'Track your mutual fund investments by uploading CAMS statement',
            icon: <Upload className="h-5 w-5" />,
            actionPath: '/portfolio',
            priority: 3,
            category: 'portfolio',
            powerFireTip: '📊 PowerFIRE Tip: Track your portfolio to see if you\'re on track for your FIRE goals!'
          });
        }
      } catch (err) {
        // Portfolio not available
      }

      // 4. Set Financial Goals
      try {
        const goalsRes = await fetch(API_ENDPOINTS.getSIPPlanner(userId));
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          if (!goalsData.goals || goalsData.goals.length === 0) {
            items.push({
              id: 'set-financial-goals',
              title: 'Set Your Financial Goals',
              description: 'Define your dream home, retirement, education, and other financial aspirations',
              icon: <Target className="h-5 w-5" />,
              actionPath: '/fire-planner?tab=set-goals',
              priority: 4,
              category: 'goals',
              powerFireTip: '🎯 PowerFIRE Tip: Goals without a plan are just wishes. Set SMART financial goals!'
            });
          } else {
            // Check for goals without SIP planning
            const unplannedGoals = goalsData.goals.filter((g: any) => !g.sipRequired || g.sipRequired <= 0);
            if (unplannedGoals.length > 0) {
              items.push({
                id: 'complete-sip-planning',
                title: 'Complete SIP Planning for Your Goals',
                description: `You have ${unplannedGoals.length} goal(s) without SIP plans. Let's fix that!`,
                icon: <Calculator className="h-5 w-5" />,
                actionPath: '/fire-planner?tab=set-goals',
                priority: 5,
                category: 'goals',
                powerFireTip: '💰 PowerFIRE Tip: Start your SIPs early - time in the market beats timing the market!'
              });
            }
          }
        }
      } catch (err) {
        // Goals not available
      }

      // 5. Calculate FIRE Number
      if (!completedActions.has('calculate-fire-number')) {
        items.push({
          id: 'calculate-fire-number',
          title: 'Calculate Your FIRE Number',
          description: 'Find out exactly how much you need to retire early and achieve financial independence',
          icon: <Flame className="h-5 w-5" />,
          actionPath: '/fire-calculator',
          priority: 6,
          category: 'fire',
          powerFireTip: '🔥 PowerFIRE Tip: Your FIRE number = Annual Expenses × 25 (4% rule). Start calculating!'
        });
      }

      // 6. Optimize Tax Savings
      if (!completedActions.has('optimize-taxes')) {
        items.push({
          id: 'optimize-taxes',
          title: 'Optimize Your Tax Savings',
          description: 'Compare old vs new tax regime and maximize your take-home salary',
          icon: <TrendingUp className="h-5 w-5" />,
          actionPath: '/tax-planning',
          priority: 7,
          category: 'tax',
          powerFireTip: '💸 PowerFIRE Tip: Save ₹50K+ in taxes legally! Use 80C, 80D, NPS, and HRA smartly.'
        });
      }

      // Generic PowerFIRE Tips (shown after Top 10)
      const genericActions: ActionItem[] = [
        {
          id: 'increase-savings-rate',
          title: 'Increase Your Savings Rate to 30%+',
          description: 'Higher savings rate = Earlier retirement. Aim for at least 30% of your income!',
          icon: <Zap className="h-5 w-5" />,
          actionPath: '/dashboard',
          priority: 100,
          category: 'general',
          powerFireTip: '⚡ PowerFIRE Tip: Save 50% of your income? You can retire in 17 years!'
        },
        {
          id: 'emergency-fund',
          title: 'Build 6-Month Emergency Fund',
          description: 'Financial security starts with an emergency fund. Save 6 months of expenses!',
          icon: <Shield className="h-5 w-5" />,
          actionPath: '/net-worth',
          priority: 101,
          category: 'general',
          powerFireTip: '🛡️ PowerFIRE Tip: Keep emergency fund in liquid instruments - not FDs or stocks!'
        },
        {
          id: 'diversify-portfolio',
          title: 'Diversify Your Investment Portfolio',
          description: 'Don\'t put all eggs in one basket. Spread across equity, debt, gold, and real estate',
          icon: <Target className="h-5 w-5" />,
          actionPath: '/portfolio',
          priority: 102,
          category: 'general',
          powerFireTip: '🎯 PowerFIRE Tip: Asset allocation matters more than fund selection!'
        },
        {
          id: 'review-expenses',
          title: 'Review and Cut Unnecessary Expenses',
          description: 'Track where your money goes. Cut subscriptions and impulse buys to boost savings',
          icon: <TrendingUp className="h-5 w-5" />,
          actionPath: '/enter-details',
          priority: 103,
          category: 'general',
          powerFireTip: '✂️ PowerFIRE Tip: Every ₹100 saved monthly = ₹3L corpus in 20 years (12% returns)!'
        },
        {
          id: 'automate-investments',
          title: 'Automate Your SIP Investments',
          description: 'Set up auto-debit for your SIPs. Never miss an investment!',
          icon: <Flame className="h-5 w-5" />,
          actionPath: '/fire-planner',
          priority: 104,
          category: 'general',
          powerFireTip: '🤖 PowerFIRE Tip: Automation removes emotion from investing. Set it and forget it!'
        },
      ];

      // Combine priority items and generic items
      const allItems = [...items, ...genericActions];

      // Sort by priority
      allItems.sort((a, b) => a.priority - b.priority);

      setActionItems(allItems);
    };

    if (userId && !isLoading) {
      generateActionItems();
    }
  }, [userId, financialData, completedActions, isLoading]);

  // Handle action completion
  const handleToggleAction = async (actionId: string) => {
    const newCompleted = new Set(completedActions);

    if (completedActions.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }

    setCompletedActions(newCompleted);

    // Save to database
    try {
      await fetch(API_ENDPOINTS.updateUserActionItems(userId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedActionIds: Array.from(newCompleted)
        })
      });
    } catch (error) {
      console.error('[ActionItems] Error saving action:', error);
      toast.error('Failed to save action status');
    }
  };

  const handleActionClick = (action: ActionItem) => {
    navigate(action.actionPath);
  };

  const pendingActions = actionItems.filter(item => !completedActions.has(item.id));
  const top10Actions = pendingActions.slice(0, 10);
  const additionalActions = pendingActions.slice(10);
  const completedCount = actionItems.filter(item => completedActions.has(item.id)).length;
  const totalCount = actionItems.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Your Action Items
          </CardTitle>
          <div className="text-sm font-semibold">
            <span className="text-green-600">{completedCount}</span>
            <span className="text-gray-500">/{totalCount} completed</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Complete these actions to accelerate your journey to financial freedom
        </p>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Top 10 Priority Actions */}
          {top10Actions.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🔥 Top Priority Actions</h3>
              {top10Actions.map((action, index) => (
                <div
                  key={action.id}
                  className="border-2 border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleActionClick(action)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAction(action.id);
                      }}
                      className="mt-1 flex-shrink-0"
                    >
                      {completedActions.has(action.id) ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-orange-600">{action.icon}</div>
                        <h4 className="font-semibold text-gray-900">{action.title}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                      {action.powerFireTip && (
                        <div className="bg-white/70 rounded-md p-2 border border-orange-200">
                          <p className="text-xs text-orange-900">{action.powerFireTip}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Additional Actions (Load More) */}
          {additionalActions.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                className="w-full border-gray-300"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More Actions ({additionalActions.length})
                  </>
                )}
              </Button>

              {showAll && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Additional PowerFIRE Tips</h3>
                  {additionalActions.map((action) => (
                    <div
                      key={action.id}
                      className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handleActionClick(action)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAction(action.id);
                          }}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {completedActions.has(action.id) ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-blue-600">{action.icon}</div>
                            <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{action.description}</p>
                          {action.powerFireTip && (
                            <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">{action.powerFireTip}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Completed Message */}
          {pendingActions.length === 0 && (
            <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-1">All Actions Completed! 🎉</h3>
              <p className="text-sm text-green-700">
                You're crushing it! Keep monitoring your progress and stay on track.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
