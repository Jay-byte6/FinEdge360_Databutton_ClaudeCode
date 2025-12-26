import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import GuidelineBox from '../components/GuidelineBox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Info, Flame, Target, TrendingUp, Wallet, Zap, Shield, Heart, Activity, AlertTriangle, Users } from 'lucide-react'; // Added for icons
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Added for shadcn tooltip
import { Badge } from "@/components/ui/badge"; // Added for regime labels
import { Progress } from "@/components/ui/progress"; // Added for progress bars
import useFinancialDataStore from '../utils/financialDataStore';
import useAuthStore from '../utils/authStore';
import TaxTipsDisplay, { Tip as TaxTip } from '../components/TaxTipsDisplay'; // Added for tax tips
import { MilestoneCompletionCard } from '@/components/journey/MilestoneCompletionCard';
import { API_ENDPOINTS } from '../config/api';
import { FormattedNumberDisplay } from '@/components/ui/formatted-number-display';

type DeductionItem = {
  name: string;
  section: string;
  amount: number;
  maxLimit?: number;
  eligible: boolean;
};

type TaxSlabOld = {
  min: number;
  max: number;
  rate: number;
  tax: number;
};

type TaxSlabNew = {
  min: number;
  max: number;
  rate: number;
  tax: number;
};

export default function TaxPlanning() {
  const navigate = useNavigate();
  const { financialData, isLoading, fetchFinancialData } = useFinancialDataStore();
  const { user } = useAuthStore();

  // Form states
  const [yearlyIncome, setYearlyIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0); // NEW: Other income (interest, freelancing, etc.)
  const [capitalGains, setCapitalGains] = useState<number>(0); // NEW: Capital gains from stocks, property, etc.
  const [selectedRegime, setSelectedRegime] = useState<string>('compare');
  const [deductions, setDeductions] = useState<DeductionItem[]>([
    { name: 'Standard Deduction', section: '16(ia)', amount: 50000, eligible: true },
    { name: 'Employee PF Contribution', section: '80C', amount: 0, maxLimit: 150000, eligible: true },
    { name: 'Home Loan Principal', section: '80C', amount: 0, maxLimit: 150000, eligible: true }, // NEW: Added as per user request
    { name: 'Life Insurance Premium', section: '80C', amount: 0, maxLimit: 150000, eligible: true },
    { name: 'ELSS Investments', section: '80C', amount: 0, maxLimit: 150000, eligible: true },
    { name: 'PPF Investment', section: '80C', amount: 0, maxLimit: 150000, eligible: true },
    { name: 'Health Insurance Premium', section: '80D', amount: 0, maxLimit: 25000, eligible: true },
    { name: 'Home Loan Interest', section: '24(b)', amount: 0, maxLimit: 200000, eligible: true },
    { name: 'Education Loan Interest', section: '80E', amount: 0, eligible: true },
    { name: 'NPS Contribution', section: '80CCD(1B)', amount: 0, maxLimit: 50000, eligible: true },
  ]);

  // Tax calculations
  const [taxableIncomeOldRegime, setTaxableIncomeOldRegime] = useState<number>(0); // Added state
  const [taxableIncomeNewRegime, setTaxableIncomeNewRegime] = useState<number>(0); // Added state
  const [taxUnderOldRegime, setTaxUnderOldRegime] = useState<number>(0);
  const [taxUnderNewRegime, setTaxUnderNewRegime] = useState<number>(0);
  const [oldRegimeSlabs, setOldRegimeSlabs] = useState<TaxSlabOld[]>([]);
  const [newRegimeSlabs, setNewRegimeSlabs] = useState<TaxSlabNew[]>([]);
  const [totalDeductions, setTotalDeductions] = useState<number>(0);
  const [totalDeductionsOldRegimeForDisplay, setTotalDeductionsOldRegimeForDisplay] = useState<number>(0); // For Old Regime UI
  const [moreBeneficialRegime, setMoreBeneficialRegime] = useState<string>('');
  const [potentialRefund, setPotentialRefund] = useState<number>(0);
  const [activeTips, setActiveTips] = useState<TaxTip[]>([]); // State for tips

  // HRA states
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [hraReceived, setHraReceived] = useState<number>(0);
  const [rentPaid, setRentPaid] = useState<number>(0);
  const [isMetroCity, setIsMetroCity] = useState<boolean>(true); // Default to Metro
  const [hraExemption, setHraExemption] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Helper function to calculate HRA Exemption
  const calculateHraExemptionLogic = (basic: number, hra: number, rent: number, metro: boolean): number => {
    if (basic <= 0 || hra <= 0 || rent <= 0) {
      return 0;
    }

    const condition1 = hra; // Actual HRA received
    const condition2 = rent - (0.10 * basic); // Rent paid minus 10% of basic salary
    const condition3 = metro ? (0.50 * basic) : (0.40 * basic); // 50% or 40% of basic salary

    return Math.max(0, Math.min(condition1, condition2, condition3));
  };

  // useEffect to calculate HRA exemption when inputs change
  useEffect(() => {
    const exemption = calculateHraExemptionLogic(basicSalary, hraReceived, rentPaid, isMetroCity);
    setHraExemption(exemption);
  }, [basicSalary, hraReceived, rentPaid, isMetroCity]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load financial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the authenticated user's ID
        if (!user || !user.id) {
          if (!user) {
            console.log("No user logged in, redirecting to login");
            navigate('/login');
          }
          return;
        }
        await fetchFinancialData(user.id);
      } catch (error) {
        console.error("Error loading financial data:", error);
      }
    };

    loadData();
  }, [user, fetchFinancialData, navigate]);

  // Update yearly income when financial data is loaded
  useEffect(() => {
    if (financialData?.personalInfo?.monthlySalary) {
      const annualSalary = financialData.personalInfo.monthlySalary * 12;
      setYearlyIncome(annualSalary);

      // Also update EPF amount if available
      if (financialData.assetsLiabilities?.epfBalance > 0) {
        // Assuming 12% of basic salary goes to EPF
        // This is a rough estimate - in a real app, we'd get the actual contribution
        const basicEstimate = annualSalary * 0.5; // Assuming basic is about 50% of CTC
        const epfContribution = Math.min(basicEstimate * 0.12, 21600); // 1800 per month max

        setDeductions(prev => prev.map(item =>
          item.name === 'Employee PF Contribution'
            ? { ...item, amount: epfContribution }
            : item
        ));
      }
    }
  }, [financialData]);

  // NEW: Load saved tax plan data when available
  useEffect(() => {
    if (financialData?.taxPlan) {
      const taxPlan = financialData.taxPlan;

      console.log('[Tax Planning] Loading saved tax plan data:', taxPlan);

      // Load saved income values
      if (taxPlan.yearlyIncome) {
        setYearlyIncome(taxPlan.yearlyIncome);
      }

      // Load other income and capital gains if available
      if (taxPlan.otherIncome !== undefined) {
        setOtherIncome(taxPlan.otherIncome);
      }
      if (taxPlan.capitalGains !== undefined) {
        setCapitalGains(taxPlan.capitalGains);
      }

      // Load selected regime
      if (taxPlan.selectedRegime) {
        setSelectedRegime(taxPlan.selectedRegime);
      }

      // Load saved deductions
      if (taxPlan.deductions && Array.isArray(taxPlan.deductions)) {
        setDeductions(prev => {
          // Create a map of saved deductions
          const savedDeductionsMap = new Map(
            taxPlan.deductions.map((d: DeductionItem) => [d.name, d])
          );

          // Update existing deductions with saved values, keeping the structure
          return prev.map(item => {
            const savedItem = savedDeductionsMap.get(item.name);
            if (savedItem) {
              return { ...item, amount: savedItem.amount, eligible: savedItem.eligible };
            }
            return item;
          });
        });
      }

      // Load HRA exemption data if available
      if (taxPlan.hraExemption !== undefined) {
        setHraExemption(taxPlan.hraExemption);
      }

      toast.success('Loaded your saved tax plan data');
    }
  }, [financialData?.taxPlan]);

  // Define general tips (can be moved to a util file later if extensive)
  const generalTaxTips: TaxTip[] = React.useMemo(() => [
    { id: 'gen1', type: 'general', text: "File your income tax return (ITR) on time to avoid penalties and interest." },
    { id: 'gen2', type: 'general', text: "Review your Form 26AS annually to ensure TDS credits match your records." },
    { id: 'gen3', type: 'general', text: "Consider tax-saving fixed deposits if you prefer safe, fixed returns (interest is taxable)." },
    { id: 'gen4', type: 'general', text: "Donations to specified charitable institutions are eligible for deduction under Section 80G." },
    { id: 'gen5', type: 'general', text: "Maintain records of all your investments and expenses that can be claimed as deductions." },
    { id: 'gen6', type: 'general', text: "If you have a home loan, the principal repayment is eligible for deduction under Section 80C." },
    { id: 'gen7', type: 'general', text: "Interest earned on your PPF account is tax-free, making it an excellent long-term investment." },
    { id: 'gen8', type: 'general', text: "Tuition fees paid for up to two children can be claimed as a deduction under Section 80C." },
    { id: 'gen9', type: 'general', text: "Explore tax benefits available on education loans under Section 80E for interest paid." },
    { id: 'gen10', type: 'general', text: "When switching jobs, ensure your Form 16 from previous employer is collected for accurate ITR filing." },
    { id: 'gen11', type: 'general', text: "Standard Deduction is available for salaried individuals: ₹50,000 under Old Regime, ₹75,000 under New Regime (as per Union Budget 2025)." }, 
  ], []);

  // Calculate tax whenever income or deductions change
  useEffect(() => {
    calculateTax();
  }, [yearlyIncome, otherIncome, capitalGains, deductions, hraExemption]); // Added otherIncome and capitalGains

  // Update displayed tips when relevant financial data changes
  useEffect(() => {
    const generateAndSetDisplayTips = () => {
      const dynamicTipsGenerated: TaxTip[] = [];
      // MAX_DISPLAY_TIPS is no longer needed here as we show all dynamic tips

      // Helper function to get marginal slab rate (simplified)
      const getMarginalSlabRate = (income: number, regime: 'old' | 'new'): number => {
        // Note: This function determines the statutory marginal rate for an additional rupee of income/deduction.
        // Rebates (like u/s 87A) reduce overall tax but don't change the marginal rate for the slab itself.
        if (regime === 'old') { // FY 2023-24 (AY 2024-25)
          if (income <= 250000) return 0;
          if (income <= 500000) return 0.05;
          if (income <= 1000000) return 0.20;
          return 0.30;
        } else { // New regime (FY 2024-25 / AY 2025-26 as per calculateNewRegimeTax)
          if (income <= 300000) return 0;
          if (income <= 600000) return 0.05;
          if (income <= 900000) return 0.10;
          if (income <= 1200000) return 0.15;
          if (income <= 1500000) return 0.20;
          return 0.30;
        }
      };

      // --- Dynamic Tip Logic --- 
      // (This will be expanded to at least 5 dynamic tips)

      // Dynamic Tip 1: Section 80C Utilization (Quantified for Old Regime)
      const section80CItems = deductions.filter(d => d.section === '80C');
      const current80CAmount = section80CItems.reduce((sum, item) => sum + (item.eligible ? item.amount : 0), 0);
      const max80CLimit = 150000;
      const roomIn80C = max80CLimit - current80CAmount;

      if (roomIn80C >= 10000) { // Only if significant room
        // For 80C, benefit is primarily under Old Regime
        const slabRateOld = getMarginalSlabRate(taxableIncomeOldRegime, 'old');
        const potentialSaving80C = roomIn80C * slabRateOld;
        if (potentialSaving80C > 100) { // Only if saving is somewhat meaningful
            dynamicTipsGenerated.push({
              id: 'dyn_80c_maximize',
              type: 'dynamic',
              text: `Investing an additional ${formatCurrency(roomIn80C)} in Sec 80C (e.g., PPF, ELSS) could save you approx. ${formatCurrency(potentialSaving80C)} in tax under the Old Regime.`
            });
        }
      }

      // Dynamic Tip 3: HRA - Living with Parents (Simplified) - To be quantified
      const hraCalculatedExemption = deductions.find(d => d.name === "HRA Exemption (Calculated)")?.amount || 0;
      if (hraCalculatedExemption === 0 && yearlyIncome > 500000) { 
         dynamicTipsGenerated.push({
            id: 'dyn_hra_parents',
            type: 'dynamic',
            text: 'Not claiming HRA? If you live with parents and pay them rent, you might claim HRA. This could offer significant tax savings under the Old Regime.'
         });
      }

      // Dynamic Tip 4: NPS Maximization (80CCD(1B)) - To be quantified
      const npsDeductionItem = deductions.find(d => d.section === '80CCD(1B)' && d.name === 'NPS Contribution (Sec 80CCD(1B))'); // Corrected name based on deductions state
      if (npsDeductionItem && npsDeductionItem.eligible && npsDeductionItem.amount < 50000) {
        const npsRoom = 50000 - npsDeductionItem.amount;
        if (npsRoom >= 5000) { 
          const slabRateForNPS = getMarginalSlabRate(selectedRegime === 'old' || selectedRegime === 'compare' ? taxableIncomeOldRegime : taxableIncomeNewRegime, selectedRegime === 'old' || selectedRegime === 'compare' ? 'old' : 'new');
          const potentialSavingNPS = npsRoom * slabRateForNPS;
          if (potentialSavingNPS > 100) {
            dynamicTipsGenerated.push({
              id: 'dyn_nps_maximize',
              type: 'dynamic',
              text: `Contributing an additional ${formatCurrency(npsRoom)} to NPS (Sec 80CCD(1B)) could save you approx. ${formatCurrency(potentialSavingNPS)} in tax.`
            });
          }
        }
      }

      // Dynamic Tip: Home Loan Interest (Sec 24(b)) Maximization
      const homeLoanInterestItem = deductions.find(d => d.section === '24(b)' && d.name === 'Home Loan Interest'); // Corrected name based on deductions state
      const maxHomeLoanInterestLimit = 200000;
      if (homeLoanInterestItem && homeLoanInterestItem.eligible && homeLoanInterestItem.amount < maxHomeLoanInterestLimit) {
        const roomInHomeLoanInterest = maxHomeLoanInterestLimit - homeLoanInterestItem.amount;
        if (roomInHomeLoanInterest >= 10000) { // Only if significant room
          const slabRateOld = getMarginalSlabRate(taxableIncomeOldRegime, 'old');
          const potentialSaving = roomInHomeLoanInterest * slabRateOld;
          if (potentialSaving > 100) {
            dynamicTipsGenerated.push({
              id: 'dyn_homeloan_maximize',
              type: 'dynamic',
              text: `You could claim an additional ${formatCurrency(roomInHomeLoanInterest)} for Home Loan Interest (Sec 24b), potentially saving ~${formatCurrency(potentialSaving)} in tax under the Old Regime.`
            });
          }
        }
      }

      // Dynamic Tip: Section 80D (Medical Insurance) Maximization
      const medicalInsuranceItem = deductions.find(d => d.section === '80D' && d.name === 'Health Insurance Premium'); // Corrected name based on deductions state
      const max80DLimitSelf = 25000; 
      if (medicalInsuranceItem && medicalInsuranceItem.eligible && medicalInsuranceItem.amount < max80DLimitSelf) {
        const roomIn80D = max80DLimitSelf - medicalInsuranceItem.amount;
        if (roomIn80D >= 2000) { 
          const slabRateOld = getMarginalSlabRate(taxableIncomeOldRegime, 'old');
          const potentialSaving = roomIn80D * slabRateOld;
          if (potentialSaving > 50) { 
            dynamicTipsGenerated.push({
              id: 'dyn_80d_maximize',
              type: 'dynamic',
              text: `Consider increasing your health insurance (Sec 80D) claim by ${formatCurrency(roomIn80D)} (up to ₹25k limit for self/family). This could save ~${formatCurrency(potentialSaving)} in tax under the Old Regime.`
            });
          }
        }
      }
      
      // Dynamic tips are now the only source for activeTips
      setActiveTips(dynamicTipsGenerated);
    };

    generateAndSetDisplayTips();
    // Dependencies: all inputs that might change the relevance of a tip
  }, [yearlyIncome, deductions, hraExemption, taxableIncomeOldRegime, taxableIncomeNewRegime, taxUnderOldRegime, taxUnderNewRegime, selectedRegime, generalTaxTips, formatCurrency]);


  // Helper function to calculate tax for old regime
  const calculateOldRegimeTax = (taxableIncome: number) => {
    // Define slabs for Old Tax Regime FY 2023-24 (AY 2024-25)
    let slabs: TaxSlabOld[] = [];
    let totalTax = 0;

    if (taxableIncome <= 250000) {
      // No tax
      slabs.push({ min: 0, max: 250000, rate: 0, tax: 0 });
    } else {
      slabs.push({ min: 0, max: 250000, rate: 0, tax: 0 });

      // 5% for 2.5L to 5L
      if (taxableIncome > 250000) {
        const amount = Math.min(taxableIncome, 500000) - 250000;
        const tax = amount * 0.05;
        totalTax += tax;
        slabs.push({ min: 250000, max: 500000, rate: 5, tax });
      }

      // 20% for 5L to 10L
      if (taxableIncome > 500000) {
        const amount = Math.min(taxableIncome, 1000000) - 500000;
        const tax = amount * 0.2;
        totalTax += tax;
        slabs.push({ min: 500000, max: 1000000, rate: 20, tax });
      }

      // 30% for above 10L
      if (taxableIncome > 1000000) {
        const amount = taxableIncome - 1000000;
        const tax = amount * 0.3;
        totalTax += tax;
        slabs.push({ min: 1000000, max: Infinity, rate: 30, tax });
      }
    }

    // Rebate under section 87A (for income up to 5 lakh)
    if (taxableIncome <= 500000) {
      const rebate = Math.min(totalTax, 12500);
      totalTax -= rebate;
    }

    // Add 4% cess
    const cess = totalTax * 0.04;
    totalTax += cess;

    setOldRegimeSlabs(slabs);
    return totalTax;
  };

  // Helper function to calculate tax for new regime FY 2025-26 (AY 2026-27) - Union Budget 2025
  const calculateNewRegimeTax = (income: number) => { // income is net taxable income after standard deduction
    let slabs: TaxSlabNew[] = [];
    let totalTax = 0;

    // New Regime Slabs for FY 2025-26 (AY 2026-27) - As per Union Budget 2025 (Effective from April 1, 2025)
    // ₹0 - ₹4,00,000: Nil (0%)
    // ₹4,00,001 - ₹8,00,000: 5%
    // ₹8,00,001 - ₹12,00,000: 10%
    // ₹12,00,001 - ₹16,00,000: 15%
    // ₹16,00,001 - ₹20,00,000: 20%
    // ₹20,00,001 - ₹24,00,000: 25%
    // Above ₹24,00,000: 30%

    // Calculate tax based on new slabs
    slabs.push({ min: 0, max: 400000, rate: 0, tax: 0 });

    if (income > 400000) {
      const slabTax = (Math.min(income, 800000) - 400000) * 0.05;
      if (slabTax > 0) {
        totalTax += slabTax;
        slabs.push({ min: 400000, max: 800000, rate: 5, tax: slabTax });
      }
    }

    if (income > 800000) {
      const slabTax = (Math.min(income, 1200000) - 800000) * 0.10;
      if (slabTax > 0) {
        totalTax += slabTax;
        slabs.push({ min: 800000, max: 1200000, rate: 10, tax: slabTax });
      }
    }

    if (income > 1200000) {
      const slabTax = (Math.min(income, 1600000) - 1200000) * 0.15;
      if (slabTax > 0) {
        totalTax += slabTax;
        slabs.push({ min: 1200000, max: 1600000, rate: 15, tax: slabTax });
      }
    }

    if (income > 1600000) {
      const slabTax = (Math.min(income, 2000000) - 1600000) * 0.20;
      if (slabTax > 0) {
        totalTax += slabTax;
        slabs.push({ min: 1600000, max: 2000000, rate: 20, tax: slabTax });
      }
    }

    if (income > 2000000) {
      const slabTax = (Math.min(income, 2400000) - 2000000) * 0.25;
      if (slabTax > 0) {
        totalTax += slabTax;
        slabs.push({ min: 2000000, max: 2400000, rate: 25, tax: slabTax });
      }
    }

    if (income > 2400000) {
      const slabTax = (income - 2400000) * 0.30;
      if (slabTax > 0) {
        totalTax += slabTax;
        slabs.push({ min: 2400000, max: Infinity, rate: 30, tax: slabTax });
      }
    }

    // Add 4% cess (only if totalTax > 0)
    if (totalTax > 0) {
      const cess = totalTax * 0.04;
      totalTax += cess;
    }

    setNewRegimeSlabs(slabs.filter(s => s.max > 0)); // Filter out zero-range slabs if income is very low
    return totalTax;
  };

  // Main function to calculate taxes
  const calculateTax = () => {
    // Calculate total gross income (salary + other income + capital gains)
    const totalGrossIncome = yearlyIncome + otherIncome + capitalGains;

    // First calculate total deductions
    const totalDeductionAmount = deductions.reduce((total, item) => {
      if (item.eligible) {
        // Apply maximum limits where defined
        const amount = item.maxLimit ? Math.min(item.amount, item.maxLimit) : item.amount;
        return total + amount;
      }
      return total;
    }, 0);

    setTotalDeductions(totalDeductionAmount);

    // Calculate taxable income for old regime (with deductions)
    // For Old Regime, add HRA exemption to other deductions
    const totalDeductionsOldRegime = totalDeductionAmount + hraExemption;
    setTotalDeductionsOldRegimeForDisplay(totalDeductionsOldRegime); // Set for display
    const calculatedTaxableIncomeOldRegime = Math.max(0, totalGrossIncome - totalDeductionsOldRegime);
    setTaxableIncomeOldRegime(calculatedTaxableIncomeOldRegime); // Set state
    const oldRegimeTax = calculateOldRegimeTax(calculatedTaxableIncomeOldRegime);
    setTaxUnderOldRegime(oldRegimeTax);

    // Calculate tax for new regime (without most deductions, but with higher slabs)
    // In new regime, standard deduction of ₹75,000 is allowed (as per Union Budget 2025)
    const standardDeductionNewRegime = 75000;
    const calculatedTaxableIncomeNewRegime = Math.max(0, totalGrossIncome - standardDeductionNewRegime);
    setTaxableIncomeNewRegime(calculatedTaxableIncomeNewRegime); // Set state
    const newRegimeTax = calculateNewRegimeTax(calculatedTaxableIncomeNewRegime);
    setTaxUnderNewRegime(newRegimeTax);

    // Determine which regime is more beneficial
    if (oldRegimeTax < newRegimeTax) {
      setMoreBeneficialRegime('old');
      setPotentialRefund(newRegimeTax - oldRegimeTax);
    } else {
      setMoreBeneficialRegime('new');
      setPotentialRefund(oldRegimeTax - newRegimeTax);
    }
  };

  // Handle deduction amount change
  const handleDeductionChange = (index: number, amount: number) => {
    const updatedDeductions = [...deductions];
    updatedDeductions[index].amount = amount;
    setDeductions(updatedDeductions);
  };

  // Handle deduction eligibility change
  const handleEligibilityChange = (index: number, eligible: boolean) => {
    const updatedDeductions = [...deductions];
    updatedDeductions[index].eligible = eligible;
    setDeductions(updatedDeductions);
  };

  // Handle save tax plan
  const handleSaveTaxPlan = async () => {
    if (!user || !user.id) {
      toast.error('Please log in to save your tax plan');
      return;
    }

    if (yearlyIncome <= 0) {
      toast.error('Please enter your yearly income before saving');
      return;
    }

    setIsSaving(true);

    try {
      // Format deductions to match backend TaxDeduction model
      const formattedDeductions = deductions
        .filter(d => d.eligible && d.amount > 0)
        .map(d => ({
          name: d.name,
          section: d.section,
          amount: d.amount,
          maxLimit: d.maxLimit || null,
          eligible: d.eligible
        }));

      // Use existing data from financialDataStore, with null fallbacks for optional fields
      const taxPlanData = {
        userId: user.id,
        personalInfo: financialData?.personalInfo || null,
        assetsLiabilities: financialData?.assetsLiabilities || null,
        assets: financialData?.assets || null,
        liabilities: financialData?.liabilities || null,
        goals: financialData?.goals || null,  // Required by backend even though Optional
        riskAppetite: financialData?.riskAppetite || null,  // Required by backend even though Optional
        taxPlan: {
          yearlyIncome: yearlyIncome,
          otherIncome: otherIncome, // NEW: Include other income
          capitalGains: capitalGains, // NEW: Include capital gains
          selectedRegime: selectedRegime,
          deductions: formattedDeductions,
          taxUnderOldRegime: taxUnderOldRegime,
          taxUnderNewRegime: taxUnderNewRegime,
          moreBeneficialRegime: moreBeneficialRegime,
          taxSavings: potentialRefund,
          hraExemption: hraExemption,
        }
      };

      console.log('Sending tax plan data:', JSON.stringify(taxPlanData, null, 2));

      const response = await fetch(API_ENDPOINTS.saveFinancialData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taxPlanData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save tax plan';
        try {
          const errorData = await response.json();
          console.error('Backend error response:', errorData);

          // Format error message from FastAPI validation errors
          if (errorData.detail && Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) =>
              `${err.loc.join('.')}: ${err.msg}`
            ).join('; ');
          } else if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch (e) {
          console.error('Could not parse error response');
        }
        throw new Error(errorMessage);
      }

      toast.success('Tax plan saved successfully! Milestone 3 complete ✅');

      // Refresh financial data to update Journey Map
      await fetchFinancialData(user.id);
    } catch (error) {
      console.error('Error saving tax plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save tax plan');
    } finally {
      setIsSaving(false);
    }
  };

  // Prepare chart data
  const getComparisonChartData = () => [
    {
      name: 'Old Regime',
      tax: taxUnderOldRegime,
      deductions: totalDeductions,
      color: '#60a5fa', // Blue
    },
    {
      name: 'New Regime',
      tax: taxUnderNewRegime,
      deductions: 75000, // Standard deduction only (as per Union Budget 2025)
      color: '#4ade80', // Green
    },
  ];

  const getSlabChartData = (regime: 'old' | 'new') => {
    const slabs = regime === 'old' ? oldRegimeSlabs : newRegimeSlabs;
    return slabs.map(slab => ({
      name: `${formatCurrency(slab.min)} - ${slab.max === Infinity ? 'Above' : formatCurrency(slab.max)}`,
      rate: slab.rate,
      tax: slab.tax,
      color: slab.rate === 0 ? '#e5e7eb' : 
             slab.rate <= 5 ? '#bbf7d0' :
             slab.rate <= 10 ? '#86efac' :
             slab.rate <= 15 ? '#4ade80' :
             slab.rate <= 20 ? '#22c55e' : '#16a34a',
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tax Planning</h1>
          <p className="text-gray-600">Compare old and new tax regimes to optimize your tax benefits</p>
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm font-medium text-blue-900">
              Financial Year: 2025-26 (AY 2026-27) | As per Union Budget 2025 | Effective from: April 1, 2025
            </p>
            <p className="text-xs text-blue-700 mt-1">
              All tax calculations use the latest tax slabs for both Old and New Tax Regimes
            </p>
          </div>
        </div>

        {/* Guideline Box */}
        <GuidelineBox />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-3 bg-white shadow-md">
            <CardHeader>
              <CardTitle>Income & Deductions</CardTitle>
              <CardDescription>Enter your yearly income and applicable deductions to calculate tax liability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearly-income">Yearly Salary Income (₹)</Label>
                    <Input
                      id="yearly-income"
                      type="number"
                      value={yearlyIncome || ''}
                      onChange={(e) => setYearlyIncome(Number(e.target.value))}
                      className="w-full"
                      placeholder="e.g., 1200000"
                    />
                    <FormattedNumberDisplay value={yearlyIncome || 0} />
                  </div>

                  {/* NEW: Other Income Field */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="other-income">Other Income (₹)</Label>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                            <p className="font-semibold mb-1">Other Income:</p>
                            <p className="text-sm">Include income from: Interest on savings accounts/FDs, Rental income, Freelancing income, or any other taxable income sources.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="other-income"
                      type="number"
                      value={otherIncome || ''}
                      onChange={(e) => setOtherIncome(Number(e.target.value))}
                      className="w-full"
                      placeholder="e.g., 50000"
                    />
                    <FormattedNumberDisplay value={otherIncome || 0} />
                  </div>

                  {/* NEW: Capital Gains Field */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="capital-gains">Capital Gains (₹)</Label>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                            <p className="font-semibold mb-1">Capital Gains:</p>
                            <p className="text-sm">Profits from the sale of capital assets like stocks, mutual funds, property, gold, etc. This is taxable income.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="capital-gains"
                      type="number"
                      value={capitalGains || ''}
                      onChange={(e) => setCapitalGains(Number(e.target.value))}
                      className="w-full"
                      placeholder="e.g., 100000"
                    />
                    <FormattedNumberDisplay value={capitalGains || 0} />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Tax Regime</Label>
                    <RadioGroup 
                      value={selectedRegime} 
                      onValueChange={setSelectedRegime}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compare" id="compare" />
                        <Label htmlFor="compare" className="cursor-pointer">Compare Both</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="old" id="old" />
                        <Label htmlFor="old" className="cursor-pointer">Old Regime</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new" className="cursor-pointer">New Regime</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* HRA Inputs Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 mt-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-700">HRA Exemption Details</h4>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                            <p className="font-semibold mb-1">HRA Exemption Rules:</p>
                            <p className="text-sm">The HRA exemption is the <strong>minimum</strong> of the following three amounts:</p>
                            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                              <li>Actual HRA (House Rent Allowance) received from the employer.</li>
                              <li>Rent paid annually minus 10% of your annual basic salary.</li>
                              <li>50% of your annual basic salary if you live in a metro city (Delhi, Mumbai, Chennai, Kolkata), or 40% if you live in a non-metro city.</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basic-salary">Basic Salary (Yearly)</Label>
                      <Input 
                        id="basic-salary" 
                        type="number" 
                        value={basicSalary || ''}
                        onChange={(e) => setBasicSalary(Number(e.target.value))} 
                        className="w-full"
                        placeholder="e.g., 600000"
                      />
                    </div>

                  </div>
                  {/* End HRA Inputs Section */}
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">Tax Savings Insight</h3>
                    <p className="text-sm text-blue-700">
                      {moreBeneficialRegime === 'old' ? (
                        <>The <strong>Old Regime</strong> is more beneficial for you with <strong>{formatCurrency(potentialRefund)}</strong> in savings.</>
                      ) : (
                        <>The <strong>New Regime</strong> is more beneficial for you with <strong>{formatCurrency(potentialRefund)}</strong> in savings.</>
                      )}
                    </p>
                  </div>

                  {/* Smart Tax-Saving Tips Section - Moved to Left Column */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-700">Smart Tax-Saving Tips</h4>
                    {activeTips.length > 0 ? (
                      <TaxTipsDisplay tips={activeTips} />
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No specific smart tips based on your current entries. General advice is available on the right.
                      </p>
                    )}
                  </div>



                </div>

                <div className="lg:col-span-2">
                  <Accordion type="multiple" defaultValue={['deductions-main']} className="w-full">
                    <AccordionItem value="deductions-main" className="border p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-800">Deductions & Exemptions</h3>
                        <AccordionTrigger className="h-5 -mr-2" />
                      </div>
                      
                      <AccordionContent className="pt-2">
                        <p className="text-sm text-gray-500 mb-4">These apply only to the Old Tax Regime (except Standard Deduction)</p>

                        <div className="space-y-3">
                          {/* Standard Deduction */}
                          {(() => {
                            const deduction = deductions.find(d => d.section === '16(ia)');
                            const index = deductions.findIndex(d => d.section === '16(ia)');
                            if (!deduction) return null;
                            return (
                              <AccordionItem value="standard-deduction" className="border rounded-lg bg-white shadow-sm">
                                <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline w-full">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="flex items-center">
                                      Standard Deduction (Sec 16(ia))
                                      <Badge variant="outline" className="ml-2 text-xs">Both Regimes</Badge>
                                    </span>
                                    <TooltipProvider delayDuration={300}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-4 w-4 text-gray-500 cursor-help mr-2" onClick={(e) => e.stopPropagation()} />
                                        </TooltipTrigger>
                                        <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                          <p className="font-semibold mb-1">Standard Deduction:</p>
                                          <p className="text-sm">A flat deduction from your salary income. ₹50,000 under Old Regime, ₹75,000 under New Regime (as per Union Budget 2025).</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor={`amount-std-deduction`} className="font-normal text-gray-700">{deduction.name}</Label>
                                    <div className="flex items-center">
                                      <input 
                                        type="checkbox" 
                                        checked={deduction.eligible}
                                        onChange={(e) => handleEligibilityChange(index, e.target.checked)}
                                        className="rounded text-blue-600 mr-2 h-4 w-4"
                                        id={`eligible-std-deduction`}
                                      />
                                      <Label htmlFor={`eligible-std-deduction`} className="text-sm font-normal">Eligible</Label>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Input 
                                      id={`amount-std-deduction`}
                                      type="number" 
                                      value={deduction.amount || ''}
                                      onChange={(e) => handleDeductionChange(index, Number(e.target.value))}
                                      disabled={!deduction.eligible}
                                      className="w-full"
                                    />
                                    {deduction.maxLimit && (
                                      <span className="ml-3 text-xs text-gray-500 whitespace-nowrap">
                                        Max: {formatCurrency(deduction.maxLimit)}
                                      </span>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })()}

                          {/* HRA Exemption */}
                          <AccordionItem value="hra-exemption" className="border rounded-lg bg-white shadow-sm">
                            <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline w-full">
                              <div className="flex items-center justify-between w-full">
                                <span className="flex items-center">
                                  HRA Exemption Details
                                  <Badge variant="outline" className="ml-2 text-xs">Old Regime Only</Badge>
                                </span>
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500 cursor-help mr-2" onClick={(e) => e.stopPropagation()} />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                      <p className="font-semibold mb-1">HRA Exemption:</p>
                                      <p className="text-sm">Exemption for House Rent Allowance. Based on basic salary, HRA received, rent paid, and city type. Applicable under Old Regime only.</p>
                                      <p className="text-sm mt-1">The exemption is the <strong>minimum</strong> of: 1. Actual HRA received, 2. Rent paid - 10% of basic salary, 3. 50% of basic salary (metro) or 40% (non-metro).</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 pt-2">
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-gray-700 text-sm">HRA Exemption Calculation</h4>
                                  <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-gray-500 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                        <p className="font-semibold mb-1">HRA Exemption Rules:</p>
                                        <p className="text-sm">The HRA exemption is the <strong>minimum</strong> of the following three amounts:</p>
                                        <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                          <li>Actual HRA (House Rent Allowance) received from the employer.</li>
                                          <li>Rent paid annually minus 10% of your annual basic salary.</li>
                                          <li>50% of your annual basic salary if you live in a metro city (Delhi, Mumbai, Chennai, Kolkata), or 40% if you live in a non-metro city.</li>
                                        </ul>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="basic-salary-acc">Basic Salary (Yearly)</Label>
                                  <Input
                                    id="basic-salary-acc"
                                    type="number"
                                    value={basicSalary || ''}
                                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                                    className="w-full"
                                    placeholder="e.g., 600000"
                                  />
                                  <FormattedNumberDisplay value={basicSalary || 0} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="hra-received-acc">HRA Received (Yearly)</Label>
                                  <Input
                                    id="hra-received-acc"
                                    type="number"
                                    value={hraReceived || ''}
                                    onChange={(e) => setHraReceived(Number(e.target.value))}
                                    className="w-full"
                                    placeholder="e.g., 300000"
                                  />
                                  <FormattedNumberDisplay value={hraReceived || 0} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rent-paid-acc">Rent Paid (Yearly)</Label>
                                  <Input
                                    id="rent-paid-acc"
                                    type="number"
                                    value={rentPaid || ''}
                                    onChange={(e) => setRentPaid(Number(e.target.value))}
                                    className="w-full"
                                    placeholder="e.g., 240000"
                                  />
                                  <FormattedNumberDisplay value={rentPaid || 0} />
                                </div>
                                <div className="space-y-2">
                                  <Label>City Type</Label>
                                  <RadioGroup 
                                    value={isMetroCity ? "metro" : "non-metro"} 
                                    onValueChange={(value) => setIsMetroCity(value === "metro")}
                                    className="flex space-x-4"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="metro" id="metro-city-acc" />
                                      <Label htmlFor="metro-city-acc" className="cursor-pointer font-normal">Metro</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="non-metro" id="non-metro-city-acc" />
                                      <Label htmlFor="non-metro-city-acc" className="cursor-pointer font-normal">Non-Metro</Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                {hraExemption > 0 && (
                                  <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200 mt-3">
                                    <p className="text-sm text-indigo-700">
                                      Calculated HRA Exemption: <span className="font-semibold">{formatCurrency(hraExemption)}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Section 80C Deductions */}
                          <AccordionItem value="section-80c" className="border rounded-lg bg-white shadow-sm">
                            <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline w-full">
                              <div className="flex items-center justify-between w-full">
                                <span className="flex items-center">
                                  Section 80C Deductions
                                  <Badge variant="outline" className="ml-2 text-xs">Old Regime Only</Badge>
                                </span>
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500 cursor-help mr-2" onClick={(e) => e.stopPropagation()} />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                      <p className="font-semibold mb-1">Section 80C:</p>
                                      <p className="text-sm">Deductions for investments/expenses like EPF, PPF, LIC, ELSS, NSC, home loan principal, tuition fees. Max limit ₹1,50,000. Applicable under Old Regime only.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 pt-2">
                              <p className="text-xs text-gray-500 mb-1">Overall limit for Sec 80C is ₹1,50,000. Old Regime only.</p>
                              {(() => {
                                const section80CItems = deductions.filter(d => d.section === '80C');
                                const current80CAmount = section80CItems.reduce((sum, item) => sum + (item.eligible ? item.amount : 0), 0);
                                const max80CLimit = 150000;
                                const progress80C = (current80CAmount / max80CLimit) * 100;
                                
                                return (
                                  <div className="mb-4">
                                    <Progress value={progress80C > 100 ? 100 : progress80C} className="w-full h-3" />
                                    <div className="text-xs text-gray-600 mt-1 flex justify-between">
                                      <span>Utilized: {formatCurrency(Math.min(current80CAmount, max80CLimit))} / {formatCurrency(max80CLimit)}</span>
                                      {current80CAmount > max80CLimit && <span className='text-red-500'>Exceeded Limit</span>}
                                    </div>
                                  </div>
                                );
                              })()}
                              <p className="text-xs text-gray-500 mb-3">Individual investments under 80C:</p>
                              {deductions.filter(d => d.section === '80C').map((deduction, idx) => {
                                const index = deductions.findIndex(d => d.name === deduction.name && d.section === '80C');
                                return (
                                  <div key={`section-80c-${idx}`} className="py-3 border-t border-gray-100 first:border-0 first:pt-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label htmlFor={`amount-80c-${idx}`} className="font-normal text-gray-700">{deduction.name}</Label>
                                      <div className="flex items-center">
                                        <input 
                                          type="checkbox" 
                                          checked={deduction.eligible}
                                          onChange={(e) => handleEligibilityChange(index, e.target.checked)}
                                          className="rounded text-blue-600 mr-2 h-4 w-4"
                                          id={`eligible-80c-${idx}`}
                                        />
                                        <Label htmlFor={`eligible-80c-${idx}`} className="text-sm font-normal">Eligible</Label>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <Input 
                                        id={`amount-80c-${idx}`}
                                        type="number" 
                                        value={deduction.amount || ''}
                                        onChange={(e) => handleDeductionChange(index, Number(e.target.value))}
                                        disabled={!deduction.eligible}
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </AccordionContent>
                          </AccordionItem>

                          {/* Other Deductions */}
                          {[
                            { value: 'section-80d', title: 'Section 80D: Health Insurance', section: '80D' },
                            { value: 'section-24b', title: 'Section 24(b): Home Loan Interest', section: '24(b)' },
                            { value: 'section-80e', title: 'Section 80E: Education Loan Interest', section: '80E' },
                            { value: 'section-80ccd1b', title: 'Section 80CCD(1B): NPS Contribution', section: '80CCD(1B)' },
                          ].map(item => {
                            const deduction = deductions.find(d => d.section === item.section);
                            const index = deductions.findIndex(d => d.section === item.section);
                            if (!deduction) return null;
                            return (
                              <AccordionItem key={item.value} value={item.value} className="border rounded-lg bg-white shadow-sm">
                                <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline w-full">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="flex items-center">
                                      {item.title}
                                      <Badge variant="outline" className="ml-2 text-xs">Old Regime Only</Badge>
                                    </span>
                                    <TooltipProvider delayDuration={300}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-4 w-4 text-gray-500 cursor-help mr-2" onClick={(e) => e.stopPropagation()} />
                                        </TooltipTrigger>
                                        <TooltipContent className="w-80 p-3 bg-gray-800 text-white rounded-md shadow-lg">
                                          <p className="font-semibold mb-1">{item.title}:</p>
                                          <p className="text-sm">
                                            {item.section === '80D' && "Deduction for health insurance premiums for self, family, and parents. Limits vary. Applicable under Old Regime only."}
                                            {item.section === '24(b)' && "Deduction for interest paid on home loan. Max limit ₹2,00,000 for self-occupied property. Applicable under Old Regime only."}
                                            {item.section === '80E' && "Deduction for interest paid on an education loan. No upper limit on the amount. Applicable under Old Regime only."}
                                            {item.section === '80CCD(1B)' && "Additional deduction for National Pension System (NPS) contribution. Max limit ₹50,000 (over 80C). Applicable under Old Regime only."}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor={`amount-${item.value}`} className="font-normal text-gray-700">{deduction.name}</Label>
                                    <div className="flex items-center">
                                      <input 
                                        type="checkbox" 
                                        checked={deduction.eligible}
                                        onChange={(e) => handleEligibilityChange(index, e.target.checked)}
                                        className="rounded text-blue-600 mr-2 h-4 w-4"
                                        id={`eligible-${item.value}`}
                                      />
                                      <Label htmlFor={`eligible-${item.value}`} className="text-sm font-normal">Eligible</Label>
                                    </div>
                                  </div>
                                  <div className="flex items-center mb-2">
                                    <Input 
                                      id={`amount-${item.value}`}
                                      type="number" 
                                      value={deduction.amount || ''}
                                      onChange={(e) => handleDeductionChange(index, Number(e.target.value))}
                                      disabled={!deduction.eligible}
                                      className="w-full"
                                    />
                                    {deduction.maxLimit && (
                                      <span className="ml-3 text-xs text-gray-500 whitespace-nowrap">
                                        Max: {formatCurrency(deduction.maxLimit)}
                                      </span>
                                    )}
                                  </div>
                                  {deduction.maxLimit && deduction.eligible && (
                                    <div className="mt-2 mb-1">
                                      <Progress value={(deduction.amount / deduction.maxLimit) * 100 > 100 ? 100 : (deduction.amount / deduction.maxLimit) * 100} className="w-full h-3" />
                                      <div className="text-xs text-gray-600 mt-1 flex justify-between">
                                        <span>Utilized: {formatCurrency(Math.min(deduction.amount, deduction.maxLimit))} / {formatCurrency(deduction.maxLimit)}</span>
                                        {deduction.amount > deduction.maxLimit && <span className='text-red-500'>Exceeded</span>}
                                      </div>
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Comparison Section */}
        <Tabs defaultValue={selectedRegime === 'compare' ? 'comparison' : selectedRegime} value={selectedRegime === 'compare' ? 'comparison' : selectedRegime}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="comparison" onClick={() => setSelectedRegime('compare')}>Comparison</TabsTrigger>
            <TabsTrigger value="old" onClick={() => setSelectedRegime('old')}>Old Regime</TabsTrigger>
            <TabsTrigger value="new" onClick={() => setSelectedRegime('new')}>New Regime</TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle>Tax Regime Comparison</CardTitle>
                <CardDescription>Compare your tax liability under both regimes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Tax Comparison</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getComparisonChartData()} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                          <YAxis dataKey="name" type="category" />
                          <RechartsTooltip 
                            formatter={(value) => [formatCurrency(Number(value)), 'Tax Amount']} 
                            labelFormatter={(label) => `${label} Regime`}
                          />
                          <Legend />
                          <Bar dataKey="tax" name="Tax Amount" radius={[0, 4, 4, 0]}>
                            {getComparisonChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Deductions Comparison</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getComparisonChartData()} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                          <YAxis dataKey="name" type="category" />
                          <RechartsTooltip 
                            formatter={(value) => [formatCurrency(Number(value)), 'Deduction Amount']} 
                            labelFormatter={(label) => `${label} Regime`}
                          />
                          <Legend />
                          <Bar dataKey="deductions" name="Deduction Amount" radius={[0, 4, 4, 0]}>
                            {getComparisonChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#93c5fd' : '#86efac'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">Old Regime Summary</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-blue-700">Gross Income:</dt>
                        <dd className="font-medium">{formatCurrency(yearlyIncome)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-blue-700">Total Deductions (incl. HRA):</dt>
                        <dd className="font-medium">{formatCurrency(totalDeductionsOldRegimeForDisplay)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-blue-700">Taxable Income:</dt>
                        <dd className="font-medium">{formatCurrency(Math.max(0, yearlyIncome - totalDeductionsOldRegimeForDisplay))}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-blue-700">Tax Amount:</dt>
                        <dd className="font-medium">{formatCurrency(taxUnderOldRegime)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <h3 className="font-medium text-green-800 mb-2">New Regime Summary</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-green-700">Gross Income:</dt>
                        <dd className="font-medium">{formatCurrency(yearlyIncome)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-green-700">Standard Deduction:</dt>
                        <dd className="font-medium">{formatCurrency(75000)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-green-700">Taxable Income:</dt>
                        <dd className="font-medium">{formatCurrency(Math.max(0, yearlyIncome - 75000))}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-green-700">Tax Amount:</dt>
                        <dd className="font-medium">{formatCurrency(taxUnderNewRegime)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">Recommendation</h3>
                  <p className="text-gray-700">
                    Based on your income and deductions, the <span className="font-bold">{moreBeneficialRegime === 'old' ? 'Old' : 'New'} Tax Regime</span> is more beneficial for you.
                    You could save approximately <span className="font-bold text-green-600">{formatCurrency(potentialRefund)}</span> by opting for this regime.
                  </p>
                  {moreBeneficialRegime === 'old' ? (
                    <p className="mt-2 text-sm text-gray-600">
                      The Old Regime works better for you because your deductions amount to a significant portion of your income.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      The New Regime works better for you because its lower tax rates compensate for the limited deductions available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Old Regime Tab */}
          <TabsContent value="old" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle>Old Tax Regime</CardTitle>
                <CardDescription>Detailed breakdown of your tax calculation under the old regime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Tax Slab Breakdown</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getSlabChartData('old')}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <RechartsTooltip 
                            formatter={(value) => [formatCurrency(Number(value)), 'Tax']} 
                            labelFormatter={(label) => `Income: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="tax" name="Tax Amount" radius={[4, 4, 0, 0]}>
                            {getSlabChartData('old').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Tax Calculation Summary</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Income</h4>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Gross Income:</span>
                          <span className="font-medium">{formatCurrency(yearlyIncome)}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <h4 className="font-medium text-green-800 mb-2">Deductions</h4>
                        <div className="space-y-1">
                          {deductions.filter(d => d.eligible && d.amount > 0).map((d, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-green-700">{d.name} ({d.section}):</span>
                              <span>{formatCurrency(d.maxLimit ? Math.min(d.amount, d.maxLimit) : d.amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-1 font-medium border-t border-green-200 mt-2">
                            <span className="text-green-700">Total Deductions (incl. HRA):</span>
                            <span>{formatCurrency(totalDeductionsOldRegimeForDisplay)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <h4 className="font-medium text-amber-800 mb-2">Tax Calculation</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-amber-700">Taxable Income:</span>
                            <span className="font-medium">{formatCurrency(Math.max(0, yearlyIncome - totalDeductionsOldRegimeForDisplay))}</span>
                          </div>
                          {oldRegimeSlabs.filter(s => s.tax > 0).map((slab, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-amber-700">
                                {formatCurrency(slab.min)} to {slab.max === Infinity ? 'Above' : formatCurrency(slab.max)} @ {slab.rate}%:
                              </span>
                              <span>{formatCurrency(slab.tax)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700">Health & Education Cess @ 4%:</span>
                            <span>{formatCurrency(taxUnderOldRegime - (taxUnderOldRegime / 1.04))}</span>
                          </div>
                          <div className="flex justify-between pt-1 font-medium border-t border-amber-200 mt-2">
                            <span className="text-amber-700">Total Tax:</span>
                            <span>{formatCurrency(taxUnderOldRegime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Regime Tab */}
          <TabsContent value="new" className="space-y-6">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle>New Tax Regime</CardTitle>
                <CardDescription>Detailed breakdown of your tax calculation under the new regime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Tax Slab Breakdown</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getSlabChartData('new')}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <RechartsTooltip 
                            formatter={(value) => [formatCurrency(Number(value)), 'Tax']} 
                            labelFormatter={(label) => `Income: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="tax" name="Tax Amount" radius={[4, 4, 0, 0]}>
                            {getSlabChartData('new').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Tax Calculation Summary</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">Income</h4>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Gross Income:</span>
                          <span className="font-medium">{formatCurrency(yearlyIncome)}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <h4 className="font-medium text-green-800 mb-2">Deductions</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Standard Deduction (16(ia)):</span>
                            <span>{formatCurrency(75000)}</span>
                          </div>
                          <div className="flex justify-between pt-1 font-medium border-t border-green-200 mt-2">
                            <span className="text-green-700">Total Deductions:</span>
                            <span>{formatCurrency(75000)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <h4 className="font-medium text-amber-800 mb-2">Tax Calculation</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-amber-700">Taxable Income:</span>
                            <span className="font-medium">{formatCurrency(Math.max(0, yearlyIncome - 75000))}</span>
                          </div>
                          {newRegimeSlabs.filter(s => s.tax > 0).map((slab, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-amber-700">
                                {formatCurrency(slab.min)} to {slab.max === Infinity ? 'Above' : formatCurrency(slab.max)} @ {slab.rate}%:
                              </span>
                              <span>{formatCurrency(slab.tax)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-700">Health & Education Cess @ 4%:</span>
                            <span>{formatCurrency(taxUnderNewRegime - (taxUnderNewRegime / 1.04))}</span>
                          </div>
                          <div className="flex justify-between pt-1 font-medium border-t border-amber-200 mt-2">
                            <span className="text-amber-700">Total Tax:</span>
                            <span>{formatCurrency(taxUnderNewRegime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">Key Benefits of New Regime</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Lower tax rates in multiple slabs</li>
                    <li>Higher rebate limit of ₹7 lakh (vs ₹5 lakh in old regime)</li>
                    <li>Simplified tax filing with fewer deductions to track</li>
                    <li>Standard deduction of ₹75,000 (as per Union Budget 2025)</li>
                    <li>Beneficial for those with fewer investments and deductions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* General Tax-Saving Advice Section - MOVED TO BOTTOM */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">General Tax-Saving Advice</h4>
          <div className="space-y-3">
            {generalTaxTips.map(tip => (
              <Card key={tip.id} className="bg-slate-50 border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-slate-800">{tip.text}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button
            onClick={handleSaveTaxPlan}
            disabled={isSaving || yearlyIncome <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? 'Saving...' : '💾 Save Tax Plan'}
          </Button>
        </div>

        {/* Milestone 3 Completion Card */}
        <MilestoneCompletionCard
          milestoneNumber={3}
          title="Optimize Your Taxes"
          completionCriteria={[
            {
              label: "Income entered",
              checked: yearlyIncome > 0 || otherIncome > 0 || capitalGains > 0,
              description: "Enter your salary, other income, and capital gains"
            },
            {
              label: "Deductions considered",
              checked: totalDeductions > 0 || hraExemption > 0,
              description: "Add your tax-saving investments and deductions (80C, HRA, etc.)"
            },
            {
              label: "Tax calculated",
              checked: taxUnderOldRegime > 0 || taxUnderNewRegime > 0,
              description: "Calculate tax liability under both old and new regimes"
            },
            {
              label: "Best regime identified",
              checked: moreBeneficialRegime !== '',
              description: "Know which tax regime saves you more money"
            }
          ]}
          helpResources={{
            guide: "https://www.incometax.gov.in/",
            tutorial: "https://youtu.be/example-tax-tutorial"
          }}
          onComplete={() => {
            toast.success('Milestone 3 completed! Your tax planning is optimized.');
          }}
        />
      </div>


      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200 py-4 px-6">
        <div className="container mx-auto max-w-6xl text-center text-gray-500 text-sm">
          <p>Disclaimer: This tax calculator is designed for estimation purposes only and should not be considered as tax advice. Please consult with a qualified tax professional for personalized guidance.</p>
          <p className="mt-2">© {new Date().getFullYear()} FIREMap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
