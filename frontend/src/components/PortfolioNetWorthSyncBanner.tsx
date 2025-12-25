import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import useFinancialDataStore from '@/utils/financialDataStore';

interface PortfolioNetWorthSyncBannerProps {
  userId: string;
  onSyncChange?: () => void;
}

interface SyncStatus {
  sync_enabled: boolean;
  mutual_funds_value: number;
  manual_value: number;
  portfolio_value: number;
}

export const PortfolioNetWorthSyncBanner = ({ userId, onSyncChange }: PortfolioNetWorthSyncBannerProps) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const { fetchFinancialData } = useFinancialDataStore();

  const fetchSyncStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/portfolio-sync-status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSyncStatus();
    }
  }, [userId]);

  const handleToggle = async (checked: boolean) => {
    if (!syncStatus) return;

    const valueDiff = Math.abs(syncStatus.portfolio_value - syncStatus.manual_value);

    if (checked && valueDiff > 0) {
      const confirm = window.confirm(
        `Enable sync to Net Worth?\n\n` +
        `Your Net Worth mutual funds value will update to:\n` +
        `₹${syncStatus.portfolio_value.toLocaleString()} (from portfolio)\n\n` +
        `Current manual value: ₹${syncStatus.manual_value.toLocaleString()}\n` +
        `Difference: ₹${valueDiff.toLocaleString()}\n\n` +
        `This will affect your FIRE calculations.`
      );
      if (!confirm) return;
    }

    setIsSwitching(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/toggle-portfolio-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, enabled: checked }),
      });

      if (!response.ok) throw new Error('Failed to toggle sync');

      const result = await response.json();
      setSyncStatus(result);

      // Immediately refresh financial data to update Net Worth page
      console.log('[PortfolioSync] Refreshing financial data for user:', userId);
      await fetchFinancialData(userId);

      if (checked) {
        toast.success(
          `✓ Sync enabled! Net Worth updated to ₹${result.mutual_funds_value.toLocaleString()}. Check Net Worth page.`,
          { duration: 5000 }
        );
      } else {
        toast.success(
          `✓ Sync disabled - Net Worth remains at ₹${result.mutual_funds_value.toLocaleString()}`,
          { duration: 4000 }
        );
      }

      if (onSyncChange) onSyncChange();
    } catch (error) {
      console.error('Error toggling sync:', error);
      toast.error('Failed to toggle sync');
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading || !syncStatus) {
    return null;
  }

  const hasDifference = Math.abs(syncStatus.portfolio_value - syncStatus.manual_value) > 1;

  return (
    <div className={`p-3 rounded-lg border ${syncStatus.sync_enabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-center justify-between">
        {/* Left: Toggle and Status */}
        <div className="flex items-center gap-3">
          <Switch
            checked={syncStatus.sync_enabled}
            onCheckedChange={handleToggle}
            disabled={isSwitching}
            className="data-[state=checked]:bg-green-500"
          />
          <div>
            <div className="flex items-center gap-2">
              {syncStatus.sync_enabled ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Syncing to Net Worth
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Not syncing to Net Worth
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {syncStatus.sync_enabled
                ? 'Net Worth mutual funds value auto-updates when you click "Refresh Data"'
                : 'Net Worth uses your manual entry - Portfolio changes won\'t affect it'}
            </p>
          </div>
        </div>

        {/* Right: Warning if values differ and sync is OFF */}
        {hasDifference && !syncStatus.sync_enabled && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium">Portfolio value differs</div>
              <div className="text-amber-600">
                Portfolio: ₹{syncStatus.portfolio_value.toLocaleString()} |
                Net Worth: ₹{syncStatus.manual_value.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
