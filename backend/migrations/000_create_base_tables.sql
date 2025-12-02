-- FinEdge360 Base Tables Schema
-- This creates the core financial data tables that the application requires
-- Run this FIRST before any other migrations

-- Step 1: Create users table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Step 2: Create personal_info table
CREATE TABLE IF NOT EXISTS public.personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  monthly_salary DECIMAL(15, 2) NOT NULL,
  monthly_expenses DECIMAL(15, 2) NOT NULL,
  tax_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own personal info" ON public.personal_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal info" ON public.personal_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal info" ON public.personal_info
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 3: Create assets_liabilities table
CREATE TABLE IF NOT EXISTS public.assets_liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_info_id UUID NOT NULL REFERENCES public.personal_info(id) ON DELETE CASCADE,
  real_estate_value DECIMAL(15, 2) DEFAULT 0,
  gold_value DECIMAL(15, 2) DEFAULT 0,
  mutual_funds_value DECIMAL(15, 2) DEFAULT 0,
  epf_balance DECIMAL(15, 2) DEFAULT 0,
  ppf_balance DECIMAL(15, 2) DEFAULT 0,
  home_loan DECIMAL(15, 2) DEFAULT 0,
  car_loan DECIMAL(15, 2) DEFAULT 0,
  personal_loan DECIMAL(15, 2) DEFAULT 0,
  other_loans DECIMAL(15, 2) DEFAULT 0,
  assets_detail JSONB,
  liabilities_detail JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(personal_info_id)
);

-- Enable RLS
ALTER TABLE public.assets_liabilities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own assets_liabilities" ON public.assets_liabilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets_liabilities" ON public.assets_liabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets_liabilities" ON public.assets_liabilities
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 4: Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_info_id UUID NOT NULL REFERENCES public.personal_info(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  years INTEGER NOT NULL,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('short_term', 'mid_term', 'long_term')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create risk_appetite table
CREATE TABLE IF NOT EXISTS public.risk_appetite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_info_id UUID NOT NULL REFERENCES public.personal_info(id) ON DELETE CASCADE,
  risk_tolerance INTEGER NOT NULL DEFAULT 3,
  inflation_rate DECIMAL(5, 2) DEFAULT 5.0,
  retirement_age INTEGER DEFAULT 55,
  risk_question1 TEXT,
  risk_question2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(personal_info_id)
);

-- Enable RLS
ALTER TABLE public.risk_appetite ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own risk_appetite" ON public.risk_appetite
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk_appetite" ON public.risk_appetite
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk_appetite" ON public.risk_appetite
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_personal_info_user_id ON public.personal_info(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_liabilities_user_id ON public.assets_liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_liabilities_personal_info_id ON public.assets_liabilities(personal_info_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_personal_info_id ON public.goals(personal_info_id);
CREATE INDEX IF NOT EXISTS idx_risk_appetite_user_id ON public.risk_appetite(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_appetite_personal_info_id ON public.risk_appetite(personal_info_id);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Add triggers to auto-update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON public.personal_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_liabilities_updated_at BEFORE UPDATE ON public.assets_liabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_appetite_updated_at BEFORE UPDATE ON public.risk_appetite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification query
SELECT
  'Base tables created successfully!' as status,
  COUNT(*) FILTER (WHERE table_name = 'users') as users_table,
  COUNT(*) FILTER (WHERE table_name = 'personal_info') as personal_info_table,
  COUNT(*) FILTER (WHERE table_name = 'assets_liabilities') as assets_liabilities_table,
  COUNT(*) FILTER (WHERE table_name = 'goals') as goals_table,
  COUNT(*) FILTER (WHERE table_name = 'risk_appetite') as risk_appetite_table
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'personal_info', 'assets_liabilities', 'goals', 'risk_appetite');
