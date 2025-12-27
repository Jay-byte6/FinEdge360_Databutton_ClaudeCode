import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User, Mail, Calendar, DollarSign, TrendingUp, TrendingDown,
  Target, PieChart, Download, Shield, AlertTriangle, Trash2
} from 'lucide-react';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';
import { generateFinancialProfilePDF } from '../utils/pdfExport';
import { API_ENDPOINTS } from '@/config/api';
import { getFinancialMetrics, calculateCoastFIRE, calculateConservativeFIRE, calculatePremiumNewFIRE } from '../utils/financialCalculations';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuthStore();
  const { financialData, fetchFinancialData } = useFinancialDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [assetAllocations, setAssetAllocations] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load financial data and risk analysis
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          await fetchFinancialData(user.id);

          // Fetch risk analysis
          try {
            const response = await fetch(API_ENDPOINTS.getRiskAssessment(user.id));
            if (response.ok) {
              const data = await response.json();
              setRiskAnalysis(data);
            }
          } catch (error) {
            console.error("Error loading risk analysis:", error);
          }

          // Fetch asset allocations
          try {
            const response = await fetch(API_ENDPOINTS.getAssetAllocation(user.id));
            if (response.ok) {
              const data = await response.json();
              setAssetAllocations(data);
            }
          } catch (error) {
            console.error("Error loading asset allocations:", error);
          }
        } catch (error) {
          console.error("Error loading data:", error);
          toast.error("Could not load your profile data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [user?.id, fetchFinancialData]);

  // Use centralized calculations for consistency across ALL pages
  const metrics = getFinancialMetrics(financialData);

  // Calculate current portfolio allocation
  const calculatePortfolioAllocation = () => {
    if (!financialData?.assets) return null;

    const equity =
      (financialData.assets.liquid?.domestic_stock_market || 0) +
      (financialData.assets.liquid?.domestic_equity_mutual_funds || 0) +
      (financialData.assets.liquid?.us_equity || 0);

    const debt =
      (financialData.assets.liquid?.fixed_deposit || 0) +
      (financialData.assets.liquid?.debt_funds || 0) +
      (financialData.assets.illiquid?.epf_ppf_vpf || 0);

    const gold =
      (financialData.assets.illiquid?.jewellery || 0) +
      (financialData.assets.illiquid?.sgb || 0) +
      (financialData.assets.liquid?.gold_etf_digital_gold || 0);

    const reits = financialData.assets.liquid?.reits || 0;
    const cash = financialData.assets.liquid?.liquid_savings_cash || 0;

    const total = equity + debt + gold + reits + cash;
    if (total === 0) return null;

    return {
      Equity: ((equity / total) * 100).toFixed(1),
      Debt: ((debt / total) * 100).toFixed(1),
      Gold: ((gold / total) * 100).toFixed(1),
      REITs: ((reits / total) * 100).toFixed(1),
      Cash: ((cash / total) * 100).toFixed(1),
    };
  };

  // Handle PDF export
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateFinancialProfilePDF(financialData, riskAnalysis, user, assetAllocations);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Extract metrics from centralized calculations
  const { netWorth, basicFIRENumber, newFIRENumber, yearsToRetirement } = metrics;
  const portfolioAllocation = calculatePortfolioAllocation();

  // Calculate 3 FIRE scenarios
  const retirementAge = 60; // Default retirement age
  const coastFIRE = calculateCoastFIRE(financialData, retirementAge);
  const conservativeFIRE = calculateConservativeFIRE(financialData, retirementAge);

  // For Premium NEW FIRE, we need to get expected CAGR and SIP from user's allocation
  // TODO: Pull from actual asset allocation and goals
  const expectedCAGR = 0.10; // 10% from 60:40 equity:debt allocation
  const retirementSIP = 45000; // ₹45,000 from retirement goal
  const stepUpPercentage = 10; // 10% annual step-up
  const premiumFIRE = calculatePremiumNewFIRE(financialData, retirementAge, expectedCAGR, retirementSIP, stepUpPercentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-6xl py-6 md:py-8 px-4">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Your Profile</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage your financial profile</p>
        </div>

        {/* User Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Email Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3 p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 h-4 sm:h-5 sm:w-5 text-blue-600" />
                <CardTitle className="text-base sm:text-lg">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm sm:text-base text-gray-700">{user?.email || 'Not available'}</p>
            </CardContent>
          </Card>

          {/* Age Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3 p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 h-4 sm:h-5 sm:w-5 text-green-600" />
                <CardTitle className="text-base sm:text-lg">Age</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {financialData?.personalInfo?.age || '-'} years
              </p>
            </CardContent>
          </Card>

          {/* Monthly Salary Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3 p-4 md:p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 h-4 sm:h-5 sm:w-5 text-teal-600" />
                <CardTitle className="text-base sm:text-lg">Monthly Salary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {financialData?.personalInfo?.monthlySalary
                  ? formatCurrency(financialData.personalInfo.monthlySalary)
                  : '-'}
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expenses Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3 p-4 md:p-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 h-4 sm:h-5 sm:w-5 text-red-600" />
                <CardTitle className="text-base sm:text-lg">Monthly Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {financialData?.personalInfo?.monthlyExpenses
                  ? formatCurrency(financialData.personalInfo.monthlyExpenses)
                  : '-'}
              </p>
            </CardContent>
          </Card>

          {/* Net Worth Card */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader className="pb-3 p-4 md:p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 h-4 sm:h-5 sm:w-5 text-green-600" />
                <CardTitle className="text-base sm:text-lg">Net Worth</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-xl sm:text-2xl font-bold text-green-700">
                {formatCurrency(netWorth)}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* 3 FIRE Scenarios Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Your FIRE Journey Scenarios 🎯</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 md:mb-6">Three pathways to financial independence based on different strategies</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* FIRE #1: Coast FIRE - Retire Now */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg">
              <CardHeader className="pb-3 p-4 md:p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 h-4 sm:h-5 sm:w-5 text-orange-600" />
                  <CardTitle className="text-base sm:text-lg">🏖️ Coast FIRE</CardTitle>
                </div>
                <p className="text-xs sm:text-sm text-orange-700 mt-1">Retire NOW - Stop working today!</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Corpus Needed Now:</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatCurrency(coastFIRE.targetCorpus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Liquid Assets:</p>
                    <p className="text-xl font-semibold text-gray-800">
                      {formatCurrency(coastFIRE.currentNetWorth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gap to Fill:</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(coastFIRE.gap)}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-orange-200">
                    <p className="text-sm text-gray-600">Years to Achieve:</p>
                    <p className="text-xl font-bold text-orange-600">
                      {coastFIRE.yearsToAchieve} years
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Age at Coast FIRE: {coastFIRE.ageAtCoastFIRE}
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-orange-100 rounded-md border border-orange-200">
                    <p className="text-xs text-orange-800">
                      💡 Once you reach this amount in liquid investments, you can stop working!
                      Your expenses till 60 will be covered by 5% investment growth, keeping
                      illiquid assets intact.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FIRE #2: Conservative FIRE at 60 */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg">
              <CardHeader className="pb-3 p-4 md:p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 h-4 sm:h-5 sm:w-5 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">💼 Conservative FIRE</CardTitle>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">Traditional retirement at 60</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Target Corpus at 60:</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(conservativeFIRE.targetCorpus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Net Worth:</p>
                    <p className="text-xl font-semibold text-gray-800">
                      {formatCurrency(conservativeFIRE.currentNetWorth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected at Age 60:</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(conservativeFIRE.projectedCorpusAtRetirement)}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-gray-600">Can Achieve by 60?</p>
                    <p className={`text-xl font-bold ${conservativeFIRE.canAchieve ? 'text-green-600' : 'text-red-600'}`}>
                      {conservativeFIRE.canAchieve ? '✅ YES' : '❌ NO'}
                    </p>
                    {!conservativeFIRE.canAchieve && (
                      <p className="text-sm text-red-600 mt-1">
                        Shortfall: {formatCurrency(conservativeFIRE.shortfall)}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded-md border border-blue-200">
                    <p className="text-xs text-blue-800">
                      📊 Conservative strategy: 5% annual returns from FD/Debt funds with
                      ₹{(conservativeFIRE.monthlySavings / 1000).toFixed(0)}k monthly savings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FIRE #3: Premium NEW FIRE */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 relative shadow-lg">
              <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold z-10">PREMIUM</span>
              <CardHeader className="pb-3 p-4 md:p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 h-4 sm:h-5 sm:w-5 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">🚀 NEW FIRE</CardTitle>
                </div>
                <p className="text-xs sm:text-sm text-green-700 mt-1">Optimized portfolio strategy</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Target Corpus:</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(premiumFIRE.targetCorpus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected CAGR:</p>
                    <p className="text-xl font-semibold text-green-600">
                      {(premiumFIRE.expectedCAGR * 100).toFixed(0)}%
                      <span className="text-xs text-gray-500 ml-1">(from allocation)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Retirement SIP:</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ₹{(premiumFIRE.initialSIP / 1000).toFixed(0)}k
                      <span className="text-xs text-gray-500"> + {premiumFIRE.stepUpPercentage}% step-up</span>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-sm text-gray-600">Years to FIRE:</p>
                    <p className="text-3xl font-bold text-green-600">
                      {premiumFIRE.yearsToAchieve} years
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Age at FIRE: {premiumFIRE.ageAtFIRE}
                    </p>
                    {premiumFIRE.canAchieveBefore60 && (
                      <p className="text-sm font-bold text-green-600 mt-1">
                        ⚡ {premiumFIRE.yearsBeforeRetirement} years BEFORE 60!
                      </p>
                    )}
                  </div>
                  <div className="mt-3 p-2 bg-green-100 rounded-md border border-green-200">
                    <p className="text-xs text-green-800">
                      ✨ Retire early with optimized portfolio! Higher returns through
                      strategic asset allocation vs conservative approach.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Risk Assessment Card */}
        {riskAnalysis && (
          <Card className="bg-white mb-6 md:mb-8">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-4 h-4 sm:h-5 sm:w-5 text-purple-600" />
                <CardTitle className="text-lg sm:text-xl">Risk Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {riskAnalysis.riskScore}/50
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Risk Type</p>
                  <Badge
                    className={
                      riskAnalysis.riskType === 'Conservative'
                        ? 'bg-blue-100 text-blue-800'
                        : riskAnalysis.riskType === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {riskAnalysis.riskType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Allocation Card */}
        {portfolioAllocation && (
          <Card className="bg-white mb-6 md:mb-8">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 h-4 sm:h-5 sm:w-5 text-indigo-600" />
                <CardTitle className="text-lg sm:text-xl">Current Portfolio Allocation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3">
                {Object.entries(portfolioAllocation).map(([category, percentage]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-700">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Desired Asset Allocation Strategy */}
        {assetAllocations && assetAllocations.allocations && assetAllocations.allocations.length > 0 && (
          <Card className="bg-white mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle>Your Desired Asset Allocation Strategy</CardTitle>
              </div>
              <CardDescription>Your customized allocation for different goal types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assetAllocations.allocations.map((allocation: any, index: number) => (
                  <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">{allocation.goal_type}</h3>
                    <div className="space-y-2">
                      {allocation.equity_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Indian Equity</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${allocation.equity_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.equity_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.us_equity_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">US Equity</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-400 h-2 rounded-full"
                                style={{ width: `${allocation.us_equity_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.us_equity_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.debt_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Debt</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${allocation.debt_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.debt_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.gold_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Gold</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${allocation.gold_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.gold_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.reits_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">REITs</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${allocation.reits_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.reits_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.crypto_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Crypto</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${allocation.crypto_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.crypto_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.cash_pct > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Cash/Liquid</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gray-600 h-2 rounded-full"
                                style={{ width: `${allocation.cash_pct}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-800 w-12 text-right">
                              {allocation.cash_pct}%
                            </span>
                          </div>
                        </div>
                      )}
                      {allocation.expected_cagr_min && allocation.expected_cagr_max && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            Expected Returns: <span className="font-semibold text-green-600">
                              {allocation.expected_cagr_min}% - {allocation.expected_cagr_max}% CAGR
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Section */}
        <Card className="bg-white mb-6 md:mb-8">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg sm:text-xl">Actions</CardTitle>
            <CardDescription className="text-sm sm:text-base">Manage your profile and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !financialData}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download Financial Profile PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 border-red-200 mb-6 md:mb-8">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 h-4 sm:h-5 sm:w-5 text-red-600" />
              <CardTitle className="text-lg sm:text-xl text-red-800">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base text-red-700">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Delete Account
            </Button>
            <p className="text-xs sm:text-sm text-red-600 mt-2">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        {/* Delete Account Dialog */}
        <DeleteAccountDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        />
      </main>
    </div>
  );
}
