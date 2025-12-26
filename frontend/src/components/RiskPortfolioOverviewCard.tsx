import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, TrendingUp } from 'lucide-react';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';
import { API_ENDPOINTS } from '@/config/api';

interface RiskPortfolioOverviewCardProps {
  financialData: any;
  isPremium: boolean;
  userId?: string;
}

export const RiskPortfolioOverviewCard: React.FC<RiskPortfolioOverviewCardProps> = ({
  financialData,
  isPremium,
  userId
}) => {
  const navigate = useNavigate();
  const [riskScore, setRiskScore] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch actual risk score from API
  useEffect(() => {
    const fetchRiskScore = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.getRiskAssessment(userId));
        if (response.ok) {
          const data = await response.json();
          if (data?.riskScore) {
            setRiskScore(data.riskScore);
          }
        }
      } catch (error) {
        console.error('Error fetching risk score:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskScore();
  }, [userId]);

  if (!financialData) return null;

  // Match Portfolio page thresholds exactly (from portfolioAnalysis.ts)
  const getRiskType = (score: number) => {
    if (score <= 20) return 'Conservative';
    if (score <= 35) return 'Moderate';
    return 'Aggressive';
  };

  const riskLevel = getRiskType(riskScore);
  const riskColor = riskLevel === 'Aggressive' ? 'text-orange-600' : riskLevel === 'Moderate' ? 'text-blue-600' : 'text-green-600';
  const riskBgColor = riskLevel === 'Aggressive' ? 'bg-orange-100' : riskLevel === 'Moderate' ? 'bg-blue-100' : 'bg-green-100';

  // Portfolio recommendations matching portfolioAnalysis.ts
  const getRecommendedAllocation = (type: string) => {
    if (type === 'Conservative') return { equity: 20, debt: 60 };
    if (type === 'Moderate') return { equity: 40, debt: 40 };
    return { equity: 70, debt: 20 }; // Aggressive
  };

  const allocation = getRecommendedAllocation(riskLevel);
  const recommendedEquity = allocation.equity;
  const recommendedDebt = allocation.debt;

  return (
    <Card className="relative" id="risk-portfolio-overview">
      {!isPremium && <LockedFeatureOverlay featureName="Risk & Portfolio Overview" />}

      <CardHeader className={!isPremium ? 'filter blur-sm' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              📊 Risk & Portfolio
            </span>
          </CardTitle>
          {isPremium && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/portfolio')}
              className="text-xs text-blue-600"
            >
              Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        <p className="text-sm md:text-base text-gray-600 mt-2 font-medium">
          Your risk profile and recommended asset mix
        </p>
      </CardHeader>

      <CardContent className={`space-y-3 ${!isPremium ? 'filter blur-sm' : ''}`}>
        {/* Risk Score */}
        <div
          onClick={() => isPremium && navigate('/portfolio')}
          className={`p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-indigo-700 mb-1">Your Risk Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-indigo-900">{riskScore}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${riskBgColor} ${riskColor}`}>
                    {riskLevel}
                  </span>
                </div>
              </div>
            <div className="relative w-16 h-16">
              {/* Circular progress indicator */}
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={riskLevel === 'Aggressive' ? '#ea580c' : riskLevel === 'Moderate' ? '#2563eb' : '#16a34a'}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(riskScore / 100) * 175.93} 175.93`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            </div>
          )}
        </div>

        {/* Recommended Portfolio */}
        <div
          onClick={() => isPremium && navigate('/fire-planner?tab=asset-allocation')}
          className={`p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-bold text-blue-900">Recommended Mix</p>
          </div>
          <div className="space-y-2">
            {/* Equity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-700">Equity</span>
                <span className="text-xs font-bold text-blue-900">{recommendedEquity}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  style={{ width: `${recommendedEquity}%` }}
                />
              </div>
            </div>
            {/* Debt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-700">Debt</span>
                <span className="text-xs font-bold text-blue-900">{recommendedDebt}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  style={{ width: `${recommendedDebt}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Action */}
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300">
          <p className="text-xs text-amber-900">
            <span className="font-bold">💡 Tip:</span> Based on your {riskLevel} profile,
            maintain {recommendedEquity}% equity & {recommendedDebt}% debt for optimal balance
          </p>
        </div>

        {/* CTA */}
        {isPremium && (
          <Button
            onClick={() => navigate('/portfolio')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs"
            size="sm"
          >
            Analyze Full Portfolio <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
