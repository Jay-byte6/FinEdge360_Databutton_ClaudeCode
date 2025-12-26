import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JourneyMapSimple } from '@/components/journey/JourneyMapSimple';
import { UserJourneyState, MilestoneData } from '@/components/journey/types';
import { MILESTONES } from '@/components/journey/milestoneData';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import { API_ENDPOINTS } from '@/config/api';

export default function JourneyMap() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { financialData, fetchFinancialData } = useFinancialDataStore();
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
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Calculate journey state based on actual user data
  useEffect(() => {
    const calculateJourneyState = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch financial data if not already loaded
        if (!financialData) {
          await fetchFinancialData(user.id);
        }

        const completedMilestones: number[] = [];
        const milestoneProgress: Record<number, number> = {};

        // Milestone 1: Know Your Reality (Financial Details + Net Worth)
        if (financialData) {
          completedMilestones.push(1);
          milestoneProgress[1] = 100;
        } else {
          milestoneProgress[1] = 0;
        }

        // Milestone 2: Discover Your FIRE Number
        if (financialData) {
          // If they have financial data, they can calculate FIRE
          completedMilestones.push(2);
          milestoneProgress[2] = 100;
        } else {
          milestoneProgress[2] = 0;
        }

        // Milestone 3: Master Tax Planning
        if (financialData) {
          // Tax planning is available if they have data
          completedMilestones.push(3);
          milestoneProgress[3] = 100;
        } else {
          milestoneProgress[3] = 0;
        }

        // Milestone 4: Financial Health Check (Portfolio uploaded)
        try {
          const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(user.id));
          if (portfolioRes.ok) {
            const portfolioData = await portfolioRes.json();
            if (portfolioData.holdings && portfolioData.holdings.length > 0) {
              completedMilestones.push(4);
              milestoneProgress[4] = 100;
            } else {
              milestoneProgress[4] = 0;
            }
          } else {
            milestoneProgress[4] = 0;
          }
        } catch (err) {
          milestoneProgress[4] = 0;
        }

        // Milestone 5: Design Your Portfolio (Asset allocation)
        try {
          const allocRes = await fetch(API_ENDPOINTS.getAssetAllocation(user.id));
          if (allocRes.ok) {
            const allocData = await allocRes.json();
            if (allocData.allocations && allocData.allocations.length > 0) {
              completedMilestones.push(5);
              milestoneProgress[5] = 100;
            } else {
              milestoneProgress[5] = 0;
            }
          } else {
            milestoneProgress[5] = 0;
          }
        } catch (err) {
          milestoneProgress[5] = 0;
        }

        // Milestone 6: Set Financial Goals
        try {
          const sipRes = await fetch(API_ENDPOINTS.getSIPPlanner(user.id));
          if (sipRes.ok) {
            const sipData = await sipRes.json();
            if (sipData.goals && sipData.goals.length > 0) {
              completedMilestones.push(6);
              milestoneProgress[6] = 100;
            } else {
              milestoneProgress[6] = 0;
            }

            // Milestone 7: Build Your Financial Plan (Goals with asset allocation)
            const hasAssetAllocation = sipData.goals?.some((g: any) => g.assetAllocation);
            if (hasAssetAllocation) {
              completedMilestones.push(7);
              milestoneProgress[7] = 100;
            } else {
              milestoneProgress[7] = sipData.goals?.length > 0 ? 50 : 0;
            }

          } else {
            milestoneProgress[6] = 0;
            milestoneProgress[7] = 0;
          }
        } catch (err) {
          milestoneProgress[6] = 0;
          milestoneProgress[7] = 0;
        }

        // Milestone 8: Book Expert Consultation
        // For now, always pending unless explicitly marked
        // TODO: Add consultation booking API check
        milestoneProgress[8] = 0;

        // Milestone 9: Automate Success (SIP setup)
        try {
          const sipRes = await fetch(API_ENDPOINTS.getSIPPlanner(user.id));
          if (sipRes.ok) {
            const sipData = await sipRes.json();
            const hasSIP = sipData.goals?.some((g: any) => g.sipRequired && g.sipRequired > 0);
            if (hasSIP) {
              completedMilestones.push(9);
              milestoneProgress[9] = 100;
            } else {
              milestoneProgress[9] = 0;
            }
          } else {
            milestoneProgress[9] = 0;
          }
        } catch (err) {
          milestoneProgress[9] = 0;
        }

        // Milestone 10: Portfolio Monitoring (Has portfolio and checking regularly)
        // For now, mark as in-progress if they have portfolio
        try {
          const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(user.id));
          if (portfolioRes.ok) {
            const portfolioData = await portfolioRes.json();
            if (portfolioData.holdings && portfolioData.holdings.length > 0) {
              milestoneProgress[10] = 50; // In progress
            } else {
              milestoneProgress[10] = 0;
            }
          } else {
            milestoneProgress[10] = 0;
          }
        } catch (err) {
          milestoneProgress[10] = 0;
        }

        // Milestone 11: FINANCIAL FREEDOM (All goals achieved)
        // This will rarely be completed, but we can track progress
        milestoneProgress[11] = 0;

        // Determine current milestone (first incomplete one)
        let currentMilestone = 1;
        for (let i = 1; i <= 11; i++) {
          if (!completedMilestones.includes(i)) {
            currentMilestone = i;
            break;
          }
        }
        if (completedMilestones.length === 11) {
          currentMilestone = 11;
        }

        // Calculate overall progress
        const totalProgress = Object.values(milestoneProgress).reduce((sum, p) => sum + p, 0);
        const financialFreedomProgress = Math.round(totalProgress / 11);

        // Calculate XP and level
        const totalXP = completedMilestones.length * 100;
        const level = Math.floor(totalXP / 500) + 1;

        setJourneyState({
          currentMilestone,
          completedMilestones,
          milestoneProgress,
          totalXP,
          level,
          achievements: [],
          streaks: [],
          financialFreedomProgress,
        });
      } catch (error) {
        console.error('[JourneyMap] Error calculating journey state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateJourneyState();
  }, [user?.id, financialData, fetchFinancialData]);

  const handleMilestoneClick = (milestone: MilestoneData) => {
    // Navigate to the first action's link if available
    if (milestone.actions && milestone.actions.length > 0 && milestone.actions[0].link) {
      navigate(milestone.actions[0].link);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your journey map...</p>
        </div>
      </div>
    );
  }

  return (
    <JourneyMapSimple
      journeyState={journeyState}
      onMilestoneClick={handleMilestoneClick}
    />
  );
}
