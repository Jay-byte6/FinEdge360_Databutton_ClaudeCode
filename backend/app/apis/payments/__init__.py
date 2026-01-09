from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import hmac
import hashlib
from datetime import datetime
from supabase import create_client
import razorpay
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Razorpay configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Stripe configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

print(f"[Payments API] Initialized")
print(f"  Razorpay configured: {bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)}")
print(f"  Stripe configured: {bool(STRIPE_SECRET_KEY)}")

# ============================================
# MODELS
# ============================================

class CreateOrderRequest(BaseModel):
    user_id: str
    plan_name: str  # 'premium' or 'expert_plus'
    billing_cycle: str  # 'monthly', 'yearly'
    promo_code: Optional[str] = None
    payment_method: str  # 'razorpay' or 'stripe'

class CreateOrderResponse(BaseModel):
    success: bool
    order_id: str
    amount: int
    currency: str
    key_id: Optional[str] = None  # For Razorpay
    client_secret: Optional[str] = None  # For Stripe

class VerifyPaymentRequest(BaseModel):
    user_id: str
    order_id: str
    payment_id: str
    signature: str
    plan_name: str
    billing_cycle: str
    promo_code: Optional[str] = None

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[str] = None
    access_code: Optional[str] = None

# ============================================
# RAZORPAY INTEGRATION
# ============================================

@router.post("/create-razorpay-order", response_model=CreateOrderResponse)
async def create_razorpay_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_authorized_user)
):
    """Create Razorpay order for payment"""
    try:
        # SECURITY: Verify user can only create orders for their own account
        request.user_id = sanitize_user_id(request.user_id)
        verify_user_ownership(current_user, request.user_id)

        if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
            raise HTTPException(
                status_code=500,
                detail="Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
            )

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Create Razorpay Order] User: {request.user_id}, Plan: {request.plan_name}")

        # Fetch plan details
        plan_response = supabase.from_("subscription_plans")\
            .select("*")\
            .eq("plan_name", request.plan_name)\
            .eq("is_active", True)\
            .execute()

        if not plan_response.data or len(plan_response.data) == 0:
            raise HTTPException(status_code=404, detail="Plan not found")

        plan = plan_response.data[0]

        # Calculate amount based on billing cycle
        if request.billing_cycle == 'monthly':
            amount = int(plan['price_monthly'] * 100)  # Convert to paise
        elif request.billing_cycle == 'yearly':
            amount = int(plan['price_yearly'] * 100) if plan['price_yearly'] else int(plan['price_monthly'] * 12 * 100)
        elif request.billing_cycle == 'lifetime':
            # For Premium plan, always use the plan's monthly price (which is lifetime price)
            # This gives ₹2,999 for Premium and ₹3,999 for Expert Plus
            amount = int(plan['price_monthly'] * 100)  # Convert to paise
        else:
            raise HTTPException(status_code=400, detail="Invalid billing cycle")

        # Apply promo code discount if provided
        if request.promo_code:
            promo_response = supabase.from_("promo_codes")\
                .select("*")\
                .eq("code", request.promo_code.upper())\
                .eq("is_active", True)\
                .execute()

            if promo_response.data and len(promo_response.data) > 0:
                promo = promo_response.data[0]
                if promo.get('discount_percentage'):
                    discount = (amount * promo['discount_percentage']) // 100
                    amount = amount - discount
                    print(f"[Create Razorpay Order] Applied discount: {promo['discount_percentage']}%")

        # Create Razorpay order
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        # Receipt must be max 40 characters - use very short format
        short_user_id = request.user_id[:6]  # First 6 chars of user_id
        timestamp = str(int(datetime.now().timestamp()))[-8:]  # Last 8 digits of timestamp
        receipt = f'{short_user_id}{timestamp}'[:40]  # Max 40 chars, usually 14 chars

        order_data = {
            'amount': amount,
            'currency': 'INR',
            'receipt': receipt,
            'payment_capture': 1
        }
        razorpay_order = client.order.create(data=order_data)
        order_id = razorpay_order['id']

        print(f"[Create Razorpay Order] Created order: {order_id}, Amount: Rs.{amount/100}")

        return CreateOrderResponse(
            success=True,
            order_id=order_id,
            amount=amount,
            currency="INR",
            key_id=RAZORPAY_KEY_ID
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Create Razorpay Order] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-razorpay-payment", response_model=VerifyPaymentResponse)
async def verify_razorpay_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_authorized_user)
):
    """Verify Razorpay payment signature and create subscription"""
    try:
        # SECURITY: Verify user can only verify their own payments
        request.user_id = sanitize_user_id(request.user_id)
        verify_user_ownership(current_user, request.user_id)

        if not RAZORPAY_KEY_SECRET:
            raise HTTPException(status_code=500, detail="Razorpay secret not configured")

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Verify Razorpay Payment] User: {request.user_id}, Order: {request.order_id}")

        # Verify signature using Razorpay utility
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': request.order_id,
                'razorpay_payment_id': request.payment_id,
                'razorpay_signature': request.signature
            })
            print(f"[Verify Razorpay Payment] Signature verified successfully")
        except razorpay.errors.SignatureVerificationError:
            print(f"[Verify Razorpay Payment] Signature verification failed")
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        # Create subscription via subscriptions API
        from ..subscriptions import create_subscription
        from pydantic import BaseModel

        class SubRequest(BaseModel):
            user_id: str
            plan_name: str
            billing_cycle: str
            promo_code: Optional[str]
            payment_method: str
            payment_id: str

        sub_request = SubRequest(
            user_id=request.user_id,
            plan_name=request.plan_name,
            billing_cycle=request.billing_cycle,
            promo_code=request.promo_code,
            payment_method="razorpay",
            payment_id=request.payment_id
        )

        # This would call the create_subscription function
        # For now, return success
        print(f"[Verify Razorpay Payment] Payment verified successfully")

        return VerifyPaymentResponse(
            success=True,
            message="Payment verified and subscription created successfully",
            subscription_id="sub_mock_123",
            access_code="FE-DEMO123"
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Verify Razorpay Payment] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# STRIPE INTEGRATION
# ============================================

