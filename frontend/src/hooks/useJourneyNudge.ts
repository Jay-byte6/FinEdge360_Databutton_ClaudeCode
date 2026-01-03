/**
 * useJourneyNudge - Smart journey guidance system
 * Shows ONE critical next action every login based on user's current progress
 *
 * PHILOSOPHY:
 * - Show nudge EVERY login to guide user to most important next step
 * - "Don't show again" only dismisses for current session (not permanent)
 * - Dynamic based on what user hasn't completed
 * - Clear, actionable guidance with direct links
 */

import { useState, useEffect } from 'react';

interface NudgeState {
  shouldShow: boolean;
  currentMilestone: number;
  dismissedThisSession: boolean;
}

// Session-based dismissal key (cleared on new login)
const SESSION_DISMISSAL_KEY = 'journey_nudge_dismissed_this_session';

// Milestone priority order - SEQUENTIAL because the journey is already in the right order!
// Milestones 1-3: FREE tier (foundation)
// Milestones 4-10: PREMIUM tier (optimization and growth)
const MILESTONE_PRIORITY = [
  1,  // Know Your Reality (Enter Details + Net Worth) - FREE
  2,  // Discover Your FIRE Number (FIRE Calculator) - FREE
  3,  // Master Tax Planning - FREE (END OF FREE TIER)
  4,  // Financial Health Check (Risk Assessment) - PREMIUM
  5,  // Design Your Portfolio (Asset Allocation) - PREMIUM
  6,  // Set Financial Goals (FIRE Planner/SIP) - PREMIUM
  7,  // Build Your Financial Plan - PREMIUM
  8,  // Book Expert Consultation - PREMIUM
  9,  // Automate Success (Auto-SIP) - PREMIUM
  10, // Portfolio Monitoring - PREMIUM
];

// Milestone details - Matching the actual Financial Freedom Journey
const MILESTONE_DETAILS: Record<number, {
  title: string;
  description: string;
  buttonText: string;
  route: string;
  icon: string;
  urgency: 'critical' | 'high' | 'medium';
  benefit: string;
}> = {
  1: {
    title: "Know Your Reality",
    description: "Enter your financial details and see your Net Worth instantly",
    buttonText: "Start My Journey",
    route: "/enter-details",
    icon: "📊",
    urgency: "critical",
    benefit: "Foundation for your entire financial journey"
  },
  2: {
    title: "Discover Your FIRE Number",
    description: "Find out exactly how much you need to retire early",
    buttonText: "Calculate FIRE Number",
    route: "/fire-calculator",
    icon: "🔥",
    urgency: "critical",
    benefit: "Know your retirement target corpus"
  },
  3: {
    title: "Master Tax Planning",
    description: "Save lakhs in taxes with personalized strategies",
    buttonText: "Optimize My Taxes",
    route: "/tax-planning",
    icon: "💰",
    urgency: "critical",
    benefit: "Keep more money working for you"
  },
  4: {
    title: "Financial Health Check",
    description: "Complete risk assessment and portfolio audit",
    buttonText: "Check My Financial Health",
    route: "/portfolio",
    icon: "🏥",
    urgency: "high",
    benefit: "Understand your risk tolerance & financial fitness"
  },
  5: {
    title: "Design Your Portfolio",
    description: "Get personalized asset allocation recommendations",
    buttonText: "Optimize My Portfolio",
    route: "/portfolio",
    icon: "📈",
    urgency: "high",
    benefit: "Build wealth with the right investment mix"
  },
  6: {
    title: "Set Financial Goals",
    description: "Define short, medium, and long-term goals with exact SIP amounts",
    buttonText: "Plan My Goals",
    route: "/fire-planner",
    icon: "🎯",
    urgency: "high",
    benefit: "Clear roadmap to achieve all your dreams"
  },
  7: {
    title: "Build Your Financial Plan",
    description: "Match investments to goals with month-by-month action plan",
    buttonText: "Create My Plan",
    route: "/fire-planner",
    icon: "📋",
    urgency: "medium",
    benefit: "Complete strategy for wealth creation"
  },
  8: {
    title: "Book Expert Consultation",
    description: "Get your plan validated by SEBI-registered advisors (FREE)",
    buttonText: "Book Free Consultation",
    route: "/consultation",
    icon: "👨‍💼",
    urgency: "medium",
    benefit: "Expert guidance & personalized fund recommendations"
  },
  9: {
    title: "Automate Success",
    description: "Set up Auto-SIP and remove emotional investing decisions",
    buttonText: "Automate My Investments",
    route: "/fire-planner",
    icon: "⚙️",
    urgency: "medium",
    benefit: "Set it and achieve it - peace of mind"
  },
  10: {
    title: "Portfolio Monitoring",
    description: "Continuous tracking with smart rebalancing recommendations",
    buttonText: "Start Monitoring",
    route: "/portfolio",
    icon: "📡",
    urgency: "medium",
    benefit: "Stay on track until all goals achieved"
  }
};

