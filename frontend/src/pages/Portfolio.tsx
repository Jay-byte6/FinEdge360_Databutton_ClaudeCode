import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccessCodeForm } from "components/AccessCodeForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFinancialDataStore from "utils/financialDataStore";
import useAuthStore from "utils/authStore";
import usePortfolioStore from "utils/portfolioStore";
import FinancialLadder from "@/components/FinancialLadder";
import RiskAssessmentQuiz, { RiskQuizAnswer } from "@/components/RiskAssessmentQuiz";
import PortfolioComparison from "@/components/PortfolioComparison";
import { PortfolioUploadCard } from "@/components/PortfolioUploadCard";
import { PortfolioHoldingsTable } from "@/components/PortfolioHoldingsTable";
import { PortfolioSummaryCards } from "@/components/PortfolioSummaryCards";
import { PortfolioNetWorthSyncBanner } from "@/components/PortfolioNetWorthSyncBanner";
import { performRiskAssessment, RiskAssessmentResult } from "@/utils/portfolioAnalysis";
import { Target, TrendingUp, Flame, Wallet, Zap, Shield, Heart, Activity, AlertTriangle, Users, Upload, Plus, RefreshCw, Rocket } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { MilestoneCompletionCard } from "@/components/journey/MilestoneCompletionCard";
import { AddManualHoldingModal } from "@/components/AddManualHoldingModal";
import { EditHoldingModal } from "@/components/EditHoldingModal";
import { PortfolioHolding } from "@/types/portfolio";

const PORTFOLIO_ACCESS_KEY = 'portfolio_access_granted';

