import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface NetWorthChange {
  hasChange: boolean;
  currentNetWorth?: number;
  previousNetWorth?: number;
  changeAmount?: number;
  changePercentage?: number;
  daysSinceLastSnapshot?: number;
  isIncrease?: boolean;
  message?: string;
}

interface NetWorthChangeBannerProps {
  userId: string;
  currentNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export const NetWorthChangeBanner = ({
  userId,
  currentNetWorth,
  totalAssets,
  totalLiabilities
}: NetWorthChangeBannerProps) => {
  const [change, setChange] = useState<NetWorthChange | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChange = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);

        // First, save today's snapshot
        await fetch(`${API_ENDPOINTS.baseUrl}/routes/save-net-worth-snapshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            netWorth: currentNetWorth,
            totalAssets,
            totalLiabilities
          })
        });

        // Then fetch the change data
        const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/net-worth-change/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setChange(data);
        }
      } catch (error) {
        console.error('[NetWorthChangeBanner] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChange();
  }, [userId, currentNetWorth, totalAssets, totalLiabilities]);

  if (isLoading || !change || !change.hasChange) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  const isIncrease = change.isIncrease ?? false;
  const isNoChange = Math.abs(change.changeAmount || 0) < 1;

  // Color scheme based on change
  const bgColor = isNoChange ? 'bg-gray-50' : isIncrease ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isNoChange ? 'border-gray-300' : isIncrease ? 'border-green-300' : 'border-red-300';
  const textColor = isNoChange ? 'text-gray-700' : isIncrease ? 'text-green-700' : 'text-red-700';
  const iconColor = isNoChange ? 'text-gray-500' : isIncrease ? 'text-green-600' : 'text-red-600';

  const Icon = isNoChange ? Minus : isIncrease ? TrendingUp : TrendingDown;
  const prefix = isNoChange ? '' : isIncrease ? '+' : '';

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 mb-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        {/* Left: Change Info */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isNoChange ? 'bg-gray-100' : isIncrease ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${textColor}`}>
                {isNoChange ? 'No Change' : `${prefix}${formatCurrency(Math.abs(change.changeAmount || 0))}`}
              </span>
              {!isNoChange && (
                <span className={`text-lg font-semibold ${textColor}`}>
                  ({prefix}{Math.abs(change.changePercentage || 0).toFixed(2)}%)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              {isNoChange
                ? 'Your net worth remained the same'
                : `Your net worth ${isIncrease ? 'increased' : 'decreased'} since last snapshot`}
            </p>
          </div>
        </div>

        {/* Right: Time Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Last snapshot: <strong>{getDaysText(change.daysSinceLastSnapshot || 0)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
