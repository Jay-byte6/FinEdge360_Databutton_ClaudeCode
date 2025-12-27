import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import { TrendingUp, TrendingDown, Loader2, IndianRupee, Calendar } from 'lucide-react';

interface Holding {
  id: string;
  scheme_name: string;
  folio_number: string;
  asset_class: string;
  unit_balance: number;
  cost_value: number;
  market_value: number;
  absolute_profit: number;
  absolute_return_percentage: number;
  goal_id: string | null;
  monthly_sip_amount?: number;
  auto_debit_date?: number; // Day of month (1-28)
}

interface AssignHoldingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalName: string;
  userId: string;
  onSuccess?: () => void;
}

export const AssignHoldingsModal = ({
  open,
  onOpenChange,
  goalId,
  goalName,
  userId,
  onSuccess
}: AssignHoldingsModalProps) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedHoldings, setSelectedHoldings] = useState<Set<string>>(new Set());
  const [sipAmounts, setSipAmounts] = useState<Record<string, number>>({});
  const [debitDates, setDebitDates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchHoldings();
    }
  }, [open, userId]);

  const fetchHoldings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHoldings(data.holdings || []);

        // Pre-select holdings already assigned to this goal
        const preSelected = new Set(
          (data.holdings || [])
            .filter((h: Holding) => h.goal_id === goalId)
            .map((h: Holding) => h.id)
        );
        setSelectedHoldings(preSelected);

        // Pre-populate SIP amounts and debit dates from existing holdings
        const initialSipAmounts: Record<string, number> = {};
        const initialDebitDates: Record<string, number> = {};
        (data.holdings || []).forEach((h: Holding) => {
          if (h.monthly_sip_amount) {
            initialSipAmounts[h.id] = h.monthly_sip_amount;
          }
          if (h.auto_debit_date) {
            initialDebitDates[h.id] = h.auto_debit_date;
          }
        });
        setSipAmounts(initialSipAmounts);
        setDebitDates(initialDebitDates);
      }
    } catch (error) {
      console.error('[AssignHoldingsModal] Error fetching holdings:', error);
      toast.error('Failed to load holdings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHolding = (holdingId: string) => {
    setSelectedHoldings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(holdingId)) {
        newSet.delete(holdingId);
      } else {
        newSet.add(holdingId);
      }
      return newSet;
    });
  };

  const handleSipAmountChange = (holdingId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSipAmounts(prev => ({
      ...prev,
      [holdingId]: numValue
    }));
  };

  const handleDebitDateChange = (holdingId: string, value: string) => {
    const dateValue = parseInt(value) || 1;
    setDebitDates(prev => ({
      ...prev,
      [holdingId]: dateValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Get holdings that need to be updated
      const holdingsToAssign = holdings.filter(h =>
        selectedHoldings.has(h.id) && h.goal_id !== goalId
      );
      const holdingsToUnassign = holdings.filter(h =>
        !selectedHoldings.has(h.id) && h.goal_id === goalId
      );

      // Also update SIP amounts for currently selected holdings
      const holdingsToUpdate = holdings.filter(h =>
        selectedHoldings.has(h.id) && h.goal_id === goalId
      );

      // Make API calls for all changes
      const assignPromises = holdingsToAssign.map(h =>
        fetch(`${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${h.id}/assign-goal`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal_id: goalId,
            monthly_sip_amount: sipAmounts[h.id] || 0,
            auto_debit_date: debitDates[h.id] || null
          })
        })
      );

      const unassignPromises = holdingsToUnassign.map(h =>
        fetch(`${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${h.id}/assign-goal`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal_id: null,
            monthly_sip_amount: 0,
            auto_debit_date: null
          })
        })
      );

      // Update SIP amounts and debit dates for already assigned holdings
      const updatePromises = holdingsToUpdate.map(h =>
        fetch(`${API_ENDPOINTS.baseUrl}/routes/portfolio-holdings/${h.id}/assign-goal`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal_id: goalId,
            monthly_sip_amount: sipAmounts[h.id] || 0,
            auto_debit_date: debitDates[h.id] || null
          })
        })
      );

      await Promise.all([...assignPromises, ...unassignPromises, ...updatePromises]);

      const assignedCount = holdingsToAssign.length;
      const unassignedCount = holdingsToUnassign.length;
      const updatedCount = holdingsToUpdate.length;

      if (assignedCount > 0 || unassignedCount > 0 || updatedCount > 0) {
        const messages = [];
        if (assignedCount > 0) messages.push(`${assignedCount} assigned`);
        if (unassignedCount > 0) messages.push(`${unassignedCount} unassigned`);
        if (updatedCount > 0) messages.push(`${updatedCount} SIP updated`);
        toast.success(`Updated: ${messages.join(', ')}`);
      } else {
        toast.success('No changes made');
      }

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      console.error('[AssignHoldingsModal] Error saving:', error);
      toast.error('Failed to save assignments');
    } finally {
      setIsSaving(false);
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

  const assetColors: Record<string, string> = {
    Equity: 'bg-blue-500',
    Debt: 'bg-green-500',
    Hybrid: 'bg-purple-500',
    Gold: 'bg-yellow-500',
    Liquid: 'bg-cyan-500'
  };

  const selectedCount = selectedHoldings.size;
  const unassignedHoldings = holdings.filter(h => !h.goal_id || h.goal_id === goalId);
  const otherGoalHoldings = holdings.filter(h => h.goal_id && h.goal_id !== goalId);

  // Calculate total monthly SIP for selected holdings
  const totalMonthlySip = Array.from(selectedHoldings).reduce((sum, holdingId) => {
    return sum + (sipAmounts[holdingId] || 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Assign Holdings to {goalName}</DialogTitle>
          <DialogDescription>
            Select which mutual fund holdings should be assigned to this goal.
            {selectedCount > 0 && ` (${selectedCount} selected)`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading holdings...</span>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-medium">No holdings found</p>
            <p className="text-sm text-gray-500 mt-1">Add holdings in the Portfolio page first</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Available Holdings */}
            {unassignedHoldings.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">
                  Available Holdings ({unassignedHoldings.length})
                </h4>
                <div className="space-y-2">
                  {unassignedHoldings.map(holding => {
                    const isSelected = selectedHoldings.has(holding.id);
                    const isProfit = holding.absolute_profit >= 0;

                    return (
                      <div
                        key={holding.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleToggleHolding(holding.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleHolding(holding.id)}
                          className="mt-1"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {holding.scheme_name}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${assetColors[holding.asset_class]}`}>
                              {holding.asset_class}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Folio: {holding.folio_number}</span>
                            <span>Units: {holding.unit_balance.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-900">
                              {formatCurrency(holding.market_value)}
                            </div>
                            <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                              {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {isProfit ? '+' : ''}{holding.absolute_return_percentage.toFixed(2)}%
                            </div>
                          </div>
                          {isSelected && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-3 w-3 text-gray-500" />
                                <Input
                                  type="number"
                                  placeholder="Monthly SIP"
                                  value={sipAmounts[holding.id] || ''}
                                  onChange={(e) => handleSipAmountChange(holding.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-8 w-28 text-xs"
                                  min="0"
                                  step="500"
                                />
                              </div>
                              {sipAmounts[holding.id] > 0 && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <Select
                                    value={debitDates[holding.id]?.toString() || ''}
                                    onValueChange={(value) => handleDebitDateChange(holding.id, value)}
                                  >
                                    <SelectTrigger className="h-8 w-28 text-xs" onClick={(e) => e.stopPropagation()}>
                                      <SelectValue placeholder="Debit Date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                        <SelectItem key={day} value={day.toString()}>
                                          {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Holdings Assigned to Other Goals */}
            {otherGoalHoldings.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">
                  Already Assigned to Other Goals ({otherGoalHoldings.length})
                </h4>
                <div className="space-y-2">
                  {otherGoalHoldings.map(holding => {
                    const isProfit = holding.absolute_profit >= 0;

                    return (
                      <div
                        key={holding.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-60"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-gray-700 truncate">
                              {holding.scheme_name}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${assetColors[holding.asset_class]}`}>
                              {holding.asset_class}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Assigned to another goal
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-sm text-gray-700">
                            {formatCurrency(holding.market_value)}
                          </div>
                          <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {isProfit ? '+' : ''}{holding.absolute_return_percentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-600">
              {selectedCount} holding{selectedCount !== 1 ? 's' : ''} will be assigned to this goal
            </div>
            {totalMonthlySip > 0 && (
              <div className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                Total Monthly SIP: ₹{totalMonthlySip.toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || holdings.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Assignments'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
