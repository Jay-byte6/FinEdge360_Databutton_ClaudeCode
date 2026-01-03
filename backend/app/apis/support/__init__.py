from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@finedge360.com")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "support@finedge360.com")  # Admin email for notifications

print(f"Email configuration loaded:")
print(f"  SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"  SMTP Username configured: {'YES' if SMTP_USERNAME else 'NO'}")
print(f"  Admin Email: {ADMIN_EMAIL}")


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


def send_admin_notification_email(ticket_id: str, user_name: str, user_email: Optional[str], subject: str, description: str, priority: str, category: str):
    """Send email notification to admin when a new support ticket is created"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("[WARNING] SMTP credentials not configured. Skipping email notification.")
        return

    try:
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"[FIREMap Support] New Ticket #{ticket_id[:8]} - {priority.upper()} Priority"
        message["From"] = FROM_EMAIL
        message["To"] = ADMIN_EMAIL

        # Create HTML email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #d9534f;">🎫 New Support Ticket Created</h2>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Ticket ID:</strong> #{ticket_id}</p>
                        <p><strong>Priority:</strong> <span style="color: {'#d9534f' if priority == 'urgent' else '#f0ad4e' if priority == 'high' else '#5bc0de'};">{priority.upper()}</span></p>
                        <p><strong>Category:</strong> {category.replace('_', ' ').title()}</p>
                    </div>

                    <h3>User Information</h3>
                    <p><strong>Name:</strong> {user_name}</p>
                    <p><strong>Email:</strong> {user_email or 'Not provided'}</p>

                    <h3>Issue Details</h3>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Description:</strong></p>
                    <div style="background-color: #f4f4f4; padding: 10px; border-left: 4px solid #5bc0de; margin: 10px 0;">
                        {description}
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="font-size: 12px; color: #777;">
                            This is an automated notification from FIREMap Support System.<br>
                            Please respond to the user at {user_email or 'N/A'} within 24-48 hours.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Attach HTML body
        message.attach(MIMEText(html_body, "html"))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, ADMIN_EMAIL, message.as_string())

        print(f"[OK] Admin notification email sent successfully for ticket {ticket_id}")

    except Exception as e:
        print(f"[ERROR] Failed to send admin notification email: {str(e)}")
        raise


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

        # Send email notification to admin
        try:
            send_admin_notification_email(
                ticket_id=ticket_id,
                user_name=ticket.userName,
                user_email=ticket.userEmail,
                subject=ticket.subject,
                description=ticket.description,
                priority=ticket.priority,
                category=ticket.category
            )
        except Exception as email_error:
            print(f"[WARNING] Failed to send admin notification email: {str(email_error)}")
            # Don't fail the ticket creation if email fails

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
