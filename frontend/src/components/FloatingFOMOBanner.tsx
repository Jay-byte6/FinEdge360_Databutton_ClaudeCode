import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Users, ChevronRight } from 'lucide-react';

interface FloatingFOMOBannerProps {
  message?: string;
  promoCode?: string;
  position?: 'top' | 'bottom';
  slotsRemaining?: number;
  timeRemaining?: string;
  onCTAClick?: () => void;
  onClose?: () => void;
  ctaText?: string;
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
  showOnce?: boolean;
  delayShow?: number; // milliseconds
  className?: string;
}

const FloatingFOMOBanner: React.FC<FloatingFOMOBannerProps> = ({
  message = 'Limited Time: Join the Founder\'s Circle',
  promoCode,
  position = 'top',
  slotsRemaining,
  timeRemaining,
  onCTAClick,
  onClose,
  ctaText = 'Claim Now',
  autoDismiss = false,
  dismissAfter = 10000,
  showOnce = true,
  delayShow = 2000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed before
    if (showOnce && sessionStorage.getItem('fomoBannerDismissed') === 'true') {
      return;
    }

    // Delay showing the banner
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delayShow);

    // Auto-dismiss after specified time
    let dismissTimer: NodeJS.Timeout;
    if (autoDismiss) {
      dismissTimer = setTimeout(() => {
        handleClose();
      }, delayShow + dismissAfter);
    }

    return () => {
      clearTimeout(showTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [delayShow, autoDismiss, dismissAfter, showOnce]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (showOnce) {
        sessionStorage.setItem('fomoBannerDismissed', 'true');
      }
      if (onClose) {
        onClose();
      }
    }, 300); // Match animation duration
  };

  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    }
    handleClose();
  };

  if (!isVisible) return null;

  const positionClasses =
    position === 'top'
      ? 'top-0 animate-slideDown'
      : 'bottom-0 animate-slideUp';

  return (
    <div
      className={`fixed left-0 right-0 ${positionClasses} ${
        isClosing ? 'animate-slideOut' : ''
      } z-40 ${className}`}
    >
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Icon & Message */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Zap className="w-6 h-6 flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base truncate">
                  {message}
                </div>
                {promoCode && (
                  <div className="text-xs mt-0.5 opacity-90">
                    Use code:{' '}
                    <span className="font-mono font-bold">{promoCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              {slotsRemaining !== undefined && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{slotsRemaining} spots left</span>
                </div>
              )}
              {timeRemaining && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{timeRemaining}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCTAClick}
              className="flex items-center gap-2 bg-white text-purple-600 hover:bg-gray-100 font-bold px-4 sm:px-6 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
            >
              <span className="text-sm sm:text-base">{ctaText}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {autoDismiss && (
        <div className="w-full h-1 bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white animate-progress"
            style={{
              animation: `progress ${dismissAfter}ms linear`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: ${position === 'top' ? 'translateY(-100%)' : 'translateY(100%)'};
            opacity: 0;
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-slideOut {
          animation: slideOut 0.3s ease-out;
        }

        .animate-progress {
          animation: progress linear;
        }
      `}</style>
    </div>
  );
};

export default FloatingFOMOBanner;
