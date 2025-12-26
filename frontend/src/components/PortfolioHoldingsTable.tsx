import { useState } from 'react';
import { PortfolioHolding } from '@/types/portfolio';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

interface Goal {
  id: string;
  goal_name: string;
}

interface Props {
  holdings: PortfolioHolding[];
  userId?: string;
  goals?: Goal[];
  onEdit?: (holding: PortfolioHolding) => void;
  onDelete?: (holdingId: string) => void;
  onRefresh?: () => void;
}

type SortField = 'scheme_name' | 'market_value' | 'absolute_return_percentage';
type SortDirection = 'asc' | 'desc';

export const PortfolioHoldingsTable = ({ holdings, userId, goals = [], onEdit, onDelete, onRefresh }: Props) => {
  const [sortField, setSortField] = useState<SortField>('market_value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [assigningGoal, setAssigningGoal] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const handleDelete = async (holdingId: string) => {
    console.log('[PortfolioHoldingsTable] Delete clicked - holdingId:', holdingId, 'userId:', userId);

    if (!userId) {
      console.error('[PortfolioHoldingsTable] userId is missing!');
      toast.error('User ID is required to delete holding');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this holding? This action cannot be undone.')) {
      console.log('[PortfolioHoldingsTable] User cancelled delete confirmation');
      return;
    }

    console.log('[PortfolioHoldingsTable] Proceeding with delete request...');

    try {
      const response = await fetch(
        `${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${holdingId}?user_id=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete holding');
      }

      toast.success('Holding deleted successfully');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete holding:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete holding');
    }
  };

  const handleGoalAssignment = async (holdingId: string, goalId: string | null) => {
    console.log('[PortfolioHoldingsTable] Assigning holding', holdingId, 'to goal', goalId);

    setAssigningGoal(holdingId);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${holdingId}/assign-goal`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal_id: goalId === '' ? null : goalId })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to assign goal');
      }

      const goalName = goalId ? goals.find(g => g.id === goalId)?.goal_name : 'Unassigned';
      toast.success(`Holding ${goalId ? 'assigned to' : 'unassigned from'} ${goalName}`);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to assign goal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign goal');
    } finally {
      setAssigningGoal(null);
    }
  };

  // Get most recent NAV fetch timestamp from all holdings
  const getMostRecentNavFetch = () => {
    if (holdings.length === 0) return null;
    const timestamps = holdings
      .map(h => h.nav_last_fetched_at)
      .filter(t => t != null)
      .map(t => new Date(t as string).getTime());
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps)).toISOString();
  };

  const lastNavFetch = getMostRecentNavFetch();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Mutual Fund Holdings ({holdings.length})</CardTitle>
          {lastNavFetch && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {formatRelativeTime(lastNavFetch)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold">Folio</th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('scheme_name')}
                >
                  Scheme Name {sortField === 'scheme_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right font-semibold">Units</th>
                <th className="px-4 py-3 text-right font-semibold">Invested Value</th>
                <th className="px-4 py-3 text-right font-semibold">NAV</th>
                <th
                  className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('market_value')}
                >
                  Current Market Value {sortField === 'market_value' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right font-semibold">Profit/Loss</th>
                <th
                  className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('absolute_return_percentage')}
                >
                  Return % {sortField === 'absolute_return_percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                {goals.length > 0 && (
                  <th className="px-4 py-3 text-left font-semibold">Assign to Goal</th>
                )}
                {(onEdit || onDelete) && (
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => {
                const isProfit = holding.absolute_profit >= 0;
                const profitColor = isProfit ? 'text-green-600' : 'text-red-600';
                const bgColor = isProfit ? 'bg-green-50' : 'bg-red-50';

                return (
                  <tr key={holding.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">
                      {holding.folio_number}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={holding.scheme_name}>
                        {holding.scheme_name}
                      </div>
                      {holding.amc_name && (
                        <div className="text-xs text-gray-500 mt-0.5">{holding.amc_name}</div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        NAV Date: {formatDate(holding.nav_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {holding.unit_balance.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(holding.cost_value)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      ₹{holding.current_nav.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-sm">
                      {formatCurrency(holding.market_value)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold text-sm ${profitColor}`}>
                      {isProfit && '+'}
                      {formatCurrency(holding.absolute_profit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${profitColor} font-semibold text-sm`}
                      >
                        {isProfit ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {isProfit && '+'}
                        {holding.absolute_return_percentage.toFixed(2)}%
                      </div>
                    </td>
                    {goals.length > 0 && (
                      <td className="px-4 py-3">
                        <select
                          value={holding.goal_id || ''}
                          onChange={(e) => handleGoalAssignment(holding.id, e.target.value || null)}
                          disabled={assigningGoal === holding.id}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
                        >
                          <option value="">-- Select Goal --</option>
                          {goals.map((goal) => (
                            <option key={goal.id} value={goal.id}>
                              {goal.goal_name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(holding)}
                              className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit holding"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => handleDelete(holding.id)}
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete holding"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {holdings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No holdings found</p>
              <p className="text-sm mt-1">Upload your CAMS statement to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
