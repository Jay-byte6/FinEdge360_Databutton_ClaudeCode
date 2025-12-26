-- Migration 016: Extend Goals Table for FIRE Planner Integration
-- Date: 2024-12-25
-- Purpose: Add fields needed for complete goal tracking and portfolio alignment

-- Add missing columns to goals table
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS amount_available_today DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_required_future DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_inflation DECIMAL(5, 2) DEFAULT 6.0,
ADD COLUMN IF NOT EXISTS step_up_percentage DECIMAL(5, 2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS sip_required DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;

-- Make personal_info_id nullable so goals can be created independently
ALTER TABLE goals
ALTER COLUMN personal_info_id DROP NOT NULL;

-- Add comment
COMMENT ON TABLE goals IS 'User financial goals from FIRE Planner - can be created independently of personal_info';
COMMENT ON COLUMN goals.amount_available_today IS 'Amount user has already allocated/invested for this goal';
COMMENT ON COLUMN goals.amount_required_future IS 'Future value of goal after inflation';
COMMENT ON COLUMN goals.goal_inflation IS 'Inflation rate % for this goal';
COMMENT ON COLUMN goals.step_up_percentage IS 'SIP step-up % per year';
COMMENT ON COLUMN goals.sip_required IS 'Calculated monthly SIP amount';

-- Verification
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;
