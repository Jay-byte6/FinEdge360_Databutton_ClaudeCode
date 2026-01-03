/**
 * useAutomaticPortfolioRefresh - Auto-refresh portfolio NAV values
 * Ensures portfolio is always up-to-date without manual intervention
 */

import { useEffect, useRef } from 'react';
import usePortfolioStore from '@/utils/portfolioStore';
import { toast } from 'sonner';

interface AutoRefreshOptions {
  enabled?: boolean;
  refreshOnMount?: boolean;
  refreshInterval?: number; // in milliseconds
  onRefresh?: () => void;
}

export const useAutomaticPortfolioRefresh = (
  userId: string | undefined,
  options: AutoRefreshOptions = {}
) => {
  const {
    enabled = true,
    refreshOnMount = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    onRefresh
  } = options;

  const { fetchHoldings, summary } = usePortfolioStore();
  const lastRefreshRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Function to refresh portfolio NAV
  const refreshPortfolio = async (silent: boolean = false) => {
    if (!userId) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;

    // Prevent too frequent refreshes (min 30 seconds between calls)
    if (timeSinceLastRefresh < 30000) {
      console.log('[AutoRefresh] Skipping refresh - too soon since last refresh');
      return;
    }

    try {
      console.log('[AutoRefresh] Fetching latest portfolio NAV values...');

      if (!silent) {
        toast.info('Updating portfolio values...');
      }

      await fetchHoldings(userId);

      lastRefreshRef.current = now;

      if (!silent) {
        toast.success('Portfolio updated with latest NAV values');
      }

      if (onRefresh) {
        onRefresh();
      }

      console.log('[AutoRefresh] Portfolio refresh complete');
    } catch (error) {
      console.error('[AutoRefresh] Failed to refresh portfolio:', error);
      if (!silent) {
        toast.error('Failed to update portfolio');
      }
    }
  };

  // Refresh on mount if enabled
  useEffect(() => {
    if (!userId || !enabled || !refreshOnMount) return;

    console.log('[AutoRefresh] Performing initial portfolio refresh on mount');
    refreshPortfolio(true); // Silent refresh on mount

  }, [userId, enabled, refreshOnMount]);

  // Set up periodic refresh if enabled and interval is set
  useEffect(() => {
    if (!userId || !enabled || !refreshInterval || refreshInterval <= 0) return;

    console.log(`[AutoRefresh] Setting up periodic refresh every ${refreshInterval / 1000 / 60} minutes`);

    intervalRef.current = setInterval(() => {
      console.log('[AutoRefresh] Periodic refresh triggered');
      refreshPortfolio(true); // Silent periodic refresh
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('[AutoRefresh] Cleared periodic refresh interval');
      }
    };
  }, [userId, enabled, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    refreshPortfolio,
    hasPortfolio: summary && summary.holdings_count > 0,
    lastRefresh: lastRefreshRef.current
  };
};
