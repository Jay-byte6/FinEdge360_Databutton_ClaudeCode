/**
 * SIPExecutionHistory - Track and display SIP execution history
 * Shows NAV-based unit calculations for each monthly SIP debit
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, Hash, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SIPExecution {
  id: string;
  holding_id: string;
  scheme_name: string;
  goal_id: string;
  goal_name: string;
  execution_date: string;
  amount: number;
  nav: number;
  units_purchased: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

interface SIPExecutionHistoryProps {
  userId: string;
  goalId?: string; // Optional: filter by specific goal
  holdingId?: string; // Optional: filter by specific holding
}

export const SIPExecutionHistory: React.FC<SIPExecutionHistoryProps> = ({
  userId,
  goalId,
  holdingId
}) => {
  const [executions, setExecutions] = useState<SIPExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSIPExecutions();
    }
  }, [userId, goalId, holdingId]);

  const fetchSIPExecutions = async () => {
    setIsLoading(true);
    try {
      let url = `${API_ENDPOINTS.baseUrl}/routes/sip-executions/${userId}`;
      const params = new URLSearchParams();
      if (goalId) params.append('goal_id', goalId);
      if (holdingId) params.append('holding_id', holdingId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions || []);
      }
    } catch (error) {
      console.error('[SIPExecutionHistory] Error fetching executions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Calculate summary statistics
  const totalInvested = executions
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalUnits = executions
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + e.units_purchased, 0);

  const avgNAV = executions.length > 0
    ? executions.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.nav, 0) / executions.filter(e => e.status === 'completed').length
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="ml-3 text-gray-600">Loading SIP history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (executions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SIP Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No SIP executions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              SIP will be executed automatically on the scheduled debit dates
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            SIP Execution History ({executions.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchSIPExecutions}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Total Invested</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalInvested)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Total Units</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalUnits.toFixed(3)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Average NAV</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">₹{avgNAV.toFixed(2)}</p>
          </div>
        </div>

        {/* Execution Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Execution Timeline</h4>
          <AnimatePresence>
            {executions.map((execution, index) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`rounded-lg border p-4 ${getStatusColor(execution.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-semibold text-sm">{execution.scheme_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/50">
                        {execution.goal_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Date</span>
                        <p className="font-semibold">{formatDate(execution.execution_date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount</span>
                        <p className="font-semibold">{formatCurrency(execution.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">NAV</span>
                        <p className="font-semibold">₹{execution.nav.toFixed(4)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Units</span>
                        <p className="font-semibold">{execution.units_purchased.toFixed(3)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      execution.status === 'completed' ? 'bg-green-100 text-green-700' :
                      execution.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {execution.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>How it works:</strong> On your scheduled debit date, the SIP amount is automatically invested at the day's NAV.
            Units are calculated as Amount ÷ NAV and added to your holdings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
