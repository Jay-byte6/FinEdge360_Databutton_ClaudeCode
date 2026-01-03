/**
 * MilestoneNudgePopup - Simple, focused journey guidance
 * Shows ONE critical next action every login
 */

import React from 'react';
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
import { ArrowRight, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MilestoneNudgePopupProps {
  milestoneDetails: {
    title: string;
    description: string;
    buttonText: string;
    route: string;
    icon: string;
    urgency: 'critical' | 'high' | 'medium';
    benefit: string;
  };
  completedCount: number;
  totalMilestones: number;
  onClose: () => void;
  onDismissThisSession: () => void;
}

export const MilestoneNudgePopup: React.FC<MilestoneNudgePopupProps> = ({
  milestoneDetails,
  completedCount,
  totalMilestones,
  onClose,
  onDismissThisSession,
}) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  const handleTakeAction = () => {
    if (dontShowAgain) {
      onDismissThisSession();
    }
    onClose();
    console.log('[MilestoneNudgePopup] Navigating to:', milestoneDetails.route);
    navigate(milestoneDetails.route);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      onDismissThisSession();
    } else {
      onClose();
    }
  };

  const progress = (completedCount / totalMilestones) * 100;

  // Urgency styling
  const urgencyStyles = {
    critical: {
      borderColor: 'border-red-500',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      badgeLabel: 'CRITICAL',
      pulseColor: 'bg-red-400'
    },
    high: {
      borderColor: 'border-orange-500',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      badgeLabel: 'IMPORTANT',
      pulseColor: 'bg-orange-400'
    },
    medium: {
      borderColor: 'border-blue-500',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      badgeLabel: 'RECOMMENDED',
      pulseColor: 'bg-blue-400'
    }
  };

  const style = urgencyStyles[milestoneDetails.urgency];

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[500px] border-2 ${style.borderColor} max-w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-5`}>
        <DialogHeader>
          {/* Progress Badge - Compact */}
          <div className="flex justify-between items-center mb-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.badgeBg}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${style.pulseColor} animate-pulse`}></div>
              <span className={`text-xs font-bold ${style.badgeText}`}>
                {style.badgeLabel}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {completedCount}/{totalMilestones}
            </span>
          </div>

          {/* Icon & Title - Compact */}
          <div className="text-center mb-3">
            <div className="text-5xl mb-3">{milestoneDetails.icon}</div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {milestoneDetails.title}
            </DialogTitle>
          </div>

          {/* Progress Bar - Simplified */}
          <div className="mb-3">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-gray-500 mt-1 text-center">
              {progress.toFixed(0)}% complete
            </p>
          </div>

          {/* Description - Compact */}
          <DialogDescription className="text-center text-sm text-gray-700 mb-3">
            {milestoneDetails.description}
          </DialogDescription>

          {/* Benefit Box - Simplified */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✨</span>
              <p className="text-xs text-green-700 flex-1">{milestoneDetails.benefit}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Don't Show Again Checkbox - Positioned above buttons */}
        <div className="flex items-center gap-2 px-4 py-2 mb-3">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="dontShowAgain" className="text-sm text-gray-600 cursor-pointer select-none">
            Don't show this again
          </label>
        </div>

        <DialogFooter className="flex flex-col gap-2">
          {/* Primary Action Button */}
          <Button
            onClick={handleTakeAction}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base py-5"
          >
            <span>{milestoneDetails.buttonText}</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {/* Maybe Later Button */}
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 text-sm py-2"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
