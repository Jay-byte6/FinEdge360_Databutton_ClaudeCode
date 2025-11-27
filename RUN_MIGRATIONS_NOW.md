# 🚀 Database Migrations - Run This Now!

## Status: ⚠️ CRITICAL - Must Run Before Payment Testing

---

## Quick Instructions

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste each migration below **one at a time**
5. Click **Run** after each migration
6. Verify success message appears

---

## Migration 1: Subscription System

**Purpose**: Creates subscription plans (Free, Premium, Expert Plus) and user subscription tracking

```sql
-- Migration: 001_subscriptions.sql
-- Description: Create subscription plans and user subscriptions tables
-- Date: 2025-11-24

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL UNIQUE,
    plan_display_name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    access_code VARCHAR(20) UNIQUE,
    code_redeemed_at TIMESTAMP,
    subscription_start TIMESTAMP DEFAULT NOW(),
    subscription_end TIMESTAMP,
    billing_cycle VARCHAR(20),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    stripe_subscription_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    is_lifetime BOOLEAN DEFAULT FALSE,
    promo_code_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_access_code ON user_subscriptions(access_code);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_created_at ON user_subscriptions(created_at);

-- Insert default subscription plans
INSERT INTO subscription_plans (
    plan_name,
    plan_display_name,
    price_monthly,
    price_yearly,
    features
) VALUES
(
    'free',
    'Free',
    0,
    0,
    '{
        "fire_calculator": true,
        "basic_net_worth": true,
        "journey_visualization": true,
        "basic_dashboard": true,
        "portfolio_analyzer": false,
        "sip_planner": false,
        "goal_tracking_limit": 1,
        "expert_consultation": false,
        "pdf_exports": false,
        "priority_support": false
    }'::jsonb
),
(
    'premium',
    'Premium',
    2999,
    2999,
    '{
        "fire_calculator": true,
        "basic_net_worth": true,
        "journey_visualization": true,
        "basic_dashboard": true,
        "portfolio_analyzer": true,
        "sip_planner": true,
        "goal_tracking_limit": null,
        "expert_consultation": true,
        "consultation_duration": 45,
        "pdf_exports": true,
        "priority_support": true,
        "advanced_analytics": true,
        "milestone_tracking": true
    }'::jsonb
),
(
    'expert_plus',
    'Expert Plus',
    3999,
    3999,
    '{
        "fire_calculator": true,
        "basic_net_worth": true,
        "journey_visualization": true,
        "basic_dashboard": true,
        "portfolio_analyzer": true,
        "sip_planner": true,
        "goal_tracking_limit": null,
        "expert_consultation": true,
        "consultation_duration": 45,
        "quarterly_reviews": 4,
        "direct_expert_chat": true,
        "priority_booking": true,
        "annual_financial_review": true,
        "tax_filing_support": true,
        "pdf_exports": true,
        "priority_support": true,
        "advanced_analytics": true,
        "milestone_tracking": true
    }'::jsonb
)
ON CONFLICT (plan_name) DO NOTHING;

-- Success message
SELECT 'Migration 001_subscriptions.sql completed successfully!' AS status;
```

**✅ Expected Output**: "Migration 001_subscriptions.sql completed successfully!"

---

## Migration 2: Promo Codes & FOMO System

**Purpose**: Creates promo code campaigns (FOUNDER50, EARLYBIRD100, LAUNCH50) with scarcity tracking

```sql
-- Migration: 002_promo_codes.sql
-- Description: Create promo codes system with FOMO campaigns
-- Date: 2025-11-24

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    code_name VARCHAR(100) NOT NULL,
    code_type VARCHAR(30) NOT NULL,
    total_slots INTEGER,
    used_slots INTEGER DEFAULT 0,
    discount_percentage INTEGER,
    discount_amount DECIMAL(10,2),
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    benefits JSONB NOT NULL DEFAULT '{}'::jsonb,
    terms_conditions TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Promo code usage tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id INTEGER NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    benefits_applied JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Promo stats for real-time FOMO display
CREATE TABLE IF NOT EXISTS promo_code_stats (
    id SERIAL PRIMARY KEY,
    promo_code_id INTEGER REFERENCES promo_codes(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT NOW(),
    page_views INTEGER DEFAULT 0,
    code_attempts INTEGER DEFAULT 0,
    successful_redemptions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_end_date ON promo_codes(end_date);
CREATE INDEX IF NOT EXISTS idx_promo_usage_user ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_used_at ON promo_code_usage(used_at);

-- Insert initial promo codes
INSERT INTO promo_codes (
    code,
    code_name,
    code_type,
    total_slots,
    used_slots,
    start_date,
    end_date,
    benefits,
    terms_conditions
) VALUES
(
    'FOUNDER50',
    'Founder''s Circle',
    'limited_slots',
    50,
    37,
    NOW(),
    NOW() + INTERVAL '7 days',
    '{
        "lifetime": true,
        "premium_access": true,
        "expert_consultation": true,
        "consultation_minutes": 45,
        "badge": "founder",
        "priority_support": true,
        "future_features": true
    }'::jsonb,
    'Valid for first 50 users only. Lifetime Premium access with no recurring charges. One-time expert consultation included.'
),
(
    'EARLYBIRD100',
    'Early Bird Special',
    'limited_slots',
    100,
    0,
    NOW() + INTERVAL '8 days',
    NOW() + INTERVAL '22 days',
    '{
        "discount_percentage": 50,
        "duration_months": 12,
        "premium_access": true
    }'::jsonb,
    '50% off Premium for first year. Valid for next 100 users after Founder''s Circle.'
),
(
    'LAUNCH50',
    'Launch Week Special',
    'time_limited',
    NULL,
    0,
    NOW(),
    NOW() + INTERVAL '7 days',
    '{
        "discount_percentage": 50,
        "duration_months": 3,
        "premium_access": true
    }'::jsonb,
    '50% off Premium for first 3 months. Available during launch week only.'
)
ON CONFLICT (code) DO NOTHING;

-- Success message
SELECT 'Migration 002_promo_codes.sql completed successfully!' AS status;
```

