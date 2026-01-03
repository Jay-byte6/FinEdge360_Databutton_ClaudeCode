/**
 * FeedbackNudge - Interactive feedback collection system
 * Uses buttons, emojis, and sliders instead of text input for better UX
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  ThumbsUp,
  Star,
  TrendingUp,
  Shield,
  X,
  Send,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/utils/authStore';
import { API_ENDPOINTS } from '@/config/api';

// Feedback types
type FeedbackType = 'quick_rating' | 'feature_satisfaction' | 'goal_selection' | 'yes_no_poll' | 'journey_confidence';

interface FeedbackNudgeProps {
  open: boolean;
  onClose: () => void;
  feedbackType?: FeedbackType;
  milestone?: number;
  featureName?: string; // e.g., "FIRE Calculator", "Portfolio", "Tax Planning"
}

export const FeedbackNudge: React.FC<FeedbackNudgeProps> = ({
  open,
  onClose,
  feedbackType = 'quick_rating',
  milestone,
  featureName
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState([3]); // Default middle value
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // For multiple select
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedRating(null);
      setSliderValue([3]);
      setSelectedOption(null);
      setSelectedOptions([]);
      setShowOtherInput(false);
      setOtherText('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const feedbackData = {
        user_id: user.id,
        feedback_type: feedbackType,
        milestone_number: milestone,
        feature_name: featureName,
        rating: selectedRating,
        slider_value: sliderValue[0],
        selected_option: selectedOption,
        selected_options: selectedOptions,
        optional_text: otherText || null,
        page_location: window.location.pathname,
        created_at: new Date().toISOString()
      };

      // TODO: Replace with actual API endpoint
      console.log('Submitting feedback:', feedbackData);

      // Simulated API call
      // const response = await fetch(API_ENDPOINTS.submitFeedback, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to submit feedback');
      // }

      toast.success('Thank you for your feedback! 🎉');

      // Store in localStorage to prevent showing same feedback again soon
      localStorage.setItem(`feedback_submitted_${feedbackType}`, Date.now().toString());

      // Special flag for milestone 3 feedback
      if (milestone === 3) {
        localStorage.setItem('milestone_3_feedback_given', 'true');
      }

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissForever = () => {
    localStorage.setItem(`feedback_dismissed_${feedbackType}`, 'true');
    // Special flag for milestone 3 feedback
    if (milestone === 3) {
      localStorage.setItem('milestone_3_feedback_given', 'true');
    }
    toast.info('Got it! We won\'t ask again.');
    onClose();
  };

  const handlePowerUpClick = () => {
    // Save to localStorage to never show this again
    if (user?.id && milestone) {
      localStorage.setItem(`last_feedback_milestone_${user.id}`, String(milestone));
    }
    localStorage.setItem(`feedback_dismissed_${feedbackType}`, 'true');

    // Special flag for milestone 3 feedback
    if (milestone === 3) {
      localStorage.setItem('milestone_3_feedback_given', 'true');
    }

    onClose();

    // Navigate to feedback page
    setTimeout(() => {
      navigate('/feedback');
    }, 100);
  };

  const canSubmit = () => {
    switch (feedbackType) {
      case 'quick_rating':
        return selectedRating !== null;
      case 'feature_satisfaction':
        return true; // Slider always has value
      case 'goal_selection':
      case 'yes_no_poll':
      case 'journey_confidence':
        return selectedOption !== null;
      default:
        return false;
    }
  };

  // Render different feedback types
  const renderFeedbackContent = () => {
    switch (feedbackType) {
      case 'quick_rating':
        return (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                How's your experience so far?
              </DialogTitle>
              <DialogDescription className="text-center">
                Your feedback helps us improve FIREMap for everyone
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center gap-4 my-6">
              {[
                { emoji: '😠', value: 1, label: 'Poor' },
                { emoji: '😞', value: 2, label: 'Fair' },
                { emoji: '😐', value: 3, label: 'Good' },
                { emoji: '🙂', value: 4, label: 'Great' },
                { emoji: '😍', value: 5, label: 'Excellent' },
              ].map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => setSelectedRating(rating.value)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    selectedRating === rating.value
                      ? 'bg-blue-100 border-2 border-blue-500 scale-110'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:scale-105'
                  }`}
                >
                  <span className="text-4xl mb-1">{rating.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{rating.label}</span>
                </button>
              ))}
            </div>
          </>
        );

      case 'feature_satisfaction':
        return (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Star className="w-7 h-7 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                How useful was the {featureName || 'feature'} for you?
              </DialogTitle>
              <DialogDescription className="text-center">
                Help us understand what's working well
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 px-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Not Useful</span>
                <span>Very Useful</span>
              </div>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    className={`text-sm font-medium ${
                      sliderValue[0] === num ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
              <div className="text-center mt-3">
                <span className="text-2xl">
                  {sliderValue[0] === 1 && '😞'}
                  {sliderValue[0] === 2 && '😐'}
                  {sliderValue[0] === 3 && '🙂'}
                  {sliderValue[0] === 4 && '😊'}
                  {sliderValue[0] === 5 && '😍'}
                </span>
              </div>
            </div>
          </>
        );

      case 'goal_selection':
        return (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                🎉 Congratulations on completing FREE tier!
              </DialogTitle>
              <DialogDescription className="text-center">
                Help us make FIREMap even better for you and thousands of others
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
              <p className="text-sm text-gray-700 text-center mb-3">
                You've completed the first 3 milestones! Your feedback is invaluable in shaping the future of FIREMap.
              </p>
              <p className="text-xs text-gray-600 text-center">
                Share your experience, suggestions, and help us build the ultimate FIRE journey platform.
              </p>
            </div>
          </>
        );

      case 'yes_no_poll':
        return (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <ThumbsUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                Did you find what you were looking for today?
              </DialogTitle>
            </DialogHeader>

            <div className="flex gap-4 my-6 justify-center">
              <button
                onClick={() => {
                  setSelectedOption('yes');
                  setShowOtherInput(false);
                }}
                className={`flex-1 max-w-[200px] p-6 rounded-lg border-2 transition-all ${
                  selectedOption === 'yes'
                    ? 'bg-green-50 border-green-500 shadow-lg scale-105'
                    : 'bg-white border-gray-200 hover:border-green-300 hover:scale-105'
                }`}
              >
                <div className="text-center">
                  <span className="text-5xl block mb-2">✅</span>
                  <span className="font-bold text-green-700">Yes</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedOption('no');
                  setShowOtherInput(true);
                }}
                className={`flex-1 max-w-[200px] p-6 rounded-lg border-2 transition-all ${
                  selectedOption === 'no'
                    ? 'bg-red-50 border-red-500 shadow-lg scale-105'
                    : 'bg-white border-gray-200 hover:border-red-300 hover:scale-105'
                }`}
              >
                <div className="text-center">
                  <span className="text-5xl block mb-2">❌</span>
                  <span className="font-bold text-red-700">No</span>
                </div>
              </button>
            </div>

            {showOtherInput && selectedOption === 'no' && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  What were you looking for? (Optional)
                </p>
                <Textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Tell us what you were hoping to find..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </>
        );

      case 'journey_confidence':
        return (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">
                How confident do you feel about your FIRE journey?
              </DialogTitle>
              <DialogDescription className="text-center">
                Help us understand where you need more support
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 my-4">
              {[
                { id: 'very_confused', label: '😵 Very Confused', color: 'red' },
                { id: 'somewhat_unclear', label: '😕 Somewhat Unclear', color: 'orange' },
                { id: 'getting_there', label: '🤔 Getting There', color: 'yellow' },
                { id: 'pretty_confident', label: '😊 Pretty Confident', color: 'blue' },
                { id: 'totally_clear', label: '😍 Totally Clear!', color: 'green' },
              ].map((conf) => (
                <button
                  key={conf.id}
                  onClick={() => setSelectedOption(conf.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedOption === conf.id
                      ? `bg-${conf.color}-50 border-${conf.color}-500 shadow-md`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{conf.label.split(' ')[0]}</span>
                    <span className="font-medium text-gray-800">
                      {conf.label.substring(conf.label.indexOf(' ') + 1)}
                    </span>
                    {selectedOption === conf.id && (
                      <span className="ml-auto text-green-600 text-xl">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {renderFeedbackContent()}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={handleDismissForever}
            className="text-xs text-gray-500 hover:text-gray-700 order-3 sm:order-1"
          >
            Don't Ask Again
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="order-2"
          >
            Maybe Later
          </Button>
          {feedbackType === 'goal_selection' ? (
            <Button
              onClick={handlePowerUpClick}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white order-1 sm:order-3 font-bold"
            >
              <Rocket className="w-4 h-4 mr-2" />
              🚀 PowerUp FIREMap
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white order-1 sm:order-3"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
