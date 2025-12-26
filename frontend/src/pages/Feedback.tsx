/**
 * Feedback Page - Engaging Typeform-style feedback collection
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeformFeedback } from '@/components/TypeformFeedback';
import useAuthStore from '../utils/authStore';
import useFinancialDataStore from '../utils/financialDataStore';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

export default function Feedback() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { financialData } = useFinancialDataStore();

  const userName = financialData?.personalInfo?.name || user?.email?.split('@')[0] || 'User';

  const handleSubmit = async (responses: Record<string, any>) => {
    try {
      // Submit feedback to backend
      const feedbackData = {
        userId: user?.id,
        userName,
        userEmail: user?.email,
        responses,
        timestamp: new Date().toISOString(),
        source: 'in-app-feedback'
      };

      // For now, log to console and localStorage
      // TODO: Replace with actual API call when backend endpoint is ready
      console.log('Feedback submitted:', feedbackData);

      // Store in localStorage as backup
      const existingFeedback = localStorage.getItem('finedge360_feedback_submissions');
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackArray.push(feedbackData);
      localStorage.setItem('finedge360_feedback_submissions', JSON.stringify(feedbackArray));

      // Show success toast
      toast.success('Thank you for your valuable feedback! 🎉');

      // Optional: Send to backend API
      // Uncomment when backend endpoint is ready
      /*
      try {
        await fetch(API_ENDPOINTS.submitFeedback(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });
      } catch (error) {
        console.error('Error sending feedback to backend:', error);
      }
      */

      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
      return Promise.reject(error);
    }
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <TypeformFeedback
      onSubmit={handleSubmit}
      onClose={handleClose}
      userName={userName}
    />
  );
}
