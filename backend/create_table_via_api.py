"""
Create milestone_progress table using Supabase REST API

This script uses the Supabase client library to execute raw SQL
"""

import os
from dotenv import load_dotenv
import requests

load_dotenv()

def create_table():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("ERROR: Environment variables not set")
        return False

    # Read SQL file
    sql_file = 'migrations/create_milestone_progress_table.sql'
    with open(sql_file, 'r') as f:
        sql = f.read()

    print("Creating milestone_progress table via Supabase REST API...")
    print()

    # Use Supabase's SQL execution endpoint (if available)
    # Otherwise, we'll need to use rpc or a different method

    # For now, let's try using the supabase-py library's rpc method
    from supabase import create_client

    try:
        client = create_client(supabase_url, supabase_key)

        # Check if table already exists
        try:
            result = client.table('milestone_progress').select('*').limit(1).execute()
            print("Table 'milestone_progress' already exists!")
            print("Skipping creation...")
            return True
        except Exception as e:
            # Table doesn't exist, proceed with creation
            print("Table doesn't exist yet, creating...")

        # Since Supabase REST API doesn't directly support DDL (CREATE TABLE),
        # we need to provide instructions for manual setup
        print("\nIMPORTANT: The milestone_progress table needs to be created manually.")
        print("\nPlease follow these steps:")
        print("=" * 70)
        print("1. Open your Supabase dashboard: https://supabase.com/dashboard")
        print("2. Select your project")
        print("3. Click on 'SQL Editor' in the left sidebar")
        print("4. Click 'New query'")
        print("5. Copy and paste the following SQL:")
        print("=" * 70)
        print()
        print(sql)
        print()
        print("=" * 70)
        print("6. Click 'Run' or press Cmd/Ctrl + Enter")
        print("=" * 70)
        print()
        print("After running the SQL, the table will be ready to use!")

        return False  # Indicate manual setup needed

    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    create_table()
