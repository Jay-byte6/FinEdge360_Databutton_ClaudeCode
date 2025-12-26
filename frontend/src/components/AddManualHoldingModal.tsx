import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { SchemeSearchInput } from './SchemeSearchInput';
import { API_ENDPOINTS } from '@/config/api';

interface Scheme {
  scheme_code: string;
  scheme_name: string;
  amc_name: string;
  category: string;
  isin_growth?: string;
  isin_div_reinvestment?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export const AddManualHoldingModal = ({ isOpen, onClose, userId, onSuccess }: Props) => {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isin, setIsin] = useState('');
  const [isinType, setIsinType] = useState<'growth' | 'div'>('growth');
  const [units, setUnits] = useState('');
  const [investedValue, setInvestedValue] = useState('');
  const [folioNumber, setFolioNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingIsin, setIsFetchingIsin] = useState(false);

  if (!isOpen) return null;

  const handleSchemeSelect = async (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsFetchingIsin(true);

    try {
      // Fetch detailed scheme info including ISIN
      const response = await fetch(
        `${API_ENDPOINTS.baseUrl}/routes/scheme-details/${scheme.scheme_code}`
      );

      if (response.ok) {
        const data = await response.json();
        const schemeDetails = data.scheme;

        // Set ISIN - prefer growth ISIN
        if (schemeDetails.isin_growth) {
          setIsin(schemeDetails.isin_growth);
          setIsinType('growth');
        } else if (schemeDetails.isin_div_reinvestment) {
          setIsin(schemeDetails.isin_div_reinvestment);
          setIsinType('div');
        } else {
          // ISIN not available - allow manual entry
          toast.info('ISIN not found in database. Please enter it manually from your fund fact sheet.');
          setIsin(''); // Keep scheme selected, allow manual ISIN entry
        }
      }
    } catch (error) {
      console.error('Failed to fetch scheme details:', error);
      toast.warning('Could not auto-fetch ISIN. Please enter it manually.');
      setIsin(''); // Keep scheme selected, allow manual ISIN entry
    } finally {
      setIsFetchingIsin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedScheme || !units) {
      toast.error('Please select a scheme and enter units');
      return;
    }

    if (!isin) {
      toast.error('ISIN is required. Please select a valid scheme from the dropdown.');
      return;
    }

    const unitsNum = parseFloat(units);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      toast.error('Please enter valid units');
      return;
    }

    const investedValueNum = investedValue ? parseFloat(investedValue) : undefined;
    if (investedValue && (isNaN(investedValueNum!) || investedValueNum! <= 0)) {
      toast.error('Please enter valid invested value');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend will auto-fetch current NAV and calculate avg_cost_per_unit
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/add-manual-holding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          scheme_code: selectedScheme.scheme_code,
          scheme_name: selectedScheme.scheme_name,
          isin: isin,  // MANDATORY for NAV tracking
          unit_balance: unitsNum,
          invested_value: investedValueNum,
          folio_number: folioNumber || undefined,
          purchase_date: purchaseDate || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add holding');
      }

      toast.success('Holding added successfully with latest NAV!');
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Failed to add holding:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add holding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedScheme(null);
    setIsin('');
    setIsinType('growth');
    setUnits('');
    setInvestedValue('');
    setFolioNumber('');
    setPurchaseDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Holding Manually</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Scheme Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mutual Fund Scheme <span className="text-red-500">*</span>
            </label>
            <SchemeSearchInput
              onSelect={handleSchemeSelect}
              placeholder="Search for scheme (e.g., HDFC, SBI, ICICI)"
            />
            {selectedScheme && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                Selected: {selectedScheme.scheme_name}
              </div>
            )}
            {isFetchingIsin && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                Fetching ISIN for NAV tracking...
              </div>
            )}
          </div>

          {/* ISIN Input (Auto-populated or Manual Entry) */}
          {selectedScheme && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISIN ({isinType === 'growth' ? 'Growth Plan' : 'Dividend Reinvestment Plan'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={isin}
                onChange={(e) => setIsin(e.target.value.toUpperCase())}
                placeholder="INF123456789 (12 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={12}
                required
              />
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">📝 How to find ISIN:</p>
                <ul className="text-xs text-blue-700 space-y-1 ml-2">
                  <li>• Check your fund fact sheet or statement</li>
                  <li>• Visit the AMC website and search for your scheme</li>
                  <li>• Google: "{selectedScheme.scheme_name} ISIN"</li>
                  <li>• ISIN format: 12 characters (e.g., INF123456789)</li>
                </ul>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Required for automatic NAV updates and goal tracking
              </p>
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
              Total Invested Value (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              value={investedValue}
              onChange={(e) => setInvestedValue(e.target.value)}
              placeholder="e.g., 50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-700 font-medium">
                Enter the total amount you invested
              </p>
              <p className="text-xs text-gray-600">
                • Current NAV will be auto-fetched from online
              </p>
              <p className="text-xs text-gray-600">
                • If left blank, current NAV will be used as cost (returns will be 0%)
              </p>
              <p className="text-xs text-gray-600">
                • Returns = (Current Market Value - Invested Value) / Invested Value × 100
              </p>
            </div>
          </div>

          {/* Folio Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folio Number (Optional)
            </label>
            <input
              type="text"
              value={folioNumber}
              onChange={(e) => setFolioNumber(e.target.value)}
              placeholder="Enter folio number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date (Optional)
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedScheme || !units || isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
