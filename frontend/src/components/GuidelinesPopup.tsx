import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GuidelinesPopupProps {
  title: string;
  guidelines: {
    title: string;
    points: string[];
  }[];
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
  isOpen: boolean;
}

export const GuidelinesPopup: React.FC<GuidelinesPopupProps> = ({
  title,
  guidelines,
  onClose,
  onConfirm,
  isOpen,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {guidelines.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {section.title}
              </h3>
              <ul className="space-y-2 ml-7">
                {section.points.map((point, pointIndex) => (
                  <li
                    key={pointIndex}
                    className="text-gray-700 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Important Note */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-sm text-amber-900">
              <strong>💡 Pro Tip:</strong> Using accurate, factored data helps us provide more
              realistic projections and better financial planning advice.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Don't show again checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Don't show this again</span>
            </label>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Yes, I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Predefined guidelines for different sections
export const FINANCIAL_DATA_GUIDELINES = {
  title: 'Financial Data Entry Guidelines',
  guidelines: [
    {
      title: '💰 Use Factored/Rounded Numbers',
      points: [
        'Round your income to nearest ₹10,000 (e.g., ₹8,50,000 instead of ₹8,47,325)',
        'Round expenses to nearest ₹5,000 for better planning',
        'Use approximate values for investments (nearest ₹50,000)',
        'This makes calculations cleaner and projections more realistic',
      ],
    },
    {
      title: '📊 Be Conservative with Estimates',
      points: [
        "Do not overestimate your future income growth",
        'Include all monthly expenses, even small recurring ones',
        'Factor in annual expenses (divided by 12)',
        'Keep a buffer of 10-15% for unexpected costs',
      ],
    },
    {
      title: '🎯 Asset Allocation Reality Check',
      points: [
        "Do not put all eggs in one basket (diversification is key)",
        'Consider your risk tolerance honestly',
        'Young? You can take more equity exposure (60-80%)',
        'Near retirement? Shift to safer assets (debt 40-60%)',
      ],
    },
    {
      title: '⚠️ Common Mistakes to Avoid',
      points: [
        "Do not enter exact bank balance - use investable surplus",
        "Do not forget emergency fund (6 months expenses)",
        "Do not ignore insurance premiums in expenses",
        "Do not mix pre-tax and post-tax income",
      ],
    },
  ],
};

export const GOAL_PLANNING_GUIDELINES = {
  title: 'Goal Planning Best Practices',
  guidelines: [
    {
      title: '🎯 Setting Realistic Goals',
      points: [
        'Be specific with goal amounts (research actual costs)',
        'Add inflation buffer to long-term goals',
        'Prioritize goals: Essential > Important > Wishful',
        'Consider goal timelines realistically',
      ],
    },
    {
      title: '💡 SIP Amount Reality',
      points: [
        'Start with what you can afford comfortably',
        'Plan to increase SIPs by 10% annually',
        "Do not commit to SIPs you cannot sustain",
        'Emergency fund first, then SIPs',
      ],
    },
    {
      title: '📈 Expected Returns',
      points: [
        'Equity (Long-term): 12-15% CAGR is realistic',
        'Debt (Safe): 6-8% CAGR expected',
        'Balanced: 10-12% CAGR typically',
        "Do not assume 20%+ returns consistently",
      ],
    },
  ],
};

export const PORTFOLIO_ANALYSIS_GUIDELINES = {
  title: 'Portfolio Analysis Guidelines',
  points: [
    'Include all investments: Stocks, MFs, FDs, Gold, Real Estate',
    'Use current market value, not purchase price',
    'Update portfolio data quarterly for accurate analysis',
    'Consider liquidity needs when allocating',
  ],
};
