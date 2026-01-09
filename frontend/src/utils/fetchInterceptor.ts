/**
 * Global Fetch Interceptor
 * Automatically adds JWT authentication to ALL API requests
 *
 * This intercepts the global fetch() function and adds Authorization headers
 * to requests going to the backend API.
 */

import { supabase } from './supabase';

// Store reference to original fetch
const originalFetch = window.fetch;

// API URL to intercept
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Enhanced fetch that automatically adds JWT authentication
 */
async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Check if this is an API request
  const isApiRequest = url.includes(API_URL) || url.includes('railway.app');

  // If it's an API request, add auth header
  if (isApiRequest) {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('[Fetch Interceptor] ⚠️ Error getting session:', error);
      } else if (session?.access_token) {
        // Add Authorization header
        const headers = new Headers(init?.headers || {});

        // Only add if not already present
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${session.access_token}`);
        }

        // Create new init with updated headers
        const newInit: RequestInit = {
          ...init,
          headers,
        };

        // Call original fetch with auth
        return originalFetch(input, newInit);
      } else {
        console.warn('[Fetch Interceptor] ⚠️ No active session - request may fail if auth required');
      }
    } catch (error) {
      console.error('[Fetch Interceptor] ❌ Error adding auth:', error);
    }
  }

  // For non-API requests or if auth failed, use original fetch
  return originalFetch(input, init);
}

/**
 * Install the fetch interceptor
 */
export function installFetchInterceptor() {
  console.log('[Fetch Interceptor] 🔧 Installing global fetch interceptor...');

  // Replace global fetch
  window.fetch = authenticatedFetch as typeof fetch;

  console.log('[Fetch Interceptor] ✅ Interceptor installed - all API calls will be authenticated');
}

/**
 * Uninstall the fetch interceptor (for testing)
 */
export function uninstallFetchInterceptor() {
  window.fetch = originalFetch;
  console.log('[Fetch Interceptor] ❌ Interceptor uninstalled');
}
