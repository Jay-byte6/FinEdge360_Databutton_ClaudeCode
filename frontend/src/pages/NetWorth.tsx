import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useFinancialDataStore from '../utils/financialDataStore';
import useAuthStore from '../utils/authStore';
import { FinancialData } from 'types'; // Added import for FinancialData
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components
import { MilestoneCompletionCard } from '@/components/journey/MilestoneCompletionCard';

// Define color constants
const COLORS = {
  ASSETS: ['#4ade80', '#86efac', '#a7f3d0', '#6ee7b7'],  // Green variants
  LIABILITIES: ['#f87171', '#fca5a5', '#fecaca'],         // Red variants
};

type AssetLiabilityItem = {
  name: string;
  value: number;
  category: 'asset' | 'liability';
};

export default function NetWorth() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<AssetLiabilityItem[]>([]);
  const [netWorth, setNetWorth] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = useState<number>(0);
  const [calculationError, setCalculationError] = useState('');
  const [totalAssetSummary, setTotalAssetSummary] = useState<Array<{ name: string; value: number; contribution: string }>>([]);
  const [investableAssetAllocation, setInvestableAssetAllocation] = useState<Array<{ name: string; value: number; contribution: string }>>([]);
  const [investableChartData, setInvestableChartData] = useState<Array<{ name: string; value: number }>>([]);
  
  // Use the store for financial data
  const { financialData, isLoading, error: storeError, fetchFinancialData } = useFinancialDataStore();
  const { user } = useAuthStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers to show in lakhs/crores
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 crore = 10,000,000
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 lakh = 100,000
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toFixed(2)}`;
    }
  };

  // Calculate net worth from financial data
  const calculateNetWorth = (data: FinancialData | null) => {
    if (!data || !data.assets || !data.liabilities) {
      setTotalAssets(0);
      setTotalLiabilities(0);
      setNetWorth(0);
      setChartData([]);
      return;
    }

    const { assets, liabilities: liabilitiesData } = data; // liabilitiesData to avoid conflict with keyword

    let assetTotal = 0;
    const individualAssetItems: AssetLiabilityItem[] = [];

    // Process Illiquid Assets
    if (assets.illiquid) {
      for (const [key, value] of Object.entries(assets.illiquid)) {
        if (typeof value === 'number' && value > 0) {
          assetTotal += value;
          individualAssetItems.push({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value,
            category: 'asset',
          });
        }
      }
    }

    // Process Liquid Assets
    if (assets.liquid) {
      for (const [key, value] of Object.entries(assets.liquid)) {
        if (typeof value === 'number' && value > 0) {
          assetTotal += value;
          individualAssetItems.push({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value,
            category: 'asset',
          });
        }
      }
    }

    let liabilityTotal = 0;
    const individualLiabilityItems: AssetLiabilityItem[] = [];
    // Process Liabilities
    if (liabilitiesData) {
      for (const [key, value] of Object.entries(liabilitiesData)) {
        if (typeof value === 'number' && value > 0) {
          liabilityTotal += value;
          individualLiabilityItems.push({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value,
            category: 'liability',
          });
        }
      }
    }
    
    const calculatedNetWorth = assetTotal - liabilityTotal;
    setTotalAssets(assetTotal);
    setTotalLiabilities(liabilityTotal);
    setNetWorth(calculatedNetWorth);

    // Consolidate small slices for the main chart
    const thresholdPercent = 2; // Group items less than 2% into 'Other'
    const consolidatedChartItems: AssetLiabilityItem[] = [];
    let otherAssetsValue = 0;
    individualAssetItems.forEach(item => {
      if (assetTotal > 0 && (item.value / assetTotal) * 100 < thresholdPercent) {
        otherAssetsValue += item.value;
      } else {
        consolidatedChartItems.push(item);
      }
    });
    if (otherAssetsValue > 0) {
      consolidatedChartItems.push({ name: 'Other Assets', value: otherAssetsValue, category: 'asset' });
    }

    let otherLiabilitiesValue = 0;
    individualLiabilityItems.forEach(item => {
      if (liabilityTotal > 0 && (item.value / liabilityTotal) * 100 < thresholdPercent) {
        otherLiabilitiesValue += item.value;
      } else {
        consolidatedChartItems.push(item);
      }
    });
    if (otherLiabilitiesValue > 0) {
      consolidatedChartItems.push({ name: 'Other Liabilities', value: otherLiabilitiesValue, category: 'liability' });
    }
    setChartData(consolidatedChartItems.filter(item => item.value > 0)); // Ensure no zero-value items from consolidation edge cases

    // Calculate Total Asset Summary (using original assetTotal and detailed assets)
    const summaryCategories = {
      'Real Estate / REITs': (assets.illiquid?.home || 0) + (assets.illiquid?.other_real_estate || 0) + (assets.liquid?.reits || 0),
      'Domestic Equity': (assets.liquid?.domestic_stock_market || 0) + (assets.liquid?.domestic_equity_mutual_funds || 0) + (assets.illiquid?.ulips || 0),
      'US Equity': assets.liquid?.us_equity || 0,
      'Debt': (assets.liquid?.fixed_deposit || 0) + (assets.liquid?.debt_funds || 0) + (assets.illiquid?.epf_ppf_vpf || 0) + (assets.liquid?.liquid_savings_cash || 0) + (assets.liquid?.cash_from_equity_mutual_funds || 0),
      'Gold': (assets.illiquid?.jewellery || 0) + (assets.illiquid?.sgb || 0) + (assets.liquid?.gold_etf_digital_gold || 0),
      'Crypto': assets.liquid?.crypto || 0,
    };

    const summaryTableData = Object.entries(summaryCategories).map(([name, value]) => ({
      name,
      value,
      contribution: assetTotal > 0 ? ((value / assetTotal) * 100).toFixed(2) + '%' : '0.00%',
    }));
    summaryTableData.push({
      name: 'Total Assets',
      value: assetTotal,
      contribution: assetTotal > 0 ? '100.00%' : '0.00%',
    });
    setTotalAssetSummary(summaryTableData);

    // Calculate Current Investable Asset Allocation
    // Based on task & user feedback: Real Estate / Reits (only REITs), Domestic Equity, Debt, Gold (no jewellery), Crypto
    const investableCategories = {
      'Real Estate / REITs': assets.liquid?.reits || 0,
      'Domestic Equity': (assets.liquid?.domestic_stock_market || 0) + (assets.liquid?.domestic_equity_mutual_funds || 0) + (assets.illiquid?.ulips || 0),
      'Debt': (assets.liquid?.fixed_deposit || 0) + (assets.liquid?.debt_funds || 0) + (assets.illiquid?.epf_ppf_vpf || 0) + (assets.liquid?.liquid_savings_cash || 0) + (assets.liquid?.cash_from_equity_mutual_funds || 0),
      'Gold': (assets.illiquid?.sgb || 0) + (assets.liquid?.gold_etf_digital_gold || 0), // Excludes jewellery
      'Crypto': assets.liquid?.crypto || 0,
    };

    let totalInvestableAssets = 0;
    const investableChartItems: Array<{ name: string; value: number }> = [];
    for (const value of Object.values(investableCategories)) {
      totalInvestableAssets += value;
    }
    
    const investableTableData = Object.entries(investableCategories).map(([name, value]) => {
      if (value > 0) {
        investableChartItems.push({ name, value });
      }
      return {
        name,
        value,
        contribution: totalInvestableAssets > 0 ? ((value / totalInvestableAssets) * 100).toFixed(2) + '%' : '0.00%',
      };
    });
    
    investableTableData.push({
      name: 'Total Investable Assets',
      value: totalInvestableAssets,
      contribution: totalInvestableAssets > 0 ? '100.00%' : '0.00%',
    });
    setInvestableAssetAllocation(investableTableData);
    setInvestableChartData(investableChartItems.filter(item => item.value > 0)); // Filter out zero values for chart

  };

  // Fetch financial data on component mount
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
        setCalculationError('');
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setCalculationError("Failed to load financial data. Have you entered your financial details?");
        toast.error("Could not load financial data");
      }
    };

    loadData();
  }, [user, fetchFinancialData, navigate]);

  // Calculate net worth when financial data changes
  useEffect(() => {
    if (financialData) {
      try {
        calculateNetWorth(financialData);
        setCalculationError('');
      } catch (error) {
        console.error("Error calculating net worth:", error);
        setCalculationError("Failed to calculate net worth. Please check your financial data.");
      }
    }
  }, [financialData]);

  // Get pie chart color based on index and category
  const getColor = (index: number, category: 'asset' | 'liability') => {
    const colorSet = category === 'asset' ? COLORS.ASSETS : COLORS.LIABILITIES;
    return colorSet[index % colorSet.length];
  };

  // Get consolidated error message
  const displayError = storeError || calculationError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-slate-200 h-24 w-24 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{displayError}</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/enter-details')}>
                Enter Financial Details
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Net Worth Tracker</h1>
          <p className="text-gray-600">Visualize your assets and liabilities to track your financial health</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Net Worth Summary Card */}
          <Card className="lg:col-span-3 bg-gradient-to-r from-blue-50 to-green-50 border-blue-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800">Your Net Worth</CardTitle>
              <CardDescription>The difference between what you own and what you owe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-4xl md:text-5xl font-bold text-center md:text-left mb-4 md:mb-0">
                  {formatIndianCurrency(netWorth)}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-center min-w-36">
                    <p className="text-green-700 text-sm font-medium">Total Assets</p>
                    <p className="text-green-800 text-xl font-bold">{formatIndianCurrency(totalAssets)}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-center min-w-36">
                    <p className="text-red-700 text-sm font-medium">Total Liabilities</p>
                    <p className="text-red-800 text-xl font-bold">{formatIndianCurrency(totalLiabilities)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Chart Card */}
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>Asset & Liability Breakdown</CardTitle>
              <CardDescription>
                Visual distribution of your assets and liabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[450px]"> {/* Increased height */}
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}> {/* Added margin */}
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={"80%"} /* Made outerRadius responsive */
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      labelLine={true} 
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
                        const RADIAN = Math.PI / 180;
                        const labelRadius = outerRadius * 1.1; // Adjusted offset for larger pie
                        const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
                        const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
                        const textAnchor = x > cx ? 'start' : 'end';

                        // Hide label for very small individual slices, but always show 'Other Assets/Liabilities'
                        if (percent < 0.02 && name !== 'Other Assets' && name !== 'Other Liabilities') return null;

                        return (
                          <text
                            x={x}
                            y={y}
                            fill={getColor(index, chartData[index]?.category || 'asset')}
                            textAnchor={textAnchor}
                            dominantBaseline="central"
                            fontSize="11px" 
                          >
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(index, entry.category)} />
                      ))}
                    </Pie>
                    {/* <Legend /> Removed Legend */}
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[450px] flex items-center justify-center text-gray-500"> {/* Matched height */}
                  <p>No asset or liability data available to display chart.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Breakdown Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
              <CardDescription>Itemized view of all assets and liabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-green-700 mb-2">Assets</h3>
                  <ul className="space-y-2">
                    {financialData && financialData.assets && financialData.assets.illiquid && Object.entries(financialData.assets.illiquid).map(([key, value]) => {
                      if (typeof value === 'number' && value > 0) {
                        return (
                          <li key={`illiquid-${key}`} className="flex justify-between">
                            <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            <span className="font-medium">{formatCurrency(value)}</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    {financialData && financialData.assets && financialData.assets.liquid && Object.entries(financialData.assets.liquid).map(([key, value]) => {
                      if (typeof value === 'number' && value > 0) {
                        return (
                          <li key={`liquid-${key}`} className="flex justify-between">
                            <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            <span className="font-medium">{formatCurrency(value)}</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    <li className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium">Total Assets</span>
                      <span className="font-bold text-green-700">{formatCurrency(totalAssets)}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-red-700 mb-2">Liabilities</h3>
                  <ul className="space-y-2">
                    {financialData && financialData.liabilities && Object.entries(financialData.liabilities).map(([key, value]) => {
                       if (typeof value === 'number' && value > 0) {
                        return (
                          <li key={`liability-${key}`} className="flex justify-between">
                            <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            <span className="font-medium">{formatCurrency(value)}</span>
                          </li>
                        );
                       }
                       return null;
                    })}
                    <li className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium">Total Liabilities</span>
                      <span className="font-bold text-red-700">{formatCurrency(totalLiabilities)}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Worth</span>
                    <span className={`font-bold ${netWorth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(netWorth)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Asset Summary Table Card */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle>Total Asset Summary</CardTitle>
            <CardDescription>Aggregated view of your asset classes and their contribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Particulars</TableHead>
                  <TableHead className="text-right">Value (INR)</TableHead>
                  <TableHead className="text-right">% Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalAssetSummary.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className={item.name === 'Total Assets' ? "font-bold" : ""}>{item.name}</TableCell>
                    <TableCell className={`text-right ${item.name === 'Total Assets' ? "font-bold" : ""}`}>{formatCurrency(item.value)}</TableCell>
                    <TableCell className={`text-right ${item.name === 'Total Assets' ? "font-bold" : ""}`}>{item.contribution}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Current Investable Asset Allocation Card */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle>Current Investable Asset Allocation</CardTitle>
            <CardDescription>Breakdown of your current investable assets.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Value (INR)</TableHead>
                    <TableHead className="text-right">% Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investableAssetAllocation.map((item) => (
                    <TableRow key={`investable-${item.name}`}>
                      <TableCell className={item.name === 'Total Investable Assets' ? "font-bold" : ""}>{item.name}</TableCell>
                      <TableCell className={`text-right ${item.name === 'Total Investable Assets' ? "font-bold" : ""}`}>{formatCurrency(item.value)}</TableCell>
                      <TableCell className={`text-right ${item.name === 'Total Investable Assets' ? "font-bold" : ""}`}>{item.contribution}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="h-80 md:h-96">
              {investableChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investableChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {investableChartData.map((entry, index) => (
                        <Cell key={`cell-investable-${index}`} fill={COLORS.ASSETS[index % COLORS.ASSETS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No investable asset data to display chart.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate('/enter-details')}>
            Update Financial Details
          </Button>
        </div>

        {/* Milestone 1 Completion Card */}
        <MilestoneCompletionCard
          milestoneNumber={1}
          title="Track Your Net Worth"
          completionCriteria={[
            {
              label: "Assets added",
              checked: totalAssets > 0,
              description: "Add your illiquid assets (home, gold, etc.) and liquid assets (FD, stocks, etc.)"
            },
            {
              label: "Liabilities recorded",
              checked: totalLiabilities >= 0, // >= 0 because zero liabilities is valid
              description: "Record any loans or debts you have (home loan, car loan, credit card, etc.)"
            },
            {
              label: "Net worth calculated",
              checked: netWorth !== 0 || (totalAssets > 0 && totalLiabilities === 0),
              description: "Your net worth is automatically calculated as Assets - Liabilities"
            }
          ]}
          helpResources={{
            guide: "https://www.investopedia.com/terms/n/networth.asp",
            tutorial: "https://youtu.be/example-networth-tutorial"
          }}
          onComplete={() => {
            toast.success('Milestone 1 completed! Moving to your Journey Map...');
          }}
        />
      </div>
    </div>
  );
}