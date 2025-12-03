import { create } from 'zustand';
import { FinancialData } from 'types';
// import brain from 'brain'; // REMOVED - Unused Databutton API client
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

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

      console.log('========== [FETCH FINANCIAL DATA] START ==========');
      console.log('[Store fetchFinancialData] User ID:', userId);
      console.log('[Store fetchFinancialData] User ID type:', typeof userId);
      console.log('[Store fetchFinancialData] User ID is undefined?', userId === undefined);
      console.log('[Store fetchFinancialData] User ID is null?', userId === null);

      const apiUrl = API_ENDPOINTS.getFinancialData(userId);
      console.log('[Store fetchFinancialData] Full API URL:', apiUrl);

      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('[Store fetchFinancialData] INVALID USER ID - Aborting fetch');
        throw new Error('Invalid user ID provided');
      }

      // Direct fetch since Brain API client doesn't have the method yet
      // Using single /routes prefix (Bug #8 resolved)
      console.log('[Store fetchFinancialData] Calling fetch() now...');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include'  // Removed for local dev - CORS issue
      });
      console.log('[Store fetchFinancialData] Fetch completed. Response status:', response.status);

      if (!response.ok) {
        console.error('[Store fetchFinancialData] API returned error:', response.status, response.statusText);
        throw new Error(`Failed to fetch financial data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Store fetchFinancialData] Raw data received from API:', data);

      // Set the financial data in store
      set({ financialData: data, isLoading: false });
      console.log('[Store fetchFinancialData] Store updated. New financialData:', data);

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
        throw new Error(`Failed to save financial data: ${response.statusText}`);
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
      set({
        error: 'Failed to save financial data',
        isLoading: false
      });
      toast.error("Error saving data. Please check your form inputs and try again.");
      return false;
    }
  },
  
  clearFinancialData: () => {
    set({ financialData: null, error: null });
  }
}));

export default useFinancialDataStore;