import { create } from 'zustand';
import { FinancialData } from 'types';
import brain from 'brain';
import { toast } from 'sonner';

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

      console.log('[Store fetchFinancialData] Attempting to fetch financial data for user:', userId);

      // Direct fetch since Brain API client doesn't have the method yet
      // Using single /routes prefix (Bug #8 resolved)
      const response = await fetch(`http://localhost:8001/routes/get-financial-data/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include'  // Removed for local dev - CORS issue
      });

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

      console.log('[Store saveFinancialData] Saving financial data:', data);

      // Direct fetch since Brain API client doesn't have the method yet
      // Using single /routes prefix (Bug #8 resolved)
      const response = await fetch('http://localhost:8001/routes/save-financial-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include',  // Removed for local dev - CORS issue
        body: JSON.stringify(data)
      });

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