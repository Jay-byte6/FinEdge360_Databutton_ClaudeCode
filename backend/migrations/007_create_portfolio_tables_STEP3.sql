-- Migration 007 - STEP 3: Enable RLS and Create Policies
-- Run this AFTER Step 2 completes successfully

-- =============================
-- PORTFOLIO HOLDINGS - RLS
-- =============================
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio holdings"
  ON public.portfolio_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio holdings"
  ON public.portfolio_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio holdings"
  ON public.portfolio_holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio holdings"
  ON public.portfolio_holdings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================
-- NAV HISTORY - RLS
-- =============================
ALTER TABLE public.nav_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own NAV history"
  ON public.nav_history FOR SELECT
  USING (
    holding_id IN (
      SELECT id FROM public.portfolio_holdings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own NAV history"
  ON public.nav_history FOR INSERT
  WITH CHECK (
    holding_id IN (
      SELECT id FROM public.portfolio_holdings WHERE user_id = auth.uid()
    )
  );

-- =============================
-- PORTFOLIO NOTIFICATIONS - RLS
-- =============================
ALTER TABLE public.portfolio_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.portfolio_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.portfolio_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================
-- UPLOADED FILES - RLS
-- =============================
ALTER TABLE public.uploaded_portfolio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploaded files"
  ON public.uploaded_portfolio_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploaded files"
  ON public.uploaded_portfolio_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================
-- SCHEME MAPPINGS - RLS
-- =============================
ALTER TABLE public.scheme_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheme mappings"
  ON public.scheme_mappings FOR SELECT
  TO public
  USING (true);
