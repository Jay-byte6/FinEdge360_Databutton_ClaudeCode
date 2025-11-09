"""
Direct table creation for risk_assessments using SQL
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Parse Supabase URL to get connection details
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL must be set in .env file")

# Extract project ref from URL (e.g., https://gzkuoojfoaovnzoczibc.supabase.co)
project_ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

# Supabase database connection string format
# Note: You'll need the database password from Supabase dashboard
print("=" * 60)
print("MANUAL MIGRATION REQUIRED")
print("=" * 60)
print("\nThe risk_assessments table needs to be created in Supabase.")
print("\nOption 1 (Recommended): Use Supabase Dashboard")
print("-" * 60)
print("1. Open: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor")
print("2. Navigate to: SQL Editor")
print("3. Click: New Query")
print("4. Copy the contents of:")
print("   backend/migrations/001_create_risk_assessments_table.sql")
print("5. Paste into the SQL Editor")
print("6. Click: Run")
print("\nOption 2: Use the SQL statements directly")
print("-" * 60)

# Read and display the migration SQL
migration_file = Path(__file__).parent / '001_create_risk_assessments_table.sql'
with open(migration_file, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

print("\nSQL TO RUN:")
print("-" * 60)
print(migration_sql)
print("-" * 60)
print("\nAfter running the migration, the table will be ready for use!")
