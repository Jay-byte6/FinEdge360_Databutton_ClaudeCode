-- Migration: 004_user_preferences.sql
-- Description: Add user preferences for guideline popups and other UI preferences
-- Date: 2025-11-25

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    preference_type VARCHAR(100) NOT NULL,
    preference_value JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, preference_type)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);

-- Insert example preferences for existing users (optional)
-- You can run this after the table is created to seed default preferences

-- Success message
SELECT 'Migration 004_user_preferences.sql completed successfully!' AS status;
