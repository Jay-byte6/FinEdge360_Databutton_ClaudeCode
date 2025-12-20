// API Configuration
// This file centralizes all API endpoint configuration

// Get the API base URL from environment variables
// In production (Vercel), this will be your deployed backend URL
// In development, this will be localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  resetPassword: `${API_BASE_URL}/routes/auth/reset-password`,
  initAuthTables: `${API_BASE_URL}/routes/init-auth-tables`,

  // Profile
  updateProfile: `${API_BASE_URL}/routes/update-profile`,
  getProfile: (userId: string) => `${API_BASE_URL}/routes/get-profile/${userId}`,

  // Database
  initializeDatabase: `${API_BASE_URL}/routes/initialize-database`,
  getSchema: `${API_BASE_URL}/routes/schema`,

  // Financial Data
  saveFinancialData: `${API_BASE_URL}/routes/save-financial-data`,
  getFinancialData: (userId: string) => `${API_BASE_URL}/routes/get-financial-data/${userId}`,

  // Risk Assessment
  saveRiskAssessment: `${API_BASE_URL}/routes/save-risk-assessment`,
  getRiskAssessment: (userId: string) => `${API_BASE_URL}/routes/get-risk-assessment/${userId}`,
  deleteRiskAssessment: (userId: string) => `${API_BASE_URL}/routes/delete-risk-assessment/${userId}`,

  // SIP Planner
  saveSIPPlanner: `${API_BASE_URL}/routes/save-sip-planner`,
  getSIPPlanner: (userId: string) => `${API_BASE_URL}/routes/get-sip-planner/${userId}`,

  // Asset Allocation
  saveAssetAllocation: `${API_BASE_URL}/routes/save-asset-allocation`,
  getAssetAllocation: (userId: string) => `${API_BASE_URL}/routes/get-asset-allocation/${userId}`,
  deleteAssetAllocation: (userId: string, goalType: string) => `${API_BASE_URL}/routes/delete-asset-allocation/${userId}/${goalType}`,

  // Milestone Progress
  saveMilestoneProgress: (userId: string) => `${API_BASE_URL}/routes/save-milestone-progress/${userId}`,
  getMilestoneProgress: (userId: string) => `${API_BASE_URL}/routes/get-milestone-progress/${userId}`,

  // Privacy & Consent
  saveUserConsent: `${API_BASE_URL}/routes/save-user-consent`,
  getUserConsents: (userId: string) => `${API_BASE_URL}/routes/get-user-consents/${userId}`,
  deleteUserAccount: (userId: string) => `${API_BASE_URL}/routes/delete-user-account/${userId}`,
  getAuditLogs: (userId: string) => `${API_BASE_URL}/routes/audit-logs/${userId}`,
  getInactiveUsers: `${API_BASE_URL}/routes/inactive-users`,
  logPdfExport: (userId: string) => `${API_BASE_URL}/routes/log-pdf-export/${userId}`,
  privacyHealth: `${API_BASE_URL}/routes/privacy-health`,

  // Payments
  paymentConfig: `${API_BASE_URL}/routes/payment-config`,
  createRazorpayOrder: `${API_BASE_URL}/routes/create-razorpay-order`,
  verifyRazorpayPayment: `${API_BASE_URL}/routes/verify-razorpay-payment`,
  validatePromoCode: `${API_BASE_URL}/routes/validate-promo-code`,

  // Subscriptions
  getSubscription: (userId: string) => `${API_BASE_URL}/routes/subscription/${userId}`,
  getGuidelines: `${API_BASE_URL}/routes/subscription/guidelines`,
  getPromoStats: `${API_BASE_URL}/routes/promo-stats`,

  // Portfolio (CAMS Upload & Tracking)
  uploadPortfolio: `${API_BASE_URL}/routes/upload-portfolio`,
  getPortfolioHoldings: (userId: string) => `${API_BASE_URL}/routes/portfolio-holdings/${userId}`,
  getPortfolioNotifications: (userId: string) => `${API_BASE_URL}/routes/portfolio-notifications/${userId}`,
  markNotificationRead: (notificationId: string) => `${API_BASE_URL}/routes/portfolio-notifications/${notificationId}/read`,
  deletePortfolioHolding: (holdingId: string, userId: string) => `${API_BASE_URL}/routes/portfolio-holdings/${holdingId}?user_id=${userId}`,
  manualNavUpdate: `${API_BASE_URL}/routes/manual-nav-update`,
};

// Helper function to check if we're in production
export const isProduction = import.meta.env.PROD;

// Helper function to check if API is using HTTPS
export const isSecureAPI = API_BASE_URL.startsWith('https://');

// Console warning if using HTTP in production
if (isProduction && !isSecureAPI) {
  console.warn('⚠️ WARNING: Using HTTP API in production. This will cause "Not Secure" warnings.');
  console.warn('Please set VITE_API_URL to your HTTPS backend URL in Vercel environment variables.');
}

// Utility function to check if backend is reachable
let backendHealthy = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // Check every 30 seconds

export const checkBackendHealth = async (): Promise<boolean> => {
  const now = Date.now();

  // Don't check too frequently
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return backendHealthy;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${API_BASE_URL}/routes/schema`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    backendHealthy = response.ok;
    lastHealthCheck = now;
    return backendHealthy;
  } catch (error) {
    console.warn('[API Health Check] Backend not reachable:', error);
    backendHealthy = false;
    lastHealthCheck = now;
    return false;
  }
};

// Retry configuration
interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  retryDelay: 1000, // 1 second
  timeout: 10000, // 10 seconds
};

/**
 * Fetch with automatic retry on connection errors
 * This prevents ERR_CONNECTION_REFUSED from breaking the UI
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  config: RetryConfig = {}
): Promise<Response | null> => {
  const { maxRetries, retryDelay, timeout } = { ...DEFAULT_RETRY_CONFIG, ...config };

  for (let attempt = 0; attempt <= maxRetries!; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Update backend health status on success
      if (response.ok) {
        backendHealthy = true;
        lastHealthCheck = Date.now();
      }

      return response;
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;

      // Handle connection errors
      if (error.name === 'AbortError' || error.message?.includes('Failed to fetch')) {
        // Only log on first attempt and last attempt to reduce console noise
        if (attempt === 0) {
          console.warn(`[API] Connection failed, retrying... (${url})`);
        }

        if (isLastAttempt) {
          console.warn('[API] Backend not reachable. Using fallback methods.');
          backendHealthy = false;
          lastHealthCheck = Date.now();

          // Return null instead of throwing to prevent UI crashes
          return null;
        }

        // Wait before retrying (no log spam)
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        // For other errors, throw immediately
        throw error;
      }
    }
  }

  return null;
};
