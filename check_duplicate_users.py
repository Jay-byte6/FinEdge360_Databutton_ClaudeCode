#!/usr/bin/env python3
"""Check for duplicate user records in Supabase"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('backend/.env')

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("CHECKING FOR DUPLICATE USERS FOR: jsjaiho5@gmail.com")
print("=" * 80)

# Query auth.users table for all users with this email
try:
    # Note: We can't directly query auth.users, so let's check the users table
    users_response = supabase.from_("users").select("*").execute()

    print(f"\nTotal users in 'users' table: {len(users_response.data)}")
    print("\n" + "-" * 80)

    # Filter for jsjaiho5@gmail.com
    matching_users = [u for u in users_response.data if u.get('email', '').lower() == 'jsjaiho5@gmail.com']

    print(f"\nUsers with email 'jsjaiho5@gmail.com': {len(matching_users)}")

    for idx, user in enumerate(matching_users, 1):
        print(f"\n  User #{idx}:")
        print(f"    ID: {user.get('id')}")
        print(f"    Email: {user.get('email')}")
        print(f"    Created: {user.get('created_at')}")
        print(f"    Updated: {user.get('updated_at')}")

    # Check profiles table
    print("\n" + "=" * 80)
    print("CHECKING PROFILES TABLE")
    print("=" * 80)

    for user_id in ['0b31f49f-f5cb-4bb3-88da-de9323705866', '711a5a16-5881-49fc-8929-99518ba35cf4']:
        profile_response = supabase.from_("profiles").select("*").eq("id", user_id).execute()
        print(f"\n  Profile for user {user_id}:")
        if profile_response.data:
            print(f"    {profile_response.data[0]}")
        else:
            print("    No profile found")

    # Check personal_info table
    print("\n" + "=" * 80)
    print("CHECKING PERSONAL_INFO TABLE")
    print("=" * 80)

    for user_id in ['0b31f49f-f5cb-4bb3-88da-de9323705866', '711a5a16-5881-49fc-8929-99518ba35cf4']:
        personal_info_response = supabase.from_("personal_info").select("*").eq("user_id", user_id).execute()
        print(f"\n  Personal Info for user {user_id}:")
        if personal_info_response.data:
            for record in personal_info_response.data:
                print(f"    ID: {record.get('id')}")
                print(f"    Monthly Salary: Rs.{record.get('monthly_salary', 0):,.0f}")
                print(f"    Monthly Expenses: Rs.{record.get('monthly_expenses', 0):,.0f}")
                print(f"    Age: {record.get('age')}")
                print(f"    City: {record.get('city')}")
        else:
            print("    No personal info found")

except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
