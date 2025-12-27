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

      // Save to backend database
      console.log('Feedback submitted:', feedbackData);

      // Store in localStorage as backup
      const existingFeedback = localStorage.getItem('finedge360_feedback_submissions');
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackArray.push(feedbackData);
      localStorage.setItem('finedge360_feedback_submissions', JSON.stringify(feedbackArray));

      // Send to backend API for database storage
      try {
        const response = await fetch(API_ENDPOINTS.submitFeedback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });

        if (response.ok) {
          toast.success('Thank you for your valuable feedback! 🎉 Your input helps us improve FIREMap.');
        } else {
          // If backend fails, still show success since we have localStorage backup
          console.warn('Backend submission failed, but saved to localStorage');
          toast.success('Thank you for your valuable feedback! 🎉 (Saved locally)');
        }
      } catch (error) {
        console.error('Backend submission error:', error);
        // Still show success since we have localStorage backup
        toast.success('Thank you for your valuable feedback! 🎉 (Saved locally)');
      }

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