const PortfolioPage: React.FC = () => {
  const { user } = useAuthStore();
  const { financialData } = useFinancialDataStore();
  const { holdings, summary, fetchHoldings, isLoading: portfolioLoading } = usePortfolioStore();
  const navigate = useNavigate();

  // Check localStorage for persisted access
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem(PORTFOLIO_ACCESS_KEY) === 'true';
  });

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<RiskQuizAnswer[] | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAssessmentResult | null>(null);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [showUploadCard, setShowUploadCard] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [goals, setGoals] = useState<Array<{ id: string; goal_name: string }>>([]);
  const [lastManualRefresh, setLastManualRefresh] = useState<string | undefined>(undefined);

  const ACCESS_CODE = "FIREDEMO"; // Demo code for everyone to try

  // Load risk assessment from database on mount and when access is granted
  useEffect(() => {
    const loadRiskAssessment = async () => {
      if (!user || !user.id || !hasAccess) {
        setIsLoadingAnalysis(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.getRiskAssessment(user.id));

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setRiskAnalysis(data);
            setAnalysisGenerated(true);
          }
        }
      } catch (error) {
        console.error('Error loading risk assessment:', error);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    loadRiskAssessment();
  }, [user, hasAccess]);

  // Load goals function (reusable for refresh)
  const loadGoals = async () => {
    if (!user?.id || !hasAccess) {
      console.log('[Portfolio] Skipping loadGoals - userId:', user?.id, 'hasAccess:', hasAccess);
      return;
    }

    try {
      console.log('[Portfolio] Loading goals for dropdown...');
      console.log('[Portfolio] User ID:', user.id);
      console.log('[Portfolio] API URL:', `${API_ENDPOINTS.baseUrl}/routes/goal-investment-summary/${user.id}`);
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/goal-investment-summary/${user.id}`);
      console.log('[Portfolio] Response status:', response.status, response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('[Portfolio] Response data:', data);
        // Extract just goal_id and goal_name from the summaries
        const goalList = (data.goals || []).map((g: any) => ({
          id: g.goal_id,
          goal_name: g.goal_name
        }));
        setGoals(goalList);
        console.log(`[Portfolio] Loaded ${goalList.length} goals:`, goalList);
      } else {
        console.error('[Portfolio] Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('[Portfolio] Error response:', errorText);
      }
    } catch (error) {
      console.error('[Portfolio] Error loading goals:', error);
    }
  };

  // Load goals when user has access
  useEffect(() => {
    loadGoals();
  }, [user?.id, hasAccess]);

  // Load portfolio holdings when user has access
  useEffect(() => {
    if (user?.id && hasAccess) {
      fetchHoldings(user.id);
    }
  }, [user?.id, hasAccess, fetchHoldings]);

  const handleAccessGranted = () => {
    setHasAccess(true);
    // Persist access to localStorage
    localStorage.setItem(PORTFOLIO_ACCESS_KEY, 'true');
  };

  // Check if user has filled financial data
  const hasFinancialData = financialData && Object.keys(financialData).length > 0;

  // Handle refresh with NAV sync
  const handleRefreshData = async () => {
    if (!user?.id) {
      toast.error('User ID required to refresh data');
      return;
    }

    setIsRefreshing(true);
    try {
      // First, refresh NAV for all holdings
      const navResponse = await fetch(
        `${API_ENDPOINTS.baseUrl}/routes/refresh-portfolio-nav/${user.id}`,
        { method: 'POST' }
      );

      if (!navResponse.ok) {
        throw new Error('Failed to refresh NAV');
      }

      const navResult = await navResponse.json();
      console.log('[Portfolio] NAV refresh result:', navResult);

      // Show appropriate toast based on result
      if (navResult.failed_count > 0) {
        toast.warning(
          `Refreshed ${navResult.updated_count} of ${navResult.total_holdings} holdings. ${navResult.failed_count} failed.`,
          { duration: 5000 }
        );
      } else {
        toast.success(
          `Portfolio refreshed! Updated ${navResult.updated_count} holdings with latest NAV.`,
          { duration: 3000 }
        );
      }

      // Update last manual refresh timestamp for immediate UI update
      setLastManualRefresh(new Date().toISOString());

      // Then fetch updated holdings to refresh the UI
      await fetchHoldings(user.id);
    } catch (error) {
      console.error('[Portfolio] Refresh error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refresh portfolio data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save risk assessment to database
  const saveRiskAssessment = async (analysis: RiskAssessmentResult, answers: RiskQuizAnswer[] | null) => {
    if (!user || !user.id) {
      toast.error("Authentication required", {
        description: "Please log in to save your risk assessment.",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.saveRiskAssessment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          riskScore: analysis.riskScore,
          riskType: analysis.riskType,
          quizAnswers: answers,
          idealPortfolio: analysis.idealPortfolio,
          currentPortfolio: analysis.currentPortfolio,
          difference: analysis.difference,
          summary: analysis.summary,
          educationalInsights: analysis.educationalInsights,
          encouragement: analysis.encouragement,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save risk assessment');
      }

      toast.success("Assessment Saved!", {
        description: "Your risk assessment has been saved to your profile.",
      });
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      toast.error("Save Failed", {
        description: "Could not save your assessment. Please try again.",
      });
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (answers: RiskQuizAnswer[], totalScore: number) => {
    setQuizAnswers(answers);
    setShowQuiz(false);
    toast.success("Risk Assessment Completed!", {
      description: `Your risk score: ${totalScore}`,
    });

    // Generate analysis
    if (financialData) {
      const analysis = performRiskAssessment(answers, financialData);
      setRiskAnalysis(analysis);
      setAnalysisGenerated(true);
      // Save to database
      await saveRiskAssessment(analysis, answers);
    }
  };

  // Handle skipping quiz (use inferred risk score)
  const handleSkipQuiz = async () => {
    setShowQuiz(false);

    if (financialData) {
      const analysis = performRiskAssessment(null, financialData);
      setRiskAnalysis(analysis);
      setAnalysisGenerated(true);
      toast.info("Risk Score Inferred", {
        description: "We've estimated your risk profile based on your financial data.",
      });
      // Save to database
      await saveRiskAssessment(analysis, null);
    }
  };

  // Start risk assessment
  const handleStartAssessment = () => {
    if (!hasFinancialData) {
      toast.error("Financial Data Required", {
        description: "Please complete your financial details first on the 'Enter Details' page.",
      });
      return;
    }

    setShowQuiz(true);
    setAnalysisGenerated(false);
  };

  // Retake quiz
  const handleRetakeQuiz = async () => {
    if (!user || !user.id) {
      toast.error("Authentication required", {
        description: "Please log in to retake the assessment.",
      });
      return;
    }

    try {
      // Delete from database
      await fetch(API_ENDPOINTS.deleteRiskAssessment(user.id), {
        method: 'DELETE',
      });

      // Clear local state
      setShowQuiz(true);
      setQuizAnswers(null);
      setRiskAnalysis(null);
      setAnalysisGenerated(false);

      toast.info("Ready for New Assessment", {
        description: "Previous assessment cleared. Let's start fresh!",
      });
    } catch (error) {
      console.error('Error clearing previous assessment:', error);
      // Still allow retake even if delete fails
      setShowQuiz(true);
      setQuizAnswers(null);
      setRiskAnalysis(null);
      setAnalysisGenerated(false);
    }
  };

  if (!hasAccess) {
    return (
      <AccessCodeForm expectedCode={ACCESS_CODE} onAccessGranted={handleAccessGranted}>
        <div className="p-6 border-t border-gray-200 mt-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 Unlock PREMIUM Portfolio Analysis Features</h2>
            <p className="text-gray-600">Get exclusive premium features not available in free plan</p>
          </div>

          {/* Preview of PREMIUM-ONLY features */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500 relative">
              <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
              <h3 className="font-semibold text-purple-700 mb-1">🧠 Advanced Risk Profiling</h3>
              <p className="text-sm text-gray-600">10-question psychometric quiz with AI-powered personality analysis</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 relative">
              <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
              <h3 className="font-semibold text-blue-700 mb-1">📊 AI Portfolio Optimizer</h3>
              <p className="text-sm text-gray-600">Compare current vs ideal allocation with AI-generated rebalancing recommendations</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500 relative">
              <span className="absolute top-2 right-2 bg-green-600 text-white text-white text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
              <h3 className="font-semibold text-green-700 mb-1">💡 Personalized Rebalancing</h3>
              <p className="text-sm text-gray-600">Step-by-step action plan with specific fund recommendations for your portfolio</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500 relative">
              <span className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
              <h3 className="font-semibold text-orange-700 mb-1">🎯 Dynamic Asset Mix</h3>
              <p className="text-sm text-gray-600">Real-time asset allocation across Equity, Debt, Gold & Hybrid synced with your plan</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-pink-500 relative">
              <span className="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
              <h3 className="font-semibold text-pink-700 mb-1">📈 Visual Performance Insights</h3>
              <p className="text-sm text-gray-600">Interactive charts showing current vs ideal allocation with gap analysis</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500 relative">
              <span className="absolute top-2 right-2 bg-teal-600 text-white text-xs px-2 py-1 rounded-full font-bold">PREMIUM</span>
              <h3 className="font-semibold text-teal-700 mb-1">🔒 Insurance Gap Analysis</h3>
              <p className="text-sm text-gray-600">Identify missing coverage in Life, Health & Term insurance to protect your wealth</p>
            </div>
          </div>

          {/* Limited Time 100% Discount Offer */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <div className="inline-block bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide animate-pulse">
                  🔥 Limited Time
                </div>
                <div className="inline-block bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  💎 Limited Users
                </div>
                <div className="inline-block bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                  💯 100% OFF
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">🎁 Premium Access - 100% FREE!</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-black text-gray-400 line-through">₹3,999</span>
                <span className="text-3xl font-black text-green-600">FREE</span>
              </div>
              <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full mb-2">
                <span className="text-sm font-black">100% INSTANT DISCOUNT</span>
              </div>
              <p className="text-xs text-gray-600 font-semibold">Save ₹3,999 • Limited to early adopters only</p>
            </div>
          </div>

          {/* Demo Code Display */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">🎁 Try Demo Mode:</p>
                <p className="text-xs text-yellow-700">Use code <span className="font-mono font-bold text-lg">FIREDEMO</span> to explore sample analysis</p>
              </div>
              <div className="bg-yellow-200 px-4 py-2 rounded-md">
                <code className="text-2xl font-bold text-yellow-900">FIREDEMO</code>
              </div>
            </div>
          </div>

          {/* How to get access code */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-purple-800 mb-2">💎 Get Your Personal Access Code:</p>
            <ol className="text-xs text-purple-700 space-y-1 ml-4 list-decimal">
              <li>Subscribe to <strong>Premium (₹3,999 one-time)</strong> or <strong>Expert Plus (₹1,999/month)</strong></li>
              <li>Your unique access code will be sent to your email instantly</li>
              <li>Use the code to unlock all advanced features forever</li>
            </ol>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="mt-3 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              View Pricing Plans →
            </button>
          </div>

          {/* Contact & Support Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-center text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-700 mb-1">📧 Support</p>
                <a href="mailto:support@finedge360.com" className="text-blue-600 hover:underline">
                  support@finedge360.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">💬 Feedback</p>
                <a href="https://forms.gle/your-feedback-form" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Share Your Feedback
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">📱 Mobile App</p>
                <a href="https://your-app-link.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Download App (Coming Soon)
                </a>
              </div>
            </div>
          </div>
        </div>
      </AccessCodeForm>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Modern Header with Brand Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-950 py-8 md:py-12 px-6 md:px-8 rounded-3xl mb-8 shadow-2xl">
        {/* Decorative floating gradient orbs */}
        <div className="absolute top-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-56 md:w-80 h-56 md:h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <header className="relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
            AI-Powered Portfolio Analyzer
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-emerald-200 max-w-3xl mx-auto">
            Discover your ideal asset mix with personalized risk assessment and portfolio recommendations
          </p>
        </header>
      </div>

      {/* CAMS Portfolio Upload & Tracking - Show upload card or holdings */}
      {hasAccess && !portfolioLoading && (
        <div className="mb-8">
          {holdings.length === 0 || showUploadCard ? (
            <>
              {/* Back to Holdings Button - show only when re-uploading */}
              {holdings.length > 0 && showUploadCard && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowUploadCard(false)}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    ← Back to Holdings
                  </Button>
                </div>
              )}

              {/* Add Holding Manually Button - Available before CAMS upload */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="default"
                  className="w-full sm:w-auto h-10 sm:h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Holding Manually
                </Button>
              </div>

              <PortfolioUploadCard onUploadSuccess={() => setShowUploadCard(false)} />
            </>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mb-4">
                <Button
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                  variant="outline"
                  className="w-full sm:w-auto h-10 sm:h-9 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button
                  onClick={() => setShowUploadCard(true)}
                  variant="outline"
                  className="w-full sm:w-auto h-10 sm:h-9 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Re-upload Statement
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="default"
                  className="w-full sm:w-auto h-10 sm:h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Holding Manually
                </Button>
              </div>

              {/* Portfolio Summary and Holdings */}
              {summary && (
                <>
                  <PortfolioSummaryCards summary={summary} />

                  {/* Net Worth Sync Toggle - Simple Banner */}
                  {user?.id && (
                    <div className="mt-6">
                      <PortfolioNetWorthSyncBanner
                        userId={user.id}
                        onSyncChange={() => {
                          // Optionally refresh or show confirmation
                          console.log('[Portfolio] Sync status changed');
                        }}
                      />
                    </div>
                  )}

                  {/* No Goals Banner */}
                  {holdings.length > 0 && goals.length === 0 && (
                    <div className="mt-6 p-4 md:p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-1">
                            Track Your Investment Goals
                          </h4>
                          <p className="text-xs sm:text-sm text-blue-800 mb-3">
                            Create financial goals in the FIRE Planner page to track which holdings contribute to each goal. This helps you visualize your progress and maintain proper asset allocation.
                          </p>
                          <Button
                            onClick={() => navigate('/fire-planner')}
                            size="sm"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            Create Goals in FIRE Planner
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <PortfolioHoldingsTable
                      holdings={holdings}
                      userId={user?.id}
                      goals={goals}
                      lastRefreshedAt={lastManualRefresh}
                      onEdit={(holding) => setEditingHolding(holding)}
                      onDelete={(holdingId) => {
                        // Delete is handled internally by the table component
                        // Just refresh after deletion
                        setTimeout(() => {
                          if (user?.id) fetchHoldings(user.id);
                        }, 500);
                      }}
                      onRefresh={() => {
                        if (user?.id) {
                          fetchHoldings(user.id);
                          loadGoals(); // Refresh goals too for two-way sync
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Missing Data Warning - Only show if no financial data */}
      {!hasFinancialData && (
        <Card className="mb-6 md:mb-8 shadow-lg bg-yellow-50 border-yellow-300">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg text-yellow-700">Important: Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <p className="text-xs sm:text-sm text-yellow-600 mb-4">
              To see your personalized portfolio allocation, please complete your financial details first.
            </p>
            <Button
              onClick={() => navigate('/enter-details')}
              className="w-full sm:w-auto h-10 sm:h-9 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Go to Enter Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {hasFinancialData && (
        <>
          {/* Loading State */}
          {isLoadingAnalysis && (
            <Card className="mb-6 md:mb-8 shadow-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-4 md:p-6 py-8 md:py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                  <p className="text-sm sm:text-base text-emerald-700 font-medium">Loading your risk assessment...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Assessment Card */}
          {!isLoadingAnalysis && !showQuiz && !analysisGenerated && (
            <Card className="mb-6 md:mb-8 shadow-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-4 md:p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
                <div className="flex items-start sm:items-center gap-3">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">Risk Assessment & Portfolio Analysis</CardTitle>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                      Get personalized portfolio recommendations based on your financial profile and risk tolerance
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-white rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800">Risk Assessment</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Answer 10 questions to determine your risk profile</p>
                    </div>
                    <div className="p-3 md:p-4 bg-white rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800">Portfolio Analysis</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Compare current vs ideal allocation</p>
                    </div>
                    <div className="p-3 md:p-4 bg-white rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800">Actionable Insights</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Receive educational recommendations</p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleStartAssessment}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg h-12 sm:h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Start Risk Assessment
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-600 italic">
                    Takes about 2-3 minutes • SEBI-compliant educational guidance • Not financial advice
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment Quiz */}
          {showQuiz && (
            <div className="mb-8">
              <RiskAssessmentQuiz onComplete={handleQuizComplete} onSkip={handleSkipQuiz} />
            </div>
          )}

          {/* Portfolio Comparison & Analysis */}
          {analysisGenerated && riskAnalysis && (
            <div className="space-y-4 md:space-y-6">
              {/* Retake Quiz Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleRetakeQuiz}
                  variant="outline"
                  className="w-full sm:w-auto h-10 sm:h-9 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  Retake Risk Assessment
                </Button>
              </div>

              {/* Portfolio Comparison Component */}
              <PortfolioComparison
                analysis={riskAnalysis}
                userAssets={financialData?.assets}
                totalAssetValue={financialData?.assets ?
                  Object.values(financialData.assets.liquid || {}).reduce((sum: number, val) => sum + (Number(val) || 0), 0) +
                  Object.values(financialData.assets.illiquid || {}).reduce((sum: number, val) => sum + (Number(val) || 0), 0)
                  : 0
                }
              />
            </div>
          )}
        </>
      )}

      {/* Financial Ladder Component */}
      {financialData && Object.keys(financialData).length > 0 && (
        <div className="mt-8" id="financial-ladder">
          <FinancialLadder financialData={financialData} />
        </div>
      )}

      {/* PowerFIRE Tips - Savings Scenarios */}
      {financialData && Object.keys(financialData).length > 0 && (
        <div className="mt-6 md:mt-8" id="powerfire-tips">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 shadow-lg">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-orange-900 flex items-center gap-2">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
                🔥 PowerFIRE Tips: Accelerate Your FIRE Journey
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-orange-700">
                Smart savings scenarios to boost your path to Financial Independence
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Scenario 1: Increase Savings Rate */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    💰 Increase Your Savings Rate
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-700">
                      <strong>Current Monthly Savings:</strong> ₹{((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)).toLocaleString('en-IN')}
                    </p>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="font-semibold text-green-900">Save 20% more monthly (₹{(((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)) * 0.2).toLocaleString('en-IN')}):</p>
                      <ul className="mt-1 space-y-1 text-green-800">
                        <li>• <strong>5 years:</strong> ₹{((((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)) * 0.2) * ((Math.pow(1 + 0.12/12, 5*12) - 1) / (0.12/12))).toLocaleString('en-IN')}</li>
                        <li>• <strong>10 years:</strong> ₹{((((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)) * 0.2) * ((Math.pow(1 + 0.12/12, 10*12) - 1) / (0.12/12))).toLocaleString('en-IN')}</li>
                        <li>• <strong>15 years:</strong> ₹{((((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)) * 0.2) * ((Math.pow(1 + 0.12/12, 15*12) - 1) / (0.12/12))).toLocaleString('en-IN')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Scenario 2: Tax Optimization */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    📈 Optimize Tax Savings (₹1.5L under 80C)
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-700">
                      <strong>Potential annual tax savings:</strong> ₹45,000
                    </p>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="font-semibold text-blue-900">Invest tax savings @ 12% return:</p>
                      <p className="text-2xl font-bold text-blue-600 my-1">
                        ₹45,000/year
                      </p>
                      <p className="text-blue-800 text-xs mt-1">
                        Over 10 years: <strong>₹{(45000 * ((Math.pow(1 + 0.12, 10) - 1) / 0.12)).toLocaleString('en-IN')}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scenario 3: Expense Reduction */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    💳 Cut Expenses by 10%
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-700">
                      <strong>Scenario:</strong> Reduce monthly expenses by just 10%
                    </p>
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <p className="font-semibold text-purple-900">Extra savings per month:</p>
                      <p className="text-2xl font-bold text-purple-600 my-1">
                        ₹{((financialData?.personalInfo?.monthlyExpenses || 0) * 0.1).toLocaleString('en-IN')} /mo
                      </p>
                      <p className="text-purple-800 text-xs">
                        Invested @ 12% for 10 years: <strong>₹{((financialData?.personalInfo?.monthlyExpenses || 0) * 0.1 * ((Math.pow(1 + 0.12/12, 10*12) - 1) / (0.12/12))).toLocaleString('en-IN')}</strong>
                      </p>
                      <p className="text-purple-800 text-xs mt-1">
                        <strong>Impact on FIRE:</strong> Lowers your FIRE number by ₹{(((financialData?.personalInfo?.monthlyExpenses || 0) * 0.1) * 12 * 25).toLocaleString('en-IN')}!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scenario 4: Side Hustle */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    ⚡ Start a Side Hustle (₹10K/mo)
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-700">
                      <strong>Scenario:</strong> Earn extra ₹10,000/month
                    </p>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="font-semibold text-amber-900">Annual side income:</p>
                      <p className="text-2xl font-bold text-amber-600 my-1">₹1,20,000 /year</p>
                      <p className="text-amber-800 text-xs">
                        Invested @ 12% for 5 years: <strong>₹{(10000 * ((Math.pow(1 + 0.12/12, 5*12) - 1) / (0.12/12))).toLocaleString('en-IN')}</strong>
                      </p>
                      <p className="text-amber-800 text-xs mt-1">
                        Invested @ 12% for 10 years: <strong>₹{(10000 * ((Math.pow(1 + 0.12/12, 10*12) - 1) / (0.12/12))).toLocaleString('en-IN')}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combined Power */}
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">🚀 Combine All 4 Strategies:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="font-semibold">Extra Monthly Investment:</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      ₹{(
                        (((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)) * 0.2) +
                        (45000 / 12) +
                        ((financialData?.personalInfo?.monthlyExpenses || 0) * 0.1) +
                        10000
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Corpus in 10 Years @ 12%:</p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      ₹{(
                        ((((financialData?.personalInfo?.monthlySalary || 0) - (financialData?.personalInfo?.monthlyExpenses || 0)) * 0.2) +
                        (45000 / 12) +
                        ((financialData?.personalInfo?.monthlyExpenses || 0) * 0.1) +
                        10000) * ((Math.pow(1 + 0.12/12, 10*12) - 1) / (0.12/12)) / 10000000
                      ).toFixed(2)}Cr 🎉
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm opacity-90">
                  ⏰ <strong>Reach FIRE ~5-7 years faster</strong> by implementing all these strategies!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Coverage Tips */}
      {financialData && Object.keys(financialData).length > 0 && (
        <div className="mt-6 md:mt-8" id="risk-coverage">
          <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 border-2 border-emerald-400 shadow-2xl">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-white flex items-center gap-2 font-bold">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                🛡️ Risk Coverage: Protect Your FIRE Journey
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-emerald-100">
                Essential insurance coverage to safeguard your financial independence plan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                {/* Life Insurance Coverage */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                  <h3 className="text-base sm:text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    1. Life Insurance (Term Plan)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>Recommended Coverage:</strong>
                      </p>
                      <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                        <p className="text-2xl font-bold text-emerald-900">
                          ₹{((financialData?.personalInfo?.monthlySalary || 0) * 12 * 15).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">15x your annual income</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        This ensures your family can maintain their lifestyle for 15+ years
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Why Term Insurance?</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>✅ <strong>10-15x cheaper</strong> than traditional plans</li>
                        <li>✅ <strong>Pure protection</strong>, no investment mixing</li>
                        <li>✅ <strong>High coverage</strong> at low premium</li>
                        <li>✅ <strong>Tax benefit</strong> under Section 80C (premium)</li>
                        <li>✅ <strong>Tax-free payout</strong> to nominees</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Avoid:</strong> Traditional endowment or money-back policies. They give poor returns (~4-6%) and low coverage.
                    </p>
                  </div>
                </div>

                {/* Health Insurance */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-green-200">
                  <h3 className="text-base sm:text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    2. Health Insurance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Base Coverage</p>
                      <p className="text-xl font-bold text-green-900">₹10-15 Lakh</p>
                      <p className="text-xs text-gray-600 mt-1">Family floater policy</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Super Top-up</p>
                      <p className="text-xl font-bold text-green-900">₹50 Lakh+</p>
                      <p className="text-xs text-gray-600 mt-1">After ₹5L deductible</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Parents Coverage</p>
                      <p className="text-xl font-bold text-green-900">₹5-10 Lakh</p>
                      <p className="text-xs text-gray-600 mt-1">Separate policy</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                      <p className="text-sm font-semibold text-emerald-900 mb-1">Tax Benefits:</p>
                      <ul className="text-xs text-emerald-800 space-y-1">
                        <li>• ₹25,000 deduction (self & family) under 80D</li>
                        <li>• ₹50,000 for senior citizens under 80D</li>
                        <li>• Additional ₹25,000 for parents' premium</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-1">Why Critical:</p>
                      <ul className="text-xs text-green-800 space-y-1">
                        <li>• Medical inflation ~14% per year</li>
                        <li>• ICU costs: ₹15K-50K per day</li>
                        <li>• Major surgery: ₹5-20 Lakh</li>
                        <li>• Protects your FIRE corpus</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Critical Illness & Disability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-orange-200">
                    <h3 className="text-sm sm:text-base font-bold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                      3. Critical Illness Cover
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-gray-600 mb-1">Recommended Coverage</p>
                        <p className="text-2xl font-bold text-orange-900">
                          ₹{((financialData?.personalInfo?.monthlySalary || 0) * 12 * 5).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">5x annual income</p>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Covers 30+ critical illnesses</li>
                        <li>• Lump sum payout on diagnosis</li>
                        <li>• Use for treatment & recovery</li>
                        <li>• Premium: ₹5K-15K/year</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-purple-200">
                    <h3 className="text-sm sm:text-base font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      4. Disability Insurance
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-purple-50 p-3 rounded border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">Monthly Replacement Income</p>
                        <p className="text-2xl font-bold text-purple-900">
                          ₹{((financialData?.personalInfo?.monthlySalary || 0) * 0.6).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">60% of current salary</p>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Pays if unable to work</li>
                        <li>• Short-term & long-term options</li>
                        <li>• Often included with term plans</li>
                        <li>• Protects income continuity</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Total Investment & Impact */}
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3">💰 Total Risk Coverage Investment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="opacity-90 mb-1">Term Insurance (₹1Cr)</p>
                      <p className="text-2xl font-bold">~₹12K/year</p>
                    </div>
                    <div>
                      <p className="opacity-90 mb-1">Health Insurance (₹15L+50L)</p>
                      <p className="text-2xl font-bold">~₹25K/year</p>
                    </div>
                    <div>
                      <p className="opacity-90 mb-1">Critical Illness</p>
                      <p className="text-2xl font-bold">~₹10K/year</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-base sm:text-lg font-semibold">Total Annual Investment:</span>
                      <span className="text-2xl sm:text-3xl font-bold">~₹47K/year</span>
                    </div>
                    <p className="text-xs sm:text-sm mt-2 opacity-90">
                      💡 <strong>Just ₹4,000/month</strong> to protect your entire financial future!
                    </p>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-green-300">
                  <h3 className="text-base sm:text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    ✅ Action Checklist
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Get term insurance (15x income)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Buy base health insurance (₹15L)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Add super top-up (₹50L)</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Parents' health insurance</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Consider critical illness cover</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Review coverage annually</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm text-red-800">
                    ⚠️ <strong>Warning:</strong> Without adequate insurance, one medical emergency can wipe out years of FIRE savings.
                    Insurance is NOT an expense—it's the foundation of your financial plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Milestone 4 Completion Card */}
      {hasFinancialData && (
        <div className="mt-8">
          <MilestoneCompletionCard
            milestoneNumber={4}
            title="Complete Your Financial Health Check"
            completionCriteria={[
              {
                label: "Risk assessment quiz completed",
                checked: analysisGenerated && !!riskAnalysis,
                description: "Complete the 10-question risk assessment quiz to determine your investor profile"
              },
              {
                label: "Risk score calculated",
                checked: !!riskAnalysis?.riskScore,
                description: "Your risk tolerance score has been calculated based on your answers"
              },
              {
                label: "Portfolio recommendations generated",
                checked: !!riskAnalysis?.idealPortfolio,
                description: "Receive personalized asset allocation recommendations based on your risk profile"
              },
              {
                label: "Risk profile understood",
                checked: !!riskAnalysis?.riskType,
                description: "Understand your risk category (Conservative, Moderate, or Aggressive)"
              }
            ]}
            xpReward={250}
            benefits={[
              "🎯 Know your exact investor personality",
              "📊 Get personalized portfolio allocation",
              "💡 Understand risk vs returns for your profile",
              "🛡️ Make informed investment decisions",
              "📈 Align investments with your risk tolerance"
            ]}
            nextSteps={[
              "Review your risk assessment results",
              "Compare your current portfolio with ideal allocation",
              "Note the gaps and rebalancing recommendations",
              "Proceed to implement portfolio adjustments"
            ]}
            helpResources={{
              guide: "https://www.investopedia.com/terms/r/risktolerance.asp",
              tutorial: "https://youtu.be/risk-assessment-tutorial"
            }}
            onComplete={() => {
              toast.success('Milestone 4 completed! Your risk profile is now established.');
            }}
          />
        </div>
      )}

      {/* Manual Entry Modals */}
      <AddManualHoldingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        userId={user?.id || ''}
        onSuccess={() => {
          if (user?.id) {
            fetchHoldings(user.id);
          }
          setShowAddModal(false);
        }}
      />

      {editingHolding && (
        <EditHoldingModal
          isOpen={!!editingHolding}
          onClose={() => setEditingHolding(null)}
          holding={editingHolding}
          onSuccess={() => {
            if (user?.id) {
              fetchHoldings(user.id);
            }
            setEditingHolding(null);
          }}
        />
      )}
    </div>
  );
};

export default PortfolioPage;
