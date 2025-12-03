import { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';

interface PromoStats {
  code: string;
  code_name: string;
  total_slots: number | null;
  used_slots: number;
  remaining_slots: number | null;
  percentage_claimed: number;
  time_remaining: string | null;
  is_active: boolean;
  end_date: string | null;
}

interface UsePromoStatsReturn {
  stats: PromoStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePromoStats = (
  promoCode: string,
  autoRefresh: boolean = true,
  refreshInterval: number = 30000 // 30 seconds
): UsePromoStatsReturn => {
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/routes/promo-stats/${promoCode.toUpperCase()}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Promo code not found');
        }
        throw new Error('Failed to fetch promo stats');
      }

      const data: PromoStats = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!promoCode) {
      setStats(null);
      setLoading(false);
      return;
    }

    fetchPromoStats();

    if (autoRefresh) {
      const interval = setInterval(fetchPromoStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [promoCode, autoRefresh, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refetch: fetchPromoStats,
  };
};

interface ActivePromo {
  code: string;
  code_name: string;
  code_type: string;
  total_slots: number | null;
  used_slots: number;
  remaining_slots: number | null;
  time_remaining: string | null;
  benefits: Record<string, any>;
}

interface UseActivePromosReturn {
  promos: ActivePromo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useActivePromos = (
  autoRefresh: boolean = true,
  refreshInterval: number = 60000 // 60 seconds
): UseActivePromosReturn => {
  const [promos, setPromos] = useState<ActivePromo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePromos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/routes/active-promos`);

      if (!response.ok) {
        throw new Error('Failed to fetch active promos');
      }

      const data = await response.json();
      setPromos(data.active_promos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePromos();

    if (autoRefresh) {
      const interval = setInterval(fetchActivePromos, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    promos,
    loading,
    error,
    refetch: fetchActivePromos,
  };
};
