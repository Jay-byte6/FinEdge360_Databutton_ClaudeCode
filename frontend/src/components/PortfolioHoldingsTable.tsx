import { useState } from 'react';
import { PortfolioHolding } from '@/types/portfolio';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface Props {
  holdings: PortfolioHolding[];
}

type SortField = 'scheme_name' | 'market_value' | 'absolute_return_percentage';
type SortDirection = 'asc' | 'desc';

export const PortfolioHoldingsTable = ({ holdings }: Props) => {
  const [sortField, setSortField] = useState<SortField>('market_value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Mutual Fund Holdings ({holdings.length})</CardTitle>
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
                <th className="px-4 py-3 text-right font-semibold">Cost</th>
                <th className="px-4 py-3 text-right font-semibold">NAV</th>
                <th
                  className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('market_value')}
                >
                  Value {sortField === 'market_value' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right font-semibold">Profit/Loss</th>
                <th
                  className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('absolute_return_percentage')}
                >
                  Return % {sortField === 'absolute_return_percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
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
                        {formatDate(holding.nav_date)}
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
