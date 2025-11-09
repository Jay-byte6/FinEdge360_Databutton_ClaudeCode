import { FinancialDataValues } from './formSchema';
import { RiskQuizAnswer } from '../components/RiskAssessmentQuiz';

export interface PortfolioAllocation {
  Equity: number;
  Debt: number;
  Gold: number;
  REITs: number;
  Cash: number;
}

export interface RiskAssessmentResult {
  riskScore: number;
  riskType: 'Conservative' | 'Moderate' | 'Aggressive';
  idealPortfolio: PortfolioAllocation;
  currentPortfolio: PortfolioAllocation;
  difference: {
    Equity: string;
    Debt: string;
    Gold: string;
    REITs: string;
    Cash: string;
  };
  summary: string;
  educationalInsights: string[];
  encouragement: string;
}

/**
 * Calculate current portfolio allocation from user's asset data
 */
export function calculateCurrentPortfolio(financialData: FinancialDataValues): PortfolioAllocation {
  const liquid = financialData.assets.liquid || {};
  const illiquid = financialData.assets.illiquid || {};

  // Calculate total assets
  const totalLiquid = Object.values(liquid).reduce((sum, val) => sum + (val || 0), 0);
  const totalIlliquid = Object.values(illiquid).reduce((sum, val) => sum + (val || 0), 0);
  const totalAssets = totalLiquid + totalIlliquid;

  if (totalAssets === 0) {
    return {
      Equity: 0,
      Debt: 0,
      Gold: 0,
      REITs: 0,
      Cash: 0,
    };
  }

  // Map assets to categories
  const equity =
    (liquid.domestic_stock_market || 0) +
    (liquid.domestic_equity_mutual_funds || 0) +
    (liquid.cash_from_equity_mutual_funds || 0) +
    (liquid.us_equity || 0);

  const debt =
    (liquid.fixed_deposit || 0) +
    (liquid.debt_funds || 0) +
    (illiquid.epf_ppf_vpf || 0) +
    (illiquid.ulips || 0);

  const gold =
    (liquid.gold_etf_digital_gold || 0) +
    (illiquid.sgb || 0) +
    (illiquid.jewellery || 0);

  const reits = liquid.reits || 0;

  const cash = liquid.liquid_savings_cash || 0;

  // Calculate percentages
  return {
    Equity: Math.round((equity / totalAssets) * 100),
    Debt: Math.round((debt / totalAssets) * 100),
    Gold: Math.round((gold / totalAssets) * 100),
    REITs: Math.round((reits / totalAssets) * 100),
    Cash: Math.round((cash / totalAssets) * 100),
  };
}

/**
 * Calculate risk score based on quiz answers or infer from financial data
 */
export function calculateRiskScore(
  quizAnswers: RiskQuizAnswer[] | null,
  financialData: FinancialDataValues
): number {
  // If quiz answers exist, use them
  if (quizAnswers && quizAnswers.length > 0) {
    return quizAnswers.reduce((sum, answer) => sum + answer.score, 0);
  }

  // Otherwise, infer from financial data
  let score = 0;

  // Age-based score (younger = more risk tolerance)
  const age = financialData.personalInfo.age;
  if (age < 30) score += 5;
  else if (age < 40) score += 4;
  else if (age < 50) score += 3;
  else if (age < 60) score += 2;
  else score += 1;

  // Income to expense ratio
  const monthlySalary = financialData.personalInfo.monthlySalary;
  const monthlyExpenses = financialData.personalInfo.monthlyExpenses;
  const savingsRate = monthlySalary > 0 ? ((monthlySalary - monthlyExpenses) / monthlySalary) * 100 : 0;

  if (savingsRate > 25) score += 5;
  else if (savingsRate > 10) score += 3;
  else score += 1;

  // Investment horizon (from goals)
  const allGoals = [
    ...(financialData.goals?.shortTermGoals || []),
    ...(financialData.goals?.midTermGoals || []),
    ...(financialData.goals?.longTermGoals || []),
  ];

  const maxHorizon = allGoals.length > 0
    ? Math.max(...allGoals.map(g => g.years))
    : 0;

  if (maxHorizon > 7) score += 5;
  else if (maxHorizon > 3) score += 3;
  else score += 1;

  // Emergency fund adequacy
  const liquid = financialData.assets.liquid || {};
  const emergencyFund = liquid.liquid_savings_cash || 0;
  const emergencyFundMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;

  if (emergencyFundMonths >= 6) score += 4;
  else if (emergencyFundMonths >= 3) score += 2;
  else score += 1;

  // Current asset allocation (higher equity = higher risk)
  const currentPortfolio = calculateCurrentPortfolio(financialData);
  if (currentPortfolio.Equity > 50) score += 5;
  else if (currentPortfolio.Equity > 30) score += 3;
  else score += 1;

  // Risk appetite from existing data
  const riskTolerance = financialData.riskAppetite?.risk_tolerance || 3;
  score += riskTolerance;

  // Cap score at 50
  return Math.min(score, 50);
}

/**
 * Determine risk type based on risk score
 */
export function getRiskType(score: number): 'Conservative' | 'Moderate' | 'Aggressive' {
  if (score <= 20) return 'Conservative';
  if (score <= 35) return 'Moderate';
  return 'Aggressive';
}

/**
 * Get ideal portfolio allocation based on risk type and user profile
 */
