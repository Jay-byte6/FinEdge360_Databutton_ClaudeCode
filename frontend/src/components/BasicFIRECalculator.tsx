import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calculator, Flame, ArrowRight } from 'lucide-react';
import { FIREResultPopup } from './FIREResultPopup';

// Helper function to convert number to words (Indian system)
const convertToWords = (num: number): string => {
  if (num === 0) return 'Zero';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigit = (n: number): string => {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  let result = '';

  if (crore > 0) result += convertTwoDigit(crore) + ' Crore ';
  if (lakh > 0) result += convertTwoDigit(lakh) + ' Lakh ';
  if (thousand > 0) result += convertTwoDigit(thousand) + ' Thousand ';
  if (hundred > 0) result += units[hundred] + ' Hundred ';
  if (remainder > 0) result += convertTwoDigit(remainder);

  return result.trim();
};

export const BasicFIRECalculator: React.FC = () => {
  const [age, setAge] = useState<string>('');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState({
    fireNumber: 0,
    yearsToRetirement: 0,
    retirementAge: 0,
    inflationRate: 6
  });

  const handleCalculate = () => {
    const ageNum = parseInt(age);
    const expensesNum = parseInt(monthlyExpenses);

    if (!ageNum || !expensesNum || ageNum < 18 || ageNum > 70) {
      alert('Please enter valid age (18-70) and monthly expenses');
      return;
    }

    // Match FIRE Calculator page logic exactly
    const retirementAge = 60;
    const yearsToRetirement = retirementAge - ageNum;
    const inflationRate = 6; // 6% inflation (same as FIRE Calculator page)

    // Calculate inflation-adjusted FIRE number (same formula as FIRE Calculator page)
    const yearlyExpensesToday = expensesNum * 12;
    const inflationFactor = Math.pow(1 + (inflationRate / 100), yearsToRetirement);
    const yearlyExpensesRetirement = yearlyExpensesToday * inflationFactor;
    const fireNumber = yearlyExpensesRetirement * 25; // 4% withdrawal rule

    setCalculatedResults({
      fireNumber,
      yearsToRetirement,
      retirementAge,
      inflationRate
    });

    setShowResults(true);
  };

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Hook Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full mb-4 shadow-lg">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-lg">Find Your FIRE Number in 30 Seconds</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-gray-900">
                When Can <span className="text-emerald-600">YOU</span> Achieve Financial Freedom?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover your exact FIRE number and get a personalized roadmap to early retirement
              </p>
            </div>

            {/* Calculator Card */}
            <Card className="bg-white rounded-3xl shadow-2xl border-4 border-emerald-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Calculator className="w-8 h-8 text-white" />
                  <h3 className="text-2xl md:text-3xl font-black text-white">
                    Free FIRE Calculator
                  </h3>
                </div>
                <p className="text-emerald-100 text-sm">No signup required • Get instant results</p>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Age Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Your Current Age
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 35"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="text-lg h-14 border-2 border-gray-300 focus:border-emerald-500"
                      min="18"
                      max="70"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter age between 18-70</p>
                  </div>

                  {/* Monthly Expenses Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Monthly Expenses (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      className="text-lg h-14 border-2 border-gray-300 focus:border-emerald-500"
                      min="0"
                    />
                    {monthlyExpenses && parseInt(monthlyExpenses) > 0 && (
                      <p className="text-xs font-semibold text-emerald-700 mt-1">
                        {convertToWords(parseInt(monthlyExpenses))} Rupees
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Your monthly household expenses</p>
                  </div>
                </div>

                {/* Inflation Info */}
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-900">
                    <span className="font-bold">📊 Note:</span> Calculation includes <strong>6% annual inflation</strong> to show your FIRE number at retirement age 60. This matches our detailed FIRE Calculator for consistency.
                  </p>
                </div>

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  disabled={!age || !monthlyExpenses}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xl py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Calculator className="w-6 h-6 mr-3" />
                  Calculate My FIRE Number
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Trust Indicators */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600">✓</span>
                    <span>100% Free</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600">✓</span>
                    <span>No Signup Required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600">✓</span>
                    <span>Instant Results</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600">✓</span>
                    <span>Used by 5,000+ Investors</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* What is FIRE - Educational */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                <strong className="text-emerald-700">What is FIRE?</strong> Financial Independence, Retire Early -
                a movement where you save and invest aggressively to retire decades before the traditional retirement age.
                The "25x rule" states you need 25 times your annual expenses to retire safely.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Popup */}
      {showResults && (
        <FIREResultPopup
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          fireNumber={calculatedResults.fireNumber}
          yearsToRetirement={calculatedResults.yearsToRetirement}
          retirementAge={calculatedResults.retirementAge}
          monthlyExpenses={parseInt(monthlyExpenses)}
          inflationRate={calculatedResults.inflationRate}
        />
      )}
    </>
  );
};
