import { PortfolioSummary } from '@/types/portfolio';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Wallet, Target, Activity, TrendingDown } from 'lucide-react';

interface Props {
  summary: PortfolioSummary;
}

export const PortfolioSummaryCards = ({ summary }: Props) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const cards = [
    {
      title: 'Total Investment',
      value: formatCurrency(summary.total_investment),
      icon: Wallet,
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Amount invested'
    },
    {
      title: 'Current Value',
      value: formatCurrency(summary.current_value),
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Market value today'
    },
    {
      title: 'Total Profit/Loss',
      value: formatCurrency(Math.abs(summary.total_profit)),
      icon: summary.total_profit >= 0 ? TrendingUp : TrendingDown,
      color: summary.total_profit >= 0 ? 'green' : 'red',
      bgColor: summary.total_profit >= 0 ? 'bg-green-500' : 'bg-red-500',
      lightBg: summary.total_profit >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: summary.total_profit >= 0 ? 'text-green-700' : 'text-red-700',
      description: summary.total_profit >= 0 ? 'Profit earned' : 'Loss incurred',
      prefix: summary.total_profit >= 0 ? '+' : '-'
    },
    {
      title: 'Overall Return',
      value: `${summary.overall_return >= 0 ? '+' : ''}${summary.overall_return.toFixed(2)}%`,
      icon: summary.overall_return >= 0 ? TrendingUp : TrendingDown,
      color: summary.overall_return >= 0 ? 'green' : 'red',
      bgColor: summary.overall_return >= 0 ? 'bg-green-500' : 'bg-red-500',
      lightBg: summary.overall_return >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: summary.overall_return >= 0 ? 'text-green-700' : 'text-red-700',
      description: 'Absolute return'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`${card.lightBg} p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.textColor} break-words`}>
                      {card.prefix}{card.value}
                    </p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{card.description}</p>
                  {index === 3 && (
                    <span className={`text-xs font-semibold ${card.textColor}`}>
                      {summary.holdings_count} funds
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
