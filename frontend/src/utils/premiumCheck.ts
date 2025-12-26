/**
 * Premium User Utilities
 * Determines if a user has premium access based on access codes
 */

const PORTFOLIO_ACCESS_KEY = 'portfolio_access_granted';
const FIRE_PLANNER_ACCESS_KEY = 'fire_planner_access_granted';

/**
 * Check if user has premium access
 * Premium users are those who have entered access codes for Portfolio AND FIRE Planner
 */
export const isPremiumUser = (): boolean => {
  const hasPortfolioAccess = localStorage.getItem(PORTFOLIO_ACCESS_KEY) === 'true';
  const hasFirePlannerAccess = localStorage.getItem(FIRE_PLANNER_ACCESS_KEY) === 'true';

  // User is premium if they have access to both Portfolio and FIRE Planner
  return hasPortfolioAccess && hasFirePlannerAccess;
};

/**
 * Check if user has access to Portfolio features
 */
export const hasPortfolioAccess = (): boolean => {
  return localStorage.getItem(PORTFOLIO_ACCESS_KEY) === 'true';
};

/**
 * Check if user has access to FIRE Planner features
 */
export const hasFirePlannerAccess = (): boolean => {
  return localStorage.getItem(FIRE_PLANNER_ACCESS_KEY) === 'true';
};

/**
 * Get user tier label
 */
export const getUserTierLabel = (): 'Premium' | 'Free' => {
  return isPremiumUser() ? 'Premium' : 'Free';
};
