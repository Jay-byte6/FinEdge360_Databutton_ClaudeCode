import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Users, AlertCircle } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import SpotsMeter from './SpotsMeter';

interface ExitIntentModalProps {
  promoCode?: string;
  promoName?: string;
  totalSlots?: number;
  usedSlots?: number;
  endDate?: Date | string;
  onClose?: () => void;
  onClaim?: () => void;
  showOnce?: boolean;
  enabled?: boolean;
}

const ExitIntentModal: React.FC<ExitIntentModalProps> = ({
  promoCode = 'FOUNDER50',
  promoName = "Founder's Circle",
  totalSlots = 50,
  usedSlots = 37,
  endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  onClose,
  onClaim,
  showOnce = true,
  enabled = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if modal has been shown before (in session storage)
    if (showOnce && sessionStorage.getItem('exitIntentShown') === 'true') {
      setHasShown(true);
      return;
    }

    let exitIntentTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves from top of viewport (indicating user is going to close tab/navigate away)
      if (e.clientY <= 0 && !exitIntentTriggered && !hasShown) {
        exitIntentTriggered = true;
        setIsVisible(true);
        setHasShown(true);
        if (showOnce) {
          sessionStorage.setItem('exitIntentShown', 'true');
        }
      }
    };

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, showOnce, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
    }
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Sparkles Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-8 py-4 rounded-t-2xl">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="text-lg font-bold">WAIT! Don't Miss This!</span>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Headline */}
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Last Chance to Join {promoName}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            This exclusive offer won't be available again
          </p>

          {/* Alert Box */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                  Limited Availability
                </div>
                <div className="text-sm text-orange-800 dark:text-orange-300">
                  Only {totalSlots - usedSlots} spots remaining out of {totalSlots}. This
                  offer will never be repeated once all slots are filled.
                </div>
              </div>
            </div>
          </div>

          {/* Countdown & Spots */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800 dark:text-white">
                  Time Left
                </span>
              </div>
              <CountdownTimer targetDate={endDate} size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-800 dark:text-white">
                  Spots Remaining
                </span>
              </div>
              <SpotsMeter
                totalSlots={totalSlots}
                usedSlots={usedSlots}
                promoCode={promoCode}
                size="sm"
                showPercentage={true}
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
              What You'll Get:
            </h3>
            <ul className="space-y-3">
              {[
                'Lifetime Premium Access (₹11,988 value)',
                'Free 45-Min Expert Consultation',
                'Exclusive Founder Badge',
                'Priority Support 24/7',
                'Early Access to New Features',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClaim}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Claim Your Spot Now
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-lg transition-all duration-200"
            >
              I'll Miss Out
            </button>
          </div>

          {/* Trust Badge */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400">✓</span>
              {usedSlots} users have already joined
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ExitIntentModal;
