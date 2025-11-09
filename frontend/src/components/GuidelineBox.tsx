import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const GuidelineBox: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Changed to false (collapsed by default)

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
      <style>{`
        @keyframes brightPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            background-color: rgb(37, 99, 235);
            color: white;
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
            background-color: rgb(59, 130, 246);
            color: white;
          }
        }
        .bright-pulse {
          animation: brightPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
        }
        .bright-pulse:hover {
          animation: none;
          background-color: rgb(29, 78, 216);
        }
      `}</style>

      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Lightbulb className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Privacy Protection Tip: Use Factored Financial Data
            </h3>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`ml-2 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                !isExpanded
                  ? 'bright-pulse text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              aria-label={isExpanded ? "Hide details" : "Show details"}
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-blue-800 mb-3">
            To protect your privacy, we encourage you to enter <strong>factored data</strong> rather
            than your real amounts. The app's output will be factored accordingly, allowing you to easily
            understand and correlate the amounts.
          </p>

          {isExpanded && (
            <div className="space-y-2 text-sm text-blue-800 animate-in slide-in-from-top duration-200">
              <div>
                <p className="font-medium">Method 1: Cut Off a Zero</p>
                <p className="text-xs mt-1">
                  For each amount, simply cut off the last zero. For example, if your income is ₹50,000,
                  enter ₹5,000. Multiply the result by ten to get your real amount.
                </p>
                <div className="bg-blue-100 border border-blue-200 rounded p-2 mt-1 text-xs">
                  <strong>Example:</strong> Real income: ₹50,000 → Enter: ₹5,000<br/>
                  Result shown: ₹3,000 → Your real result: ₹30,000
                </div>
              </div>

              <div className="pt-2">
                <p className="font-medium">Method 2: Use a Consistent Factor</p>
                <p className="text-xs mt-1">
                  Use a consistent factor like one-sixth or one-seventh of the real amount for all entries.
                  Ensure you apply the same factor to all your financial data so the output remains consistent.
                </p>
                <div className="bg-blue-100 border border-blue-200 rounded p-2 mt-1 text-xs">
                  <strong>Example (using factor of 1/6):</strong><br/>
                  Real income: ₹60,000 → Enter: ₹10,000<br/>
                  Real assets: ₹12,00,000 → Enter: ₹2,00,000<br/>
                  Result shown: ₹50,000 → Your real result: ₹3,00,000 (multiply by 6)
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-blue-700 mt-3 italic">
            <strong>Remember:</strong> This tool provides informational simulations only and is <strong>not financial advice</strong>.
            The plan generated is only as accurate as the data entered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidelineBox;
