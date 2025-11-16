#!/usr/bin/env python3
"""Transfer data from wrong user to correct user"""

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
print(f"TRANSFERRING DATA FROM WRONG USER TO CORRECT USER")
print("=" * 80)

print(f"\nFrom: {WRONG_USER_ID}")
print(f"To: {CORRECT_USER_ID}")

# Step 1: Get the personal_info record from WRONG user
print("\n--- Step 1: Getting personal_info from WRONG user ---")
wrong_pi = supabase.from_("personal_info").select("*").eq("user_id", WRONG_USER_ID).execute()

if not wrong_pi.data:
    print("ERROR: No personal_info found for WRONG user")
    exit(1)

wrong_pi_data = wrong_pi.data[0]
wrong_pi_id = wrong_pi_data['id']
print(f"Found personal_info ID: {wrong_pi_id}")
print(f"  Name: {wrong_pi_data['name']}")
print(f"  Age: {wrong_pi_data['age']}")
print(f"  Salary: Rs.{wrong_pi_data['monthly_salary']:,.0f}")
print(f"  Expenses: Rs.{wrong_pi_data['monthly_expenses']:,.0f}")

# Step 2: Get assets/liabilities from WRONG user
print("\n--- Step 2: Getting assets/liabilities from WRONG user ---")
wrong_assets = supabase.from_("assets_liabilities").select("*").eq("personal_info_id", wrong_pi_id).execute()

if not wrong_assets.data:
    print("ERROR: No assets_liabilities found")
    exit(1)

wrong_assets_data = wrong_assets.data[0]
wrong_assets_id = wrong_assets_data['id']
print(f"Found assets_liabilities ID: {wrong_assets_id}")
print(f"  Assets Detail: {json.dumps(wrong_assets_data.get('assets_detail', {}), indent=2)[:200]}...")
print(f"  Liabilities Detail: {json.dumps(wrong_assets_data.get('liabilities_detail', {}), indent=2)[:200]}...")

# Step 3: Get goals from WRONG user
print("\n--- Step 3: Getting goals from WRONG user ---")
wrong_goals = supabase.from_("goals").select("*").eq("personal_info_id", wrong_pi_id).execute()
print(f"Found {len(wrong_goals.data)} goals")
for goal in wrong_goals.data:
    print(f"  - {goal['name']}: Rs.{goal['amount']:,.0f} in {goal['years']} years ({goal['goal_type']})")

# Step 4: Get risk_appetite from WRONG user
print("\n--- Step 4: Getting risk_appetite from WRONG user ---")
wrong_risk = supabase.from_("risk_appetite").select("*").eq("personal_info_id", wrong_pi_id).execute()
wrong_risk_data = wrong_risk.data[0] if wrong_risk.data else None

# Step 5: Check if CORRECT user has personal_info
print(f"\n--- Step 5: Checking CORRECT user's existing data ---")
correct_pi = supabase.from_("personal_info").select("*").eq("user_id", CORRECT_USER_ID).execute()

if correct_pi.data:
    correct_pi_id = correct_pi.data[0]['id']
    print(f"CORRECT user already has personal_info ID: {correct_pi_id}")
    print(f"  Existing Name: {correct_pi.data[0]['name']}")
    print(f"  Existing Salary: Rs.{correct_pi.data[0]['monthly_salary']:,.0f}")
else:
    print("CORRECT user has NO personal_info yet")
    correct_pi_id = None

# Step 6: Transfer the data
print(f"\n--- Step 6: Transferring Data to CORRECT User ---")
print("\nWARNING: This will UPDATE/REPLACE data for the CORRECT user!")
print(f"Confirm transfer from {WRONG_USER_ID} to {CORRECT_USER_ID}?")
confirm = input("Type 'YES' to proceed: ")

if confirm != 'YES':
    print("Transfer cancelled")
    exit(0)

# Transfer personal_info
print("\nTransferring personal_info...")
personal_info_data = {
    "user_id": CORRECT_USER_ID,
    "name": wrong_pi_data['name'],
    "age": wrong_pi_data['age'],
    "monthly_salary": wrong_pi_data['monthly_salary'],
    "monthly_expenses": wrong_pi_data['monthly_expenses'],
}

if correct_pi_id:
    # Update existing
    supabase.from_("personal_info").update(personal_info_data).eq("id", correct_pi_id).execute()
    print(f"  Updated personal_info ID: {correct_pi_id}")
    new_pi_id = correct_pi_id
