"""
Asset Allocation API Endpoints

Handles saving and retrieving user's custom asset allocation preferences.

SEBI COMPLIANCE:
- Educational purposes only
- Not investment advice
- Asset class level guidance only
- No specific fund/stock recommendations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List
from supabase import create_client
import os
import traceback
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Asset Allocation - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Asset Allocation - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Asset allocation operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for asset_allocation operations")


def sanitize_storage_key(user_id: str) -> str:
    """Sanitize user ID for storage key generation"""
    return user_id.replace("-", "_").replace("@", "_at_").replace(".", "_")


# Pydantic Models
class AssetAllocationData(BaseModel):
    """User's asset allocation for a specific goal type"""
    goal_type: str = Field(..., description="Short-Term, Mid-Term, or Long-Term")
    equity_pct: int = Field(..., ge=0, le=100)
    us_equity_pct: int = Field(..., ge=0, le=100)
    debt_pct: int = Field(..., ge=0, le=100)
    gold_pct: int = Field(..., ge=0, le=100)
    reits_pct: int = Field(..., ge=0, le=100)
    crypto_pct: int = Field(..., ge=0, le=100)
    cash_pct: int = Field(..., ge=0, le=100)
    expected_cagr_min: Optional[float] = Field(None, description="Calculated minimum CAGR")
    expected_cagr_max: Optional[float] = Field(None, description="Calculated maximum CAGR")

    @validator('goal_type')
    def validate_goal_type(cls, v):
        allowed = ['Short-Term', 'Mid-Term', 'Long-Term']
        if v not in allowed:
            raise ValueError(f"goal_type must be one of {allowed}")
        return v

    @validator('expected_cagr_max')
    def validate_total_allocation(cls, v, values):
        """Validate that total allocation equals 100%"""
        total = (
            values.get('equity_pct', 0) +
            values.get('us_equity_pct', 0) +
            values.get('debt_pct', 0) +
            values.get('gold_pct', 0) +
            values.get('reits_pct', 0) +
            values.get('crypto_pct', 0) +
            values.get('cash_pct', 0)
        )
        if total != 100:
            raise ValueError(f"Total allocation must equal 100%, got {total}%")
        return v


class SaveAllocationRequest(BaseModel):
    """Request to save user's asset allocations"""
    user_id: str
    allocations: List[AssetAllocationData] = Field(..., description="List of allocations for each goal type")


class AllocationResponse(BaseModel):
    """Response with user's asset allocations"""
    user_id: str
    allocations: List[Dict]


