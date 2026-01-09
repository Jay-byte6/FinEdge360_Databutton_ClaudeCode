"""
Privacy and Security API Endpoints
Handles consent management, audit logs, account deletion, and data retention
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from supabase import create_client
import sys
import traceback

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.utils.audit import log_audit, log_data_delete, get_user_audit_logs
from app.utils.breach_detection import check_and_notify_breach
from app.tasks.data_retention import get_inactive_users
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id, verify_user_or_admin

router = APIRouter(prefix="/routes")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

if not supabase:
    print("WARNING: Supabase client not initialized in privacy API")


# ===== DATA MODELS =====

class ConsentItem(BaseModel):
    type: str  # 'data_collection', 'data_processing', 'marketing', 'third_party_sharing'
    given: bool


class SaveConsentsRequest(BaseModel):
    userId: str
    consents: List[ConsentItem]


class ConsentResponse(BaseModel):
    success: bool
    message: str


# ===== CONSENT MANAGEMENT ENDPOINTS =====

@router.post("/save-user-consent")
async def save_user_consent(data: SaveConsentsRequest, request: Request) -> ConsentResponse:
    """
    Save or update user consents for data processing activities.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Get user from database
        user_response = supabase.from_("users").select("id, email").eq("id", data.userId).execute()

        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]

        # Extract request metadata
        ip_address = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
        if ',' in ip_address:
            ip_address = ip_address.split(',')[0].strip()
        user_agent = request.headers.get("User-Agent", "unknown")

        # Process each consent
        for consent in data.consents:
            consent_data = {
                "user_id": user_id,
                "consent_type": consent.type,
                "consent_given": consent.given,
                "consent_date": datetime.utcnow().isoformat() if consent.given else None,
                "withdrawn_date": datetime.utcnow().isoformat() if not consent.given else None,
                "ip_address": ip_address,
                "user_agent": user_agent,
            }

            # Check if consent record exists
            existing = supabase.from_("consent_tracking")\
                .select("id")\
                .eq("user_id", user_id)\
                .eq("consent_type", consent.type)\
                .execute()

            if existing.data and len(existing.data) > 0:
                # Update existing consent
                supabase.from_("consent_tracking")\
                    .update(consent_data)\
                    .eq("user_id", user_id)\
                    .eq("consent_type", consent.type)\
                    .execute()
            else:
                # Insert new consent
                supabase.from_("consent_tracking").insert(consent_data).execute()

            # Log audit event
            action = 'consent_given' if consent.given else 'consent_withdrawn'
            log_audit(
                user_id=user_id,
                action=action,
                request=request,
                table_name="consent_tracking",
                metadata={"consent_type": consent.type}
            )

        return ConsentResponse(success=True, message="Consents saved successfully")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving consents: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to save consents: {str(e)}")


