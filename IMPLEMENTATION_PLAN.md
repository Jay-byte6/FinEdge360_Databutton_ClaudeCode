# 🚀 FINEDGE360 COMPLETE IMPLEMENTATION PLAN
## Hybrid Model + User Flow + FOMO Strategy

**Date Created:** 2025-11-24
**Estimated Timeline:** 14-21 days
**Target Revenue:** ₹50,000-2,00,000/month within 90 days

---

## 📊 OVERVIEW

### What We're Building:
1. **Freemium Model:** Free basic tools + Premium subscription (₹999/month)
2. **FOMO Campaigns:** Founder's Circle (50 lifetime users) + Time-limited offers
3. **Dual Consultation Model:** 15-min Discovery Call (Free) + 45-min Deep Dive (Premium)
4. **Access Code System:** Email-based unlock for Portfolio & SIP Planner
5. **Expert Commission System:** 20-30% revenue share on paid services

---

## 🎯 PHASE 1: FOUNDATION (Days 1-3)
### Backend Infrastructure & Core Systems

#### **DAY 1: Database Schema & Tables**

**Task 1.1: Create Subscription Management Tables**

```sql
-- File: backend/migrations/001_subscriptions.sql

-- Subscription plans table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL, -- 'free', 'premium', 'expert_plus'
    plan_display_name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL, -- List of features
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
    access_code VARCHAR(20) UNIQUE,
    code_redeemed_at TIMESTAMP,
    subscription_start TIMESTAMP DEFAULT NOW(),
    subscription_end TIMESTAMP,
    billing_cycle VARCHAR(20), -- 'monthly', 'yearly', 'lifetime'
    payment_method VARCHAR(50),
    payment_status VARCHAR(20),
    stripe_subscription_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    is_lifetime BOOLEAN DEFAULT FALSE,
    promo_code_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_access_code ON user_subscriptions(access_code);
```

**Task 1.2: Create Promo Code System Tables**

```sql
-- File: backend/migrations/002_promo_codes.sql

-- Promo codes table
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    code_name VARCHAR(100) NOT NULL, -- 'Founder's Circle', 'Early Bird', etc.
    code_type VARCHAR(30) NOT NULL, -- 'limited_slots', 'time_limited', 'percentage_off', 'free_lifetime'
    total_slots INTEGER, -- NULL for unlimited
    used_slots INTEGER DEFAULT 0,
    discount_percentage INTEGER, -- e.g., 50 for 50% off
    discount_amount DECIMAL(10,2), -- Fixed amount discount
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    benefits JSONB NOT NULL, -- {"lifetime": true, "premium_access": true, "expert_consultation": true, "badge": "founder"}
    terms_conditions TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Promo code usage tracking
CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id INTEGER NOT NULL REFERENCES promo_codes(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    subscription_id UUID REFERENCES user_subscriptions(id),
    used_at TIMESTAMP DEFAULT NOW(),
    benefits_applied JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Promo stats for real-time FOMO display
CREATE TABLE promo_code_stats (
    id SERIAL PRIMARY KEY,
    promo_code_id INTEGER REFERENCES promo_codes(id),
    timestamp TIMESTAMP DEFAULT NOW(),
    page_views INTEGER DEFAULT 0,
    code_attempts INTEGER DEFAULT 0,
    successful_redemptions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2)
);

-- Create indexes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_usage_user ON promo_code_usage(user_id);
CREATE INDEX idx_promo_usage_code ON promo_code_usage(promo_code_id);

-- Insert initial promo codes
INSERT INTO promo_codes (
    code,
    code_name,
    code_type,
    total_slots,
    used_slots,
    start_date,
    end_date,
    benefits,
    terms_conditions
) VALUES
(
    'FOUNDER50',
    'Founder''s Circle',
    'limited_slots',
    50,
    37, -- Start at 37 (beta users + team)
    NOW(),
    NOW() + INTERVAL '7 days',
    '{"lifetime": true, "premium_access": true, "expert_consultation": true, "consultation_minutes": 45, "badge": "founder", "priority_support": true, "future_features": true}'::jsonb,
    'Valid for first 50 users only. Lifetime Premium access with no recurring charges. One-time expert consultation included.'
),
(
    'EARLYBIRD100',
    'Early Bird Special',
    'limited_slots',
    100,
    0,
    NOW() + INTERVAL '8 days', -- Starts after FOUNDER50 ends
    NOW() + INTERVAL '22 days',
    '{"discount_percentage": 50, "duration_months": 12, "premium_access": true}'::jsonb,
    '50% off Premium for first year. Valid for next 100 users after Founder''s Circle.'
),
(
    'LAUNCH50',
    'Launch Week Special',
    'time_limited',
    NULL, -- Unlimited slots
    0,
    NOW(),
    NOW() + INTERVAL '7 days',
    '{"discount_percentage": 50, "duration_months": 3, "premium_access": true}'::jsonb,
    '50% off Premium for first 3 months. Available during launch week only.'
);
```

**Task 1.3: Create Consultation Booking Tables**

```sql
-- File: backend/migrations/003_consultations.sql

-- Consultation types
CREATE TABLE consultation_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL, -- 'discovery_call', 'premium_consultation'
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    description TEXT,
    features JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Consultation bookings
CREATE TABLE consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    consultation_type_id INTEGER REFERENCES consultation_types(id),
    expert_id UUID REFERENCES auth.users(id), -- SEBI expert user
    booking_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    duration_minutes INTEGER NOT NULL,
    meeting_link VARCHAR(500), -- Zoom/Google Meet link
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    user_phone VARCHAR(20),
    selected_service VARCHAR(100), -- 'FIRE Planning', 'Tax Planning', etc.
    selected_expert_type VARCHAR(100), -- 'SEBI RIA', 'CA', 'CFP', etc.
    user_message TEXT,
    expert_notes TEXT,
    consultation_summary TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT
);

-- Expert profiles (for SEBI registered advisors)
CREATE TABLE expert_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    expert_name VARCHAR(100) NOT NULL,
    sebi_registration_number VARCHAR(50),
    certification_type VARCHAR(50), -- 'SEBI RIA', 'CA', 'CFP', etc.
    specializations JSONB, -- ['FIRE Planning', 'Tax Planning', 'SIP Planning']
    years_of_experience INTEGER,
    bio TEXT,
    calendar_link VARCHAR(500), -- Calendly or similar
    commission_percentage DECIMAL(5,2) DEFAULT 25.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Revenue tracking for expert commissions
CREATE TABLE expert_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    consultation_id UUID REFERENCES consultation_bookings(id),
    service_type VARCHAR(50), -- 'consultation', 'ongoing_advisory', 'plan_creation'
    total_amount DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    platform_revenue DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_consultations_user ON consultation_bookings(user_id);
CREATE INDEX idx_consultations_expert ON consultation_bookings(expert_id);
CREATE INDEX idx_consultations_status ON consultation_bookings(booking_status);
CREATE INDEX idx_consultations_date ON consultation_bookings(scheduled_date);

-- Insert consultation types
INSERT INTO consultation_types (type_name, duration_minutes, price, is_free, description, features) VALUES
(
    'discovery_call',
    15,
    0,
    TRUE,
    'Free 15-minute introductory call to understand your needs',
    '["General financial guidance", "App walkthrough", "High-level Q&A", "No detailed analysis"]'::jsonb
),
(
    'premium_consultation',
    45,
    0, -- Free with Premium subscription
    TRUE,
    'Comprehensive 45-minute financial consultation with detailed analysis',
    '["Portfolio review", "SIP strategy planning", "Tax optimization", "Goal planning", "Written summary", "30-day email support"]'::jsonb
);
```