# API Endpoints
@router.post("/save-asset-allocation")
async def save_asset_allocation(
    data: SaveAllocationRequest,
    current_user: User = Depends(get_authorized_user)
):
    """
    Save user's custom asset allocation preferences

    Saves allocation for each goal type (Short-Term, Mid-Term, Long-Term)
    """
    try:
        # SECURITY: Verify user can only save their own asset allocation
        data.user_id = sanitize_user_id(data.user_id)
        verify_user_ownership(current_user, data.user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Asset Allocation] Saving allocations for user: {data.user_id}")
        print(f"[Asset Allocation] Number of allocations: {len(data.allocations)}")

        # Get or create user in database
        user_email = f"{sanitize_storage_key(data.user_id)}@finnest.example.com"
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()

        user_id_db = None
        if user_response.data and len(user_response.data) > 0:
            user_id_db = user_response.data[0]["id"]
            print(f"[Asset Allocation] Found existing user_id: {user_id_db}")
        else:
            # Create user if not exists
            print(f"[Asset Allocation] Creating new user with email: {user_email}")
            user_data = {
                "email": user_email,
                "name": f"User {data.user_id[:8]}"
            }
            user_response = supabase.from_("users").insert(user_data).execute()
            user_id_db = user_response.data[0]["id"]
            print(f"[Asset Allocation] Created new user_id: {user_id_db}")

        saved_allocations = []

        # Save each allocation (upsert for each goal type)
        for allocation in data.allocations:
            allocation_data = {
                "user_id": user_id_db,
                "goal_type": allocation.goal_type,
                "equity_pct": allocation.equity_pct,
                "us_equity_pct": allocation.us_equity_pct,
                "debt_pct": allocation.debt_pct,
                "gold_pct": allocation.gold_pct,
                "reits_pct": allocation.reits_pct,
                "crypto_pct": allocation.crypto_pct,
                "cash_pct": allocation.cash_pct,
                "expected_cagr_min": allocation.expected_cagr_min,
                "expected_cagr_max": allocation.expected_cagr_max,
            }

            print(f"[Asset Allocation] Saving {allocation.goal_type}: {allocation_data}")

            # Upsert: insert or update if exists (based on unique constraint user_id + goal_type)
            result = supabase.from_("user_asset_allocations").upsert(
                allocation_data,
                on_conflict="user_id,goal_type"
            ).execute()

            if result.data:
                saved_allocations.append(result.data[0])
                print(f"[Asset Allocation] [OK] Saved {allocation.goal_type}")
            else:
                print(f"[Asset Allocation] [WARNING] No data returned for {allocation.goal_type}")

        print(f"[Asset Allocation] [OK] Successfully saved {len(saved_allocations)} allocations")

        return {
            "success": True,
            "message": f"Saved {len(saved_allocations)} asset allocations",
            "data": saved_allocations
        }

    except ValueError as ve:
        print(f"[Asset Allocation] [ERROR] Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"[Asset Allocation] [ERROR] Error saving: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to save asset allocation: {str(e)}")


@router.get("/get-asset-allocation/{user_id}")
async def get_asset_allocation(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Retrieve user's custom asset allocation preferences

    Returns allocations for all goal types (Short-Term, Mid-Term, Long-Term)
    """
    try:
        # SECURITY: Verify user can only access their own asset allocation
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Asset Allocation] Loading allocations for user: {user_id}")

        # Get or create user in database
        user_email = f"{sanitize_storage_key(user_id)}@finnest.example.com"
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()

        user_id_db = None
        if user_response.data and len(user_response.data) > 0:
            user_id_db = user_response.data[0]["id"]
        else:
            # Create user if not exists
            print(f"[Asset Allocation] Creating new user with email: {user_email}")
            user_data = {
                "email": user_email,
                "name": f"User {user_id[:8]}"
            }
            user_response = supabase.from_("users").insert(user_data).execute()
            user_id_db = user_response.data[0]["id"]
            print(f"[Asset Allocation] Created new user_id: {user_id_db}")
            # New user has no allocations yet
            return {"user_id": user_id, "allocations": []}

        # Get all allocations for this user
        allocations_response = supabase.from_("user_asset_allocations").select("*").eq("user_id", user_id_db).execute()

        if not allocations_response.data:
            print(f"[Asset Allocation] [WARNING] No allocations found for user")
            return {"user_id": user_id, "allocations": []}

        allocations = allocations_response.data
        print(f"[Asset Allocation] [OK] Found {len(allocations)} allocations")

        return {
            "user_id": user_id,
            "allocations": allocations
        }

    except Exception as e:
        print(f"[Asset Allocation] [ERROR] Error loading: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to load asset allocation: {str(e)}")


@router.delete("/delete-asset-allocation/{user_id}/{goal_type}")
async def delete_asset_allocation(
    user_id: str,
    goal_type: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Delete user's asset allocation for a specific goal type
    """
    try:
        # SECURITY: Verify user can only delete their own asset allocation
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Validate goal_type
        if goal_type not in ['Short-Term', 'Mid-Term', 'Long-Term']:
            raise HTTPException(status_code=400, detail="Invalid goal_type")

        # Get user ID from database
        user_email = f"{sanitize_storage_key(user_id)}@finnest.example.com"
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()

        if not user_response.data or len(user_response.data) == 0:
            # User doesn't exist, so nothing to delete
            return {
                "success": True,
                "message": f"No allocation found for {goal_type} (user does not exist)",
                "data": []
            }

        user_id_db = user_response.data[0]["id"]

        # Delete allocation
        result = supabase.from_("user_asset_allocations").delete().eq("user_id", user_id_db).eq("goal_type", goal_type).execute()

        return {
            "success": True,
            "message": f"Deleted allocation for {goal_type}",
            "data": result.data
        }

    except Exception as e:
        print(f"[Asset Allocation] [ERROR] Error deleting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete asset allocation: {str(e)}")
