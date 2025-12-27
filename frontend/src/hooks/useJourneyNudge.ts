/**
 * useJourneyNudge - Hook to manage milestone nudge timing and display logic
 * Intelligently shows nudges at the right time without being annoying
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NudgeState {
  shouldShow: boolean;
  currentMilestone: number;
  completedMilestones: number[];
  dismissedForever: boolean;
  lastShownTime: number | null;
}

const NUDGE_STORAGE_KEY = 'finedge360_journey_nudge_state';
const NUDGE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between nudges
const NUDGE_DELAY_MS = 3000; // 3 seconds after page load
const DATA_STABILIZATION_DELAY_MS = 2000; // Wait 2 seconds for data to stabilize before showing nudge

// Smart route-to-milestone mapping - ONLY show nudges that make sense for that page
// Philosophy: Don't interrupt users on pages where they're already working on the milestone
const ROUTE_NUDGE_RULES: Record<string, {
  allowedMilestones: number[];
  suppressMilestones: number[];
  description: string;
}> = {
  '/': {
    allowedMilestones: [1, 2, 8, 10], // Dashboard: Start journey, set goals, book consultation, upgrade
    suppressMilestones: [3, 4, 5, 6, 7, 9], // Don't nudge for features when they're on dashboard
    description: 'Dashboard - High-level nudges only'
  },
  '/enter-details': {
    allowedMilestones: [], // NO nudges - they're already entering details
    suppressMilestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Entering details - Let them focus'
  },
  '/net-worth': {
    allowedMilestones: [2, 3], // After viewing net worth, nudge for goals or FIRE calc
    suppressMilestones: [1, 4, 5, 6, 7, 8, 9, 10],
    description: 'Net Worth - Nudge next financial planning step'
  },
  '/fire-planner': {
    allowedMilestones: [], // NO nudges - they're working on goals/SIPs
    suppressMilestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'FIRE Planner - Let them plan'
  },
  '/fire-calculator': {
    allowedMilestones: [4, 9], // After FIRE calc, nudge for SIP plan or automation
    suppressMilestones: [1, 2, 3, 5, 6, 7, 8, 10],
    description: 'FIRE Calculator - Nudge implementation next'
  },
  '/portfolio': {
    allowedMilestones: [5, 6], // Portfolio page - nudge for risk assessment or optimization
    suppressMilestones: [1, 2, 3, 4, 7, 8, 9, 10],
    description: 'Portfolio - Nudge portfolio-related actions only'
  },
  '/tax-planning': {
    allowedMilestones: [], // NO nudges - they're doing tax planning
    suppressMilestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Tax Planning - Let them focus on taxes'
  },
  '/consultation': {
    allowedMilestones: [], // NO nudges - they're booking consultation
    suppressMilestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Consultation - Let them book'
  },
  '/profile': {
    allowedMilestones: [8, 10], // Profile - nudge for consultation or premium
    suppressMilestones: [1, 2, 3, 4, 5, 6, 7, 9],
    description: 'Profile - High-level nudges only'
  },
};

export const useJourneyNudge = (
  userId: string | undefined,
  completedMilestones: number[]
) => {
  const location = useLocation();
  const [nudgeState, setNudgeState] = useState<NudgeState>({
    shouldShow: false,
    currentMilestone: 1,
    completedMilestones: [],
    dismissedForever: false,
    lastShownTime: null,
  });

  // Load saved nudge state from localStorage
  useEffect(() => {
    if (!userId) return;

    const savedState = localStorage.getItem(`${NUDGE_STORAGE_KEY}_${userId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setNudgeState(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading nudge state:', error);
      }
    }
  }, [userId]);

  // Update current milestone when completedMilestones changes
  // DEBOUNCED to prevent rapid changes during data loading
  useEffect(() => {
    // Wait for data to stabilize before updating milestone
    // This prevents multiple rapid nudges as data loads incrementally
    const debounceTimer = setTimeout(() => {
      // Find the next incomplete milestone
      const totalMilestones = 10;
      let nextMilestone = totalMilestones;
      for (let i = 1; i <= totalMilestones; i++) {
        if (!completedMilestones.includes(i)) {
          nextMilestone = i;
          break;
        }
      }

      setNudgeState(prev => ({
        ...prev,
        currentMilestone: nextMilestone,
        completedMilestones,
      }));
    }, DATA_STABILIZATION_DELAY_MS);

    return () => clearTimeout(debounceTimer);
  }, [completedMilestones]);

  // Save nudge state to localStorage
  const saveNudgeState = (newState: Partial<NudgeState>) => {
    if (!userId) return;

    const updatedState = { ...nudgeState, ...newState };
    setNudgeState(updatedState);
    localStorage.setItem(
      `${NUDGE_STORAGE_KEY}_${userId}`,
      JSON.stringify(updatedState)
    );
  };

  // Determine next milestone to complete
  const getNextMilestone = (): number => {
    const totalMilestones = 10;
    for (let i = 1; i <= totalMilestones; i++) {
      if (!completedMilestones.includes(i)) {
        return i;
      }
    }
    return totalMilestones; // All complete
  };

  // Check if we should show nudge on current route - SMART CONTEXTUAL LOGIC
  const shouldShowNudgeForRoute = (milestone: number): boolean => {
    const currentPath = location.pathname;

    // Find matching route rule
    let routeRule = ROUTE_NUDGE_RULES[currentPath];

    // If no exact match, try to find parent route
    if (!routeRule) {
      for (const [route, rule] of Object.entries(ROUTE_NUDGE_RULES)) {
        if (currentPath.startsWith(route)) {
          routeRule = rule;
          break;
        }
      }
    }

    // If still no rule, default to dashboard behavior (conservative)
    if (!routeRule) {
      routeRule = ROUTE_NUDGE_RULES['/'];
    }

    // Check if this milestone is suppressed on this page
    if (routeRule.suppressMilestones.includes(milestone)) {
      return false; // Don't show - user is already on relevant page
    }

    // Check if this milestone is allowed on this page
    if (routeRule.allowedMilestones.includes(milestone)) {
      return true; // Show - this nudge makes sense here
    }

    // Default: don't show nudge if not explicitly allowed
    return false;
  };

  // Check if enough time has passed since last nudge
  const isCooldownExpired = (): boolean => {
    if (!nudgeState.lastShownTime) return true;
    return Date.now() - nudgeState.lastShownTime > NUDGE_COOLDOWN_MS;
  };

  // Main effect to determine when to show nudge - SMART & CONTEXTUAL
  useEffect(() => {
    // Don't show if user dismissed forever or not logged in
    if (!userId || nudgeState.dismissedForever) return;

    const nextMilestone = getNextMilestone();
    const isRelevantRoute = shouldShowNudgeForRoute(nextMilestone);
    const cooldownExpired = isCooldownExpired();

    // INTELLIGENT NUDGE DECISION:
    // ✅ Show nudge ONLY if ALL conditions are met:
    // 1. User is on a page where this nudge makes sense (not interrupting their work)
    // 2. Enough time has passed since last nudge (5 min cooldown)
    // 3. User hasn't completed all milestones yet
    // 4. This specific milestone is allowed on current page

    if (
      isRelevantRoute &&
      cooldownExpired &&
      completedMilestones.length < 10
    ) {
      // Delay showing nudge to not interrupt page load
      // User should see the page content first, then get gentle guidance
      const timer = setTimeout(() => {
        setNudgeState(prev => ({
          ...prev,
          shouldShow: true,
          currentMilestone: nextMilestone,
          completedMilestones,
          lastShownTime: Date.now(),
        }));
      }, NUDGE_DELAY_MS);

      return () => clearTimeout(timer);
    } else {
      // Don't show nudge - conditions not met
      // This prevents annoying popups while user is working
      setNudgeState(prev => ({
        ...prev,
        shouldShow: false,
      }));
    }
  }, [location.pathname, completedMilestones, userId]);

  // Functions to control nudge display
  const closeNudge = () => {
    saveNudgeState({ shouldShow: false, lastShownTime: Date.now() });
  };

  const dismissForever = () => {
    saveNudgeState({
      shouldShow: false,
      dismissedForever: true,
      lastShownTime: Date.now(),
    });
  };

  const showNudgeNow = () => {
    const nextMilestone = getNextMilestone();
    saveNudgeState({
      shouldShow: true,
      currentMilestone: nextMilestone,
      completedMilestones,
      lastShownTime: Date.now(),
    });
  };

  const resetNudges = () => {
    saveNudgeState({
      shouldShow: false,
      dismissedForever: false,
      lastShownTime: null,
    });
  };

  return {
    shouldShow: nudgeState.shouldShow,
    currentMilestone: nudgeState.currentMilestone,
    completedMilestones: nudgeState.completedMilestones,
    closeNudge,
    dismissForever,
    showNudgeNow,
    resetNudges,
    progress: (completedMilestones.length / 10) * 100,
    nextMilestone: getNextMilestone(),
  };
};
