import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("ERROR: Supabase credentials not found")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

# Read SQL file
with open("migrations/create_support_tickets_table.sql", "r") as f:
    sql = f.read()

print("Creating support_tickets table...")

try:
    # Execute SQL using Supabase's SQL query endpoint
    # Note: This uses the PostgREST RPC function
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ SUCCESS: support_tickets table created!")
except Exception as e:
    print(f"Note: Direct SQL execution not available via Supabase Python client")
    print(f"Please execute the SQL manually in Supabase SQL Editor")
    print(f"\nHere's the SQL to execute:")
    print("="*60)
    print(sql)
    print("="*60)
