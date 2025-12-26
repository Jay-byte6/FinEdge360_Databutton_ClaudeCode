/**
 * PrelaunchOfferBanner - Marketing banner for free premium prelaunch offer
 * Sticky banner that promotes the limited-time free premium offer
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrelaunchOfferBannerProps {
  completedMilestones: number;
  totalMilestones?: number;
  onDismiss?: () => void;
}

export const PrelaunchOfferBanner: React.FC<PrelaunchOfferBannerProps> = ({
  completedMilestones,
  totalMilestones = 10,
  onDismiss
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed the banner
  useEffect(() => {
    const dismissed = localStorage.getItem('prelaunch_offer_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('prelaunch_offer_dismissed', 'true');
    onDismiss?.();
  };

  const handleClaimOffer = () => {
    if (completedMilestones >= totalMilestones) {
      navigate('/premium-upgrade');
    } else {
      // Show what's remaining
      navigate('/journey');
    }
  };

  if (!isVisible || isDismissed) return null;

  const progress = (completedMilestones / totalMilestones) * 100;
  const remainingMilestones = totalMilestones - completedMilestones;

  return (
    <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-lg animate-slide-down">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Offer Message */}
          <div className="flex items-center gap-3 flex-1">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-white/20 rounded-full animate-pulse">
              <Gift className="h-6 w-6 text-white" />
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <Sparkles className="h-4 w-4" />
                <p className="font-bold text-lg">Limited Time Prelaunch Offer!</p>
              </div>
              <p className="text-sm text-green-100">
                Complete all {totalMilestones} milestones & unlock{' '}
                <span className="font-bold text-white">₹9,999 Premium Plan</span> -{' '}
                <span className="font-bold text-yellow-300">100% FREE!</span>
                {' '}Only for early adopters.
              </p>
            </div>
          </div>

          {/* Middle: Progress */}
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
              <p className="text-xs text-green-100">Completed</p>
            </div>

            {remainingMilestones > 0 && (
              <>
                <div className="h-8 w-px bg-white/30"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-300">{remainingMilestones}</p>
                  <p className="text-xs text-green-100">To Go!</p>
                </div>
              </>
            )}
          </div>

          {/* Right: CTA Button */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClaimOffer}
              className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg"
              size="sm"
            >
              {completedMilestones >= totalMilestones ? (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Claim Free Premium
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Continue Journey
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {remainingMilestones > 0 && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-white transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-green-100 mt-1">
              {progress.toFixed(0)}% Complete • Limited spots remaining!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
