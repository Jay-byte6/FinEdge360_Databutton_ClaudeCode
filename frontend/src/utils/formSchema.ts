import { z } from 'zod';

// Personal Info schema
export const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().min(18, 'Age must be at least 18').max(100, 'Age must be less than 100'),
  monthlySalary: z.coerce.number().min(0, 'Salary cannot be negative'),
  monthlyExpenses: z.coerce.number().min(0, 'Expenses cannot be negative'),
});

// Updated Assets Schema with detailed structure
export const assetsSchema = z.object({
  illiquid: z.object({
    home: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    other_real_estate: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    jewellery: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    sgb: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    ulips: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    epf_ppf_vpf: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  }).optional().default({}), // Make sub-object optional
  liquid: z.object({
    fixed_deposit: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    debt_funds: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    domestic_stock_market: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    domestic_equity_mutual_funds: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    cash_from_equity_mutual_funds: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    us_equity: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    liquid_savings_cash: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    gold_etf_digital_gold: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    crypto: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
    reits: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  }).optional().default({}), // Make sub-object optional
}).describe("Schema for user assets, split into illiquid and liquid categories.");

// Updated Liabilities Schema with detailed structure
export const liabilitiesSchema = z.object({
  home_loan: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  education_loan: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  car_loan: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  personal_gold_loan: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  credit_card: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
  other_liabilities: z.coerce.number().min(0, "Value must be non-negative").optional().default(0),
}).describe("Schema for user liabilities.");

// Short-term Goal schema
const shortTermGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  years: z.coerce.number().min(0, 'Years cannot be negative').max(3, 'Short-term goals must be within 3 years'),
});

// Mid-term Goal schema
const midTermGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  years: z.coerce.number().min(3, 'Mid-term goals must be at least 3 years').max(7, 'Mid-term goals must be within 7 years'),
});

// Long-term Goal schema
const longTermGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  years: z.coerce.number().min(7, 'Long-term goals must be at least 7 years'),
});

// Goals schema
export const goalsSchema = z.object({
  shortTermGoals: z.array(shortTermGoalSchema).min(1, 'At least one short-term goal is required'),
  midTermGoals: z.array(midTermGoalSchema).min(1, 'At least one mid-term goal is required'),
  longTermGoals: z.array(longTermGoalSchema).min(1, 'At least one long-term goal is required'),
});

// Updated Risk Appetite Schema
export const riskAppetiteSchema = z.object({
  risk_tolerance: z.coerce.number().min(1, "Min 1").max(5, "Max 5").optional().default(3),
  inflationRate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().min(1, "Must be at least 1%").max(10, "Must be no more than 10%").optional().default(5)
  ),
  retirementAge: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().min(40, "Must be at least 40").max(70, "Must be no more than 70").optional().default(55)
  ),
}).describe("Schema for user risk appetite and related factors.");

// Complete form schema combining all sections - This might need updating
// depending on how react-hook-form is used (one big form vs. separate forms per tab)
// Let's comment it out for now as we are using separate forms per tab.
/*
export const formSchema = z.object({
  personalInfo: personalInfoSchema,
  assets: assetsSchema, // Changed
  liabilities: liabilitiesSchema, // Changed
  goals: goalsSchema,
  riskAppetite: riskAppetiteSchema,
});
*/

// Types based on schemas
export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
export type AssetsValues = z.infer<typeof assetsSchema>; // New
export type LiabilitiesValues = z.infer<typeof liabilitiesSchema>; // New
export type GoalsValues = z.infer<typeof goalsSchema>;
export type RiskAppetiteValues = z.infer<typeof riskAppetiteSchema>;

// Combined type for the whole form data, potentially matching backend input structure
export const financialDataSchema = z.object({
  personalInfo: personalInfoSchema,
  assets: assetsSchema, // Use new schema
  liabilities: liabilitiesSchema, // Use new schema
  goals: goalsSchema,
  riskAppetite: riskAppetiteSchema,
  userId: z.string().optional(), // Assuming userId is added during submission/backend
}).describe("Combined schema for all financial data entered by the user.");

export type FinancialDataValues = z.infer<typeof financialDataSchema>; // Represents combined data
// export type FormValues = z.infer<typeof formSchema>; // Remove or update if formSchema is kept/changed
