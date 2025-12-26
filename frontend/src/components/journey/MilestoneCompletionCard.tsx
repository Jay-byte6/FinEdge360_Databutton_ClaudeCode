/**
 * Milestone Completion Card Component
 *
 * Displays at the bottom of milestone pages, showing:
 * - Completion checklist
 * - Help resources
 * - Mark as Complete button
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, HelpCircle, PlayCircle, BookOpen, MessageCircle, Loader2, ArrowRight, ArrowLeft, AlertCircle, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/utils/authStore';
import { API_BASE_URL } from '@/config/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface MilestoneCompletionProps {
  milestoneNumber: number;
  title: string;
  completionCriteria: {
    label: string;
    checked: boolean;
    description?: string;
  }[];
  helpResources?: {
    tutorial?: string;
    guide?: string;
    videoUrl?: string;
  };
  onComplete?: () => void;
}

interface MilestoneProgressState {
  completed: boolean;
  needs_help: boolean;
  notes?: string;
}

// Mapping of milestone numbers to their page routes
const MILESTONE_ROUTES: Record<number, string> = {
  1: '/net-worth',
  2: '/fire-calculator',
  3: '/tax-planning',
  4: '/portfolio',
  5: '/sip-planner?tab=set-goals',
  6: '/sip-planner?tab=asset-allocation',
  7: '/sip-planner?tab=sip-plan',
};

export const MilestoneCompletionCard: React.FC<MilestoneCompletionProps> = ({
  milestoneNumber,
  title,
  completionCriteria,
  helpResources,
  onComplete,
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [progressState, setProgressState] = useState<MilestoneProgressState>({
    completed: false,
    needs_help: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previousMilestoneCompleted, setPreviousMilestoneCompleted] = useState(true);
  const [showPreviousMilestoneAlert, setShowPreviousMilestoneAlert] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);

  // Calculate completion percentage
  const completedCount = completionCriteria.filter(c => c.checked).length;
  const totalCount = completionCriteria.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isFullyCompleted = completedCount === totalCount;

  // Load milestone progress on mount
  useEffect(() => {
    if (user?.id) {
      loadMilestoneProgress();
      checkPreviousMilestoneCompletion();
    }
  }, [user?.id, milestoneNumber]);

  const loadMilestoneProgress = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/routes/get-milestone-progress/${user?.id}/${milestoneNumber}`
      );

      if (response.ok) {
        const data = await response.json();
        setProgressState({
          completed: data.completed || false,
          needs_help: data.needs_help || false,
          notes: data.notes,
        });
      }
    } catch (error) {
      console.error('Error loading milestone progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPreviousMilestoneCompletion = async () => {
    // Milestone 1 has no previous milestone
    if (milestoneNumber === 1) {
      setPreviousMilestoneCompleted(true);
      return;
    }

    try {
      const previousMilestoneNumber = milestoneNumber - 1;
      const response = await fetch(
        `${API_BASE_URL}/routes/get-milestone-progress/${user?.id}/${previousMilestoneNumber}`
      );

      if (response.ok) {
        const data = await response.json();
        setPreviousMilestoneCompleted(data.completed || false);
      } else {
        // If no data found, assume previous milestone is not completed
        setPreviousMilestoneCompleted(false);
      }
    } catch (error) {
      console.error('Error checking previous milestone:', error);
      setPreviousMilestoneCompleted(false);
    }
  };

  const saveMilestoneProgress = async (updates: Partial<MilestoneProgressState>) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/routes/save-milestone-progress/${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            milestone_number: milestoneNumber,
            ...updates,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save milestone progress');
      }

      const result = await response.json();
      setProgressState(prev => ({ ...prev, ...updates }));

      return result;
    } catch (error) {
      console.error('Error saving milestone progress:', error);
      toast.error('Failed to save progress. Please try again.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsComplete = async () => {
    if (!isFullyCompleted) {
      toast.error('Please complete all criteria before marking as complete');
      return;
    }

    // Check if previous milestone is completed
    if (!previousMilestoneCompleted && milestoneNumber > 1) {
      setShowPreviousMilestoneAlert(true);
      return;
    }

    try {
      await saveMilestoneProgress({ completed: true });

      if (onComplete) {
        onComplete();
      }

      // Show congratulations popup
      setShowCongratulations(true);

      // Auto-redirect to next milestone after 3 seconds
      setTimeout(() => {
        setShowCongratulations(false);
        const nextMilestoneNumber = milestoneNumber + 1;
        const nextMilestoneRoute = MILESTONE_ROUTES[nextMilestoneNumber];

        if (nextMilestoneRoute) {
          navigate(nextMilestoneRoute);
        } else {
          // If no more milestones, go to Journey Map
          navigate('/journey');
        }
      }, 3000);
    } catch (error) {
      // Error already handled in saveMilestoneProgress
    }
  };

  const handleNeedHelp = async () => {
    try {
      await saveMilestoneProgress({ needs_help: true });
      toast.success('Help request noted', {
        description: 'We\'ll prioritize improving this section with more resources.',
      });
    } catch (error) {
      // Error already handled
    }
  };

  const handleGoToPreviousMilestone = () => {
    const previousMilestoneNumber = milestoneNumber - 1;
    const previousMilestoneRoute = MILESTONE_ROUTES[previousMilestoneNumber];

    if (previousMilestoneRoute) {
      navigate(previousMilestoneRoute);
    } else {
      // If there's no previous milestone, go to Journey Map
      navigate('/journey');
    }
  };

  const handleGoToNextMilestone = () => {
    const nextMilestoneNumber = milestoneNumber + 1;
    const nextMilestoneRoute = MILESTONE_ROUTES[nextMilestoneNumber];

    if (nextMilestoneRoute) {
      navigate(nextMilestoneRoute);
    } else {
      // If there's no next milestone, go to Journey Map
      navigate('/journey');
      toast.success('Congratulations! You\'ve completed all milestones!', {
        description: 'Review your complete journey on the FIRE Map.',
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full mt-8">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full mt-8 ${progressState.completed ? 'border-green-500 border-2' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Milestone {milestoneNumber}: {title}</CardTitle>
            <CardDescription className="mt-2">
              Track your progress and mark this milestone as complete
            </CardDescription>
          </div>
          {progressState.completed && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Completed</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Completion Progress</span>
            <span className="text-gray-600">
              {completedCount} of {totalCount} criteria met
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Completion Checklist */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Completion Checklist</h3>
          {completionCriteria.map((criterion, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                criterion.checked ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              {criterion.checked ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${criterion.checked ? 'text-green-900' : 'text-gray-700'}`}>
                  {criterion.label}
                </p>
                {criterion.description && (
                  <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Help Resources */}
        {helpResources && (
          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Need Help?</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {helpResources.videoUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(helpResources.videoUrl, '_blank')}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Watch Tutorial
                </Button>
              )}
              {helpResources.guide && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(helpResources.guide, '_blank')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Guide
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleNeedHelp}
                disabled={saving || progressState.needs_help}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {progressState.needs_help ? 'Help Requested' : 'Get Help'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col md:flex-row items-center justify-between border-t pt-6 gap-4">
        <p className="text-sm text-gray-600">
          {!previousMilestoneCompleted && milestoneNumber > 1 ? (
            <span className="text-orange-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Complete Milestone {milestoneNumber - 1} first to unlock this milestone
            </span>
          ) : isFullyCompleted ? (
            'All criteria met! You can now mark this milestone as complete.'
          ) : (
            `Complete ${totalCount - completedCount} more ${totalCount - completedCount === 1 ? 'criterion' : 'criteria'} to unlock completion.`
          )}
        </p>
        <div className="flex gap-3">
          {milestoneNumber > 1 && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleGoToPreviousMilestone}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Milestone
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={handleGoToNextMilestone}
            disabled={!progressState.completed}
            className="flex items-center"
          >
            Next Milestone
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            size="lg"
            onClick={handleMarkAsComplete}
            disabled={!isFullyCompleted || progressState.completed || saving || (!previousMilestoneCompleted && milestoneNumber > 1)}
            className={`${isFullyCompleted && !progressState.completed && previousMilestoneCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : progressState.completed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </>
            ) : (
              'Mark as Complete'
            )}
          </Button>
        </div>
      </CardFooter>

      {/* Alert Dialog for Previous Milestone Not Completed */}
      <AlertDialog open={showPreviousMilestoneAlert} onOpenChange={setShowPreviousMilestoneAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Complete Previous Milestone First
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              You need to complete <strong>Milestone {milestoneNumber - 1}</strong> before you can mark this milestone as complete. This ensures you follow the proper sequence for your financial journey.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToPreviousMilestone}>
              Go to Milestone {milestoneNumber - 1}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Congratulations Dialog */}
      <AlertDialog open={showCongratulations} onOpenChange={setShowCongratulations}>
        <AlertDialogContent className="max-w-md">
          <div className="relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50" />

            {/* Celebration sparkles animation */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <Sparkles className="absolute top-4 left-4 h-6 w-6 text-yellow-400 animate-ping" />
              <Sparkles className="absolute top-8 right-8 h-4 w-4 text-green-400 animate-pulse" />
              <Sparkles className="absolute bottom-12 left-12 h-5 w-5 text-blue-400 animate-bounce" />
              <Sparkles className="absolute bottom-8 right-4 h-6 w-6 text-purple-400 animate-ping" style={{ animationDelay: '0.3s' }} />
              <Sparkles className="absolute top-1/2 left-1/4 h-4 w-4 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="absolute top-1/3 right-1/4 h-5 w-5 text-yellow-400 animate-bounce" style={{ animationDelay: '0.7s' }} />
            </div>

            <AlertDialogHeader className="relative">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-8 w-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
              </div>
              <AlertDialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Congratulations!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-lg mt-4 text-gray-700">
                <p className="font-semibold mb-2">
                  You've successfully completed Milestone {milestoneNumber}!
                </p>
                <p className="text-base text-gray-600">
                  {milestoneNumber < 7 ? (
                    <>
                      Great progress! Redirecting you to <strong>Milestone {milestoneNumber + 1}</strong> in a moment...
                    </>
                  ) : (
                    <>
                      Amazing! You've completed all milestones. Redirecting to your FIRE Journey Map...
                    </>
                  )}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-center mt-6 relative">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full animate-pulse">
                <CheckCircle className="h-6 w-6" />
                <span className="font-bold text-lg">Milestone Completed!</span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 relative">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Auto-redirecting in 3 seconds...
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
