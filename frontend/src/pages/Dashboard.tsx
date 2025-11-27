import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, Check } from 'lucide-react';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import FinancialRoadmap from '@/components/FinancialRoadmap';

type DashboardCard = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useAuthStore();
  const { financialData, fetchFinancialData } = useFinancialDataStore();
  const [isLoading, setIsLoading] = useState(true);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers to show in lakhs/crores
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 crore = 10,000,000
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 lakh = 100,000
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load financial data
  useEffect(() => {
    console.log("Dashboard: Data loading useEffect triggered.");
    if (user) {
      console.log("Dashboard: Effective user object:", JSON.stringify(user, null, 2));
      console.log("Dashboard: User ID:", user.id);
    } else {
      console.log("Dashboard: User object is null or undefined at this point.");
    }
    const loadData = async () => {
      if (user?.id) { // Only fetch if user.id is available
        try {
          setIsLoading(true);
          const userId = user.id;
          await fetchFinancialData(userId);
        } catch (error) {
          console.error("Error loading financial data for user:", userId, error);
          toast.error("Could not load your financial data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle the case where user.id is not yet available or user is not fully authenticated
        setIsLoading(false); // Stop loading if no user.id
        // Optionally, clear existing financial data if user logs out or ID changes to undefined
        // useFinancialDataStore.getState().clearFinancialData();
        // For now, just ensuring we don't fetch with 'anonymous' or undefined
      }
    };

    loadData();
  }, [user?.id, fetchFinancialData]); // Add user.id to dependency array and fetchFinancialData

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("There was an error logging out");
    }
  };

  // Dashboard cards configuration
  const dashboardCards: DashboardCard[] = [
    {
      title: "Enter Details",
      description: "Update your financial information",
      path: "/enter-details",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "FIRE Calculator",
      description: "Track your path to financial independence",
      path: "/fire-calculator",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      title: "Net Worth",
      description: "Visualize your assets and liabilities",
      path: "/net-worth",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: "bg-teal-50 text-teal-600 border-teal-100"
    },
    {
      title: "FIRE Planner",
      description: "Plan for goals with systematic investments",
      path: "/fire-planner",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      title: "Portfolio",
      description: "Optimize your investment allocation",
      path: "/portfolio",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      title: "Tax Planning",
      description: "Compare old and new tax regimes",
      path: "/tax-planning",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      title: "Download Report",
      description: "Get PDF summary of your financial plan",
      path: "/profile",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      color: "bg-red-50 text-red-600 border-red-100"
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Dashboard Header/Navigation - Now removed since we use global NavBar */}
      <main className="container mx-auto max-w-6xl py-8 px-4">
        {/* SEBI Compliance Badge */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500">
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-green-900">
                      COMPLIANT WITH SEBI REGULATIONS
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Educational Tool • No Advisory Services • Self-Service Platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {profile?.full_name || user?.email?.split('@')[0] || "User"}
          </h2>
          <p className="text-gray-600">
            Your financial dashboard at a glance. Plan smart, retire early.
          </p>
        </section>

        {/* Financial Summary Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : financialData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Monthly Income</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatCurrency(financialData.personalInfo.monthlySalary)}
              </div>
              <div className="text-xs text-gray-500">
                Annual: {formatCurrency(financialData.personalInfo.monthlySalary * 12)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Monthly Expenses</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatCurrency(financialData.personalInfo.monthlyExpenses)}
              </div>
              <div className="text-xs text-gray-500">
                Annual: {formatCurrency(financialData.personalInfo.monthlyExpenses * 12)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Net Worth</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatIndianCurrency(
                  (financialData.assetsLiabilities.realEstateValue +
                    financialData.assetsLiabilities.goldValue +
                    financialData.assetsLiabilities.mutualFundsValue +
                    financialData.assetsLiabilities.epfBalance +
                    financialData.assetsLiabilities.ppfBalance) -
                  (financialData.assetsLiabilities.homeLoan +
                    financialData.assetsLiabilities.carLoan +
                    financialData.assetsLiabilities.personalLoan +
                    financialData.assetsLiabilities.otherLoans)
                )}
              </div>
              <div className="text-xs text-gray-500">
                Total Assets: {formatIndianCurrency(
                  financialData.assetsLiabilities.realEstateValue +
                  financialData.assetsLiabilities.goldValue +
                  financialData.assetsLiabilities.mutualFundsValue +
                  financialData.assetsLiabilities.epfBalance +
                  financialData.assetsLiabilities.ppfBalance
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Savings Rate</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {Math.round(((financialData.personalInfo.monthlySalary - financialData.personalInfo.monthlyExpenses) / financialData.personalInfo.monthlySalary) * 100)}%
              </div>
              <div className="text-xs text-gray-500">
                Monthly Savings: {formatCurrency(financialData.personalInfo.monthlySalary - financialData.personalInfo.monthlyExpenses)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow mb-10">
            <p className="text-gray-600 mb-4">No financial data available yet.</p>
            <Button onClick={() => navigate('/enter-details')}>Enter Your Financial Details</Button>
          </div>
        )}

        {/* Quick Actions Grid - Main Dashboard Options */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              className={`${card.color} border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => handleNavigation(card.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">{card.title}</CardTitle>
                  <div className="p-2 rounded-full bg-white/80">
                    {card.icon}
                  </div>
                </div>
                <CardDescription className="text-gray-700">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-sm font-medium hover:bg-transparent hover:underline"
                >
                  Go to {card.title} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Road to Financial Freedom - FinancialRoadmap Component */}
        {financialData && Object.keys(financialData).length > 0 && (
          <div className="mb-10">
            <FinancialRoadmap financialData={financialData} />
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-10 mb-6">
          <Card className="bg-amber-50 border-amber-300">
            <CardContent className="py-3">
              <p className="text-xs text-amber-900 text-center">
                <strong>DISCLAIMER:</strong> FinEdge360 is an educational financial planning tool.
                We do NOT provide investment advice, recommend specific securities, or manage investments.
                All calculations are for educational purposes only. Please consult a{' '}
                <a
                  href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-700"
                >
                  SEBI Registered Investment Advisor
                </a>{' '}
                for personalized investment advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
