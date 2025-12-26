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

// Route-to-milestone mapping - which milestones are relevant for each route
const ROUTE_MILESTONES: Record<string, number[]> = {
  '/': [1, 2], // Dashboard - nudge for entering details and setting goals
  '/enter-details': [1], // Nudge to complete entering details
  '/net-worth': [2], // After net worth, nudge for goals
  '/fire-planner': [2, 3, 4, 9], // Goals, FIRE calc, SIP plan, success criteria
  '/fire-calculator': [3, 4], // FIRE number, then SIP plan
  '/portfolio': [5, 6], // Risk assessment, portfolio optimization
  '/tax-planning': [7], // Tax optimization
  '/consultation': [8], // Expert consultation
  '/premium-upgrade': [10], // Premium upgrade
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
  useEffect(() => {
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

  // Check if we should show nudge on current route
  const shouldShowNudgeForRoute = (milestone: number): boolean => {
    const currentPath = location.pathname;

    // Find matching route
    for (const [route, milestones] of Object.entries(ROUTE_MILESTONES)) {
      if (currentPath.startsWith(route)) {
        return milestones.includes(milestone);
      }
    }

    // Default: show on dashboard
    return currentPath === '/';
  };

  // Check if enough time has passed since last nudge
  const isCooldownExpired = (): boolean => {
    if (!nudgeState.lastShownTime) return true;
    return Date.now() - nudgeState.lastShownTime > NUDGE_COOLDOWN_MS;
  };

  // Main effect to determine when to show nudge
  useEffect(() => {
    if (!userId || nudgeState.dismissedForever) return;

    const nextMilestone = getNextMilestone();
    const isRelevantRoute = shouldShowNudgeForRoute(nextMilestone);
    const cooldownExpired = isCooldownExpired();

    // Show nudge if:
    // 1. We're on a relevant route for this milestone
    // 2. Cooldown has expired
    // 3. There are incomplete milestones
    if (
      isRelevantRoute &&
      cooldownExpired &&
      completedMilestones.length < 10
    ) {
      // Delay showing nudge to not interrupt page load
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
