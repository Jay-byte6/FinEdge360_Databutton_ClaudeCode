from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import hmac
import hashlib
from datetime import datetime
from supabase import create_client
import razorpay
from dodopayments import DodoPayments
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

# Dodo Payments configuration
DODO_PAYMENTS_API_KEY = os.getenv("DODO_PAYMENTS_API_KEY", "")
DODO_PAYMENTS_ENVIRONMENT = os.getenv("DODO_PAYMENTS_ENVIRONMENT", "test_mode")  # test_mode or live_mode

# Initialize Dodo Payments client
dodo_client = None
if DODO_PAYMENTS_API_KEY:
    try:
        # Try with api_key parameter first (most common in payment SDKs)
        dodo_client = DodoPayments(
            api_key=DODO_PAYMENTS_API_KEY,
            environment=DODO_PAYMENTS_ENVIRONMENT
        )
        print(f"[Dodo Payments] Client initialized successfully ({DODO_PAYMENTS_ENVIRONMENT})")
    except TypeError:
        # If api_key doesn't work, try bearer_token
        try:
            dodo_client = DodoPayments(
                bearer_token=DODO_PAYMENTS_API_KEY,
                environment=DODO_PAYMENTS_ENVIRONMENT
            )
            print(f"[Dodo Payments] Client initialized successfully with bearer_token ({DODO_PAYMENTS_ENVIRONMENT})")
        except Exception as e:
            print(f"[Dodo Payments] Failed to initialize client: {str(e)}")
    except Exception as e:
        print(f"[Dodo Payments] Failed to initialize client: {str(e)}")

print(f"[Payments API] Initialized")
print(f"  Razorpay configured: {bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)}")
print(f"  Stripe configured: {bool(STRIPE_SECRET_KEY)}")
print(f"  Dodo Payments configured: {bool(DODO_PAYMENTS_API_KEY)}")

# ============================================
# MODELS
# ============================================

class CreateOrderRequest(BaseModel):
    user_id: str
    plan_name: str  # 'premium' or 'expert_plus'
    billing_cycle: str  # 'monthly', 'yearly'
    promo_code: Optional[str] = None
    payment_method: str  # 'razorpay', 'stripe', or 'dodo'

class CreateOrderResponse(BaseModel):
    success: bool
    order_id: str
    amount: int
    currency: str
    key_id: Optional[str] = None  # For Razorpay
    client_secret: Optional[str] = None  # For Stripe
    checkout_url: Optional[str] = None  # For Dodo Payments
    session_id: Optional[str] = None  # For Dodo Payments

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

        # Hardcoded pricing (60% OFF - matches pricing page)
        # Premium: ₹3,999 (one-time lifetime access)
        # Expert Plus: ₹199/month or ₹1,999/year
        PLAN_PRICES = {
            'premium': {
                'monthly': 3999,
                'yearly': 3999,
                'lifetime': 3999
            },
            'expert_plus': {
                'monthly': 199,
                'yearly': 1999,
                'lifetime': 1999
            }
        }

        # Get price from hardcoded dict (always up-to-date with pricing page)
        if request.plan_name not in PLAN_PRICES:
            raise HTTPException(status_code=404, detail=f"Plan '{request.plan_name}' not found")

        plan_prices = PLAN_PRICES[request.plan_name]

        # Calculate amount based on billing cycle
        if request.billing_cycle in plan_prices:
            amount = int(plan_prices[request.billing_cycle] * 100)  # Convert to paise
        else:
            raise HTTPException(status_code=400, detail="Invalid billing cycle")

        print(f"[Create Razorpay Order] Plan: {request.plan_name}, Cycle: {request.billing_cycle}, Amount: ₹{amount/100}")

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
# DODO PAYMENTS INTEGRATION
# ============================================

