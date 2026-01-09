from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from supabase import create_client
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

router = APIRouter(prefix="/routes")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Action Items - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Action Items - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Action items operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for action_items operations")


class UserActionItems(BaseModel):
    completedActionIds: List[str] = []


@router.get("/user-action-items/{user_id}")
async def get_user_action_items(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get user's completed action items
    """
    # SECURITY: Verify user can only access their own action items
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Fetch user's action items from Supabase
        response = supabase.table("user_action_items").select("*").eq("user_id", user_id).execute()

        if response.data and len(response.data) > 0:
            # Return the first (and only) record
            return {
                "completedActionIds": response.data[0].get("completed_action_ids", [])
            }
        else:
            # No record found, return empty list
            return {
                "completedActionIds": []
            }

    except Exception as e:
        print(f"[ERROR] Failed to fetch action items for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch action items: {str(e)}")


@router.post("/user-action-items/{user_id}")
async def update_user_action_items(
    user_id: str,
    data: UserActionItems,
    current_user: User = Depends(get_authorized_user)
):
    """
    Update user's completed action items
    """
    # SECURITY: Verify user can only update their own action items
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Check if record exists
        existing = supabase.table("user_action_items").select("*").eq("user_id", user_id).execute()

        action_data = {
            "user_id": user_id,
            "completed_action_ids": data.completedActionIds,
        }

        if existing.data and len(existing.data) > 0:
            # Update existing record
            response = supabase.table("user_action_items").update(action_data).eq("user_id", user_id).execute()
        else:
            # Insert new record
            response = supabase.table("user_action_items").insert(action_data).execute()

        return {
            "success": True,
            "message": "Action items updated successfully",
            "completedActionIds": data.completedActionIds
        }

    except Exception as e:
        print(f"[ERROR] Failed to update action items for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update action items: {str(e)}")