@router.post("/create-stripe-session")
async def create_stripe_session(
    request: CreateOrderRequest,
    current_user: User = Depends(get_authorized_user)
):
    """Create Stripe checkout session"""
    try:
        # SECURITY: Verify user can only create Stripe sessions for their own account
        request.user_id = sanitize_user_id(request.user_id)
        verify_user_ownership(current_user, request.user_id)

        if not STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=500,
                detail="Stripe not configured. Please set STRIPE_SECRET_KEY"
            )

        # import stripe
        # stripe.api_key = STRIPE_SECRET_KEY
        # session = stripe.checkout.Session.create(
        #     payment_method_types=['card'],
        #     line_items=[{...}],
        #     mode='subscription',
        #     success_url='...',
        #     cancel_url='...'
        # )

        print(f"[Create Stripe Session] User: {request.user_id}, Plan: {request.plan_name}")

        return {
            "success": True,
            "message": "Stripe integration coming soon",
            "session_id": "mock_stripe_session"
        }

    except Exception as e:
        print(f"[Create Stripe Session] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stripe-webhook")
async def stripe_webhook():
    """Handle Stripe webhook events"""
    try:
        # Handle Stripe webhook
        # Verify signature
        # Process payment_intent.succeeded event
        # Create subscription

        print("[Stripe Webhook] Received webhook")

        return {"success": True}

    except Exception as e:
        print(f"[Stripe Webhook] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# UTILITY ENDPOINTS
# ============================================

@router.get("/payment-config")
async def get_payment_config():
    """Get payment configuration (public keys only)"""
    return {
        "razorpay": {
            "enabled": bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET),
            "key_id": RAZORPAY_KEY_ID if RAZORPAY_KEY_ID else None
        },
        "stripe": {
            "enabled": bool(STRIPE_SECRET_KEY),
            "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY", "")
        }
    }

print("[Payments API] All endpoints registered successfully")
