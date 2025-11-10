import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { assetClassifications, formatCurrency, formatNumber } from "../utils/assetClassification";
import { Assets } from "../utils/formSchema";

interface AssetAllocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetClass: string;
  currentPercentage: number;
  idealPercentage: number;
  userAssets: Assets;
  totalAssetValue: number;
}

export default function AssetAllocationDetailModal({
  isOpen,
  onClose,
  assetClass,
  currentPercentage,
  idealPercentage,
  userAssets,
  totalAssetValue
}: AssetAllocationDetailModalProps) {
  const classification = assetClassifications[assetClass];

  if (!classification) {
    return null;
  }

  // Calculate actual values for each asset in this class
  const assetBreakdown = classification.assets.map(asset => {
    const value = asset.category === 'liquid'
      ? (userAssets?.liquid?.[asset.field as keyof typeof userAssets.liquid] || 0)
      : (userAssets?.illiquid?.[asset.field as keyof typeof userAssets.illiquid] || 0);

    return {
      ...asset,
      value: Number(value) || 0
    };
  }).filter(a => a.value > 0); // Only show non-zero assets

  // Calculate total value in this class
  const totalClassValue = assetBreakdown.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate current value based on percentage
  const currentValue = (totalAssetValue * currentPercentage) / 100;
  const idealValue = (totalAssetValue * idealPercentage) / 100;
  const difference = currentPercentage - idealPercentage;

  const isOverweight = difference > 2; // More than 2% over
  const isUnderweight = difference < -2; // More than 2% under
  const isBalanced = !isOverweight && !isUnderweight;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: classification.color }}
            />
            {assetClass} Assets Breakdown
          </DialogTitle>
          <DialogDescription>
            {classification.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Current Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ color: classification.color }}>
                  {currentPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(currentValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Ideal Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-700">
                  {idealPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(idealValue)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Alert */}
          {isOverweight && (
            <Alert className="border-orange-200 bg-orange-50">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Overweight by {Math.abs(difference).toFixed(1)}%</AlertTitle>
              <AlertDescription className="text-orange-700">
                You have {formatCurrency(currentValue - idealValue)} more than recommended in {assetClass}.
                Consider rebalancing to reduce exposure.
              </AlertDescription>
            </Alert>
          )}

          {isUnderweight && (
            <Alert className="border-blue-200 bg-blue-50">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Underweight by {Math.abs(difference).toFixed(1)}%</AlertTitle>
              <AlertDescription className="text-blue-700">
                You need {formatCurrency(idealValue - currentValue)} more in {assetClass} to match your target allocation.
                Consider increasing investments in this class.
              </AlertDescription>
            </Alert>
          )}

          {isBalanced && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Well Balanced</AlertTitle>
              <AlertDescription className="text-green-700">
                Your {assetClass} allocation is close to the ideal target for your risk profile. Great job!
              </AlertDescription>
            </Alert>
          )}

          {/* Asset List */}
          {assetBreakdown.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-700">Your {assetClass} Investments</h3>
              </div>
              <div className="divide-y">
                {assetBreakdown.map((asset, idx) => {
                  const percentage = (asset.value / totalClassValue) * 100;
                  return (
                    <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{asset.displayName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {asset.category === 'liquid' ? 'Liquid Asset' : 'Illiquid Asset'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{formatNumber(asset.value)}</p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of {assetClass}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-gray-700">Total {assetClass} Value</span>
                  <span className="text-gray-900">₹{formatNumber(totalClassValue)}</span>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">
                  You don't have any investments in this {assetClass} category yet.
                </p>
                {isUnderweight && (
                  <p className="text-sm text-blue-600 mt-2">
                    Consider adding {formatCurrency(idealValue)} in {assetClass} investments to match your target allocation.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendation Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm text-blue-800">💡 Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2">
              {isOverweight && (
                <>
                  <p>To rebalance your portfolio:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Consider reducing {assetClass} by {formatCurrency(currentValue - idealValue)}</li>
                    <li>Redirect new investments to underweight categories</li>
                    <li>Review your {assetClass.toLowerCase()} holdings and consider profit booking</li>
                  </ul>
                </>
              )}
              {isUnderweight && (
                <>
                  <p>To achieve your target allocation:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Add approximately {formatCurrency(idealValue - currentValue)} to {assetClass}</li>
                    <li>Consider SIP (Systematic Investment Plan) for gradual allocation</li>
                    <li>Research suitable {assetClass.toLowerCase()} investment options</li>
                  </ul>
                </>
              )}
              {isBalanced && (
                <p>
                  Maintain this allocation through regular portfolio reviews. Continue with your current investment strategy.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
