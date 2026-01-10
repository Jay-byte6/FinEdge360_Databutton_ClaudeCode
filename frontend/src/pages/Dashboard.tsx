import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Check } from 'lucide-react';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import usePortfolioStore from '../utils/portfolioStore';
import FinancialRoadmap from '@/components/FinancialRoadmap';
import { DailyInsightsCard } from '@/components/DailyInsightsCard';
import { FIREScenariosCard } from '@/components/FIREScenariosCard';
import { PremiumNewFIRECard } from '@/components/PremiumNewFIRECard';
import { RiskPortfolioOverviewCard } from '@/components/RiskPortfolioOverviewCard';
import { PremiumGoalRoadmap } from '@/components/PremiumGoalRoadmap';
import { MilestoneProgressCard } from '@/components/MilestoneProgressCard';
import { JourneyMapSimple } from '@/components/journey/JourneyMapSimple';
import { UserJourneyState } from '@/components/journey/types';
import { ActionItemsCard } from '@/components/ActionItemsCard';
import { PortfolioHoldingsOverview } from '@/components/PortfolioHoldingsOverview';
import { PortfolioSummaryCards } from '@/components/PortfolioSummaryCards';
import { calculateNetWorth, calculateBasicFIRENumber } from '../utils/financialCalculations';
import { isPremiumUser } from '../utils/premiumCheck';
import { API_ENDPOINTS } from '@/config/api';
import { PrelaunchOfferBanner } from '@/components/PrelaunchOfferBanner';
import { MilestoneNudgePopup } from '@/components/MilestoneNudgePopup';
import { MilestoneCelebration } from '@/components/MilestoneCelebration';
import { FeedbackNudge } from '@/components/FeedbackNudge';
import { useJourneyNudge } from '@/hooks/useJourneyNudge';
import { getDailyChange } from '../utils/portfolioSnapshotTracker';
import { useAutomaticPortfolioRefresh } from '@/hooks/useAutomaticPortfolioRefresh';

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
  const { holdings, summary, fetchHoldings } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedMilestonesArray, setCompletedMilestonesArray] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<number>(1);
  const [milestonesLoading, setMilestonesLoading] = useState(true); // Track milestone data loading
  const [portfolioChange, setPortfolioChange] = useState<number | undefined>(undefined);

  // Feedback nudge state
  const [showFeedbackNudge, setShowFeedbackNudge] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'quick_rating' | 'feature_satisfaction' | 'goal_selection' | 'yes_no_poll' | 'journey_confidence'>('quick_rating');
  const [feedbackMilestone, setFeedbackMilestone] = useState<number | undefined>(undefined);

  // Automatic portfolio refresh - updates NAV values automatically
  const { refreshPortfolio, hasPortfolio } = useAutomaticPortfolioRefresh(user?.id, {
    enabled: true,
    refreshOnMount: true, // Refresh when dashboard loads
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    onRefresh: async () => {
      console.log('[Dashboard] Portfolio auto-refreshed with latest NAV');
      // Immediately refresh daily change after portfolio update
      if (user?.id) {
        try {
          const changeData = await getDailyChange(user.id);
          if (changeData) {
            if (changeData.has_data) {
              setPortfolioChange(changeData.daily_change);
              console.log('[Dashboard] Daily change updated:', changeData.daily_change);
            } else {
              setPortfolioChange(0);
              console.log('[Dashboard] No historical data yet - showing ₹0');
            }
          }
        } catch (error) {
          console.error('[Dashboard] Error refreshing daily change after auto-refresh:', error);
          setPortfolioChange(0);
        }
      }
    }
  });

  // Journey nudge system - only show after ALL data is loaded
  const journeyNudge = useJourneyNudge(
    user?.id,
    completedMilestonesArray,
    isLoading || milestonesLoading // Pass loading state to prevent premature nudges
  );

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
          toast.error("Welcome! Please complete your financial profile in the Profile page to view your dashboard.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, fetchFinancialData]);

  // Load portfolio holdings
  useEffect(() => {
    if (user?.id) {
      fetchHoldings(user.id);
    }
  }, [user?.id, fetchHoldings]);

  // Load portfolio daily change
  useEffect(() => {
    const loadDailyChange = async () => {
      if (!user?.id || !summary) return;

      try {
        const changeData = await getDailyChange(user.id);
        if (changeData) {
          if (changeData.has_data) {
            setPortfolioChange(changeData.daily_change);
            console.log('[Dashboard] Daily change loaded:', changeData.daily_change);
          } else {
            // No historical data yet - set to 0 so it shows "₹0 today"
            setPortfolioChange(0);
            console.log('[Dashboard] No historical data yet - showing ₹0 daily change');
          }
        }
      } catch (error) {
        console.error('[Dashboard] Error loading portfolio daily change:', error);
        // On error, also set to 0 to show something
        setPortfolioChange(0);
      }
    };

    loadDailyChange();
  }, [user?.id, summary]);

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

  // Calculate Coast FIRE number
  const coastFIRE = financialData ? (() => {
    const retirementAge = financialData.riskAppetite?.retirementAge || 60;
    const coastAge = 40; // Default Coast FIRE age
    const currentAge = financialData.personalInfo.age || 30;
    const monthlyExpenses = financialData.personalInfo.monthlyExpenses || 0;
    const inflationRate = 0.06; // 6% inflation
    const growthRate = 0.05; // 5% conservative annual growth

    // Calculate years
    const yearsToRetirement = retirementAge - currentAge;
    const yearsCoastToRetirement = retirementAge - coastAge;

    // Calculate FIRE number at retirement
    const inflationFactor = Math.pow(1 + inflationRate, yearsToRetirement);
    const yearlyExpensesRetirement = monthlyExpenses * 12 * inflationFactor;
    const requiredCorpus = yearlyExpensesRetirement * 25; // 4% rule

    // Calculate Coast FIRE (how much you need by coastAge to let it grow to requiredCorpus)
    const coastGrowthFactor = Math.pow(1 + growthRate, yearsCoastToRetirement);
    const coastFIRENumber = requiredCorpus / coastGrowthFactor;

    return coastFIRENumber;
  })() : 0;

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
    const calculateCurrentMilestone = async () => {
      if (!user?.id) {
        setCurrentMilestone(1);
        setMilestonesLoading(false);
        return;
      }

      // Start loading milestones
      setMilestonesLoading(true);

      const completedMilestones: number[] = [];

      // Milestone 1, 2, 3: Financial data
      if (financialData) {
        completedMilestones.push(1, 2, 3);
      } else {
        setCurrentMilestone(1);
        setMilestonesLoading(false); // No data means calculation is complete
        return;
      }

      // Milestone 4: Portfolio holdings
      try {
        const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(user.id));
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          if (portfolioData.holdings && portfolioData.holdings.length > 0) {
            completedMilestones.push(4);
          }
        }
      } catch (err) {
        // Continue
      }

      // Milestone 5: Asset allocation
      try {
        const allocRes = await fetch(API_ENDPOINTS.getAssetAllocation(user.id));
        if (allocRes.ok) {
          const allocData = await allocRes.json();
          if (allocData.allocations && allocData.allocations.length > 0) {
            completedMilestones.push(5);
          }
        }
      } catch (err) {
        // Continue
      }

      // Milestone 6: Goals created
      if (goals.length > 0) {
        completedMilestones.push(6);

        // Milestone 7: Goals with asset allocation/plan
        const hasGoalsWithPlan = goals.some((g: any) => g.assetAllocation || (g.sipRequired && g.sipRequired > 0));
        if (hasGoalsWithPlan) {
          completedMilestones.push(7);
        }
      }

      // Milestone 8: Expert consultation (always pending for now)
      // Skip milestone 8

      // Milestone 9: Automate Success - ALL goals must have SIP
      const allGoalsHaveSIP = goals.length > 0 && goals.every((g: any) => g.sipRequired && g.sipRequired > 0);
      if (allGoalsHaveSIP) {
        completedMilestones.push(9);
      }

      // Milestone 10: Portfolio monitoring (always in progress if portfolio exists)
      // Skip milestone 10

      // Find first incomplete milestone
      let current = 1;
      for (let i = 1; i <= 10; i++) {
        if (!completedMilestones.includes(i)) {
          current = i;
          break;
        }
      }
      if (completedMilestones.length === 10) {
        current = 10; // All complete
      }

      setCurrentMilestone(current);

      // Update completed milestones array for journey system
      const prevCompleted = completedMilestonesArray.length;
      setCompletedMilestonesArray(completedMilestones);

      // Show celebration if a new milestone was just completed
      if (completedMilestones.length > prevCompleted) {
        // Check if celebration popups are dismissed for this session
        const celebrationDismissed = sessionStorage.getItem('celebration_popups_dismissed_this_session') === 'true';

        if (!celebrationDismissed) {
          const newMilestone = completedMilestones[completedMilestones.length - 1];
          setCelebrationMilestone(newMilestone);
          setShowCelebration(true);
        } else {
          console.log('[Dashboard] Celebration popup dismissed for this session - skipping');
        }
      }

      // Milestone calculation complete - now safe to show nudges
      setMilestonesLoading(false);
    };

    calculateCurrentMilestone();
  }, [financialData, goals, user?.id, completedMilestonesArray.length]);

  // Trigger feedback nudge after specific milestones
  useEffect(() => {
    if (milestonesLoading || !user?.id) return;

    // Check if user already gave feedback for this milestone
    const lastFeedbackMilestone = localStorage.getItem(`last_feedback_milestone_${user.id}`);
    const highestCompleted = completedMilestonesArray.length > 0
      ? Math.max(...completedMilestonesArray)
      : 0;

    // Trigger feedback after milestone 3, 6, or 10
    const feedbackMilestones = [3, 6, 10];
    const shouldTriggerFeedback = feedbackMilestones.includes(highestCompleted);

    if (shouldTriggerFeedback && lastFeedbackMilestone !== String(highestCompleted)) {
      // Delay for milestones 3 and 6 (5 minutes), immediate for milestone 10
      const delay = highestCompleted === 10 ? 1000 : 5 * 60 * 1000;

      const timer = setTimeout(() => {
        // Set appropriate feedback type based on milestone
        if (highestCompleted === 3) {
          setFeedbackType('goal_selection'); // After setting goals
        } else if (highestCompleted === 6) {
          setFeedbackType('journey_confidence'); // After risk assessment
        } else if (highestCompleted === 10) {
          setFeedbackType('quick_rating'); // After journey complete
        }

        setFeedbackMilestone(highestCompleted);
        setShowFeedbackNudge(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [completedMilestonesArray, milestonesLoading, user?.id]);

  // Handle feedback nudge close
  const handleFeedbackClose = () => {
    if (user?.id && feedbackMilestone) {
      // Remember that we showed feedback for this milestone
      localStorage.setItem(`last_feedback_milestone_${user.id}`, String(feedbackMilestone));
    }
    setShowFeedbackNudge(false);
  };

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
    },
    {
      title: "Download Report",
      description: "Get your complete financial report",
      path: "/profile",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      color: "bg-pink-50 text-pink-600 border-pink-100"
    },
    {
      title: "PowerFIRE Tips",
      description: "Accelerate your journey to Financial Independence",
      path: "/portfolio#powerfire-tips",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      color: "bg-orange-50 text-orange-600 border-orange-100"
    },
    {
      title: "Risk Coverage",
      description: "Protect your FIRE journey with insurance",
      path: "/portfolio#risk-coverage",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "Smart Tax Saving Tips",
      description: "Optimize your tax liability intelligently",
      path: "/tax-planning#smart-tax-tips",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      title: "Set Goals",
      description: "Define your financial goals",
      path: "/fire-planner?tab=set-goals",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>,
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      title: "Asset Allocation",
      description: "Design your investment strategy",
      path: "/fire-planner?tab=asset-allocation",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      title: "FIRE Strategy",
      description: "View comprehensive FIRE dashboard",
      path: "/fire-calculator#fire-strategy-dashboard",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      color: "bg-cyan-50 text-cyan-600 border-cyan-100"
    },
    {
      title: "Corpus Growth",
      description: "Track your wealth projection over time",
      path: "/fire-calculator#corpus-growth-projection",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      title: "Tax Regime Comparison",
      description: "Compare old vs new tax regimes",
      path: "/tax-planning#tax-regime-comparison",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      color: "bg-violet-50 text-violet-600 border-violet-100"
    },
    {
      title: "Health Insurance",
      description: "Optimize Section 80D deductions",
      path: "/tax-planning#section-80d",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      color: "bg-red-50 text-red-600 border-red-100"
    },
    {
      title: "Investment Risks",
      description: "Analyze your portfolio risk ladder",
      path: "/portfolio#financial-ladder",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      color: "bg-yellow-50 text-yellow-600 border-yellow-100"
    },
    {
      title: "Book Consultation",
      description: "Get expert financial guidance",
      path: "/consultation",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      color: "bg-rose-50 text-rose-600 border-rose-100"
    }
  ];

  const handleNavigation = (path: string) => {
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      navigate(route);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.scrollBy(0, -80); // Offset for sticky header
        }
      }, 500);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Prelaunch Offer Banner */}
      <PrelaunchOfferBanner
        completedMilestones={completedMilestonesArray.length}
        totalMilestones={10}
      />

      {/* Milestone Nudge Popup - Simplified session-based system */}
      {journeyNudge.shouldShow && (
        <MilestoneNudgePopup
          milestoneDetails={journeyNudge.milestoneDetails}
          completedCount={journeyNudge.completedCount}
          totalMilestones={journeyNudge.totalMilestones}
          onClose={journeyNudge.closeNudge}
          onDismissThisSession={journeyNudge.dismissThisSession}
        />
      )}

      {/* Milestone Celebration */}
      {showCelebration && (
        <MilestoneCelebration
          milestoneNumber={celebrationMilestone}
          milestoneTitle={`Milestone ${celebrationMilestone}`}
          onContinue={() => setShowCelebration(false)}
          nextMilestoneRoute={undefined} // Let component use its built-in route mapping
          totalCompleted={completedMilestonesArray.length}
        />
      )}

      {/* Feedback Nudge */}
      {showFeedbackNudge && (
        <FeedbackNudge
          open={showFeedbackNudge}
          onClose={handleFeedbackClose}
          feedbackType={feedbackType}
          milestone={feedbackMilestone}
          featureName={
            feedbackMilestone === 3 ? "Goal Planning" :
            feedbackMilestone === 6 ? "Risk Assessment" :
            feedbackMilestone === 10 ? "Complete Journey" : undefined
          }
        />
      )}

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
        <section className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-blue-100">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
              Welcome back, {financialData?.personalInfo?.name || profile?.full_name || user?.email?.split('@')[0] || "User"}! 👋
            </span>
          </h2>
          <p className="text-gray-700 text-base md:text-lg font-medium">
            Your financial dashboard at a glance. Plan smart, retire early. 🚀
          </p>
        </section>

        {/* Financial Summary Section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            💰 Your Financial Snapshot
          </h3>
          <div className="h-1 w-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-sm md:text-base mb-6 -mt-2 ml-14">Key numbers that define your financial health</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 md:p-6 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : financialData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-sm md:text-base font-medium text-gray-500 mb-1">Monthly Income</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(financialData.personalInfo.monthlySalary)}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Annual: {formatIndianCurrency(financialData.personalInfo.monthlySalary * 12)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-sm md:text-base font-medium text-gray-500 mb-1">Monthly Expenses</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(financialData.personalInfo.monthlyExpenses)}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Annual: {formatIndianCurrency(financialData.personalInfo.monthlyExpenses * 12)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-sm md:text-base font-medium text-gray-500 mb-1">Net Worth</div>
              <div className="text-lg md:text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(calculateNetWorth(financialData))}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                Basic FIRE: {formatIndianCurrency(calculateBasicFIRENumber(financialData))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="text-sm md:text-base font-medium text-gray-500 mb-1">Savings Rate</div>
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

        {/* Portfolio Holdings Summary Cards - from Portfolio Page */}
        {summary && holdings.length > 0 && (
          <div className="mb-6">
            <PortfolioSummaryCards summary={summary} />
          </div>
        )}

        {/* PowerUp FIREMap - Share Your Ideas Button */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                  <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl md:text-3xl">💡</span>
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Help Us Improve FIREMap!</h3>
                    <p className="text-xs md:text-sm text-gray-600">Share your ideas, suggestions, and feedback to make FIREMap even better</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/feedback')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-4 md:px-6 py-4 md:py-6 rounded-xl shadow-md hover:shadow-lg transition-all w-full md:w-auto flex-shrink-0"
                >
                  <span className="flex items-center justify-center gap-1 flex-wrap">
                    <span>🚀 PowerUp FIREMap</span>
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Insights Section - NEW */}
        {financialData && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 Your Financial Journey
              </h3>
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
            <p className="text-gray-600 text-sm md:text-base -mt-2 ml-16">Track your progress, achieve your goals, reach FIRE</p>

            {/* Row 1: Daily Insights & Goal Roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
              <DailyInsightsCard
                netWorth={netWorth}
                coastFIRE={coastFIRE}
                totalGoalsProgress={totalGoalsProgress}
                goalsOnTrack={goalsOnTrack}
                totalGoals={goals.length}
                isPremium={isPremium}
                portfolioValue={summary?.current_value}
                portfolioProfit={summary?.total_profit}
                portfolioReturn={summary?.overall_return}
                portfolioChange={portfolioChange}
              />

              <PremiumGoalRoadmap
                userId={user?.id || ''}
                isPremium={isPremium}
              />
            </div>

            {/* Row 2: Left Column (Progress + Journey Map) | Right Column (FIRE Scenarios + Premium FIRE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6 lg:items-start">
              {/* Left Column: Milestone Progress + Journey Map */}
              <div className="flex flex-col gap-3 md:gap-6">
                <MilestoneProgressCard
                  userId={user?.id || ''}
                  isPremium={isPremium}
                  hasFinancialData={!!financialData}
                />

                {/* Journey Map */}
                <Card
                  className="relative cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => isPremium && navigate('/journey3d')}
                >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <span className="font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        🗺️ Your Journey Map
                      </span>
                    </CardTitle>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 font-medium">Visual roadmap to financial freedom</p>
                </CardHeader>

                <CardContent className={!isPremium ? 'filter blur-sm' : ''}>
                  <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    {/* Simple visual representation of the journey */}
                    <div className="relative w-full max-w-sm">
                      {/* Simplified road visual */}
                      <svg viewBox="0 0 400 240" className="w-full h-auto">
                        <defs>
                          <linearGradient id="roadPreview" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#1f2937" />
                            <stop offset="100%" stopColor="#4b5563" />
                          </linearGradient>
                        </defs>
                        {/* Curved road path */}
                        <path
                          d="M 50 220 Q 150 200, 200 160 T 350 40"
                          stroke="url(#roadPreview)"
                          strokeWidth="25"
                          fill="none"
                          strokeLinecap="round"
                        />
                        {/* Milestone markers */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const positions = [
                            { x: 50, y: 220 },
                            { x: 125, y: 188 },
                            { x: 200, y: 160 },
                            { x: 275, y: 100 },
                            { x: 350, y: 40 }
                          ];
                          // Map preview positions to milestone numbers (1, 3, 5, 7, 9)
                          const milestoneNum = i === 0 ? 1 : i === 1 ? 3 : i === 2 ? 5 : i === 3 ? 7 : 9;
                          const isCompleted = milestoneNum < currentMilestone;
                          const isCurrent = milestoneNum === currentMilestone;

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
                    <div className="mt-4 text-center">
                      <p className="text-base font-bold text-gray-900 mb-1">
                        Milestone {currentMilestone} of 10
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Keep going! Making great progress.
                      </p>
                      {isPremium && (
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          View Full Map
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

              {/* Right Column: FIRE Scenarios + Premium NEW FIRE + Risk & Portfolio */}
              <div className="flex flex-col gap-3 md:gap-6">
                {/* FIRE Scenarios Overview */}
                <FIREScenariosCard
                  financialData={financialData}
                  isPremium={isPremium}
                />

                {/* Premium NEW FIRE Overview */}
                <PremiumNewFIRECard
                  financialData={financialData}
                  isPremium={isPremium}
                />

                {/* Risk & Portfolio Overview */}
                <RiskPortfolioOverviewCard
                  financialData={financialData}
                  isPremium={isPremium}
                  userId={user?.id || ''}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Items Dashboard - NEW */}
        {user?.id && (
          <div className="mb-6">
            <ActionItemsCard
              userId={user.id}
              financialData={financialData}
              isPremium={isPremium}
            />
          </div>
        )}

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

        {/* Quick Actions Grid */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"></div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            ⚡ Quick Actions
          </h3>
          <div className="h-1 w-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-sm md:text-base mb-6 -mt-2 ml-14">Navigate to key sections of your financial plan</p>
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
