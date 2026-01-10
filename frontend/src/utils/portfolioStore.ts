import { create } from 'zustand';
import { toast } from 'sonner';
import {
  PortfolioHolding,
  PortfolioSummary,
  PortfolioNotification,
  UploadResult
} from '@/types/portfolio';
import { autoSaveSnapshot } from './portfolioSnapshotTracker';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PortfolioState {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary | null;
  notifications: PortfolioNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHoldings: (userId: string) => Promise<void>;
  uploadStatement: (file: File, userId: string, password?: string) => Promise<UploadResult | null>;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteHolding: (holdingId: string, userId: string) => Promise<void>;
  clearPortfolio: () => void;
}

const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  summary: null,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchHoldings: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch(`${API_BASE_URL}/routes/portfolio-holdings/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch holdings: ${response.statusText}`);
      }

      const data = await response.json();

      set({
        holdings: data.holdings || [],
        summary: data.summary || null,
        isLoading: false
      });

      // Auto-save daily snapshot for historical tracking
      // FIX: Save snapshot even if holdings_count is 0 (needed for daily change calculation)
      if (data.summary) {
        console.log('[Portfolio Store] Triggering auto-save snapshot...');
        autoSaveSnapshot(userId, data.summary, data.holdings).catch(err => {
          console.warn('[Portfolio Store] Failed to save snapshot:', err);
          // Don't show error to user - this is a background operation
        });
      }
    } catch (error) {
      console.error('[Portfolio Store] Error fetching holdings:', error);
      set({
        error: 'Failed to load portfolio',
        isLoading: false
      });
      toast.error('Failed to load portfolio holdings');
    }
  },

  uploadStatement: async (file: File, userId: string, password?: string) => {
    try {
      set({ isLoading: true, error: null });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      // Add password for password-protected PDFs
      if (password) {
        formData.append('password', password);
      }

      const response = await fetch(`${API_BASE_URL}/routes/upload-portfolio`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Upload failed';
        throw new Error(errorMessage);
      }

      const result: UploadResult = await response.json();

      set({ isLoading: false });

      if (result.success) {
        toast.success(`✅ ${result.message}`, {
          description: `Extracted ${result.data?.folios_extracted} folios with ${result.data?.holdings_created} holdings`
        });

        // Refresh holdings
        await get().fetchHoldings(userId);
      }

      return result;
    } catch (error: any) {
      console.error('[Portfolio Store] Error uploading file:', error);
      set({
        error: error.message || 'Upload failed',
        isLoading: false
      });
      toast.error('Upload failed', {
        description: error.message || 'Please check your file format and try again'
      });
      return null;
    }
  },

  fetchNotifications: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/routes/portfolio-notifications/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      set({
        notifications: data.notifications || [],
        unreadCount: data.unread_count || 0
      });
    } catch (error) {
      console.error('[Portfolio Store] Error fetching notifications:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/routes/portfolio-notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('[Portfolio Store] Error marking notification as read:', error);
    }
  },

  deleteHolding: async (holdingId: string, userId: string) => {
    try {
      set({ isLoading: true });

      const response = await fetch(`${API_BASE_URL}/routes/portfolio-holdings/${holdingId}?user_id=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete holding');
      }

      toast.success('Holding deleted successfully');

      // Refresh holdings
      await get().fetchHoldings(userId);
    } catch (error: any) {
      console.error('[Portfolio Store] Error deleting holding:', error);
      toast.error('Failed to delete holding');
      set({ isLoading: false });
    }
  },

  clearPortfolio: () => {
    set({
      holdings: [],
      summary: null,
      notifications: [],
      unreadCount: 0,
      error: null
    });
  }
}));

export default usePortfolioStore;
