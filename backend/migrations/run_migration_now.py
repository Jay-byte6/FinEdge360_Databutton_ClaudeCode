"""
Create risk_assessments table using Supabase Python client
"""
import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("Creating risk_assessments table...")
print("=" * 60)

# Execute each SQL statement separately
sql_statements = [
    # Create table
    """
    CREATE TABLE IF NOT EXISTS risk_assessments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 50),
        risk_type VARCHAR(20) NOT NULL CHECK (risk_type IN ('Conservative', 'Moderate', 'Aggressive')),
        quiz_answers JSONB,
        ideal_portfolio JSONB NOT NULL,
        current_portfolio JSONB NOT NULL,
        difference JSONB NOT NULL,
        summary TEXT NOT NULL,
        educational_insights JSONB NOT NULL,
        encouragement TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
    );
    """,
    # Create index
    """
    CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
    """,
    # Create function
    """
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    """,
    # Create trigger
    """
    CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """
]

try:
    # Test table existence first
    try:
        result = supabase.table('risk_assessments').select('id').limit(1).execute()
        print("✓ Table 'risk_assessments' already exists!")
        print("\nYou can proceed with testing the risk assessment feature.")
        exit(0)
    except Exception as e:
        # Table doesn't exist, continue with creation
        pass

    print("\nAttempting to create table...")
    print("\nNote: Supabase Python client doesn't support raw SQL execution.")
    print("The table must be created through Supabase Dashboard.")
    print("\nPlease follow these steps:")
    print("-" * 60)
    print("1. Open: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor")
    print("2. Click on: SQL Editor (left sidebar)")
    print("3. Click: New Query")
    print("4. Copy the SQL from: backend/migrations/001_create_risk_assessments_table.sql")
    print("5. Paste into the editor")
    print("6. Click: Run")
    print("\nAfter running the migration, the risk assessment feature will work correctly!")
    print("=" * 60)

except Exception as e:
    print(f"Error: {str(e)}")
