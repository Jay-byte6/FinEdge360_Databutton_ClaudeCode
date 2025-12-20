"""
Portfolio API for CAMS statement upload and mutual fund tracking
Handles file uploads, holdings management, and notifications
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import os
import tempfile
import traceback
from supabase import create_client
import dotenv

# Load environment variables
dotenv.load_dotenv()

router = APIRouter(prefix="/routes")

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Portfolio API - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Portfolio API - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase:
    print("CRITICAL_ERROR: Supabase client not initialized for portfolio API")
elif supabase:
    print("[OK] Supabase client initialized successfully for portfolio operations")


# =======================
# PYDANTIC MODELS
# =======================

class PortfolioHolding(BaseModel):
    """Portfolio holding model"""
    id: Optional[str] = None
    user_id: str
    folio_number: str
    scheme_code: str
    scheme_name: str
    amc_name: Optional[str] = None
    unit_balance: float
    avg_cost_per_unit: float
    cost_value: float
    current_nav: float
    nav_date: str
    market_value: float
    absolute_profit: float
    absolute_return_percentage: float
    xirr_percentage: Optional[float] = None
    is_active: bool = True
    last_updated: Optional[str] = None
    created_at: Optional[str] = None


class PortfolioSummary(BaseModel):
    """Portfolio summary statistics"""
    total_investment: float
    current_value: float
    total_profit: float
    overall_return: float
    holdings_count: int


class UploadResult(BaseModel):
    """File upload result"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    """Notification data"""
    id: str
    user_id: str
    notification_type: str
    title: str
    message: str
    folio_number: Optional[str] = None
    scheme_name: Optional[str] = None
    change_percentage: Optional[float] = None
    old_value: Optional[float] = None
    new_value: Optional[float] = None
    is_read: bool
    is_email_sent: bool
    created_at: str


# =======================
# HELPER FUNCTIONS
# =======================

def calculate_summary(holdings: List[Dict]) -> PortfolioSummary:
    """Calculate portfolio summary statistics"""
    if not holdings:
        return PortfolioSummary(
            total_investment=0,
            current_value=0,
            total_profit=0,
            overall_return=0,
            holdings_count=0
        )

    total_investment = sum(h.get('cost_value', 0) for h in holdings)
    current_value = sum(h.get('market_value', 0) for h in holdings)
    total_profit = current_value - total_investment
    overall_return = (total_profit / total_investment * 100) if total_investment > 0 else 0

    return PortfolioSummary(
        total_investment=total_investment,
        current_value=current_value,
        total_profit=total_profit,
        overall_return=overall_return,
        holdings_count=len(holdings)
    )


# =======================
# API ENDPOINTS
# =======================

@router.post("/upload-portfolio", response_model=UploadResult)
async def upload_portfolio(
    file: UploadFile = File(...),
    userId: str = Form(...),
    password: Optional[str] = Form(None)
):
    """
    Upload and parse CAMS statement (PDF or Excel)

    Args:
        file: CAMS statement file (PDF/Excel)
        userId: User ID
        password: PDF password (optional, for password-protected PDFs)

    Returns:
        Upload result with parsing statistics
    """
    try:
        print(f"[Portfolio Upload] User: {userId}, File: {file.filename}, Type: {file.content_type}")

        # Validate user
        if not userId or userId == 'undefined':
            raise HTTPException(status_code=400, detail="Invalid user ID")

        # Validate file type
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.pdf', '.xlsx', '.xls']:
            raise HTTPException(status_code=400, detail="Invalid file type. Upload PDF or Excel only.")

        # Validate file size (max 10MB)
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum 10MB allowed.")

        # Create file record
        file_record = supabase.table('uploaded_portfolio_files').insert({
            'user_id': userId,
            'file_name': file.filename,
            'file_type': file_extension.upper().replace('.', ''),
            'file_size': file_size,
            'processing_status': 'PROCESSING'
        }).execute()

        file_record_id = file_record.data[0]['id'] if file_record.data else None
        print(f"[Portfolio Upload] File record created: {file_record_id}")

        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            tmp_file_path = tmp_file.name

        try:
            # Parse file based on extension
            if file_extension == '.pdf':
                from .parser import parse_cams_pdf

                # Try with provided password or common CAMS passwords
                common_passwords = [password] if password else []
                # Add common CAMS password patterns (PAN-based)
                common_passwords.extend([None])  # Try without password first

                holdings_data = None
                last_error = None

                for pwd in common_passwords:
                    try:
                        if pwd:
                            print(f"[PDF Parser] Trying with password...")
                        else:
                            print(f"[PDF Parser] Trying without password...")
                        holdings_data = parse_cams_pdf(tmp_file_path, password=pwd)
                        print(f"[PDF Parser] Successfully opened PDF")
                        break
                    except Exception as e:
                        last_error = e
                        error_msg = str(e).lower()
                        # Check if it's a password-related error
                        if ('password' in error_msg or 'encrypted' in error_msg or
                            'PDFPasswordIncorrect' in str(type(e).__name__)):
                            if not pwd:  # We tried without password and it failed
                                # Re-raise with helpful message
                                raise Exception("This PDF is password-protected. Please check the 'My PDF is password-protected' box and enter your password (usually your PAN in lowercase).")
                            else:  # Wrong password was provided
                                raise Exception("Incorrect PDF password. CAMS PDFs are typically protected with your PAN number in lowercase. Please try again.")
                        else:
                            # Other parsing error, raise immediately
                            raise

                if holdings_data is None:
                    raise Exception(f"Failed to parse PDF. {str(last_error) if last_error else 'Unknown error'}")

            else:  # Excel
                from .parser import parse_cams_excel
                holdings_data = parse_cams_excel(tmp_file_path)

            print(f"[Portfolio Upload] Parsed {len(holdings_data)} holdings from file")

            # Insert holdings into database
            unique_folios = set()
            holdings_created = 0
            total_investment = 0

            for holding_data in holdings_data:
                # Upsert holding (update if exists, insert if new)
                holding_data['user_id'] = userId

                # Calculate derived fields
                holding_data['market_value'] = holding_data['unit_balance'] * holding_data['current_nav']
                holding_data['absolute_profit'] = holding_data['market_value'] - holding_data['cost_value']
                holding_data['absolute_return_percentage'] = (
                    (holding_data['absolute_profit'] / holding_data['cost_value'] * 100)
                    if holding_data['cost_value'] > 0 else 0
                )

                # Upsert to database
                result = supabase.table('portfolio_holdings').upsert(
                    holding_data,
                    on_conflict='user_id,folio_number,scheme_code'
                ).execute()

                unique_folios.add(holding_data['folio_number'])
                holdings_created += 1
                total_investment += holding_data['cost_value']

            # Update file record
            supabase.table('uploaded_portfolio_files').update({
                'processing_status': 'COMPLETED',
                'folios_extracted': len(unique_folios),
                'holdings_created': holdings_created,
                'total_investment': total_investment,
                'processed_at': datetime.now().isoformat()
            }).eq('id', file_record_id).execute()

            # Update user's mutual_funds_value in assets_liabilities
            total_mf_value = supabase.table('portfolio_holdings').select('market_value').eq('user_id', userId).eq('is_active', True).execute()
            if total_mf_value.data:
                mf_sum = sum(h['market_value'] for h in total_mf_value.data)

                # Update or ignore if no assets_liabilities record exists
                supabase.table('assets_liabilities').update({
                    'mutual_funds_value': mf_sum
                }).eq('user_id', userId).execute()

            # Clean up temp file
            os.unlink(tmp_file_path)

            return UploadResult(
                success=True,
                message=f"Successfully parsed {len(unique_folios)} folios with {holdings_created} holdings",
                data={
                    'file_id': file_record_id,
                    'folios_extracted': len(unique_folios),
                    'holdings_created': holdings_created,
                    'total_investment': total_investment
                }
            )

        except Exception as parse_error:
            # Update file record with error
            supabase.table('uploaded_portfolio_files').update({
                'processing_status': 'FAILED',
                'error_message': str(parse_error),
                'processed_at': datetime.now().isoformat()
            }).eq('id', file_record_id).execute()

            # Clean up temp file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

            raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(parse_error)}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Portfolio Upload] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio-holdings/{user_id}")
async def get_portfolio_holdings(user_id: str):
    """
    Get all portfolio holdings for a user with summary

    Args:
        user_id: User ID

    Returns:
        Holdings array and summary object
    """
    try:
        print(f"[Get Portfolio Holdings] User: {user_id}")

        # Fetch all active holdings
        holdings_result = supabase.table('portfolio_holdings').select('*').eq('user_id', user_id).eq('is_active', True).order('scheme_name').execute()

        holdings = holdings_result.data if holdings_result.data else []
        summary = calculate_summary(holdings)

        return {
            'success': True,
            'holdings': holdings,
            'summary': summary.model_dump()
        }

    except Exception as e:
        print(f"[Get Portfolio Holdings] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio-notifications/{user_id}")
async def get_portfolio_notifications(user_id: str, limit: int = 50):
    """
    Get notifications for a user (unread first)

    Args:
        user_id: User ID
        limit: Maximum number of notifications to return

    Returns:
        List of notifications
    """
    try:
        print(f"[Get Notifications] User: {user_id}, Limit: {limit}")

        # Fetch notifications ordered by unread first, then by created date
        notifications_result = supabase.table('portfolio_notifications').select('*').eq('user_id', user_id).order('is_read').order('created_at', desc=True).limit(limit).execute()

        notifications = notifications_result.data if notifications_result.data else []

        return {
            'success': True,
            'notifications': notifications,
            'unread_count': sum(1 for n in notifications if not n.get('is_read', False))
        }

    except Exception as e:
        print(f"[Get Notifications] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/portfolio-notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str):
    """
    Mark a notification as read

    Args:
        notification_id: Notification ID

    Returns:
        Success message
    """
    try:
        print(f"[Mark Notification Read] ID: {notification_id}")

        # Update notification
        result = supabase.table('portfolio_notifications').update({
            'is_read': True,
            'read_at': datetime.now().isoformat()
        }).eq('id', notification_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")

        return {
            'success': True,
            'message': 'Notification marked as read'
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Mark Notification Read] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/portfolio-holdings/{holding_id}")
async def delete_portfolio_holding(holding_id: str, user_id: str):
    """
    Delete a portfolio holding (verify user ownership)

    Args:
        holding_id: Holding ID
        user_id: User ID (for verification)

    Returns:
        Success message
    """
    try:
        print(f"[Delete Holding] ID: {holding_id}, User: {user_id}")

        # Verify ownership
        holding = supabase.table('portfolio_holdings').select('user_id').eq('id', holding_id).execute()

        if not holding.data:
            raise HTTPException(status_code=404, detail="Holding not found")

        if holding.data[0]['user_id'] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized: You don't own this holding")

        # Delete holding (cascades to nav_history)
        supabase.table('portfolio_holdings').delete().eq('id', holding_id).execute()

        # Recalculate and update mutual_funds_value
        total_mf_value = supabase.table('portfolio_holdings').select('market_value').eq('user_id', user_id).eq('is_active', True).execute()
        if total_mf_value.data:
            mf_sum = sum(h['market_value'] for h in total_mf_value.data)
        else:
            mf_sum = 0

        supabase.table('assets_liabilities').update({
            'mutual_funds_value': mf_sum
        }).eq('user_id', user_id).execute()

        return {
            'success': True,
            'message': 'Holding deleted successfully'
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Delete Holding] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/manual-nav-update")
async def manual_nav_update(user_id: Optional[str] = None):
    """
    Manually trigger NAV update (for testing)

    Args:
        user_id: Optional user ID (if None, updates all users)

    Returns:
        Update statistics
    """
    try:
        print(f"[Manual NAV Update] User: {user_id or 'ALL'}")

        from .nav_service import batch_update_navs

        # Trigger batch NAV update
        stats = await batch_update_navs(user_id)

        return {
            'success': True,
            'message': 'NAV update completed',
            'stats': stats
        }

    except Exception as e:
        print(f"[Manual NAV Update] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# Export router
__all__ = ['router']
