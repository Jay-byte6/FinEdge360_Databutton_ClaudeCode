#!/usr/bin/env python3
"""Compare financial data between two user IDs"""

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

USER_IDS = {
    'User A (0b31...)': '0b31f49f-f5cb-4bb3-88da-de9323705866',
    'User B (711a...) - jsjaiho5@gmail.com': '711a5a16-5881-49fc-8929-99518ba35cf4'
}

def get_user_data(user_id, user_label):
    print(f"\n{'=' * 80}")
    print(f"DATA FOR {user_label}")
    print(f"User ID: {user_id}")
    print('=' * 80)

    # Personal Info
    print("\n--- PERSONAL INFO ---")
    personal_info = supabase.from_("personal_info").select("*").eq("user_id", user_id).execute()
    if personal_info.data:
        pi = personal_info.data[0]
        print(f"  Personal Info ID: {pi.get('id')}")
        print(f"  Age: {pi.get('age')}")
        print(f"  City: {pi.get('city')}")
        print(f"  Monthly Salary: Rs.{pi.get('monthly_salary', 0):,.0f}")
        print(f"  Monthly Expenses: Rs.{pi.get('monthly_expenses', 0):,.0f}")
        print(f"  Savings Rate: {pi.get('savings_rate', 0)}%")
        print(f"  Current Age: {pi.get('current_age')}")
        print(f"  Retirement Age: {pi.get('retirement_age')}")
        personal_info_id = pi.get('id')
    else:
        print("  No personal info found")
        return

    # Assets & Liabilities
    print("\n--- ASSETS & LIABILITIES ---")
    assets = supabase.from_("assets_liabilities").select("*").eq("personal_info_id", personal_info_id).execute()
    if assets.data:
        asset_data = assets.data[0]

        # Liquid Assets
        liquid = asset_data.get('liquid_assets', {})
        print(f"\n  Liquid Assets:")
        print(f"    Liquid Savings/Cash: Rs.{liquid.get('liquid_savings_cash', 0):,.0f}")
        print(f"    Fixed Deposit: Rs.{liquid.get('fixed_deposit', 0):,.0f}")
        print(f"    Domestic Stock Market: Rs.{liquid.get('domestic_stock_market', 0):,.0f}")
        print(f"    Domestic Equity MF: Rs.{liquid.get('domestic_equity_mutual_funds', 0):,.0f}")
        print(f"    Debt Funds: Rs.{liquid.get('debt_funds', 0):,.0f}")
        print(f"    Gold ETF: Rs.{liquid.get('gold_etf_digital_gold', 0):,.0f}")
        print(f"    REITs: Rs.{liquid.get('reits', 0):,.0f}")
        print(f"    Crypto: Rs.{liquid.get('crypto', 0):,.0f}")
        print(f"    Cash from Equity MF: Rs.{liquid.get('cash_from_equity_mutual_funds', 0):,.0f}")

        # Illiquid Assets
        illiquid = asset_data.get('illiquid_assets', {})
        print(f"\n  Illiquid Assets:")
        print(f"    EPF/PPF/VPF: Rs.{illiquid.get('epf_ppf_vpf', 0):,.0f}")
        print(f"    Gratuity: Rs.{illiquid.get('gratuity', 0):,.0f}")
        print(f"    ULIPs: Rs.{illiquid.get('ulips', 0):,.0f}")
        print(f"    SGB: Rs.{illiquid.get('sgb', 0):,.0f}")
        print(f"    Gold Jewellery: Rs.{illiquid.get('gold_jewellery', 0):,.0f}")
        print(f"    Real Estate (Self): Rs.{illiquid.get('real_estate_self_occupied', 0):,.0f}")
        print(f"    Real Estate (Rented): Rs.{illiquid.get('real_estate_rented', 0):,.0f}")
        print(f"    Vehicle: Rs.{illiquid.get('vehicle', 0):,.0f}")
        print(f"    Others: Rs.{illiquid.get('other_illiquid_assets', 0):,.0f}")

        # Liabilities
        liabilities = asset_data.get('liabilities', {})
        print(f"\n  Liabilities:")
        print(f"    Home Loan: Rs.{liabilities.get('home_loan', 0):,.0f}")
        print(f"    Car Loan: Rs.{liabilities.get('car_loan', 0):,.0f}")
        print(f"    Personal Loan: Rs.{liabilities.get('personal_loan', 0):,.0f}")
        print(f"    Credit Card: Rs.{liabilities.get('credit_card_outstanding', 0):,.0f}")
        print(f"    Education Loan: Rs.{liabilities.get('education_loan', 0):,.0f}")
        print(f"    Other Loans: Rs.{liabilities.get('other_loans', 0):,.0f}")

        # Calculate totals
        total_liquid = sum(liquid.values()) if liquid else 0
        total_illiquid = sum(illiquid.values()) if illiquid else 0
        total_liabilities = sum(liabilities.values()) if liabilities else 0
        net_worth = total_liquid + total_illiquid - total_liabilities

        print(f"\n  TOTALS:")
        print(f"    Total Liquid Assets: Rs.{total_liquid:,.0f}")
        print(f"    Total Illiquid Assets: Rs.{total_illiquid:,.0f}")
        print(f"    Total Assets: Rs.{total_liquid + total_illiquid:,.0f}")
        print(f"    Total Liabilities: Rs.{total_liabilities:,.0f}")
        print(f"    NET WORTH: Rs.{net_worth:,.0f}")
    else:
        print("  No assets/liabilities found")

    # Goals
    print("\n--- GOALS ---")
    goals = supabase.from_("goals").select("*").eq("personal_info_id", personal_info_id).execute()
    if goals.data:
        print(f"  Total Goals: {len(goals.data)}")
        for idx, goal in enumerate(goals.data, 1):
            print(f"\n  Goal #{idx}:")
            print(f"    Name: {goal.get('goal_name')}")
            print(f"    Type: {goal.get('goal_type')}")
            print(f"    Amount: Rs.{goal.get('goal_amount', 0):,.0f}")
            print(f"    Years: {goal.get('years_to_goal')}")
            print(f"    Priority: {goal.get('priority')}")
    else:
        print("  No goals found")

    # Risk Assessment
    print("\n--- RISK ASSESSMENT ---")
    risk = supabase.from_("risk_assessments").select("*").eq("user_id", user_id).execute()
    if risk.data:
        risk_data = risk.data[0]
        print(f"  Risk Score: {risk_data.get('risk_score')}")
        print(f"  Risk Category: {risk_data.get('risk_category')}")
        print(f"  Created: {risk_data.get('created_at')}")
    else:
        print("  No risk assessment found")

    # SIP Planner
    print("\n--- SIP PLANNER ---")
    sip = supabase.from_("sip_planner_data").select("*").eq("user_id", user_id).execute()
    if sip.data:
        sip_data = sip.data[0]
        goals = sip_data.get('goals', [])
        print(f"  Total SIP Goals: {len(goals)}")
        for idx, goal in enumerate(goals, 1):
            print(f"\n  SIP Goal #{idx}:")
            print(f"    Name: {goal.get('name')}")
            print(f"    Amount Required Today: Rs.{goal.get('amountRequiredToday', 0):,.0f}")
            print(f"    Amount Available Today: Rs.{goal.get('amountAvailableToday', 0):,.0f}")
            print(f"    Time (Years): {goal.get('timeYears')}")
            print(f"    Goal Inflation: {goal.get('goalInflation')}%")
            print(f"    Step Up: {goal.get('stepUp')}%")
            print(f"    SIP Required: Rs.{goal.get('sipRequired', 0):,.0f}")
    else:
        print("  No SIP planner data found")

# Compare both users
for label, user_id in USER_IDS.items():
    get_user_data(user_id, label)

print(f"\n{'=' * 80}")
print("COMPARISON COMPLETE")
print('=' * 80)
