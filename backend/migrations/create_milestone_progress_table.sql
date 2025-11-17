-- Create milestone_progress table to track user's milestone completion status
-- This table stores which milestones users have completed and if they need help

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

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_milestone_progress_user_id ON milestone_progress(user_id);

-- Create index for faster lookups by milestone_number
CREATE INDEX IF NOT EXISTS idx_milestone_progress_milestone_number ON milestone_progress(milestone_number);

-- Add RLS (Row Level Security) policies
ALTER TABLE milestone_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own milestone progress
CREATE POLICY "Users can view own milestone progress"
  ON milestone_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own milestone progress
CREATE POLICY "Users can insert own milestone progress"
  ON milestone_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own milestone progress
CREATE POLICY "Users can update own milestone progress"
  ON milestone_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_milestone_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestone_progress_updated_at
  BEFORE UPDATE ON milestone_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_progress_updated_at();
