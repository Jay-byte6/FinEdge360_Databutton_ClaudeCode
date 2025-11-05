import { createClient } from '@supabase/supabase-js';

// The environmental variables should be already in your app
const supabaseUrl = 'https://gzkuoojfoaovnzoczibc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6a3Vvb2pmb2Fvdm56b2N6aWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTg1MjcsImV4cCI6MjA2MTc3NDUyN30.LWbuf6pa5G3fbAkfBv23vGT6xk685TrFqZD1gZ08IDM';

// Determine the site URL for auth redirects
const getSiteUrl = () => {
  const currentUrl = window.location.origin;
  if (currentUrl.includes('databutton.app')) {
    return 'https://vaaniai.databutton.app/finedge360';
  } 
  return currentUrl;
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Set global site URL for auth redirects
    site_url: getSiteUrl()
  }
});

// Database types based on your schema
export type User = {
  id: string;
  created_at: string;
  email?: string;
  name?: string;
};

export type PersonalInfo = {
  id: string;
  user_id: string;
  name: string;
  age: number;
  monthly_salary: number;
  monthly_expenses: number;
  created_at: string;
  updated_at: string;
};

export type AssetsLiabilities = {
  id: string;
  user_id: string;
  personal_info_id: string;
  real_estate_value: number;
  gold_value: number;
  mutual_funds_value: number;
  epf_balance: number;
  ppf_balance: number;
  home_loan: number;
  car_loan: number;
  personal_loan: number;
  other_loans: number;
  created_at: string;
  updated_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  personal_info_id: string;
  name: string;
  amount: number;
  years: number;
  goal_type: 'short_term' | 'mid_term' | 'long_term';
  created_at: string;
  updated_at: string;
};

export type RiskAppetite = {
  id: string;
  user_id: string;
  personal_info_id: string;
  risk_tolerance: number;
  risk_question1: string;
  risk_question2: string;
  created_at: string;
  updated_at: string;
};
