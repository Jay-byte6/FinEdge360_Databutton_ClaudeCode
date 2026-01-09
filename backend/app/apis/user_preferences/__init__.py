from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from supabase import create_client
import os
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

print(f"[User Preferences API] Initialized with Supabase: {supabase is not None}")

# ============================================
# MODELS
# ============================================

class UserPreference(BaseModel):
    user_id: str
    preference_type: str
    preference_value: Dict[str, Any]

class UserPreferenceResponse(BaseModel):
    success: bool
    message: str
    preference: Optional[Dict[str, Any]] = None

# ============================================
# ENDPOINTS
# ============================================

@router.post("/save-user-preferences", response_model=UserPreferenceResponse)
async def save_user_preferences(
    data: UserPreference,
    current_user: User = Depends(get_authorized_user)
):
    """Save or update user preferences"""
    try:
        # SECURITY: Verify user can only save their own preferences
        data.user_id = sanitize_user_id(data.user_id)
        verify_user_ownership(current_user, data.user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Save Preferences] User: {data.user_id}, Type: {data.preference_type}")

        # Check if preference already exists
        existing = supabase.from_("user_preferences")\
            .select("*")\
            .eq("user_id", data.user_id)\
            .eq("preference_type", data.preference_type)\
            .execute()

        if existing.data and len(existing.data) > 0:
            # Update existing preference
            preference_id = existing.data[0]['id']
            existing_value = existing.data[0].get('preference_value', {})

            # For guidelines, append to seen list
            if data.preference_type == "guidelines":
                guideline_type = data.preference_value.get('guideline_type')
                dont_show_again = data.preference_value.get('dont_show_again', False)

                seen_guidelines = existing_value.get('seen_guidelines', [])

                if dont_show_again and guideline_type not in seen_guidelines:
                    seen_guidelines.append(guideline_type)

                updated_value = {
                    **existing_value,
                    'seen_guidelines': seen_guidelines,
                    'last_updated': datetime.now().isoformat()
                }
            else:
                # For other preferences, merge values
                updated_value = {**existing_value, **data.preference_value}

            response = supabase.from_("user_preferences")\
                .update({
                    "preference_value": updated_value,
                    "updated_at": datetime.now().isoformat()
                })\
                .eq("id", preference_id)\
                .execute()

            print(f"[Save Preferences] Updated existing preference")
        else:
            # Create new preference
            initial_value = data.preference_value
            if data.preference_type == "guidelines":
                guideline_type = initial_value.get('guideline_type')
                dont_show_again = initial_value.get('dont_show_again', False)
                initial_value = {
                    'seen_guidelines': [guideline_type] if dont_show_again else [],
                    'created_at': datetime.now().isoformat()
                }

            response = supabase.from_("user_preferences")\
                .insert({
                    "user_id": data.user_id,
                    "preference_type": data.preference_type,
                    "preference_value": initial_value
                })\
                .execute()

            print(f"[Save Preferences] Created new preference")

        return UserPreferenceResponse(
            success=True,
            message="Preference saved successfully",
            preference=response.data[0] if response.data else None
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Save Preferences] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get-user-preferences/{user_id}/{preference_type}")
async def get_user_preferences(
    user_id: str,
    preference_type: str,
    current_user: User = Depends(get_authorized_user)
):
    """Get user preferences by type"""
    try:
        # SECURITY: Verify user can only access their own preferences
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Get Preferences] User: {user_id}, Type: {preference_type}")

        response = supabase.from_("user_preferences")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("preference_type", preference_type)\
            .execute()

        if not response.data or len(response.data) == 0:
            # Return empty preference
            return {
                "success": True,
                "preference_type": preference_type,
                "preference_value": {},
                "seen_guidelines": []
            }

        preference = response.data[0]
        preference_value = preference.get('preference_value', {})

        return {
            "success": True,
            "preference_type": preference_type,
            "preference_value": preference_value,
            "seen_guidelines": preference_value.get('seen_guidelines', [])
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Get Preferences] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get-all-user-preferences/{user_id}")
async def get_all_user_preferences(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """Get all preferences for a user"""
    try:
        # SECURITY: Verify user can only access their own preferences
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Get All Preferences] User: {user_id}")

        response = supabase.from_("user_preferences")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        preferences_dict = {}
        for pref in response.data:
            preferences_dict[pref['preference_type']] = pref['preference_value']

        return {
            "success": True,
            "user_id": user_id,
            "preferences": preferences_dict
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Get All Preferences] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reset-user-preference/{user_id}/{preference_type}")
async def reset_user_preference(
    user_id: str,
    preference_type: str,
    current_user: User = Depends(get_authorized_user)
):
    """Reset a specific user preference"""
    try:
        # SECURITY: Verify user can only reset their own preferences
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Reset Preference] User: {user_id}, Type: {preference_type}")

        response = supabase.from_("user_preferences")\
            .delete()\
            .eq("user_id", user_id)\
            .eq("preference_type", preference_type)\
            .execute()

        return {
            "success": True,
            "message": f"Preference '{preference_type}' reset successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Reset Preference] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


print("[User Preferences API] All endpoints registered successfully")
