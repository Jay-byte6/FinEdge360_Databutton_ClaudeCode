-- Add last_activity column to users table for data retention tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster queries on last_activity
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- Add comment for documentation
COMMENT ON COLUMN users.last_activity IS 'Timestamp of user last activity for data retention policy (18 months)';

-- Update existing users to have last_activity set to created_at if available, or NOW()
UPDATE users SET last_activity = COALESCE(created_at, NOW()) WHERE last_activity IS NULL;
