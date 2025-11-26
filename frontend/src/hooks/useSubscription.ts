import { useState, useEffect } from 'react';
import useAuthStore from '@/utils/authStore';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: number;
  plan_name: string;
  plan_display_name: string;
  status: string;
  access_code: string | null;
  code_redeemed_at: string | null;
  billing_cycle: string | null;
  is_lifetime: boolean;
  features: string[];
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

interface SubscriptionHook {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  isExpertPlus: boolean;
  isFree: boolean;
  isLifetime: boolean;
  hasFeature: (featureName: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

/**
 * Hook to check user subscription status and features
 *
 * Usage:
 * ```tsx
 * const { isPremium, hasFeature, loading } = useSubscription();
 *
 * if (loading) return <Loader />;
 * if (!isPremium) return <UpgradePrompt />;
 * return <PremiumFeature />;
 * ```
 */
export const useSubscription = (): SubscriptionHook => {
  const { user, isAuthenticated } = useAuthStore();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!isAuthenticated || !user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/routes/user-subscription/${user.id}`);

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        setError(null);
      } else {
        // User might not have subscription yet - default to free
        setSubscription(null);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError('Failed to load subscription details');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id, isAuthenticated]);

  // Helper functions
  const isPremium = subscription?.plan_name === 'premium' || subscription?.plan_name === 'expert_plus';
  const isExpertPlus = subscription?.plan_name === 'expert_plus';
  const isFree = !subscription || subscription?.plan_name === 'free';
  const isLifetime = subscription?.is_lifetime || false;

  const hasFeature = (featureName: string): boolean => {
    if (!subscription || !subscription.features) return false;
    return subscription.features.includes(featureName);
  };

  return {
    subscription,
    loading,
    error,
    isPremium,
    isExpertPlus,
    isFree,
    isLifetime,
    hasFeature,
    refreshSubscription: fetchSubscription
  };
};

/**
 * Feature names that can be checked with hasFeature()
 */
export const FEATURES = {
  // Premium Features
  FIRE_MAP_3D: '3d_fire_map',
  ADVANCED_SIP: 'advanced_sip_planning',
  ASSET_ALLOCATION: 'asset_allocation_designer',
  PORTFOLIO_ANALYSIS: 'advanced_portfolio_analysis',
  TAX_OPTIMIZATION: 'tax_optimization',
  PREMIUM_CONSULTATION: 'premium_consultation',
  EXPORT_PDF: 'export_reports',
  PRIORITY_SUPPORT: 'priority_support',

  // Expert Plus Features
  UNLIMITED_CONSULTATIONS: 'unlimited_consultations',
  QUARTERLY_REVIEW: 'quarterly_portfolio_review',
  WHATSAPP_SUPPORT: 'direct_whatsapp_support',
  CUSTOM_PLANNING: 'custom_financial_planning',
  TAX_FILING: 'tax_filing_assistance',
  DEDICATED_ADVISOR: 'dedicated_advisor',
  EXCLUSIVE_WEBINARS: 'exclusive_webinars'
} as const;

export default useSubscription;
