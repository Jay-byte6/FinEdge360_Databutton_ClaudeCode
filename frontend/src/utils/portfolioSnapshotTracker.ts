/**
 * Portfolio Snapshot Tracker
 * Automatically saves daily portfolio snapshots for historical analysis
 */

import { API_ENDPOINTS } from '@/config/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PortfolioSnapshot {
  user_id: string;
  snapshot_date: string; // YYYY-MM-DD
  total_investment: number;
  current_value: number;
  total_profit: number;
  overall_return: number;
  holdings_count: number;
  holdings_details?: any; // Optional detailed holdings data
}

interface DailyChange {
  success: boolean;
  has_data: boolean;
  daily_change: number;
  daily_change_percentage: number;
  today?: {
    date: string;
    current_value: number;
    total_profit: number;
    overall_return: number;
  };
  yesterday?: {
    date: string;
    current_value: number;
    total_profit: number;
    overall_return: number;
  };
}

/**
 * Save a portfolio snapshot for today
 */
export const savePortfolioSnapshot = async (
  userId: string,
  portfolioSummary: {
    total_investment: number;
    current_value: number;
    total_profit: number;
    overall_return: number;
    holdings_count: number;
  },
  holdingsDetails?: any[]
): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const snapshot: PortfolioSnapshot = {
      user_id: userId,
      snapshot_date: today,
      total_investment: portfolioSummary.total_investment,
      current_value: portfolioSummary.current_value,
      total_profit: portfolioSummary.total_profit,
      overall_return: portfolioSummary.overall_return,
      holdings_count: portfolioSummary.holdings_count,
      holdings_details: holdingsDetails || null
    };

    const response = await fetch(`${API_BASE_URL}/routes/portfolio-snapshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snapshot),
    });

    if (!response.ok) {
      console.error('[Portfolio Snapshot] Failed to save snapshot:', response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('[Portfolio Snapshot] Saved successfully:', result);

    // Store last snapshot date in localStorage to avoid redundant calls
    localStorage.setItem(`portfolio_snapshot_${userId}_last`, today);

    return true;
  } catch (error) {
    console.error('[Portfolio Snapshot] Error saving snapshot:', error);
    return false;
  }
};

/**
 * Check if snapshot already saved today
 */
export const hasSnapshotForToday = (userId: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const lastSnapshot = localStorage.getItem(`portfolio_snapshot_${userId}_last`);
  return lastSnapshot === today;
};

/**
 * Get daily change in portfolio value
 */
export const getDailyChange = async (userId: string): Promise<DailyChange | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes/portfolio-snapshots/${userId}/daily-change`);

    if (!response.ok) {
      console.error('[Portfolio Snapshot] Failed to fetch daily change:', response.statusText);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[Portfolio Snapshot] Error fetching daily change:', error);
    return null;
  }
};

/**
 * Get historical snapshots
 */
export const getPortfolioHistory = async (
  userId: string,
  days: number = 30
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/routes/portfolio-snapshots/${userId}?days=${days}`
    );

    if (!response.ok) {
      console.error('[Portfolio Snapshot] Failed to fetch history:', response.statusText);
      return [];
    }

    const result = await response.json();
    return result.snapshots || [];
  } catch (error) {
    console.error('[Portfolio Snapshot] Error fetching history:', error);
    return [];
  }
};

/**
 * Get weekly snapshots
 */
export const getWeeklySnapshots = async (
  userId: string,
  weeks: number = 12
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/routes/portfolio-snapshots/${userId}/weekly?weeks=${weeks}`
    );

    if (!response.ok) {
      console.error('[Portfolio Snapshot] Failed to fetch weekly snapshots:', response.statusText);
      return [];
    }

    const result = await response.json();
    return result.weekly_snapshots || [];
  } catch (error) {
    console.error('[Portfolio Snapshot] Error fetching weekly snapshots:', error);
    return [];
  }
};

/**
 * Get monthly snapshots
 */
export const getMonthlySnapshots = async (
  userId: string,
  months: number = 12
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/routes/portfolio-snapshots/${userId}/monthly?months=${months}`
    );

    if (!response.ok) {
      console.error('[Portfolio Snapshot] Failed to fetch monthly snapshots:', response.statusText);
      return [];
    }

    const result = await response.json();
    return result.monthly_snapshots || [];
  } catch (error) {
    console.error('[Portfolio Snapshot] Error fetching monthly snapshots:', error);
    return [];
  }
};

/**
 * Auto-save snapshot when portfolio is fetched/updated
 * Call this after fetching portfolio holdings
 */
export const autoSaveSnapshot = async (
  userId: string,
  portfolioSummary: {
    total_investment: number;
    current_value: number;
    total_profit: number;
    overall_return: number;
    holdings_count: number;
  },
  holdingsDetails?: any[]
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const lastSaved = localStorage.getItem(`portfolio_snapshot_${userId}_last`);

  // FIX: Check if already saved today (compare dates)
  if (lastSaved === today) {
    console.log('[Portfolio Snapshot] ✅ Already saved today:', today);
    return;
  }

  // FIX: Always try to save, even if current_value is 0 (needed for daily change calculation)
  console.log('[Portfolio Snapshot] 💾 Saving snapshot for today:', today);
  console.log('[Portfolio Snapshot] Data:', {
    current_value: portfolioSummary.current_value,
    holdings_count: portfolioSummary.holdings_count,
    total_profit: portfolioSummary.total_profit
  });

  const success = await savePortfolioSnapshot(userId, portfolioSummary, holdingsDetails);

  if (!success) {
    console.error('[Portfolio Snapshot] ❌ Failed to save snapshot - clearing localStorage to retry next time');
    localStorage.removeItem(`portfolio_snapshot_${userId}_last`);
  } else {
    console.log('[Portfolio Snapshot] ✅ Snapshot saved successfully for:', today);
  }
};
