"""
Script to create the milestone_progress table in Supabase

This script reads the SQL migration file and executes it via Supabase's REST API
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_milestone_progress_table():
    """Create the milestone_progress table in Supabase"""

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        return False

    print(f"Connecting to Supabase: {supabase_url[:30]}...")

    try:
        supabase = create_client(supabase_url, supabase_key)

        # Read the SQL migration file
        sql_file = os.path.join(os.path.dirname(__file__), 'migrations', 'create_milestone_progress_table.sql')

        with open(sql_file, 'r') as f:
            sql_content = f.read()

        print("SQL migration file loaded successfully")
        print("\nExecuting SQL statements...")

        # Split into individual statements (rough split by semicolons outside of function bodies)
        # For now, we'll use Supabase's query to execute raw SQL
        # Note: This requires the supabase client to support raw SQL execution

        # Alternative: Use psycopg2 to execute the SQL directly
        import psycopg2
        from urllib.parse import urlparse

        # Parse the Supabase URL to get connection details
        # Supabase URL format: https://<project-ref>.supabase.co
        # Database URL would be: postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

        # For Supabase, we need to construct the database connection string
        db_password = os.getenv("SUPABASE_DB_PASSWORD")
        if not db_password:
            print("\nWARNING: SUPABASE_DB_PASSWORD not set. Using SERVICE_KEY is not sufficient for direct SQL execution.")
            print("Please set SUPABASE_DB_PASSWORD in your .env file")
            print("\nAlternatively, you can run the SQL migration manually in the Supabase dashboard:")
            print(f"1. Go to https://supabase.com/dashboard")
            print(f"2. Navigate to SQL Editor")
            print(f"3. Copy and paste the contents of: {sql_file}")
            print(f"4. Click 'Run'")
            return False

        # Extract project reference from Supabase URL
        project_ref = supabase_url.replace('https://', '').replace('.supabase.co', '')

        # Construct database connection string
        db_url = f"postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres"

        print(f"Connecting to database...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        # Execute the SQL
        cursor.execute(sql_content)

        print("✅ milestone_progress table created successfully!")

        # Verify the table was created
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'milestone_progress'
            ORDER BY ordinal_position;
        """)

        columns = cursor.fetchall()
        print("\nTable structure:")
        for col_name, data_type in columns:
            print(f"  - {col_name}: {data_type}")

        cursor.close()
        conn.close()

        return True

    except ImportError:
        print("\nERROR: psycopg2 not installed. Install it with: pip install psycopg2-binary")
        print("\nAlternatively, run the SQL migration manually in the Supabase dashboard:")
        print(f"1. Go to https://supabase.com/dashboard")
        print(f"2. Navigate to SQL Editor")
        print(f"3. Copy and paste the contents of: backend/migrations/create_milestone_progress_table.sql")
        print(f"4. Click 'Run'")
        return False

    except Exception as e:
        print(f"\n❌ ERROR: Failed to create table: {e}")
        print("\nYou can run the SQL migration manually in the Supabase dashboard:")
        print(f"1. Go to https://supabase.com/dashboard")
        print(f"2. Navigate to SQL Editor")
        print(f"3. Copy and paste the contents of: backend/migrations/create_milestone_progress_table.sql")
        print(f"4. Click 'Run'")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Setting up milestone_progress table in Supabase")
    print("=" * 60)
    print()

    success = create_milestone_progress_table()

    if success:
        print("\n" + "=" * 60)
        print("✅ Setup completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("⚠️  Setup failed - please run SQL manually")
        print("=" * 60)
