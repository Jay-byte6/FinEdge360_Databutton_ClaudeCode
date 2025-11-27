import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import useSubscription from '@/hooks/useSubscription';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string; // Specific feature name to check
  requiredPlan?: 'premium' | 'expert_plus'; // Minimum plan required
  fallback?: React.ReactNode; // Custom fallback UI
  showUpgradePrompt?: boolean; // Show upgrade prompt instead of hiding content
}

/**
 * PremiumGate - Conditionally render content based on subscription status
 *
 * Usage Examples:
 *
 * 1. Simple Premium Gate (hide content if not premium):
 * ```tsx
 * <PremiumGate requiredPlan="premium">
 *   <AdvancedFeature />
 * </PremiumGate>
 * ```
 *
 * 2. Show Upgrade Prompt (with blur effect):
 * ```tsx
 * <PremiumGate requiredPlan="premium" showUpgradePrompt>
 *   <ExpensiveChart data={data} />
 * </PremiumGate>
 * ```
 *
 * 3. Check Specific Feature:
 * ```tsx
 * <PremiumGate feature="3d_fire_map">
 *   <Journey3DView />
 * </PremiumGate>
 * ```
 *
 * 4. Custom Fallback:
 * ```tsx
 * <PremiumGate requiredPlan="expert_plus" fallback={<CustomMessage />}>
 *   <ExpertOnlyFeature />
 * </PremiumGate>
 * ```
 */
const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  feature,
  requiredPlan = 'premium',
  fallback,
  showUpgradePrompt = false
}) => {
  const navigate = useNavigate();
  const { loading, isPremium, isExpertPlus, hasFeature } = useSubscription();

  // Check access
  const hasAccess = () => {
    if (loading) return false; // Don't show content while loading

    if (feature) {
      return hasFeature(feature);
    }

    if (requiredPlan === 'expert_plus') {
      return isExpertPlus;
    }

    if (requiredPlan === 'premium') {
      return isPremium;
    }

    return false;
  };

  const allowed = hasAccess();

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // If allowed, show content
  if (allowed) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // If showUpgradePrompt is true, show content with overlay
  if (showUpgradePrompt) {
    return (
      <div className="relative">
        {/* Blurred content */}
        <div className="filter blur-md pointer-events-none select-none">
          {children}
        </div>

        {/* Upgrade overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
        >
          <Card className="max-w-md border-2 border-purple-300 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mx-auto"
              >
                {requiredPlan === 'expert_plus' ? (
                  <Crown className="w-10 h-10 text-white" />
                ) : (
                  <Lock className="w-10 h-10 text-white" />
                )}
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {requiredPlan === 'expert_plus' ? 'Expert Plus Feature' : 'Premium Feature'}
                </h3>
                <p className="text-gray-600">
                  Upgrade to {requiredPlan === 'expert_plus' ? 'Expert Plus' : 'Premium'} to unlock this powerful feature
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-purple-600 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Unlock all premium features</span>
              </div>

              <Button
                onClick={() => navigate('/pricing')}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Upgrade Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-gray-500">
                Cancel anytime • 7-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Default: Don't render anything
  return null;
};

export default PremiumGate;

/**
 * PremiumBadge - Show a badge indicating premium status
 */
export const PremiumBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white ${className}`}>
      <Crown className="w-3 h-3" />
      PREMIUM
    </span>
  );
};

/**
 * LockedFeatureCard - Show a card for a locked feature with CTA
 */
interface LockedFeatureCardProps {
  title: string;
  description: string;
  plan?: 'premium' | 'expert_plus';
  className?: string;
}

export const LockedFeatureCard: React.FC<LockedFeatureCardProps> = ({
  title,
  description,
  plan = 'premium',
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-2 flex items-center justify-center gap-2">
              {title}
              {plan === 'expert_plus' ? (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Expert Plus</span>
              ) : (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Premium</span>
              )}
            </h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>

          <Button
            onClick={() => navigate('/pricing')}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Unlock Feature
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
