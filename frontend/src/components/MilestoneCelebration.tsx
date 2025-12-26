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
import { Trophy, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
}

const MILESTONE_MESSAGES = {
  1: {
    congrats: "🎉 Awesome! You've tracked your net worth!",
    message: "You now have a clear picture of your financial starting point. This is the foundation of your journey!",
    nextStep: "Next: Set your financial goals to create your roadmap"
  },
  2: {
    congrats: "🎯 Goals set! You're building your financial roadmap!",
    message: "With clear goals, you now have a destination. Every SIP brings you closer to your dreams!",
    nextStep: "Next: Calculate your FIRE number to know your target"
  },
  3: {
    congrats: "🔢 FIRE number calculated! You know your target!",
    message: "You now know exactly how much you need for financial freedom. Knowledge is power!",
    nextStep: "Next: Create your SIP strategy to reach your goals"
  },
  4: {
    congrats: "💰 SIP Plan created! You're on autopilot to wealth!",
    message: "With a systematic plan in place, you're building wealth automatically every month!",
    nextStep: "Next: Assess your risk profile for optimal returns"
  },
  5: {
    congrats: "🛡️ Risk profile complete! You know your investor type!",
    message: "Understanding your risk tolerance helps you invest confidently and sleep peacefully!",
    nextStep: "Next: Optimize your portfolio for maximum returns"
  },
  6: {
    congrats: "📈 Portfolio optimized! You're investing smarter!",
    message: "With personalized recommendations, you're on track for better returns with managed risk!",
    nextStep: "Next: Master tax optimization to keep more money"
  },
  7: {
    congrats: "📋 Tax master! You're saving lakhs legally!",
    message: "Smart tax planning means more money stays in your pocket to grow your wealth!",
    nextStep: "Next: Book expert consultation for personalized guidance"
  },
  8: {
    congrats: "🎓 Expert consultation booked! Professional help is here!",
    message: "Get personalized advice from certified financial experts tailored to your unique situation!",
    nextStep: "Next: Automate your success tracking"
  },
  9: {
    congrats: "🚀 Success criteria automated! You're unstoppable!",
    message: "Your financial goals are now tracked automatically. Set it and forget it!",
    nextStep: "Final Step: Claim your FREE Premium access!"
  },
  10: {
    congrats: "🏆 CONGRATULATIONS! Journey Complete!",
    message: "You've mastered your financial future! Welcome to the exclusive club of financially empowered individuals!",
    nextStep: "Enjoy your lifetime Premium access - worth ₹9,999!"
  }
};

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestoneNumber,
  milestoneTitle,
  onContinue,
  nextMilestoneRoute,
  totalCompleted
}) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

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
    if (nextMilestoneRoute) {
      navigate(nextMilestoneRoute);
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
        <DialogContent className="sm:max-w-[500px]">
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

            <DialogTitle className="text-2xl font-bold text-center">
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
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 text-center">
                {message.message}
              </p>
            </div>

            {/* Next Step */}
            {milestoneNumber < 10 && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900">
                      What's Next?
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
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

          <DialogFooter className="mt-6">
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-6"
            >
              {milestoneNumber < 10 ? (
                <>
                  Continue to Next Milestone
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Go to Dashboard
                  <Sparkles className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
