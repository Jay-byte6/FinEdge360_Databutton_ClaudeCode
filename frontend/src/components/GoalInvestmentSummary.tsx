import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, GraduationCap, Palmtree, Wallet, Heart, Target, TrendingUp, CheckCircle2, AlertTriangle, Flag, Trophy, Sparkles, ChevronDown, ChevronUp, Link2, IndianRupee, Calendar, PiggyBank, Users } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { AssignHoldingsModal } from '@/components/AssignHoldingsModal';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GoalHolding {
  id: string;
  scheme_name: string;
  folio_number: string;
  asset_class: string;
  units: number;
  cost_value: number;
  market_value: number;
  profit: number;
  return_pct: number;
  monthly_sip_amount: number;
}

interface GoalSummary {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  target_year: number;
  years_to_goal: number;
  amount_available?: number; // Available allocated amount from Set Goal
  holdings: GoalHolding[];
  totals: {
    invested: number;
    current_value: number;
    profit: number;
    holdings_count: number;
    monthly_sip: number;
  };
  asset_breakdown: Record<string, number>;
  asset_breakdown_pct: Record<string, number>;
  sip_breakdown: Record<string, number>;
  sip_breakdown_pct: Record<string, number>;
  recommended_allocation: Record<string, number>;
  progress: {
    percentage: number;
    gap_amount: number;
    is_on_track: boolean;
  };
}

interface GoalInvestmentSummaryProps {
  userId: string;
}

