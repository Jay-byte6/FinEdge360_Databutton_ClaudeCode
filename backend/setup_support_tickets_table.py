"""
Setup script to create support_tickets table in Supabase
Run this script once to initialize the support tickets system
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")
    exit(1)

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Read SQL migration file
sql_file_path = os.path.join(os.path.dirname(__file__), "migrations", "create_support_tickets_table.sql")

with open(sql_file_path, "r") as f:
    sql_commands = f.read()

print("Creating support_tickets table...")
print("-" * 60)

try:
    # Execute SQL commands
    # Note: Supabase Python SDK doesn't have direct SQL execution
    # You need to run this SQL manually in Supabase SQL Editor
    # Or use psycopg2 to connect directly to the database

    print("SQL Commands to execute in Supabase SQL Editor:")
    print("-" * 60)
    print(sql_commands)
    print("-" * 60)
    print("\nPlease copy the above SQL and run it in:")
    print("1. Go to your Supabase Dashboard")
    print("2. Navigate to SQL Editor")
    print("3. Paste and execute the SQL commands")
    print("\nOr, use the Supabase CLI:")
    print(f"  supabase db execute -f {sql_file_path}")

    # Alternative: Use direct PostgreSQL connection if credentials available
    try:
        import psycopg2

        # Parse database URL if available
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            print("\n[Attempting direct database connection...]")
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()

            # Execute SQL commands
            cursor.execute(sql_commands)
            conn.commit()

            cursor.close()
            conn.close()

            print("✅ SUCCESS: support_tickets table created successfully!")
        else:
            print("\nDATABASE_URL not found. Manual SQL execution required.")

    except ImportError:
        print("\n[psycopg2 not installed. Install with: pip install psycopg2-binary]")
    except Exception as e:
        print(f"\n[Direct database connection failed: {e}]")
        print("Please use the SQL Editor method above.")

except Exception as e:
    print(f"ERROR: {e}")
    exit(1)
