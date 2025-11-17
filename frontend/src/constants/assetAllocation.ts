/**
 * Asset Allocation Constants
 *
 * SEBI COMPLIANCE NOTICE:
 * - This information is for educational purposes only
 * - Does NOT constitute investment advice
 * - Asset allocation recommendations are illustrative based on general investment principles
 * - Consult a SEBI-registered investment advisor before making investment decisions
 * - Past performance does not guarantee future results
 */

export type AssetClass = 'equity' | 'us_equity' | 'debt' | 'gold' | 'reits' | 'crypto' | 'cash';
export type GoalType = 'Short-Term' | 'Mid-Term' | 'Long-Term';
export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';
export type RiskLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';

export interface AssetClassInfo {
  name: string;
  key: AssetClass;
  expectedCAGR: {
    min: number;
    max: number;
  };
  riskLevel: RiskLevel;
  typicalProducts: string[];
  description: string;
  riskWarning?: string;
  color: string; // For future visualization
}

export interface IdealAllocation {
  goalType: GoalType;
  riskProfile: RiskProfile;
  timeHorizon: string;
  allocations: Record<AssetClass, number>; // Percentage allocation
  overallCAGR: {
    min: number;
    max: number;
  };
}

// Asset Class Definitions (Based on historical Indian market data)
export const ASSET_CLASSES: Record<AssetClass, AssetClassInfo> = {
  equity: {
    name: 'Equity',
    key: 'equity',
    expectedCAGR: { min: 12, max: 15 },
    riskLevel: 'High',
    typicalProducts: [
      'Equity Mutual Funds',
      'Index Funds',
      'Large Cap Funds',
      'Mid Cap Funds',
      'Flexi Cap Funds'
    ],
    description: 'Indian equity markets. Long-term wealth creation potential with market volatility.',
    riskWarning: 'Subject to market volatility. Can lose value in the short term. Best for long-term investors.',
    color: '#3B82F6' // Blue
  },
  us_equity: {
    name: 'US Equity',
    key: 'us_equity',
    expectedCAGR: { min: 10, max: 12 },
    riskLevel: 'High',
    typicalProducts: [
      'International Equity Funds',
      'US Index Funds',
      'NASDAQ Funds',
      'S&P 500 Funds'
    ],
    description: 'International diversification through US markets. Currency risk and market volatility apply.',
    riskWarning: 'Exposed to currency fluctuations and foreign market risks. Taxed differently than Indian equity.',
    color: '#8B5CF6' // Purple
  },
  debt: {
    name: 'Debt',
    key: 'debt',
    expectedCAGR: { min: 6, max: 7 },
    riskLevel: 'Low',
    typicalProducts: [
      'Debt Mutual Funds',
      'Government Bonds',
      'Corporate Bonds',
      'Fixed Deposits',
      'PPF (for long-term)'
    ],
    description: 'Fixed-income instruments. Provides stability and regular income with lower risk.',
    riskWarning: 'Interest rate risk applies. Returns may not beat inflation over long term.',
    color: '#10B981' // Green
  },
  gold: {
    name: 'Gold',
    key: 'gold',
    expectedCAGR: { min: 8, max: 10 },
    riskLevel: 'Medium',
    typicalProducts: [
      'Gold ETFs',
      'Sovereign Gold Bonds (SGB)',
      'Gold Mutual Funds',
      'Digital Gold'
    ],
    description: 'Hedge against inflation and currency devaluation. Portfolio diversifier.',
    riskWarning: 'Price volatility in short term. No regular income. Storage/purity concerns for physical gold.',
    color: '#F59E0B' // Amber
  },
  reits: {
    name: 'REITs',
    key: 'reits',
    expectedCAGR: { min: 8, max: 10 },
    riskLevel: 'Medium',
    typicalProducts: [
      'REIT Mutual Funds',
      'Embassy Office Parks REIT',
      'Mindspace Business Parks REIT',
      'Brookfield India REIT'
    ],
    description: 'Real estate exposure without buying property. Provides rental income and capital appreciation.',
    riskWarning: 'Liquidity risk. Market and sector-specific risks. Interest rate sensitive.',
    color: '#EC4899' // Pink
  },
  crypto: {
    name: 'Crypto',
    key: 'crypto',
    expectedCAGR: { min: 15, max: 25 },
    riskLevel: 'Very High',
    typicalProducts: [
      'Bitcoin',
      'Ethereum',
      'Crypto Exchanges',
      '(No SEBI-regulated crypto MFs currently)'
    ],
    description: 'Digital currencies. Highly volatile and speculative. Regulatory uncertainty in India.',
    riskWarning: 'Highly speculative — include only if you are comfortable with high volatility. Risk of total loss. No investor protection. Tax implications unclear.',
    color: '#EF4444' // Red
  },
  cash: {
    name: 'Cash/Liquid',
    key: 'cash',
    expectedCAGR: { min: 3, max: 4 },
    riskLevel: 'Very Low',
    typicalProducts: [
      'Savings Account',
      'Liquid Mutual Funds',
      'Money Market Funds',
      'Overnight Funds'
    ],
    description: 'Emergency fund and short-term needs. Instant liquidity with capital protection.',
    riskWarning: 'Returns may not beat inflation. Opportunity cost of not investing in higher-return assets.',
    color: '#6B7280' // Gray
  },
};