// Goal colors palette
const goalColorPalettes = [
  { bg: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', text: 'text-blue-700', border: 'border-blue-300' },
  { bg: 'from-purple-500 to-pink-500', light: 'from-purple-50 to-pink-50', text: 'text-purple-700', border: 'border-purple-300' },
  { bg: 'from-green-500 to-emerald-500', light: 'from-green-50 to-emerald-50', text: 'text-green-700', border: 'border-green-300' },
  { bg: 'from-orange-500 to-amber-500', light: 'from-orange-50 to-amber-50', text: 'text-orange-700', border: 'border-orange-300' },
  { bg: 'from-rose-500 to-red-500', light: 'from-rose-50 to-red-50', text: 'text-rose-700', border: 'border-rose-300' },
];

const getGoalIcon = (goalName: string) => {
  const name = goalName.toLowerCase();
  if (name.includes('house') || name.includes('home')) return Home;
  if (name.includes('education') || name.includes('college') || name.includes('school')) return GraduationCap;
  if (name.includes('vacation') || name.includes('travel') || name.includes('holiday')) return Palmtree;
  if (name.includes('retirement') || name.includes('fire')) return Wallet;
  if (name.includes('wedding') || name.includes('marriage')) return Heart;
  if (name.includes('car') || name.includes('vehicle')) return Users;
  return Target;
};

export const GoalInvestmentSummary = ({ userId }: GoalInvestmentSummaryProps) => {
  const [goalSummaries, setGoalSummaries] = useState<GoalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{ id: string; name: string } | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [celebratingGoals, setCelebratingGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGoalSummaries();
  }, [userId]);

  useEffect(() => {
    goalSummaries.forEach(goal => {
      if (goal.progress.percentage >= 100 && !celebratingGoals.has(goal.goal_id)) {
        setCelebratingGoals(prev => new Set(prev).add(goal.goal_id));
        setTimeout(() => {
          setCelebratingGoals(prev => {
            const newSet = new Set(prev);
            newSet.delete(goal.goal_id);
            return newSet;
          });
        }, 5000);
      }
    });
  }, [goalSummaries]);

  const fetchGoalSummaries = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/goal-investment-summary/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setGoalSummaries(data.goals || []);
      }
    } catch (error) {
      console.error('[GoalInvestmentSummary] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const assetColors: Record<string, string> = {
    Equity: 'bg-blue-500',
    Debt: 'bg-green-500',
    Hybrid: 'bg-purple-500',
    Gold: 'bg-yellow-500',
    Liquid: 'bg-cyan-500'
  };

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  // Check if SIP allocation matches recommended asset allocation
  const checkAllocationAlignment = (goal: GoalSummary): { isAligned: boolean; suggestions: string[] } => {
    const suggestions: string[] = [];

    if (!goal.sip_breakdown || Object.keys(goal.sip_breakdown).length === 0) {
      return { isAligned: true, suggestions: [] };
    }

    // Check each asset class against recommended
    Object.entries(goal.recommended_allocation).forEach(([asset, recommendedPct]) => {
      const actualSipPct = goal.sip_breakdown_pct[asset] || 0;
      const difference = actualSipPct - recommendedPct;

      if (Math.abs(difference) > 15) {
        if (difference > 0) {
          suggestions.push(`${asset}: You're allocating ${actualSipPct.toFixed(0)}% (recommended ${recommendedPct}%). Consider moving some ${asset} holdings to other goals.`);
        } else {
          suggestions.push(`${asset}: You're allocating ${actualSipPct.toFixed(0)}% (recommended ${recommendedPct}%). Consider adding more ${asset} holdings to this goal.`);
        }
      }
    });

    return { isAligned: suggestions.length === 0, suggestions };
  };

  const getTimeLeft = (targetYear: number) => {
    const today = new Date();
    const target = new Date(targetYear, 11, 31);
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: "Year passed", color: "text-red-600" };
    if (days < 365) return { text: `${days}d left`, color: "text-amber-600" };
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return { text: `${years}y ${months}m left`, color: "text-gray-600" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Investment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="ml-3 text-gray-600">Loading your goals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (goalSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goals & Portfolio Alignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No goals yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Create financial goals above to track your investment progress
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Simple Centered Header */}
        <div className="text-center py-4 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Goals & Portfolio Alignment
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track Your Progress Toward Financial Freedom
          </p>
        </div>

        {/* Ultra-Compact Goal Cards */}
        <AnimatePresence>
          {goalSummaries.map((goal, index) => {
            const hasHoldings = goal.holdings.length > 0;
            const isExpanded = expandedGoals.has(goal.goal_id);
            const isCompleted = goal.progress.percentage >= 100;
            const allocationCheck = checkAllocationAlignment(goal);
            const isAligned = allocationCheck.isAligned;
            const isCelebrating = celebratingGoals.has(goal.goal_id);
            const colorPalette = goalColorPalettes[index % goalColorPalettes.length];
            const GoalIcon = getGoalIcon(goal.goal_name);
            const timeLeft = getTimeLeft(goal.target_year);

            return (
              <motion.div
                key={goal.goal_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {isCelebrating && (
                  <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.3}
                  />
                )}

                <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                  isCompleted ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'
                }`}>
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => hasHoldings && toggleGoalExpansion(goal.goal_id)}
                  >
                    {/* Main Row - Everything in one line */}
                    <div className="flex items-center gap-6 mb-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl ${
                        isCompleted ? 'bg-yellow-500' :
                        index % 5 === 0 ? 'bg-blue-500' :
                        index % 5 === 1 ? 'bg-purple-500' :
                        index % 5 === 2 ? 'bg-green-500' :
                        index % 5 === 3 ? 'bg-orange-500' :
                        'bg-rose-500'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="h-6 w-6 text-white" />
                        ) : (
                          <GoalIcon className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Goal Name & Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-2xl text-gray-900 mb-1">
                          {goal.goal_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Target: {goal.target_year}</span>
                          <span className={timeLeft.color}>{timeLeft.text}</span>
                          <span>{goal.totals.holdings_count} Funds</span>
                        </div>
                      </div>

                      {/* Progress Bar (Compact, Inline) */}
                      <div className="w-64">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-gray-900">{goal.progress.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(goal.progress.percentage, 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              isCompleted ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {formatCurrency(goal.totals.current_value)} / {formatCurrency(goal.target_amount)}
                        </div>
                      </div>

                      {/* Monthly SIP */}
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Monthly SIP</div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-300">
                          <IndianRupee className="h-4 w-4 text-blue-700" />
                          <span className="text-base font-bold text-blue-900">
                            {goal.totals.monthly_sip?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isCompleted ? (
                        <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-yellow-100 border border-yellow-400">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                          <span className="text-xs font-bold text-yellow-700">ACHIEVED</span>
                        </div>
                      ) : isAligned ? (
                        <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-green-100 border border-green-400">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">ALIGNED</span>
                        </div>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-amber-100 border border-amber-400">
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                              <span className="text-xs font-bold text-amber-700">REALIGN</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">Realignment Suggestions:</p>
                              {allocationCheck.suggestions.map((suggestion, idx) => (
                                <p key={idx} className="text-xs">• {suggestion}</p>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {/* Financial Metrics Row */}
                    <div className="flex items-center gap-8 mb-3 pl-16">
                      <div>
                        <div className="text-xs text-gray-500">Allocated Amount</div>
                        <div className="text-base font-bold text-gray-900">
                          {formatCurrency(goal.amount_available || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Invested Value</div>
                        <div className="text-base font-bold text-gray-900">
                          {formatCurrency(goal.totals.invested)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Current Market Value</div>
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(goal.totals.current_value)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Profit/Loss</div>
                        <div className={`text-base font-bold ${goal.totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {goal.totals.profit >= 0 ? '+' : ''}{formatCurrency(goal.totals.profit)}
                        </div>
                      </div>
                    </div>

                    {/* Expand Indicator or Assign Button */}
                    {hasHoldings ? (
                      <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-200">
                        <span className="text-xs font-medium text-gray-600">
                          {isExpanded ? 'Hide' : 'View'} Holdings Details
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    ) : (
                      <div className="flex justify-center pt-3 border-t border-gray-200">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGoal({ id: goal.goal_id, name: goal.goal_name });
                            setAssignModalOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Assign Holdings & Set SIP
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Expandable Holdings */}
                  <AnimatePresence>
                    {hasHoldings && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t bg-white/60"
                      >
                        <div className="p-3 space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Holdings ({goal.holdings.length})
                            </h4>
                            <div className="bg-white border rounded-lg overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">Fund</th>
                                    <th className="px-2 py-1.5 text-center font-medium text-gray-600">Class</th>
                                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Value</th>
                                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Return</th>
                                    <th className="px-2 py-1.5 text-right font-medium text-cyan-600">SIP/mo</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {goal.holdings.map((holding) => (
                                    <tr key={holding.id} className="border-t hover:bg-gray-50">
                                      <td className="px-2 py-1.5">
                                        <div className="font-medium text-gray-900 truncate max-w-xs text-xs">{holding.scheme_name}</div>
                                      </td>
                                      <td className="px-2 py-1.5 text-center">
                                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${assetColors[holding.asset_class]}`}>
                                          {holding.asset_class}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1.5 text-right font-semibold text-gray-900">
                                        {formatCurrency(holding.market_value)}
                                      </td>
                                      <td className={`px-2 py-1.5 text-right font-semibold ${holding.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {holding.profit >= 0 ? '+' : ''}{holding.return_pct.toFixed(1)}%
                                      </td>
                                      <td className="px-2 py-1.5 text-right font-medium text-cyan-700">
                                        {holding.monthly_sip_amount > 0 ? `₹${holding.monthly_sip_amount.toLocaleString()}` : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGoal({ id: goal.goal_id, name: goal.goal_name });
                                setAssignModalOpen(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs"
                            >
                              <Link2 className="h-3 w-3 mr-1.5" />
                              Manage Holdings & SIP
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {selectedGoal && (
          <AssignHoldingsModal
            open={assignModalOpen}
            onOpenChange={setAssignModalOpen}
            goalId={selectedGoal.id}
            goalName={selectedGoal.name}
            userId={userId}
            onSuccess={() => fetchGoalSummaries()}
          />
        )}
      </div>
    </TooltipProvider>
  );
};
