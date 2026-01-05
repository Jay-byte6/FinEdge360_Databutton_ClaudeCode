import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, ArrowRight, TrendingUp, Target, Map, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FIREResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  fireNumber: number;
  yearsToRetirement: number;
  retirementAge: number;
  monthlyExpenses: number;
  inflationRate?: number;
}

export const FIREResultPopup: React.FC<FIREResultPopupProps> = ({
  isOpen,
  onClose,
  fireNumber,
  yearsToRetirement,
  retirementAge,
  monthlyExpenses,
  inflationRate = 6
}) => {
  const navigate = useNavigate();
  const [includeInflation, setIncludeInflation] = useState(false); // Default: show WITHOUT inflation to avoid overwhelming users

  // Calculate both versions
  const fireNumberWithoutInflation = monthlyExpenses * 12 * 25; // Basic 25x rule
  const fireNumberWithInflation = fireNumber; // Already calculated with inflation

  // Use toggled value
  const displayFireNumber = includeInflation ? fireNumberWithInflation : fireNumberWithoutInflation;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-emerald-500">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-6 md:p-8 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4"
                  >
                    <Rocket className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                    Your FIRE Number
                  </h2>
                  <p className="text-emerald-100 text-lg">Here's your path to financial freedom</p>
                </div>
              </div>

              {/* Results Content */}
              <div className="p-6 md:p-8">
                {/* Toggle Control */}
                <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Include Inflation Adjustment?</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {includeInflation
                            ? `Showing realistic target with ${inflationRate}% annual inflation`
                            : "Showing today's value (without inflation)"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIncludeInflation(!includeInflation)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        includeInflation ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          includeInflation ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {!includeInflation && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-xs text-amber-900">
                        <strong>⚠️ Note:</strong> This is today's value. In {yearsToRetirement} years, you'll actually need {formatCurrency(fireNumberWithInflation)} due to inflation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Main FIRE Number */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border-2 border-emerald-300 mb-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-700 mb-2">
                      Your FIRE Number {includeInflation && '(Inflation-Adjusted)'}
                    </p>
                    <div className="text-5xl md:text-6xl font-black text-emerald-600 mb-3">
                      {formatCurrency(displayFireNumber)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      To retire at age {retirementAge}, you need to build a corpus of {formatCurrency(displayFireNumber)}
                    </p>
                    {includeInflation && (
                      <div className="inline-flex items-center gap-1 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-amber-900">
                          📊 Includes {inflationRate}% annual inflation
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <p className="text-sm font-bold text-gray-700">Years to Retirement</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{yearsToRetirement} years</p>
                    <p className="text-xs text-gray-600">Retire by age {retirementAge}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      <p className="text-sm font-bold text-gray-700">Monthly Expenses</p>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(monthlyExpenses)}</p>
                    <p className="text-xs text-gray-600">Current lifestyle cost</p>
                  </div>
                </div>

                {/* What This Means */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 text-white">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    What This Means For You
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>Once you reach <strong className="text-emerald-400">{formatCurrency(displayFireNumber)}</strong>, you can live off your investments forever using the 4% withdrawal rule</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>Your investments will generate <strong className="text-emerald-400">{formatCurrency(monthlyExpenses)}/month</strong> to cover {includeInflation ? "today's" : "all your"} expenses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>You'll have complete financial independence - work becomes optional, not mandatory</span>
                    </li>
                    {!includeInflation && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">⚠️</span>
                        <span className="text-amber-200">Remember: Due to inflation, prices will be higher in {yearsToRetirement} years. Consider the inflation-adjusted target for realistic planning.</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* FIREMap CTA */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center mb-4">
                  <div className="mb-4">
                    <Map className="w-12 h-12 mx-auto mb-3 text-white" />
                    <h3 className="text-2xl font-black mb-2">
                      Ready to Turn This Dream into Reality?
                    </h3>
                    <p className="text-emerald-100 text-sm">
                      FIREMap shows you the <strong>exact route and live directions</strong> to reach your FIRE destination
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
                    <p className="font-bold mb-3 text-lg">Get Your Personalized FIRE Roadmap:</p>
                    <ul className="space-y-2 text-sm text-left">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Exact monthly SIP amounts for each goal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Optimal asset allocation based on your risk profile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Live tracking with alerts if you go off-track</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Tax optimization to save ₹2+ lakhs annually</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>FREE expert consultation worth ₹5,000</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-bold text-lg py-6 shadow-xl group"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Your Financial Journey Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="text-xs text-emerald-100 mt-3">
                    🎁 Worth ₹9,999/year - <strong>100% FREE</strong> for first 5,000 users • Only 277 spots left
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Close and explore more
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
