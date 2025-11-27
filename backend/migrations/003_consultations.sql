-- Migration: 003_consultations.sql
-- Description: Create consultation booking and expert management tables
-- Date: 2025-11-24

-- Consultation types
CREATE TABLE IF NOT EXISTS consultation_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE, -- 'discovery_call', 'premium_consultation'
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
    expert_id UUID, -- SEBI expert user
    booking_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    duration_minutes INTEGER NOT NULL,
    meeting_link VARCHAR(500), -- Zoom/Google Meet link
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    user_phone VARCHAR(20),
    selected_service VARCHAR(100), -- 'FIRE Planning', 'Tax Planning', etc.
    selected_expert_type VARCHAR(100), -- 'SEBI RIA', 'CA', 'CFP', etc.
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
    certification_type VARCHAR(50), -- 'SEBI RIA', 'CA', 'CFP', etc.
    specializations JSONB DEFAULT '[]'::jsonb, -- ['FIRE Planning', 'Tax Planning', 'SIP Planning']
    years_of_experience INTEGER,
    bio TEXT,
    calendar_link VARCHAR(500), -- Calendly or similar
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
    service_type VARCHAR(50), -- 'consultation', 'ongoing_advisory', 'plan_creation'
    total_amount DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    platform_revenue DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
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
    0, -- Free with Premium subscription
    TRUE,
    'Comprehensive 45-minute financial consultation with detailed analysis',
    '["Portfolio review", "SIP strategy planning", "Tax optimization", "Goal planning", "Written summary", "30-day email support"]'::jsonb
)
ON CONFLICT (type_name) DO NOTHING;

-- Success message
SELECT 'Migration 003_consultations.sql completed successfully!' AS status;