export function getIdealPortfolio(
  riskType: 'Conservative' | 'Moderate' | 'Aggressive',
  financialData: FinancialDataValues
): PortfolioAllocation {
  // Base allocations
  const baseAllocations: Record<string, PortfolioAllocation> = {
    Conservative: { Equity: 20, Debt: 60, Gold: 10, REITs: 5, Cash: 5 },
    Moderate: { Equity: 40, Debt: 40, Gold: 10, REITs: 5, Cash: 5 },
    Aggressive: { Equity: 70, Debt: 20, Gold: 5, REITs: 3, Cash: 2 },
  };

  let allocation = { ...baseAllocations[riskType] };

  // Adjust based on age (older = less equity)
  const age = financialData.personalInfo.age;
  if (age > 55 && riskType === 'Aggressive') {
    allocation.Equity -= 10;
    allocation.Debt += 10;
  } else if (age < 30 && riskType === 'Conservative') {
    allocation.Equity += 10;
    allocation.Debt -= 10;
  }

  // Adjust based on income level
  const monthlySalary = financialData.personalInfo.monthlySalary;
  if (monthlySalary > 200000 && riskType !== 'Aggressive') {
    // Higher income can afford more risk
    allocation.Equity += 5;
    allocation.Debt -= 5;
  }

  return allocation;
}

/**
 * Calculate differences between current and ideal portfolio
 */
export function calculateDifference(
  current: PortfolioAllocation,
  ideal: PortfolioAllocation
): Record<keyof PortfolioAllocation, string> {
  const diff: any = {};

  for (const key of Object.keys(ideal) as Array<keyof PortfolioAllocation>) {
    const difference = ideal[key] - current[key];
    diff[key] = difference > 0 ? `+${difference}%` : difference < 0 ? `${difference}%` : '0%';
  }

  return diff;
}

/**
 * Generate summary and insights
 */
export function generateAnalysis(
  riskScore: number,
  riskType: string,
  current: PortfolioAllocation,
  ideal: PortfolioAllocation,
  financialData: FinancialDataValues
): { summary: string; insights: string[]; encouragement: string } {
  const diff = calculateDifference(current, ideal);

  // Generate summary
  let summary = '';
  const equityDiff = ideal.Equity - current.Equity;

  if (riskType === 'Aggressive') {
    if (equityDiff > 15) {
      summary = "You're an ambitious long-term investor with high return goals, but your current portfolio underutilizes growth potential. Consider gradually increasing equity exposure while maintaining an emergency cushion.";
    } else if (equityDiff < -15) {
      summary = "Your portfolio is very equity-heavy. While you have high risk tolerance, consider rebalancing to reduce concentration risk and add some defensive assets.";
    } else {
      summary = "Your portfolio aligns well with your aggressive risk profile. Continue to monitor and rebalance periodically to stay on track.";
    }
  } else if (riskType === 'Moderate') {
    if (equityDiff > 10) {
      summary = "You prefer balanced growth with moderate risk. Your current allocation is conservative for your risk profile. Consider increasing equity exposure gradually.";
    } else if (equityDiff < -10) {
      summary = "You're taking more risk than necessary for your goals. Consider shifting some equity to debt for better risk-adjusted returns.";
    } else {
      summary = "Your balanced approach matches your risk tolerance well. Small adjustments can optimize your portfolio further.";
    }
  } else {
    if (equityDiff < -5) {
      summary = "You prefer capital preservation, but your portfolio has more equity exposure than comfortable for your risk tolerance. Consider rebalancing toward safer assets.";
    } else {
      summary = "Your conservative approach provides stability and peace of mind. Your portfolio aligns well with your goals and risk tolerance.";
    }
  }

  // Generate insights
  const insights: string[] = [
    "Rebalance your portfolio once a year to stay aligned with your goals and risk tolerance.",
    "Avoid emotional reactions to short-term market volatility. Focus on your long-term plan.",
    "Keep 3–6 months of expenses in liquid assets for emergencies before investing aggressively.",
  ];

  // Add specific insights based on portfolio
  const monthlyExpenses = financialData.personalInfo.monthlyExpenses;
  const liquid = financialData.assets.liquid || {};
  const emergencyFund = liquid.liquid_savings_cash || 0;
  const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;

  if (emergencyMonths < 3) {
    insights.push("Build an emergency fund of at least 3-6 months' expenses before increasing investments.");
  }

  if (current.Equity > 70) {
    insights.push("High equity concentration carries higher volatility. Ensure you can handle market downturns emotionally and financially.");
  }

  if (current.Cash > 15) {
    insights.push("Excess cash beyond your emergency fund could be deployed in debt funds for better returns while maintaining liquidity.");
  }

  // Encouragement message
  const encouragement = riskScore > 35
    ? "Excellent progress! Your financial discipline and focus are setting you on the right track to financial freedom 🚀"
    : riskScore > 20
    ? "Great job taking control of your finances! With consistent effort, you're building a solid foundation for the future 💪"
    : "You're making smart, cautious choices. Financial security is as important as growth. Keep up the good work! 🌱";

  return { summary, insights, encouragement };
}

/**
 * Complete risk assessment and portfolio analysis
 */
export function performRiskAssessment(
  quizAnswers: RiskQuizAnswer[] | null,
  financialData: FinancialDataValues
): RiskAssessmentResult {
  const riskScore = calculateRiskScore(quizAnswers, financialData);
  const riskType = getRiskType(riskScore);
  const currentPortfolio = calculateCurrentPortfolio(financialData);
  const idealPortfolio = getIdealPortfolio(riskType, financialData);
  const difference = calculateDifference(currentPortfolio, idealPortfolio);
  const { summary, insights, encouragement } = generateAnalysis(
    riskScore,
    riskType,
    currentPortfolio,
    idealPortfolio,
    financialData
  );

  return {
    riskScore,
    riskType,
    idealPortfolio,
    currentPortfolio,
    difference,
    summary,
    educationalInsights: insights,
    encouragement,
  };
}
