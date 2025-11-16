#!/usr/bin/env python3
"""Check audit logs and data history"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables
load_dotenv('backend/.env')

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

USER_ID = '711a5a16-5881-49fc-8929-99518ba35cf4'

print("=" * 80)
print(f"INVESTIGATING DATA LOSS FOR USER: {USER_ID}")
print("=" * 80)

# Check audit logs table
print("\n--- CHECKING AUDIT LOGS ---")
try:
    audit_logs = supabase.from_("audit_logs").select("*").eq("user_id", USER_ID).order("created_at", desc=True).limit(50).execute()

    if audit_logs.data:
        print(f"\nFound {len(audit_logs.data)} audit log entries:")
        for idx, log in enumerate(audit_logs.data[:10], 1):  # Show last 10
            print(f"\n  Entry #{idx}:")
            print(f"    Action: {log.get('action')}")
            print(f"    Table: {log.get('table_name')}")
            print(f"    Details: {log.get('details')}")
            print(f"    Timestamp: {log.get('created_at')}")
    else:
        print("  No audit logs found")
except Exception as e:
    print(f"  Error checking audit logs: {e}")

# Check all tables for this user and their timestamps
print("\n--- CHECKING TABLE TIMESTAMPS ---")

tables_to_check = [
    ('users', 'id'),
    ('profiles', 'id'),
    ('personal_info', 'user_id'),
    ('assets_liabilities', None),  # Will need to join through personal_info
    ('goals', None),  # Will need to join through personal_info
    ('risk_assessments', 'user_id'),
    ('sip_planner_data', 'user_id')
]

for table_name, id_column in tables_to_check:
    print(f"\n  {table_name}:")
    try:
        if id_column:
            result = supabase.from_(table_name).select("created_at, updated_at").eq(id_column, USER_ID).execute()
        else:
            # For tables that need personal_info_id
            personal_info = supabase.from_("personal_info").select("id").eq("user_id", USER_ID).execute()
            if personal_info.data:
                personal_info_id = personal_info.data[0]['id']
                result = supabase.from_(table_name).select("created_at, updated_at").eq("personal_info_id", personal_info_id).execute()
            else:
                print("    No personal_info found, skipping")
                continue

        if result.data:
            for record in result.data:
                print(f"    Created: {record.get('created_at')}")
                print(f"    Updated: {record.get('updated_at')}")
        else:
            print("    No records found")
    except Exception as e:
        print(f"    Error: {e}")

# Check if there are any recent DELETE operations in PostgreSQL logs
print("\n--- CHECKING FOR RECENT DATA MODIFICATIONS ---")
try:
    # Check personal_info table specifically
    personal_info = supabase.from_("personal_info").select("*").eq("user_id", USER_ID).execute()

    if personal_info.data:
        pi = personal_info.data[0]
        print(f"\n  Personal Info Record:")
        print(f"    ID: {pi.get('id')}")
        print(f"    Created: {pi.get('created_at')}")
        print(f"    Updated: {pi.get('updated_at')}")
        print(f"    Has Data: Salary={pi.get('monthly_salary')}, Expenses={pi.get('monthly_expenses')}")

        # Check assets_liabilities
        personal_info_id = pi.get('id')
        assets = supabase.from_("assets_liabilities").select("*").eq("personal_info_id", personal_info_id).execute()

        if assets.data:
            asset = assets.data[0]
            print(f"\n  Assets/Liabilities Record:")
            print(f"    ID: {asset.get('id')}")
            print(f"    Created: {asset.get('created_at')}")
            print(f"    Updated: {asset.get('updated_at')}")
            print(f"    Liquid Assets: {asset.get('liquid_assets')}")
            print(f"    Illiquid Assets: {asset.get('illiquid_assets')}")
            print(f"    Liabilities: {asset.get('liabilities')}")
except Exception as e:
    print(f"  Error: {e}")

# List ALL users to see if there's another account with data
print("\n--- CHECKING ALL USERS FOR DATA ---")
try:
    all_personal_info = supabase.from_("personal_info").select("user_id, monthly_salary, monthly_expenses, created_at").execute()

    print(f"\nFound {len(all_personal_info.data)} personal_info records:")
    for idx, pi in enumerate(all_personal_info.data, 1):
        user_id = pi.get('user_id')

        # Check if this user has any assets
        assets = supabase.from_("assets_liabilities").select("liquid_assets, illiquid_assets").eq("personal_info_id", pi.get('id') if 'id' in str(pi) else None).execute()

        has_assets = False
        if assets.data and len(assets.data) > 0:
            liquid = assets.data[0].get('liquid_assets', {})
            illiquid = assets.data[0].get('illiquid_assets', {})
            if liquid or illiquid:
                total_liquid = sum(liquid.values()) if liquid else 0
                total_illiquid = sum(illiquid.values()) if illiquid else 0
                if total_liquid > 0 or total_illiquid > 0:
                    has_assets = True
                    print(f"\n  User #{idx}: {user_id}")
                    print(f"    Salary: Rs.{pi.get('monthly_salary', 0):,.0f}")
                    print(f"    Liquid Assets: Rs.{total_liquid:,.0f}")
                    print(f"    Illiquid Assets: Rs.{total_illiquid:,.0f}")
                    print(f"    Created: {pi.get('created_at')}")

except Exception as e:
    print(f"  Error: {e}")

print("\n" + "=" * 80)
print("INVESTIGATION COMPLETE")
print("=" * 80)
