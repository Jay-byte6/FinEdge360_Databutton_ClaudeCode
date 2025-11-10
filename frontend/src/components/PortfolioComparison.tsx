import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RiskAssessmentResult } from '../utils/portfolioAnalysis';
import { Lightbulb, TrendingUp, AlertCircle, MousePointerClick } from 'lucide-react';
import AssetAllocationDetailModal from './AssetAllocationDetailModal';
import { Assets } from '../utils/formSchema';

interface PortfolioComparisonProps {
  analysis: RiskAssessmentResult;
  userAssets?: Assets;
  totalAssetValue?: number;
}

const COLORS = {
  Equity: '#0088FE',
  Debt: '#00C49F',
  Gold: '#FFBB28',
  REITs: '#FF8042',
  Cash: '#AA336A',
  Alternatives: '#FF8042',
};

const PortfolioComparison: React.FC<PortfolioComparisonProps> = ({ analysis, userAssets, totalAssetValue = 0 }) => {
  const [selectedAssetClass, setSelectedAssetClass] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssetClassClick = (assetClass: string) => {
    if (userAssets && totalAssetValue > 0) {
      setSelectedAssetClass(assetClass);
      setIsModalOpen(true);
    }
  };
  // Prepare data for comparison chart
  const comparisonData = Object.keys(analysis.idealPortfolio).map(key => ({
    category: key,
    current: analysis.currentPortfolio[key as keyof typeof analysis.currentPortfolio],
    ideal: analysis.idealPortfolio[key as keyof typeof analysis.idealPortfolio],
  }));

  // Prepare data for pie charts
  const currentPieData = Object.entries(analysis.currentPortfolio)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const idealPieData = Object.entries(analysis.idealPortfolio)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // Risk score color
  const getRiskScoreColor = () => {
    if (analysis.riskScore <= 20) return 'text-green-600 bg-green-50';
    if (analysis.riskScore <= 35) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getRiskScoreBorderColor = () => {
    if (analysis.riskScore <= 20) return 'border-green-300';
    if (analysis.riskScore <= 35) return 'border-blue-300';
    return 'border-orange-300';
  };

  return (
    <div className="space-y-6">
      {/* Risk Score Summary */}
      <Card className={`shadow-lg border-2 ${getRiskScoreBorderColor()}`}>
        <CardHeader className={getRiskScoreColor()}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Risk Profile</CardTitle>
              <p className="text-sm mt-1 opacity-80">Based on your financial situation and goals</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{analysis.riskScore}</div>
              <div className="text-sm font-semibold">{analysis.riskType}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Summary</p>
                <p className="text-sm text-gray-600 mt-1">{analysis.summary}</p>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">{analysis.encouragement}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Comparison Charts */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Portfolio Allocation: Current vs Ideal</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Compare your current investment allocation with the recommended allocation for your risk profile
          </p>
        </CardHeader>
        <CardContent>
          {/* Bar Chart Comparison */}
          <div className="h-[400px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis label={{ value: 'Allocation (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Bar dataKey="current" fill="#8884d8" name="Your Current Portfolio" />
                <Bar dataKey="ideal" fill="#82ca9d" name="Recommended Portfolio" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Charts Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Current Portfolio Pie */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Current Portfolio</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ideal Portfolio Pie */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Recommended Portfolio</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={idealPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {idealPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Differences Breakdown */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Portfolio Adjustments Needed
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {userAssets && totalAssetValue > 0
              ? "Click on any asset class to see your detailed holdings"
              : "How your current allocation differs from the recommended allocation"}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(analysis.difference).map(([category, diff]) => {
              const isPositive = diff.startsWith('+');
              const isNeutral = diff === '0%';
              const currentPercentage = analysis.currentPortfolio[category as keyof typeof analysis.currentPortfolio] || 0;
              const idealPercentage = analysis.idealPortfolio[category as keyof typeof analysis.idealPortfolio] || 0;
              const isClickable = userAssets && totalAssetValue > 0;

              return (
                <div
                  key={category}
                  onClick={() => isClickable && handleAssetClassClick(category)}
                  className={`p-4 rounded-lg border-2 ${
                    isNeutral
                      ? 'bg-gray-50 border-gray-300'
                      : isPositive
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  } ${isClickable ? 'cursor-pointer hover:shadow-lg transition-all hover:scale-105' : ''}`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 mb-1">
                      {category}
                      {isClickable && <MousePointerClick className="h-3 w-3" />}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isNeutral ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {diff}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {isNeutral ? 'On track' : isPositive ? 'Increase' : 'Decrease'}
                    </div>
                    {isClickable && (
                      <div className="text-xs text-blue-600 mt-2 font-medium">Click for details</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Positive (+) indicates you should increase allocation, negative (-) indicates you should decrease allocation to align with your risk profile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Educational Insights */}
      <Card className="shadow-lg border-2 border-yellow-200">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <Lightbulb className="h-5 w-5" />
            Educational Insights
          </CardTitle>
          <p className="text-sm text-yellow-800 mt-1">
            SEBI-compliant educational guidance (not financial advice)
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {analysis.educationalInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-sm flex-1">{insight}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 italic">
              <strong>Disclaimer:</strong> This is educational information only and not financial advice.
              The recommendations are based on standard Indian risk profiling models (SEBI/AMFI aligned).
              Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation Detail Modal */}
      {selectedAssetClass && userAssets && (
        <AssetAllocationDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assetClass={selectedAssetClass}
          currentPercentage={analysis.currentPortfolio[selectedAssetClass as keyof typeof analysis.currentPortfolio] || 0}
          idealPercentage={analysis.idealPortfolio[selectedAssetClass as keyof typeof analysis.idealPortfolio] || 0}
          userAssets={userAssets}
          totalAssetValue={totalAssetValue}
        />
      )}
    </div>
  );
};

export default PortfolioComparison;
