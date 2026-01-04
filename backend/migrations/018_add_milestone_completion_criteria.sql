-- Migration: Add completion_criteria column to milestone_progress table
-- This stores the state of individual completion checkboxes when milestone is completed

-- Add completion_criteria as JSONB to store the checklist state
ALTER TABLE milestone_progress
ADD COLUMN IF NOT EXISTS completion_criteria JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the field
COMMENT ON COLUMN milestone_progress.completion_criteria IS
'JSON array storing the completion criteria state at time of completion.
Example: [{"label": "Risk assessment quiz completed", "checked": true, "description": "..."}]';

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_milestone_progress_criteria
ON milestone_progress USING gin (completion_criteria);
