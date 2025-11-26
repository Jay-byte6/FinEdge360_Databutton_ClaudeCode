import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date | string;
  onExpire?: () => void;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onExpire,
  showLabels = true,
  size = 'md',
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const sizeClasses = {
    sm: 'text-lg w-12 h-12',
    md: 'text-2xl w-16 h-16',
    lg: 'text-3xl w-20 h-20',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (timeRemaining.expired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 inline-block">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Offer Expired</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`countdown-timer ${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {/* Days */}
        {timeRemaining.days > 0 && (
          <div className="flex flex-col items-center">
            <div
              className={`${sizeClasses[size]} bg-gradient-to-br from-red-500 to-red-600 text-white font-bold rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105`}
            >
              {timeRemaining.days}
            </div>
            {showLabels && (
              <span className={`${labelSizeClasses[size]} mt-1 text-gray-600 dark:text-gray-400 font-medium`}>
                Days
              </span>
            )}
          </div>
        )}

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div
            className={`${sizeClasses[size]} bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105`}
          >
            {String(timeRemaining.hours).padStart(2, '0')}
          </div>
          {showLabels && (
            <span className={`${labelSizeClasses[size]} mt-1 text-gray-600 dark:text-gray-400 font-medium`}>
              Hours
            </span>
          )}
        </div>

        <span className="text-2xl font-bold text-gray-400 mb-6">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div
            className={`${sizeClasses[size]} bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-bold rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105`}
          >
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
          {showLabels && (
            <span className={`${labelSizeClasses[size]} mt-1 text-gray-600 dark:text-gray-400 font-medium`}>
              Minutes
            </span>
          )}
        </div>

        <span className="text-2xl font-bold text-gray-400 mb-6">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div
            className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-green-600 text-white font-bold rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 animate-pulse`}
          >
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          {showLabels && (
            <span className={`${labelSizeClasses[size]} mt-1 text-gray-600 dark:text-gray-400 font-medium`}>
              Seconds
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
