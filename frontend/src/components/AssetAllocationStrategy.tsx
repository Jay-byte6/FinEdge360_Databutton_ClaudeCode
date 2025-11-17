/**
 * Asset Allocation Strategy Component
 *
 * Displays ideal asset allocation based on risk profile and allows users
 * to customize their desired allocation for Short-Term, Mid-Term, and Long-Term goals.
 *
 * SEBI COMPLIANCE:
 * - Educational purposes only
 * - Asset class level guidance only
 * - No specific fund/stock recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, AlertTriangle, Save, RotateCcw } from 'lucide-react';
import useAuthStore from '@/utils/authStore';
import useFinancialDataStore from '@/utils/financialDataStore';
import { API_ENDPOINTS } from '@/config/api';
import {
  ASSET_CLASSES,
  IDEAL_ALLOCATIONS,
  type AssetClass,
  type GoalType,
  type RiskProfile,
  calculateWeightedCAGR
} from '@/constants/assetAllocation';

const GOAL_TYPES: GoalType[] = ['Short-Term', 'Mid-Term', 'Long-Term'];
const ASSET_CLASS_ORDER: AssetClass[] = ['equity', 'us_equity', 'debt', 'gold', 'reits', 'crypto', 'cash'];

interface AllocationState {
  [key: string]: { // goalType
    [key: string]: number; // assetClass: percentage
  };
}

export const AssetAllocationStrategy: React.FC = () => {
  const { user } = useAuthStore();
  const { financialData } = useFinancialDataStore();

  const [userRiskProfile, setUserRiskProfile] = useState<RiskProfile>('Moderate');
  const [userAllocations, setUserAllocations] = useState<AllocationState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user's risk profile from financial data
  useEffect(() => {
    if (financialData?.riskAppetite?.riskType) {
      const riskType = financialData.riskAppetite.riskType;
      if (riskType === 'Conservative' || riskType === 'Moderate' || riskType === 'Aggressive') {
        setUserRiskProfile(riskType);
      }
    }
  }, [financialData]);

  // Get ideal allocations based on risk profile
  const idealAllocations = IDEAL_ALLOCATIONS[userRiskProfile] || IDEAL_ALLOCATIONS['Moderate'];

  // Initialize user allocations from ideal allocations
  useEffect(() => {
    loadUserAllocations();
  }, [user?.id]);

  const loadUserAllocations = async () => {
    if (!user?.id) return;

    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(API_ENDPOINTS.getAssetAllocation(user.id));

      if (!response.ok) {
        throw new Error(`Failed to load allocations: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.allocations && data.allocations.length > 0) {
        // Convert database format to component state format
        const loadedAllocations: AllocationState = {};

        data.allocations.forEach((alloc: any) => {
          loadedAllocations[alloc.goal_type] = {
            equity: alloc.equity_pct,
            us_equity: alloc.us_equity_pct,
            debt: alloc.debt_pct,
            gold: alloc.gold_pct,
            reits: alloc.reits_pct,
            crypto: alloc.crypto_pct,
            cash: alloc.cash_pct,
          };
        });

        setUserAllocations(loadedAllocations);
        console.log('[Asset Allocation] Loaded user allocations:', loadedAllocations);
      } else {
        // Initialize with ideal allocations if no saved data
        initializeWithIdealAllocations();
      }
    } catch (error) {
      console.error('[Asset Allocation] Error loading:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load allocations');
      // Initialize with ideal allocations on error
      initializeWithIdealAllocations();
    } finally {
      setLoading(false);
    }
  };

  const initializeWithIdealAllocations = () => {
    const initial: AllocationState = {};

    GOAL_TYPES.forEach(goalType => {
      initial[goalType] = { ...idealAllocations[goalType].allocations };
    });

    setUserAllocations(initial);
    console.log('[Asset Allocation] Initialized with ideal allocations');
  };

  const handleAllocationChange = (goalType: GoalType, assetClass: AssetClass, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));

    setUserAllocations(prev => ({
      ...prev,
      [goalType]: {
        ...prev[goalType],
        [assetClass]: clampedValue
      }
    }));

    // Clear success message when user makes changes
    setSaveSuccess(false);
  };

  const resetToIdeal = () => {
    initializeWithIdealAllocations();
    setSaveSuccess(false);
    setSaveError(null);
  };

  const getTotalAllocation = (goalType: GoalType): number => {
    if (!userAllocations[goalType]) return 0;

    return Object.values(userAllocations[goalType]).reduce((sum, val) => sum + val, 0);
  };

  const getCAGRRange = (goalType: GoalType): { min: number; max: number } => {
    if (!userAllocations[goalType]) return { min: 0, max: 0 };

    return calculateWeightedCAGR(userAllocations[goalType]);
  };

  const isValid = (goalType: GoalType): boolean => {
    return getTotalAllocation(goalType) === 100;
  };

  const allValid = (): boolean => {
    return GOAL_TYPES.every(goalType => isValid(goalType));
  };

  const getRiskMismatchWarning = (goalType: GoalType): string | null => {
    if (!userAllocations[goalType]) return null;

    const userAlloc = userAllocations[goalType];
    const idealAlloc = idealAllocations[goalType].allocations;

    // Check for significant deviations (>20% difference in equity allocation)
    const equityDiff = Math.abs((userAlloc.equity || 0) - (idealAlloc.equity || 0));

    if (equityDiff > 20) {
      if ((userAlloc.equity || 0) > (idealAlloc.equity || 0)) {
        return `⚠️ Your equity allocation is ${equityDiff}% higher than recommended for ${userRiskProfile} risk profile`;
      } else {
        return `⚠️ Your equity allocation is ${equityDiff}% lower than recommended for ${userRiskProfile} risk profile`;
      }
    }

    return null;
  };

  const saveAllocations = async () => {
    if (!user?.id) {
      setSaveError('User not logged in');
      return;
    }

    if (!allValid()) {
      setSaveError('Please ensure all goal types have exactly 100% total allocation');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Convert to API format
      const allocations = GOAL_TYPES.map(goalType => {
        const cagr = getCAGRRange(goalType);
        return {
          goal_type: goalType,
          equity_pct: userAllocations[goalType]?.equity || 0,
          us_equity_pct: userAllocations[goalType]?.us_equity || 0,
          debt_pct: userAllocations[goalType]?.debt || 0,
          gold_pct: userAllocations[goalType]?.gold || 0,
          reits_pct: userAllocations[goalType]?.reits || 0,
          crypto_pct: userAllocations[goalType]?.crypto || 0,
          cash_pct: userAllocations[goalType]?.cash || 0,
          expected_cagr_min: cagr.min,
          expected_cagr_max: cagr.max,
        };
      });

      const response = await fetch(API_ENDPOINTS.saveAssetAllocation, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          allocations
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save allocations');
      }

      const result = await response.json();
      console.log('[Asset Allocation] Saved successfully:', result);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (error) {
      console.error('[Asset Allocation] Error saving:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save allocations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading asset allocations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEBI Disclaimer */}
      <Alert className="border-blue-200 bg-blue-50">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong>Educational Purpose Only:</strong> This tool provides general asset allocation guidance
          at the asset class level. It does not recommend specific mutual funds, stocks, or securities.
          Please consult a SEBI-registered investment advisor for personalized advice.
        </AlertDescription>
      </Alert>

      {/* Load Error */}
      {loadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {/* Save Error */}
      {saveError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Save Success */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <InfoIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Asset allocations saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Current Risk Profile */}
      <div className="text-sm text-muted-foreground">
        Current Risk Profile: <span className="font-semibold text-foreground">{userRiskProfile}</span>
      </div>

      {/* Side-by-Side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Ideal Allocation (Read-Only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Ideal Allocation
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Recommended allocation based on your {userRiskProfile} risk profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Based on your risk profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Asset Class</th>
                    {GOAL_TYPES.map(goalType => (
                      <th key={goalType} className="text-center py-2 px-3 font-semibold">
                        {goalType.replace('-', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ASSET_CLASS_ORDER.map(assetClass => {
                    const assetInfo = ASSET_CLASSES[assetClass];
                    return (
                      <tr key={assetClass} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                {assetInfo.name}
                                <InfoIcon className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">{assetInfo.name}</p>
                                  <p className="text-xs">{assetInfo.description}</p>
                                  <p className="text-xs text-yellow-600">{assetInfo.riskWarning}</p>
                                  <p className="text-xs">Expected CAGR: {assetInfo.expectedCAGR.min}-{assetInfo.expectedCAGR.max}%</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        {GOAL_TYPES.map(goalType => (
                          <td key={`${assetClass}-${goalType}`} className="text-center py-2 px-3">
                            {idealAllocations[goalType].allocations[assetClass] || 0}%
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="border-t-2 font-semibold bg-muted/30">
                    <td className="py-2 px-3">TOTAL</td>
                    {GOAL_TYPES.map(goalType => {
                      const total = Object.values(idealAllocations[goalType].allocations).reduce((sum, val) => sum + val, 0);
                      return (
                        <td key={`total-${goalType}`} className="text-center py-2 px-3">
                          {total}%
                        </td>
                      );
                    })}
                  </tr>
                  {/* Expected CAGR Row */}
                  <tr className="border-t font-semibold bg-blue-50">
                    <td className="py-2 px-3">Expected CAGR</td>
                    {GOAL_TYPES.map(goalType => {
                      const cagr = calculateWeightedCAGR(idealAllocations[goalType].allocations);
                      return (
                        <td key={`cagr-${goalType}`} className="text-center py-2 px-3 text-blue-700">
                          {cagr.min.toFixed(1)}-{cagr.max.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Your Desired Allocation (Editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Your Desired Allocation
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Customize your allocation. Each column must total 100%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Customize your allocation (each column must total 100%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Asset Class</th>
                    {GOAL_TYPES.map(goalType => (
                      <th key={goalType} className="text-center py-2 px-3 font-semibold">
                        {goalType.replace('-', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ASSET_CLASS_ORDER.map(assetClass => {
                    const assetInfo = ASSET_CLASSES[assetClass];
                    return (
                      <tr key={assetClass} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                {assetInfo.name}
                                <InfoIcon className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">{assetInfo.name}</p>
                                  <p className="text-xs">{assetInfo.description}</p>
                                  <p className="text-xs text-yellow-600">{assetInfo.riskWarning}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        {GOAL_TYPES.map(goalType => (
                          <td key={`${assetClass}-${goalType}`} className="text-center py-2 px-3">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={userAllocations[goalType]?.[assetClass] || 0}
                              onChange={(e) => handleAllocationChange(goalType, assetClass, e.target.value)}
                              className="w-16 text-center h-8"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {/* Total Row with Validation */}
                  <tr className="border-t-2 font-semibold bg-muted/30">
                    <td className="py-2 px-3">TOTAL</td>
                    {GOAL_TYPES.map(goalType => {
                      const total = getTotalAllocation(goalType);
                      const valid = total === 100;
                      return (
                        <td key={`total-${goalType}`} className={`text-center py-2 px-3 ${valid ? 'text-green-600' : 'text-red-600'}`}>
                          {total}%
                        </td>
                      );
                    })}
                  </tr>
                  {/* Expected CAGR Row */}
                  <tr className="border-t font-semibold bg-blue-50">
                    <td className="py-2 px-3">Expected CAGR</td>
                    {GOAL_TYPES.map(goalType => {
                      const cagr = getCAGRRange(goalType);
                      return (
                        <td key={`cagr-${goalType}`} className="text-center py-2 px-3 text-blue-700">
                          {cagr.min.toFixed(1)}-{cagr.max.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Validation Messages */}
            <div className="mt-4 space-y-2">
              {GOAL_TYPES.map(goalType => {
                const total = getTotalAllocation(goalType);
                const riskWarning = getRiskMismatchWarning(goalType);

                return (
                  <div key={goalType}>
                    {total !== 100 && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {goalType}: Total is {total}% (must be 100%)
                        </AlertDescription>
                      </Alert>
                    )}
                    {riskWarning && total === 100 && (
                      <Alert className="py-2 border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-xs text-yellow-900">
                          {riskWarning}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={saveAllocations}
                disabled={!allValid() || saving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Allocations'}
              </Button>
              <Button
                onClick={resetToIdeal}
                variant="outline"
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Ideal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational Notes */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-sm">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Short-Term Goals (0-3 years):</strong> Focus on capital preservation with higher allocation to debt and cash</li>
            <li><strong>Mid-Term Goals (3-7 years):</strong> Balanced approach between growth and stability</li>
            <li><strong>Long-Term Goals (7+ years):</strong> Higher equity exposure for wealth creation</li>
            <li><strong>Rebalancing:</strong> Review and rebalance your portfolio annually or when allocation drifts by more than 5%</li>
            <li><strong>Risk Tolerance:</strong> Your allocation should match your risk tolerance and investment horizon</li>
            <li><strong>Crypto Warning:</strong> Cryptocurrency is highly speculative. Only allocate funds you can afford to lose completely</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAllocationStrategy;
