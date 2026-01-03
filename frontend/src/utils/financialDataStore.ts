import { create } from 'zustand';
import { FinancialData } from 'types';
// import brain from 'brain'; // REMOVED - Unused Databutton API client
import { toast } from 'sonner';
import { API_ENDPOINTS, fetchWithRetry } from '@/config/api';

// Define the store state
interface FinancialDataState {
  financialData: FinancialData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFinancialData: (userId: string) => Promise<void>;
  saveFinancialData: (data: FinancialData) => Promise<boolean>;
  clearFinancialData: () => void;
}

// Create the store
const useFinancialDataStore = create<FinancialDataState>((set, get) => ({
  financialData: null,
  isLoading: false,
  error: null,
  
  fetchFinancialData: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Minimal logging to reduce console noise
      const apiUrl = API_ENDPOINTS.getFinancialData(userId);

      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('[Store fetchFinancialData] INVALID USER ID - Aborting fetch');
        throw new Error('Invalid user ID provided');
      }

      // Direct fetch with retry logic to handle backend connection issues
      const response = await fetchWithRetry(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      // Handle case where backend is not reachable
      if (!response) {
        set({
          financialData: null,
          error: 'Backend server is not reachable. Please ensure the server is running.',
          isLoading: false
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch financial data: ${response.statusText}`);
      }

      const data = await response.json();

      // Set the financial data in store
      set({ financialData: data, isLoading: false });

      return data;
    } catch (error) {
      console.error('[Store fetchFinancialData] Error fetching financial data:', error);
      set({
        financialData: null,
        error: 'Failed to load financial data',
        isLoading: false
      });
      return null;
    }
  },
  
  saveFinancialData: async (data: FinancialData) => {
    try {
      set({ isLoading: true, error: null });

      console.log('========== [SAVE FINANCIAL DATA] START ==========');
      console.log('[Store saveFinancialData] Full data object:', data);
      console.log('[Store saveFinancialData] User ID from data:', data.userId);
      console.log('[Store saveFinancialData] API URL:', API_ENDPOINTS.saveFinancialData);

      if (!data.userId || data.userId === 'undefined' || data.userId === 'null') {
        console.error('[Store saveFinancialData] INVALID USER ID IN DATA - Aborting save');
        throw new Error('Invalid user ID in data');
      }

      // Direct fetch since Brain API client doesn't have the method yet
      // Using single /routes prefix (Bug #8 resolved)
      console.log('[Store saveFinancialData] Calling fetch() now...');
      const response = await fetch(API_ENDPOINTS.saveFinancialData, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include',  // Removed for local dev - CORS issue
        body: JSON.stringify(data)
      });
      console.log('[Store saveFinancialData] Fetch completed. Response status:', response.status);

      if (!response.ok) {
        console.error('[Store saveFinancialData] API returned error:', response.status, response.statusText);

        // Try to get error details from response
        let errorMessage = `Failed to save financial data: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.error) {
            errorMessage = errorData.message || errorData.error;
          }
        } catch (e) {
          // If response is not JSON, use default message
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[Store saveFinancialData] Save result:', result);

      if (result.success) {
        set({
          financialData: data,
          isLoading: false
        });
        toast.success("Your financial information has been saved successfully!");
        return true;
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error('[Store saveFinancialData] Error saving financial data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      set({
        error: errorMessage,
        isLoading: false
      });

      // Show more specific error message
      if (errorMessage.includes('Invalid user ID')) {
        toast.error("Please log in again to save your data.");
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else {
        toast.error(`Error saving data: ${errorMessage}`);
      }
      return false;
    }
  },
  
  clearFinancialData: () => {
    set({ financialData: null, error: null });
  }
}));

export default useFinancialDataStore;