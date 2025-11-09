import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export interface RiskQuizAnswer {
  questionId: number;
  score: number;
}

interface RiskAssessmentQuizProps {
  onComplete: (answers: RiskQuizAnswer[], totalScore: number) => void;
  onSkip?: () => void;
}

const RISK_QUESTIONS = [
  {
    id: 1,
    question: "What's your investment horizon?",
    options: [
      { label: "< 3 years", score: 1 },
      { label: "3–7 years", score: 3 },
      { label: "> 7 years", score: 5 },
    ],
  },
  {
    id: 2,
    question: "How do you react if your portfolio drops 15% in a month?",
    options: [
      { label: "Sell all", score: 1 },
      { label: "Hold", score: 3 },
      { label: "Buy more", score: 5 },
    ],
  },
  {
    id: 3,
    question: "What's your monthly saving rate (% of income)?",
    options: [
      { label: "<10%", score: 1 },
      { label: "10–25%", score: 3 },
      { label: ">25%", score: 5 },
    ],
  },
  {
    id: 4,
    question: "How stable is your income?",
    options: [
      { label: "Unstable", score: 1 },
      { label: "Moderately stable", score: 3 },
      { label: "Very stable", score: 5 },
    ],
  },
  {
    id: 5,
    question: "Your investing experience?",
    options: [
      { label: "None", score: 1 },
      { label: "Some experience", score: 3 },
      { label: "Experienced investor", score: 5 },
    ],
  },
  {
    id: 6,
    question: "How important is capital protection vs. returns?",
    options: [
      { label: "Safety first", score: 1 },
      { label: "Balanced", score: 3 },
      { label: "Growth focus", score: 5 },
    ],
  },
  {
    id: 7,
    question: "How would you feel if markets stayed down for a year?",
    options: [
      { label: "Panic", score: 1 },
      { label: "Wait", score: 3 },
      { label: "See it as an opportunity", score: 5 },
    ],
  },
  {
    id: 8,
    question: "What's your main goal?",
    options: [
      { label: "Short-term needs", score: 1 },
      { label: "Steady long-term growth", score: 3 },
      { label: "Financial freedom", score: 5 },
    ],
  },
  {
    id: 9,
    question: "How many dependents do you support financially?",
    options: [
      { label: "3+", score: 1 },
      { label: "1–2", score: 3 },
      { label: "None", score: 5 },
    ],
  },
  {
    id: 10,
    question: "What % of your total assets are invested currently?",
    options: [
      { label: "<20%", score: 1 },
      { label: "20–60%", score: 3 },
      { label: ">60%", score: 5 },
    ],
  },
];

const RiskAssessmentQuiz: React.FC<RiskAssessmentQuizProps> = ({ onComplete, onSkip }) => {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentQuestion < RISK_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answerArray: RiskQuizAnswer[] = Object.entries(answers).map(([questionId, score]) => ({
      questionId: parseInt(questionId),
      score,
    }));

    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    onComplete(answerArray, totalScore);
  };

  const isCurrentAnswered = answers[RISK_QUESTIONS[currentQuestion].id] !== undefined;
  const allAnswered = Object.keys(answers).length === RISK_QUESTIONS.length;
  const progress = (Object.keys(answers).length / RISK_QUESTIONS.length) * 100;

  const question = RISK_QUESTIONS[currentQuestion];

  return (
    <Card className="shadow-lg border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl text-blue-900">
          Risk Assessment Questionnaire
        </CardTitle>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {RISK_QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {question.question}
          </h3>

          <RadioGroup
            value={answers[question.id]?.toString()}
            onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    answers[question.id] === option.score
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswer(question.id, option.score)}
                >
                  <RadioGroupItem value={option.score.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-gray-700 font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
          </div>

          <div className="flex gap-2">
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-gray-600"
              >
                Skip Quiz
              </Button>
            )}

            {currentQuestion < RISK_QUESTIONS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isCurrentAnswered}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Assessment
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        {Object.keys(answers).length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} / {RISK_QUESTIONS.length} questions
              {Object.keys(answers).length === RISK_QUESTIONS.length && (
                <span className="ml-2 text-green-600 font-semibold">✓ All questions answered!</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentQuiz;
