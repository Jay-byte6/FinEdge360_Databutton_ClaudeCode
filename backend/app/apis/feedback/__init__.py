from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import os
from supabase import create_client

router = APIRouter(prefix="/routes")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Feedback - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Feedback - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Feedback operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for feedback operations")


class FeedbackSubmission(BaseModel):
    userId: Optional[str] = None
    userName: str
    userEmail: Optional[str] = None
    responses: Dict[str, Any]
    timestamp: str
    source: str = "in-app-feedback"


@router.post("/submit-feedback")
async def submit_feedback(data: FeedbackSubmission):
    """
    Submit user feedback to the database
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Prepare feedback data for database
        feedback_data = {
            "user_id": data.userId,
            "user_name": data.userName,
            "user_email": data.userEmail,
            "responses": data.responses,
            "timestamp": data.timestamp,
            "source": data.source,
            "created_at": datetime.utcnow().isoformat()
        }

        # Insert feedback into Supabase
        response = supabase.table("user_feedback").insert(feedback_data).execute()

        print(f"[OK] Feedback submitted successfully for user: {data.userName} ({data.userEmail})")

        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "feedbackId": response.data[0].get("id") if response.data else None
        }

    except Exception as e:
        print(f"[ERROR] Failed to submit feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")


@router.get("/feedback/{user_id}")
async def get_user_feedback(user_id: str):
    """
    Get all feedback submissions for a specific user
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Fetch user's feedback from Supabase
        response = supabase.table("user_feedback")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()

        return {
            "success": True,
            "feedback": response.data if response.data else []
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch feedback for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch feedback: {str(e)}")


@router.get("/feedback")
async def get_all_feedback():
    """
    Get all feedback submissions (admin only)
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Fetch all feedback from Supabase
        response = supabase.table("user_feedback")\
            .select("*")\
            .order("created_at", desc=True)\
            .execute()

        return {
            "success": True,
            "feedback": response.data if response.data else [],
            "count": len(response.data) if response.data else 0
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch all feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch feedback: {str(e)}")
