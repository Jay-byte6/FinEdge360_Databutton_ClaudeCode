import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LockedFeatureOverlayProps {
  featureName: string;
  className?: string;
}

/**
 * Overlay component that blurs and locks premium features for free users
 * Shows upgrade prompt with call-to-action
 */
export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  featureName,
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <div className={`absolute inset-0 backdrop-blur-sm bg-white/40 z-20 flex items-center justify-center rounded-lg ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 border-2 border-blue-200">
        <div className="flex flex-col items-center text-center">
          {/* Lock Icon with Premium Badge */}
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-yellow-900" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Premium Feature
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">
            <strong>{featureName}</strong> is available for Premium users only.
            Unlock detailed insights and tracking to achieve your FIRE goals faster!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button
              onClick={() => navigate('/portfolio')}
              variant="outline"
              className="w-full text-sm"
            >
              Already Premium? Enter Access Code
            </Button>
          </div>

          {/* Benefits Teaser */}
          <div className="mt-4 pt-4 border-t border-gray-200 w-full">
            <p className="text-xs text-gray-500">
              ✨ Premium includes: Goal Tracking • Portfolio Sync • Expert Insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
