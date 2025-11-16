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

  // Privacy & Consent
  saveUserConsent: `${API_BASE_URL}/routes/save-user-consent`,
  getUserConsents: (userId: string) => `${API_BASE_URL}/routes/get-user-consents/${userId}`,
  deleteUserAccount: (userId: string) => `${API_BASE_URL}/routes/delete-user-account/${userId}`,
  getAuditLogs: (userId: string) => `${API_BASE_URL}/routes/audit-logs/${userId}`,
  getInactiveUsers: `${API_BASE_URL}/routes/inactive-users`,
  logPdfExport: (userId: string) => `${API_BASE_URL}/routes/log-pdf-export/${userId}`,
  privacyHealth: `${API_BASE_URL}/routes/privacy-health`,
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
