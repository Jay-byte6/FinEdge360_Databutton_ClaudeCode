/**
 * Financial Freedom Journey - Main Container Component
 *
 * This component calculates the user's journey state from their actual financial data
 * and renders the complete journey map experience
 */

import React, { useEffect, useState } from 'react';
import { GoogleMapsJourney } from './GoogleMapsJourney';
import { MilestoneModal } from './MilestoneModal';
import { UserJourneyState, CompletionChecker, MilestoneData } from './types';
import useAuthStore from '@/utils/authStore';

export const FinancialFreedomJourney: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const [journeyState, setJourneyState] = useState<UserJourneyState>({
    currentMilestone: 1,
    completedMilestones: [],
    milestoneProgress: {},
    totalXP: 0,
    level: 1,
    achievements: [],
    streaks: [],
    financialFreedomProgress: 0,
  });

  useEffect(() => {
    if (user) {
      calculateJourneyState();
    }
  }, [user]);

  const calculateJourneyState = async () => {
    if (!user?.id) return;

    try {
      // Fetch user's financial data with retry logic (Supabase can have intermittent connection issues)
      let data = null;
      let retries = 3;

      while (retries > 0 && !data) {
        try {
          const response = await fetch(`/routes/get-financial-data/${user.id}`);
          if (response.ok) {
            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
              break;
            } else {
              console.error('Expected JSON but got:', contentType);
              const text = await response.text();
              console.error('Response text:', text.substring(0, 200));
              break; // Don't retry if content-type is wrong
            }
          } else if (response.status === 500 && retries > 1) {
            // Retry on 500 errors (server disconnected)
            console.log(`Retrying financial data fetch... (${retries - 1} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            retries--;
          } else {
            // Other errors, don't retry
            break;
          }
        } catch (error) {
          console.error('Error fetching financial data:', error);
          if (retries > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            break;
          }
        }
      }

      // Fetch SIP planner data to check for actual SIP calculations
      let sipData = null;
      try {
        const sipResponse = await fetch(`/routes/get-sip-planner/${user.id}`);
        if (sipResponse.ok) {
          sipData = await sipResponse.json();
        }
      } catch (error) {
        console.log('No SIP planner data found');
      }

      // Fetch milestone completion data (user-confirmed completions)
      let milestoneCompletions: Record<number, boolean> = {};
      try {
        const milestoneResponse = await fetch(`/routes/get-milestone-progress/${user.id}`);
        if (milestoneResponse.ok) {
          const milestoneData = await milestoneResponse.json();
          console.log('[Journey Map] Milestone progress data received:', milestoneData);

          // The API returns {user_id: string, milestones: array}
          const milestonesArray = milestoneData.milestones || milestoneData;

          // Convert array to object for easy lookup
          if (Array.isArray(milestonesArray)) {
            milestonesArray.forEach((item: any) => {
              if (item.completed) {
                milestoneCompletions[item.milestone_number] = true;
              }
            });
          }
        }
      } catch (error) {
        console.log('No milestone progress data found:', error);
      }

      // DEBUG: Log the data received from API
      console.log('[Journey Map] Financial data received:', {
        hasAssets: !!data?.assets,
        hasLiabilities: !!data?.liabilities,
        hasTaxPlan: !!data?.taxPlan,
        taxPlanData: data?.taxPlan,
        userConfirmedMilestones: milestoneCompletions,
        fullData: data
      });

      // Check which milestones are completed
      // Defensive: ensure data exists before checking properties
      const safeData = data || {};
      const safeSipData = sipData || {};

      // Defensive: Add extra safety checks to prevent crashes from malformed data
      const completionChecker: CompletionChecker = {
        hasFinancialData: !!(safeData?.assets || safeData?.liabilities),
        hasNetWorth: !!(safeData?.assets && safeData?.liabilities),
        hasFIRECalculation: !!(safeData?.fireNumber || safeData?.retirementAge || safeData?.riskAppetite?.retirementAge),
        hasTaxPlanning: !!(safeData?.taxPlan || safeData?.tax_plan),  // Check both formats
        hasRiskAssessment: false, // We'll check this separately
        hasPortfolioDesign: !!(safeData?.assets?.liquid || safeData?.assets?.illiquid),
        hasGoals: !!(
          safeData?.goals?.shortTermGoals?.length ||
          safeData?.goals?.midTermGoals?.length ||
          safeData?.goals?.longTermGoals?.length ||
          safeData?.goals?.shortTerm?.length ||
          safeData?.goals?.midTerm?.length ||
          safeData?.goals?.longTerm?.length
        ),
        // Milestone 7 now requires ACTUAL SIP calculations (not just goals)
        hasFinancialPlan: !!(
          (safeSipData?.totalMonthlySIP || safeSipData?.sipCalculations) &&
          safeData?.goals
        ),
        hasAutomatedSIP: false, // Future feature
        hasActiveMonitoring: false, // Future feature
        hasAchievedFreedom: false, // Calculated based on income vs expenses
      };

      console.log('[Journey Map] Completion checker:', completionChecker);

      // Check risk assessment separately with retry logic
      let riskRetries = 3;
      while (riskRetries > 0) {
        try {
          const riskResponse = await fetch(`/routes/get-risk-assessment/${user.id}`);
          if (riskResponse.ok) {
            const riskData = await riskResponse.json();
            completionChecker.hasRiskAssessment = !!(riskData?.riskType || riskData?.riskScore);
            break;
          } else if (riskResponse.status === 500 && riskRetries > 1) {
            console.log(`Retrying risk assessment fetch... (${riskRetries - 1} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            riskRetries--;
          } else {
            // 404 or other non-retryable errors
            console.log('No risk assessment found');
            break;
          }
        } catch (error) {
          console.log('Error fetching risk assessment:', error);
          if (riskRetries > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            riskRetries--;
          } else {
            console.log('No risk assessment found after retries');
            break;
          }
        }
      }

      // Calculate completed milestones with SEQUENTIAL LOGIC (prevents gaps)
      const completed: number[] = [];
      const milestoneProgress: Record<number, number> = {};

      // Define milestone completion conditions
      const milestoneConditions = [
        { id: 1, check: () => completionChecker.hasNetWorth, partial: () => completionChecker.hasFinancialData ? 50 : 0 },
        { id: 2, check: () => completionChecker.hasFIRECalculation, partial: () => 0 },
        { id: 3, check: () => completionChecker.hasTaxPlanning, partial: () => 0 },
        { id: 4, check: () => completionChecker.hasRiskAssessment, partial: () => 0 },
        { id: 5, check: () => completionChecker.hasRiskAssessment && completionChecker.hasPortfolioDesign, partial: () => completionChecker.hasPortfolioDesign ? 50 : 0 },
        { id: 6, check: () => completionChecker.hasGoals, partial: () => 0 },
        { id: 7, check: () => completionChecker.hasFinancialPlan, partial: () => completionChecker.hasGoals ? 50 : 0 },
        { id: 8, check: () => completionChecker.hasAutomatedSIP, partial: () => 0 },
        { id: 9, check: () => completionChecker.hasActiveMonitoring, partial: () => 0 },
        { id: 10, check: () => completionChecker.hasAchievedFreedom, partial: () => 0 },
      ];

      // Process milestones SEQUENTIALLY - a milestone can only be completed if all previous milestones are completed
      for (let i = 0; i < milestoneConditions.length; i++) {
        const milestone = milestoneConditions[i];

        // Check if all previous milestones are completed
        const allPreviousCompleted = i === 0 || completed.length === i;

        // Check if user manually marked this milestone as complete OR data shows it's complete
        const isDataComplete = milestone.check();
        const isUserConfirmed = milestoneCompletions[milestone.id] === true;
        const isMilestoneComplete = isDataComplete || isUserConfirmed;

        if (allPreviousCompleted && isMilestoneComplete) {
          // Current milestone is completed (either by data or user confirmation) AND all previous milestones are completed
          completed.push(milestone.id);
          milestoneProgress[milestone.id] = 100;
        } else if (allPreviousCompleted) {
          // Current milestone is NOT completed but all previous ones are - show partial progress if available
          milestoneProgress[milestone.id] = milestone.partial();
        } else {
          // Previous milestones not completed - lock this milestone at 0%
          milestoneProgress[milestone.id] = 0;
        }
      }

      // Determine current milestone (first incomplete one)
      let currentMilestone = 1;
      for (let i = 1; i <= 10; i++) {
        if (!completed.includes(i)) {
          currentMilestone = i;
          break;
        }
      }
      if (completed.length === 10) currentMilestone = 10;

      // Calculate total XP (100 XP per completed milestone + bonus)
      const totalXP = completed.reduce((sum, milestoneId) => {
        const baseXP = [0, 100, 150, 200, 150, 250, 200, 300, 250, 200, 1000]; // XP per milestone
        return sum + (baseXP[milestoneId] || 0);
      }, 0);

      // Calculate overall progress
      const financialFreedomProgress = Math.round((completed.length / 10) * 100);

      // Add sample streaks (you can calculate real ones from user activity)
      const streaks = [];
      if (completionChecker.hasFinancialData) {
        streaks.push({
          type: 'tracking' as const,
          days: 7,
          icon: '📊',
          title: '7-day Tracking Streak',
        });
      }

      setJourneyState({
        currentMilestone,
        completedMilestones: completed,
        milestoneProgress,
        totalXP,
        level: Math.floor(Math.sqrt(totalXP / 100)) + 1,
        achievements: [],
        streaks,
        financialFreedomProgress,
      });
    } catch (error) {
      console.error('Error calculating journey state:', error);
      // Set default state on error
      setJourneyState({
        currentMilestone: 1,
        completedMilestones: [],
        milestoneProgress: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0,
          9: 0,
          10: 0,
        },
        totalXP: 0,
        level: 1,
        achievements: [],
        streaks: [],
        financialFreedomProgress: 0,
      });
    }
  };

  return (
    <>
      <GoogleMapsJourney
        journeyState={journeyState}
        onMilestoneClick={setSelectedMilestone}
      />
      <MilestoneModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
      />
    </>
  );
};
