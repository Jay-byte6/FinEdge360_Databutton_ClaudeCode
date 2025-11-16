/**
 * Financial Freedom Journey - Type Definitions
 *
 * Complete type system for the gamified journey experience
 */

export type MilestoneStatus = 'locked' | 'in-progress' | 'completed';

export interface MilestoneAction {
  title: string;
  description: string;
  link?: string;
  completed: boolean;
}

export interface MilestoneData {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  status: MilestoneStatus;
  progress: number; // 0-100
  xpReward: number;

  // What the user gets
  benefits: string[];

  // Completion criteria
  completionCriteria: string[];

  // Actions to complete
  actions: MilestoneAction[];

  // Estimated time to complete
  estimatedTime: string;

  // Current status for user
  currentStatus?: string; // e.g., "Net Worth: ₹1.45 Cr"

  // Premium features available
  premiumFeatures?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Streak {
  type: 'tracking' | 'saving' | 'investing';
  days: number;
  icon: string;
  title: string;
}

export interface UserJourneyState {
  currentMilestone: number; // 1-10
  completedMilestones: number[];
  milestoneProgress: Record<number, number>; // milestone id -> progress %
  totalXP: number;
  level: number;
  achievements: Achievement[];
  streaks: Streak[];
  financialFreedomProgress: number; // Overall % to freedom (0-100)
}

export interface JourneyStats {
  netWorth: number;
  fireNumber: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  portfolioHealth: number;
  taxSavings: number;
}

// Milestone completion criteria checkers
export interface CompletionChecker {
  hasFinancialData: boolean;
  hasNetWorth: boolean;
  hasFIRECalculation: boolean;
  hasTaxPlanning: boolean;
  hasRiskAssessment: boolean;
  hasPortfolioDesign: boolean;
  hasGoals: boolean;
  hasFinancialPlan: boolean;
  hasAutomatedSIP: boolean;
  hasActiveMonitoring: boolean;
  hasAchievedFreedom: boolean;
}
