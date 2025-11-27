from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import secrets
import string
from supabase import create_client
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.email_service import send_access_code_email, send_payment_receipt_email

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

print(f"[Subscriptions API] Initialized with Supabase: {supabase is not None}")

# ============================================
# MODELS
# ============================================

class PromoCodeValidation(BaseModel):
    code: str

class PromoCodeValidationResponse(BaseModel):
    valid: bool
    message: str
    code_name: Optional[str] = None
    benefits: Optional[dict] = None
    slots_remaining: Optional[int] = None
    time_remaining: Optional[str] = None
    discount_percentage: Optional[int] = None

class SubscriptionCreate(BaseModel):
    user_id: str
    plan_name: str  # 'free', 'premium', 'expert_plus'
    billing_cycle: str  # 'monthly', 'yearly', 'lifetime'
    promo_code: Optional[str] = None
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    user_email: Optional[str] = None  # For sending access code
    user_name: Optional[str] = None  # For personalizing email

class SubscriptionResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[str] = None
    access_code: Optional[str] = None
    plan_details: Optional[dict] = None

class AccessCodeValidation(BaseModel):
    user_id: str
    access_code: str

class PromoStatsResponse(BaseModel):
    code: str
    code_name: str
    total_slots: Optional[int]
    used_slots: int
    remaining_slots: Optional[int]
    percentage_claimed: float
    time_remaining: Optional[str]
    is_active: bool
    end_date: Optional[datetime]

# ============================================
# HELPER FUNCTIONS
# ============================================

def generate_access_code(length=10):
    """Generate unique access code like FE-2K4X9P"""
    chars = string.ascii_uppercase + string.digits
    code = 'FE-' + ''.join(secrets.choice(chars) for _ in range(length-3))
    return code

def calculate_time_remaining(end_date):
    """Calculate human-readable time remaining"""
    if not end_date:
        return None

    now = datetime.now()
    if isinstance(end_date, str):
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except:
            return None

    delta = end_date - now

    if delta.total_seconds() <= 0:
        return "EXPIRED"

    days = delta.days
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    if days > 0:
        return f"{days}d {hours}h {minutes}m"
    elif hours > 0:
        return f"{hours}h {minutes}m {seconds}s"
    else:
        return f"{minutes}m {seconds}s"

# ============================================
# PROMO CODE ENDPOINTS
# ============================================

