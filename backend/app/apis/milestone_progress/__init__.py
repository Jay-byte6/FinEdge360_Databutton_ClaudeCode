from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from supabase import create_client
import os

router = APIRouter(prefix="/routes")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Milestone Progress - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Milestone Progress - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Milestone progress operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for milestone_progress operations")


# Data models
class MilestoneProgressUpdate(BaseModel):
    """Request model for updating milestone progress"""
    milestone_number: int
    completed: Optional[bool] = None
    needs_help: Optional[bool] = None
    notes: Optional[str] = None
    completion_criteria: Optional[List[dict]] = None  # Store checkbox states


class MilestoneProgressResponse(BaseModel):
    """Response model for milestone progress"""
    id: str
    user_id: str
    milestone_number: int
    completed: bool
    completed_at: Optional[str] = None
    needs_help: bool
    help_requested_at: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str


@router.post("/save-milestone-progress/{user_id}")
async def save_milestone_progress(user_id: str, progress: MilestoneProgressUpdate):
    """
    Save or update milestone progress for a user

    This endpoint handles:
    - Marking milestones as completed
    - Requesting help for milestones
    - Adding notes to milestones
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

    try:
        # Validate milestone number
        if progress.milestone_number < 1 or progress.milestone_number > 10:
            raise HTTPException(status_code=400, detail="Milestone number must be between 1 and 10")

        # Check if milestone progress already exists
        existing = supabase.table("milestone_progress").select("*").eq("user_id", user_id).eq("milestone_number", progress.milestone_number).execute()

        # Prepare data for upsert
        data = {
            "user_id": user_id,
            "milestone_number": progress.milestone_number,
        }

        if progress.completed is not None:
            data["completed"] = progress.completed
            if progress.completed:
                data["completed_at"] = datetime.utcnow().isoformat()
            else:
                data["completed_at"] = None

        if progress.needs_help is not None:
            data["needs_help"] = progress.needs_help
            if progress.needs_help:
                data["help_requested_at"] = datetime.utcnow().isoformat()
            else:
                data["help_requested_at"] = None

        if progress.notes is not None:
            data["notes"] = progress.notes

        if progress.completion_criteria is not None:
            data["completion_criteria"] = progress.completion_criteria

        if existing.data and len(existing.data) > 0:
            # Update existing record
            result = supabase.table("milestone_progress").update(data).eq("user_id", user_id).eq("milestone_number", progress.milestone_number).execute()
        else:
            # Insert new record
            result = supabase.table("milestone_progress").insert(data).execute()

        if result.data and len(result.data) > 0:
            return {
                "message": "Milestone progress saved successfully",
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save milestone progress")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving milestone progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save milestone progress: {str(e)}")


@router.get("/get-milestone-progress/{user_id}")
async def get_milestone_progress(user_id: str):
    """
    Get all milestone progress for a user

    Returns a list of all milestones with their completion status
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

    try:
        result = supabase.table("milestone_progress").select("*").eq("user_id", user_id).order("milestone_number").execute()

        return {
            "user_id": user_id,
            "milestones": result.data if result.data else []
        }

    except Exception as e:
        print(f"Error fetching milestone progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch milestone progress: {str(e)}")


@router.get("/get-milestone-progress/{user_id}/{milestone_number}")
async def get_single_milestone_progress(user_id: str, milestone_number: int):
    """
    Get progress for a specific milestone

    Returns the progress data for a single milestone
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

    try:
        # Validate milestone number
        if milestone_number < 1 or milestone_number > 10:
            raise HTTPException(status_code=400, detail="Milestone number must be between 1 and 10")

        result = supabase.table("milestone_progress").select("*").eq("user_id", user_id).eq("milestone_number", milestone_number).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            # Return default state if no record exists
            return {
                "user_id": user_id,
                "milestone_number": milestone_number,
                "completed": False,
                "needs_help": False,
                "notes": None
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching milestone progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch milestone progress: {str(e)}")


@router.delete("/delete-milestone-progress/{user_id}/{milestone_number}")
async def delete_milestone_progress(user_id: str, milestone_number: int):
    """
    Delete progress for a specific milestone (mainly for testing/admin purposes)
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

    try:
        # Validate milestone number
        if milestone_number < 1 or milestone_number > 10:
            raise HTTPException(status_code=400, detail="Milestone number must be between 1 and 10")

        result = supabase.table("milestone_progress").delete().eq("user_id", user_id).eq("milestone_number", milestone_number).execute()

        return {
            "message": "Milestone progress deleted successfully",
            "milestone_number": milestone_number
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting milestone progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete milestone progress: {str(e)}")