**✅ Expected Output**: "Migration 002_promo_codes.sql completed successfully!"

---

## Migration 3: Consultation Booking System

**Purpose**: Creates consultation types (Discovery Call, Premium) and booking management

```sql
-- Migration: 003_consultations.sql
-- Description: Create consultation booking and expert management tables
-- Date: 2025-11-24

-- Consultation types
CREATE TABLE IF NOT EXISTS consultation_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    description TEXT,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Consultation bookings
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    consultation_type_id INTEGER REFERENCES consultation_types(id) ON DELETE SET NULL,
    expert_id UUID,
    booking_status VARCHAR(20) DEFAULT 'pending',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    duration_minutes INTEGER NOT NULL,
    meeting_link VARCHAR(500),
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    user_phone VARCHAR(20),
    selected_service VARCHAR(100),
    selected_expert_type VARCHAR(100),
    user_message TEXT,
    expert_notes TEXT,
    consultation_summary TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT
);

-- Expert profiles (for SEBI registered advisors)
CREATE TABLE IF NOT EXISTS expert_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    expert_name VARCHAR(100) NOT NULL,
    sebi_registration_number VARCHAR(50),
    certification_type VARCHAR(50),
    specializations JSONB DEFAULT '[]'::jsonb,
    years_of_experience INTEGER,
    bio TEXT,
    calendar_link VARCHAR(500),
    commission_percentage DECIMAL(5,2) DEFAULT 25.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Revenue tracking for expert commissions
CREATE TABLE IF NOT EXISTS expert_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    consultation_id UUID REFERENCES consultation_bookings(id) ON DELETE SET NULL,
    service_type VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    platform_revenue DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultations_user ON consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_expert ON consultation_bookings(expert_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultation_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultation_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultation_bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_user ON expert_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_active ON expert_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_expert_revenue_expert ON expert_revenue(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_revenue_user ON expert_revenue(user_id);

-- Insert consultation types
INSERT INTO consultation_types (type_name, duration_minutes, price, is_free, description, features) VALUES
(
    'discovery_call',
    15,
    0,
    TRUE,
    'Free 15-minute introductory call to understand your needs',
    '["General financial guidance", "App walkthrough", "High-level Q&A", "No detailed analysis"]'::jsonb
),
(
    'premium_consultation',
    45,
    0,
    TRUE,
    'Comprehensive 45-minute financial consultation with detailed analysis',
    '["Portfolio review", "SIP strategy planning", "Tax optimization", "Goal planning", "Written summary", "30-day email support"]'::jsonb
)
ON CONFLICT (type_name) DO NOTHING;

-- Success message
SELECT 'Migration 003_consultations.sql completed successfully!' AS status;
```

**✅ Expected Output**: "Migration 003_consultations.sql completed successfully!"

---

## Verification Queries

After running all migrations, verify they worked by running these queries:

```sql
-- Check subscription plans
SELECT * FROM subscription_plans ORDER BY price_monthly;

-- Check promo codes
SELECT code, code_name, total_slots, used_slots, end_date
FROM promo_codes
WHERE is_active = TRUE;

-- Check consultation types
SELECT * FROM consultation_types;

-- Check all tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'subscription_plans',
    'user_subscriptions',
    'promo_codes',
    'promo_code_usage',
    'consultation_types',
    'consultation_bookings',
    'expert_profiles'
)
ORDER BY tablename;
```

---

## ✅ Success Criteria

You should see:
- ✅ 3 subscription plans (Free, Premium, Expert Plus)
- ✅ 3 promo codes (FOUNDER50, EARLYBIRD100, LAUNCH50)
- ✅ 2 consultation types (Discovery Call, Premium)
- ✅ 7 new tables created

---

## 🎯 What This Enables

After running these migrations, you can:
1. **Test payment flow** with Razorpay/Stripe
2. **Apply promo codes** (FOUNDER50 for lifetime access)
3. **Book consultations** through the app
4. **Track revenue** and commissions
5. **Monitor FOMO metrics** (spots remaining, time left)

---

## 🚨 If Something Goes Wrong

If any migration fails:
1. Check the error message in Supabase SQL Editor
2. The migrations use `IF NOT EXISTS` so they're safe to re-run
3. Each migration is independent - you can run them in any order
4. Contact support if needed

---

**Last Updated**: 2025-11-25
**Status**: Ready to run ⚡
