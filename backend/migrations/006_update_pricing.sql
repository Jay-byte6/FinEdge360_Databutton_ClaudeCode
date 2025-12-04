-- Migration 006: Update Pricing
-- Date: 2025-12-04
-- Description: Update Premium to ₹3,999 one-time and Expert Plus to ₹1,999/month

-- Update Premium plan pricing (lifetime access)
UPDATE subscription_plans
SET
  price_monthly = 3999,
  price_yearly = 3999,
  updated_at = NOW()
WHERE plan_name = 'premium';

-- Update Expert Plus plan pricing
UPDATE subscription_plans
SET
  price_monthly = 1999,
  price_yearly = 19999,
  updated_at = NOW()
WHERE plan_name = 'expert_plus';

-- Verify the changes
SELECT
  plan_name,
  display_name,
  price_monthly,
  price_yearly,
  updated_at
FROM subscription_plans
WHERE plan_name IN ('premium', 'expert_plus')
ORDER BY plan_name;
