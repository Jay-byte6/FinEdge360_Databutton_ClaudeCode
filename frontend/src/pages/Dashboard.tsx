import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Check } from 'lucide-react';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import FinancialRoadmap from '@/components/FinancialRoadmap';
import { DailyInsightsCard } from '@/components/DailyInsightsCard';
import { PremiumGoalRoadmap } from '@/components/PremiumGoalRoadmap';
import { MilestoneProgressCard } from '@/components/MilestoneProgressCard';
import { JourneyMapSimple } from '@/components/journey/JourneyMapSimple';
import { UserJourneyState } from '@/components/journey/types';
import { calculateNetWorth, calculateBasicFIRENumber } from '../utils/financialCalculations';
import { isPremiumUser } from '../utils/premiumCheck';
import { API_ENDPOINTS } from '@/config/api';

type DashboardCard = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
};

interface Goal {
  id: string;
  name: string;
  amountRequiredFuture: number;
  amountAvailableToday?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuthStore();
  const { financialData, fetchFinancialData } = useFinancialDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers to show in lakhs/crores
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Check premium status
  useEffect(() => {
    const premium = isPremiumUser();
    setIsPremium(premium);
  }, []);

  // Load financial data
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          await fetchFinancialData(user.id);
        } catch (error) {
          console.error("Error loading financial data:", error);
          toast.error("Could not load your financial data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, fetchFinancialData]);

  // Load goals for premium users
  useEffect(() => {
    if (!isPremium || !user?.id) return;

    const fetchGoals = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getSIPPlanner(user.id));
        if (response.ok) {
          const data = await response.json();
          if (data.goals && Array.isArray(data.goals)) {
            setGoals(data.goals.filter((g: Goal) => g.amountRequiredFuture > 0));
          }
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching goals:', error);
      }
    };

    fetchGoals();
  }, [isPremium, user?.id]);

  // Calculate metrics for DailyInsightsCard
  const netWorth = financialData ? calculateNetWorth(financialData) : 0;

  const totalGoalsProgress = goals.length > 0
    ? goals.reduce((sum, goal) => {
        const progress = goal.amountAvailableToday
          ? (goal.amountAvailableToday / goal.amountRequiredFuture) * 100
          : 0;
        return sum + Math.min(progress, 100);
      }, 0) / goals.length
    : 0;

  const goalsOnTrack = goals.filter(goal => {
    if (!goal.amountAvailableToday) return false;
    const progress = (goal.amountAvailableToday / goal.amountRequiredFuture) * 100;
    return progress >= 50; // Consider on-track if >= 50% progress
  }).length;

  // Calculate current milestone for Journey Map preview
  const [currentMilestone, setCurrentMilestone] = useState(1);
  useEffect(() => {
    const calculateCurrentMilestone = () => {
      let milestone = 1;

      // Check each milestone completion
      if (financialData) {
        milestone = 2; // Has financial data - on Step 2

        // Check if FIRE calculated (same as having data for now)
        if (financialData) milestone = 3;

        // Step 4 onwards requires API checks, which are async
        // For now, use a simple heuristic based on goals
        if (goals.length > 0) milestone = Math.min(milestone + 3, 8);
      }

      setCurrentMilestone(milestone);
    };

    calculateCurrentMilestone();
  }, [financialData, goals]);

  // Dashboard cards configuration
  const dashboardCards: DashboardCard[] = [
    {
      title: "Enter Details",
      description: "Update your financial information",
      path: "/enter-details",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "FIRE Calculator",
      description: "Track your path to financial independence",
      path: "/fire-calculator",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      title: "Net Worth",
      description: "Visualize your assets and liabilities",
      path: "/net-worth",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: "bg-teal-50 text-teal-600 border-teal-100"
    },
    {
      title: "FIRE Planner",
      description: "Plan for goals with systematic investments",
      path: "/fire-planner",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      title: "Portfolio",
      description: "Track your mutual fund holdings",
      path: "/portfolio",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      title: "Tax Planning",
      description: "Compare old and new tax regimes",
      path: "/tax-planning",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-7xl py-6 px-4">
        {/* SEBI Compliance Badge */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500">
            <CardContent className="py-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-center">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm md:text-base font-bold text-green-900">
                      COMPLIANT WITH SEBI REGULATIONS
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Educational Tool • No Advisory Services • Self-Service Platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section */}
        <section className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome, {profile?.full_name || user?.email?.split('@')[0] || "User"}
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Your financial dashboard at a glance. Plan smart, retire early.
          </p>
        </section>

        {/* Financial Summary Section */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 md:p-6 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : financialData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">Monthly Income</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(financialData.personalInfo.monthlySalary)}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Annual: {formatIndianCurrency(financialData.personalInfo.monthlySalary * 12)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">Monthly Expenses</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(financialData.personalInfo.monthlyExpenses)}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Annual: {formatIndianCurrency(financialData.personalInfo.monthlyExpenses * 12)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">Net Worth</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(calculateNetWorth(financialData))}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Basic FIRE: {formatIndianCurrency(calculateBasicFIRENumber(financialData))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">Savings Rate</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {Math.round(((financialData.personalInfo.monthlySalary - financialData.personalInfo.monthlyExpenses) / financialData.personalInfo.monthlySalary) * 100)}%
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Monthly: {formatIndianCurrency(financialData.personalInfo.monthlySalary - financialData.personalInfo.monthlyExpenses)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 md:p-8 bg-white rounded-lg shadow mb-6">
            <p className="text-gray-600 mb-4 text-sm md:text-base">No financial data available yet.</p>
            <Button onClick={() => navigate('/enter-details')} size="sm">
              Enter Your Financial Details
            </Button>
          </div>
        )}

        {/* Premium Insights Section - NEW */}
        {financialData && (
          <div className="space-y-6 mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Your Financial Journey</h3>

            {/* Row 1: Daily Insights & Goal Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyInsightsCard
                netWorth={netWorth}
                totalGoalsProgress={totalGoalsProgress}
                goalsOnTrack={goalsOnTrack}
                totalGoals={goals.length}
                isPremium={isPremium}
              />

              <PremiumGoalRoadmap
                userId={user?.id || ''}
                isPremium={isPremium}
              />
            </div>

            {/* Row 2: Milestone Progress and Journey Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MilestoneProgressCard
                userId={user?.id || ''}
                isPremium={isPremium}
                hasFinancialData={!!financialData}
              />

              {/* Journey Map Preview Card */}
              <Card
                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => isPremium && navigate('/journey-map')}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Your Journey Map
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">Visual roadmap to financial freedom</p>
                </CardHeader>

                <CardContent className={!isPremium ? 'filter blur-sm' : ''}>
                  <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg p-6 min-h-[300px] flex flex-col items-center justify-center">
                    {/* Simple visual representation of the journey */}
                    <div className="relative w-full max-w-md">
                      {/* Simplified road visual */}
                      <svg viewBox="0 0 400 300" className="w-full h-auto">
                        <defs>
                          <linearGradient id="roadPreview" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#1f2937" />
                            <stop offset="100%" stopColor="#4b5563" />
                          </linearGradient>
                        </defs>
                        {/* Curved road path */}
                        <path
                          d="M 50 280 Q 150 250, 200 200 T 350 50"
                          stroke="url(#roadPreview)"
                          strokeWidth="30"
                          fill="none"
                          strokeLinecap="round"
                        />
                        {/* Milestone markers */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const positions = [
                            { x: 50, y: 280 },
                            { x: 125, y: 235 },
                            { x: 200, y: 200 },
                            { x: 275, y: 125 },
                            { x: 350, y: 50 }
                          ];
                          const isCompleted = i === 0 || i === 1;
                          const isCurrent = i === 2;

                          return (
                            <g key={i}>
                              <circle
                                cx={positions[i].x}
                                cy={positions[i].y}
                                r="12"
                                fill={isCompleted ? '#10b981' : isCurrent ? '#fbbf24' : '#9ca3af'}
                                stroke="white"
                                strokeWidth="2"
                              />
                              {isCurrent && (
                                <>
                                  <circle
                                    cx={positions[i].x}
                                    cy={positions[i].y}
                                    r="18"
                                    fill="none"
                                    stroke="#fbbf24"
                                    strokeWidth="2"
                                    opacity="0.5"
                                  >
                                    <animate
                                      attributeName="r"
                                      from="12"
                                      to="24"
                                      dur="2s"
                                      repeatCount="indefinite"
                                    />
                                    <animate
                                      attributeName="opacity"
                                      from="0.8"
                                      to="0"
                                      dur="2s"
                                      repeatCount="indefinite"
                                    />
                                  </circle>
                                  {/* "You Are Here" marker */}
                                  <text
                                    x={positions[i].x}
                                    y={positions[i].y - 30}
                                    textAnchor="middle"
                                    className="text-xs font-bold fill-yellow-600"
                                  >
                                    YOU ARE HERE
                                  </text>
                                </>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Status text */}
                    <div className="mt-6 text-center">
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        Milestone {currentMilestone} of 10
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Keep going! You're making great progress on your journey to financial freedom.
                      </p>
                      {isPremium && (
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          View Full Journey Map
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>

                {!isPremium && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/40 z-20 flex items-center justify-center rounded-lg">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 border-2 border-blue-200 text-center">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Feature</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Interactive Journey Map</strong> is available for Premium users only.
                      </p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/pricing');
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              className={`${card.color} border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => handleNavigation(card.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-bold">{card.title}</CardTitle>
                  <div className="p-2 rounded-full bg-white/80">
                    {card.icon}
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-700">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-xs md:text-sm font-medium hover:bg-transparent hover:underline"
                >
                  Go to {card.title} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Road to Financial Freedom - FinancialRoadmap Component */}
        {financialData && Object.keys(financialData).length > 0 && (
          <div className="mb-6">
            <FinancialRoadmap
              financialData={financialData}
              userId={user?.id}
              isPremium={isPremium}
            />
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="mb-6">
          <Card className="bg-amber-50 border-amber-300">
            <CardContent className="py-3">
              <p className="text-xs text-amber-900 text-center">
                <strong>DISCLAIMER:</strong> FIREMap is an educational financial planning tool.
                We do NOT provide investment advice, recommend specific securities, or manage investments.
                All calculations are for educational purposes only. Please consult a{' '}
                <a
                  href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-700"
                >
                  SEBI Registered Investment Advisor
                </a>{' '}
                for personalized investment advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
