import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight, Lock } from 'lucide-react';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';
import { calculatePremiumNewFIRE } from '../utils/financialCalculations';

interface PremiumNewFIRECardProps {
  financialData: any;
  isPremium: boolean;
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

export const PremiumNewFIRECard: React.FC<PremiumNewFIRECardProps> = ({
  financialData,
  isPremium
}) => {
  const navigate = useNavigate();

  if (!financialData) return null;

  // Calculate Premium NEW FIRE values
  const retirementAge = 60;
  const expectedCAGR = 0.12; // 12% default CAGR
  const retirementGoalData = financialData?.goals?.longTermGoals?.find((g: any) =>
    g.name?.toLowerCase().includes('retirement') || g.name?.toLowerCase().includes('fire')
  );
  const retirementSIP = retirementGoalData?.monthlyInvestment || 45000;
  const stepUpPercentage = 10;
  const includeIlliquidAssets = true;

  const premiumFIRE = calculatePremiumNewFIRE(
    financialData,
    retirementAge,
    expectedCAGR,
    retirementSIP,
    stepUpPercentage,
    includeIlliquidAssets
  );

  return (
    <Card className="relative" id="premium-new-fire-overview">
      {!isPremium && <LockedFeatureOverlay featureName="Premium NEW FIRE Strategy" />}

      <CardHeader className={!isPremium ? 'filter blur-sm' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🚀 Premium NEW FIRE
            </span>
          </CardTitle>
          {isPremium && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/fire-planner?tab=sip-plan#premium-new-fire')}
              className="text-xs text-blue-600"
            >
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        <p className="text-sm md:text-base text-gray-600 mt-2 font-medium">
          Optimized strategy to achieve FIRE faster with smart portfolio allocation
        </p>
      </CardHeader>

      <CardContent className={`space-y-3 ${!isPremium ? 'filter blur-sm' : ''}`}>
        {/* Compact Overview */}
        <div
          onClick={() => isPremium && navigate('/fire-planner?tab=sip-plan#premium-new-fire')}
          className={`p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 ${
            isPremium ? 'cursor-pointer hover:shadow-md transition-all' : ''
          }`}
        >
          <div className="flex items-start gap-2 mb-2">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900">
                Achieve FIRE in {premiumFIRE.yearsToAchieve} years
              </p>
              <p className="text-xs text-green-700">at age {premiumFIRE.ageAtFIRE}</p>
              {premiumFIRE.canAchieveBefore60 && (
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  🎯 Retire {premiumFIRE.yearsBeforeRetirement} years BEFORE 60!
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-green-600">Target Corpus</p>
              <p className="font-bold text-green-900">{formatCurrency(premiumFIRE.targetCorpus)}</p>
            </div>
            <div>
              <p className="text-green-600">Monthly SIP</p>
              <p className="font-bold text-green-900">{formatCurrency(premiumFIRE.initialSIP)}</p>
            </div>
          </div>
        </div>

        {/* Strategy Note */}
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300">
          <p className="text-xs text-amber-900">
            <span className="font-bold">⭐ Strategy:</span> Optimized 60:40 equity-debt at {(expectedCAGR * 100).toFixed(0)}% CAGR
          </p>
        </div>

        {/* CTA */}
        {isPremium && (
          <Button
            onClick={() => navigate('/fire-planner?tab=sip-plan#premium-new-fire')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs"
            size="sm"
          >
            View Full Strategy <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
