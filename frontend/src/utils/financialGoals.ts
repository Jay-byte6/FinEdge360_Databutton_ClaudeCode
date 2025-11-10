// Financial goal suggestions for user education and quick selection

export interface FinancialGoalSuggestion {
  id: string;
  name: string;
  description: string;
  category: 'short' | 'mid' | 'long';
  typicalAmount?: string;
  typicalYears?: string;
}

// Short-Term Goals (0-3 years)
export const shortTermGoals: FinancialGoalSuggestion[] = [
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    description: 'Build 6-12 months of expenses for unexpected situations like job loss or medical emergencies',
    category: 'short',
    typicalAmount: '₹1,00,000 - ₹6,00,000',
    typicalYears: '1-2 years'
  },
  {
    id: 'vacation',
    name: 'Vacation / Travel',
    description: 'Save for domestic or international travel, family vacation, or adventure trip',
    category: 'short',
    typicalAmount: '₹50,000 - ₹3,00,000',
    typicalYears: '1-2 years'
  },
  {
    id: 'wedding-own',
    name: 'Wedding (Own/Sibling)',
    description: 'Save for your own wedding or help with sibling/family member wedding expenses',
    category: 'short',
    typicalAmount: '₹5,00,000 - ₹20,00,000',
    typicalYears: '1-3 years'
  },
  {
    id: 'gadgets-electronics',
    name: 'Gadgets & Electronics',
    description: 'Buy laptop, smartphone, camera, or other high-value electronics',
    category: 'short',
    typicalAmount: '₹30,000 - ₹1,50,000',
    typicalYears: '0.5-2 years'
  },
  {
    id: 'home-renovation',
    name: 'Home Renovation / Repair',
    description: 'Renovate or repair your home, upgrade furniture, or redecorate',
    category: 'short',
    typicalAmount: '₹1,00,000 - ₹5,00,000',
    typicalYears: '1-3 years'
  },
  {
    id: 'medical-procedure',
    name: 'Planned Medical Procedure',
    description: 'Save for elective surgery, dental work, or other planned medical expenses',
    category: 'short',
    typicalAmount: '₹50,000 - ₹3,00,000',
    typicalYears: '1-2 years'
  },
  {
    id: 'skill-course',
    name: 'Skill Development Course',
    description: 'Professional certification, short-term courses, or skill upgrade programs',
    category: 'short',
    typicalAmount: '₹20,000 - ₹2,00,000',
    typicalYears: '0.5-2 years'
  },
  {
    id: 'debt-payoff',
    name: 'Debt Payoff',
    description: 'Clear credit card debt, personal loan, or other high-interest debts',
    category: 'short',
    typicalAmount: '₹50,000 - ₹5,00,000',
    typicalYears: '1-3 years'
  }
];

// Mid-Term Goals (3-7 years)
export const midTermGoals: FinancialGoalSuggestion[] = [
  {
    id: 'home-downpayment',
    name: 'Home Down Payment',
    description: 'Save 20-30% down payment for buying your first home or upgrading to a larger property',
    category: 'mid',
    typicalAmount: '₹10,00,000 - ₹50,00,000',
    typicalYears: '3-7 years'
  },
  {
    id: 'car-purchase',
    name: 'Car Purchase',
    description: 'Buy a new or used vehicle, or upgrade your existing car',
    category: 'mid',
    typicalAmount: '₹5,00,000 - ₹15,00,000',
    typicalYears: '3-5 years'
  },
  {
    id: 'higher-education-self',
    name: 'Higher Education (Self/Spouse)',
    description: 'Fund MBA, MS, or other advanced degrees for yourself or spouse',
    category: 'mid',
    typicalAmount: '₹10,00,000 - ₹50,00,000',
    typicalYears: '3-7 years'
  },
  {
    id: 'business-startup',
    name: 'Start a Business',
    description: 'Build capital to start your own business or invest in entrepreneurial venture',
    category: 'mid',
    typicalAmount: '₹5,00,000 - ₹30,00,000',
    typicalYears: '3-7 years'
  },
  {
    id: 'child-school',
    name: "Child's School Education",
    description: 'Fund private school fees, coaching classes, or extracurricular activities',
    category: 'mid',
    typicalAmount: '₹3,00,000 - ₹10,00,000',
    typicalYears: '3-7 years'
  },
  {
    id: 'property-investment',
    name: 'Investment Property',
    description: 'Buy rental property or plot of land for investment purposes',
    category: 'mid',
    typicalAmount: '₹10,00,000 - ₹50,00,000',
    typicalYears: '4-7 years'
  },
  {
    id: 'sabbatical',
    name: 'Sabbatical / Career Break',
    description: 'Fund a career break for travel, study, or personal projects',
    category: 'mid',
    typicalAmount: '₹3,00,000 - ₹10,00,000',
    typicalYears: '3-5 years'
  },
  {
    id: 'parents-support',
    name: 'Parents Support / Elder Care',
    description: 'Build fund to support aging parents, medical care, or home assistance',
    category: 'mid',
    typicalAmount: '₹5,00,000 - ₹15,00,000',
    typicalYears: '3-7 years'
  }
];