export const useJourneyNudge = (
  userId: string | undefined,
  completedMilestones: number[],
  isDataLoading: boolean = false
) => {
  const [nudgeState, setNudgeState] = useState<NudgeState>({
    shouldShow: false,
    currentMilestone: 1,
    dismissedThisSession: false,
  });

  // Initialize session dismissal state
  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_DISMISSAL_KEY) === 'true';
    setNudgeState(prev => ({
      ...prev,
      dismissedThisSession: dismissed
    }));
  }, []);

  // Determine the most important next milestone
  const getNextCriticalMilestone = (): number => {
    // Find first incomplete milestone in priority order
    for (const milestoneNum of MILESTONE_PRIORITY) {
      if (!completedMilestones.includes(milestoneNum)) {
        return milestoneNum;
      }
    }
    // All milestones complete - return 10 (Premium) as default
    return 10;
  };

  // Show nudge on login if not dismissed this session
  useEffect(() => {
    if (!userId || isDataLoading) return;

    const nextMilestone = getNextCriticalMilestone();
    const alreadyDismissed = sessionStorage.getItem(SESSION_DISMISSAL_KEY) === 'true';

    // Show nudge if:
    // 1. User is logged in
    // 2. Data has loaded
    // 3. Not dismissed this session
    // 4. Not all milestones complete
    if (!alreadyDismissed && completedMilestones.length < 10) {
      // Delay showing by 7 seconds to let page fully load
      const timer = setTimeout(() => {
        console.log('[JourneyNudge] Showing nudge for milestone:', nextMilestone);
        console.log('[JourneyNudge] Completed milestones:', completedMilestones);
        setNudgeState({
          shouldShow: true,
          currentMilestone: nextMilestone,
          dismissedThisSession: false,
        });
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [userId, completedMilestones, isDataLoading]);

  // Close nudge for this session
  const dismissThisSession = () => {
    sessionStorage.setItem(SESSION_DISMISSAL_KEY, 'true');
    setNudgeState(prev => ({
      ...prev,
      shouldShow: false,
      dismissedThisSession: true,
    }));
    console.log('[JourneyNudge] Dismissed for this session - will show again on next login');
  };

  // Close nudge temporarily (user clicked main action)
  const closeNudge = () => {
    setNudgeState(prev => ({
      ...prev,
      shouldShow: false,
    }));
  };

  // Get details for current milestone
  const getMilestoneDetails = () => {
    return MILESTONE_DETAILS[nudgeState.currentMilestone] || MILESTONE_DETAILS[2];
  };

  // Force show nudge (for testing or manual trigger)
  const showNudgeNow = () => {
    const nextMilestone = getNextCriticalMilestone();
    setNudgeState({
      shouldShow: true,
      currentMilestone: nextMilestone,
      dismissedThisSession: false,
    });
  };

  return {
    shouldShow: nudgeState.shouldShow,
    currentMilestone: nudgeState.currentMilestone,
    milestoneDetails: getMilestoneDetails(),
    closeNudge,
    dismissThisSession,
    showNudgeNow,
    completedCount: completedMilestones.length,
    totalMilestones: 10,
  };
};