**Task 1.4: Insert Default Subscription Plans**

```sql
-- File: backend/migrations/004_default_plans.sql

INSERT INTO subscription_plans (
    plan_name,
    plan_display_name,
    price_monthly,
    price_yearly,
    features
) VALUES
(
    'free',
    'Free',
    0,
    0,
    '{
        "fire_calculator": true,
        "basic_net_worth": true,
        "journey_visualization": true,
        "basic_dashboard": true,
        "portfolio_analyzer": false,
        "sip_planner": false,
        "goal_tracking_limit": 1,
        "expert_consultation": false,
        "pdf_exports": false,
        "priority_support": false
    }'::jsonb
),
(
    'premium',
    'Premium',
    999,
    9999, -- 17% savings on yearly
    '{
        "fire_calculator": true,
        "basic_net_worth": true,
        "journey_visualization": true,
        "basic_dashboard": true,
        "portfolio_analyzer": true,
        "sip_planner": true,
        "goal_tracking_limit": null,
        "expert_consultation": true,
        "consultation_duration": 45,
        "pdf_exports": true,
        "priority_support": true,
        "advanced_analytics": true,
        "milestone_tracking": true
    }'::jsonb
),
(
    'expert_plus',
    'Expert Plus',
    3999,
    39999,
    '{
        "fire_calculator": true,
        "basic_net_worth": true,
        "journey_visualization": true,
        "basic_dashboard": true,
        "portfolio_analyzer": true,
        "sip_planner": true,
        "goal_tracking_limit": null,
        "expert_consultation": true,
        "consultation_duration": 45,
        "quarterly_reviews": 4,
        "direct_expert_chat": true,
        "priority_booking": true,
        "annual_financial_review": true,
        "tax_filing_support": true,
        "pdf_exports": true,
        "priority_support": true,
        "advanced_analytics": true,
        "milestone_tracking": true
    }'::jsonb
);
```

---

#### **DAY 2-3: Backend API Endpoints**

**File: backend/app/apis/subscriptions/__init__.py**

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import secrets
import string
from supabase import create_client
import os

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

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
    """Generate unique access code"""
    chars = string.ascii_uppercase + string.digits
    code = 'FE-' + ''.join(secrets.choice(chars) for _ in range(length-3))
    return code

def calculate_time_remaining(end_date):
    """Calculate human-readable time remaining"""
    if not end_date:
        return None

    now = datetime.now()
    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

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

        # Fetch promo code
        response = supabase.from_("promo_codes")\
            .select("*")\
            .eq("code", data.code.upper())\
            .single()\
            .execute()

        if not response.data:
            return PromoCodeValidationResponse(
                valid=False,
                message="Invalid promo code"
            )

        promo = response.data

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

    except Exception as e:
        print(f"Error validating promo code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/promo-stats/{code}", response_model=PromoStatsResponse)
async def get_promo_stats(code: str):
    """Get real-time stats for FOMO display"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        response = supabase.from_("promo_codes")\
            .select("*")\
            .eq("code", code.upper())\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Promo code not found")

        promo = response.data

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
        print(f"Error fetching promo stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-promos")
async def get_active_promos():
    """Get all active promo campaigns"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

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
                "remaining_slots": remaining_slots,
                "time_remaining": calculate_time_remaining(promo.get('end_date')),
                "benefits": promo['benefits']
            })

        return {
            "success": True,
            "active_promos": promos
        }

    except Exception as e:
        print(f"Error fetching active promos: {str(e)}")
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

        # Fetch plan details
        plan_response = supabase.from_("subscription_plans")\
            .select("*")\
            .eq("plan_name", data.plan_name)\
            .eq("is_active", True)\
            .single()\
            .execute()

        if not plan_response.data:
            raise HTTPException(status_code=404, detail="Subscription plan not found")

        plan = plan_response.data

        # Handle promo code if provided
        promo_benefits = None
        is_lifetime = False

        if data.promo_code:
            promo_response = supabase.from_("promo_codes")\
                .select("*")\
                .eq("code", data.promo_code.upper())\
                .eq("is_active", True)\
                .single()\
                .execute()

            if promo_response.data:
                promo = promo_response.data
                promo_benefits = promo['benefits']

                # Check if lifetime benefit
                if promo_benefits.get('lifetime'):
                    is_lifetime = True

                # Increment used slots
                if promo['total_slots']:
                    new_used_slots = promo['used_slots'] + 1
                    supabase.from_("promo_codes")\
                        .update({"used_slots": new_used_slots})\
                        .eq("id", promo['id'])\
                        .execute()

        # Generate unique access code
        access_code = generate_access_code()

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
            "promo_code_used": data.promo_code
        }

        sub_response = supabase.from_("user_subscriptions")\
            .insert(subscription_data)\
            .execute()

        if not sub_response.data:
            raise HTTPException(status_code=500, detail="Failed to create subscription")

        subscription_id = sub_response.data[0]['id']

        # Track promo code usage
        if data.promo_code and promo_response.data:
            supabase.from_("promo_code_usage")\
                .insert({
                    "promo_code_id": promo_response.data['id'],
                    "user_id": data.user_id,
                    "subscription_id": subscription_id,
                    "benefits_applied": promo_benefits
                })\
                .execute()

        # Send email with access code (TODO: integrate email service)
        # await send_access_code_email(user_email, access_code, plan_name)

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
        print(f"Error creating subscription: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-access-code")
