"""
NAV Service for MFAPI Integration
Handles NAV fetching, portfolio updates, and 10% threshold notifications
"""

import aiohttp
import asyncio
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
import os
from supabase import create_client
from decimal import Decimal

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# MFAPI Configuration
MFAPI_BASE_URL = "https://api.mfapi.in/mf"
RATE_LIMIT_DELAY = 0.6  # 600ms delay between requests (100 req/min)
MAX_CONCURRENT_REQUESTS = 5  # Max concurrent API calls


# =======================
# NAV FETCHING
# =======================

async def fetch_latest_nav(scheme_code: str) -> Optional[Dict[str, Any]]:
    """
    Fetch latest NAV from MFAPI for a scheme code

    Args:
        scheme_code: MFAPI scheme code

    Returns:
        Dict with 'nav' and 'date' or None if failed
    """
    if not scheme_code or scheme_code == 'UNKNOWN':
        print(f"[NAV Service] Skipping unknown scheme code")
        return None

    try:
        async with aiohttp.ClientSession() as session:
            url = f"{MFAPI_BASE_URL}/{scheme_code}"

            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status != 200:
                    print(f"[NAV Service] Error fetching NAV for {scheme_code}: HTTP {response.status}")
                    return None

                data = await response.json()

                # Extract latest NAV data
                if 'data' in data and len(data['data']) > 0:
                    latest = data['data'][0]
                    return {
                        'nav': float(latest['nav']),
                        'date': latest['date']
                    }
                else:
                    print(f"[NAV Service] No NAV data for scheme {scheme_code}")
                    return None

    except asyncio.TimeoutError:
        print(f"[NAV Service] Timeout fetching NAV for {scheme_code}")
        return None
    except Exception as e:
        print(f"[NAV Service] Error fetching NAV for {scheme_code}: {str(e)}")
        return None


# =======================
# HOLDING UPDATE
# =======================

async def update_holding_nav(holding_id: str, new_nav: float, nav_date: str) -> Dict[str, Any]:
    """
    Update a single holding with new NAV and check for 10% threshold

    Args:
        holding_id: Holding ID
        new_nav: New NAV value
        nav_date: NAV date (string, e.g., '17-Dec-2025')

    Returns:
        Update statistics dict
    """
    try:
        # Get holding details
        holding = supabase.table('portfolio_holdings').select('*').eq('id', holding_id).execute()

        if not holding.data or len(holding.data) == 0:
            return {'success': False, 'error': 'Holding not found'}

        holding_data = holding.data[0]
        user_id = holding_data['user_id']
        units = float(holding_data['unit_balance'])
        cost_value = float(holding_data['cost_value'])
        old_nav = float(holding_data['current_nav'])
        old_market_value = float(holding_data['market_value'])

        # Calculate new values
        new_market_value = units * new_nav
        absolute_profit = new_market_value - cost_value
        absolute_return_percentage = (absolute_profit / cost_value * 100) if cost_value > 0 else 0

        # Parse nav_date (format: '17-Dec-2025')
        try:
            nav_date_parsed = datetime.strptime(nav_date, '%d-%b-%Y').date()
        except:
            nav_date_parsed = datetime.now().date()

        # Update holding
        supabase.table('portfolio_holdings').update({
            'current_nav': new_nav,
            'nav_date': nav_date_parsed.isoformat(),
            'market_value': new_market_value,
            'absolute_profit': absolute_profit,
            'absolute_return_percentage': absolute_return_percentage,
            'last_updated': datetime.now().isoformat()
        }).eq('id', holding_id).execute()

        # Insert NAV history record
        supabase.table('nav_history').insert({
            'holding_id': holding_id,
            'scheme_code': holding_data['scheme_code'],
            'nav_value': new_nav,
            'nav_date': nav_date_parsed.isoformat(),
            'units': units,
            'market_value': new_market_value,
            'profit_loss': absolute_profit,
            'return_percentage': absolute_return_percentage
        }).execute()

        # Check 10% threshold
        notification_created = False
        if old_market_value > 0:
            change_percentage = ((new_market_value - old_market_value) / old_market_value) * 100

            if abs(change_percentage) >= 10:
                # Create notification
                from .notification_service import create_notification

                notification_type = 'GAIN_10_PERCENT' if change_percentage > 0 else 'LOSS_10_PERCENT'
                title = f"🔔 Portfolio Alert: {abs(change_percentage):.1f}% {'Gain' if change_percentage > 0 else 'Loss'}"
                message = f"Your {holding_data['scheme_name']} has {'increased' if change_percentage > 0 else 'decreased'} by {abs(change_percentage):.1f}%"

                await create_notification(
                    user_id=user_id,
                    holding_id=holding_id,
                    notification_type=notification_type,
                    title=title,
                    message=message,
                    change_data={
                        'folio_number': holding_data['folio_number'],
                        'scheme_name': holding_data['scheme_name'],
                        'change_percentage': change_percentage,
                        'old_value': old_market_value,
                        'new_value': new_market_value
                    }
                )

                notification_created = True
                print(f"[NAV Service] Created notification for {holding_data['scheme_name']}: {change_percentage:.1f}%")

        return {
            'success': True,
            'holding_id': holding_id,
            'old_nav': old_nav,
            'new_nav': new_nav,
            'market_value': new_market_value,
            'notification_created': notification_created
        }

    except Exception as e:
        print(f"[NAV Service] Error updating holding {holding_id}: {str(e)}")
        return {'success': False, 'error': str(e)}


