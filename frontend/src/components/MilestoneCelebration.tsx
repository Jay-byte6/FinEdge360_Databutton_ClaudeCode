/**
 * MilestoneCelebration - Celebration animation when user completes a milestone
 * Shows confetti and congratulations message
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import Confetti from 'react-confetti';

// Custom hook to get window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface MilestoneCelebrationProps {
  milestoneNumber: number;
  milestoneTitle: string;
  onContinue: () => void;
  nextMilestoneRoute?: string;
  totalCompleted: number;
  onDismissForever?: () => void; // NEW: Allow permanent dismissal
}

// Milestone to next route mapping - MUST match milestoneData.ts order!
const MILESTONE_NEXT_ROUTES: { [key: number]: string } = {
  1: '/fire-calculator', // After Know Your Reality → Discover FIRE Number
  2: '/tax-planning', // After FIRE Number → Master Tax Planning
  3: '/portfolio', // After Tax Planning → Financial Health Check (FREE tier complete)
  4: '/portfolio', // After Health Check → Design Your Portfolio
  5: '/fire-planner', // After Portfolio Design → Set Financial Goals
  6: '/fire-planner', // After Set Goals → Build Your Financial Plan
  7: '/consultation', // After Financial Plan → Book Expert Consultation
  8: '/fire-planner', // After Consultation → Automate Success
  9: '/portfolio', // After Automation → Portfolio Monitoring
  10: '/pricing' // Journey complete → Claim Premium
};

// MUST match the actual milestone journey from milestoneData.ts!
const MILESTONE_MESSAGES = {
  1: {
    congrats: "📊 Financial reality known!",
    message: "You have a clear picture of your starting point!",
    nextStep: "Next: Discover your FIRE number"
  },
  2: {
    congrats: "🔥 FIRE number calculated!",
    message: "You know exactly how much you need for financial freedom!",
    nextStep: "Next: Master tax planning"
  },
  3: {
    congrats: "💰 Tax master! Saving lakhs!",
    message: "Smart tax planning keeps more money working for you!",
    nextStep: "Next: Complete financial health check"
  },
  4: {
    congrats: "🏥 Financial health assessed!",
    message: "You understand your risk tolerance and financial fitness!",
    nextStep: "Next: Design your optimal portfolio"
  },
  5: {
    congrats: "📈 Portfolio optimized!",
    message: "You have the perfect asset allocation for your goals!",
    nextStep: "Next: Set your financial goals"
  },
  6: {
    congrats: "🎯 Goals set! Roadmap created!",
    message: "Clear short, medium, and long-term goals defined!",
    nextStep: "Next: Build your complete financial plan"
  },
  7: {
    congrats: "📋 Financial plan complete!",
    message: "Month-by-month roadmap to wealth creation ready!",
    nextStep: "Next: Get expert validation (FREE)"
  },
  8: {
    congrats: "👨‍💼 Expert consultation booked!",
    message: "Professional guidance secured for your journey!",
    nextStep: "Next: Automate your success"
  },
  9: {
    congrats: "⚙️ Success automated!",
    message: "Set it and achieve it - no emotional decisions!",
    nextStep: "Next: Start portfolio monitoring"
  },
  10: {
    congrats: "🏆 Journey Complete!",
    message: "You've mastered your path to financial freedom!",
    nextStep: "Enjoy lifetime Premium - worth ₹9,999!"
  }
};

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestoneNumber,
  milestoneTitle,
  onContinue,
  nextMilestoneRoute,
  totalCompleted,
  onDismissForever
}) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const message = MILESTONE_MESSAGES[milestoneNumber as keyof typeof MILESTONE_MESSAGES] || {
    congrats: `Milestone ${milestoneNumber} Complete!`,
    message: "Great job! You're making excellent progress!",
    nextStep: "Keep going to complete your journey!"
  };

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // If checkbox is checked, dismiss for this session
    if (dontShowAgain) {
      sessionStorage.setItem('celebration_popups_dismissed_this_session', 'true');
      console.log('[MilestoneCelebration] Dismissed for this session - will show again on next login');
    }

    onContinue(); // Close the modal first

    // Determine the correct route
    const routeToNavigate = nextMilestoneRoute || MILESTONE_NEXT_ROUTES[milestoneNumber] || '/dashboard';

    console.log(`[MilestoneCelebration] Navigating from milestone ${milestoneNumber} to: ${routeToNavigate}`);

    // Navigate after a small delay to ensure smooth modal close
    setTimeout(() => {
      navigate(routeToNavigate);
    }, 100);
  };

  const handleDismissForever = async () => {
    if (onDismissForever) {
      onDismissForever();
    }

    // Save preference to localStorage - using BOTH keys for redundancy
    try {
      localStorage.setItem('celebration_popups_dismissed', 'true');
      localStorage.setItem('milestone_nudges_dismissed', 'true');
      console.log('[MilestoneCelebration] Celebration popups and nudges permanently dismissed');
      console.log('[MilestoneCelebration] Saved to localStorage: celebration_popups_dismissed = true');
      console.log('[MilestoneCelebration] Saved to localStorage: milestone_nudges_dismissed = true');

      // Show visual confirmation to user
      console.log('[MilestoneCelebration] ✅ Dismissal saved successfully - you won\'t see these popups again');
    } catch (error) {
      console.error('[MilestoneCelebration] ❌ Error saving dismissal preference:', error);
    }

    onContinue();
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <Dialog open={true} onOpenChange={onContinue}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            {/* Trophy Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-bold text-center break-words px-2">
              {message.congrats}
            </DialogTitle>

            {/* Progress Badge */}
            <div className="flex justify-center my-4">
              <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-full px-4 py-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-900">
                  {totalCompleted}/10 Milestones Complete
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Message */}
          <div className="space-y-3 sm:space-y-4 px-2">
            <div className="p-3 sm:p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-900 text-center break-words">
                {message.message}
              </p>
            </div>

            {/* Next Step */}
            {milestoneNumber < 10 && (
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-purple-900">
                      What's Next?
                    </p>
                    <p className="text-xs sm:text-sm text-purple-700 mt-1 break-words">
                      {message.nextStep}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Unlock Message */}
            {milestoneNumber === 10 && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 animate-pulse">
                <p className="text-center text-green-900 font-bold text-lg">
                  🎁 You've unlocked ₹9,999 Premium Plan - FREE!
                </p>
                <p className="text-center text-green-700 text-sm mt-2">
                  Exclusive prelaunch offer for early adopters like you!
                </p>
              </div>
            )}
          </div>

          {/* Don't Show Again Checkbox - Positioned above button */}
          <div className="flex items-center gap-2 px-4 py-2 mb-2">
            <input
              type="checkbox"
              id="dontShowCelebrationAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="dontShowCelebrationAgain" className="text-sm text-gray-600 cursor-pointer select-none">
              Don't show this again
            </label>
          </div>

          <DialogFooter className="flex flex-col space-y-2 px-2">
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base md:text-lg py-4 sm:py-6"
            >
              <span className="truncate">
                {milestoneNumber < 10 ? 'Continue to Next' : 'Go to Dashboard'}
              </span>
              {milestoneNumber < 10 ? (
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 flex-shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 ml-2 flex-shrink-0" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
