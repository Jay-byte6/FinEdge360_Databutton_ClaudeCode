import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { PortfolioHolding } from '@/types/portfolio';
import { API_ENDPOINTS } from '@/config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  holding: PortfolioHolding;
  onSuccess: () => void;
}

export const EditHoldingModal = ({ isOpen, onClose, holding, onSuccess }: Props) => {
  const [units, setUnits] = useState(holding.unit_balance.toString());
  const [investedValue, setInvestedValue] = useState(holding.cost_value.toString());
  const [folioNumber, setFolioNumber] = useState(holding.folio_number);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when holding prop changes
  useEffect(() => {
    setUnits(holding.unit_balance.toString());
    setInvestedValue(holding.cost_value.toString());
    setFolioNumber(holding.folio_number);
  }, [holding]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const unitsNum = parseFloat(units);
    const investedValueNum = parseFloat(investedValue);

    if (isNaN(unitsNum) || unitsNum <= 0) {
      toast.error('Please enter valid units');
      return;
    }

    if (isNaN(investedValueNum) || investedValueNum <= 0) {
      toast.error('Please enter valid invested value');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend will calculate avg_cost_per_unit = invested_value / units
      // and auto-fetch current NAV
      const response = await fetch(
        `${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${holding.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unit_balance: unitsNum,
            invested_value: investedValueNum,
            folio_number: folioNumber,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update holding');
      }

      toast.success('Holding updated successfully with latest NAV!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update holding:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update holding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Holding</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Scheme Name (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheme Name
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {holding.scheme_name}
            </div>
            <p className="mt-1 text-xs text-gray-500">Scheme name cannot be edited</p>
          </div>

          {/* ISIN (Read-only) */}
          {holding.isin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISIN (for NAV Tracking)
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700">
                {holding.isin}
              </div>
              <p className="mt-1 text-xs text-gray-500">ISIN is used for automatic NAV updates and goal tracking</p>
            </div>
          )}

          {/* Units */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.001"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="Enter number of units"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Total Invested Value */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Total Invested Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={investedValue}
              onChange={(e) => setInvestedValue(e.target.value)}
              placeholder="e.g., 50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-700 font-medium">
                Enter the total amount you invested
              </p>
              <p className="text-xs text-gray-600">
                • Current NAV will be auto-fetched from online
              </p>
              <p className="text-xs text-gray-600">
                • Returns = (Current Market Value - Invested Value) / Invested Value × 100
              </p>
            </div>
          </div>

          {/* Folio Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folio Number
            </label>
            <input
              type="text"
              value={folioNumber}
              onChange={(e) => setFolioNumber(e.target.value)}
              placeholder="Enter folio number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Current Values Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-900 mb-2">Current Values</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Cost Value:</span>
                <span className="ml-1 font-medium">₹{holding.cost_value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Market Value:</span>
                <span className="ml-1 font-medium">₹{holding.market_value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Profit/Loss:</span>
                <span className={`ml-1 font-medium ${holding.absolute_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{holding.absolute_profit.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Return:</span>
                <span className={`ml-1 font-medium ${holding.absolute_return_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.absolute_return_percentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Values will be recalculated after update</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
