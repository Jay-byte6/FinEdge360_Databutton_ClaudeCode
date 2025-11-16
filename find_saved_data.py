#!/usr/bin/env python3
"""Find where the data was actually saved"""

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

WRONG_USER_ID = '25e8b401-7fc4-4637-82e6-c574129fae82'
CORRECT_USER_ID = '711a5a16-5881-49fc-8929-99518ba35cf4'

print("=" * 80)
print(f"FINDING YOUR SAVED DATA")
print("=" * 80)

print(f"\nData was saved to user: {WRONG_USER_ID}")
print(f"Should be in user: {CORRECT_USER_ID}")

# Get personal_info for the WRONG user (where data was saved)
personal_info = supabase.from_("personal_info").select("*").eq("user_id", WRONG_USER_ID).execute()

if personal_info.data:
    print(f"\n--- PERSONAL INFO (saved to WRONG user) ---")
    pi = personal_info.data[0]
    print(json.dumps(pi, indent=2, default=str))

    personal_info_id = pi['id']

    # Get assets
    print(f"\n--- ASSETS/LIABILITIES (saved to WRONG user) ---")
    assets = supabase.from_("assets_liabilities").select("*").eq("personal_info_id", personal_info_id).execute()
    if assets.data:
        print(json.dumps(assets.data[0], indent=2, default=str))

    # Get goals
    print(f"\n--- GOALS (saved to WRONG user) ---")
    goals = supabase.from_("goals").select("*").eq("personal_info_id", personal_info_id).execute()
    if goals.data:
        for idx, goal in enumerate(goals.data, 1):
            print(f"\nGoal #{idx}:")
            print(json.dumps(goal, indent=2, default=str))

print("\n" + "=" * 80)
