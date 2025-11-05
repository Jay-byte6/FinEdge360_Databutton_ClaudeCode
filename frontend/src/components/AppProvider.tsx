import type { ReactNode } from "react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import useAuthStore from "../utils/authStore";
import { supabase } from "../utils/supabase";
import brain from "brain";
import { toast } from "sonner";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

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
  const { refreshSession } = useAuthStore();
  const location = useLocation();
  
  // Set document title
  useEffect(() => {
    document.title = "FinEdge360";
  }, []); // Empty dependency array ensures this runs once on mount

  // Determine if we should show the navbar and footer based on current route
  const hideNavbarRoutes = ["/login"];
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

    // Set up auth state change listener
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshSession();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [refreshSession]);

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowNavbar && <NavBar showFullNav={location.pathname !== "/"} />}
      <div className="flex-grow">
        {children}
      </div>
      {shouldShowFooter && <Footer />}
      <Toaster position="top-right" richColors />
    </div>
  );
};