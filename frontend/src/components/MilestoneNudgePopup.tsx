/**
 * MilestoneNudgePopup - Contextual guidance popup that nudges users to complete milestones
 * Shows appropriate next actions based on current milestone progress
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  ArrowRight,
  X,
  Target,
  TrendingUp,
  Shield,
  PiggyBank,
  Calculator,
  FileText,
  Users,
  Rocket,
  Clock,
  Gift
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MilestoneNudgePopupProps {
  currentMilestone: number; // 1-10
  completedMilestones: number[]; // Array of completed milestone numbers
  onClose: () => void;
  onDismissForever?: () => void;
  showPrelaunchOffer?: boolean;
}

// Milestone configuration with icons and guidance
// IMPORTANT: Milestone 1 should be Expert Consultation - first immediate action
const MILESTONE_CONFIG = {
  1: {
    icon: Users,
    title: '🎓 Book Free Expert Consultation',
    description: 'Get personalized guidance to set up goals and align holdings properly',
    action: 'Book Your Free Expert Session',
    route: '/consultation',
    color: 'from-violet-500 to-purple-500',
    benefit: 'Professional advice tailored to your situation',
    timeEstimate: '30 minutes (call)'
  },
  2: {
    icon: TrendingUp,
    title: '📊 Enter Your Financial Details',
    description: 'Track your net worth to understand your financial starting point',
    action: 'Enter Your Financial Details',
    route: '/enter-details',
    color: 'from-blue-500 to-cyan-500',
    benefit: 'Know exactly where you stand financially',
    timeEstimate: '5-10 minutes'
  },
  3: {
    icon: Target,
    title: '🎯 Set Your Goals',
    description: 'Define your short, mid, and long-term financial objectives',
    action: 'Set Financial Goals',
    route: '/fire-planner?tab=set-goals',
    color: 'from-green-500 to-emerald-500',
    benefit: 'Clear roadmap for your financial future',
    timeEstimate: '10-15 minutes'
  },
  4: {
    icon: Calculator,
    title: '🔢 Calculate Your FIRE Number',
    description: 'Discover how much you need to achieve financial independence',
    action: 'Calculate FIRE Number',
    route: '/fire-calculator',
    color: 'from-orange-500 to-amber-500',
    benefit: 'Your personalized path to early retirement',
    timeEstimate: '5 minutes'
  },
  5: {
    icon: PiggyBank,
    title: '💰 Plan Your SIP Strategy',
    description: 'Create a systematic investment plan to reach your goals',
    action: 'Create SIP Plan',
    route: '/fire-planner?tab=sip-plan',
    color: 'from-purple-500 to-pink-500',
    benefit: 'Automated wealth building on autopilot',
    timeEstimate: '10 minutes'
  },
  6: {
    icon: Shield,
    title: '🛡️ Assess Your Risk Profile',
    description: 'Understand your investment risk tolerance and optimal portfolio mix',
    action: 'Complete Risk Assessment',
    route: '/portfolio',
    color: 'from-indigo-500 to-purple-500',
    benefit: 'Invest with confidence and peace of mind',
    timeEstimate: '5 minutes'
  },
  7: {
    icon: TrendingUp,
    title: '📈 Optimize Your Portfolio',
    description: 'Get personalized recommendations to maximize returns',
    action: 'Review Portfolio Recommendations',
    route: '/portfolio#portfolio-recommendations',
    color: 'from-teal-500 to-cyan-500',
    benefit: 'Better returns with lower risk',
    timeEstimate: '10 minutes'
  },
  8: {
    icon: FileText,
    title: '📋 Master Tax Optimization',
    description: 'Learn smart tax-saving strategies to keep more of your money',
    action: 'Explore Tax Strategies',
    route: '/tax-planning',
    color: 'from-rose-500 to-pink-500',
    benefit: 'Save lakhs in taxes legally',
    timeEstimate: '15 minutes'
  },
  9: {
    icon: Rocket,
    title: '🚀 Automate Success Criteria',
    description: 'Set up automated tracking for your financial goals',
    action: 'Setup Success Tracking',
    route: '/fire-planner?tab=sip-plan#success-criteria',
    color: 'from-amber-500 to-orange-500',
    benefit: 'Stay on track effortlessly',
    timeEstimate: '5 minutes'
  },
  10: {
    icon: CheckCircle2,
    title: '🎉 Unlock Premium Features',
    description: 'Get lifetime access to advanced tools and insights',
    action: 'Claim Your Free Premium',
    route: '/premium-upgrade',
    color: 'from-green-500 to-emerald-500',
    benefit: '₹9,999 value - FREE for prelaunch users!',
    timeEstimate: '2 minutes'
  }
};

export const MilestoneNudgePopup: React.FC<MilestoneNudgePopupProps> = ({
  currentMilestone,
  completedMilestones,
  onClose,
  onDismissForever,
  showPrelaunchOffer = true
}) => {
  const navigate = useNavigate();
  const [showOffer, setShowOffer] = useState(showPrelaunchOffer);

  // Get current milestone config
  const milestone = MILESTONE_CONFIG[currentMilestone as keyof typeof MILESTONE_CONFIG];
  const Icon = milestone?.icon || Target;

  // Calculate progress
  const totalMilestones = 10;
  const progress = (completedMilestones.length / totalMilestones) * 100;
  const nextMilestoneNumber = currentMilestone;

  const handleTakeAction = () => {
    if (milestone?.route) {
      navigate(milestone.route);
      onClose();
    }
  };

  const handleRemindLater = () => {
    onClose();
  };

  if (!milestone) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Your Journey Progress
              </p>
              <p className="text-sm font-bold text-blue-600">
                {completedMilestones.length}/{totalMilestones} Milestones
              </p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Prelaunch Offer Banner */}
          {showOffer && currentMilestone >= 8 && (
            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 animate-pulse">
              <div className="flex items-start gap-2">
                <Gift className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-900">
                    🎁 Limited Time Prelaunch Offer!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Get <span className="font-bold">₹9,999 Premium Plan FREE</span> for completing all milestones!
                    Offer ends soon - only for early adopters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Step Header */}
          <div className="mb-3">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
              Your Next Step (Milestone {nextMilestoneNumber}/10)
            </p>
          </div>

          {/* Action Focus - Make it prominent */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-full bg-gradient-to-br ${milestone.color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black text-gray-900">
                {milestone.action}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-base text-gray-700 font-medium mb-2">
            {milestone.description}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Section */}
        <div className="space-y-3 my-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Why This Matters</p>
                <p className="text-sm text-blue-700 mt-1">{milestone.benefit}</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Time Required</p>
                <p className="text-sm text-amber-700 mt-1">{milestone.timeEstimate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Message */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <p className="text-sm text-center text-purple-900 font-medium">
            {completedMilestones.length === 0 && "🌟 Every journey starts with a single step. Let's begin!"}
            {completedMilestones.length > 0 && completedMilestones.length < 5 && `💪 Great progress! You're ${completedMilestones.length}/10 done. Keep going!`}
            {completedMilestones.length >= 5 && completedMilestones.length < 8 && `🔥 You're on fire! ${totalMilestones - completedMilestones.length} milestones to go!`}
            {completedMilestones.length >= 8 && completedMilestones.length < 10 && `🎯 Almost there! Just ${totalMilestones - completedMilestones.length} more to unlock FREE Premium!`}
            {completedMilestones.length === 10 && "🎉 Congratulations! You've completed your financial journey!"}
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleRemindLater}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Remind Me Later
          </Button>
          {onDismissForever && (
            <Button
              variant="ghost"
              onClick={onDismissForever}
              className="w-full sm:w-auto text-xs text-gray-500 order-3 sm:order-2"
            >
              Don't Show Again
            </Button>
          )}
          <Button
            onClick={handleTakeAction}
            className={`w-full sm:w-auto bg-gradient-to-r ${milestone.color} hover:opacity-90 text-white font-bold text-base py-6 order-1 sm:order-3`}
          >
            {milestone.action} →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
