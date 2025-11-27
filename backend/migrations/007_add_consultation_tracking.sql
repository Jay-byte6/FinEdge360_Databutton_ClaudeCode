-- Migration: 007_add_consultation_tracking.sql
-- Description: Add consultation tracking fields to user_subscriptions table
-- Date: 2025-11-26

-- Add consultation tracking columns to user_subscriptions table
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS consultations_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consultations_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consultations_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_consultation_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_consultation_reset TIMESTAMP;

-- Create index for consultation tracking
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_consultations ON user_subscriptions(consultations_remaining);

-- Update existing subscriptions based on their plan
-- Premium plan: 1 free consultation (one-time)
UPDATE user_subscriptions
SET
    consultations_total = 1,
    consultations_remaining = 1
WHERE
    plan_id = (SELECT id FROM subscription_plans WHERE plan_name = 'premium')
    AND consultations_total IS NULL
    AND status = 'active';

-- Expert Plus plan: 1 consultation per month (recurring)
-- Set initial consultation credits for Expert Plus users
UPDATE user_subscriptions
SET
    consultations_total = 1,
    consultations_remaining = 1,
    next_consultation_reset = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
WHERE
    plan_id = (SELECT id FROM subscription_plans WHERE plan_name = 'expert_plus')
    AND consultations_total IS NULL
    AND status = 'active';

-- Create a trigger function to reset Expert Plus consultations monthly
CREATE OR REPLACE FUNCTION reset_expert_plus_consultations()
RETURNS TRIGGER AS $$
BEGIN
    -- If it's an Expert Plus subscription and the reset date has passed
    IF NEW.plan_id = (SELECT id FROM subscription_plans WHERE plan_name = 'expert_plus')
       AND NEW.next_consultation_reset IS NOT NULL
       AND NOW() >= NEW.next_consultation_reset THEN
        -- Reset consultations
        NEW.consultations_remaining := NEW.consultations_total;
        NEW.next_consultation_reset := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-reset monthly consultations
DROP TRIGGER IF EXISTS trigger_reset_consultations ON user_subscriptions;
CREATE TRIGGER trigger_reset_consultations
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION reset_expert_plus_consultations();

-- Add comments for documentation
COMMENT ON COLUMN user_subscriptions.consultations_total IS 'Total number of consultations allocated to this subscription';
COMMENT ON COLUMN user_subscriptions.consultations_used IS 'Number of consultations already used';
COMMENT ON COLUMN user_subscriptions.consultations_remaining IS 'Number of consultations remaining';
COMMENT ON COLUMN user_subscriptions.last_consultation_date IS 'Date of the last consultation booking';
COMMENT ON COLUMN user_subscriptions.next_consultation_reset IS 'Date when consultation credits will reset (for Expert Plus monthly reset)';

-- Success message
SELECT 'Migration 007_add_consultation_tracking.sql completed successfully!' AS status;
