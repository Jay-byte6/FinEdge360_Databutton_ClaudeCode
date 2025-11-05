import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load user routes
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const SIPPlanner = lazy(() => import('../pages/SIPPlanner'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const TaxPlanning = lazy(() => import('../pages/TaxPlanning'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

/**
 * UserRoutes component to handle routes that aren't in the main router
 * This is necessary because we can't modify the read-only router.tsx file
 */
export const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sip-planner" element={<SIPPlanner />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/tax-planning" element={<TaxPlanning />} />
    </Routes>
  );
};
