"""
Fetch complete list of mutual fund schemes from MFAPI
Run this script once to populate the scheme_master table
Then optionally schedule weekly to refresh

Usage: python backend/app/tasks/fetch_scheme_list.py
"""

import asyncio
import aiohttp
from datetime import datetime
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Load environment variables from .env file
import dotenv
env_path = Path(__file__).parent.parent.parent / '.env'
dotenv.load_dotenv(env_path)

from supabase import create_client, Client

MFAPI_BASE_URL = "https://api.mfapi.in/mf"

async def fetch_all_schemes():
    """Fetch complete list of mutual fund schemes from MFAPI"""

    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
        return

    supabase: Client = create_client(supabase_url, supabase_key)

    print(f"[Scheme Fetch] Starting at {datetime.now()}")

    async with aiohttp.ClientSession() as session:
        try:
            # Fetch complete scheme list from MFAPI
            print("[Scheme Fetch] Fetching scheme list from MFAPI...")
            async with session.get(MFAPI_BASE_URL) as response:
                if response.status != 200:
                    print(f"[ERROR] MFAPI returned status {response.status}")
                    return

                schemes = await response.json()
                print(f"[Scheme Fetch] Found {len(schemes)} schemes")

                # Insert into database in batches
                batch_size = 100
                total_inserted = 0
                total_updated = 0

                for i in range(0, len(schemes), batch_size):
                    batch = schemes[i:i+batch_size]
                    records = []

                    for scheme in batch:
                        # Extract scheme details
                        scheme_code = str(scheme.get('schemeCode', ''))
                        scheme_name = scheme.get('schemeName', '')

                        if not scheme_code or not scheme_name:
                            continue

                        records.append({
                            'scheme_code': scheme_code,
                            'scheme_name': scheme_name,
                            'is_active': True,
                            'last_updated': datetime.now().isoformat()
                        })

                    if records:
                        # Upsert to handle duplicates
                        result = supabase.table('scheme_master').upsert(
                            records,
                            on_conflict='scheme_code'
                        ).execute()

                        batch_num = i // batch_size + 1
                        total_batches = (len(schemes) + batch_size - 1) // batch_size
                        print(f"[Scheme Fetch] Batch {batch_num}/{total_batches}: Inserted {len(records)} schemes")
                        total_inserted += len(records)

                print(f"[Scheme Fetch] ✅ Completed!")
                print(f"[Scheme Fetch] Total schemes processed: {total_inserted}")

                # Verify count in database
                count_result = supabase.table('scheme_master').select('id', count='exact').execute()
                db_count = count_result.count if hasattr(count_result, 'count') else 0
                print(f"[Scheme Fetch] Total schemes in database: {db_count}")

        except Exception as e:
            print(f"[ERROR] Scheme fetch failed: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("MFAPI Scheme List Fetcher")
    print("=" * 60)
    asyncio.run(fetch_all_schemes())
    print("=" * 60)
