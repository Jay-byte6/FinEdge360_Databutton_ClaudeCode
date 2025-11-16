#!/usr/bin/env python3
"""Check raw data from assets_liabilities table"""

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
print(f"CHECKING RAW DATA FOR USER: {USER_ID}")
print("=" * 80)

# Get personal_info_id
personal_info = supabase.from_("personal_info").select("id").eq("user_id", USER_ID).execute()
if not personal_info.data:
    print("No personal info found")
    exit()

personal_info_id = personal_info.data[0]['id']
print(f"\nPersonal Info ID: {personal_info_id}")

# Get raw assets_liabilities data
print("\n--- ASSETS_LIABILITIES TABLE ---")
assets = supabase.from_("assets_liabilities").select("*").eq("personal_info_id", personal_info_id).execute()

if assets.data:
    print(f"\nFound {len(assets.data)} record(s):\n")
    for record in assets.data:
        print(json.dumps(record, indent=2, default=str))
else:
    print("No assets/liabilities records found")

# Get raw goals data
print("\n--- GOALS TABLE ---")
goals = supabase.from_("goals").select("*").eq("personal_info_id", personal_info_id).execute()

if goals.data:
    print(f"\nFound {len(goals.data)} record(s):\n")
    for idx, record in enumerate(goals.data, 1):
        print(f"Goal #{idx}:")
        print(json.dumps(record, indent=2, default=str))
        print()
else:
    print("No goals records found")

# Get raw risk_appetite data
print("\n--- RISK_APPETITE TABLE ---")
risk = supabase.from_("risk_appetite").select("*").eq("personal_info_id", personal_info_id).execute()

if risk.data:
    print(f"\nFound {len(risk.data)} record(s):\n")
    for record in risk.data:
        print(json.dumps(record, indent=2, default=str))
else:
    print("No risk_appetite records found")

print("\n" + "=" * 80)
