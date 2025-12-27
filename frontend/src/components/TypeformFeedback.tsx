/**
 * TypeformFeedback - Engaging one-question-at-a-time feedback system
 * Inspired by Typeform's beautiful, motivating UX
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Star,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Send
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  type: 'rating' | 'text' | 'multipleChoice' | 'emoji' | 'nps';
  question: string;
  subtitle?: string;
  options?: string[];
  required?: boolean;
  minRating?: number;
  maxRating?: number;
}

interface TypeformFeedbackProps {
  onSubmit: (responses: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  userName?: string;
}

const FEEDBACK_QUESTIONS: Question[] = [
  {
    id: 'overall_vibe',
    type: 'emoji',
    question: "First things first - how are you feeling about FIREMap? 😊",
    subtitle: "No filter needed - we can handle the truth!",
    required: true
  },
  {
    id: 'i_like',
    type: 'text',
    question: "I LIKE... 💚",
    subtitle: "Tell us what's working for you! What made you smile or relieved while using FIREMap?",
    required: true
  },
  {
    id: 'i_wish',
    type: 'text',
    question: "I WISH... ✨",
    subtitle: "What would make FIREMap even more amazing? What's missing or could be better?",
    required: true
  },
  {
    id: 'biggest_win',
    type: 'multipleChoice',
    question: "What's your biggest win with FIREMap so far?",
    subtitle: "Celebrate with us! 🎉",
    options: [
      "Finally know my net worth",
      "Discovered my FIRE number",
      "Created a clear plan for my goals",
      "Understanding my portfolio better",
      "Saving taxes smartly",
      "Tracking everything in one place",
      "Expert guidance when I needed it",
      "Still exploring - but excited!"
    ],
    required: false
  },
  {
    id: 'stuck_moment',
    type: 'multipleChoice',
    question: "Where did you get stuck or confused?",
    subtitle: "Help us smooth out the rough edges",
    options: [
      "Understanding how to start",
      "Entering my financial details",
      "Setting realistic goals",
      "Understanding the FIRE calculator",
      "Portfolio recommendations",
      "Navigation - finding things",
      "Too much information at once",
      "I didn't get stuck - smooth sailing! ⛵"
    ],
    required: false
  },
  {
    id: 'dream_feature',
    type: 'text',
    question: "If you had a magic wand... 🪄",
    subtitle: "What ONE feature would you add to FIREMap? Dream big!",
    required: false
  },
  {
    id: 'recommend_friend',
    type: 'nps',
    question: "Would you recommend FIREMap to a friend?",
    subtitle: "0 = Not really, 10 = Already telling everyone!",
    required: true,
    minRating: 0,
    maxRating: 10
  },
  {
    id: 'speed_rating',
    type: 'rating',
    question: "How's the speed and performance?",
    subtitle: "Fast and smooth? Or needs improvement?",
    required: false,
    minRating: 1,
    maxRating: 5
  },
  {
    id: 'bug_report',
    type: 'text',
    question: "Spotted a bug or something broken? 🐛",
    subtitle: "Let us know! Screenshots or descriptions help us fix faster.",
    required: false
  },
  {
    id: 'anything_else',
    type: 'text',
    question: "Any parting words of wisdom for us? 🙏",
    subtitle: "Ideas, rants, love letters, feature requests - we're all ears!",
    required: false
  }
];

export const TypeformFeedback: React.FC<TypeformFeedbackProps> = ({
  onSubmit,
  onClose,
  userName
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate-slide-in');

  const currentQuestion = FEEDBACK_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / FEEDBACK_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === FEEDBACK_QUESTIONS.length - 1;
  const canProceed = !currentQuestion.required || responses[currentQuestion.id] !== undefined;

  useEffect(() => {
    setAnimationClass('animate-slide-in');
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (!canProceed) return;

    setAnimationClass('animate-slide-out');
    setTimeout(() => {
      if (isLastQuestion) {
        handleSubmit();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 200);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) return;

    setAnimationClass('animate-slide-out-reverse');
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev - 1);
    }, 200);
  };

  const handleResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(responses);
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    const currentResponse = responses[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'emoji':
        return (
          <div className="flex justify-center gap-6 mt-8">
            {[
              { icon: Smile, label: 'Great', value: 'great', color: 'text-green-500' },
              { icon: Meh, label: 'Okay', value: 'okay', color: 'text-yellow-500' },
              { icon: Frown, label: 'Poor', value: 'poor', color: 'text-red-500' }
            ].map(({ icon: Icon, label, value, color }) => (
              <button
                key={value}
                onClick={() => handleResponse(value)}
                className={`flex flex-col items-center gap-2 p-6 rounded-xl transition-all ${
                  currentResponse === value
                    ? 'bg-blue-50 border-2 border-blue-500 scale-110'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <Icon className={`h-12 w-12 ${currentResponse === value ? color : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        );

      case 'nps':
        return (
          <div className="mt-8">
            <div className="grid grid-cols-11 gap-2">
              {Array.from({ length: 11 }, (_, i) => i).map(num => (
                <button
                  key={num}
                  onClick={() => handleResponse(num)}
                  className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                    currentResponse === num
                      ? 'bg-blue-500 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500">
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="flex justify-center gap-3 mt-8">
            {Array.from({ length: currentQuestion.maxRating || 5 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => handleResponse(num)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-12 w-12 ${
                    currentResponse >= num
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="space-y-3 mt-8">
            {currentQuestion.options?.map(option => (
              <button
                key={option}
                onClick={() => handleResponse(option)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  currentResponse === option
                    ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{option}</span>
                  {currentResponse === option && (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="mt-8">
            <Textarea
              value={currentResponse || ''}
              onChange={(e) => handleResponse(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[150px] text-lg p-4 resize-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center animate-scale-in">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You{userName ? `, ${userName}` : ''}! 🎉
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            Your feedback means the world to us! We're committed to making FIREMap
            the best financial planning tool for your journey to financial freedom.
          </p>

          <div className="p-6 bg-white rounded-lg shadow-lg mb-8">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700">
              As a token of our appreciation, you're helping shape the future of
              thousands of users on their path to FIRE! 🚀
            </p>
          </div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold px-8 py-6 text-lg"
          >
            Back to Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {FEEDBACK_QUESTIONS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`max-w-2xl w-full ${animationClass}`}>
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {currentQuestion.question}
            </h2>
            {currentQuestion.subtitle && (
              <p className="text-lg text-gray-600">{currentQuestion.subtitle}</p>
            )}
            {!currentQuestion.required && (
              <p className="text-sm text-gray-500 mt-2 italic">Optional</p>
            )}
          </div>

          {renderQuestion()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className={`${
                canProceed
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-300'
              } text-white font-bold px-8 py-6`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : isLastQuestion ? (
                <>
                  Submit Feedback
                  <Send className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Motivational Message */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Your feedback is shaping the future of FIREMap!</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
