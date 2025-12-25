import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PortfolioSyncStatus {
  sync_enabled: boolean;
  mutual_funds_value: number;
  manual_value: number;
  portfolio_value: number;
}

interface PortfolioSyncToggleProps {
  userId: string;
  onSyncChange?: () => void;
}

export const PortfolioSyncToggle = ({ userId, onSyncChange }: PortfolioSyncToggleProps) => {
  const [syncStatus, setSyncStatus] = useState<PortfolioSyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingToggleValue, setPendingToggleValue] = useState(false);

  const fetchSyncStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/portfolio-sync-status/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch sync status');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      toast.error('Failed to load sync status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSyncStatus();
    }
  }, [userId]);

  const handleToggleRequest = (checked: boolean) => {
    setPendingToggleValue(checked);
    setShowConfirmDialog(true);
  };

  const handleConfirmToggle = async () => {
    setShowConfirmDialog(false);
    setIsSwitching(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/toggle-portfolio-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          enabled: pendingToggleValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle sync');

      const result = await response.json();

      // Update local state
      setSyncStatus(result);

      // Show success message
      if (pendingToggleValue) {
        toast.success(`✅ Auto-sync enabled! Your net worth now shows ₹${result.mutual_funds_value.toLocaleString()} from portfolio.`);
      } else {
        toast.success(`✅ Auto-sync disabled. Net worth preserved at ₹${result.mutual_funds_value.toLocaleString()}.`);
      }

      // Notify parent component
      if (onSyncChange) {
        onSyncChange();
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
      toast.error('Failed to toggle sync. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading sync settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncStatus) {
    return null;
  }

  const valueDifference = syncStatus.portfolio_value - syncStatus.manual_value;
  const hasDifference = Math.abs(valueDifference) > 0.01;

  return (
    <>
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Portfolio-to-Net Worth Sync
              </CardTitle>
              <CardDescription className="mt-2">
                Automatically update your Net Worth mutual funds value from portfolio holdings
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${syncStatus.sync_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                {syncStatus.sync_enabled ? 'Auto-sync ON' : 'Manual Mode'}
              </span>
              <Switch
                checked={syncStatus.sync_enabled}
                onCheckedChange={handleToggleRequest}
                disabled={isSwitching}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manual Value */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Manual Entry</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{syncStatus.manual_value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Your last manual entry</p>
            </div>

            {/* Portfolio Value */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Portfolio Value</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{syncStatus.portfolio_value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">From portfolio holdings</p>
            </div>

            {/* Current Net Worth Value */}
            <div className={`rounded-lg p-4 border-2 ${syncStatus.sync_enabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Net Worth Shows</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{syncStatus.mutual_funds_value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {syncStatus.sync_enabled ? '✓ Auto-updated from portfolio' : '✓ Using manual entry'}
              </p>
            </div>
          </div>

          {/* Info Alert */}
          {hasDifference && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {valueDifference > 0 ? 'Portfolio value is higher' : 'Manual entry is higher'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Difference: ₹{Math.abs(valueDifference).toLocaleString()} (
                  {((Math.abs(valueDifference) / syncStatus.manual_value) * 100).toFixed(2)}%)
                </p>
                {!syncStatus.sync_enabled && (
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Enable auto-sync to automatically update your net worth with the latest portfolio value
                  </p>
                )}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">How it works:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ <strong>Auto-sync ON:</strong> Net worth updates automatically when portfolio NAV changes</li>
              <li>✓ <strong>Auto-sync OFF:</strong> You can edit mutual funds value manually in Net Worth page</li>
              <li>✓ Your manual entries are always preserved and can be restored anytime</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggleValue ? 'Enable Auto-Sync?' : 'Disable Auto-Sync?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggleValue ? (
                <div className="space-y-3">
                  <p>
                    Your Net Worth mutual funds value will be updated to <strong>₹{syncStatus.portfolio_value.toLocaleString()}</strong> (from portfolio holdings).
                  </p>
                  <p className="text-sm">
                    Your current manual entry (₹{syncStatus.manual_value.toLocaleString()}) will be preserved and can be restored by disabling auto-sync.
                  </p>
                  {hasDifference && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-900">
                        ⚠️ This will change your net worth by ₹{Math.abs(valueDifference).toLocaleString()} ({valueDifference > 0 ? '+' : ''}{((valueDifference / syncStatus.manual_value) * 100).toFixed(2)}%)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p>
                    Your Net Worth will keep the current value of <strong>₹{syncStatus.mutual_funds_value.toLocaleString()}</strong> as a manual entry.
                  </p>
                  <p className="text-sm">
                    You can edit this value manually in the Net Worth page. Portfolio changes will not affect your net worth until you re-enable auto-sync.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              {pendingToggleValue ? 'Enable Auto-Sync' : 'Disable Auto-Sync'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
