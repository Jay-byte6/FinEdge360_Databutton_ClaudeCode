/**
 * Journey Page - Dedicated page for Financial Freedom Journey Map
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinancialFreedomJourney } from '@/components/journey';
import useAuthStore from '@/utils/authStore';

export default function Journey() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return <FinancialFreedomJourney />;
}