// Ideal Allocations Based on Risk Profile
// Source: Industry best practices and historical data analysis
export const IDEAL_ALLOCATIONS: Record<RiskProfile, Record<GoalType, IdealAllocation>> = {
  'Conservative': {
    'Short-Term': {
      goalType: 'Short-Term',
      riskProfile: 'Conservative',
      timeHorizon: '1-3 years',
      allocations: {
        equity: 0,
        us_equity: 0,
        debt: 70,
        gold: 20,
        reits: 0,
        crypto: 0,
        cash: 10,
      },
      overallCAGR: { min: 6, max: 7 },
    },
    'Mid-Term': {
      goalType: 'Mid-Term',
      riskProfile: 'Conservative',
      timeHorizon: '3-7 years',
      allocations: {
        equity: 30,
        us_equity: 0,
        debt: 50,
        gold: 15,
        reits: 0,
        crypto: 0,
        cash: 5,
      },
      overallCAGR: { min: 7.5, max: 9 },
    },
    'Long-Term': {
      goalType: 'Long-Term',
      riskProfile: 'Conservative',
      timeHorizon: '7+ years',
      allocations: {
        equity: 40,
        us_equity: 10,
        debt: 35,
        gold: 10,
        reits: 5,
        crypto: 0,
        cash: 0,
      },
      overallCAGR: { min: 8.5, max: 10 },
    },
  },
  'Moderate': {
    'Short-Term': {
      goalType: 'Short-Term',
      riskProfile: 'Moderate',
      timeHorizon: '1-3 years',
      allocations: {
        equity: 10,
        us_equity: 0,
        debt: 65,
        gold: 20,
        reits: 0,
        crypto: 0,
        cash: 5,
      },
      overallCAGR: { min: 6.5, max: 7.5 },
    },
    'Mid-Term': {
      goalType: 'Mid-Term',
      riskProfile: 'Moderate',
      timeHorizon: '3-7 years',
      allocations: {
        equity: 50,
        us_equity: 5,
        debt: 30,
        gold: 10,
        reits: 5,
        crypto: 0,
        cash: 0,
      },
      overallCAGR: { min: 9, max: 10.5 },
    },
    'Long-Term': {
      goalType: 'Long-Term',
      riskProfile: 'Moderate',
      timeHorizon: '7+ years',
      allocations: {
        equity: 55,
        us_equity: 15,
        debt: 20,
        gold: 5,
        reits: 5,
        crypto: 0,
        cash: 0,
      },
      overallCAGR: { min: 10, max: 11.5 },
    },
  },
  'Aggressive': {
    'Short-Term': {
      goalType: 'Short-Term',
      riskProfile: 'Aggressive',
      timeHorizon: '1-3 years',
      allocations: {
        equity: 20,
        us_equity: 0,
        debt: 60,
        gold: 15,
        reits: 5,
        crypto: 0,
        cash: 0,
      },
      overallCAGR: { min: 7, max: 8.5 },
    },
    'Mid-Term': {
      goalType: 'Mid-Term',
      riskProfile: 'Aggressive',
      timeHorizon: '3-7 years',
      allocations: {
        equity: 60,
        us_equity: 10,
        debt: 20,
        gold: 5,
        reits: 5,
        crypto: 0,
        cash: 0,
      },
      overallCAGR: { min: 10, max: 12 },
    },
    'Long-Term': {
      goalType: 'Long-Term',
      riskProfile: 'Aggressive',
      timeHorizon: '7+ years',
      allocations: {
        equity: 60,
        us_equity: 15,
        debt: 15,
        gold: 5,
        reits: 5,
        crypto: 0,
        cash: 0,
      },
      overallCAGR: { min: 11, max: 12.5 },
    },
  },
};

// Helper function to calculate weighted CAGR from user allocation
export function calculateWeightedCAGR(allocations: Record<AssetClass, number>): { min: number; max: number } {
  let weightedMin = 0;
  let weightedMax = 0;

  Object.entries(allocations).forEach(([assetKey, percentage]) => {
    const asset = ASSET_CLASSES[assetKey as AssetClass];
    if (asset) {
      weightedMin += (percentage / 100) * asset.expectedCAGR.min;
      weightedMax += (percentage / 100) * asset.expectedCAGR.max;
    }
  });

  return {
    min: Math.round(weightedMin * 10) / 10, // Round to 1 decimal
    max: Math.round(weightedMax * 10) / 10,
  };
}

// Helper function to validate total allocation = 100%
export function validateAllocation(allocations: Record<AssetClass, number>): boolean {
  const total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  return total === 100;
}

// Helper function to get risk profile from percentage allocations
export function inferRiskProfile(allocations: Record<AssetClass, number>): RiskProfile {
  const highRiskPct = allocations.equity + allocations.us_equity + allocations.crypto;

  if (highRiskPct >= 60) return 'Aggressive';
  if (highRiskPct >= 35) return 'Moderate';
  return 'Conservative';
}
