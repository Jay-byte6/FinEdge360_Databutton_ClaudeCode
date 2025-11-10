import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccessCodeForm } from "components/AccessCodeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFinancialDataStore from "utils/financialDataStore";
import useAuthStore from "utils/authStore";
import FinancialLadder from "@/components/FinancialLadder";
import RiskAssessmentQuiz, { RiskQuizAnswer } from "@/components/RiskAssessmentQuiz";
import PortfolioComparison from "@/components/PortfolioComparison";
import { performRiskAssessment, RiskAssessmentResult } from "@/utils/portfolioAnalysis";
import { Target, TrendingUp } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";

const PORTFOLIO_ACCESS_KEY = 'portfolio_access_granted';

const PortfolioPage: React.FC = () => {
  const { user } = useAuthStore();
  const { financialData } = useFinancialDataStore();
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

  const ACCESS_CODE = "123456";

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

  const handleAccessGranted = () => {
    setHasAccess(true);
    // Persist access to localStorage
    localStorage.setItem(PORTFOLIO_ACCESS_KEY, 'true');
  };

  // Check if user has filled financial data
  const hasFinancialData = financialData && Object.keys(financialData).length > 0;

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
        <div className="text-center p-4 border-t border-gray-200 mt-6">
          <p className="text-lg font-semibold text-gray-700">Unlock Your Personalized Portfolio Strategy!</p>
          <p className="text-sm text-gray-500">Enter the access code to view your suggested asset allocation based on your risk profile.</p>
        </div>
      </AccessCodeForm>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">AI-Powered Portfolio Analyzer</h1>
        <p className="text-lg text-gray-600">
          Discover your ideal asset mix with personalized risk assessment and portfolio recommendations
        </p>
      </header>

      {/* Missing Data Warning - Only show if no financial data */}
      {!hasFinancialData && (
        <Card className="mb-8 shadow-lg bg-yellow-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-yellow-700">Important: Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 mb-4">
              To see your personalized portfolio allocation, please complete your financial details first.
            </p>
            <Button onClick={() => navigate('/enter-details')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
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
            <Card className="mb-8 shadow-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-blue-700 font-medium">Loading your risk assessment...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Assessment Card */}
          {!isLoadingAnalysis && !showQuiz && !analysisGenerated && (
            <Card className="mb-8 shadow-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-2xl text-blue-900">Risk Assessment & Portfolio Analysis</CardTitle>
                    <p className="text-sm text-blue-700 mt-1">
                      Get personalized portfolio recommendations based on your financial profile and risk tolerance
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          1
                        </div>
                        <h3 className="font-semibold text-gray-800">Risk Assessment</h3>
                      </div>
                      <p className="text-sm text-gray-600">Answer 10 questions to determine your risk profile</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          2
                        </div>
                        <h3 className="font-semibold text-gray-800">Portfolio Analysis</h3>
                      </div>
                      <p className="text-sm text-gray-600">Compare current vs ideal allocation</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          3
                        </div>
                        <h3 className="font-semibold text-gray-800">Actionable Insights</h3>
                      </div>
                      <p className="text-sm text-gray-600">Receive educational recommendations</p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button onClick={handleStartAssessment} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                      <TrendingUp className="mr-2 h-5 w-5" />
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
            <div className="space-y-6">
              {/* Retake Quiz Button */}
              <div className="flex justify-end">
                <Button onClick={handleRetakeQuiz} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
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
        <div className="mt-8">
          <FinancialLadder financialData={financialData} />
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
