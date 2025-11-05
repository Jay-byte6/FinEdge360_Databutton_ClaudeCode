import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Tip {
  id: string;
  text: string;
  type: 'general' | 'dynamic';
}

interface TaxTipsDisplayProps {
  tips: Tip[];
}

const generalTips: Tip[] = [
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
  { id: 'gen11', type: 'general', text: "Standard Deduction of ₹50,000 is available for salaried individuals under both tax regimes." }, 
];

const TaxTipsDisplay: React.FC<TaxTipsDisplayProps> = ({ tips }) => {
  const displayTips = tips.length > 0 ? tips : generalTips.slice(0, 3); // Show passed tips or default to 3 general tips

  return (
    <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-yellow-700">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
          Smart Tax-Saving Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayTips.length > 0 ? (
          <ul className="space-y-2">
            {displayTips.map((tip) => (
              <li key={tip.id} className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2 text-yellow-600">&#8226;</span> {/* Bullet point */}
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-yellow-700">No specific tips available right now. Check back after entering more details!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxTipsDisplay;
