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

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuthStore();
  const { financialData, fetchFinancialData } = useFinancialDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
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
            const response = await fetch(`http://localhost:8001/routes/get-risk-assessment/${user.id}`);
            if (response.ok) {
              const data = await response.json();
              setRiskAnalysis(data);
            }
          } catch (error) {
            console.error("Error loading risk analysis:", error);
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

  // Calculate net worth
  const calculateNetWorth = () => {
    if (!financialData) return 0;

    const totalAssets =
      (financialData.assetsLiabilities?.realEstateValue || 0) +
      (financialData.assetsLiabilities?.goldValue || 0) +
      (financialData.assetsLiabilities?.mutualFundsValue || 0) +
      (financialData.assetsLiabilities?.epfBalance || 0) +
      (financialData.assetsLiabilities?.ppfBalance || 0);

    const totalLiabilities =
      (financialData.assetsLiabilities?.homeLoan || 0) +
      (financialData.assetsLiabilities?.carLoan || 0) +
      (financialData.assetsLiabilities?.personalLoan || 0) +
      (financialData.assetsLiabilities?.otherLoans || 0);

    return totalAssets - totalLiabilities;
  };

  // Calculate FIRE number (25x annual expenses)
  const calculateFIRENumber = () => {
    if (!financialData) return 0;
    return financialData.personalInfo.monthlyExpenses * 12 * 25;
  };

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
      await generateFinancialProfilePDF(financialData, riskAnalysis, user);
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

  const netWorth = calculateNetWorth();
  const fireNumber = calculateFIRENumber();
  const portfolioAllocation = calculatePortfolioAllocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-6xl py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h1>
          <p className="text-gray-600">View and manage your financial profile</p>
        </div>

        {/* User Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Email Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{user?.email || 'Not available'}</p>
            </CardContent>
          </Card>

          {/* Age Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Age</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">
                {financialData?.personalInfo?.age || '-'} years
              </p>
            </CardContent>
          </Card>

          {/* Monthly Salary Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg">Monthly Salary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">
                {financialData?.personalInfo?.monthlySalary
                  ? formatCurrency(financialData.personalInfo.monthlySalary)
                  : '-'}
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expenses Card */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Monthly Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">
                {financialData?.personalInfo?.monthlyExpenses
                  ? formatCurrency(financialData.personalInfo.monthlyExpenses)
                  : '-'}
              </p>
            </CardContent>
          </Card>

          {/* Net Worth Card */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Net Worth</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(netWorth)}
              </p>
            </CardContent>
          </Card>

          {/* FIRE Number Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">FIRE Number</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(fireNumber)}
              </p>
              <p className="text-xs text-gray-600 mt-1">25x annual expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Assessment Card */}
        {riskAnalysis && (
          <Card className="bg-white mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <CardTitle>Risk Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Card className="bg-white mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-600" />
                <CardTitle>Current Portfolio Allocation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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

        {/* Actions Section */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage your profile and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !financialData}
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download Financial Profile PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 border-red-200 mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full md:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
            <p className="text-sm text-red-600 mt-2">
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
