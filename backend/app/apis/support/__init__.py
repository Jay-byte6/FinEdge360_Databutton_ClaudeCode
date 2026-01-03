from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from supabase import create_client

router = APIRouter(prefix="/routes")

print(f"[SUPPORT DEBUG] Router created with prefix: {router.prefix}")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Support Tickets - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Support Tickets - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Support ticket operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for support ticket operations")


class SupportTicketCreate(BaseModel):
    userId: str
    userName: str
    userEmail: Optional[str] = None
    milestoneNumber: Optional[int] = None
    milestoneName: Optional[str] = None
    subject: str
    description: str
    category: str = "milestone_help"  # Options: milestone_help, technical_issue, general_inquiry, feature_request
    priority: str = "medium"  # Options: low, medium, high, urgent


class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None  # Options: open, in_progress, resolved, closed
    adminNotes: Optional[str] = None
    resolution: Optional[str] = None


class SupportTicketResponse(BaseModel):
    ticketId: str
    userId: str
    userName: str
    userEmail: Optional[str]
    milestoneNumber: Optional[int]
    milestoneName: Optional[str]
    subject: str
    description: str
    category: str
    priority: str
    status: str
    adminNotes: Optional[str]
    resolution: Optional[str]
    createdAt: str
    updatedAt: str


@router.post("/support-tickets")
async def create_support_ticket(ticket: SupportTicketCreate):
    """
    Create a new support ticket
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        # Prepare ticket data
        ticket_data = {
            "user_id": ticket.userId,
            "user_name": ticket.userName,
            "user_email": ticket.userEmail,
            "milestone_number": ticket.milestoneNumber,
            "milestone_name": ticket.milestoneName,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": "open",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        # Insert into database
        response = supabase.table("support_tickets").insert(ticket_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create support ticket")

        ticket_id = response.data[0].get("id")
        print(f"[OK] Support ticket created successfully: {ticket_id} for user: {ticket.userName}")

        return {
            "success": True,
            "message": "Support ticket created successfully. We'll get back to you soon!",
            "ticketId": ticket_id,
            "data": response.data[0]
        }

    except Exception as e:
        print(f"[ERROR] Failed to create support ticket: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create support ticket: {str(e)}")


@router.get("/support-tickets/{user_id}")
async def get_user_support_tickets(user_id: str):
    """
    Get all support tickets for a specific user
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        response = supabase.table("support_tickets")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()

        return {
            "success": True,
            "tickets": response.data if response.data else [],
            "count": len(response.data) if response.data else 0
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch support tickets for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch support tickets: {str(e)}")


@router.get("/support-tickets")
async def get_all_support_tickets():
    """
    Get all support tickets (admin only)
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        response = supabase.table("support_tickets")\
            .select("*")\
            .order("created_at", desc=True)\
            .execute()

        return {
            "success": True,
            "tickets": response.data if response.data else [],
            "count": len(response.data) if response.data else 0
        }

    except Exception as e:
        print(f"[ERROR] Failed to fetch all support tickets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch support tickets: {str(e)}")


@router.patch("/support-tickets/{ticket_id}")
async def update_support_ticket(ticket_id: str, update: SupportTicketUpdate):
    """
    Update a support ticket (admin function)
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        update_data = {
            "updated_at": datetime.utcnow().isoformat()
        }

        if update.status is not None:
            update_data["status"] = update.status
        if update.adminNotes is not None:
            update_data["admin_notes"] = update.adminNotes
        if update.resolution is not None:
            update_data["resolution"] = update.resolution

        response = supabase.table("support_tickets")\
            .update(update_data)\
            .eq("id", ticket_id)\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Support ticket not found")

        print(f"[OK] Support ticket updated successfully: {ticket_id}")

        return {
            "success": True,
            "message": "Support ticket updated successfully",
            "data": response.data[0]
        }

    except Exception as e:
        print(f"[ERROR] Failed to update support ticket {ticket_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update support ticket: {str(e)}")


@router.get("/support-tickets/ticket/{ticket_id}")
async def get_support_ticket(ticket_id: str):
    """
    Get a specific support ticket by ID
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not initialized")

    try:
        response = supabase.table("support_tickets")\
            .select("*")\
            .eq("id", ticket_id)\
            .execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Support ticket not found")

        return {
            "success": True,
            "ticket": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to fetch support ticket {ticket_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch support ticket: {str(e)}")


# Debug: Print all routes registered on this router
print(f"[SUPPORT DEBUG] Total routes on support router: {len(router.routes)}")
for route in router.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        print(f"[SUPPORT DEBUG]   {list(route.methods)} {route.path}")
