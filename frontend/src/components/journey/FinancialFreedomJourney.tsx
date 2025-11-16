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
            data = await response.json();
            break;
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

      // Check which milestones are completed
      const completionChecker: CompletionChecker = {
        hasFinancialData: !!(data?.assets || data?.liabilities),
        hasNetWorth: !!(data?.assets && data?.liabilities),
        hasFIRECalculation: !!(data?.fireNumber || data?.retirementAge),
        hasTaxPlanning: !!(data?.taxPlan || data?.incomeTax),
        hasRiskAssessment: false, // We'll check this separately
        hasPortfolioDesign: !!(data?.assets?.liquid || data?.assets?.illiquid),
        hasGoals: !!(data?.goals?.shortTermGoals?.length || data?.goals?.midTermGoals?.length || data?.goals?.longTermGoals?.length),
        hasFinancialPlan: !!(data?.goals && data?.sipCalculations),
        hasAutomatedSIP: false, // Future feature
        hasActiveMonitoring: false, // Future feature
        hasAchievedFreedom: false, // Calculated based on income vs expenses
      };

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

      // Calculate completed milestones
      const completed: number[] = [];
      const milestoneProgress: Record<number, number> = {};

      // Milestone 1: Know Your Reality (Net Worth)
      if (completionChecker.hasNetWorth) {
        completed.push(1);
        milestoneProgress[1] = 100;
      } else if (completionChecker.hasFinancialData) {
        milestoneProgress[1] = 50;
      } else {
        milestoneProgress[1] = 0;
      }

      // Milestone 2: FIRE Number
      if (completionChecker.hasFIRECalculation) {
        completed.push(2);
        milestoneProgress[2] = 100;
      } else {
        milestoneProgress[2] = 0;
      }

      // Milestone 3: Tax Planning
      if (completionChecker.hasTaxPlanning) {
        completed.push(3);
        milestoneProgress[3] = 100;
      } else {
        milestoneProgress[3] = 0;
      }

      // Milestone 4: Financial Health Check (Risk Assessment)
      if (completionChecker.hasRiskAssessment) {
        completed.push(4);
        milestoneProgress[4] = 100;
      } else {
        milestoneProgress[4] = 0;
      }

      // Milestone 5: Portfolio Design
      if (completionChecker.hasRiskAssessment && completionChecker.hasPortfolioDesign) {
        completed.push(5);
        milestoneProgress[5] = 100;
      } else if (completionChecker.hasPortfolioDesign) {
        milestoneProgress[5] = 50;
      } else {
        milestoneProgress[5] = 0;
      }

      // Milestone 6: Set Goals
      if (completionChecker.hasGoals) {
        completed.push(6);
        milestoneProgress[6] = 100;
      } else {
        milestoneProgress[6] = 0;
      }

      // Milestone 7: Financial Plan
      if (completionChecker.hasFinancialPlan) {
        completed.push(7);
        milestoneProgress[7] = 100;
      } else if (completionChecker.hasGoals) {
        milestoneProgress[7] = 50;
      } else {
        milestoneProgress[7] = 0;
      }

      // Milestone 8: Automate (Future feature)
      milestoneProgress[8] = 0;

      // Milestone 9: Monitor (Future feature)
      milestoneProgress[9] = 0;

      // Milestone 10: Financial Freedom
      milestoneProgress[10] = 0;

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