# =======================
# BATCH UPDATE
# =======================

async def batch_update_navs(user_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Batch update NAVs for all active holdings (optionally for specific user)

    Args:
        user_id: Optional user ID (if None, updates all users)

    Returns:
        Statistics dict with update results
    """
    try:
        print(f"[NAV Service] Starting batch NAV update for {'user ' + user_id if user_id else 'all users'}")

        # Get all active holdings
        query = supabase.table('portfolio_holdings').select('*').eq('is_active', True)

        if user_id:
            query = query.eq('user_id', user_id)

        holdings_result = query.execute()
        holdings = holdings_result.data if holdings_result.data else []

        print(f"[NAV Service] Found {len(holdings)} active holdings")

        if len(holdings) == 0:
            return {
                'total_holdings': 0,
                'schemes_updated': 0,
                'schemes_failed': 0,
                'notifications_created': 0
            }

        # Group holdings by scheme_code to avoid duplicate API calls
        schemes_map = {}
        for holding in holdings:
            scheme_code = holding['scheme_code']
            if scheme_code != 'UNKNOWN':
                if scheme_code not in schemes_map:
                    schemes_map[scheme_code] = []
                schemes_map[scheme_code].append(holding)

        print(f"[NAV Service] Fetching NAVs for {len(schemes_map)} unique schemes")

        # Fetch NAVs with rate limiting
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        nav_results = {}

        async def fetch_with_limit(scheme_code):
            async with semaphore:
                await asyncio.sleep(RATE_LIMIT_DELAY)  # Rate limit delay
                nav_data = await fetch_latest_nav(scheme_code)
                return scheme_code, nav_data

        # Fetch all NAVs concurrently (with rate limiting)
        tasks = [fetch_with_limit(code) for code in schemes_map.keys()]
        results = await asyncio.gather(*tasks)

        # Build results map
        for scheme_code, nav_data in results:
            if nav_data:
                nav_results[scheme_code] = nav_data

        print(f"[NAV Service] Successfully fetched {len(nav_results)} NAVs")

        # Update all holdings with new NAVs
        updated_count = 0
        failed_count = 0
        notifications_count = 0

        for scheme_code, nav_data in nav_results.items():
            # Update all holdings for this scheme
            for holding in schemes_map[scheme_code]:
                result = await update_holding_nav(
                    holding_id=holding['id'],
                    new_nav=nav_data['nav'],
                    nav_date=nav_data['date']
                )

                if result.get('success'):
                    updated_count += 1
                    if result.get('notification_created'):
                        notifications_count += 1
                else:
                    failed_count += 1

        # Update mutual_funds_value for all affected users
        affected_users = set(h['user_id'] for h in holdings)
        for user_id_to_sync in affected_users:
            await sync_mutual_funds_value(user_id_to_sync)

        stats = {
            'total_holdings': len(holdings),
            'unique_schemes': len(schemes_map),
            'schemes_updated': len(nav_results),
            'schemes_failed': len(schemes_map) - len(nav_results),
            'holdings_updated': updated_count,
            'holdings_failed': failed_count,
            'notifications_created': notifications_count,
            'users_affected': len(affected_users)
        }

        print(f"[NAV Service] Batch update complete: {stats}")
        return stats

    except Exception as e:
        print(f"[NAV Service] Error in batch update: {str(e)}")
        raise


# =======================
# NET WORTH SYNC
# =======================

async def sync_mutual_funds_value(user_id: str):
    """
    Sync mutual_funds_value in assets_liabilities table after NAV update

    Args:
        user_id: User ID
    """
    try:
        # Get total market value of all active holdings
        holdings = supabase.table('portfolio_holdings').select('market_value').eq('user_id', user_id).eq('is_active', True).execute()

        if holdings.data:
            total_mf_value = sum(h['market_value'] for h in holdings.data)
        else:
            total_mf_value = 0

        # Update assets_liabilities table
        result = supabase.table('assets_liabilities').update({
            'mutual_funds_value': total_mf_value,
            'updated_at': datetime.now().isoformat()
        }).eq('user_id', user_id).execute()

        if result.data:
            print(f"[NAV Service] Synced mutual_funds_value for user {user_id}: ₹{total_mf_value:,.2f}")
        else:
            print(f"[NAV Service] No assets_liabilities record found for user {user_id}")

    except Exception as e:
        print(f"[NAV Service] Error syncing mutual_funds_value: {str(e)}")


# Export functions
__all__ = ['fetch_latest_nav', 'update_holding_nav', 'batch_update_navs', 'sync_mutual_funds_value']
