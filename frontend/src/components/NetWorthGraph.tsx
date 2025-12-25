import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface NetWorthHistoryPoint {
  date: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

interface NetWorthGraphProps {
  userId: string;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const NetWorthGraph = ({ userId }: NetWorthGraphProps) => {
  const [history, setHistory] = useState<NetWorthHistoryPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3M');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [userId, selectedRange]);

  const fetchHistory = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.baseUrl}/routes/net-worth-history/${userId}?range=${selectedRange}`
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('[NetWorthGraph] Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: selectedRange === 'ALL' || selectedRange === '1Y' ? '2-digit' : undefined
    });
  };

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {formatDate(payload[0].payload.date)}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold text-blue-600">Net Worth:</span>{' '}
              ₹{payload[0].payload.netWorth.toLocaleString('en-IN')}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-green-600">Assets:</span>{' '}
              ₹{payload[0].payload.totalAssets.toLocaleString('en-IN')}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-red-600">Liabilities:</span>{' '}
              ₹{payload[0].payload.totalLiabilities.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Net Worth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading graph...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Net Worth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No historical data yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Your net worth will be tracked automatically. Check back tomorrow!
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
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Net Worth Trend
          </CardTitle>

          {/* Time Range Selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs px-3 py-1 ${
                  selectedRange === range.value
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#2563eb"
                strokeWidth={3}
                name="Net Worth"
                dot={{ r: 4, fill: '#2563eb' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="totalAssets"
                stroke="#16a34a"
                strokeWidth={2}
                name="Total Assets"
                dot={{ r: 3, fill: '#16a34a' }}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="totalLiabilities"
                stroke="#dc2626"
                strokeWidth={2}
                name="Total Liabilities"
                dot={{ r: 3, fill: '#dc2626' }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        {history.length > 1 && (
          <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">First Snapshot</p>
              <p className="text-sm font-semibold text-gray-700">
                ₹{history[0].netWorth.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400">{formatDate(history[0].date)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Latest</p>
              <p className="text-sm font-semibold text-gray-700">
                ₹{history[history.length - 1].netWorth.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400">{formatDate(history[history.length - 1].date)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Change</p>
              <p className={`text-sm font-semibold ${
                history[history.length - 1].netWorth >= history[0].netWorth
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {history[history.length - 1].netWorth >= history[0].netWorth ? '+' : ''}
                ₹{(history[history.length - 1].netWorth - history[0].netWorth).toLocaleString('en-IN')}
              </p>
              <p className={`text-xs ${
                history[history.length - 1].netWorth >= history[0].netWorth
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {history[history.length - 1].netWorth >= history[0].netWorth ? '+' : ''}
                {(((history[history.length - 1].netWorth - history[0].netWorth) / history[0].netWorth) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
