-- =====================================================
-- USER FEEDBACK TABLE SETUP
-- Run this SQL in Supabase SQL Editor to create the user_feedback table
-- =====================================================

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT,
    responses JSONB NOT NULL,
    timestamp TEXT NOT NULL,
    source TEXT DEFAULT 'in-app-feedback',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS idx_user_feedback_source ON user_feedback(source);

-- Enable Row Level Security (RLS)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON user_feedback;
CREATE POLICY "Users can insert own feedback" ON user_feedback
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

-- Create policy for service role to read all feedback (admin)
DROP POLICY IF EXISTS "Service role can view all feedback" ON user_feedback;
CREATE POLICY "Service role can view all feedback" ON user_feedback
    FOR SELECT
    USING (true);  -- Service role bypasses RLS, so this allows admin access

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_feedback_updated_at ON user_feedback;
CREATE TRIGGER update_user_feedback_updated_at
    BEFORE UPDATE ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_feedback TO authenticated;
GRANT ALL ON user_feedback TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ user_feedback table created successfully!';
    RAISE NOTICE '✅ Indexes created';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ Triggers set up';
    RAISE NOTICE '';
    RAISE NOTICE 'Table is ready to accept feedback submissions!';
END $$;
