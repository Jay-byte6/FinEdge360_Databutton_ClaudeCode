"""
Script to run the risk_assessments table migration
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

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Read the migration SQL file
migration_file = Path(__file__).parent / '001_create_risk_assessments_table.sql'
with open(migration_file, 'r') as f:
    migration_sql = f.read()

print("Running migration: 001_create_risk_assessments_table.sql")
print("-" * 60)

try:
    # Execute the migration SQL
    result = supabase.rpc('exec_sql', {'query': migration_sql}).execute()
    print("✅ Migration completed successfully!")
    print("\nTable 'risk_assessments' has been created with:")
    print("  - UUID primary key")
    print("  - Foreign key to users table")
    print("  - Risk score (0-50) with check constraint")
    print("  - Risk type (Conservative/Moderate/Aggressive)")
    print("  - JSONB fields for quiz answers, portfolios, insights")
    print("  - Automatic timestamps (created_at, updated_at)")
    print("  - Unique constraint on user_id (one assessment per user)")
except Exception as e:
    print(f"❌ Migration failed: {str(e)}")
    print("\nTrying direct SQL execution...")

    # If RPC doesn't work, try executing each statement separately
    statements = migration_sql.split(';')
    for i, statement in enumerate(statements):
        statement = statement.strip()
        if statement:
            try:
                print(f"\nExecuting statement {i+1}...")
                supabase.postgrest.rpc('exec', {'sql': statement}).execute()
                print(f"✅ Statement {i+1} completed")
            except Exception as stmt_error:
                print(f"⚠️  Statement {i+1} error: {str(stmt_error)}")
                # Continue with next statement even if one fails

    print("\n✅ Migration execution completed (check warnings above)")
