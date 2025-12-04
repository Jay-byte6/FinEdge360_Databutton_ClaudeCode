# Update Pricing in Supabase Database

## Current Pricing Update (2025-12-04)

**Changes:**
- **Premium Plan**: ₹2,999 → **₹3,999** (one-time lifetime access)
- **Expert Plus Plan**: ₹3,999/month → **₹1,999/month** (₹19,999/year)

## Steps to Update Database:

### Option 1: Run Migration via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `backend/migrations/006_update_pricing.sql`
5. Click **Run** to execute the migration
6. Verify the output shows the updated prices

### Option 2: Run Migration via SQL

```sql
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
```

## Verification

After running the migration, you should see:

| plan_name    | display_name | price_monthly | price_yearly |
|--------------|--------------|---------------|--------------|
| expert_plus  | Expert Plus  | 1999          | 19999        |
| premium      | Premium      | 3999          | 3999         |

## What's Already Updated

✅ Frontend pricing display (Pricing.tsx)
✅ Payment gateway pricing (RazorpayCheckout.tsx)
✅ Git committed and pushed (commit: 6e7e5e1)

## What Needs Manual Update

⚠️ **Supabase Database** - Run the migration above

## Notes

- The frontend will display the new prices immediately after Vercel deployment
- The backend will calculate payment amounts correctly once Railway deploys
- The database update ensures consistency when backend queries the pricing
- Old subscriptions are not affected - only new purchases will use new prices
