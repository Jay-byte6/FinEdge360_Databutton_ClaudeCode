import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

interface NetWorthSyncToggleProps {
  userId: string;
  onSyncChange?: () => void;
}

interface SyncStatus {
  sync_enabled: boolean;
  mutual_funds_value: number;
  manual_value: number;
  portfolio_value: number;
}

export const NetWorthSyncToggle = ({ userId, onSyncChange }: NetWorthSyncToggleProps) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

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
    const valueDiff = syncStatus ? Math.abs(syncStatus.portfolio_value - syncStatus.manual_value) : 0;

    if (checked && valueDiff > 0) {
      const confirm = window.confirm(
        `Enable auto-sync?\n\nYour mutual funds value will change to ₹${syncStatus?.portfolio_value.toLocaleString()} (from portfolio).\n\nCurrent manual value: ₹${syncStatus?.manual_value.toLocaleString()}\nDifference: ₹${valueDiff.toLocaleString()}`
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

      if (checked) {
        toast.success(`✓ Auto-sync enabled - Net worth now shows ₹${result.mutual_funds_value.toLocaleString()} from portfolio`);
      } else {
        toast.success(`✓ Auto-sync disabled - You can now edit manually`);
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

  const hasDifference = Math.abs(syncStatus.portfolio_value - syncStatus.manual_value) > 0.01;

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Auto-sync from Portfolio
            </span>
            <Switch
              checked={syncStatus.sync_enabled}
              onCheckedChange={handleToggle}
              disabled={isSwitching}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          {syncStatus.sync_enabled ? (
            <p className="text-xs text-green-600 mt-0.5">
              ✓ Automatically updated from portfolio holdings
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">
              Manual entry mode - Edit value below
            </p>
          )}
        </div>
      </div>

      {hasDifference && !syncStatus.sync_enabled && (
        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>
            Portfolio: ₹{syncStatus.portfolio_value.toLocaleString()}
            (₹{Math.abs(syncStatus.portfolio_value - syncStatus.manual_value).toLocaleString()} different)
          </span>
        </div>
      )}
    </div>
  );
};