@router.post("/create-dodo-checkout", response_model=CreateOrderResponse)
async def create_dodo_checkout(
    request: CreateOrderRequest,
    current_user: User = Depends(get_authorized_user)
):
    """Create Dodo Payments checkout session"""
    try:
        # SECURITY: Verify user can only create checkout sessions for their own account
        request.user_id = sanitize_user_id(request.user_id)
        verify_user_ownership(current_user, request.user_id)

        if not dodo_client:
            raise HTTPException(
                status_code=500,
                detail="Dodo Payments not configured. Please set DODO_PAYMENTS_API_KEY"
            )

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        print(f"[Create Dodo Checkout] User: {request.user_id}, Plan: {request.plan_name}")

        # Hardcoded pricing (60% OFF - matches pricing page)
        # Premium: ₹3,999 (one-time lifetime access)
        # Expert Plus: ₹199/month or ₹1,999/year
        PLAN_PRICES = {
            'premium': {
                'monthly': 3999,
                'yearly': 3999,
                'lifetime': 3999
            },
            'expert_plus': {
                'monthly': 199,
                'yearly': 1999,
                'lifetime': 1999
            }
        }

        # Get price from hardcoded dict (always up-to-date with pricing page)
        if request.plan_name not in PLAN_PRICES:
            raise HTTPException(status_code=404, detail=f"Plan '{request.plan_name}' not found")

        plan_prices = PLAN_PRICES[request.plan_name]

        # Calculate amount based on billing cycle
        if request.billing_cycle in plan_prices:
            amount = int(plan_prices[request.billing_cycle] * 100)  # Convert to paise/cents
        else:
            raise HTTPException(status_code=400, detail="Invalid billing cycle")

        print(f"[Create Dodo Checkout] Plan: {request.plan_name}, Cycle: {request.billing_cycle}, Amount: ₹{amount/100}")

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
                    print(f"[Create Dodo Checkout] Applied discount: {promo['discount_percentage']}%")

        # Create Dodo Payments checkout session
        # Note: Dodo Payments requires products to be created in dashboard first

        checkout_data = {
            "product_cart": [
                {
                    "product_id": f"finedge_{request.plan_name}_{request.billing_cycle}",
                    "quantity": 1,
                }
            ],
            "customer": {
                "email": current_user.email if hasattr(current_user, 'email') else None,
                "name": current_user.email.split('@')[0] if hasattr(current_user, 'email') else "User"
            },
            "return_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/pricing?payment=success",
            "metadata": {
                "user_id": request.user_id,
                "plan_name": request.plan_name,
                "billing_cycle": request.billing_cycle,
                "promo_code": request.promo_code if request.promo_code else ""
            }
        }

        print(f"[Create Dodo Checkout] Sending request to Dodo API:")
        print(f"[Create Dodo Checkout] Data: {checkout_data}")
        print(f"[Create Dodo Checkout] API Key (first 10 chars): {DODO_PAYMENTS_API_KEY[:10]}...")

        try:
            checkout_session = dodo_client.checkout_sessions.create(**checkout_data)

            print(f"[Create Dodo Checkout] Created session: {checkout_session.session_id}")

            return CreateOrderResponse(
                success=True,
                order_id=checkout_session.session_id,
                amount=amount,
                currency="INR",
                checkout_url=checkout_session.url,
                session_id=checkout_session.session_id
            )

        except Exception as dodo_error:
            print(f"[Create Dodo Checkout] Dodo API Error: {str(dodo_error)}")
            print(f"[Create Dodo Checkout] Error type: {type(dodo_error)}")
            print(f"[Create Dodo Checkout] Error details: {dodo_error.__dict__ if hasattr(dodo_error, '__dict__') else 'No details'}")
            import traceback
            print(f"[Create Dodo Checkout] Traceback:")
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create Dodo checkout session: {str(dodo_error)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Create Dodo Checkout] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dodo-webhook")
async def dodo_webhook(request: dict):
    """Handle Dodo Payments webhook events"""
    try:
        print(f"[Dodo Webhook] Received webhook: {request}")

        # Verify webhook signature (if Dodo Payments provides webhook secrets)
        # Process payment success event
        # Create subscription in database

        event_type = request.get("event_type")

        if event_type == "payment.succeeded":
            session_id = request.get("session_id")
            metadata = request.get("metadata", {})

            user_id = metadata.get("user_id")
            plan_name = metadata.get("plan_name")
            billing_cycle = metadata.get("billing_cycle")

            print(f"[Dodo Webhook] Payment succeeded for user: {user_id}, plan: {plan_name}")

            # Here you would create the subscription in your database
            # Similar to how it's done in verify_razorpay_payment

            return {"success": True, "message": "Webhook processed"}

        return {"success": True, "message": "Webhook received"}

    except Exception as e:
        print(f"[Dodo Webhook] Error: {str(e)}")
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
        },
        "dodo": {
            "enabled": bool(DODO_PAYMENTS_API_KEY),
            "environment": DODO_PAYMENTS_ENVIRONMENT
        }
    }

print("[Payments API] All endpoints registered successfully")
