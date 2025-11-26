import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Zap } from 'lucide-react';

interface SpotsMeterProps {
  totalSlots: number;
  usedSlots: number;
  promoCode?: string;
  promoName?: string;
  showPercentage?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SpotsMeter: React.FC<SpotsMeterProps> = ({
  totalSlots,
  usedSlots,
  promoCode,
  promoName = 'Limited Offer',
  showPercentage = true,
  animated = true,
  size = 'md',
  className = '',
}) => {
  const [displayedUsedSlots, setDisplayedUsedSlots] = useState(0);
  const remainingSlots = totalSlots - usedSlots;
  const percentageClaimed = (usedSlots / totalSlots) * 100;

  // Animated counting effect
  useEffect(() => {
    if (!animated) {
      setDisplayedUsedSlots(usedSlots);
      return;
    }

    let start = 0;
    const duration = 1500; // 1.5 seconds
    const increment = usedSlots / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= usedSlots) {
        setDisplayedUsedSlots(usedSlots);
        clearInterval(timer);
      } else {
        setDisplayedUsedSlots(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [usedSlots, animated]);

  // Determine urgency level and color
  const getUrgencyConfig = () => {
    if (percentageClaimed >= 90) {
      return {
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-500',
        urgencyLabel: 'Almost Gone!',
        icon: <Zap className="w-4 h-4 animate-pulse" />,
      };
    } else if (percentageClaimed >= 75) {
      return {
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        textColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-500',
        urgencyLabel: 'Limited Spots!',
        icon: <TrendingUp className="w-4 h-4" />,
      };
    } else if (percentageClaimed >= 50) {
      return {
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        borderColor: 'border-yellow-500',
        urgencyLabel: 'Filling Fast!',
        icon: <Users className="w-4 h-4" />,
      };
    } else {
      return {
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-500',
        urgencyLabel: 'Available Now',
        icon: <Users className="w-4 h-4" />,
      };
    }
  };

  const urgencyConfig = getUrgencyConfig();

  const sizeClasses = {
    sm: {
      container: 'text-sm p-3',
      progressBar: 'h-2',
      text: 'text-xs',
    },
    md: {
      container: 'text-base p-4',
      progressBar: 'h-3',
      text: 'text-sm',
    },
    lg: {
      container: 'text-lg p-5',
      progressBar: 'h-4',
      text: 'text-base',
    },
  };

  return (
    <div className={`spots-meter ${className}`}>
      <div
        className={`${urgencyConfig.bgColor} border-2 ${urgencyConfig.borderColor} rounded-xl ${sizeClasses[size].container} shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {urgencyConfig.icon}
            <span className={`font-bold ${urgencyConfig.textColor}`}>
              {promoName}
            </span>
          </div>
          {promoCode && (
            <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-sm">
              {promoCode}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className={`w-full ${sizeClasses[size].progressBar} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
            <div
              className={`h-full bg-gradient-to-r ${urgencyConfig.color} transition-all duration-1000 ease-out relative`}
              style={{ width: `${percentageClaimed}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3">
          <div className={`${sizeClasses[size].text} font-semibold text-gray-700 dark:text-gray-300`}>
            <span className={`${urgencyConfig.textColor} font-bold text-lg`}>
              {displayedUsedSlots}/{totalSlots}
            </span>{' '}
            spots claimed
          </div>
          {showPercentage && (
            <div className={`${sizeClasses[size].text} ${urgencyConfig.textColor} font-bold`}>
              {Math.round(percentageClaimed)}%
            </div>
          )}
        </div>

        {/* Urgency Message */}
        <div className={`mt-2 ${sizeClasses[size].text} flex items-center gap-2 ${urgencyConfig.textColor} font-semibold`}>
          {urgencyConfig.urgencyLabel}
          {remainingSlots <= 10 && (
            <span className="animate-pulse">
              Only {remainingSlots} left!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotsMeter;