@router.post("/validate-promo-code", response_model=PromoCodeValidationResponse)
async def validate_promo_code(data: PromoCodeValidation):
    """Validate promo code and return details"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Validate Promo] Checking code: {data.code}")

        # Fetch promo code
        response = supabase.from_("promo_codes")\
            .select("*")\
            .eq("code", data.code.upper())\
            .execute()

        if not response.data or len(response.data) == 0:
            return PromoCodeValidationResponse(
                valid=False,
                message="Invalid promo code"
            )

        promo = response.data[0]
        print(f"[Validate Promo] Found promo: {promo['code_name']}")

        # Check if active
        if not promo['is_active']:
            return PromoCodeValidationResponse(
                valid=False,
                message="This promo code is no longer active"
            )

        # Check end date
        if promo['end_date']:
            end_date = datetime.fromisoformat(promo['end_date'].replace('Z', '+00:00'))
            if datetime.now() > end_date:
                return PromoCodeValidationResponse(
                    valid=False,
                    message="This promo code has expired"
                )

        # Check slots (if limited)
        slots_remaining = None
        if promo['total_slots']:
            slots_remaining = promo['total_slots'] - promo['used_slots']
            if slots_remaining <= 0:
                return PromoCodeValidationResponse(
                    valid=False,
                    message="All slots for this promo code have been claimed"
                )

        # Calculate time remaining
        time_remaining = calculate_time_remaining(promo.get('end_date'))

        return PromoCodeValidationResponse(
            valid=True,
            message=f"Valid! {promo['code_name']}",
            code_name=promo['code_name'],
            benefits=promo['benefits'],
            slots_remaining=slots_remaining,
            time_remaining=time_remaining,
            discount_percentage=promo.get('discount_percentage')
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Validate Promo] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/promo-stats/{code}", response_model=PromoStatsResponse)
async def get_promo_stats(code: str):
    """Get real-time stats for FOMO display"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Promo Stats] Fetching stats for: {code}")

        response = supabase.from_("promo_codes")\
            .select("*")\
            .eq("code", code.upper())\
            .execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Promo code not found")

        promo = response.data[0]

        remaining_slots = None
        percentage_claimed = 0

        if promo['total_slots']:
            remaining_slots = promo['total_slots'] - promo['used_slots']
            percentage_claimed = (promo['used_slots'] / promo['total_slots']) * 100

        time_remaining = calculate_time_remaining(promo.get('end_date'))

        return PromoStatsResponse(
            code=promo['code'],
            code_name=promo['code_name'],
            total_slots=promo['total_slots'],
            used_slots=promo['used_slots'],
            remaining_slots=remaining_slots,
            percentage_claimed=round(percentage_claimed, 2),
            time_remaining=time_remaining,
            is_active=promo['is_active'],
            end_date=promo.get('end_date')
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Promo Stats] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-promos")
async def get_active_promos():
    """Get all active promo campaigns"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Active Promos] Fetching all active promos")

        response = supabase.from_("promo_codes")\
            .select("code, code_name, code_type, total_slots, used_slots, end_date, benefits")\
            .eq("is_active", True)\
            .order("created_at", desc=False)\
            .execute()

        promos = []
        for promo in response.data:
            remaining_slots = None
            if promo['total_slots']:
                remaining_slots = promo['total_slots'] - promo['used_slots']

            promos.append({
                "code": promo['code'],
                "code_name": promo['code_name'],
                "code_type": promo['code_type'],
                "total_slots": promo['total_slots'],
                "used_slots": promo['used_slots'],
                "remaining_slots": remaining_slots,
                "time_remaining": calculate_time_remaining(promo.get('end_date')),
                "benefits": promo['benefits']
            })

        print(f"[Active Promos] Found {len(promos)} active promos")

        return {
            "success": True,
            "active_promos": promos
        }

    except Exception as e:
        print(f"[Active Promos] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# SUBSCRIPTION ENDPOINTS
# ============================================

@router.post("/create-subscription", response_model=SubscriptionResponse)
async def create_subscription(data: SubscriptionCreate):
    """Create new subscription with optional promo code"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Create Subscription] User: {data.user_id}, Plan: {data.plan_name}, Promo: {data.promo_code}")

        # Fetch plan details
        plan_response = supabase.from_("subscription_plans")\
            .select("*")\
            .eq("plan_name", data.plan_name)\
            .eq("is_active", True)\
            .execute()

        if not plan_response.data or len(plan_response.data) == 0:
            raise HTTPException(status_code=404, detail="Subscription plan not found")

        plan = plan_response.data[0]
        print(f"[Create Subscription] Found plan: {plan['plan_display_name']}")

        # Handle promo code if provided
        promo_benefits = None
        is_lifetime = False

        if data.promo_code:
            print(f"[Create Subscription] Validating promo code: {data.promo_code}")
            promo_response = supabase.from_("promo_codes")\
                .select("*")\
                .eq("code", data.promo_code.upper())\
                .eq("is_active", True)\
                .execute()

            if promo_response.data and len(promo_response.data) > 0:
                promo = promo_response.data[0]
                promo_benefits = promo['benefits']

                # Check if lifetime benefit
                if promo_benefits.get('lifetime'):
                    is_lifetime = True
                    print(f"[Create Subscription] Lifetime access granted via promo")

                # Increment used slots
                if promo['total_slots']:
                    new_used_slots = promo['used_slots'] + 1
                    supabase.from_("promo_codes")\
                        .update({"used_slots": new_used_slots, "updated_at": datetime.now().isoformat()})\
                        .eq("id", promo['id'])\
                        .execute()
                    print(f"[Create Subscription] Updated promo slots: {new_used_slots}/{promo['total_slots']}")

        # Generate unique access code
        access_code = generate_access_code()
        print(f"[Create Subscription] Generated access code: {access_code}")

        # Calculate subscription end date
        subscription_end = None
        if not is_lifetime:
            if data.billing_cycle == 'monthly':
                subscription_end = datetime.now() + timedelta(days=30)
            elif data.billing_cycle == 'yearly':
                subscription_end = datetime.now() + timedelta(days=365)

        # Create subscription
        subscription_data = {
            "user_id": data.user_id,
            "plan_id": plan['id'],
            "status": "active",
            "access_code": access_code,
            "billing_cycle": data.billing_cycle,
            "subscription_end": subscription_end.isoformat() if subscription_end else None,
            "payment_method": data.payment_method,
            "is_lifetime": is_lifetime,
            "promo_code_used": data.promo_code,
            "payment_status": "completed" if data.payment_id else "pending"
        }

        sub_response = supabase.from_("user_subscriptions")\
            .insert(subscription_data)\
            .execute()

        if not sub_response.data or len(sub_response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create subscription")

        subscription_id = sub_response.data[0]['id']
        print(f"[Create Subscription] Created subscription: {subscription_id}")

        # Track promo code usage
        if data.promo_code and promo_response.data and len(promo_response.data) > 0:
            supabase.from_("promo_code_usage")\
                .insert({
                    "promo_code_id": promo_response.data[0]['id'],
                    "user_id": data.user_id,
                    "subscription_id": subscription_id,
                    "benefits_applied": promo_benefits
                })\
                .execute()
            print(f"[Create Subscription] Tracked promo usage")

        # Send access code email if user email provided
        if data.user_email:
            user_name = data.user_name or "Valued Customer"
            email_sent = send_access_code_email(
                to_email=data.user_email,
                user_name=user_name,
                access_code=access_code,
                plan_name=plan['plan_display_name'],
                is_lifetime=is_lifetime
            )
            if email_sent:
                print(f"[Create Subscription] Access code email sent to {data.user_email}")
            else:
                print(f"[Create Subscription] Email not sent (SMTP not configured or error occurred)")

        return SubscriptionResponse(
            success=True,
            message="Subscription created successfully!",
            subscription_id=subscription_id,
            access_code=access_code,
            plan_details={
                "plan_name": plan['plan_display_name'],
                "is_lifetime": is_lifetime,
                "features": plan['features']
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Create Subscription] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-access-code")
async def validate_access_code(data: AccessCodeValidation):
    """Validate access code and unlock features"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Validate Access Code] User: {data.user_id}, Code: {data.access_code}")

        # Check if code exists and belongs to user
        response = supabase.from_("user_subscriptions")\
            .select("*, subscription_plans(*)")\
            .eq("user_id", data.user_id)\
            .eq("access_code", data.access_code)\
            .eq("status", "active")\
            .execute()

        if not response.data or len(response.data) == 0:
            return {
                "valid": False,
                "message": "Invalid access code or code already used"
            }

        subscription = response.data[0]

        # Check if already redeemed
        if subscription.get('code_redeemed_at'):
            return {
                "valid": True,
                "already_redeemed": True,
                "message": "Access code already activated",
                "redeemed_at": subscription['code_redeemed_at'],
                "features_unlocked": subscription['subscription_plans']['features']
            }

        # Mark code as redeemed
        supabase.from_("user_subscriptions")\
            .update({"code_redeemed_at": datetime.now().isoformat(), "updated_at": datetime.now().isoformat()})\
            .eq("id", subscription['id'])\
            .execute()

        print(f"[Validate Access Code] Code redeemed successfully")

        return {
            "valid": True,
            "already_redeemed": False,
            "message": "Access code activated successfully!",
            "features_unlocked": subscription['subscription_plans']['features'],
            "is_lifetime": subscription.get('is_lifetime', False)
        }

    except Exception as e:
        print(f"[Validate Access Code] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-subscription/{user_id}")
async def get_user_subscription(user_id: str):
    """Get user's current subscription status"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[User Subscription] Fetching for user: {user_id}")

        response = supabase.from_("user_subscriptions")\
            .select("*, subscription_plans(*)")\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()

        if not response.data or len(response.data) == 0:
            return {
                "has_subscription": False,
                "plan": "free"
            }

        subscription = response.data[0]

        return {
            "has_subscription": True,
            "subscription_id": subscription['id'],
            "plan": subscription['subscription_plans']['plan_name'],
            "plan_display_name": subscription['subscription_plans']['plan_display_name'],
            "features": subscription['subscription_plans']['features'],
            "is_lifetime": subscription.get('is_lifetime', False),
            "subscription_end": subscription.get('subscription_end'),
            "access_code": subscription.get('access_code'),
            "code_redeemed": subscription.get('code_redeemed_at') is not None
        }

    except Exception as e:
        print(f"[User Subscription] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

print("[Subscriptions API] All endpoints registered successfully")