else:
    # Insert new
    result = supabase.from_("personal_info").insert(personal_info_data).execute()
    new_pi_id = result.data[0]['id']
    print(f"  Created personal_info ID: {new_pi_id}")

# Transfer assets/liabilities
print("\nTransferring assets/liabilities...")
assets_data = {
    "user_id": CORRECT_USER_ID,
    "personal_info_id": new_pi_id,
    "real_estate_value": wrong_assets_data['real_estate_value'],
    "gold_value": wrong_assets_data['gold_value'],
    "mutual_funds_value": wrong_assets_data['mutual_funds_value'],
    "epf_balance": wrong_assets_data['epf_balance'],
    "ppf_balance": wrong_assets_data['ppf_balance'],
    "home_loan": wrong_assets_data['home_loan'],
    "car_loan": wrong_assets_data['car_loan'],
    "personal_loan": wrong_assets_data['personal_loan'],
    "other_loans": wrong_assets_data['other_loans'],
    "assets_detail": wrong_assets_data.get('assets_detail'),
    "liabilities_detail": wrong_assets_data.get('liabilities_detail'),
}

# Check if assets already exist
existing_assets = supabase.from_("assets_liabilities").select("id").eq("personal_info_id", new_pi_id).execute()
if existing_assets.data:
    # Update
    supabase.from_("assets_liabilities").update(assets_data).eq("id", existing_assets.data[0]['id']).execute()
    print(f"  Updated assets_liabilities")
else:
    # Insert
    supabase.from_("assets_liabilities").insert(assets_data).execute()
    print(f"  Created assets_liabilities")

# Transfer risk_appetite
if wrong_risk_data:
    print("\nTransferring risk_appetite...")
    risk_data = {
        "user_id": CORRECT_USER_ID,
        "personal_info_id": new_pi_id,
        "risk_tolerance": wrong_risk_data['risk_tolerance'],
        "inflation_rate": wrong_risk_data.get('inflation_rate', 5),
        "retirement_age": wrong_risk_data.get('retirement_age', 55),
        "risk_question1": wrong_risk_data.get('risk_question1'),
        "risk_question2": wrong_risk_data.get('risk_question2'),
    }

    existing_risk = supabase.from_("risk_appetite").select("id").eq("personal_info_id", new_pi_id).execute()
    if existing_risk.data:
        supabase.from_("risk_appetite").update(risk_data).eq("id", existing_risk.data[0]['id']).execute()
        print(f"  Updated risk_appetite")
    else:
        supabase.from_("risk_appetite").insert(risk_data).execute()
        print(f"  Created risk_appetite")

# Transfer goals
print(f"\nTransferring {len(wrong_goals.data)} goals...")
# Delete existing goals for CORRECT user
supabase.from_("goals").delete().eq("personal_info_id", new_pi_id).execute()
print(f"  Deleted old goals")

# Insert new goals
for goal in wrong_goals.data:
    goal_data = {
        "user_id": CORRECT_USER_ID,
        "personal_info_id": new_pi_id,
        "name": goal['name'],
        "amount": goal['amount'],
        "years": goal['years'],
        "goal_type": goal['goal_type'],
    }
    supabase.from_("goals").insert(goal_data).execute()
    print(f"  Inserted goal: {goal['name']}")

print("\n" + "=" * 80)
print("DATA TRANSFER COMPLETE!")
print("=" * 80)

print(f"\nYour data is now correctly associated with user: {CORRECT_USER_ID}")
print(f"\nPlease refresh your app to see the updated data.")

# Optionally, clean up the WRONG user's data
print("\n--- Optional: Clean up WRONG user data? ---")
print(f"This will DELETE all data for user {WRONG_USER_ID}")
cleanup = input("Type 'DELETE' to remove wrong user data: ")

if cleanup == 'DELETE':
    print("\nDeleting WRONG user data...")
    supabase.from_("goals").delete().eq("personal_info_id", wrong_pi_id).execute()
    print("  Deleted goals")
    supabase.from_("risk_appetite").delete().eq("personal_info_id", wrong_pi_id).execute()
    print("  Deleted risk_appetite")
    supabase.from_("assets_liabilities").delete().eq("personal_info_id", wrong_pi_id).execute()
    print("  Deleted assets_liabilities")
    supabase.from_("personal_info").delete().eq("id", wrong_pi_id).execute()
    print("  Deleted personal_info")
    print("\nCleanup complete!")
else:
    print("\nSkipped cleanup - data remains in WRONG user account")
