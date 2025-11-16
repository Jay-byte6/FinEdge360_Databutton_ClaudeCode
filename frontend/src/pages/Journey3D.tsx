/**
 * 3D Journey Page
 * Full 3D Google Maps-style financial journey experience
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/utils/authStore';
import { JourneyMapSimple } from '@/components/journey/JourneyMapSimple';
import { MilestoneModal } from '@/components/journey/MilestoneModal';
import { UserJourneyState, CompletionChecker, MilestoneData } from '@/components/journey/types';

export default function Journey3D() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
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
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      calculateJourneyState();
    }
  }, [user]);

  const calculateJourneyState = async () => {
    if (!user?.id) return;

    try {
      // Fetch user's financial data
      console.log('Fetching financial data for user:', user.id);
      const response = await fetch(`/routes/get-financial-data/${user.id}`);
      console.log('Financial data response status:', response.status, response.ok);

      let data = null;
      if (response.ok) {
        data = await response.json();
        console.log('Financial data received:', data);
      } else {
        console.error('Failed to fetch financial data:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }

      // Fetch SIP planner data
      let sipData = null;
      try {
        console.log('Fetching SIP data for user:', user.id);
        const sipResponse = await fetch(`/routes/get-sip-planner/${user.id}`);
        console.log('SIP data response status:', sipResponse.status, sipResponse.ok);

        if (sipResponse.ok) {
          sipData = await sipResponse.json();
          console.log('SIP data received:', sipData);
        } else {
          console.log('No SIP data found - response not ok');
        }
      } catch (error) {
        console.log('Error fetching SIP data:', error);
      }

      // Check completion status - matching actual API response structure
      const completionChecker: CompletionChecker = {
        // Milestone 1: Has entered financial data (assets/liabilities)
        hasFinancialData: !!(
          data?.assetsLiabilities ||
          data?.assets ||
          data?.liabilities ||
          data?.personalInfo
        ),
        // Net worth - has both assets AND liabilities
        hasNetWorth: !!(data?.assets && data?.liabilities),
        // Milestone 2: FIRE calculation (retirement age from risk appetite)
        hasFIRECalculation: !!(data?.riskAppetite?.retirementAge),
        // Milestone 3: Tax planning - check if we have tax data saved
        // For now, we'll assume tax planning is done if user completed previous milestones
        // This can be enhanced when tax planning endpoint is created
        hasTaxPlanning: false, // TODO: Add proper tax planning endpoint check
        // Milestone 4: Risk assessment
        hasRiskAssessment: false,
        // Milestone 5: Portfolio design (has asset allocation)
        hasPortfolioDesign: !!(data?.assets?.liquid || data?.assets?.illiquid),
        // Milestone 6: Has set goals (from SIP planner)
        hasGoals: !!(
          sipData?.goals?.shortTerm?.length ||
          sipData?.goals?.midTerm?.length ||
          sipData?.goals?.longTerm?.length ||
          data?.goals?.shortTermGoals?.length ||
          data?.goals?.midTermGoals?.length ||
          data?.goals?.longTermGoals?.length
        ),
        // Milestone 7: Financial plan with SIP calculations
        hasFinancialPlan: !!(sipData?.sipCalculations),
        // Future milestones
        hasAutomatedSIP: false,
        hasActiveMonitoring: false,
        hasAchievedFreedom: false,
      };

      // Check risk assessment
      try {
        const riskResponse = await fetch(`/routes/get-risk-assessment/${user.id}`);
        if (riskResponse.ok) {
          const riskData = await riskResponse.json();
          completionChecker.hasRiskAssessment = !!(
            riskData?.riskType ||
            riskData?.riskScore ||
            riskData?.risk_type ||
            riskData?.risk_score
          );
        }
      } catch (error) {
        console.log('No risk assessment found');
      }

      // TEMPORARY: Mark tax planning as complete if user has completed FIRE calculation
      // This is a workaround until proper tax planning endpoint is added
      if (completionChecker.hasFIRECalculation) {
        completionChecker.hasTaxPlanning = true;
      }

      // Debug logging
      console.log('=== Journey State Debug ===');
      console.log('Financial Data:', data);
      console.log('SIP Data:', sipData);
      console.log('Completion Checker:', completionChecker);
      console.log('========================');

      // Calculate completed milestones
      const completed: number[] = [];
      const milestoneProgress: Record<number, number> = {};

      // Milestone 1: Know Your Reality - Enter all financial details
      // User needs to have entered financial data (assets OR liabilities)
      if (completionChecker.hasFinancialData) {
        completed.push(1);
        milestoneProgress[1] = 100;
      } else {
        milestoneProgress[1] = 0;
      }

      // Milestone 2: Discover Your FIRE Number
      if (completionChecker.hasFIRECalculation) {
        completed.push(2);
        milestoneProgress[2] = 100;
      } else {
        milestoneProgress[2] = 0;
      }

      // Milestone 3: Master Tax Planning
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

      // Milestone 5: Design Your Portfolio
      if (completionChecker.hasPortfolioDesign && completionChecker.hasRiskAssessment) {
        completed.push(5);
        milestoneProgress[5] = 100;
      } else if (completionChecker.hasPortfolioDesign || completionChecker.hasRiskAssessment) {
        milestoneProgress[5] = 50;
      } else {
        milestoneProgress[5] = 0;
      }

      // Milestone 6: Set Financial Goals
      if (completionChecker.hasGoals) {
        completed.push(6);
        milestoneProgress[6] = 100;
      } else {
        milestoneProgress[6] = 0;
      }

      // Milestone 7: Build Your Financial Plan (Complete SIP Calculations)
      if (completionChecker.hasFinancialPlan) {
        completed.push(7);
        milestoneProgress[7] = 100;
      } else if (completionChecker.hasGoals) {
        milestoneProgress[7] = 50;
      } else {
        milestoneProgress[7] = 0;
      }

      // Milestone 8-10: Future features
      milestoneProgress[8] = 0;
      milestoneProgress[9] = 0;
      milestoneProgress[10] = 0;

      // Determine current milestone
      let currentMilestone = 1;
      for (let i = 1; i <= 10; i++) {
        if (!completed.includes(i)) {
          currentMilestone = i;
          break;
        }
      }
      if (completed.length === 10) currentMilestone = 10;

      // Calculate XP
      const totalXP = completed.reduce((sum, milestoneId) => {
        const baseXP = [0, 100, 150, 200, 150, 250, 200, 300, 250, 200, 1000];
        return sum + (baseXP[milestoneId] || 0);
      }, 0);

      // Overall progress
      const financialFreedomProgress = Math.round((completed.length / 10) * 100);

      setJourneyState({
        currentMilestone,
        completedMilestones: completed,
        milestoneProgress,
        totalXP,
        level: Math.floor(Math.sqrt(totalXP / 100)) + 1,
        achievements: [],
        streaks: [],
        financialFreedomProgress,
      });
    } catch (error) {
      console.error('Error calculating journey state:', error);
    }
  };

  return (
    <>
      <JourneyMapSimple
        journeyState={journeyState}
        onMilestoneClick={setSelectedMilestone}
      />
      <MilestoneModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
      />
    </>
  );
}
