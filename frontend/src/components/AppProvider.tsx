import type { ReactNode } from "react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import useAuthStore from "../utils/authStore";
import { supabase } from "../utils/supabase";
import brain from "brain";
import { toast } from "sonner";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 *
 * Note: ThemeProvider is already included in AppWrapper.tsx and does not need to be added here.
 */
export const AppProvider = ({ children }: Props) => {
  const { refreshSession, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Set document title
  useEffect(() => {
    document.title = "FIREMap";
  }, []); // Empty dependency array ensures this runs once on mount

  // Determine if we should show the navbar and footer based on current route
  const hideNavbarRoutes = ["/login", "/"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  const shouldShowFooter = !hideNavbarRoutes.includes(location.pathname);

  // Initialize auth tables and refresh session when the app loads
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Note: brain.init_auth_tables() doesn't exist in the current Brain API
        // Commenting out to prevent errors - auth initialization happens via Supabase
        // const response = await brain.init_auth_tables();
        // const result = await response.json();
        // console.log("Auth tables initialization:", result);

        // Refresh auth session
        await refreshSession();
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Removed toast error since this is expected behavior when not logged in
      }
    };

    initAuth();

    // Set up auth state change listener for OAuth callbacks
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== AUTH STATE CHANGE DEBUG ===');
      console.log('Event:', event);
      console.log('Session exists:', !!session);
      if (session?.user) {
        console.log('User ID:', session.user.id);
        console.log('User Email:', session.user.email);
      }
      console.log('Current path:', location.pathname);
      console.log('=============================');

      // Handle all cases where we have a session
      if (session) {
        console.log(`Processing ${event} event with session`);

        // Update the auth store immediately with the session
        const { user } = useAuthStore.getState();
        if (!user || user.id !== session.user.id) {
          console.log('Updating auth store with new session');
          useAuthStore.setState({
            session,
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }

        // Refresh to get profile
        await refreshSession();

        // Navigate to dashboard on sign in
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && location.pathname === '/login') {
          console.log('Redirecting to dashboard after sign in');
          setTimeout(() => {
            toast.success('Signed in successfully!');
            navigate('/dashboard');
          }, 100);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        useAuthStore.setState({
          session: null,
          user: null,
          profile: null,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshSession, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Announcement Banner for All Pages */}
      {shouldShowNavbar && (
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white py-2 px-4 overflow-hidden z-50">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap text-sm md:text-base font-semibold"
          >
            🎉 LIMITED TIME: Worth ₹9,999/year - 100% FREE for First 5,000 Users! • Only 277 Spots Left • SEBI Compliant • Bank-Grade Security • Join 4,723 Smart Investors Now! 🎉
          </motion.div>
        </div>
      )}
      {shouldShowNavbar && <NavBar showFullNav={location.pathname !== "/"} />}
      <div className="flex-grow">
        {children}
      </div>
      {shouldShowFooter && <Footer />}
      <Toaster position="top-right" richColors />
    </div>
  );
};