"""
Create risk_assessments table directly using Supabase REST API
"""
import os
from pathlib import Path
import requests
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Read the migration SQL
migration_file = Path(__file__).parent / '001_create_risk_assessments_table.sql'
with open(migration_file, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

print("Creating risk_assessments table...")
print("=" * 60)

# Supabase SQL execution via REST API
url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Try to execute the SQL
try:
    response = requests.post(
        url,
        headers=headers,
        json={"query": migration_sql}
    )

    if response.status_code == 200:
        print("✓ Migration completed successfully!")
        print("\nTable 'risk_assessments' has been created.")
    else:
        print(f"✗ Migration failed with status code: {response.status_code}")
        print(f"Response: {response.text}")
        print("\nPlease run the SQL manually in Supabase Dashboard:")
        print("1. Go to: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor")
        print("2. Navigate to: SQL Editor")
        print("3. Copy and run the SQL from: backend/migrations/001_create_risk_assessments_table.sql")
except Exception as e:
    print(f"✗ Error: {str(e)}")
    print("\nPlease run the SQL manually in Supabase Dashboard:")
    print("1. Go to: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor")
    print("2. Navigate to: SQL Editor")
    print("3. Copy and run the SQL from: backend/migrations/001_create_risk_assessments_table.sql")
