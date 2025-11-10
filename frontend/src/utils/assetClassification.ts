// Asset classification mapping for portfolio allocation analysis

export interface AssetDetail {
  field: string;
  displayName: string;
  category: 'liquid' | 'illiquid';
}

export interface AssetClassificationMapping {
  className: string;
  description: string;
  color: string;
  assets: AssetDetail[];
}

// Map asset fields to their allocation classes
export const assetClassifications: Record<string, AssetClassificationMapping> = {
  Debt: {
    className: 'Debt',
    description: 'Fixed-income investments providing stable returns with lower risk',
    color: '#3b82f6', // Blue
    assets: [
      { field: 'fixed_deposit', displayName: 'Fixed Deposits', category: 'liquid' },
      { field: 'debt_funds', displayName: 'Debt Mutual Funds', category: 'liquid' },
      { field: 'epf_ppf_vpf', displayName: 'EPF / PPF / VPF', category: 'illiquid' },
    ]
  },
  Equity: {
    className: 'Equity',
    description: 'Stock market investments with higher growth potential and higher risk',
    color: '#10b981', // Green
    assets: [
      { field: 'domestic_stock_market', displayName: 'Domestic Stocks', category: 'liquid' },
      { field: 'domestic_equity_mutual_funds', displayName: 'Equity Mutual Funds', category: 'liquid' },
      { field: 'us_equity', displayName: 'US Equity', category: 'liquid' },
    ]
  },
  Gold: {
    className: 'Gold',
    description: 'Precious metal investments for diversification and inflation hedge',
    color: '#f59e0b', // Amber/Gold
    assets: [
      { field: 'jewellery', displayName: 'Physical Jewellery', category: 'illiquid' },
      { field: 'sgb', displayName: 'Sovereign Gold Bonds', category: 'illiquid' },
      { field: 'gold_etf_digital_gold', displayName: 'Gold ETF / Digital Gold', category: 'liquid' },
    ]
  },
  Alternatives: {
    className: 'Alternatives',
    description: 'Non-traditional investments like real estate and cryptocurrencies',
    color: '#8b5cf6', // Purple
    assets: [
      { field: 'home', displayName: 'Home (Primary Residence)', category: 'illiquid' },
      { field: 'other_real_estate', displayName: 'Other Real Estate', category: 'illiquid' },
      { field: 'reits', displayName: 'REITs', category: 'liquid' },
      { field: 'crypto', displayName: 'Cryptocurrency', category: 'liquid' },
      { field: 'ulips', displayName: 'ULIPs', category: 'illiquid' },
    ]
  },
  Cash: {
    className: 'Cash',
    description: 'Highly liquid assets for immediate expenses and emergencies',
    color: '#6b7280', // Gray
    assets: [
      { field: 'liquid_savings_cash', displayName: 'Savings & Cash', category: 'liquid' },
      { field: 'cash_from_equity_mutual_funds', displayName: 'Liquid Funds', category: 'liquid' },
    ]
  },
};

// Helper function to get asset class for a specific asset field
export const getAssetClass = (fieldName: string): string | null => {
  for (const [className, mapping] of Object.entries(assetClassifications)) {
    if (mapping.assets.some(asset => asset.field === fieldName)) {
      return className;
    }
  }
  return null;
};

// Helper function to get all assets in a class
export const getAssetsInClass = (className: string): AssetDetail[] => {
  return assetClassifications[className]?.assets || [];
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  return `₹${amount.toFixed(0)}`;
};

// Helper to format number without currency
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(Math.round(amount));
};
