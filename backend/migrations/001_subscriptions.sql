-- Migration: 001_subscriptions.sql
-- Description: Create subscription plans and user subscriptions tables
-- Date: 2025-11-24

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'premium', 'expert_plus'
    plan_display_name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL DEFAULT '{}'::jsonb, -- List of features
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References auth.users(id) but no FK constraint for flexibility
    plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
    access_code VARCHAR(20) UNIQUE,
    code_redeemed_at TIMESTAMP,
    subscription_start TIMESTAMP DEFAULT NOW(),
    subscription_end TIMESTAMP,
    billing_cycle VARCHAR(20), -- 'monthly', 'yearly', 'lifetime'
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
    999,
    9999,
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
    39999,
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
