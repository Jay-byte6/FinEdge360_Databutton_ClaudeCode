/**
 * Premium User Utilities
 * Determines if a user has premium access
 *
 * PRELAUNCH MODE: All users get premium access for free (First 5,000 users)
 * TODO: After prelaunch, check actual subscription status from backend
 */

const PORTFOLIO_ACCESS_KEY = 'portfolio_access_granted';
const FIRE_PLANNER_ACCESS_KEY = 'fire_planner_access_granted';

/**
 * Check if user has premium access
 *
 * CRITICAL FIX: During prelaunch, ALL logged-in users have premium access
 * This matches the banner: "Worth ₹9,999/year - 100% FREE for First 5,000 Users!"
 */
export const isPremiumUser = (): boolean => {
  // PRELAUNCH MODE: Everyone gets premium features for free!
  // This is the "First 5,000 users" promotion
  return true;

  // TODO: After prelaunch ends, implement proper subscription check:
  // const user = useAuthStore.getState().user;
  // if (!user) return false;
  // return user.subscription_tier === 'premium' || user.subscription_tier === 'founder50';
};

/**
 * Check if user has access to Portfolio features
 * PRELAUNCH: Everyone has access
 */
export const hasPortfolioAccess = (): boolean => {
  return true; // PRELAUNCH MODE: Free for all users
};

/**
 * Check if user has access to FIRE Planner features
 * PRELAUNCH: Everyone has access
 */
export const hasFirePlannerAccess = (): boolean => {
  return true; // PRELAUNCH MODE: Free for all users
};

/**
 * Get user tier label
 */
export const getUserTierLabel = (): 'Premium' | 'Free' => {
  return isPremiumUser() ? 'Premium' : 'Free';
};
