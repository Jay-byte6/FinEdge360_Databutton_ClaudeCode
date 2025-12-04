/**
 * Centralized Financial Calculations
 * This file ensures ALL pages use the EXACT SAME formulas for consistency
 */

export interface FinancialData {
  personalInfo: {
    age: number;
    monthlySalary: number;
    monthlyExpenses: number;
  };
  assets?: {
    liquid?: Record<string, number>;
    illiquid?: Record<string, number>;
  };
  liabilities?: Record<string, number>;
  assetsLiabilities?: {
    realEstateValue: number;
    goldValue: number;
    mutualFundsValue: number;
    epfBalance: number;
    ppfBalance: number;
    homeLoan: number;
    carLoan: number;
    personalLoan: number;
    otherLoans: number;
  };
  goals?: {
    shortTermGoals?: Array<{ name: string; amount: number; years?: number; timeYears?: number; goalType?: string }>;
    midTermGoals?: Array<{ name: string; amount: number; years?: number; timeYears?: number; goalType?: string }>;
    longTermGoals?: Array<{ name: string; amount: number; years?: number; timeYears?: number; goalType?: string }>;
  };
}

/**
 * Calculate Net Worth
 * Formula: Total Assets - Total Liabilities
 */
export const calculateNetWorth = (financialData: FinancialData | null): number => {
  if (!financialData) return 0;

  // Calculate total assets from new structure (assets.liquid + assets.illiquid)
  let totalAssets = 0;

  if (financialData.assets) {
    const liquid = financialData.assets.liquid || {};
    const illiquid = financialData.assets.illiquid || {};

    totalAssets =
      Object.values(liquid).reduce((sum, val) => sum + (Number(val) || 0), 0) +
      Object.values(illiquid).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Fallback to old structure (assetsLiabilities)
  if (totalAssets === 0 && financialData.assetsLiabilities) {
    totalAssets = [
      financialData.assetsLiabilities.realEstateValue,
      financialData.assetsLiabilities.goldValue,
      financialData.assetsLiabilities.mutualFundsValue,
      financialData.assetsLiabilities.epfBalance,
      financialData.assetsLiabilities.ppfBalance
    ].reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Calculate total liabilities from new structure
  let totalLiabilities = 0;

  if (financialData.liabilities) {
    totalLiabilities = Object.values(financialData.liabilities)
      .reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Fallback to old structure
  if (totalLiabilities === 0 && financialData.assetsLiabilities) {
    totalLiabilities = [
      financialData.assetsLiabilities.homeLoan,
      financialData.assetsLiabilities.carLoan,
      financialData.assetsLiabilities.personalLoan,
      financialData.assetsLiabilities.otherLoans
    ].reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  return totalAssets - totalLiabilities;
};

/**
 * Calculate Basic FIRE Number (no inflation adjustment)
 * Formula: Monthly Expenses × 12 × 25
 */
export const calculateBasicFIRENumber = (financialData: FinancialData | null): number => {
  if (!financialData?.personalInfo?.monthlyExpenses) return 0;
  return financialData.personalInfo.monthlyExpenses * 12 * 25;
};

/**
 * Find retirement goal from all goals
 * Searches across all goal types for retirement-related goals
 */
export const findRetirementGoal = (financialData: FinancialData | null) => {
  if (!financialData?.goals) return null;

  const allGoals = [
    ...(financialData.goals.shortTermGoals || []),
    ...(financialData.goals.midTermGoals || []),
    ...(financialData.goals.longTermGoals || [])
  ];

  return allGoals.find(g =>
    g.name?.toLowerCase().includes('retirement') ||
    g.name?.toLowerCase().includes('fire') ||
    g.name?.toLowerCase().includes('retire') ||
    g.goalType === 'Long-Term'
  );
};

/**
 * Get years to retirement from goal
 * Tries both 'timeYears' and 'years' properties with fallback to 30
 */
export const getYearsToRetirement = (financialData: FinancialData | null): number => {
  const retirementGoal = findRetirementGoal(financialData);
  return retirementGoal?.timeYears || retirementGoal?.years || 30;
};

/**
 * Calculate NEW FIRE Number (inflation-adjusted)
 * Formula: (Monthly Expenses × 12) × (1 + inflation)^years × 25
 * Uses 6% fixed inflation rate
 */
export const calculateNewFIRENumber = (financialData: FinancialData | null): number => {
  if (!financialData?.personalInfo?.monthlyExpenses) return 0;

  const yearsToRetirement = getYearsToRetirement(financialData);
  const inflationRate = 6; // Fixed 6% inflation
  const inflationFactor = Math.pow(1 + (inflationRate / 100), yearsToRetirement);
  const yearlyExpensesToday = financialData.personalInfo.monthlyExpenses * 12;
  const yearlyExpensesRetirement = yearlyExpensesToday * inflationFactor;
  const inflationAdjustedFIRE = yearlyExpensesRetirement * 25;

  return inflationAdjustedFIRE;
};

/**
 * Calculate Liquid Net Worth (excluding illiquid assets)
 * Used for Coast FIRE calculations
 */
export const calculateLiquidNetWorth = (financialData: FinancialData | null): number => {
  if (!financialData) return 0;

  let liquidAssets = 0;

  if (financialData.assets?.liquid) {
    liquidAssets = Object.values(financialData.assets.liquid)
      .reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Calculate total liabilities
  let totalLiabilities = 0;
  if (financialData.liabilities) {
    totalLiabilities = Object.values(financialData.liabilities)
      .reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Fallback to old structure for liabilities
  if (totalLiabilities === 0 && financialData.assetsLiabilities) {
    totalLiabilities = [
      financialData.assetsLiabilities.homeLoan,
      financialData.assetsLiabilities.carLoan,
      financialData.assetsLiabilities.personalLoan,
      financialData.assetsLiabilities.otherLoans
    ].reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  return liquidAssets - totalLiabilities;
};

/**
 * FIRE #1: Coast FIRE - Retire Now
 * Calculate corpus needed to retire immediately with expenses covered till retirement age
 */
export const calculateCoastFIRE = (
  financialData: FinancialData | null,
  retirementAge: number = 60,
  includeIlliquidAssets: boolean = false
) => {
  if (!financialData?.personalInfo) {
    return {
      targetCorpus: 0,
      currentNetWorth: 0,
      gap: 0,
      yearsToAchieve: 0,
      ageAtCoastFIRE: 0,
    };
  }

  const { age, monthlyExpenses, monthlySalary } = financialData.personalInfo;
  const yearsToRetirement = retirementAge - age;

  // Calculate inflation-adjusted FIRE target at retirement age
  const inflationRate = 0.06;
  const inflationFactor = Math.pow(1 + inflationRate, yearsToRetirement);
  const monthlyExpensesAtRetirement = monthlyExpenses * inflationFactor;
  const yearlyExpensesAtRetirement = monthlyExpensesAtRetirement * 12;
  const fireTargetAtRetirement = yearlyExpensesAtRetirement * 25;

  // Calculate Coast FIRE corpus needed NOW
  const coastGrowthRate = 0.05; // 5% conservative
  const coastGrowthFactor = Math.pow(1 + coastGrowthRate, yearsToRetirement);
  const coastFIRECorpus = fireTargetAtRetirement / coastGrowthFactor;

  // Get current net worth based on checkbox
  const currentNetWorth = includeIlliquidAssets
    ? calculateNetWorth(financialData)
    : calculateLiquidNetWorth(financialData);
  const gap = Math.max(0, coastFIRECorpus - currentNetWorth);

  // Calculate years to achieve the gap
  const monthlySavings = Math.max(0, monthlySalary - monthlyExpenses);
  const annualSavings = monthlySavings * 12;

  let years = 0;
  let corpus = currentNetWorth;

  if (gap > 0 && annualSavings > 0) {
    while (corpus < coastFIRECorpus && years < 100) {
      corpus = corpus * (1 + coastGrowthRate) + annualSavings;
      years++;
    }
  }

  return {
    targetCorpus: coastFIRECorpus,
    currentNetWorth,
    gap,
    yearsToAchieve: years,
    ageAtCoastFIRE: age + years,
    fireTargetAtRetirement,
  };
};

/**
 * FIRE #2: Conservative FIRE at Retirement Age
 * Calculate if user can achieve FIRE by retirement age with conservative 5% returns
 */
export const calculateConservativeFIRE = (
  financialData: FinancialData | null,
  retirementAge: number = 60,
  includeIlliquidAssets: boolean = false
) => {
  if (!financialData?.personalInfo) {
    return {
      targetCorpus: 0,
      currentNetWorth: 0,
      projectedCorpusAtRetirement: 0,
      canAchieve: false,
      shortfall: 0,
      yearsAvailable: 0,
    };
  }

  const { age, monthlyExpenses, monthlySalary } = financialData.personalInfo;
  const yearsToRetirement = retirementAge - age;

  // Calculate inflation-adjusted FIRE target
  const inflationRate = 0.06;
  const inflationFactor = Math.pow(1 + inflationRate, yearsToRetirement);
  const yearlyExpensesAtRetirement = (monthlyExpenses * 12) * inflationFactor;
  const fireTarget = yearlyExpensesAtRetirement * 25;

  // Get current net worth based on checkbox
  const currentNetWorth = includeIlliquidAssets
    ? calculateNetWorth(financialData)
    : calculateLiquidNetWorth(financialData);

  // Project corpus growth with conservative 5% returns
  const conservativeRate = 0.05;
  const monthlySavings = Math.max(0, monthlySalary - monthlyExpenses);
  const annualSavings = monthlySavings * 12;

  let projectedCorpus = currentNetWorth;
  for (let year = 1; year <= yearsToRetirement; year++) {
    projectedCorpus = projectedCorpus * (1 + conservativeRate) + annualSavings;
  }

  const canAchieve = projectedCorpus >= fireTarget;
  const shortfall = canAchieve ? 0 : fireTarget - projectedCorpus;

  return {
    targetCorpus: fireTarget,
    currentNetWorth,
    projectedCorpusAtRetirement: projectedCorpus,
    canAchieve,
    shortfall,
    yearsAvailable: yearsToRetirement,
    monthlySavings,
  };
};

/**
 * FIRE #3: Premium NEW FIRE with Optimized Portfolio
 * Calculate years to achieve FIRE with expected CAGR from asset allocation
 */
export const calculatePremiumNewFIRE = (
  financialData: FinancialData | null,
  retirementAge: number = 60,
  expectedCAGR: number = 0.10, // Default 10%, should be calculated from asset allocation
  retirementSIP: number = 0, // Monthly SIP for retirement goal
  stepUpPercentage: number = 0, // Annual step-up percentage
  includeIlliquidAssets: boolean = false
) => {
  if (!financialData?.personalInfo) {
    return {
      targetCorpus: 0,
      currentNetWorth: 0,
      yearsToAchieve: 0,
      ageAtFIRE: 0,
      yearsBeforeRetirement: 0,
      canAchieveBefore60: false,
    };
  }

  const { age, monthlyExpenses } = financialData.personalInfo;
  const yearsToRetirement = retirementAge - age;

  // Calculate inflation-adjusted FIRE target
  const inflationRate = 0.06;
  const inflationFactor = Math.pow(1 + inflationRate, yearsToRetirement);
  const yearlyExpensesAtRetirement = (monthlyExpenses * 12) * inflationFactor;
  const fireTarget = yearlyExpensesAtRetirement * 25;

  // Get current net worth based on checkbox
  const currentNetWorth = includeIlliquidAssets
    ? calculateNetWorth(financialData)
    : calculateLiquidNetWorth(financialData);

  // Calculate years to achieve with expected CAGR and step-up SIP
  let years = 0;
  let corpus = currentNetWorth;
  let currentSIP = retirementSIP;

  while (corpus < fireTarget && years < 100) {
    const annualInvestment = currentSIP * 12;
    corpus = corpus * (1 + expectedCAGR) + annualInvestment;
    currentSIP = currentSIP * (1 + stepUpPercentage / 100); // Apply step-up for next year
    years++;
  }

  const ageAtFIRE = age + years;
  const yearsBeforeRetirement = retirementAge - ageAtFIRE;
  const canAchieveBefore60 = ageAtFIRE < retirementAge;

  return {
    targetCorpus: fireTarget,
    currentNetWorth,
    yearsToAchieve: years,
    ageAtFIRE,
    yearsBeforeRetirement,
    canAchieveBefore60,
    expectedCAGR,
    initialSIP: retirementSIP,
    stepUpPercentage,
  };
};

/**
 * Get all financial metrics in one call
 */
export const getFinancialMetrics = (financialData: FinancialData | null) => {
  return {
    netWorth: calculateNetWorth(financialData),
    basicFIRENumber: calculateBasicFIRENumber(financialData),
    newFIRENumber: calculateNewFIRENumber(financialData),
    yearsToRetirement: getYearsToRetirement(financialData),
    monthlyExpenses: financialData?.personalInfo?.monthlyExpenses || 0,
    monthlySalary: financialData?.personalInfo?.monthlySalary || 0,
    age: financialData?.personalInfo?.age || 0,
  };
};