@router.get("/get-user-consents/{user_id}")
async def get_user_consents(user_id: str, request: Request) -> Dict[str, Any]:
    """
    Retrieve all consents for a user.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Get consents
        response = supabase.from_("consent_tracking")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        consents = response.data if response.data else []

        # Log audit event
        log_audit(
            user_id=user_id,
            action='data_read',
            request=request,
            table_name="consent_tracking"
        )

        return {
            "success": True,
            "consents": consents
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving consents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve consents: {str(e)}")


# ===== ACCOUNT DELETION ENDPOINT =====

@router.delete("/delete-user-account/{user_id}")
async def delete_user_account(
    user_id: str,
    request: Request,
    current_user: User = Depends(get_authorized_user)
) -> Dict[str, str]:
    """
    Permanently delete a user account and all associated data.
    This is irreversible and complies with GDPR right to erasure.
    """
    try:
        # SECURITY: Verify user can only delete their own account
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Verify user exists
        user_response = supabase.from_("users").select("id, email").eq("id", user_id).execute()

        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user_email = user_response.data[0]["email"]

        # Log the deletion audit event BEFORE deleting (since audit logs will be deleted too)
        log_audit(
            user_id=user_id,
            action='data_delete',
            request=request,
            table_name="users",
            record_id=user_id,
            metadata={"email": user_email, "reason": "user_requested"}
        )

        # Delete from all tables (order matters due to foreign key constraints)
        # These will CASCADE delete related records due to ON DELETE CASCADE in schema

        # 1. Delete audit logs for this user
        supabase.from_("audit_logs").delete().eq("user_id", user_id).execute()

        # 2. Delete consent tracking
        supabase.from_("consent_tracking").delete().eq("user_id", user_id).execute()

        # 3. Delete risk assessments
        supabase.from_("risk_assessments").delete().eq("user_id", user_id).execute()

        # 4. Delete financial data (this should cascade to related tables)
        # Get personal_info records
        personal_info_response = supabase.from_("personal_info")\
            .select("id")\
            .eq("user_id", user_id)\
            .execute()

        if personal_info_response.data:
            for pi in personal_info_response.data:
                pi_id = pi["id"]

                # Delete goals
                supabase.from_("goals").delete().eq("personal_info_id", pi_id).execute()

                # Delete risk appetite
                supabase.from_("risk_appetite").delete().eq("personal_info_id", pi_id).execute()

                # Delete assets and liabilities
                supabase.from_("assets_liabilities").delete().eq("personal_info_id", pi_id).execute()

            # Delete personal info
            supabase.from_("personal_info").delete().eq("user_id", user_id).execute()

        # 5. Finally, delete the user (this will cascade to profiles if foreign key is set)
        supabase.from_("users").delete().eq("id", user_id).execute()

        print(f"Successfully deleted user account: {user_id} ({user_email})")

        return {
            "success": True,
            "message": "Account and all associated data have been permanently deleted"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting user account: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")


# ===== AUDIT LOG ENDPOINTS =====

@router.get("/audit-logs/{user_id}")
async def get_audit_logs_endpoint(user_id: str, limit: int = 100, request: Request = None) -> Dict[str, Any]:
    """
    Retrieve audit logs for a specific user.
    """
    try:
        logs = get_user_audit_logs(user_id, limit)

        # Log this access
        if request:
            log_audit(
                user_id=user_id,
                action='data_read',
                request=request,
                table_name="audit_logs"
            )

        return {
            "success": True,
            "logs": logs,
            "count": len(logs)
        }

    except Exception as e:
        print(f"Error retrieving audit logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve audit logs: {str(e)}")


# ===== DATA RETENTION ENDPOINTS =====

@router.get("/inactive-users")
async def get_inactive_users_endpoint(months: int = 18, request: Request = None) -> Dict[str, Any]:
    """
    Get list of inactive users (admin endpoint).
    Requires authentication in production.
    """
    try:
        inactive_users = get_inactive_users(months)

        return {
            "success": True,
            "inactive_users": inactive_users,
            "count": len(inactive_users),
            "retention_period_months": months
        }

    except Exception as e:
        print(f"Error retrieving inactive users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve inactive users: {str(e)}")


# ===== EXPORT DATA ENDPOINT =====

@router.post("/log-pdf-export/{user_id}")
async def log_pdf_export(user_id: str, request: Request) -> Dict[str, str]:
    """
    Log PDF export event for audit trail.
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Get user email for breach detection
        user_response = supabase.from_("users").select("email").eq("id", user_id).execute()

        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user_email = user_response.data[0]["email"]

        # Log the export
        log_audit(
            user_id=user_id,
            action='export_data',
            request=request,
            metadata={"export_type": "pdf", "export_time": datetime.utcnow().isoformat()}
        )

        # Check for suspicious activity (e.g., too many exports)
        check_and_notify_breach(user_id, user_email, request, 'export_data')

        return {
            "success": True,
            "message": "Export logged successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error logging export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to log export: {str(e)}")


# Health check endpoint
@router.get("/privacy-health")
async def privacy_health_check():
    """
    Health check for privacy API endpoints.
    """
    return {
        "status": "healthy",
        "service": "privacy_api",
        "supabase_connected": supabase is not None
    }
