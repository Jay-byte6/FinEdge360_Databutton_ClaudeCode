/**
 * PDF Export Utility for FIREMap
 * Generates comprehensive financial profile PDF for users
 */

import jsPDF from 'jspdf';
import { getFinancialMetrics, calculateNetWorth, calculateCoastFIRE, calculateConservativeFIRE, calculatePremiumNewFIRE } from './financialCalculations';

// Format currency in Indian Rupee format
const formatCurrency = (amount: number): string => {
  const formatted = amount.toLocaleString('en-IN');
  return `Rs.${formatted}`;
};

// Format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Draw a horizontal bar chart
const drawBarChart = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  color: [number, number, number],
  label: string
) => {
  // Background
  doc.setFillColor(240, 240, 240);
  doc.rect(x, y, width, height, 'F');

  // Filled portion
  doc.setFillColor(...color);
  const filledWidth = (percentage / 100) * width;
  doc.rect(x, y, filledWidth, height, 'F');

  // Border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(x, y, width, height, 'S');

  // Label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`${label}: ${formatPercentage(percentage)}`, x + width + 3, y + (height / 2) + 2);
};

/**
 * Generate comprehensive financial profile PDF
 */
export const generateFinancialProfilePDF = async (
  financialData: any,
  riskAnalysis: any,
  user: any,
  assetAllocations?: any
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = 20;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const addSectionHeader = (title: string, color: [number, number, number] = [37, 99, 235]) => {
    checkPageBreak(15);
    yPosition += 2;

    doc.setFillColor(...color);
    doc.rect(margin, yPosition, contentWidth, 9, 'F');

    yPosition += 6.5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, yPosition);

    yPosition += 5;
    yPosition += 3; // Add small gap after section header
    doc.setTextColor(0, 0, 0);
  };

  const addLine = (text: string, indent: number = 0, fontSize: number = 10, bold: boolean = false) => {
    checkPageBreak(6);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(50, 50, 50);
    doc.text(text, margin + indent, yPosition);
    yPosition += fontSize * 0.4 + 2.5;
  };

  // ============= COVER PAGE =============
  // White background for logo visibility
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Brand Logo (Load image)
  const loadLogo = async () => {
    try {
      const img = new Image();
      img.src = '/TheFireMap_Logo.png';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      // Add logo centered at top (larger size)
      const logoWidth = 100;
      const logoHeight = 100;
      doc.addImage(img, 'PNG', (pageWidth - logoWidth) / 2, 5, logoWidth, logoHeight);
    } catch (error) {
      // Fallback: Simple circle with F if logo fails to load
      doc.setFillColor(37, 99, 235);
      doc.circle(pageWidth / 2, 15, 6, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('F', pageWidth / 2, 18, { align: 'center' });
    }
  };

  await loadLogo();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('FIREMap', pageWidth / 2, 38, { align: 'center' });

  // Blue section for subtitle
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 42, pageWidth, 12, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Comprehensive Financial Profile Report', pageWidth / 2, 50, { align: 'center' });

  yPosition = 62;

  const userName = financialData?.personalInfo?.name || user?.email?.split('@')[0] || 'Jay';
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(`Prepared for: ${userName}`, margin, yPosition);

  yPosition += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const date = new Date();
  doc.text(`Report Date: ${date.getDate()} ${date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`, margin, yPosition);
  doc.text(`Email: ${user?.email || 'jsjaiho5@gmail.com'}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 8;

  // ============= EXECUTIVE SUMMARY =============
  addSectionHeader('EXECUTIVE SUMMARY', [34, 139, 34]);

  const monthlyIncome = financialData?.personalInfo?.monthlySalary || 0;
  const monthlyExpenses = financialData?.personalInfo?.monthlyExpenses || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Use centralized calculations for consistency
  const metrics = getFinancialMetrics(financialData);
  const { netWorth, basicFIRENumber: fireNumber, newFIRENumber, yearsToRetirement } = metrics;

  const illiquid = financialData?.assets?.illiquid || {};
  let totalIlliquid = Object.values(illiquid).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

  const liquid = financialData?.assets?.liquid || {};
  let totalLiquid = Object.values(liquid).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

  const totalAssets = totalIlliquid + totalLiquid;

  const liabilities = financialData?.liabilities || {};
  let totalLiabilities = Object.values(liabilities).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

  const annualExpenses = monthlyExpenses * 12;
  const inflationRate = 6;

  const fireProgress = fireNumber > 0 ? (netWorth / fireNumber * 100) : 0;
  const newFireProgress = newFIRENumber > 0 ? (netWorth / newFIRENumber * 100) : 0;

  // Summary Box
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 248, 248);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, contentWidth, 45, 'FD');

  yPosition += 8;
  const colWidth = contentWidth / 2;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);

  // Left column
  doc.text('Age:', margin + 5, yPosition);
  doc.text(`${financialData?.personalInfo?.age || 40} years`, margin + 50, yPosition);

  doc.text('Net Worth:', margin + colWidth + 5, yPosition);
  doc.text(formatCurrency(netWorth), margin + colWidth + 65, yPosition);

  yPosition += 7;
  doc.text('Monthly Income:', margin + 5, yPosition);
  doc.text(formatCurrency(monthlyIncome), margin + 50, yPosition);

  doc.text('Total Assets:', margin + colWidth + 5, yPosition);
  doc.text(formatCurrency(totalAssets), margin + colWidth + 65, yPosition);

  yPosition += 7;
  doc.text('Monthly Expenses:', margin + 5, yPosition);
  doc.text(formatCurrency(monthlyExpenses), margin + 50, yPosition);

  doc.text('Total Liabilities:', margin + colWidth + 5, yPosition);
  doc.text(formatCurrency(totalLiabilities), margin + colWidth + 65, yPosition);

  yPosition += 7;
  doc.text('Monthly Savings:', margin + 5, yPosition);
  doc.setTextColor(34, 139, 34);
  doc.text(formatCurrency(monthlySavings), margin + 50, yPosition);

  doc.setTextColor(50, 50, 50);
  doc.text('Savings Rate:', margin + colWidth + 5, yPosition);
  doc.setTextColor(37, 99, 235);
  doc.text(formatPercentage(savingsRate), margin + colWidth + 65, yPosition);

  yPosition += 12;
  doc.setTextColor(50, 50, 50);

  yPosition += 3; // Add small gap after executive summary box

  // ============= TOTAL ASSET SUMMARY =============
  addSectionHeader('TOTAL ASSET SUMMARY', [220, 140, 0]);

  const totalEquity = (liquid.domestic_stock_market || 0) + (liquid.domestic_equity_mutual_funds || 0) + (liquid.us_equity || 0);
  const totalDebt = (liquid.fixed_deposit || 0) + (liquid.debt_funds || 0) + (illiquid.epf_ppf_vpf || 0);
  const totalGold = (liquid.gold_etf_digital_gold || 0) + (illiquid.jewellery || 0) + (illiquid.sgb || 0);
  const totalRealEstate = (illiquid.home || 0) + (illiquid.other_real_estate || 0);
  const totalAlternatives = (liquid.crypto || 0) + (liquid.reits || 0) + (illiquid.ulips || 0);
  const totalCash = liquid.liquid_savings_cash || 0;

  const assetTotal = totalEquity + totalDebt + totalGold + totalRealEstate + totalAlternatives + totalCash;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  addLine(`Total Portfolio Value: ${formatCurrency(assetTotal)}`, 0, 10, true);
  yPosition += 3;

  doc.setFontSize(9);
  addLine('Asset Class Allocation:', 0, 9, false);
  yPosition += 5;

  const barWidth = contentWidth - 80;
  const barHeight = 8;

  if (assetTotal > 0) {
    const equityPct = (totalEquity / assetTotal) * 100;
    const debtPct = (totalDebt / assetTotal) * 100;
    const goldPct = (totalGold / assetTotal) * 100;
    const realEstatePct = (totalRealEstate / assetTotal) * 100;
    const alternativesPct = (totalAlternatives / assetTotal) * 100;
    const cashPct = (totalCash / assetTotal) * 100;

    if (equityPct > 0) {
      drawBarChart(doc, margin, yPosition, barWidth, barHeight, equityPct, [34, 139, 34], 'Equity');
      yPosition += 12;
    }
    if (debtPct > 0) {
      drawBarChart(doc, margin, yPosition, barWidth, barHeight, debtPct, [65, 105, 225], 'Debt/Fixed Income');
      yPosition += 12;
    }
    if (goldPct > 0) {
      drawBarChart(doc, margin, yPosition, barWidth, barHeight, goldPct, [255, 215, 0], 'Gold');
      yPosition += 12;
    }
    if (realEstatePct > 0) {
      drawBarChart(doc, margin, yPosition, barWidth, barHeight, realEstatePct, [139, 69, 19], 'Real Estate');
      yPosition += 12;
    }
    if (alternativesPct > 0) {
      drawBarChart(doc, margin, yPosition, barWidth, barHeight, alternativesPct, [147, 51, 234], 'Alternatives');
      yPosition += 12;
    }
    if (cashPct > 0) {
      drawBarChart(doc, margin, yPosition, barWidth, barHeight, cashPct, [128, 128, 128], 'Cash/Savings');
      yPosition += 12;
    }
  }

  yPosition += 5;

  // Detailed Breakdown
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addLine('Detailed Asset Breakdown:', 0, 9, true);
  yPosition += 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (totalEquity > 0) {
    addLine(`Equity: ${formatCurrency(totalEquity)}`, 0, 9, false);
    if (liquid.domestic_stock_market > 0) addLine(`Domestic Stocks: ${formatCurrency(liquid.domestic_stock_market)}`, 3, 9);
    if (liquid.domestic_equity_mutual_funds > 0) addLine(`Equity Mutual Funds: ${formatCurrency(liquid.domestic_equity_mutual_funds)}`, 3, 9);
    yPosition += 2;
  }

  if (totalDebt > 0) {
    addLine(`Debt/Fixed Income: ${formatCurrency(totalDebt)}`, 0, 9, false);
    if (illiquid.epf_ppf_vpf > 0) addLine(`EPF/PPF/VPF: ${formatCurrency(illiquid.epf_ppf_vpf)}`, 3, 9);
    yPosition += 2;
  }

  if (totalGold > 0) {
    addLine(`Gold: ${formatCurrency(totalGold)}`, 0, 9, false);
    if (illiquid.jewellery > 0) addLine(`Physical Gold/Jewellery: ${formatCurrency(illiquid.jewellery)}`, 3, 9);
    yPosition += 2;
  }

  if (totalRealEstate > 0) {
    addLine(`Real Estate: ${formatCurrency(totalRealEstate)}`, 0, 9, false);
    if (illiquid.home > 0) addLine(`Primary Residence: ${formatCurrency(illiquid.home)}`, 3, 9);
    if (illiquid.other_real_estate > 0) addLine(`Other Properties: ${formatCurrency(illiquid.other_real_estate)}`, 3, 9);
    yPosition += 2;
  }

  if (totalAlternatives > 0) {
    addLine(`Alternatives: ${formatCurrency(totalAlternatives)}`, 0, 9, false);
    if (illiquid.ulips > 0) addLine(`ULIPs: ${formatCurrency(illiquid.ulips)}`, 3, 9);
    yPosition += 2;
  }

  if (totalCash > 0) {
    addLine(`Cash & Savings: ${formatCurrency(totalCash)}`, 0, 9, false);
    yPosition += 2;
  }

  // ============= LIABILITIES =============
  checkPageBreak(50);
  addSectionHeader('LIABILITIES', [37, 99, 235]);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (liabilities.home_loan) addLine(`Home Loan: ${formatCurrency(liabilities.home_loan)}`, 0, 9);
  if (liabilities.education_loan) addLine(`Education Loan: ${formatCurrency(liabilities.education_loan)}`, 0, 9);
  if (liabilities.car_loan) addLine(`Car Loan: ${formatCurrency(liabilities.car_loan)}`, 0, 9);
  if (liabilities.personal_gold_loan) addLine(`Personal/Gold Loan: ${formatCurrency(liabilities.personal_gold_loan)}`, 0, 9);
  if (liabilities.credit_card) addLine(`Credit Card: ${formatCurrency(liabilities.credit_card)}`, 0, 9);
  if (liabilities.other_liabilities) addLine(`Other Liabilities: ${formatCurrency(liabilities.other_liabilities)}`, 0, 9);

  yPosition += 3;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  addLine(`TOTAL LIABILITIES: ${formatCurrency(totalLiabilities)}`, 0, 10, true);

  // ============= TAX CALCULATION =============
  checkPageBreak(85);
  yPosition += 5;
  addSectionHeader('TAX CALCULATION SUMMARY', [128, 0, 128]);

  // Add financial year info
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Financial Year: 2025-26 (AY 2026-27) | As per Union Budget 2025 | Effective from: April 1, 2025', margin, yPosition);
  yPosition += 5;
  doc.setTextColor(50, 50, 50);

  const annualIncome = monthlyIncome * 12;

  const estimated80C = Math.min((illiquid.epf_ppf_vpf || 0) * 0.1 + 50000, 150000);
  const estimated80D = 25000;
  const estimatedNPS = 0;

  const calculateOldRegimeTax = (income: number) => {
    const standardDeduction = 50000;
    let taxableIncome = income - standardDeduction - estimated80C - estimated80D - estimatedNPS;
    taxableIncome = Math.max(0, taxableIncome);

    let tax = 0;
    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
    else tax = 12500 + 100000 + (taxableIncome - 1000000) * 0.30;

    tax = tax * 1.04;
    return { taxableIncome, tax: Math.round(tax), effectiveRate: income > 0 ? (tax / income * 100) : 0 };
  };

  const calculateNewRegimeTax = (income: number) => {
    const standardDeduction = 75000;
    let taxableIncome = income - standardDeduction;
    taxableIncome = Math.max(0, taxableIncome);

    let tax = 0;
    // New Tax Regime slabs as per Union Budget 2025 (FY 2025-26, AY 2026-27, effective from April 1, 2025)
    // ₹0 - ₹4,00,000: Nil (0%)
    // ₹4,00,001 - ₹8,00,000: 5%
    // ₹8,00,001 - ₹12,00,000: 10%
    // ₹12,00,001 - ₹16,00,000: 15%
    // ₹16,00,001 - ₹20,00,000: 20%
    // ₹20,00,001 - ₹24,00,000: 25%
    // Above ₹24,00,000: 30%
    if (taxableIncome <= 400000) tax = 0;
    else if (taxableIncome <= 800000) tax = (taxableIncome - 400000) * 0.05;
    else if (taxableIncome <= 1200000) tax = 20000 + (taxableIncome - 800000) * 0.10;
    else if (taxableIncome <= 1600000) tax = 60000 + (taxableIncome - 1200000) * 0.15;
    else if (taxableIncome <= 2000000) tax = 120000 + (taxableIncome - 1600000) * 0.20;
    else if (taxableIncome <= 2400000) tax = 200000 + (taxableIncome - 2000000) * 0.25;
    else tax = 300000 + (taxableIncome - 2400000) * 0.30;

    tax = tax * 1.04; // Add 4% cess
    return { taxableIncome, tax: Math.round(tax), effectiveRate: income > 0 ? (tax / income * 100) : 0 };
  };

  const oldTax = calculateOldRegimeTax(annualIncome);
  const newTax = calculateNewRegimeTax(annualIncome);

  addLine(`Annual Income: ${formatCurrency(annualIncome)}`, 0, 10, true);
  yPosition += 5;

  // Side-by-side boxes
  const boxWidth = (contentWidth - 6) / 2;
  const boxStartY = yPosition;

  // Old Regime
  doc.setFillColor(250, 240, 255);
  doc.setDrawColor(128, 0, 128);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, boxWidth, 55, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(128, 0, 128);
  doc.text('Old Tax Regime', margin + 5, yPosition);

  yPosition += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Gross Income: ${formatCurrency(annualIncome)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Standard Deduction: ${formatCurrency(50000)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`80C Deductions: ${formatCurrency(estimated80C)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`80D Deductions: ${formatCurrency(estimated80D)}`, margin + 5, yPosition);

  yPosition += 6;
  doc.text(`Taxable Income: ${formatCurrency(oldTax.taxableIncome)}`, margin + 5, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 20, 60);
  doc.text(`Tax Payable: ${formatCurrency(oldTax.tax)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Effective Rate: ${oldTax.effectiveRate.toFixed(2)}%`, margin + 5, yPosition);

  // New Regime
  yPosition = boxStartY;
  doc.setFillColor(240, 255, 240);
  doc.setDrawColor(0, 128, 0);
  doc.rect(margin + boxWidth + 6, yPosition, boxWidth, 55, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 128, 0);
  doc.text('New Tax Regime', margin + boxWidth + 11, yPosition);

  yPosition += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Gross Income: ${formatCurrency(annualIncome)}`, margin + boxWidth + 11, yPosition);

  yPosition += 5;
  doc.text(`Standard Deduction: ${formatCurrency(75000)}`, margin + boxWidth + 11, yPosition);

  yPosition += 5;
  doc.text(`No Other Deductions`, margin + boxWidth + 11, yPosition);

  yPosition += 11;
  doc.text(`Taxable Income: ${formatCurrency(newTax.taxableIncome)}`, margin + boxWidth + 11, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 20, 60);
  doc.text(`Tax Payable: ${formatCurrency(newTax.tax)}`, margin + boxWidth + 11, yPosition);

  yPosition += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Effective Rate: ${newTax.effectiveRate.toFixed(2)}%`, margin + boxWidth + 11, yPosition);

  yPosition = boxStartY + 60;

  const taxSavings = Math.abs(oldTax.tax - newTax.tax);
  const betterRegime = oldTax.tax < newTax.tax ? 'Old Regime' : 'New Regime';

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 139, 34);
  addLine(`Recommendation: Choose ${betterRegime} to save ${formatCurrency(taxSavings)}`, 0, 9, true);
  doc.setTextColor(50, 50, 50);
  yPosition += 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  addLine(betterRegime === 'New Regime' ? 'New regime is beneficial as you have limited tax-saving investments.' : 'Old regime is beneficial due to your tax-saving investments.', 0, 8);
  yPosition += 5;

  // Current Tax Investments
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  addLine('Current Tax-Saving Investments:', 0, 9, true);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (illiquid.epf_ppf_vpf > 0) addLine(`EPF/PPF/VPF: ${formatCurrency(illiquid.epf_ppf_vpf)} (qualifies for 80C)`, 3, 8);
  addLine(`Health Insurance: ${formatCurrency(estimated80D)} (estimated, 80D)`, 3, 8);
  addLine(`Life Insurance: Not tracked (add to 80C if paying)`, 3, 8);
  addLine(`ELSS Mutual Funds: Not tracked (add to 80C if investing)`, 3, 8);
  addLine(`NPS: ${formatCurrency(estimatedNPS)} (80CCD(1B) - additional 50K deduction)`, 3, 8);
  yPosition += 3;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  addLine('Note: Tax calculations are estimates. Consult a CA for accurate filing.', 0, 7);

  // ============= 3 FIRE SCENARIOS =============
  checkPageBreak(120);
  yPosition += 5;
  addSectionHeader('YOUR 3 FIRE SCENARIOS 🔥', [37, 99, 235]);

  // Calculate all 3 FIRE scenarios
  const retirementAge = 60;
  const coastFIRE = calculateCoastFIRE(financialData, retirementAge);
  const conservativeFIRE = calculateConservativeFIRE(financialData, retirementAge);

  // For Premium NEW FIRE - use actual values from goals if available
  const expectedCAGR = 0.10; // 10% from 60:40 equity:debt allocation
  const retirementGoalData = financialData?.goals?.longTermGoals?.find((g: any) =>
    g.name?.toLowerCase().includes('retirement') || g.name?.toLowerCase().includes('fire')
  );
  const retirementSIP = retirementGoalData?.monthlyInvestment || 45000;
  const stepUpPercentage = 10; // 10% annual step-up
  const premiumFIRE = calculatePremiumNewFIRE(financialData, retirementAge, expectedCAGR, retirementSIP, stepUpPercentage);

  // Scenario explanation
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  addLine('Explore 3 different paths to achieve Financial Independence and Retire Early:', 0, 9);
  yPosition += 5;

  // ============= SCENARIO 1: COAST FIRE (RETIRE NOW) =============
  doc.setFillColor(255, 237, 213);
  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, contentWidth, 50, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 100, 0);
  doc.text('🏖️ SCENARIO #1: Coast FIRE - Retire NOW', margin + 3, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Target Corpus Needed: ${formatCurrency(coastFIRE.targetCorpus)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Your Liquid Net Worth: ${formatCurrency(coastFIRE.currentNetWorth)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Gap to Cover: ${formatCurrency(coastFIRE.gap)}`, margin + 5, yPosition);

  yPosition += 5;
  if (coastFIRE.yearsToAchieve > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text(`Years to Achieve: ${coastFIRE.yearsToAchieve} years (Age ${coastFIRE.ageAtCoastFIRE})`, margin + 5, yPosition);
  } else {
    doc.setTextColor(34, 139, 34);
    doc.text('✓ You can Coast FIRE NOW!', margin + 5, yPosition);
  }

  yPosition += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 60, 0);
  const coastExplanation = doc.splitTextToSize(
    'Coast FIRE: Stop working NOW. Your liquid corpus grows at 5% conservative returns until age 60, covering all expenses till retirement. No more savings needed - just let your investments coast!',
    contentWidth - 10
  );
  coastExplanation.forEach((line: string) => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 3.5;
  });

  yPosition += 8;

  // ============= SCENARIO 2: CONSERVATIVE FIRE AT 60 =============
  checkPageBreak(55);
  doc.setFillColor(219, 234, 254);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, contentWidth, 50, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('💼 SCENARIO #2: Conservative FIRE at Retirement Age (60)', margin + 3, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Target FIRE Corpus: ${formatCurrency(conservativeFIRE.targetCorpus)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Current Net Worth: ${formatCurrency(conservativeFIRE.currentNetWorth)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Projected at Age 60: ${formatCurrency(conservativeFIRE.projectedCorpusAtRetirement)}`, margin + 5, yPosition);

  yPosition += 5;
  if (conservativeFIRE.canAchieve) {
    doc.setTextColor(34, 139, 34);
    doc.text(`✓ You WILL achieve FIRE by age 60!`, margin + 5, yPosition);
  } else {
    doc.setTextColor(220, 38, 38);
    doc.text(`Shortfall: ${formatCurrency(conservativeFIRE.shortfall)}`, margin + 5, yPosition);
  }

  yPosition += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 60, 120);
  const conservativeExplanation = doc.splitTextToSize(
    'Conservative approach: Save your full monthly surplus (₹' + (conservativeFIRE.monthlySavings || 0).toLocaleString('en-IN') + '/month) with 5% conservative returns (FD/Debt funds). Traditional safe path to FIRE at retirement age.',
    contentWidth - 10
  );
  conservativeExplanation.forEach((line: string) => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 3.5;
  });

  yPosition += 8;

  // ============= SCENARIO 3: PREMIUM NEW FIRE (OPTIMIZED) =============
  checkPageBreak(60);
  doc.setFillColor(220, 252, 231);
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, contentWidth, 55, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('🚀 SCENARIO #3: Premium NEW FIRE (Optimized Strategy)', margin + 3, yPosition);

  // PREMIUM badge
  doc.setFillColor(255, 215, 0);
  doc.setDrawColor(255, 140, 0);
  doc.rect(margin + contentWidth - 35, yPosition - 4, 30, 6, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 69, 0);
  doc.text('⭐ PREMIUM', margin + contentWidth - 33, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Target FIRE Corpus: ${formatCurrency(premiumFIRE.targetCorpus)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Current Net Worth: ${formatCurrency(premiumFIRE.currentNetWorth)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Expected CAGR: ${formatPercentage(premiumFIRE.expectedCAGR * 100)}`, margin + 5, yPosition);

  yPosition += 5;
  doc.text(`Monthly SIP: ${formatCurrency(premiumFIRE.initialSIP)} (${premiumFIRE.stepUpPercentage}% step-up)`, margin + 5, yPosition);

  yPosition += 5;
  doc.setTextColor(34, 139, 34);
  doc.setFont('helvetica', 'bold');
  doc.text(`⚡ Achieve FIRE in ${premiumFIRE.yearsToAchieve} years (Age ${premiumFIRE.ageAtFIRE})`, margin + 5, yPosition);

  yPosition += 5;
  if (premiumFIRE.canAchieveBefore60) {
    doc.setTextColor(22, 163, 74);
    doc.text(`🎯 Retire ${premiumFIRE.yearsBeforeRetirement} years BEFORE age 60!`, margin + 5, yPosition);
  }

  yPosition += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(20, 100, 50);
  const premiumExplanation = doc.splitTextToSize(
    'Premium Strategy: Allocate only retirement SIP with optimized portfolio (60:40 equity:debt) achieving 10% CAGR. Step-up SIP by 10% annually. Achieve FIRE YEARS earlier than conservative approach - TIME is your real wealth!',
    contentWidth - 10
  );
  premiumExplanation.forEach((line: string) => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 3.5;
  });

  yPosition += 8;

  // Summary comparison
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  addLine('Which FIRE Path Should You Choose?', 0, 9, true);
  yPosition += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  addLine('• Coast FIRE: If you have enough liquid assets and want to retire NOW', 3, 8);
  addLine('• Conservative FIRE: If you prefer safe, predictable returns and traditional retirement age', 3, 8);
  addLine('• Premium NEW FIRE: If you want to retire EARLY with optimized portfolio strategy', 3, 8);
  yPosition += 5;

  // ============= RISK ASSESSMENT & PORTFOLIO =============
  if (riskAnalysis) {
    checkPageBreak(80);
    yPosition += 5;
    addSectionHeader('RISK ASSESSMENT & PORTFOLIO RECOMMENDATION', [37, 99, 235]);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    addLine(`Risk Score: ${riskAnalysis.riskScore}/50`, 0, 10, true);
    addLine(`Risk Profile: ${riskAnalysis.riskType}`, 0, 10, true);
    yPosition += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    addLine('Summary:', 0, 9, false);
    const summaryLines = doc.splitTextToSize(riskAnalysis.summary, contentWidth - 5);
    summaryLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, yPosition);
      yPosition += 4.5;
    });

    yPosition += 5;

    // Current Portfolio Allocation
    if (riskAnalysis.currentPortfolio) {
      checkPageBreak(50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      addLine('Current Portfolio Allocation:', 0, 9, true);
      yPosition += 3;

      const barW = contentWidth - 80;
      const barH = 8;

      Object.entries(riskAnalysis.currentPortfolio).forEach(([key, value]: [string, any]) => {
        if (value > 0) {
          checkPageBreak(12);
          const colors: { [key: string]: [number, number, number] } = {
            'Equity': [128, 128, 128],
            'Debt': [65, 105, 225],
            'Gold': [255, 215, 0],
            'REITs': [147, 51, 234],
            'Cash': [34, 139, 34]
          };
          drawBarChart(doc, margin, yPosition, barW, barH, value, colors[key] || [128, 128, 128], key);
          yPosition += 10;
        }
      });

      yPosition += 5;
    }

    // Recommended Portfolio Allocation
    if (riskAnalysis.idealPortfolio) {
      checkPageBreak(50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      addLine('Recommended Portfolio Allocation:', 0, 9, true);
      yPosition += 3;

      const barW = contentWidth - 80;
      const barH = 8;

      Object.entries(riskAnalysis.idealPortfolio).forEach(([key, value]: [string, any]) => {
        if (value > 0) {
          checkPageBreak(12);
          const colors: { [key: string]: [number, number, number] } = {
            'Equity': [128, 128, 128],
            'Debt': [65, 105, 225],
            'Gold': [255, 215, 0],
            'REITs': [147, 51, 234],
            'Cash': [34, 139, 34]
          };
          drawBarChart(doc, margin, yPosition, barW, barH, value, colors[key] || [128, 128, 128], key);
          yPosition += 10;
        }
      });

      yPosition += 5;
    }

    // Educational Insights
    if (riskAnalysis.educationalInsights && riskAnalysis.educationalInsights.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      addLine('Educational Insights:', 0, 9, true);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      riskAnalysis.educationalInsights.forEach((insight: string, index: number) => {
        checkPageBreak(8);
        const insightLines = doc.splitTextToSize(`${index + 1}. ${insight}`, contentWidth - 5);
        insightLines.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += 4;
        });
        yPosition += 1;
      });
    }
  }

  // ============= FINANCIAL GOALS =============
  if (financialData?.goals && (
    financialData.goals.shortTermGoals?.length > 0 ||
    financialData.goals.midTermGoals?.length > 0 ||
    financialData.goals.longTermGoals?.length > 0
  )) {
    checkPageBreak(40);
    yPosition += 5;
    addSectionHeader('FINANCIAL GOALS', [37, 99, 235]);

    const renderGoals = (goals: any[], category: string) => {
      if (goals && goals.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        addLine(`${category}:`, 0, 9, true);

        goals.forEach((goal: any) => {
          checkPageBreak(8);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          addLine(`• ${goal.name}: ${formatCurrency(goal.amount)} in ${goal.years} year(s)`, 3, 8);
        });

        yPosition += 2;
      }
    };

    renderGoals(financialData.goals.shortTermGoals, 'Short-Term Goals (0-3 years)');
    renderGoals(financialData.goals.midTermGoals, 'Mid-Term Goals (3-7 years)');
    renderGoals(financialData.goals.longTermGoals, 'Long-Term Goals (7+ years)');
  }

  // ============= ASSET ALLOCATION STRATEGY =============
  if (assetAllocations && assetAllocations.allocations && assetAllocations.allocations.length > 0) {
    checkPageBreak(80);
    yPosition += 5;
    addSectionHeader('ASSET ALLOCATION STRATEGY', [128, 0, 128]);

    addLine('Your customized asset allocation for different goal types:', 0, 9);
    yPosition += 3;

    assetAllocations.allocations.forEach((allocation: any) => {
      checkPageBreak(35);

      // Goal type header
      addLine(`${allocation.goal_type}:`, 0, 10, true);
      yPosition += 2;

      // Draw allocation bars
      if (allocation.equity_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.equity_pct, [37, 99, 235], 'Indian Equity');
        yPosition += 6;
      }
      if (allocation.us_equity_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.us_equity_pct, [59, 130, 246], 'US Equity');
        yPosition += 6;
      }
      if (allocation.debt_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.debt_pct, [34, 197, 94], 'Debt');
        yPosition += 6;
      }
      if (allocation.gold_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.gold_pct, [251, 191, 36], 'Gold');
        yPosition += 6;
      }
      if (allocation.reits_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.reits_pct, [168, 85, 247], 'REITs');
        yPosition += 6;
      }
      if (allocation.crypto_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.crypto_pct, [239, 68, 68], 'Crypto');
        yPosition += 6;
      }
      if (allocation.cash_pct > 0) {
        drawBarChart(doc, margin + 5, yPosition, 80, 4, allocation.cash_pct, [107, 114, 128], 'Cash');
        yPosition += 6;
      }

      // Expected returns
      if (allocation.expected_cagr_min && allocation.expected_cagr_max) {
        yPosition += 2;
        addLine(`Expected Returns: ${allocation.expected_cagr_min}% - ${allocation.expected_cagr_max}% CAGR`, 5, 9);
      }

      yPosition += 5;
    });
  }

  // ============= SMART SAVING TIPS =============
  checkPageBreak(60);
  yPosition += 5;
  addSectionHeader('SMART SAVING TIPS & INSIGHTS', [34, 139, 34]);

  const savingTips = [
    { title: 'Emergency Fund', tip: `Maintain 6-12 months of expenses in liquid savings. Your target: ${formatCurrency(monthlyExpenses * 6)} to ${formatCurrency(monthlyExpenses * 12)}` },
    { title: 'Automate Savings', tip: 'Set up automatic transfers on salary day. "Pay yourself first" - save before spending. Aim for 30% minimum savings rate.' },
    { title: 'Reduce EMIs', tip: `Total EMI should not exceed 40% of income. Your current: ${formatPercentage((totalLiabilities / annualIncome) * 100)}. Prepay high-interest loans first.` },
    { title: '50-30-20 Rule', tip: '50% needs, 30% wants, 20% savings. Track expenses monthly. Use UPI apps for digital tracking.' },
    { title: 'Inflation Protection', tip: 'Inflation in India: 5-6% annually. Your investments must beat this. Equity provides best long-term inflation hedge.' },
    { title: 'Diversification', tip: 'Never put all eggs in one basket. Ideal: 60% Equity, 20% Debt, 10% Gold, 10% Alternatives. Rebalance annually.' },
    { title: 'Start SIP Early', tip: 'Rs.10,000 monthly SIP for 20 years at 12% return = Rs.1 Crore. Start today, not tomorrow.' },
    { title: 'Insurance First', tip: 'Term insurance: 10-15x annual income. Health insurance: Rs.5-10L minimum. Separate insurance from investment.' },
    { title: 'Credit Card Smart Usage', tip: 'Pay full balance every month. Never pay minimum due. Use for cashback/rewards, not for loans. Keep utilization under 30%.' },
    { title: 'Avoid Lifestyle Inflation', tip: 'Every salary hike: save 50%, enjoy 50%. Avoid upgrading lifestyle with every increment.' },
    { title: 'Track Net Worth', tip: 'Review quarterly. Focus on net worth growth, not just income. Assets - Liabilities = Net Worth.' },
    { title: 'Learn Continuously', tip: 'Financial literacy is wealth. Read: "The Psychology of Money", "Rich Dad Poor Dad". Follow: Zerodha Varsity, Finology.' }
  ];

  savingTips.forEach((tip) => {
    checkPageBreak(12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    addLine(tip.title, 0, 9, true);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    const tipLines = doc.splitTextToSize(tip.tip, contentWidth - 5);
    tipLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 3, yPosition);
      yPosition += 3.5;
    });
    yPosition += 2;
  });

  // ============= FOOTER ON ALL PAGES (DISCLAIMER + CONTACT) =============
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);

    // Contact Information (above disclaimer)
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235);

    const supportEmail = 'support@finedge360.com';
    const feedbackLink = 'Share Feedback: https://forms.gle/your-feedback-form';
    const appLink = 'Mobile App: Coming Soon';

    const contactY = pageHeight - 24;
    const col1X = margin;
    const col2X = margin + (contentWidth / 3);
    const col3X = margin + (2 * contentWidth / 3);

    doc.text('📧 Support:', col1X, contactY);
    doc.text(supportEmail, col1X, contactY + 3);

    doc.text('💬 Feedback:', col2X, contactY);
    doc.text('https://forms.gle/feedback', col2X, contactY + 3);

    doc.text('📱 Mobile App:', col3X, contactY);
    doc.text('Coming Soon', col3X, contactY + 3);

    // Disclaimer text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('This report is for informational and educational purposes only. NOT FINANCIAL ADVICE.', pageWidth / 2, pageHeight - 16, { align: 'center' });
    doc.text('Consult a certified financial planner before making investment decisions.', pageWidth / 2, pageHeight - 12, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Generated by FIREMap | SEBI Compliant Educational Platform', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Save with user name
  const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`FIREMap_Report_${sanitizedName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
