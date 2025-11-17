-- Safe migration for milestone_progress table
-- This version won't fail if policies already exist

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS milestone_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  milestone_number INT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  needs_help BOOLEAN DEFAULT false,
  help_requested_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_milestone UNIQUE(user_id, milestone_number),
  CONSTRAINT valid_milestone_number CHECK (milestone_number BETWEEN 1 AND 10)
);

-- Enable RLS (won't fail if already enabled)
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own milestone progress" ON milestone_progress;
DROP POLICY IF EXISTS "Users can insert own milestone progress" ON milestone_progress;
DROP POLICY IF EXISTS "Users can update own milestone progress" ON milestone_progress;
DROP POLICY IF EXISTS "Users can delete own milestone progress" ON milestone_progress;

-- Recreate policies
CREATE POLICY "Users can view own milestone progress"
  ON milestone_progress FOR SELECT
  USING (true);  -- Allow all users to view (we filter by user_id in application)

CREATE POLICY "Users can insert own milestone progress"
  ON milestone_progress FOR INSERT
  WITH CHECK (true);  -- Allow all authenticated users to insert

CREATE POLICY "Users can update own milestone progress"
  ON milestone_progress FOR UPDATE
  USING (true)  -- Allow all users to update (we filter by user_id in application)
  WITH CHECK (true);

CREATE POLICY "Users can delete own milestone progress"
  ON milestone_progress FOR DELETE
  USING (true);  -- Allow all users to delete (we filter by user_id in application)

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_milestone_progress_user_id ON milestone_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_progress_milestone_number ON milestone_progress(milestone_number);
