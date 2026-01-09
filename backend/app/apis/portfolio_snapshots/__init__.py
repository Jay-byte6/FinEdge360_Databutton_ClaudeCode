from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import os
from supabase import create_client
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

router = APIRouter(prefix="/routes")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Portfolio Snapshots - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Portfolio Snapshots - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Portfolio snapshots operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for portfolio_snapshots operations")


class PortfolioSnapshot(BaseModel):
    user_id: str
    snapshot_date: str  # ISO date format YYYY-MM-DD
    total_investment: float
    current_value: float
    total_profit: float
    overall_return: float
    holdings_count: int
    holdings_details: Optional[Dict[str, Any]] = None


class SnapshotResponse(BaseModel):
    user_id: str
    snapshot_date: str
    total_investment: float
    current_value: float
    total_profit: float
    overall_return: float
    holdings_count: int
    created_at: str


@router.post("/portfolio-snapshots")
async def save_portfolio_snapshot(
    snapshot: PortfolioSnapshot,
    current_user: User = Depends(get_authorized_user)
):
    """
    Save or update a daily portfolio snapshot
    Uses UPSERT to avoid duplicates (one snapshot per user per day)
    """
    # SECURITY: Verify user can only save their own snapshots
    snapshot.user_id = sanitize_user_id(snapshot.user_id)
    verify_user_ownership(current_user, snapshot.user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Prepare snapshot data
        snapshot_data = {
            "user_id": snapshot.user_id,
            "snapshot_date": snapshot.snapshot_date,
            "total_investment": snapshot.total_investment,
            "current_value": snapshot.current_value,
            "total_profit": snapshot.total_profit,
            "overall_return": snapshot.overall_return,
            "holdings_count": snapshot.holdings_count,
            "holdings_details": snapshot.holdings_details,
            "updated_at": datetime.utcnow().isoformat()
        }

        # Check if snapshot already exists for today
        existing = supabase.table("portfolio_daily_snapshots")\
            .select("*")\
            .eq("user_id", snapshot.user_id)\
            .eq("snapshot_date", snapshot.snapshot_date)\
            .execute()

        if existing.data and len(existing.data) > 0:
            # Update existing snapshot
            response = supabase.table("portfolio_daily_snapshots")\
                .update(snapshot_data)\
                .eq("user_id", snapshot.user_id)\
                .eq("snapshot_date", snapshot.snapshot_date)\
                .execute()

            print(f"[OK] Updated portfolio snapshot for user {snapshot.user_id} on {snapshot.snapshot_date}")
        else:
            # Insert new snapshot
            response = supabase.table("portfolio_daily_snapshots")\
                .insert(snapshot_data)\
                .execute()

            print(f"[OK] Created portfolio snapshot for user {snapshot.user_id} on {snapshot.snapshot_date}")

        return {
            "success": True,
            "message": "Portfolio snapshot saved successfully",
            "snapshot_date": snapshot.snapshot_date,
            "data": response.data[0] if response.data else None
        }

    except Exception as e:
        print(f"[ERROR] Failed to save portfolio snapshot: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save snapshot: {str(e)}")


@router.get("/portfolio-snapshots/{user_id}")
async def get_portfolio_snapshots(
    user_id: str,
    days: Optional[int] = 30,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get portfolio snapshots for a user

    Parameters:
    - user_id: User ID
    - days: Number of days to retrieve (default 30)
    - start_date: Optional start date (YYYY-MM-DD)
    - end_date: Optional end date (YYYY-MM-DD)
    """
    # SECURITY: Verify user can only access their own snapshots
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Build query
        query = supabase.table("portfolio_daily_snapshots")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("snapshot_date", desc=True)

        # Apply date filters
        if start_date and end_date:
            query = query.gte("snapshot_date", start_date).lte("snapshot_date", end_date)
        elif days:
            cutoff_date = (date.today() - timedelta(days=days)).isoformat()
            query = query.gte("snapshot_date", cutoff_date)

        response = query.execute()

        return {
            "success": True,
            "user_id": user_id,
            "snapshots": response.data if response.data else [],
            "count": len(response.data) if response.data else 0
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch portfolio snapshots for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch snapshots: {str(e)}")


@router.get("/portfolio-snapshots/{user_id}/daily-change")
async def get_daily_change(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get the daily change in portfolio value (today vs yesterday)
    """
    # SECURITY: Verify user can only access their own daily change
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Get today's and yesterday's snapshots
        today = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        # Fetch snapshots
        response = supabase.table("portfolio_daily_snapshots")\
            .select("*")\
            .eq("user_id", user_id)\
            .in_("snapshot_date", [today, yesterday])\
            .execute()

        snapshots = {s['snapshot_date']: s for s in (response.data or [])}

        today_snapshot = snapshots.get(today)
        yesterday_snapshot = snapshots.get(yesterday)

        if not today_snapshot:
            return {
                "success": True,
                "has_data": False,
                "message": "No snapshot for today yet"
            }

        # Calculate daily change
        daily_change = 0
        daily_change_percentage = 0

        if yesterday_snapshot:
            daily_change = today_snapshot['current_value'] - yesterday_snapshot['current_value']
            if yesterday_snapshot['current_value'] > 0:
                daily_change_percentage = (daily_change / yesterday_snapshot['current_value']) * 100

        return {
            "success": True,
            "has_data": True,
            "user_id": user_id,
            "today": {
                "date": today,
                "current_value": today_snapshot['current_value'],
                "total_profit": today_snapshot['total_profit'],
                "overall_return": today_snapshot['overall_return']
            },
            "yesterday": {
                "date": yesterday,
                "current_value": yesterday_snapshot['current_value'] if yesterday_snapshot else 0,
                "total_profit": yesterday_snapshot['total_profit'] if yesterday_snapshot else 0,
                "overall_return": yesterday_snapshot['overall_return'] if yesterday_snapshot else 0
            } if yesterday_snapshot else None,
            "daily_change": daily_change,
            "daily_change_percentage": daily_change_percentage
        }

    except Exception as e:
        print(f"[ERROR] Failed to calculate daily change for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate daily change: {str(e)}")


@router.get("/portfolio-snapshots/{user_id}/weekly")
async def get_weekly_snapshots(
    user_id: str,
    weeks: int = 12,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get weekly portfolio snapshots (last day of each week)
    """
    # SECURITY: Verify user can only access their own weekly snapshots
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Get snapshots for the specified number of weeks
        cutoff_date = (date.today() - timedelta(weeks=weeks)).isoformat()

        response = supabase.table("portfolio_daily_snapshots")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("snapshot_date", cutoff_date)\
            .order("snapshot_date", desc=False)\
            .execute()

        if not response.data:
            return {
                "success": True,
                "user_id": user_id,
                "weekly_snapshots": [],
                "count": 0
            }

        # Group by week and take the last snapshot of each week
        weekly_data = {}
        for snapshot in response.data:
            snapshot_date = datetime.fromisoformat(snapshot['snapshot_date'])
            # Get ISO week number
            week_key = f"{snapshot_date.year}-W{snapshot_date.isocalendar()[1]:02d}"
            # Keep the latest snapshot for each week
            if week_key not in weekly_data or snapshot['snapshot_date'] > weekly_data[week_key]['snapshot_date']:
                weekly_data[week_key] = snapshot

        weekly_snapshots = list(weekly_data.values())
        weekly_snapshots.sort(key=lambda x: x['snapshot_date'], reverse=True)

        return {
            "success": True,
            "user_id": user_id,
            "weekly_snapshots": weekly_snapshots,
            "count": len(weekly_snapshots)
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch weekly snapshots for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weekly snapshots: {str(e)}")


@router.get("/portfolio-snapshots/{user_id}/monthly")
async def get_monthly_snapshots(
    user_id: str,
    months: int = 12,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get monthly portfolio snapshots (last day of each month)
    """
    # SECURITY: Verify user can only access their own monthly snapshots
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Get snapshots for the specified number of months
        cutoff_date = (date.today() - timedelta(days=months * 30)).isoformat()

        response = supabase.table("portfolio_daily_snapshots")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("snapshot_date", cutoff_date)\
            .order("snapshot_date", desc=False)\
            .execute()

        if not response.data:
            return {
                "success": True,
                "user_id": user_id,
                "monthly_snapshots": [],
                "count": 0
            }

        # Group by month and take the last snapshot of each month
        monthly_data = {}
        for snapshot in response.data:
            snapshot_date = datetime.fromisoformat(snapshot['snapshot_date'])
            month_key = f"{snapshot_date.year}-{snapshot_date.month:02d}"
            # Keep the latest snapshot for each month
            if month_key not in monthly_data or snapshot['snapshot_date'] > monthly_data[month_key]['snapshot_date']:
                monthly_data[month_key] = snapshot

        monthly_snapshots = list(monthly_data.values())
        monthly_snapshots.sort(key=lambda x: x['snapshot_date'], reverse=True)

        return {
            "success": True,
            "user_id": user_id,
            "monthly_snapshots": monthly_snapshots,
            "count": len(monthly_snapshots)
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch monthly snapshots for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch monthly snapshots: {str(e)}")


@router.delete("/portfolio-snapshots/{user_id}")
async def delete_user_snapshots(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Delete all portfolio snapshots for a user (admin/user cleanup)
    """
    # SECURITY: Verify user can only delete their own snapshots
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        response = supabase.table("portfolio_daily_snapshots")\
            .delete()\
            .eq("user_id", user_id)\
            .execute()

        return {
            "success": True,
            "message": f"Deleted all snapshots for user {user_id}",
            "deleted_count": len(response.data) if response.data else 0
        }

    except Exception as e:
        print(f"[ERROR] Failed to delete snapshots for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete snapshots: {str(e)}")
