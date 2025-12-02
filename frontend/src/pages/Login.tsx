import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../utils/authStore";
import { toast } from "sonner";

// Top-level log to verify file loads
console.log("####### Login.tsx FILE LOADED (v2 - with isLoading fix) #######");
console.log("useAuthStore imported:", typeof useAuthStore);

export default function Login() {
  console.log("####### Login() COMPONENT RENDERING #######");
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signUp, isAuthenticated, isLoading, error, isRegistering, toggleAuthMode, resetPassword, refreshSession } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Get stored password reset data
  const [storedData, setStoredData] = useState(() => {
    const data = localStorage.getItem('resetPasswordData');
    return data ? JSON.parse(data) : null;
  });

  // Refresh stored data when needed
  const refreshStoredData = () => {
    const data = localStorage.getItem('resetPasswordData');
    setStoredData(data ? JSON.parse(data) : null);
  };

  // Handle OAuth callback on page load
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      console.log('=== LOGIN PAGE OAUTH CHECK ===');
      console.log('Hash params:', window.location.hash);
      console.log('Search params:', window.location.search);
      console.log('Has access_token:', hashParams.has('access_token'));
      console.log('Has code:', searchParams.has('code'));

      if (hashParams.has('access_token') || searchParams.has('code')) {
        console.log('OAuth callback detected, refreshing session...');
        await refreshSession();
      }
    };

    handleOAuthCallback();
  }, [refreshSession]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Display error toast if authentication fails
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  const handleLogin = async (e: React.FormEvent) => {
    console.log("=== LOGIN BUTTON CLICKED ===");
    e.preventDefault();

    if (!email || !password) {
      console.log("ERROR: Missing email or password");
      toast.error("Please provide both email and password");
      return;
    }

    console.log("Starting login process for:", email);

    try {
      setIsSubmitting(true);
      console.log("isSubmitting set to true");
      
      // When registering a new account
      if (isRegistering) {
        // Create login account for testing
        if (email.includes('demo') || email.includes('test') || email.endsWith('@test.com')) {
          // First try to sign in with these credentials
          try {
            console.log('Trying automatic login for demo/test account');
            // Attempt to sign in with the provided credentials
            await signIn(email, password);
            return;
          } catch (signInError: any) {
            console.log('Auto-login failed, will create new account:', signInError);
            // If sign in fails, continue with sign up
          }
        }
        
        try {
          const response = await signUp(email, password);
          if (response && response.requiresEmailConfirmation) {
            setEmailConfirmationRequired(true);
          }
        } catch (signUpError: any) {
          // Error is already handled by auth store
          console.error("Sign up error:", signUpError);
        }
      } 
      // When signing in
      else {
        try {
          console.log("=== CALLING signIn FUNCTION ===");
          console.log("Email:", email);
          console.log("About to call signIn...");
          await signIn(email, password);
          console.log("=== signIn COMPLETED ===");
        } catch (signInError: any) {
          // Error is already handled by auth store
          console.error("=== signIn ERROR ===", signInError);
        }
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please provide your email address");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await resetPassword(email);
      
      if (success) {
        setResetEmailSent(true);
        // Refresh stored data to get the new OTP
        refreshStoredData();
        // Don't automatically show the reset form
        // Let user click the button instead
      }
    } catch (error: any) {
      // Error is handled by the auth store
      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password reset submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (resetCode.length !== 6 || !/^\d+$/.test(resetCode)) {
      toast.error("Please enter the 6-digit code sent to your email");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { verifyOTPAndResetPassword } = useAuthStore.getState();
      const success = await verifyOTPAndResetPassword(resetCode, newPassword);
      
      if (success) {
        // Hide reset forms and show login form again
        setShowForgotPassword(false);
        setShowResetPasswordForm(false);
        setResetEmailSent(false);
        setResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        toast.success("Password has been reset successfully. You can now sign in with your new password.");
      }
    } catch (error: any) {
      console.error("Password reset verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoToHome = () => {
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg cursor-pointer"
            onClick={handleGoToHome}
          >
            FinE
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Welcome to FinEdge360
          </h1>
          <p className="text-gray-600">
            {showForgotPassword 
              ? "Reset your password"
              : isRegistering 
                ? "Create an account" 
                : "Sign in to continue to your financial planning dashboard"}
          </p>
          {isRegistering && (
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-medium">Pro tip:</span> Use an email with "test" or "demo" for instant signup without email confirmation.
            </p>
          )}
        </div>
        
        {/* Login Form */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          {resetEmailSent && !showResetPasswordForm ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-1">Password Reset Email Sent</h3>
              <p className="text-sm">
                We've sent password reset instructions to <span className="font-medium">{email}</span>.
                Please check your email and follow the link to reset your password.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Refresh stored data before showing the reset form
                    refreshStoredData();
                    setShowResetPasswordForm(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 transition-all duration-300 ease-in-out"
                >
                  Continue to Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out"
                >
                  Return to sign in
                </button>
              </div>
            </div>
          ) : showResetPasswordForm ? (
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6">
                <h3 className="font-medium mb-1">Verification Code</h3>
                <p className="text-sm">
                  We've sent a verification code to <span className="font-medium">{email}</span>.
                </p>
                <p className="text-sm mt-1">
                  <strong>For demonstration purposes:</strong> The code is displayed below.
                </p>
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-center">
                  <span className="font-mono font-bold text-lg">{storedData?.otp}</span>
                </div>
                <p className="text-xs mt-2">
                  <strong>Code validity:</strong> 15 minutes from request time
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      const success = await resetPassword(email);
                      if (success) {
                        toast.success("New verification code generated");
                        // Refresh stored data to get the new OTP
                        refreshStoredData();
                        setResetCode(""); // Clear the input field when code changes
                      }
                    } catch (error) {
                      console.error("Error generating code:", error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : "Generate new code"}
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                <input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowResetPasswordForm(false);
                  setResetEmailSent(false);
                }}
                className="w-full mt-3 px-4 py-2 bg-white text-gray-700 border border-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out"
              >
                Back to Sign In
              </button>
            </form>
          ) : emailConfirmationRequired ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-1">Email Confirmation Required</h3>
              <p className="text-sm">
                We've sent a confirmation link to <span className="font-medium">{email}</span>.
                Please check your email and click the link to activate your account.
              </p>
              <p className="text-sm mt-2">
                After confirming your email, you can sign in with your credentials.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailConfirmationRequired(false);
                  toggleAuthMode();
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
              >
                Return to sign in
              </button>
            </div>
          ) : showForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-6">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting || isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  {!isRegistering && (
                    <button 
                      type="button" 
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                onClick={() => console.log("####### BUTTON CLICKED (onClick) #######")}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting || isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <span>{isRegistering ? "Sign Up" : "Sign In"}</span>
                )}
              </button>

              {/* OR Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isLoading}
                className="w-full px-4 py-3 bg-white text-gray-700 font-medium rounded-md border-2 border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>{isRegistering ? "Sign Up with Google" : "Sign In with Google"}</span>
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => toggleAuthMode()}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={handleGoToHome}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
        
        {/* Footer note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For demo purposes, please use the credentials provided by your administrator</p>
          <p className="mt-1 text-xs">
            <span className="font-medium">Testing Tip:</span> Emails containing "test", "demo" or ending with "@test.com" will skip email verification
          </p>
        </div>
      </div>
    </div>
  );
}

