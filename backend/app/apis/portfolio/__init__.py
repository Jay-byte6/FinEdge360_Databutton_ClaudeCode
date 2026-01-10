"""
Portfolio API for CAMS statement upload and mutual fund tracking
Handles file uploads, holdings management, and notifications
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import os
import tempfile
import traceback
from supabase import create_client
import dotenv
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

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
    password: Optional[str] = Form(None),
    current_user: User = Depends(get_authorized_user)
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
        # SECURITY: Verify user can only upload their own portfolio
        userId = sanitize_user_id(userId)
        verify_user_ownership(current_user, userId)

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
async def get_portfolio_holdings(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get all portfolio holdings for a user with summary

    Args:
        user_id: User ID

    Returns:
        Holdings array and summary object
    """
    try:
        # SECURITY: Verify user can only access their own holdings
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)
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
async def get_portfolio_notifications(
    user_id: str,
    limit: int = 50,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get notifications for a user (unread first)

    Args:
        user_id: User ID
        limit: Maximum number of notifications to return

    Returns:
        List of notifications
    """
    try:
        # SECURITY: Verify user can only access their own notifications
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)
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
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Mark a notification as read

    Args:
        notification_id: Notification ID

    Returns:
        Success message
    """
    try:
        # SECURITY: Fetch notification first, then verify ownership
        notification = supabase.table('portfolio_notifications').select('user_id').eq('id', notification_id).execute()

        if not notification.data:
            raise HTTPException(status_code=404, detail="Notification not found")

        user_id = sanitize_user_id(notification.data[0]['user_id'])
        verify_user_ownership(current_user, user_id)

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
async def delete_portfolio_holding(
    holding_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Delete a portfolio holding (verify user ownership)

    Args:
        holding_id: Holding ID

    Returns:
        Success message
    """
    try:
        # SECURITY: Fetch holding first, then verify ownership
        holding = supabase.table('portfolio_holdings').select('user_id').eq('id', holding_id).execute()

        if not holding.data:
            raise HTTPException(status_code=404, detail="Holding not found")

        user_id = sanitize_user_id(holding.data[0]['user_id'])
        verify_user_ownership(current_user, user_id)

        print(f"[Delete Holding] ID: {holding_id}, User: {user_id}")

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
async def manual_nav_update(
    user_id: Optional[str] = None,
    current_user: User = Depends(get_authorized_user)
):
    """
    Manually trigger NAV update (for testing)

    Args:
        user_id: Optional user ID (if None, updates all users - admin only)

    Returns:
        Update statistics
    """
    try:
        # SECURITY: If user_id provided, verify ownership; if None, admin-only
        if user_id:
            user_id = sanitize_user_id(user_id)
            verify_user_ownership(current_user, user_id)
        else:
            # Admin-only operation to update all users
            from app.security import is_admin_user
            if not is_admin_user(current_user):
                raise HTTPException(status_code=403, detail="Admin access required to update all users")

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


@router.post("/refresh-portfolio-nav/{user_id}")
async def refresh_portfolio_nav(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Refresh NAV for all portfolio holdings of a specific user

    Args:
        user_id: User ID whose portfolio NAV needs to be refreshed

    Returns:
        Update statistics
    """
    try:
        # SECURITY: Verify user can only refresh their own portfolio NAV
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)
        print(f"[Refresh Portfolio NAV] User: {user_id}")

        from .nav_service import batch_update_navs

        # Trigger batch NAV update for this user
        stats = await batch_update_navs(user_id)

        return {
            'success': True,
            'message': 'Portfolio NAV refreshed successfully',
            'stats': stats
        }

    except Exception as e:
        print(f"[Refresh Portfolio NAV] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# =======================
# GOAL ASSIGNMENT ENDPOINTS
# =======================

class AssignGoalRequest(BaseModel):
    """Request model for assigning a holding to a goal"""
    goal_id: Optional[str] = None
    monthly_sip_amount: Optional[float] = 0


def detect_asset_class(scheme_name: str) -> str:
    """
    Detect asset class from mutual fund scheme name
    Returns: Equity, Debt, Hybrid, Gold, or Liquid
    """
    scheme_lower = scheme_name.lower()

    # Gold funds
    if 'gold' in scheme_lower:
        return 'Gold'

    # Liquid funds
    if any(word in scheme_lower for word in ['liquid', 'overnight', 'ultra short']):
        return 'Liquid'

    # Debt funds
    debt_keywords = [
        'debt', 'bond', 'income', 'gilt', 'treasury', 'corporate bond',
        'banking', 'psu', 'credit', 'duration', 'dynamic bond', 'money market'
    ]
    if any(keyword in scheme_lower for keyword in debt_keywords):
        return 'Debt'

    # Hybrid funds
    hybrid_keywords = [
        'hybrid', 'balanced', 'aggressive', 'conservative', 'dynamic asset',
        'multi asset', 'equity savings'
    ]
    if any(keyword in scheme_lower for keyword in hybrid_keywords):
        return 'Hybrid'

    # Equity funds (default if no match)
    equity_keywords = [
        'equity', 'stock', 'elss', 'large cap', 'mid cap', 'small cap',
        'multi cap', 'flexi cap', 'focused', 'dividend', 'growth', 'value',
        'index', 'nifty', 'sensex', 'sector', 'thematic'
    ]
    if any(keyword in scheme_lower for keyword in equity_keywords):
        return 'Equity'

    # Default to Equity if unclear
    return 'Equity'


@router.patch("/portfolio-holdings/{holding_id}/assign-goal")
async def assign_holding_to_goal(
    holding_id: str,
    request: AssignGoalRequest,
    current_user: User = Depends(get_authorized_user)
):
    """
    Assign a portfolio holding to a specific financial goal
    Also auto-detects and updates the asset class
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        # SECURITY: Fetch the holding first, then verify ownership
        holding_response = supabase.table('portfolio_holdings').select('*').eq('id', holding_id).single().execute()

        if not holding_response.data:
            raise HTTPException(status_code=404, detail="Holding not found")

        holding = holding_response.data
        user_id = sanitize_user_id(holding['user_id'])
        verify_user_ownership(current_user, user_id)

        # Auto-detect asset class from scheme name
        asset_class = detect_asset_class(holding['scheme_name'])

        # Update holding with goal_id, asset_class, and monthly_sip_amount
        update_data = {
            'goal_id': request.goal_id,
            'asset_class': asset_class,
            'monthly_sip_amount': request.monthly_sip_amount if request.monthly_sip_amount is not None else 0
        }

        update_response = supabase.table('portfolio_holdings').update(update_data).eq('id', holding_id).execute()

        return {
            'success': True,
            'message': 'Goal assignment updated successfully',
            'holding': update_response.data[0] if update_response.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Assign Goal] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/goal-investment-summary/{user_id}")
async def get_goal_investment_summary(
    user_id: str,
    current_user: User = Depends(get_authorized_user)
):
    """
    Get investment summary for all user's goals with assigned holdings
    Returns progress, asset allocation, and holdings for each goal
    """
    try:
        # SECURITY: Verify user can only access their own goal investment summary
        user_id = sanitize_user_id(user_id)
        verify_user_ownership(current_user, user_id)
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        # Get user's SIP planner goals from sip_planner_data table
        from app.apis.financial_data import sanitize_storage_key
        user_email = f"{sanitize_storage_key(user_id)}@finnest.example.com"
        print(f"[Goal Summary] Looking up user with email: {user_email}")
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()

        if not user_response.data or len(user_response.data) == 0:
            print(f"[Goal Summary] User not found, returning empty")
            return {
                'goals': [],
                'total_holdings': 0,
                'assigned_holdings': 0
            }

        user_id_db = user_response.data[0]["id"]
        print(f"[Goal Summary] Found user_id_db: {user_id_db}")

        # Fetch SIP planner data which contains goals
        planner_response = supabase.from_("sip_planner_data").select("*").eq("user_id", user_id_db).execute()

        if not planner_response.data or len(planner_response.data) == 0:
            print(f"[Goal Summary] No SIP planner data found")
            return {
                'goals': [],
                'total_holdings': 0,
                'assigned_holdings': 0
            }

        goals_data = planner_response.data[0].get('goals', [])
        if not goals_data:
            print(f"[Goal Summary] No goals in SIP planner data")
            return {
                'goals': [],
                'total_holdings': 0,
                'assigned_holdings': 0
            }

        # Sort goals by timeline (shortest first)
        goals_data.sort(key=lambda g: g.get('timeYears', 999))
        print(f"[Goal Summary] Found {len(goals_data)} goals from SIP planner (sorted by timeline)")

        # Fetch all active holdings for user
        print(f"[Goal Summary] Fetching holdings for user_id: {user_id}")
        holdings_response = supabase.from_("portfolio_holdings").select("*").eq("user_id", user_id).eq("is_active", True).execute()
        print(f"[Goal Summary] Holdings fetched: {len(holdings_response.data or [])}")

        holdings = holdings_response.data or []
        total_holdings = len(holdings)
        assigned_holdings = len([h for h in holdings if h.get('goal_id')])

        # Process each goal
        goal_summaries = []

        for goal in goals_data:
            goal_name = goal.get('name', 'Unnamed Goal')

            # Filter holdings for this goal (match by goal name since goals don't have stable IDs in JSON)
            goal_holdings = [h for h in holdings if h.get('goal_id') == goal_name]

            # Calculate totals
            total_invested = sum(h['cost_value'] for h in goal_holdings)
            total_current = sum(h['market_value'] for h in goal_holdings)
            total_profit = total_current - total_invested

            # Asset breakdown (current value)
            asset_breakdown = {}
            asset_breakdown_pct = {}

            for holding in goal_holdings:
                asset_class = holding.get('asset_class', 'Equity')
                asset_breakdown[asset_class] = asset_breakdown.get(asset_class, 0) + holding['market_value']

            # Calculate percentages
            if total_current > 0:
                for asset_class, value in asset_breakdown.items():
                    asset_breakdown_pct[asset_class] = round((value / total_current) * 100, 1)

            # Monthly SIP breakdown
            sip_breakdown = {}
            sip_breakdown_pct = {}
            total_monthly_sip = sum(h.get('monthly_sip_amount', 0) for h in goal_holdings)

            for holding in goal_holdings:
                asset_class = holding.get('asset_class', 'Equity')
                sip_amount = holding.get('monthly_sip_amount', 0)
                sip_breakdown[asset_class] = sip_breakdown.get(asset_class, 0) + sip_amount

            # Calculate SIP percentages
            if total_monthly_sip > 0:
                for asset_class, sip_value in sip_breakdown.items():
                    sip_breakdown_pct[asset_class] = round((sip_value / total_monthly_sip) * 100, 1)

            # Calculate recommended allocation based on timeline
            current_year = datetime.now().year
            years_to_goal = goal.get('timeYears', 10)
            target_year = current_year + years_to_goal

            # Timeline-based allocation
            if years_to_goal >= 10:
                recommended_allocation = {'Equity': 80, 'Debt': 15, 'Gold': 5}
            elif years_to_goal >= 5:
                recommended_allocation = {'Equity': 60, 'Debt': 30, 'Gold': 10}
            elif years_to_goal >= 3:
                recommended_allocation = {'Equity': 40, 'Debt': 50, 'Gold': 10}
            else:
                recommended_allocation = {'Equity': 20, 'Debt': 70, 'Gold': 10}

            # Progress calculation - FIX: Include Amount Available Today
            target_amount = goal.get('amountRequiredFuture', 0)
            amount_allocated = goal.get('amountAvailableToday', 0)  # Amount Available Today from Set Goals

            # Total value = Amount Available Today + Current Holdings Value
            total_value = amount_allocated + total_current

            progress_percentage = (total_value / target_amount * 100) if target_amount > 0 else 0
            gap_amount = max(0, target_amount - total_value)
            is_on_track = progress_percentage >= (100 - (years_to_goal / target_year * 100)) if target_year > current_year else progress_percentage >= 100

            print(f"[Goal Summary] {goal_name}: Allocated=Rs.{amount_allocated}, Holdings=Rs.{total_current}, Total=Rs.{total_value}, Target=Rs.{target_amount}, Progress={progress_percentage:.1f}%")

            # Build holdings list with calculated fields
            holdings_data = []
            for h in goal_holdings:
                holdings_data.append({
                    'id': h['id'],
                    'scheme_name': h['scheme_name'],
                    'folio_number': h['folio_number'],
                    'asset_class': h.get('asset_class', 'Equity'),
                    'units': h['unit_balance'],
                    'cost_value': h['cost_value'],
                    'market_value': h['market_value'],
                    'profit': h['market_value'] - h['cost_value'],
                    'return_pct': ((h['market_value'] - h['cost_value']) / h['cost_value'] * 100) if h['cost_value'] > 0 else 0,
                    'monthly_sip_amount': h.get('monthly_sip_amount', 0)
                })

            goal_summaries.append({
                'goal_id': goal_name,  # Use name as ID since goals are stored in JSON
                'goal_name': goal_name,
                'target_amount': target_amount,
                'target_year': target_year,
                'years_to_goal': years_to_goal,
                'amount_available': amount_allocated,  # Allocated amount from Set Goal
                'total_value': total_value,  # FIX: Include total value (amount_available + holdings) for progress
                # Include original SIP planner goal fields for frontend compatibility
                'goalType': goal.get('goalType', 'custom'),
                'sipRequired': goal.get('sipRequired', 0),
                'sipCalculated': goal.get('sipCalculated', False),  # FIX: Include sipCalculated flag
                'amountRequiredToday': goal.get('amountRequiredToday', 0),
                'holdings': holdings_data,
                'totals': {
                    'invested': total_invested,
                    'current_value': total_current,
                    'profit': total_profit,
                    'holdings_count': len(goal_holdings),
                    'monthly_sip': total_monthly_sip
                },
                'asset_breakdown': asset_breakdown,
                'asset_breakdown_pct': asset_breakdown_pct,
                'sip_breakdown': sip_breakdown,
                'sip_breakdown_pct': sip_breakdown_pct,
                'recommended_allocation': recommended_allocation,
                'progress': {
                    'percentage': round(progress_percentage, 2),
                    'gap_amount': gap_amount,
                    'is_on_track': is_on_track
                }
            })

        return {
            'goals': goal_summaries,
            'total_holdings': total_holdings,
            'assigned_holdings': assigned_holdings
        }

    except Exception as e:
        print(f"[Goal Investment Summary] ERROR OCCURRED:")
        print(f"[Goal Investment Summary] Error type: {type(e).__name__}")
        print(f"[Goal Investment Summary] Error message: {str(e)}")
        print(f"[Goal Investment Summary] Full traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


class ManualHoldingRequest(BaseModel):
    """Manual holding request model"""
    user_id: str
    scheme_code: str
    scheme_name: str
    isin: str
    unit_balance: float
    invested_value: Optional[float] = None
    folio_number: Optional[str] = None
    purchase_date: Optional[str] = None


@router.post("/add-manual-holding")
async def add_manual_holding(
    request: ManualHoldingRequest,
    current_user: User = Depends(get_authorized_user)
):
    """
    Add a holding manually (without CAMS upload)
    Auto-fetches current NAV based on ISIN

    Args:
        request: Manual holding data including user_id, scheme info, units, etc.

    Returns:
        Created holding with auto-fetched NAV
    """
    try:
        # SECURITY: Verify user can only add holdings to their own portfolio
        request.user_id = sanitize_user_id(request.user_id)
        verify_user_ownership(current_user, request.user_id)

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        print(f"[Add Manual Holding] User: {request.user_id}, Scheme: {request.scheme_name}, Units: {request.unit_balance}")

        # Fetch current NAV from MFAPI using scheme_code
        from .nav_service import fetch_latest_nav

        nav_data = await fetch_latest_nav(request.scheme_code)

        if not nav_data or not nav_data.get('nav'):
            raise HTTPException(
                status_code=404,
                detail=f"Could not fetch NAV for scheme {request.scheme_name}. Please check the scheme code or try again later."
            )

        current_nav = float(nav_data['nav'])
        nav_date_str = nav_data['date']

        # Parse nav_date from MFAPI format (e.g., '17-Dec-2025') to ISO format
        try:
            from datetime import datetime
            nav_date = datetime.strptime(nav_date_str, '%d-%b-%Y').date().isoformat()
        except:
            nav_date = datetime.now().date().isoformat()

        if current_nav <= 0:
            raise HTTPException(status_code=400, detail="Invalid NAV data for this scheme")

        # Calculate values
        market_value = request.unit_balance * current_nav

        # If invested_value provided, use it; otherwise assume cost = current value (0% returns)
        if request.invested_value and request.invested_value > 0:
            cost_value = request.invested_value
            avg_cost_per_unit = cost_value / request.unit_balance
        else:
            cost_value = market_value
            avg_cost_per_unit = current_nav

        absolute_profit = market_value - cost_value
        absolute_return_percentage = (absolute_profit / cost_value * 100) if cost_value > 0 else 0

        # Create holding record
        holding_data = {
            "user_id": request.user_id,
            "folio_number": request.folio_number or f"MANUAL-{request.scheme_code}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "scheme_code": request.scheme_code,
            "scheme_name": request.scheme_name,
            "isin": request.isin,
            "unit_balance": request.unit_balance,
            "avg_cost_per_unit": avg_cost_per_unit,
            "cost_value": cost_value,
            "current_nav": current_nav,
            "nav_date": nav_date,
            "market_value": market_value,
            "absolute_profit": absolute_profit,
            "absolute_return_percentage": round(absolute_return_percentage, 2),
            "is_active": True,
            "entry_method": "manual",
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }

        # Insert into database
        insert_response = supabase.from_("portfolio_holdings").insert(holding_data).execute()

        if not insert_response.data:
            raise HTTPException(status_code=500, detail="Failed to create holding")

        created_holding = insert_response.data[0]

        print(f"[Add Manual Holding] Success! Holding ID: {created_holding.get('id')}")

        return {
            "success": True,
            "message": "Holding added successfully with latest NAV",
            "holding": created_holding
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Add Manual Holding] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to add holding: {str(e)}")


@router.get("/search-schemes")
async def search_schemes(query: str, limit: int = 20):
    """
    Search mutual fund schemes from scheme_master table

    Args:
        query: Search term (scheme name, AMC name, or partial match)
        limit: Maximum number of results to return (default 20)

    Returns:
        List of matching schemes with scheme_code, scheme_name, amc_name, category
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        if not query or len(query) < 2:
            return {"schemes": []}

        # Search in scheme_master table
        # Use ilike for case-insensitive search on scheme_name
        search_pattern = f"%{query}%"

        response = supabase.from_("scheme_master") \
            .select("scheme_code, scheme_name, amc_name, category") \
            .or_(f"scheme_name.ilike.{search_pattern},amc_name.ilike.{search_pattern}") \
            .limit(limit) \
            .execute()

        schemes = response.data or []

        print(f"[Search Schemes] Query: '{query}', Found: {len(schemes)} results")

        return {"schemes": schemes}

    except Exception as e:
        print(f"[Search Schemes] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to search schemes: {str(e)}")


@router.get("/scheme-details/{scheme_code}")
async def get_scheme_details(scheme_code: str):
    """
    Get detailed information about a specific scheme including ISIN codes

    Args:
        scheme_code: The unique scheme code

    Returns:
        Full scheme details including ISINs for growth and dividend plans
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        # Fetch scheme details from scheme_master
        response = supabase.from_("scheme_master") \
            .select("*") \
            .eq("scheme_code", scheme_code) \
            .execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail=f"Scheme not found: {scheme_code}")

        scheme = response.data[0]

        print(f"[Scheme Details] Fetched details for scheme_code: {scheme_code}")

        return {"scheme": scheme}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Scheme Details] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch scheme details: {str(e)}")


# Export router
__all__ = ['router']
