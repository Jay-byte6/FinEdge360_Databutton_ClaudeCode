import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAuthStore from "../utils/authStore";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { verifyOTPAndResetPassword, resetPassword } = useAuthStore();
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);
  
  // Get stored data from localStorage
  const [storedData, setStoredData] = useState(() => {
    const data = localStorage.getItem('resetPasswordData');
    return data ? JSON.parse(data) : null;
  });
  
  // Refresh stored data when needed
  const refreshStoredData = () => {
    const data = localStorage.getItem('resetPasswordData');
    setStoredData(data ? JSON.parse(data) : null);
  };
  
  useEffect(() => {
    if (storedData) {
      setEmail(storedData.email);
      setShowEmailForm(false);
    }
  }, []);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await resetPassword(email);
      
      if (success) {
        setShowEmailForm(false);
        // Update stored data
        refreshStoredData();
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error("Please enter the 6-digit code sent to your email");
      return;
    }

    try {
      setIsSubmitting(true);

      const success = await verifyOTPAndResetPassword(otp, newPassword);

      if (success) {
        setPasswordResetComplete(true);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg cursor-pointer"
            onClick={handleGoToLogin}
          >
            FN
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            {passwordResetComplete 
              ? "Your password has been successfully reset" 
              : showEmailForm 
                ? "Enter your email to receive a reset code"
                : "Enter the verification code and your new password"}
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          {!storedData && !showEmailForm ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-500 rounded-full mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">No Reset Request Found</h2>
              <p className="text-gray-600 mb-6">Please request a password reset code first.</p>
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
              >
                Request Reset Code
              </button>
            </div>
          ) : showEmailForm ? (
            <form onSubmit={handleRequestCode}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </button>
              
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full mt-4 px-4 py-3 bg-white text-gray-700 border border-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out"
              >
                Back to Sign In
              </button>
            </form>
          ) : passwordResetComplete ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-500 rounded-full mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Password Reset Successful</h2>
              <p className="text-gray-600 mb-6">Your password has been updated. You can now sign in with your new password.</p>
              <button
                onClick={handleGoToLogin}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
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
                        // Update stored data
                        refreshStoredData();
                        setOtp(""); // Clear the input field when code changes
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
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full mt-4 px-4 py-3 bg-white text-gray-700 border border-gray-300 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-all duration-300 ease-in-out"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}