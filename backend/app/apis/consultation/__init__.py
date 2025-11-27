from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date, time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import traceback
from supabase import create_client

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

print(f"[Consultation API] Initialized with Supabase: {supabase is not None}")

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@finedge360.com")

# Admin and support emails
ADMIN_EMAIL = "seyonshomefashion@gmail.com"
SUPPORT_EMAIL = "support@finedge360.com"

print(f"Email configuration loaded:")
print(f"  SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"  SMTP Username configured: {'YES' if SMTP_USERNAME else 'NO'}")
print(f"  SMTP Password configured: {'YES' if SMTP_PASSWORD else 'NO'}")
print(f"  From Email: {FROM_EMAIL}")

class EmailRequest(BaseModel):
    to: List[EmailStr]
    subject: str
    html: str

class EmailResponse(BaseModel):
    success: bool
    message: str

@router.post("/send-consultation-email")
async def send_consultation_email(email_request: EmailRequest) -> EmailResponse:
    """
    Send consultation booking notification emails to admin and support
    """
    try:
        print(f"\n=== SENDING CONSULTATION EMAIL ===")
        print(f"Recipients: {email_request.to}")
        print(f"Subject: {email_request.subject}")

        # Check if SMTP credentials are configured
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("WARNING: SMTP credentials not configured. Email not sent.")
            print("To enable email notifications, set the following environment variables:")
            print("  - SMTP_USERNAME: Your SMTP email username")
            print("  - SMTP_PASSWORD: Your SMTP password or app-specific password")
            print("  - SMTP_SERVER (optional): SMTP server address (default: smtp.gmail.com)")
            print("  - SMTP_PORT (optional): SMTP port (default: 587)")
            print("  - FROM_EMAIL (optional): Sender email address")

            # For development, return success even without SMTP configuration
            # In production, you might want to raise an error instead
            return EmailResponse(
                success=True,
                message="Email notification logged (SMTP not configured for development)"
            )

        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = email_request.subject
        message["From"] = FROM_EMAIL
        message["To"] = ", ".join(email_request.to)

        # Attach HTML content
        html_part = MIMEText(email_request.html, "html")
        message.attach(html_part)

        # Send email via SMTP
        try:
            print(f"Connecting to SMTP server: {SMTP_SERVER}:{SMTP_PORT}")
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()  # Enable TLS encryption
                print(f"Logging in with username: {SMTP_USERNAME}")
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                print(f"Sending email to: {email_request.to}")
                server.sendmail(FROM_EMAIL, email_request.to, message.as_string())
                print("Email sent successfully!")

            return EmailResponse(
                success=True,
                message=f"Email sent successfully to {len(email_request.to)} recipient(s)"
            )
        except smtplib.SMTPAuthenticationError as e:
            print(f"SMTP Authentication Error: {str(e)}")
            print("Please check your SMTP_USERNAME and SMTP_PASSWORD")
            raise HTTPException(
                status_code=500,
                detail="Email authentication failed. Please check SMTP credentials."
            )
        except smtplib.SMTPException as e:
            print(f"SMTP Error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send email: {str(e)}"
            )
    except HTTPException as he:
        raise
    except Exception as e:
        print(f"Error sending consultation email: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send consultation email: {str(e)}"
        )

@router.get("/test-email-config")
async def test_email_config():
    """
    Test endpoint to check email configuration
    """
    return {
        "smtp_server": SMTP_SERVER,
        "smtp_port": SMTP_PORT,
        "smtp_username_configured": bool(SMTP_USERNAME),
        "smtp_password_configured": bool(SMTP_PASSWORD),
        "from_email": FROM_EMAIL,
        "admin_email": ADMIN_EMAIL,
        "support_email": SUPPORT_EMAIL,
        "status": "configured" if SMTP_USERNAME and SMTP_PASSWORD else "not_configured"
    }

# ============================================
# TWO-TIER CONSULTATION SYSTEM
# ============================================

class ConsultationBookingRequest(BaseModel):
    user_id: str
    consultation_type: str  # 'discovery_call' or 'premium_consultation'
    scheduled_date: str  # YYYY-MM-DD
    scheduled_time: str  # HH:MM
    user_name: str
    user_email: EmailStr
    user_phone: Optional[str] = None
    selected_service: str
    selected_expert_type: Optional[str] = None
    user_message: Optional[str] = None

class ConsultationBookingResponse(BaseModel):
    success: bool
    message: str
    booking_id: Optional[str] = None
    consultation_type: str
    calendar_link: Optional[str] = None

@router.get("/consultation-types")
async def get_consultation_types():
    """Get available consultation types"""
    try:
        if not supabase:
            # Return default types if database not configured
            return {
                "success": True,
                "consultation_types": [
                    {
                        "type_name": "discovery_call",
                        "duration_minutes": 15,
                        "price": 0,
                        "is_free": True,
                        "description": "Free 15-minute introductory call",
                        "features": [
                            "General financial guidance",
                            "App walkthrough",
                            "High-level Q&A",
                            "No detailed analysis"
                        ]
                    },
                    {
                        "type_name": "premium_consultation",
                        "duration_minutes": 45,
                        "price": 0,
                        "is_free": True,
                        "description": "Comprehensive 45-minute consultation (Premium only)",
                        "features": [
                            "Portfolio review",
                            "SIP strategy planning",
                            "Tax optimization",
                            "Goal planning",
                            "Written summary",
                            "30-day email support"
                        ]
                    }
                ]
            }

        response = supabase.from_("consultation_types").select("*").execute()

        return {
            "success": True,
            "consultation_types": response.data
        }
    except Exception as e:
        print(f"[Get Consultation Types] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/book-consultation", response_model=ConsultationBookingResponse)
async def book_consultation(booking: ConsultationBookingRequest):
    """Book a consultation (Discovery Call or Premium Consultation)"""
    try:
        print(f"[Book Consultation] User: {booking.user_id}, Type: {booking.consultation_type}")

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Fetch consultation type details
        consultation_type_response = supabase.from_("consultation_types")\
            .select("*")\
            .eq("type_name", booking.consultation_type)\
            .execute()

        if not consultation_type_response.data or len(consultation_type_response.data) == 0:
            raise HTTPException(status_code=404, detail="Consultation type not found")

        consultation_type_data = consultation_type_response.data[0]

        # Check if premium consultation and verify subscription
        if booking.consultation_type == 'premium_consultation':
            # Check user subscription
            subscription_response = supabase.from_("user_subscriptions")\
                .select("*, subscription_plans(*)")\
                .eq("user_id", booking.user_id)\
                .eq("status", "active")\
                .execute()

            if not subscription_response.data or len(subscription_response.data) == 0:
                raise HTTPException(
                    status_code=403,
                    detail="Premium consultation requires an active Premium subscription"
                )

            subscription = subscription_response.data[0]
            plan_name = subscription['subscription_plans']['plan_name']

            if plan_name == 'free':
                raise HTTPException(
                    status_code=403,
                    detail="Premium consultation is not available on Free plan. Please upgrade to Premium."
                )

        # Create booking
        booking_data = {
            "user_id": booking.user_id,
            "consultation_type_id": consultation_type_data['id'],
            "booking_status": "pending",
            "scheduled_date": booking.scheduled_date,
            "scheduled_time": booking.scheduled_time,
            "duration_minutes": consultation_type_data['duration_minutes'],
            "user_name": booking.user_name,
            "user_email": booking.user_email,
            "user_phone": booking.user_phone,
            "selected_service": booking.selected_service,
            "selected_expert_type": booking.selected_expert_type,
            "user_message": booking.user_message
        }

        booking_response = supabase.from_("consultation_bookings")\
            .insert(booking_data)\
            .execute()

        if not booking_response.data or len(booking_response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create booking")

        booking_id = booking_response.data[0]['id']
        print(f"[Book Consultation] Created booking: {booking_id}")

        # TODO: Send confirmation email
        # TODO: Generate calendar link

        return ConsultationBookingResponse(
            success=True,
            message=f"{consultation_type_data['duration_minutes']}-minute consultation booked successfully!",
            booking_id=booking_id,
            consultation_type=booking.consultation_type,
            calendar_link=None  # Will be implemented later
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Book Consultation] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-consultations/{user_id}")
async def get_user_consultations(user_id: str):
    """Get all consultations for a user"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        response = supabase.from_("consultation_bookings")\
            .select("*, consultation_types(*)")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()

        return {
            "success": True,
            "consultations": response.data
        }
    except Exception as e:
        print(f"[Get User Consultations] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("[Consultation API] All endpoints registered successfully")
