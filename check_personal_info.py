#!/usr/bin/env python3
"""Check personal_info table in detail"""

import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('backend/.env')

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

USER_ID = '711a5a16-5881-49fc-8929-99518ba35cf4'

print("=" * 80)
print(f"CHECKING PERSONAL_INFO TABLE FOR USER: {USER_ID}")
print("=" * 80)

# Get ALL data from personal_info table
personal_info = supabase.from_("personal_info").select("*").eq("user_id", USER_ID).execute()

if personal_info.data:
    print(f"\nFound {len(personal_info.data)} record(s):\n")
    for idx, record in enumerate(personal_info.data, 1):
        print(f"Record #{idx}:")
        print(json.dumps(record, indent=2, default=str))
        print("\n" + "-" * 80)
else:
    print("No personal_info records found")

# Also check if there are multiple personal_info records for this user
print("\n--- CHECKING ALL PERSONAL_INFO RECORDS FOR THIS USER ---")
all_records = supabase.from_("personal_info").select("*").eq("user_id", USER_ID).execute()
print(f"\nTotal records for this user: {len(all_records.data) if all_records.data else 0}")

# Get the schema columns
print("\n--- GETTING TABLE COLUMNS ---")
result = supabase.table("personal_info").select("*").limit(1).execute()
if result.data and len(result.data) > 0:
    print("\nColumns in personal_info table:")
    for key in sorted(result.data[0].keys()):
        print(f"  - {key}")

print("\n" + "=" * 80)
