import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { AccessCodeForm } from "components/AccessCodeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from "sonner";
import useFinancialDataStore from "utils/financialDataStore"; // Corrected to default import
import FinancialLadder from "@/components/FinancialLadder";

const PortfolioPage: React.FC = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const { riskAppetite, financialData } = useFinancialDataStore();
  const navigate = useNavigate(); // Initialize useNavigate

  const [portfolioAllocation, setPortfolioAllocation] = useState<any[]>([]);
  const ACCESS_CODE = "123456";

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  useEffect(() => {
    if (hasAccess) {
        let allocation = [];
        switch (riskAppetite) {
            case 1: // Very Conservative
            allocation = [
                { name: "Equity (India)", value: 10 },
                { name: "Equity (US)", value: 5 },
                { name: "Debt", value: 70 },
                { name: "Gold", value: 10 },
                { name: "REIT", value: 5 },
            ];
            break;
            case 2: // Conservative
            allocation = [
                { name: "Equity (India)", value: 20 },
                { name: "Equity (US)", value: 10 },
                { name: "Debt", value: 55 },
                { name: "Gold", value: 10 },
                { name: "REIT", value: 5 },
            ];
            break;
            case 3: // Moderate
            allocation = [
                { name: "Equity (India)", value: 30 },
                { name: "Equity (US)", value: 15 },
                { name: "Debt", value: 40 },
                { name: "Gold", value: 10 },
                { name: "REIT", value: 5 },
            ];
            break;
            case 4: // Aggressive
            allocation = [
                { name: "Equity (India)", value: 40 },
                { name: "Equity (US)", value: 20 },
                { name: "Debt", value: 25 },
                { name: "Gold", value: 10 },
                { name: "REIT", value: 5 },
            ];
            break;
            case 5: // Very Aggressive
            allocation = [
                { name: "Equity (India)", value: 50 },
                { name: "Equity (US)", value: 25 },
                { name: "Debt", value: 10 },
                { name: "Gold", value: 10 },
                { name: "REIT", value: 5 },
            ];
            break;
            default:
            allocation = [
                { name: "Equity (India)", value: 30 },
                { name: "Equity (US)", value: 15 },
                { name: "Debt", value: 40 },
                { name: "Gold", value: 10 },
                { name: "REIT", value: 5 },
            ];
        }
        setPortfolioAllocation(allocation);

        if (!financialData || Object.keys(financialData).length === 0) {
            toast.info("Data Missing", { description: "Portfolio allocation requires data from 'Enter Details' page. Please fill that first." });
        } else if (riskAppetite === 0) {
             toast.info("Risk Appetite Missing", { description: "Please set your risk appetite in the 'Enter Details' page for portfolio allocation." });
        }
    }
  }, [hasAccess, riskAppetite, financialData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A'];

  if (!hasAccess) {
    return (
      <AccessCodeForm expectedCode={ACCESS_CODE} onAccessGranted={handleAccessGranted}>
        <div className="text-center p-4 border-t border-gray-200 mt-6">
            <p className="text-lg font-semibold text-gray-700">Unlock Your Personalized Portfolio Strategy!</p>
            <p className="text-sm text-gray-500">Enter the access code to view your suggested asset allocation based on your risk profile.</p>
        </div>
      </AccessCodeForm>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Risk-Based Portfolio Allocator</h1>
        <p className="text-lg text-gray-600">Discover your ideal asset mix based on your risk appetite.</p>
      </header>

      {(riskAppetite === 0 || !financialData || Object.keys(financialData).length === 0) && (
        <Card className="mb-8 shadow-lg bg-yellow-50 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-yellow-700">Important: Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600">
              To see your personalized portfolio allocation, please make sure you have:
            </p>
            <ul className="list-disc list-inside text-yellow-600 mt-2">
              {(!financialData || Object.keys(financialData).length === 0) && <li>Filled in your details on the "Enter Details" page.</li>}
              {(riskAppetite === 0) && <li>Set your "Risk Appetite" on the "Enter Details" page.</li>}
            </ul>
             <Button onClick={() => navigate('/enter-details')} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white">
              Go to Enter Details
            </Button>
          </CardContent>
        </Card>
      )}

      {portfolioAllocation.length > 0 && riskAppetite > 0 && financialData && Object.keys(financialData).length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Suggested Portfolio Allocation (Risk Level: {riskAppetite})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={portfolioAllocation} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" unit="%" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d">
                            {portfolioAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-6 text-xs text-gray-500 text-center">
              Disclaimer: This is a model portfolio based on your selected risk appetite. Asset allocation percentages are indicative and for educational purposes. Actual investments should be made after consulting a financial advisor.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Financial Ladder Component */}
      {financialData && Object.keys(financialData).length > 0 && (
        <div className="mt-8">
          <FinancialLadder financialData={financialData} />
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
