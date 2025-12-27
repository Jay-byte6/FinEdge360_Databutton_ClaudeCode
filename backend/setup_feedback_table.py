"""
Setup script for user_feedback table in Supabase
Run this script to create the feedback table in your database
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_feedback_table():
    """Create user_feedback table in Supabase"""

    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in environment variables")
        return False

    print(f"Connecting to Supabase: {supabase_url[:30]}...")

    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)

        # SQL to create user_feedback table
        sql_query = """
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
            USING (current_user = 'service_role');

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
        """

        # Execute the SQL using Supabase's RPC or direct SQL execution
        # Note: Supabase Python client doesn't have direct SQL execution
        # You'll need to run this SQL in Supabase SQL Editor or use PostgREST

        print("\n" + "="*70)
        print("SQL QUERY TO CREATE user_feedback TABLE:")
        print("="*70)
        print(sql_query)
        print("="*70)
        print("\nPlease run the above SQL query in your Supabase SQL Editor:")
        print("1. Go to https://app.supabase.com")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print("4. Copy and paste the SQL query above")
        print("5. Click 'Run'")
        print("\nAlternatively, you can use the Supabase CLI or direct PostgreSQL connection.")
        print("="*70)

        return True

    except Exception as e:
        print(f"ERROR: Failed to connect to Supabase: {str(e)}")
        return False


if __name__ == "__main__":
    print("Setting up user_feedback table...")
    create_feedback_table()