async def validate_access_code(data: AccessCodeValidation):
    """Validate access code and unlock features"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Check if code exists and belongs to user
        response = supabase.from_("user_subscriptions")\
            .select("*")\
            .eq("user_id", data.user_id)\
            .eq("access_code", data.access_code)\
            .eq("status", "active")\
            .execute()

        if not response.data:
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
                "redeemed_at": subscription['code_redeemed_at']
            }

        # Mark code as redeemed
        supabase.from_("user_subscriptions")\
            .update({"code_redeemed_at": datetime.now().isoformat()})\
            .eq("id", subscription['id'])\
            .execute()

        # Fetch plan features
        plan_response = supabase.from_("subscription_plans")\
            .select("features")\
            .eq("id", subscription['plan_id'])\
            .single()\
            .execute()

        return {
            "valid": True,
            "already_redeemed": False,
            "message": "Access code activated successfully!",
            "features_unlocked": plan_response.data['features'] if plan_response.data else {},
            "is_lifetime": subscription.get('is_lifetime', False)
        }

    except Exception as e:
        print(f"Error validating access code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-subscription/{user_id}")
async def get_user_subscription(user_id: str):
    """Get user's current subscription status"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        response = supabase.from_("user_subscriptions")\
            .select("*, subscription_plans(*)")\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()

        if not response.data:
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
        print(f"Error fetching user subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🎯 PHASE 2: FRONTEND FOMO COMPONENTS (Days 4-6)

### **DAY 4: Core FOMO Components**

**File: frontend/src/components/CountdownTimer.tsx**

```typescript
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface CountdownTimerProps {
  endDate: string; // ISO date string
  onExpire?: () => void;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

export function CountdownTimer({
  endDate,
  onExpire,
  size = 'medium',
  showLabels = true
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: difference
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (!timeRemaining) return null;

  if (timeRemaining.total <= 0) {
    return (
      <div className="text-red-600 font-bold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <span>OFFER EXPIRED</span>
      </div>
    );
  }

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base md:text-lg',
    large: 'text-xl md:text-2xl'
  };

  const boxSizes = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16 md:w-20 md:h-20',
    large: 'w-20 h-20 md:w-24 md:h-24'
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      <Clock className="w-5 h-5 text-red-500 animate-pulse" />

      <div className="flex gap-1 md:gap-2">
        {/* Days */}
        {timeRemaining.days > 0 && (
          <div className="flex flex-col items-center">
            <div className={`${boxSizes[size]} bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg`}>
              <span className={`${sizeClasses[size]} font-bold text-white`}>
                {timeRemaining.days}
              </span>
            </div>
            {showLabels && (
              <span className="text-xs text-gray-600 mt-1">Days</span>
            )}
          </div>
        )}

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className={`${boxSizes[size]} bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg`}>
            <span className={`${sizeClasses[size]} font-bold text-white`}>
              {String(timeRemaining.hours).padStart(2, '0')}
            </span>
          </div>
          {showLabels && (
            <span className="text-xs text-gray-600 mt-1">Hours</span>
          )}
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className={`${boxSizes[size]} bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg`}>
            <span className={`${sizeClasses[size]} font-bold text-white`}>
              {String(timeRemaining.minutes).padStart(2, '0')}
            </span>
          </div>
          {showLabels && (
            <span className="text-xs text-gray-600 mt-1">Mins</span>
          )}
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className={`${boxSizes[size]} bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg`}>
            <span className={`${sizeClasses[size]} font-bold text-white`}>
              {String(timeRemaining.seconds).padStart(2, '0')}
            </span>
          </div>
          {showLabels && (
            <span className="text-xs text-gray-600 mt-1">Secs</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

**File: frontend/src/components/SpotsMeter.tsx**

```typescript
import { Users, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SpotsMeterProps {
  totalSlots: number;
  usedSlots: number;
  promoName: string;
  showPercentage?: boolean;
  showUsersJoined?: boolean;
  animated?: boolean;
}

export function SpotsMeter({
  totalSlots,
  usedSlots,
  promoName,
  showPercentage = true,
  showUsersJoined = true,
  animated = true
}: SpotsMeterProps) {
  const [displayedSlots, setDisplayedSlots] = useState(animated ? 0 : usedSlots);

  const remainingSlots = totalSlots - usedSlots;
  const percentage = Math.round((usedSlots / totalSlots) * 100);

  useEffect(() => {
    if (!animated) return;

    let current = 0;
    const increment = Math.ceil(usedSlots / 50); // Animate in 50 steps
    const interval = setInterval(() => {
      current += increment;
      if (current >= usedSlots) {
        setDisplayedSlots(usedSlots);
        clearInterval(interval);
      } else {
        setDisplayedSlots(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [usedSlots, animated]);

  const getUrgencyColor = () => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-orange-500 to-orange-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getProgressBarColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {promoName}
        </h3>
        {showPercentage && (
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getUrgencyColor()} text-white font-bold text-sm flex items-center gap-1`}>
            <TrendingUp className="w-4 h-4" />
            {percentage}% Claimed
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{displayedSlots}</div>
          <div className="text-xs text-gray-600">Claimed</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${remainingSlots <= 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
            {remainingSlots}
          </div>
          <div className="text-xs text-gray-600">Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSlots}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
            style={{ width: `${percentage}%` }}
          >
            <span className="text-xs font-bold text-white">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Urgency Message */}
      {remainingSlots <= 10 && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm font-bold text-red-700 flex items-center gap-2">
            🔥 HURRY! Only {remainingSlots} spot{remainingSlots !== 1 ? 's' : ''} left!
          </p>
        </div>
      )}

      {/* Social Proof */}
      {showUsersJoined && displayedSlots > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          ✅ <span className="font-semibold">{displayedSlots} smart investors</span> already secured their spot
        </div>
      )}
    </div>
  );
}
```

---

### **DAY 5-6: Additional FOMO Components**

**File: frontend/src/components/ExitIntentModal.tsx**

```typescript
import { useState, useEffect } from 'react';
import { X, Gift, Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface ExitIntentModalProps {
  promoCode: string;
  promoName: string;
  endDate: string;
  discount: number;
  onClaim: () => void;
}

export function ExitIntentModal({
  promoCode,
  promoName,
  endDate,
  discount,
  onClaim
}: ExitIntentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect if mouse is leaving from top of page
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl animate-bounce-in">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Wait! Don't Miss This! 🎁
          </h2>

          <p className="text-gray-600 mb-6">
            Before you go, grab your exclusive <span className="font-bold text-purple-600">{discount}% OFF</span> on Premium!
          </p>

          {/* Countdown */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-red-700 mb-2 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Offer expires in:
            </p>
            <CountdownTimer endDate={endDate} size="small" showLabels={false} />
          </div>

          {/* Promo Code */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 mb-1">Your Exclusive Code:</p>
            <p className="text-2xl font-bold text-blue-600 tracking-wider">{promoCode}</p>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              onClaim();
              setIsVisible(false);
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            Claim {discount}% OFF Now
          </button>

          <p className="text-xs text-gray-500 mt-3">
            {promoName} • Limited time only
          </p>
        </div>
      </div>
    </div>
  );
}
```

**File: frontend/src/components/FloatingFOMOBanner.tsx**

```typescript
import { X, Zap, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FloatingFOMOBannerProps {
  message: string;
  remainingSlots?: number;
  ctaText: string;
  onCTAClick: () => void;
  position?: 'top' | 'bottom';
}

export function FloatingFOMOBanner({
  message,
  remainingSlots,
  ctaText,
  onCTAClick,
  position = 'bottom'
}: FloatingFOMOBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner after 3 seconds
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  const positionClasses = position === 'top'
    ? 'top-0 border-b'
    : 'bottom-0 border-t';

  return (
    <div className={`fixed ${positionClasses} left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white z-40 shadow-lg animate-slide-in`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Zap className="w-5 h-5 animate-pulse" />
          <p className="text-sm md:text-base font-semibold">
            {message}
          </p>
          {remainingSlots !== undefined && remainingSlots <= 10 && (
            <div className="hidden md:flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold">{remainingSlots} spots left!</span>
            </div>
          )}
        </div>

        <button
          onClick={onCTAClick}
          className="bg-white text-red-600 font-bold px-4 md:px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base whitespace-nowrap"
        >
          {ctaText}
        </button>

        <button
          onClick={() => {
            setIsDismissed(true);
            setIsVisible(false);
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

**File: frontend/src/components/SocialProofNotification.tsx**

```typescript
import { CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Notification {
  userName: string;
  action: string;
  location: string;
  timeAgo: string;
}

interface SocialProofNotificationProps {
  notifications: Notification[];
  intervalMs?: number;
}

export function SocialProofNotification({
  notifications,
  intervalMs = 8000
}: SocialProofNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notifications.length === 0) return;

    // Show first notification after 5 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    // Cycle through notifications
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsVisible(true);
      }, 500); // Wait for fade out
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [notifications, intervalMs]);

  if (notifications.length === 0 || !isVisible) return null;

  const notification = notifications[currentIndex];

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-in-left">
      <div className="bg-white border-2 border-green-200 rounded-lg shadow-xl p-4 max-w-xs flex items-start gap-3">
        <div className="bg-green-100 rounded-full p-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {notification.userName}
          </p>
          <p className="text-xs text-gray-600">
            {notification.action}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            📍 {notification.location} • {notification.timeAgo}
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

**File: frontend/src/components/PromoCodeInput.tsx**

```typescript
import { useState } from 'react';
import { Gift, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PromoCodeInputProps {
  onValidate: (code: string) => Promise<{
    valid: boolean;
    message: string;
    benefits?: any;
  }>;
  onApply: (code: string, benefits: any) => void;
}

export function PromoCodeInput({ onValidate, onApply }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    benefits?: any;
  } | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await onValidate(code.toUpperCase());
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Error validating code. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleApply = () => {
    if (validationResult?.valid && validationResult.benefits) {
      onApply(code.toUpperCase(), validationResult.benefits);
    }
  };

  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">
          Have a Promo Code?
        </h3>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setValidationResult(null);
          }}
          placeholder="Enter code (e.g., FOUNDER50)"
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 uppercase"
          disabled={isValidating}
        />
        <button
          onClick={handleValidate}
          disabled={!code.trim() || isValidating}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking...
            </>
          ) : (
            'Validate'
          )}
        </button>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`p-4 rounded-lg border-2 ${
            validationResult.valid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {validationResult.valid ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  validationResult.valid ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {validationResult.message}
              </p>

              {validationResult.valid && validationResult.benefits && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Benefits:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {validationResult.benefits.lifetime && (
                      <li>✅ Lifetime Premium Access</li>
                    )}
                    {validationResult.benefits.expert_consultation && (
                      <li>✅ Free Expert Consultation ({validationResult.benefits.consultation_minutes} min)</li>
                    )}
                    {validationResult.benefits.priority_support && (
                      <li>✅ Priority Support</li>
                    )}
                    {validationResult.benefits.discount_percentage && (
                      <li>✅ {validationResult.benefits.discount_percentage}% Discount</li>
                    )}
                  </ul>

                  <button
                    onClick={handleApply}
                    className="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 PHASE 3: CONSULTATION SYSTEM (Days 7-9)

### **DAY 7: Update Consultation Page with Two-Tier Model**

**File: frontend/src/pages/Consultation.tsx** (Update existing file)

Add the following consultation type selection before the existing form:

```typescript
// Add to state
const [consultationType, setConsultationType] = useState<'discovery' | 'premium'>('discovery');

// Add consultation type selector UI
<div className="mb-8">
  <h3 className="text-xl font-bold text-gray-900 mb-4">
    Choose Your Consultation Type
  </h3>

  <div className="grid md:grid-cols-2 gap-4">
    {/* Discovery Call */}
    <div
      onClick={() => setConsultationType('discovery')}
      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
        consultationType === 'discovery'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900">Discovery Call</h4>
          <p className="text-sm text-gray-600">15 minutes</p>
        </div>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-green-700">FREE</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>General financial guidance</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>App walkthrough</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>High-level Q&A</span>
        </li>
        <li className="flex items-start gap-2">
          <span>❌</span>
          <span>No detailed analysis</span>
        </li>
      </ul>

      <p className="text-xs text-gray-500 mt-4 italic">
        Perfect for understanding if our platform is right for you
      </p>
    </div>

    {/* Premium Consultation */}
    <div
      onClick={() => setConsultationType('premium')}
      className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
        consultationType === 'premium'
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-purple-300'
      }`}
    >
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
        PREMIUM ONLY
      </div>

      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900">Deep Dive Consultation</h4>
          <p className="text-sm text-gray-600">45 minutes</p>
        </div>
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-purple-700">INCLUDED</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>Portfolio review with your data</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>SIP strategy planning</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>Tax optimization guidance</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>Written summary report</span>
        </li>
        <li className="flex items-start gap-2">
          <span>✅</span>
          <span>30-day email support</span>
        </li>
      </ul>

      <p className="text-xs text-gray-500 mt-4 italic">
        Comprehensive analysis with actionable recommendations
      </p>
    </div>
  </div>

  {/* Premium Gate Message */}
  {consultationType === 'premium' && !userHasPremium && (
    <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
      <p className="text-sm text-amber-800">
        <span className="font-bold">Premium subscription required</span> for Deep Dive Consultation.
        <a href="/pricing" className="ml-2 underline font-semibold">
          Upgrade now →
        </a>
      </p>
    </div>
  )}
</div>
```

### **DAY 8: Calendar Integration**

**File: frontend/src/components/CalendarBooking.tsx**

```typescript
import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarBookingProps {
  consultationType: 'discovery' | 'premium';
  onBook: (date: string, time: string) => void;
}

export function CalendarBooking({ consultationType, onBook }: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Sample time slots (replace with API call to fetch expert availability)
  const timeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '05:00 PM', available: false },
  ];

  const duration = consultationType === 'discovery' ? '15 min' : '45 min';

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        Select Date & Time
      </h3>

      {/* Date Picker */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Preferred Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Available Time Slots ({duration})
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                  selectedTime === slot.time
                    ? 'bg-blue-600 text-white'
                    : slot.available
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {selectedDate && selectedTime && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            📅 Your Consultation:
          </p>
          <p className="text-sm text-blue-800">
            <span className="font-bold">{new Date(selectedDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            {' at '}
            <span className="font-bold">{selectedTime}</span>
            {' '}({duration})
          </p>
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={() => selectedDate && selectedTime && onBook(selectedDate, selectedTime)}
        disabled={!selectedDate || !selectedTime}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Confirm Booking
      </button>
    </div>
  );
}
```

### **DAY 9: Expert Assignment Backend**

**File: backend/app/apis/consultations/__init__.py** (NEW)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, date, time
from typing import Optional
from supabase import create_client
import os

router = APIRouter(prefix="/routes")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# ============================================
# MODELS
# ============================================

class ConsultationBooking(BaseModel):
    user_id: str
    consultation_type: str  # 'discovery_call' or 'premium_consultation'
    scheduled_date: str  # YYYY-MM-DD
    scheduled_time: str  # HH:MM
    selected_service: str  # 'FIRE Planning', 'Tax Planning', etc.
    selected_expert_type: str  # 'SEBI RIA', 'CA', etc.
    user_name: str
    user_email: EmailStr
    user_phone: Optional[str] = None
    user_message: Optional[str] = None

class BookingResponse(BaseModel):
    success: bool
    message: str
    booking_id: Optional[str] = None
    meeting_link: Optional[str] = None

# ============================================
# HELPER FUNCTIONS
# ============================================

async def assign_expert(selected_service: str, selected_expert_type: str):
    """Assign best available expert based on specialization"""
    try:
        # Fetch experts with matching specialization and type
        response = supabase.from_("expert_profiles")\
            .select("*")\
            .eq("certification_type", selected_expert_type)\
            .eq("is_active", True)\
            .execute()

        if not response.data:
            return None

        # Filter by specialization
        matching_experts = [
            expert for expert in response.data
            if selected_service in expert.get('specializations', [])
        ]

        if not matching_experts:
            # Fallback to any expert of the type
            return response.data[0] if response.data else None

        # Return expert with least bookings (basic load balancing)
        # TODO: Implement proper load balancing logic
        return matching_experts[0]

    except Exception as e:
        print(f"Error assigning expert: {str(e)}")
        return None

async def send_booking_confirmation_email(booking_data: dict):
    """Send confirmation email to user and expert"""
    # TODO: Integrate with email service
    pass

# ============================================
# CONSULTATION ENDPOINTS
# ============================================

@router.post("/book-consultation", response_model=BookingResponse)
async def book_consultation(booking: ConsultationBooking):
    """Book a consultation (Discovery or Premium)"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Fetch consultation type details
        type_response = supabase.from_("consultation_types")\
            .select("*")\
            .eq("type_name", booking.consultation_type)\
            .single()\
            .execute()

        if not type_response.data:
            raise HTTPException(status_code=404, detail="Consultation type not found")

        consultation_type = type_response.data

        # Check if user has Premium for premium consultations
        if booking.consultation_type == 'premium_consultation':
            user_sub_response = supabase.from_("user_subscriptions")\
                .select("*")\
                .eq("user_id", booking.user_id)\
                .eq("status", "active")\
                .execute()

            if not user_sub_response.data:
                raise HTTPException(
                    status_code=403,
                    detail="Premium subscription required for Deep Dive Consultation"
                )

        # Assign expert
        expert = await assign_expert(booking.selected_service, booking.selected_expert_type)
        expert_id = expert['user_id'] if expert else None

        # Create booking
        booking_data = {
            "user_id": booking.user_id,
            "consultation_type_id": consultation_type['id'],
            "expert_id": expert_id,
            "booking_status": "pending",
            "scheduled_date": booking.scheduled_date,
            "scheduled_time": booking.scheduled_time,
            "duration_minutes": consultation_type['duration_minutes'],
            "user_name": booking.user_name,
            "user_email": booking.user_email,
            "user_phone": booking.user_phone,
            "selected_service": booking.selected_service,
            "selected_expert_type": booking.selected_expert_type,
            "user_message": booking.user_message,
            "meeting_link": expert.get('calendar_link') if expert else None
        }

        booking_response = supabase.from_("consultation_bookings")\
            .insert(booking_data)\
            .execute()

        if not booking_response.data:
            raise HTTPException(status_code=500, detail="Failed to create booking")

        booking_id = booking_response.data[0]['id']

        # Send confirmation emails
        await send_booking_confirmation_email(booking_response.data[0])

        return BookingResponse(
            success=True,
            message=f"Consultation booked successfully! You'll receive a confirmation email shortly.",
            booking_id=booking_id,
            meeting_link=booking_data.get('meeting_link')
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error booking consultation: {str(e)}")
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
            .select("*, consultation_types(*), expert_profiles(*)")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()

        return {
            "success": True,
            "consultations": response.data
        }

    except Exception as e:
        print(f"Error fetching consultations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/consultation/{booking_id}/complete")
async def complete_consultation(booking_id: str, summary: str, rating: int):
    """Mark consultation as complete with summary"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Update booking
        response = supabase.from_("consultation_bookings")\
            .update({
                "booking_status": "completed",
                "consultation_summary": summary,
                "rating": rating,
                "completed_at": datetime.now().isoformat()
            })\
            .eq("id", booking_id)\
            .execute()

        return {
            "success": True,
            "message": "Consultation marked as complete"
        }

    except Exception as e:
        print(f"Error completing consultation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🎯 PHASE 4: PAYMENT INTEGRATION (Days 10-12)

### **DAY 10-11: Stripe Integration**

**File: backend/app/apis/payments/__init__.py** (NEW)

```python
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import stripe
import os

router = APIRouter(prefix="/routes")

# Stripe setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

# ============================================
# MODELS
# ============================================

class CreateCheckoutSession(BaseModel):
    user_id: str
    plan_name: str  # 'premium', 'expert_plus'
    billing_cycle: str  # 'monthly', 'yearly'
    promo_code: Optional[str] = None
    success_url: str
    cancel_url: str

class CheckoutSessionResponse(BaseModel):
    success: bool
    session_id: str
    checkout_url: str

# ============================================
# PAYMENT ENDPOINTS
# ============================================

@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(data: CreateCheckoutSession):
    """Create Stripe checkout session"""
    try:
        # Price mapping (in INR cents - multiply by 100)
        price_map = {
            "premium_monthly": 99900,  # ₹999
            "premium_yearly": 999900,  # ₹9,999
            "expert_plus_monthly": 399900,  # ₹3,999
            "expert_plus_yearly": 3999900,  # ₹39,999
        }

        price_key = f"{data.plan_name}_{data.billing_cycle}"
        amount = price_map.get(price_key)

        if not amount:
            raise HTTPException(status_code=400, detail="Invalid plan or billing cycle")

        # Create checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': f'FinEdge360 {data.plan_name.title()} Plan',
                        'description': f'{data.billing_cycle.title()} subscription'
                    },
                    'unit_amount': amount,
                    'recurring': {
                        'interval': 'month' if data.billing_cycle == 'monthly' else 'year'
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=data.success_url + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=data.cancel_url,
            client_reference_id=data.user_id,
            metadata={
                'user_id': data.user_id,
                'plan_name': data.plan_name,
                'billing_cycle': data.billing_cycle,
                'promo_code': data.promo_code or ''
            }
        )

        return CheckoutSessionResponse(
            success=True,
            session_id=session.id,
            checkout_url=session.url
        )

    except stripe.error.StripeError as e:
        print(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_webhook_secret
        )

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']

            # Extract metadata
            user_id = session['metadata']['user_id']
            plan_name = session['metadata']['plan_name']
            billing_cycle = session['metadata']['billing_cycle']
            promo_code = session['metadata'].get('promo_code')

            # Create subscription in database
            # (Call the create_subscription endpoint from subscriptions API)

            print(f"Payment successful for user {user_id}")

        elif event['type'] == 'customer.subscription.deleted':
            # Handle subscription cancellation
            subscription = event['data']['object']
            print(f"Subscription cancelled: {subscription['id']}")

        return {"success": True}

    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel-subscription")
async def cancel_subscription(user_id: str):
    """Cancel user subscription"""
    try:
        # Fetch subscription
        # Cancel in Stripe
        # Update database
        pass
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### **DAY 12: Razorpay Integration (For India)**

**File: backend/app/apis/payments/razorpay.py** (NEW)

```python
import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter(prefix="/routes/razorpay")

# Razorpay setup
razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))

class CreateRazorpayOrder(BaseModel):
    user_id: str
    plan_name: str
    billing_cycle: str
    promo_code: str | None = None

@router.post("/create-order")
async def create_razorpay_order(data: CreateRazorpayOrder):
    """Create Razorpay order for subscription"""
    try:
        # Price mapping (in paise - multiply by 100)
        price_map = {
            "premium_monthly": 99900,
            "premium_yearly": 999900,
            "expert_plus_monthly": 399900,
            "expert_plus_yearly": 3999900,
        }

        price_key = f"{data.plan_name}_{data.billing_cycle}"
        amount = price_map.get(price_key)

        # Create order
        order = razorpay_client.order.create({
            'amount': amount,
            'currency': 'INR',
            'payment_capture': 1,
            'notes': {
                'user_id': data.user_id,
                'plan_name': data.plan_name,
                'billing_cycle': data.billing_cycle
            }
        })

        return {
            'success': True,
            'order_id': order['id'],
            'amount': amount,
            'currency': 'INR'
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_razorpay_payment(
    order_id: str,
    payment_id: str,
    signature: str
):
    """Verify Razorpay payment signature"""
    try:
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }

        razorpay_client.utility.verify_payment_signature(params_dict)

        # Payment verified - Create subscription in database

        return {
            'success': True,
            'message': 'Payment verified successfully'
        }

    except razorpay.errors.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 🎯 PHASE 5: EMAIL AUTOMATION (Days 13-14)

### **DAY 13: Email Templates & Service**

**File: backend/app/services/email_service.py** (NEW)

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@finedge360.com")

# ============================================
# EMAIL TEMPLATES
# ============================================

def access_code_email_template(user_name: str, access_code: str, plan_name: str, is_lifetime: bool):
    """Email template for access code delivery"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .access-code {{ background: #fff; border: 3px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }}
            .code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            .footer {{ background: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to FinEdge360 {plan_name}!</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Thank you for choosing FinEdge360! Your subscription is now active.</p>

                <div class="access-code">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your Access Code:</p>
                    <p class="code">{access_code}</p>
                    <p style="margin: 0; font-size: 12px; color: #999;">Use this code to unlock Premium features</p>
                </div>

                {"<p><strong>🌟 You have LIFETIME access!</strong> No recurring charges, ever.</p>" if is_lifetime else ""}

                <p><strong>What's unlocked:</strong></p>
                <ul>
                    <li>✅ Advanced Portfolio Analyzer</li>
                    <li>✅ SIP Planning Tool</li>
                    <li>✅ Unlimited Goal Tracking</li>
                    <li>✅ 45-minute Expert Consultation</li>
                    <li>✅ PDF Exports & Reports</li>
                    <li>✅ Priority Support</li>
                </ul>

                <p style="text-align: center;">
                    <a href="https://finedge360.com/portfolio" class="button">Access Portfolio Analyzer →</a>
                </p>

                <p>Need help? Reply to this email or contact us at support@finedge360.com</p>
            </div>
            <div class="footer">
                <p>FinEdge360 - Your Path to Financial Independence</p>
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

def consultation_booking_confirmation_template(booking_data: dict):
    """Email template for consultation booking confirmation"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .booking-details {{ background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }}
            .button {{ display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Consultation Confirmed!</h1>
            </div>
            <div class="content" style="padding: 30px; background: #fff;">
                <p>Hi {booking_data['user_name']},</p>
                <p>Your consultation has been successfully booked!</p>

                <div class="booking-details">
                    <h3 style="margin-top: 0;">📋 Booking Details:</h3>
                    <p><strong>Type:</strong> {booking_data['consultation_type']}</p>
                    <p><strong>Date:</strong> {booking_data['scheduled_date']}</p>
                    <p><strong>Time:</strong> {booking_data['scheduled_time']}</p>
                    <p><strong>Duration:</strong> {booking_data['duration']} minutes</p>
                    <p><strong>Service:</strong> {booking_data['selected_service']}</p>
                    <p><strong>Expert:</strong> {booking_data['expert_name']}</p>
                </div>

                <p style="text-align: center;">
                    <a href="{booking_data.get('meeting_link', '#')}" class="button">Join Meeting →</a>
                </p>

                <p><strong>What to prepare:</strong></p>
                <ul>
                    <li>Your financial goals and timeline</li>
                    <li>Current investment portfolio details</li>
                    <li>Any specific questions or concerns</li>
                </ul>

                <p>Looking forward to helping you achieve your financial goals!</p>
            </div>
        </div>
    </body>
    </html>
    """

# ============================================
# EMAIL SENDING FUNCTIONS
# ============================================

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email via SMTP"""
    try:
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("WARNING: SMTP not configured")
            return False

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = FROM_EMAIL
        message["To"] = to_email

        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, message.as_string())

        print(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

async def send_access_code_email(user_email: str, user_name: str, access_code: str, plan_name: str, is_lifetime: bool):
    """Send access code email"""
    html = access_code_email_template(user_name, access_code, plan_name, is_lifetime)
    await send_email(
        to_email=user_email,
        subject=f"🎉 Your FinEdge360 Access Code - {access_code}",
        html_content=html
    )

async def send_consultation_booking_email(booking_data: dict):
    """Send consultation booking confirmation"""
    html = consultation_booking_confirmation_template(booking_data)
    await send_email(
        to_email=booking_data['user_email'],
        subject=f"📅 Consultation Confirmed - {booking_data['scheduled_date']}",
        html_content=html
    )
```

### **DAY 14: Automated Email Sequences**

**File: backend/app/services/email_campaigns.py** (NEW)

```python
from datetime import datetime, timedelta
from typing import List

# ============================================
# EMAIL CAMPAIGN TRIGGERS
# ============================================

async def trigger_welcome_sequence(user_id: str, user_email: str, user_name: str):
    """Triggered when user signs up"""
    # Day 0: Welcome email (immediate)
    # Day 2: Feature tour email
    # Day 5: Upgrade reminder (if still on free plan)
    # Day 10: Success stories email
    pass

async def trigger_abandoned_cart_sequence(user_id: str, plan_name: str):
    """Triggered when user starts checkout but doesn't complete"""
    # 1 hour later: Reminder email with special discount
    # 24 hours later: Final reminder with urgency
    pass

async def trigger_expiring_promo_reminder(promo_code: str, user_emails: List[str]):
    """Triggered 24 hours before promo expires"""
    # Send urgent reminder to all users who viewed but didn't claim
    pass

async def trigger_subscription_renewal_reminder(user_id: str, days_until_renewal: int):
    """Triggered before subscription renews"""
    # 7 days before: Renewal reminder
    # 3 days before: Last chance to cancel/modify
    pass

async def trigger_post_consultation_followup(booking_id: str):
    """Triggered after consultation completes"""
    # Immediate: Thank you + rating request
    # 7 days later: Check-in on progress
    # 30 days later: Book next consultation offer
    pass
```

---

## 🎯 PHASE 6: ADMIN DASHBOARD (Days 15-17)

### **DAY 15-16: Admin Dashboard UI**

**File: frontend/src/pages/Admin/Dashboard.tsx** (NEW)

```typescript
import { useState, useEffect } from 'react';
import {
  Users, DollarSign, Calendar, TrendingUp,
  Award, Clock, CheckCircle, XCircle
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fetch dashboard stats from backend
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // GET /routes/admin/dashboard-stats
    const response = await fetch('/routes/admin/dashboard-stats');
    const data = await response.json();
    setStats(data);
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        📊 Admin Dashboard
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          label="Total Users"
          value={stats.totalUsers}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8" />}
          label="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          change="+28%"
          changeType="positive"
        />
        <StatCard
          icon={<Award className="w-8 h-8" />}
          label="Premium Users"
          value={stats.premiumUsers}
          change="+15%"
          changeType="positive"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          label="Consultations"
          value={stats.consultationsThisMonth}
          change="+8%"
          changeType="positive"
        />
      </div>

      {/* Promo Campaigns Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Active Promo Campaigns
        </h2>
        <div className="space-y-4">
          {stats.activePromos.map((promo: any) => (
            <PromoCard key={promo.code} promo={promo} />
          ))}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Subscriptions
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-2">User</th>
              <th className="text-left py-2">Plan</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentSubscriptions.map((sub: any) => (
              <tr key={sub.id} className="border-b">
                <td className="py-3">{sub.user_email}</td>
                <td className="py-3">{sub.plan_name}</td>
                <td className="py-3">₹{sub.amount}</td>
                <td className="py-3">{new Date(sub.created_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Consultations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          Pending Consultations
        </h2>
        {/* List of pending consultations that need expert assignment */}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, changeType }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-blue-600">{icon}</div>
        <span className={`text-sm font-semibold ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PromoCard({ promo }: any) {
  const percentage = (promo.used_slots / promo.total_slots) * 100;

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-900">{promo.code}</h3>
          <p className="text-sm text-gray-600">{promo.code_name}</p>
        </div>
        <span className="text-2xl font-bold text-blue-600">
          {promo.used_slots}/{promo.total_slots}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {promo.remaining_time} remaining
      </p>
    </div>
  );
}
```

### **DAY 17: Admin Backend APIs**

**File: backend/app/apis/admin/__init__.py** (NEW)

```python
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from supabase import create_client
import os

router = APIRouter(prefix="/routes/admin")

# Add admin authentication middleware here
# async def verify_admin(token: str = Depends(...)):
#     # Verify user is admin
#     pass

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

@router.get("/dashboard-stats")
async def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Total users
        users_response = supabase.from_("auth.users").select("id", count="exact").execute()
        total_users = users_response.count

        # Premium users
        premium_response = supabase.from_("user_subscriptions")\
            .select("id", count="exact")\
            .eq("status", "active")\
            .execute()
        premium_users = premium_response.count

        # Monthly revenue (last 30 days)
        thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
        revenue_response = supabase.from_("user_subscriptions")\
            .select("*, subscription_plans(*)")\
            .gte("created_at", thirty_days_ago)\
            .eq("status", "active")\
            .execute()

        monthly_revenue = sum([
            sub['subscription_plans']['price_monthly']
            for sub in revenue_response.data
        ])

        # Consultations this month
        consultations_response = supabase.from_("consultation_bookings")\
            .select("id", count="exact")\
            .gte("created_at", thirty_days_ago)\
            .execute()
        consultations_this_month = consultations_response.count

        # Active promos
        promos_response = supabase.from_("promo_codes")\
            .select("*")\
            .eq("is_active", True)\
            .execute()

        active_promos = []
        for promo in promos_response.data:
            remaining_slots = None
            if promo['total_slots']:
                remaining_slots = promo['total_slots'] - promo['used_slots']

            active_promos.append({
                "code": promo['code'],
                "code_name": promo['code_name'],
                "used_slots": promo['used_slots'],
                "total_slots": promo['total_slots'],
                "remaining_slots": remaining_slots,
                "remaining_time": calculate_time_remaining(promo.get('end_date'))
            })

        # Recent subscriptions
        recent_subs_response = supabase.from_("user_subscriptions")\
            .select("*, subscription_plans(*)")\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()

        return {
            "totalUsers": total_users,
            "premiumUsers": premium_users,
            "monthlyRevenue": monthly_revenue,
            "consultationsThisMonth": consultations_this_month,
            "activePromos": active_promos,
            "recentSubscriptions": recent_subs_response.data
        }

    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue-report")
async def get_revenue_report(start_date: str, end_date: str):
    """Get revenue report for date range"""
    # Detailed revenue breakdown by plan, billing cycle, etc.
    pass

@router.get("/user-analytics")
async def get_user_analytics():
    """Get user growth and retention analytics"""
    # User signup trends, churn rate, engagement metrics
    pass
```

---

## 🎯 PHASE 7: TESTING & LAUNCH (Days 18-21)

### **DAY 18-19: Testing Checklist**

**Testing Plan:**

```markdown
## 1. Database Testing
- [ ] All migrations run successfully
- [ ] Indexes created properly
- [ ] Foreign keys working
- [ ] Sample data inserted correctly

## 2. Backend API Testing
- [ ] All promo code endpoints return correct data
- [ ] Subscription creation works with/without promo
- [ ] Access code validation works
- [ ] Consultation booking creates records
- [ ] Payment webhooks process correctly
- [ ] Email sending works (test with real SMTP)

## 3. Frontend FOMO Testing
- [ ] Countdown timer counts down correctly
- [ ] Spots meter updates in real-time
- [ ] Exit intent modal appears on mouse leave
- [ ] Floating banner shows after delay
- [ ] Social proof notifications cycle
- [ ] Promo code input validates and applies codes

## 4. Consultation Flow Testing
- [ ] Discovery call booking works for all users
- [ ] Premium consultation requires subscription
- [ ] Calendar integration displays available slots
- [ ] Expert assignment happens automatically
- [ ] Confirmation emails sent to user and expert
- [ ] Meeting links work

## 5. Payment Integration Testing
- [ ] Stripe checkout creates session
- [ ] Razorpay order creation works
- [ ] Payment webhooks trigger subscription creation
- [ ] Access codes generated and emailed
- [ ] Subscription shows in user account

## 6. User Flow Testing (End-to-End)
### Free User Journey:
1. [ ] Land on homepage
2. [ ] See FOMO elements (countdown, spots meter)
3. [ ] Book discovery call
4. [ ] Try to access portfolio (blocked with upgrade prompt)
5. [ ] Enter promo code FOUNDER50
6. [ ] Complete payment
7. [ ] Receive access code email
8. [ ] Redeem access code
9. [ ] Access portfolio and SIP planner
10. [ ] Book premium consultation

### Premium User Journey:
1. [ ] Sign up with promo code
2. [ ] Receive access code immediately
3. [ ] Access all premium features
4. [ ] Book consultation
5. [ ] Attend consultation
6. [ ] Receive follow-up email

## 7. Mobile Responsiveness
- [ ] All FOMO components responsive
- [ ] Consultation booking form mobile-friendly
- [ ] Payment checkout works on mobile
- [ ] Emails display correctly on mobile devices

## 8. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks in countdown timers

## 9. Security Testing
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implemented
- [ ] Payment data encrypted
- [ ] Access code generation secure
- [ ] Admin routes protected

## 10. Email Testing
- [ ] Access code email delivers and displays correctly
- [ ] Consultation confirmation email works
- [ ] Welcome sequence triggers on signup
- [ ] Abandoned cart reminder sends
- [ ] Promo expiration reminder works
```

### **DAY 20: Pre-Launch Configuration**

**Environment Variables Checklist:**

```bash
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# Email Service
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@finedge360.com
SMTP_PASSWORD=xxx
FROM_EMAIL=noreply@finedge360.com

# Frontend
VITE_API_URL=https://api.finedge360.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_RAZORPAY_KEY_ID=rzp_live_xxx

# Admin
ADMIN_EMAIL=admin@finedge360.com
```

### **DAY 21: Launch Day**

**Launch Checklist:**

```markdown
## Morning (Before Launch)
- [ ] Final database backup
- [ ] Verify all environment variables
- [ ] Test payment gateways with real transactions
- [ ] Confirm email service working
- [ ] Check FOMO countdown timers set correctly
- [ ] Verify FOUNDER50 starts at 37/50 used slots

## Launch Sequence
1. [ ] Deploy backend to production
2. [ ] Deploy frontend to production
3. [ ] Run database migrations
4. [ ] Test critical user flows
5. [ ] Activate FOUNDER50 promo code
6. [ ] Send launch announcement email
7. [ ] Post on social media
8. [ ] Monitor error logs

## Post-Launch Monitoring (First 24 Hours)
- [ ] Check signup conversion rate
- [ ] Monitor promo code redemptions
- [ ] Track payment success rate
- [ ] Verify emails delivering
- [ ] Watch for errors in logs
- [ ] Respond to user support requests

## First Week Goals
- [ ] 10+ FOUNDER50 redemptions (reach 47/50)
- [ ] 5+ consultation bookings
- [ ] 3+ premium subscriptions
- [ ] Zero critical bugs
```

---

## 📈 SUCCESS METRICS & KPIs

### Week 1 Targets:
- **Signups:** 100+ users
- **Promo Redemptions:** 10+ (FOUNDER50)
- **Revenue:** ₹10,000+
- **Consultations Booked:** 5+

### Month 1 Targets:
- **Signups:** 500+ users
- **Premium Users:** 25+
- **Revenue:** ₹50,000+
- **Consultations Completed:** 20+
- **NPS Score:** 50+

### Month 3 Targets:
- **Signups:** 2,000+ users
- **Premium Users:** 100+
- **Revenue:** ₹2,00,000+
- **Expert Partners:** 5+
- **Monthly Recurring Revenue (MRR):** ₹1,50,000+

---

## 🚀 POST-LAUNCH OPTIMIZATION

### Priority Improvements (After Launch):
1. **A/B Testing:** Test different promo campaigns
2. **Analytics Integration:** Add Google Analytics, Mixpanel
3. **Referral Program:** User invites friends, both get discount
4. **Mobile App:** React Native app for iOS/Android
5. **Expert Marketplace:** Multiple experts, users choose
6. **Automated Webinars:** Pre-recorded consultation intros
7. **Community Forum:** User discussions, expert Q&A
8. **Premium Content:** Video courses, guides, templates

---

## 📝 DEPLOYMENT GUIDE

### Backend Deployment (Railway):
```bash
# 1. Push to GitHub
git add .
git commit -m "Complete Hybrid Model implementation"
git push origin main

# 2. Railway will auto-deploy from GitHub
# 3. Add environment variables in Railway dashboard
# 4. Run migrations via Railway CLI or dashboard
```

### Frontend Deployment (Vercel):
```bash
# 1. Connect Vercel to GitHub repo
# 2. Configure build settings:
#    Build Command: npm run build
#    Output Directory: dist
# 3. Add environment variables
# 4. Deploy
```

### Database Setup (Supabase):
```bash
# 1. Run migrations in Supabase SQL Editor:
#    - 001_subscriptions.sql
#    - 002_promo_codes.sql
#    - 003_consultations.sql
#    - 004_default_plans.sql
# 2. Enable Row Level Security (RLS)
# 3. Create API service key
```

---

## ✅ IMPLEMENTATION COMPLETE!

**Total Development Time:** 14-21 days
**Total Files Created:** ~30 files
**Total Lines of Code:** ~5,000 lines
**Features Implemented:** 15+ major features

**Revenue Potential:** ₹50,000-2,00,000/month within 90 days

---

**This implementation plan is complete and ready for execution!** 🎉