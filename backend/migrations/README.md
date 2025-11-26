# Database Migrations

This directory contains database migration scripts for the FinEdge360 application.

## Hybrid Model + FOMO Migrations (NEW)

### Migration Files
1. **001_subscriptions.sql** - Subscription plans and user subscriptions
2. **002_promo_codes.sql** - Promo codes system with FOMO campaigns
3. **003_consultations.sql** - Consultation booking and expert management

### How to Run These Migrations
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste each migration file contents in order (001, 002, 003)
5. Click **Run** for each migration

### What Gets Created
- **subscription_plans** - 3 plans (Free ₹0, Premium ₹999/month, Expert Plus ₹3999/month)
- **user_subscriptions** - Track user subscriptions with auto-generated access codes
- **promo_codes** - 3 campaigns (FOUNDER50, EARLYBIRD100, LAUNCH50)
- **promo_code_usage** - Track who used which promo
- **consultation_types** - Discovery Call (15 min free) + Premium Consultation (45 min)
- **consultation_bookings** - Track all consultation requests
- **expert_profiles** - SEBI expert information
- **expert_revenue** - Commission tracking (20-30%)

### FOUNDER50 Promo Details
- **Total Slots:** 50 lifetime users
- **Starting At:** 37/50 used (accounting for beta users + team)
- **Expires:** 7 days from migration run
- **Benefits:** Lifetime Premium access, 45-min expert consultation, priority support

---

## Previous Migrations

### Migration: 001_create_risk_assessments_table.sql

This migration creates the `risk_assessments` table to store user portfolio risk assessment data.

**To run this migration:**

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Copy the contents of `001_create_risk_assessments_table.sql`
5. Paste into the SQL Editor
6. Click: **Run**

**Or use the helper script:**

```bash
cd backend
source .venv/Scripts/activate  # On Windows
# source .venv/bin/activate    # On Linux/Mac
python migrations/create_table_direct.py
```

This will display the SQL statements to run manually in Supabase.

## Table Schema

The `risk_assessments` table includes:

- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users table (UNIQUE - one assessment per user)
- `risk_score` (INTEGER): User's risk score (0-50)
- `risk_type` (VARCHAR): Risk profile type (Conservative/Moderate/Aggressive)
- `quiz_answers` (JSONB): Optional quiz responses
- `ideal_portfolio` (JSONB): Recommended portfolio allocation
- `current_portfolio` (JSONB): User's current portfolio allocation
- `difference` (JSONB): Differences between ideal and current
- `summary` (TEXT): Assessment summary
- `educational_insights` (JSONB): Educational recommendations
- `encouragement` (TEXT): Motivational message
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time (auto-updated)

## Verification

After running the migration, you can verify it worked by running:

```python
python migrations/run_migration_simple.py
```

This will check if the table exists and is accessible.
