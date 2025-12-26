-- Migration: Create user_action_items table for Dashboard action checklist
-- This table stores which action items users have completed
-- Purpose: Track user progress through onboarding and financial planning tasks

-- Create user_action_items table
CREATE TABLE IF NOT EXISTS user_action_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  completed_action_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_action_items_user_id ON user_action_items(user_id);

-- Add Row Level Security (RLS) policies
ALTER TABLE user_action_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own action items
CREATE POLICY "Users can view their own action items"
ON user_action_items
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own action items
CREATE POLICY "Users can insert their own action items"
ON user_action_items
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own action items
CREATE POLICY "Users can update their own action items"
ON user_action_items
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Add trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_user_action_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_action_items_updated_at
BEFORE UPDATE ON user_action_items
FOR EACH ROW
EXECUTE FUNCTION update_user_action_items_updated_at();

-- Add comment to table
COMMENT ON TABLE user_action_items IS 'Stores completed action items for each user on the Dashboard';
COMMENT ON COLUMN user_action_items.user_id IS 'Foreign key reference to auth.users table';
COMMENT ON COLUMN user_action_items.completed_action_ids IS 'Array of action item IDs that user has completed';
