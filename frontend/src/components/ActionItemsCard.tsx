import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Eye, EyeOff, Info } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

interface ActionItem {
  id: string;
  title: string;
  benefit: string; // Visible benefit
  why: string; // Why this action is needed
  where: string; // Which page
  monetaryValue: number; // For sorting by benefit
  riskScore: number; // For sorting by risk (1-10, higher = more urgent)
  tier: number; // Priority tier: 1 = Journey/Milestone, 2 = Risk-based, 3 = Monetary benefit
  actionPath: string;
}

interface ActionItemsCardProps {
  userId: string;
  financialData: any;
  isPremium: boolean;
}

export const ActionItemsCard: React.FC<ActionItemsCardProps> = ({ userId, financialData, isPremium }) => {
  const navigate = useNavigate();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Load completed actions from database
  useEffect(() => {
    const loadCompletedActions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getUserActionItems(userId));
        if (response.ok) {
          const data = await response.json();
          setCompletedActions(new Set(data.completedActionIds || []));
        }
      } catch (error) {
        console.error('[ActionItems] Error loading completed actions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadCompletedActions();
    }
  }, [userId]);

  // Generate TOP 10 action items prioritized by benefit and risk
  useEffect(() => {
    const generateActionItems = async () => {
      const items: ActionItem[] = [];

      console.log('[ActionItems] Generating items for user:', userId);
      console.log('[ActionItems] Financial Data:', financialData);

      // Calculate user's annual income
      const monthlyIncome = financialData?.income?.salary || 0;
      const annualIncome = monthlyIncome * 12;

      // 1. Life Insurance (CRITICAL - Highest risk if missing)
      const hasLifeInsurance = financialData?.taxPlanning?.insurance?.lifeInsurance > 0;
      if (!hasLifeInsurance && annualIncome > 0) {
        const recommendedCover = annualIncome * 12; // 12x annual income
        const premiumCost = recommendedCover * 0.0005; // ~0.05% of cover
        const taxSaving = 25000 * 0.312; // ₹25k premium saves ₹7,800 tax
        items.push({
          id: 'add-life-insurance',
          title: 'Add Life Insurance Coverage',
          benefit: `₹${(recommendedCover / 100000).toFixed(0)}L protection + Save ₹${Math.round(taxSaving / 1000)}k tax/year`,
          why: `Your family needs financial protection. Life cover = 12x annual income = ₹${(recommendedCover / 100000).toFixed(1)}L`,
          where: 'Tax Planning → Insurance Section',
          monetaryValue: recommendedCover + (taxSaving * 20), // Cover + 20 years of tax savings
          riskScore: 10, // CRITICAL
          tier: 2, // Risk-based
          actionPath: '/tax-planning',
        });
      }

      // 2. Emergency Fund (CRITICAL - High risk)
      const monthlyExpenses = (financialData?.expenses?.rent || 0) +
        (financialData?.expenses?.groceries || 0) +
        (financialData?.expenses?.utilities || 0) +
        (financialData?.expenses?.transportation || 0) +
        (financialData?.expenses?.others || 0);

      const liquidAssets = (financialData?.assets?.bankBalance || 0) +
        (financialData?.assets?.fixedDeposits || 0);

      const emergencyFundMonths = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0;

      if (emergencyFundMonths < 6 && monthlyExpenses > 0) {
        const gap = (monthlyExpenses * 6) - liquidAssets;
        items.push({
          id: 'build-emergency-fund',
          title: 'Build 6-Month Emergency Fund',
          benefit: `Save ₹${(gap / 100000).toFixed(1)}L for emergencies (You have only ${emergencyFundMonths.toFixed(1)} months)`,
          why: `Job loss, medical emergency, urgent repairs - you need 6 months expenses in liquid savings. Currently: ${emergencyFundMonths.toFixed(1)} months only`,
          where: 'Enter Details → Assets → Bank Balance/FD',
          monetaryValue: gap,
          riskScore: 9, // CRITICAL
          tier: 2, // Risk-based
          actionPath: '/enter-details',
        });
      }

      // 3. Maximize 80C Tax Deductions (HIGH monetary benefit)
      const section80C = financialData?.taxPlanning?.section80C || 0;
      if (section80C < 150000) {
        const gap = 150000 - section80C;
        const taxSaving = gap * 0.312; // 31.2% tax bracket
        items.push({
          id: 'max-80c-deductions',
          title: 'Maximize 80C Tax Savings',
          benefit: `Invest ₹${(gap / 1000).toFixed(0)}k to save ₹${Math.round(taxSaving / 1000)}k tax this year`,
          why: `Section 80C allows ₹1.5L deduction. You've used only ₹${(section80C / 1000).toFixed(0)}k. Gap = ₹${(gap / 1000).toFixed(0)}k. Tax saving at 31.2% = ₹${Math.round(taxSaving / 1000)}k`,
          where: 'Tax Planning → 80C Deductions (ELSS, PPF, EPF)',
          monetaryValue: taxSaving,
          riskScore: 8, // High - losing money to tax
          tier: 3, // Monetary benefit
          actionPath: '/tax-planning',
        });
      }

      // 4. Health Insurance (HIGH risk)
      const hasHealthInsurance = financialData?.taxPlanning?.insurance?.healthInsurance > 0;
      if (!hasHealthInsurance) {
        const taxSaving = 25000 * 0.312; // ₹25k premium saves ₹7,800
        items.push({
          id: 'add-health-insurance',
          title: 'Add Health Insurance (Urgent!)',
          benefit: `₹5-10L medical cover + Save ₹${Math.round(taxSaving / 1000)}k tax/year`,
          why: `Medical emergencies can wipe out savings. ₹5L hospitalization is common. Premium ~₹10-15k/year gets you ₹5-10L cover + tax deduction under Section 80D`,
          where: 'Tax Planning → Section 80D: Health Insurance',
          monetaryValue: 500000 + (taxSaving * 20), // Potential medical cost + tax savings
          riskScore: 9, // CRITICAL
          tier: 2, // Risk-based
          actionPath: '/tax-planning#section-80d',
        });
      }

      // 5. Portfolio Upload (HIGH value)
      try {
        const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(userId));
        const portfolioData = await portfolioRes.json();

        if (!portfolioData.holdings || portfolioData.holdings.length === 0) {
          items.push({
            id: 'upload-portfolio',
            title: 'Upload CAMS Portfolio Statement',
            benefit: `Track ₹1L-10L+ MF investments + Get 10% gain/loss alerts`,
            why: `Mutual funds need active tracking. Upload CAMS statement to: (1) Auto-track NAV daily (2) Get 10%+ move alerts (3) Rebalance suggestions (4) Goal allocation`,
            where: 'Portfolio → Upload CAMS Statement',
            monetaryValue: 100000, // Assume ₹1L portfolio
            riskScore: 7,
            tier: 1, // Journey/Milestone completion
            actionPath: '/portfolio',
          });
        } else {
          // Check for rebalancing
          const totalValue = portfolioData.holdings.reduce((sum: number, h: any) => sum + h.market_value, 0);
          if (totalValue > 100000) {
            items.push({
              id: 'review-asset-allocation',
              title: 'Review Asset Allocation',
              benefit: `Rebalance ₹${(totalValue / 100000).toFixed(1)}L portfolio for optimal returns`,
              why: `Portfolio size: ₹${(totalValue / 100000).toFixed(1)}L. Target 60% equity, 40% debt for balanced risk-return. Rebalancing improves returns by 1-2% annually`,
              where: 'FIRE Planner → Asset Allocation',
              monetaryValue: totalValue * 0.015, // 1.5% improvement
              riskScore: 6,
              tier: 2, // Risk-based (portfolio risk management)
              actionPath: '/fire-planner?tab=asset-allocation',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }

      // 6. NPS for 80CCD(1B) (Additional tax savings)
      const nps = financialData?.taxPlanning?.nps || 0;
      if (nps < 50000 && isPremium) {
        const gap = 50000 - nps;
        const taxSaving = gap * 0.312;
        items.push({
          id: 'add-nps-80ccd',
          title: 'Add NPS for Extra Tax Benefit',
          benefit: `Invest ₹${(gap / 1000).toFixed(0)}k in NPS to save ₹${Math.round(taxSaving / 1000)}k tax`,
          why: `80CCD(1B) allows ADDITIONAL ₹50k deduction beyond 80C limit. At 31.2% tax, you save ₹15.6k. NPS = retirement corpus + tax savings`,
          where: 'Tax Planning → NPS Section',
          monetaryValue: taxSaving,
          riskScore: 6,
          tier: 2, // Risk-based (retirement security)
          actionPath: '/tax-planning',
        });
      }

      // 7. Financial Data Entry
      if (!financialData || Object.keys(financialData).length === 0) {
        items.push({
          id: 'enter-financial-details',
          title: 'Complete Financial Profile',
          benefit: `Unlock personalized FIRE plan + ₹46k+ tax savings/year`,
          why: `We need your income, expenses, assets, liabilities to: (1) Calculate FIRE number (2) Suggest tax savings (3) Create SIP plan (4) Track net worth`,
          where: 'Enter Details → Complete All 5 Sections',
          monetaryValue: 46800, // Estimated tax savings
          riskScore: 8,
          tier: 1, // Journey/Milestone completion (Step 0)
          actionPath: '/enter-details',
        });
      }

      // 8. Goal Planning
      try {
        const sipRes = await fetch(API_ENDPOINTS.getSipPlanner(userId));
        if (sipRes.ok) {
          const sipData = await sipRes.json();
          if (!sipData || !sipData.goals || sipData.goals.length === 0) {
            items.push({
              id: 'create-financial-goals',
              title: 'Set Financial Goals & SIP Plan',
              benefit: `Get exact monthly SIP for retirement, house, education goals`,
              why: `Goals without plan = dreams. Set target amount, timeline → Get exact monthly SIP needed. Compound interest calculator + goal tracker`,
              where: 'FIRE Planner → Set Goals Tab',
              monetaryValue: 500000, // Estimated goal value
              riskScore: 7,
              tier: 1, // Journey/Milestone completion (Step 5)
              actionPath: '/fire-planner?tab=set-goals',
            });
          } else {
            // Check for goals without SIPs
            const goalsWithoutSIP = sipData.goals.filter((g: any) => !g.sipRequired || g.sipRequired === 0);
            if (goalsWithoutSIP.length > 0) {
              const totalGoalValue = goalsWithoutSIP.reduce((sum: number, g: any) => sum + (g.targetAmount || 0), 0);
              items.push({
                id: 'activate-sip-for-goals',
                title: `Start SIP for ${goalsWithoutSIP.length} Pending Goal(s)`,
                benefit: `₹${(totalGoalValue / 100000).toFixed(0)}L goals need SIP activation`,
                why: `Goals created but SIP not started: ${goalsWithoutSIP.map((g: any) => g.goalType).join(', ')}. Start SIP now to achieve goals on time`,
                where: 'FIRE Planner → SIP Plan Tab',
                monetaryValue: totalGoalValue * 0.1, // 10% of goal value
                riskScore: 7,
                tier: 1, // Journey/Milestone completion (Step 7)
                actionPath: '/fire-planner?tab=sip-plan',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching SIP data:', error);
      }

      // 9. Risk Assessment
      try {
        const riskRes = await fetch(API_ENDPOINTS.getRiskAssessment(userId));
        if (!riskRes.ok || riskRes.status === 404) {
          items.push({
            id: 'complete-risk-assessment',
            title: 'Complete Risk Profile Assessment',
            benefit: `Get personalized equity/debt allocation for your risk level`,
            why: `Are you conservative, moderate, or aggressive? Risk profile determines: (1) Equity vs Debt mix (2) Investment recommendations (3) Expected returns`,
            where: 'Portfolio → Risk Assessment',
            monetaryValue: 50000, // Estimated benefit from optimal allocation
            riskScore: 5,
            tier: 1, // Journey/Milestone completion (Step 4 - Portfolio Assessment)
            actionPath: '/portfolio',
          });
        }
      } catch (error) {
        console.error('Error fetching risk assessment:', error);
      }

      // 10. Review Insurance Coverage (Even if exists, periodic review needed)
      if (hasLifeInsurance || hasHealthInsurance) {
        items.push({
          id: 'review-insurance-coverage',
          title: 'Review Insurance Coverage Annually',
          benefit: `Ensure coverage matches current income/needs + Optimize premiums`,
          why: `Income increased? Family size changed? Review insurance yearly. Life cover should be 10-12x current income. Health cover ₹10L+ recommended`,
          where: 'Tax Planning → Insurance Section',
          monetaryValue: 50000,
          riskScore: 4,
          tier: 3, // Monetary benefit (optimization)
          actionPath: '/tax-planning',
        });
      }

      // 11. Increase SIP by 10% Annually (If has goals)
      try {
        const sipRes = await fetch(API_ENDPOINTS.getSipPlanner(userId));
        if (sipRes.ok) {
          const sipData = await sipRes.json();
          if (sipData && sipData.goals && sipData.goals.length > 0) {
            const totalSIP = sipData.goals.reduce((sum: number, g: any) => sum + (g.sipRequired || 0), 0);
            if (totalSIP > 0) {
              const increase10Percent = totalSIP * 0.1;
              items.push({
                id: 'increase-sip-10-percent',
                title: 'Increase SIP by 10% This Year',
                benefit: `Boost SIP by ₹${Math.round(increase10Percent / 1000)}k/month → Retire 2-3 years earlier`,
                why: `Current total SIP: ₹${Math.round(totalSIP / 1000)}k/month. Salary increases? Increase SIP by 10% annually to achieve goals faster. Even small increases compound hugely`,
                where: 'FIRE Planner → SIP Plan',
                monetaryValue: increase10Percent * 12 * 10, // 10 years of increased SIP
                riskScore: 4,
                tier: 3, // Monetary benefit (optimization)
                actionPath: '/fire-planner?tab=sip-plan',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching SIP data:', error);
      }

      // 12. Debt Reduction Strategy
      const totalDebt = (financialData?.liabilities?.homeLoan || 0) +
        (financialData?.liabilities?.carLoan || 0) +
        (financialData?.liabilities?.personalLoan || 0) +
        (financialData?.liabilities?.creditCardDebt || 0);

      if (totalDebt > 100000) {
        const highInterestDebt = (financialData?.liabilities?.creditCardDebt || 0) +
                                 (financialData?.liabilities?.personalLoan || 0);
        if (highInterestDebt > 0) {
          items.push({
            id: 'pay-high-interest-debt',
            title: 'Pay Off High-Interest Debt First',
            benefit: `Clear ₹${(highInterestDebt / 100000).toFixed(1)}L @ 12-18% → Save ₹${Math.round(highInterestDebt * 0.15 / 1000)}k/year interest`,
            why: `Credit card (18%) & personal loans (12-15%) are wealth killers. Pay these BEFORE investing. Every ₹1L debt @ 15% = ₹15k wasted yearly`,
            where: 'Enter Details → Liabilities',
            monetaryValue: highInterestDebt * 0.15, // Annual interest saved
            riskScore: 7,
            tier: 2, // Risk-based (financial security)
            actionPath: '/enter-details',
          });
        }
      }

      // 13. Download FIRE Progress Report - REMOVED (tracking, not actionable)

      // 14. Book Expert Consultation (TOP priority if milestones completed)
      // Check if user has completed major milestones
      const hasCompletedMilestones =
        financialData && Object.keys(financialData).length > 0 && // Has financial data
        (hasLifeInsurance || hasHealthInsurance); // Has insurance

      let consultationRiskScore = 3; // Default priority
      let consultationTier = 3; // Default Tier 3 (monetary benefit)
      let consultationBenefit = `Get personalized advice on portfolio, tax, FIRE strategy (Worth ₹5k)`;

      if (hasCompletedMilestones) {
        consultationRiskScore = 9; // HIGH priority for advanced users
        consultationTier = 1; // UPGRADE to Tier 1 (Journey completion)
        consultationBenefit = `🎯 You've completed basics! Get expert review to optimize & accelerate FIRE (Worth ₹5L+ impact)`;
      }

      items.push({
        id: 'book-expert-consultation',
        title: hasCompletedMilestones ? '🎯 Book Expert Review Session' : 'Book Free Expert Consultation',
        benefit: consultationBenefit,
        why: hasCompletedMilestones
          ? `You're doing great! Now get expert to: (1) Review portfolio allocation (2) Find hidden tax savings (3) Accelerate FIRE by 2-5 years (4) Optimize insurance. FREE 30-min session with certified planner`
          : `One-on-one session with certified financial planner. Discuss: (1) Portfolio optimization (2) Tax strategies (3) FIRE acceleration (4) Insurance gaps. 30-min session FREE`,
        where: 'Profile Menu → Book Expert Consultation',
        monetaryValue: hasCompletedMilestones ? 500000 : 5000, // Much higher value for advanced users
        riskScore: consultationRiskScore,
        tier: consultationTier, // Dynamic tier based on milestones
        actionPath: '/consultation-new',
      });

      // 15. Review FIRE Number Quarterly (Adjust Retirement Age)
      if (financialData && Object.keys(financialData).length > 0) {
        items.push({
          id: 'adjust-retirement-age',
          title: 'Adjust Retirement Age & Coast Age',
          benefit: `Fine-tune FIRE timeline → Retire at your ideal age (40-70)`,
          why: `Want to retire at 45 instead of 60? Adjust retirement age slider to see how your FIRE number, SIP, and coast age change. Coast age = when to stop saving. Critical to customize your FIRE journey`,
          where: 'FIRE Calculator → FIRE Calculator Settings',
          monetaryValue: 200000,
          riskScore: 7,
          tier: 1, // Journey/Milestone completion (Step 2 - define retirement age)
          actionPath: '/fire-calculator#retirement-settings',
        });
      }

      // 16. Explore FIRE Scenarios (CoastFIRE, BaristaFIRE, etc.)
      items.push({
        id: 'explore-fire-scenarios',
        title: 'Choose Your FIRE Scenario (Critical!)',
        benefit: `Select 1 of 4 paths: Coast/Lean/Fat/Barista FIRE → Get exact target & timeline`,
        why: `Each FIRE type has different corpus target & timeline. CoastFIRE = ₹50L at 40, stop saving. LeanFIRE = 80% expenses, retire fast. FatFIRE = luxury retirement. BaristaFIRE = part-time work. Choose yours to get personalized plan`,
        where: 'FIRE Calculator → 4 FIRE Scenarios Section',
        monetaryValue: 500000,
        riskScore: 8, // High priority - defines entire strategy
        tier: 1, // Journey/Milestone - choosing FIRE path is critical
        actionPath: '/fire-calculator#fire-scenarios',
      });

      // 17. Join FIRE Community - DISABLED (will be built later)
      // items.push({
      //   id: 'join-fire-community',
      //   title: 'Join WhatsApp FIRE Community',
      //   benefit: `Connect with 500+ FIRE enthusiasts, share tips, get motivated`,
      //   why: `FIRE is a journey, not a sprint. Join community to: (1) Share strategies (2) Learn from others (3) Stay motivated (4) Get answers to questions. Active daily discussions`,
      //   where: 'Profile Menu → Join Community',
      //   monetaryValue: 10000,
      //   riskScore: 2,
      //   tier: 3, // Monetary benefit (community support)
      //   actionPath: '/dashboard',
      // });

      // 18. Set Up Auto-Debit for SIPs (TIER 1 if user has SIP plan!)
      try {
        const sipRes = await fetch(API_ENDPOINTS.getSipPlanner(userId));
        if (sipRes.ok) {
          const sipData = await sipRes.json();
          const hasSIPPlan = sipData && sipData.goals && sipData.goals.length > 0 &&
                            sipData.goals.some((g: any) => g.sipRequired && g.sipRequired > 0);

          items.push({
            id: 'setup-auto-debit-sip',
            title: hasSIPPlan ? '🚀 Automate Monthly SIPs (CRITICAL!)' : 'Enable Auto-Debit for All SIPs',
            benefit: hasSIPPlan
              ? `✅ SIP plan ready! Now AUTOMATE to never miss investments`
              : `Never miss SIP! Automate investments for consistent wealth building`,
            why: `Manual investing = missed months = lower returns. Set up auto-debit from bank: (1) Never forget (2) Rupee-cost averaging (3) Disciplined investing. Most important step after SIP planning`,
            where: 'Your Mutual Fund Platform / Bank',
            monetaryValue: hasSIPPlan ? 1000000 : 30000, // Much higher if SIP plan exists
            riskScore: hasSIPPlan ? 10 : 6, // CRITICAL if SIP plan exists
            tier: hasSIPPlan ? 1 : 2, // Tier 1 if SIP plan exists (Journey completion), else Tier 2
            actionPath: '/fire-planner?tab=sip-plan',
          });
        }
      } catch (error) {
        console.error('Error checking SIP plan for automation:', error);
      }

      // 19. Diversify Beyond Equity Mutual Funds
      try {
        const portfolioRes = await fetch(API_ENDPOINTS.getPortfolioHoldings(userId));
        const portfolioData = await portfolioRes.json();

        if (portfolioData.holdings && portfolioData.holdings.length > 0) {
          const totalValue = portfolioData.holdings.reduce((sum: number, h: any) => sum + h.market_value, 0);
          if (totalValue > 500000) {
            items.push({
              id: 'diversify-investments',
              title: 'Diversify Beyond MFs (PPF, Gold, REITs)',
              benefit: `₹${(totalValue / 100000).toFixed(1)}L portfolio → Add PPF, Gold, REITs for stability`,
              why: `Don't put all eggs in one basket. Portfolio > ₹5L? Add: (1) PPF (safe 7%) (2) Gold (5-10% hedge) (3) REITs (real estate exposure). Target: 60% equity MF, 30% debt, 10% gold/alternatives`,
              where: 'Enter Details → Assets',
              monetaryValue: totalValue * 0.02, // 2% better risk-adjusted returns
              riskScore: 4,
              tier: 3, // Monetary benefit (optimization)
              actionPath: '/enter-details',
            });
          }
        }
      } catch (error) {
        console.error('Error checking portfolio for diversification:', error);
      }

      // 20. Track Net Worth Monthly - REMOVED (tracking, not actionable)

      // Sort by priority: Tier 1 (Journey) → Tier 2 (Risk) → Tier 3 (Monetary)
      // Within same tier, sort by (riskScore * 10) + (monetaryValue / 10000)
      const top10 = items
        .sort((a, b) => {
          // First priority: tier (lower number = higher priority)
          if (a.tier !== b.tier) {
            return a.tier - b.tier;
          }
          // Within same tier: sort by risk and monetary value
          const scoreA = (a.riskScore * 10) + (a.monetaryValue / 10000);
          const scoreB = (b.riskScore * 10) + (b.monetaryValue / 10000);
          return scoreB - scoreA;
        })
        .slice(0, 10);

      console.log('[ActionItems] Generated', items.length, 'items, showing top', top10.length);
      console.log('[ActionItems] Items:', top10.map(i => i.title));

      setActionItems(top10);
    };

    if (userId) {
      generateActionItems();
    }
  }, [userId, financialData, isPremium]);

  // Handle action completion toggle (can mark/unmark)
  const handleToggleAction = async (actionId: string) => {
    const newCompleted = new Set(completedActions);

    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId); // Revert to pending
    } else {
      newCompleted.add(actionId); // Mark as completed
    }

    setCompletedActions(newCompleted);

    // Save to database
    try {
      await fetch(API_ENDPOINTS.updateUserActionItems(userId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedActionIds: Array.from(newCompleted) }),
      });
    } catch (error) {
      console.error('[ActionItems] Error saving:', error);
      toast.error('Failed to save action item status');
    }
  };

  const handleActionClick = (actionPath: string) => {
    // Check if path has hash for deep linking to specific section
    if (actionPath.includes('#')) {
      const [path, hash] = actionPath.split('#');

      // Navigate to the page
      navigate(path);

      // Scroll to section after navigation completes
      // Use longer delay to ensure page has loaded
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add extra offset to account for sticky header
          window.scrollBy(0, -80);
        }
      }, 500);
    } else if (actionPath.includes('?')) {
      // Handle query params (e.g., /fire-planner?tab=sip-plan)
      navigate(actionPath);
    } else {
      navigate(actionPath);
    }
  };

  const pendingItems = actionItems.filter(item => !completedActions.has(item.id));
  const completedItems = actionItems.filter(item => completedActions.has(item.id));
  const displayItems = showCompleted ? completedItems : pendingItems;

  if (isLoading) {
    return null;
  }

  if (pendingItems.length === 0 && completedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-orange-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-md">
            <span className="text-white text-xl">📋</span>
          </div>
          <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Top 10 Action Items
          </span>
          {!showCompleted && pendingItems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {pendingItems.length} pending
            </span>
          )}
          {showCompleted && completedItems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {completedItems.length} completed
            </span>
          )}
        </h3>
        {(completedItems.length > 0 || pendingItems.length > 0) && (
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showCompleted ? (
              <>
                <EyeOff className="h-4 w-4" />
                View Pending ({pendingItems.length})
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                View Completed ({completedItems.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Action Items List */}
      {displayItems.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm font-medium">All action items completed! 🎉</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item, index) => {
            const isCompleted = completedActions.has(item.id);
            return (
              <div
                key={item.id}
                className={`group flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {/* Priority Number */}
                {!isCompleted && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                )}

                {/* Checkbox */}
                <button
                  onClick={() => handleToggleAction(item.id)}
                  className="flex-shrink-0"
                  title={isCompleted ? "Click to mark as pending" : "Click to mark as completed"}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 group-hover:text-orange-500" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleActionClick(item.actionPath)}
                    className={`text-left w-full ${
                      isCompleted ? 'line-through text-gray-500' : 'text-gray-900 hover:text-orange-600'
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-green-700 font-medium">💰 {item.benefit}</p>
                  </button>
                </div>

                {/* Info Tooltip (Why/Where) */}
                <div className="group/tooltip relative flex-shrink-0">
                  <Info className="h-4 w-4 text-gray-400 hover:text-orange-500 cursor-help" />
                  <div className="invisible group-hover/tooltip:visible absolute right-0 top-6 z-10 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    <div className="space-y-2">
                      <div>
                        <div className="font-semibold mb-1 text-yellow-400">❓ Why:</div>
                        <div className="text-gray-200">{item.why}</div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1 text-blue-400">📍 Where:</div>
                        <div className="text-gray-200">{item.where}</div>
                      </div>
                    </div>
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
