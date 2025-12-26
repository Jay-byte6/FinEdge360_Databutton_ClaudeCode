import { create } from 'zustand';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import brain from 'brain';
import { API_URL } from 'app';
import { toast } from 'sonner';
import { fetchWithRetry } from '@/config/api';

// Top-level log to verify file loads
console.log("####### authStore.ts FILE LOADED #######");
console.log("Supabase client:", typeof supabase);
console.log("API_URL:", API_URL);

/**
 * Wrapper to add timeout to async operations
 * Prevents auth calls from hanging indefinitely
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timed out. Please check your internet connection and try again.')),
        timeoutMs
      )
    ),
  ]);
};

type ProfileData = {
  id: string;
  user_id?: string; // Make this optional since table structure might change
  full_name?: string;
  pan_number?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
};

type AuthState = {
  // Auth state
  session: Session | null;
  user: User | null;
  profile: ProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isRegistering: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  refreshSession: () => Promise<void>;
  toggleAuthMode: () => void;
  resetPassword: (email: string) => Promise<boolean>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  session: null,
  user: null,
  profile: null,
  isLoading: false,  // Fixed: was stuck at true, preventing login button from being clickable
  isAuthenticated: false,
  error: null,
  isRegistering: false,
  
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Note: init-auth-tables endpoint doesn't exist - auth handled by Supabase
      // Removed to prevent 404 errors and CORS issues
      console.log(`Attempting to sign in with email: ${email.substring(0, 3)}...`);

      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000 // 15 second timeout
      );
      
      if (error) {
        console.error('Sign in error details:', error);

        // Special handling for unconfirmed emails
        if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('Please check your email and confirm your account before signing in.');
        }

        // Handle invalid credentials - account may not exist
        if (error.status === 400 || error.status === 401) {
          throw new Error(
            'Invalid email or password. If you don\'t have an account, please sign up first.'
          );
        }

        // Handle timeout errors
        if (error.message && error.message.toLowerCase().includes('timeout')) {
          throw new Error('Connection timed out. Please check your internet connection and try again.');
        }

        // Handle network errors
        if (error.message && error.message.toLowerCase().includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        }

        throw error;
      }
      
      if (!data.session) {
        throw new Error('Login failed: No session returned. Please try again.');
      }
      
      console.log('Login successful. Session established.');
      
      set({
        session: data.session,
        user: data.user,
        isAuthenticated: true,
        error: null,
      });
      
      // Refresh to get profile and other data
      await get().refreshSession();
      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error: error.message || 'Invalid login credentials' });
      toast.error(error.message || 'Invalid login credentials');
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });

      console.log('Attempting to sign in with Google...');
      console.log('Current origin:', window.location.origin);

      // Use implicit flow instead of PKCE to avoid 401 errors
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }

      // Note: The actual session will be established after redirect
      // The auth state change listener will handle the session update
      console.log('Redirecting to Google for authentication...');

    } catch (error: any) {
      console.error('Google sign-in error:', error);
      set({ error: error.message || 'Failed to sign in with Google' });
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      set({ isLoading: false });
    }
  },

  // Reset password (forgot password)
  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the OTP and email in localStorage with expiration
      const otpData = {
        email,
        otp,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiration
      };
      
      localStorage.setItem('resetPasswordData', JSON.stringify(otpData));
      
      // For development purposes, show the OTP in console
      console.log('Password reset OTP:', otp);
      
      // In a real app, this would send an email with just the OTP code
      // For now we're just showing it in the UI and console
      
      toast.success(`Password reset code: ${otp}`);
      toast.info(
        "For demo purposes, the code is shown above. " +
        "In production, this would be emailed to you without the magic link."
      );
      
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      set({ error: error.message || 'Failed to send password reset email' });
      toast.error(error.message || 'Failed to send password reset email');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Verify OTP and reset password
  verifyOTPAndResetPassword: async (otp: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get stored OTP data
      const storedDataString = localStorage.getItem('resetPasswordData');
      if (!storedDataString) {
        throw new Error('No password reset request found. Please request a new code.');
      }
      
      const storedData = JSON.parse(storedDataString);
      
      // Check if OTP has expired
      if (Date.now() > storedData.expires) {
        localStorage.removeItem('resetPasswordData');
        throw new Error('Reset code has expired. Please request a new code.');
      }
      
      // Verify OTP
      if (storedData.otp !== otp) {
        throw new Error('Invalid reset code. Please check and try again.');
      }
      
      // Use our backend API endpoint to reset the password (with timeout)
      const response = await withTimeout(
        fetch(`${API_URL}/routes/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: storedData.email,
            password: newPassword
          }),
          // credentials: 'include'  // Removed for local dev - CORS issue
        }),
        10000 // 10 second timeout
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error resetting password:', errorData);
        throw new Error(errorData.detail || 'Failed to reset password. Please try again.');
      }
      
      // Clean up
      localStorage.removeItem('resetPasswordData');
      
      toast.success('Password has been reset successfully');
      return true;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      set({ error: error.message || 'Failed to verify reset code' });
      toast.error(error.message || 'Failed to verify reset code');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if this is a test email that we should auto-confirm
      const isTestEmail = email.includes('test') || email.includes('demo') || email.endsWith('@test.com');
      
      // Note: init-auth-tables endpoint doesn't exist - auth handled by Supabase
      // Removed to prevent 404 errors and CORS issues

      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
        }),
        15000 // 15 second timeout
      );

      if (error) throw error;
      
      // If the user was created but requires email confirmation
      if (data.user && !data.session) {
        // For test emails, try to auto-sign-in to bypass email confirmation
        if (isTestEmail) {
          try {
            console.log('Auto-confirming test email...');
            // Attempt to sign in right away for test emails
            const { data: signInData, error: signInError } = await withTimeout(
              supabase.auth.signInWithPassword({
                email,
                password,
              }),
              15000 // 15 second timeout
            );
            
            if (!signInError && signInData.session) {
              set({
                session: signInData.session,
                user: signInData.user,
                isAuthenticated: true,
              });
              
              await get().refreshSession();
              toast.success('Account created and signed in successfully!');
              return { requiresEmailConfirmation: false };
            }
          } catch (autoConfirmError) {
            console.error('Error auto-confirming test email:', autoConfirmError);
          }
        }
        
        // If auto-confirmation failed or this isn't a test email
        toast.success('Account created! Please check your email for the confirmation link.');
        return { requiresEmailConfirmation: true };
      }
      
      // If we have a session, the user is already confirmed
      if (data.session) {
        set({
          session: data.session,
          user: data.user,
          isAuthenticated: true,
        });
        
        await get().refreshSession();
        toast.success('Account created and signed in successfully!');
        return { requiresEmailConfirmation: false };
      }
      
      toast.success('Account created! Please check your email for the confirmation link.');
      return { requiresEmailConfirmation: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message || 'Failed to sign up' });
      toast.error(error.message || 'Failed to sign up');
      return { requiresEmailConfirmation: false };
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Toggle between sign in and sign up modes
  toggleAuthMode: () => {
    set({ isRegistering: !get().isRegistering, error: null });
  },
  
  // Sign out user
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await withTimeout(
        supabase.auth.signOut(),
        10000 // 10 second timeout
      );
      if (error) throw error;
      
      set({
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
      });
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message || 'Failed to sign out' });
      toast.error(error.message || 'Failed to sign out');
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Update user profile
  updateProfile: async (data: Partial<ProfileData>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('User not authenticated');
      
      set({ isLoading: true, error: null });
      
      const updateData = {
        user_id: user.id,
        ...data,
      };
      
      // Use our custom API endpoint for profile updates
      const response = await brain.update_profile(updateData);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      // Refresh profile
      await get().refreshSession();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      set({ error: error.message || 'Failed to update profile' });
      toast.error(error.message || 'Failed to update profile');
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Refresh current session and profile data
  refreshSession: async () => {
    try {
      set({ isLoading: true, error: null });

      // Note: init-auth-tables endpoint doesn't exist - auth handled by Supabase
      // Removed to prevent 404 errors and CORS issues

      // Get current session
      const { data: { session }, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        10000 // 10 second timeout
      );
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      // Get user from session
      const user = session?.user || null;

      // Log session status
      console.log('Session status:', user ? 'User is logged in' : 'No active session');

      // Update auth state immediately to prevent auth loops
      set({
        session,
        user,
        isAuthenticated: !!user,
        isLoading: false,  // Set loading to false right away
      });
      
      // Fetch profile if user exists
      let profile = null;
      if (user) {
        try {
          console.log('Fetching profile for user:', user.id);
          
          // Try to get profile from our API first (with retry logic)
          try {
            const profileResponse = await fetchWithRetry(
              `${API_URL}/routes/get-profile/${user.id}`,
              {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // credentials: 'include'  // Removed for local dev - CORS issue
              },
              { timeout: 5000, maxRetries: 1 } // Quick timeout and 1 retry
            );

            if (profileResponse && profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.success && profileData.data) {
                profile = profileData.data;
                console.log('Profile fetched from API');
              }
            } else if (profileResponse) {
              console.warn('Failed to get profile from API - will use Supabase fallback');
            } else {
              console.warn('Backend not reachable - using Supabase fallback');
            }
          } catch (apiError) {
            console.warn('Error getting profile from API (will try Supabase):', apiError);
          }
          
          // If we didn't get a profile from the API, try Supabase directly
          if (!profile) {
            console.log('Attempting to fetch profile directly from Supabase');
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (profileError) {
              if (profileError.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
                console.error('Error fetching profile from Supabase:', profileError);
              }
            } else if (profileData) {
              profile = profileData;
              console.log('Profile fetched from Supabase directly');
            }
          }
          
          // If we still don't have a profile, create one
          if (!profile) {
            try {
              console.log('Creating new profile for user:', user.id);
              const updateData = {
                user_id: user.id,
                id: user.id,
                created_at: new Date().toISOString()
              };
              
              const response = await brain.update_profile(updateData);
              const result = await response.json();
              
              if (result.success && result.data) {
                profile = result.data;
                console.log('New profile created successfully');
              } else {
                console.error('Failed to create profile:', result);
              }
            } catch (createError) {
              console.error('Error creating profile:', createError);
            }
          }
          
          // Set profile in state
          set({ profile });
        } catch (profileError) {
          console.error('Profile fetch/create error:', profileError);
        }
      }
    } catch (error: any) {
      console.error('Refresh session error:', error);
      set({ error: error.message || 'Failed to refresh session' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;

