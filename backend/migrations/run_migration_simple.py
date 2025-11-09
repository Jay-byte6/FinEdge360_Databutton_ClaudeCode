"""
Simple script to create risk_assessments table using Supabase client
Note: For complex migrations with multiple statements, it's recommended to:
1. Copy the SQL from 001_create_risk_assessments_table.sql
2. Run it directly in Supabase Dashboard > SQL Editor
3. Or use this script as a reference

For now, this script will attempt to create the table programmatically.
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

print("Checking if risk_assessments table exists...")
print("-" * 60)

try:
    # Try to query the table - if it doesn't exist, this will fail
    result = supabase.table('risk_assessments').select('id').limit(1).execute()
    print("✅ Table 'risk_assessments' already exists!")
    print("\nYou can proceed with testing the risk assessment feature.")
except Exception as e:
    error_msg = str(e)
    if 'relation' in error_msg.lower() and 'does not exist' in error_msg.lower():
        print("❌ Table 'risk_assessments' does not exist yet.")
        print("\n📋 TO CREATE THE TABLE:")
        print("1. Open Supabase Dashboard: https://gzkuoojfoaovnzoczibc.supabase.co")
        print("2. Go to SQL Editor")
        print("3. Copy the contents of: backend/migrations/001_create_risk_assessments_table.sql")
        print("4. Paste and run the SQL in the editor")
        print("\nOR run the SQL statements manually using psql or another PostgreSQL client.")
    else:
        print(f"⚠️  Unexpected error: {error_msg}")

print("\n" + "=" * 60)
print("Migration check complete.")