// Long-Term Goals (7+ years)
export const longTermGoals: FinancialGoalSuggestion[] = [
  {
    id: 'retirement',
    name: 'Retirement Corpus',
    description: 'Build wealth for financial independence and comfortable retirement lifestyle',
    category: 'long',
    typicalAmount: '₹1,00,00,000 - ₹5,00,00,000+',
    typicalYears: '20-30 years'
  },
  {
    id: 'child-education',
    name: "Child's Higher Education",
    description: 'Fund college, professional courses, or international education for children',
    category: 'long',
    typicalAmount: '₹25,00,000 - ₹1,00,00,000',
    typicalYears: '10-18 years'
  },
  {
    id: 'child-wedding',
    name: "Child's Wedding",
    description: 'Save for your children wedding expenses including ceremony, reception, and gifts',
    category: 'long',
    typicalAmount: '₹20,00,000 - ₹50,00,000',
    typicalYears: '15-25 years'
  },
  {
    id: 'fire-early-retirement',
    name: 'FIRE (Financial Independence Retire Early)',
    description: 'Achieve financial independence to retire early, typically in 40s or early 50s',
    category: 'long',
    typicalAmount: '₹2,00,00,000 - ₹10,00,00,000+',
    typicalYears: '15-25 years'
  },
  {
    id: 'second-home',
    name: 'Second Home / Vacation Home',
    description: 'Buy a vacation property in the hills, beach, or your dream location',
    category: 'long',
    typicalAmount: '₹30,00,000 - ₹1,00,00,000+',
    typicalYears: '10-20 years'
  },
  {
    id: 'wealth-legacy',
    name: 'Wealth Creation / Legacy',
    description: 'Build substantial wealth to leave inheritance for children and grandchildren',
    category: 'long',
    typicalAmount: '₹50,00,000 - ₹5,00,00,000+',
    typicalYears: '20-30 years'
  },
  {
    id: 'charitable-foundation',
    name: 'Charitable Foundation / Philanthropy',
    description: 'Create fund for charitable work, NGO, or social cause you care about',
    category: 'long',
    typicalAmount: '₹50,00,000 - ₹2,00,00,000+',
    typicalYears: '15-30 years'
  },
  {
    id: 'multiple-properties',
    name: 'Real Estate Portfolio',
    description: 'Build portfolio of multiple rental properties for passive income',
    category: 'long',
    typicalAmount: '₹1,00,00,000 - ₹5,00,00,000+',
    typicalYears: '15-25 years'
  },
  {
    id: 'world-tour',
    name: 'Dream World Tour',
    description: 'Extended international travel to multiple countries after retirement',
    category: 'long',
    typicalAmount: '₹10,00,000 - ₹30,00,000',
    typicalYears: '10-20 years'
  }
];

// Helper function to get goals by category
export const getGoalsByCategory = (category: 'short' | 'mid' | 'long'): FinancialGoalSuggestion[] => {
  switch (category) {
    case 'short':
      return shortTermGoals;
    case 'mid':
      return midTermGoals;
    case 'long':
      return longTermGoals;
    default:
      return [];
  }
};

// Helper function to get all goals
export const getAllGoals = (): FinancialGoalSuggestion[] => {
  return [...shortTermGoals, ...midTermGoals, ...longTermGoals];
};

// Helper function to search goals by keyword
export const searchGoals = (keyword: string): FinancialGoalSuggestion[] => {
  const lowerKeyword = keyword.toLowerCase();
  return getAllGoals().filter(goal =>
    goal.name.toLowerCase().includes(lowerKeyword) ||
    goal.description.toLowerCase().includes(lowerKeyword)
  );
};
