-- Migration: 002_promo_codes.sql
-- Description: Create promo codes system with FOMO campaigns
-- Date: 2025-11-24

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    code_name VARCHAR(100) NOT NULL, -- 'Founder's Circle', 'Early Bird', etc.
    code_type VARCHAR(30) NOT NULL, -- 'limited_slots', 'time_limited', 'percentage_off', 'free_lifetime'
    total_slots INTEGER, -- NULL for unlimited
    used_slots INTEGER DEFAULT 0,
    discount_percentage INTEGER, -- e.g., 50 for 50% off
    discount_amount DECIMAL(10,2), -- Fixed amount discount
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
    37, -- Start at 37 (beta users + team)
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
    NOW() + INTERVAL '8 days', -- Starts after FOUNDER50 ends
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
    NULL, -- Unlimited slots
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
