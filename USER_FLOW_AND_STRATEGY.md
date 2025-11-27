# Complete User Flow & Monetization Strategy

## Date: 2025-11-25

---

## 🎯 Core Strategy: Hybrid Model + FOMO

### Revenue Target
- **Goal:** ₹50,000 - ₹2,00,000/month within 90 days
- **Model:** Freemium + Subscriptions + Limited Lifetime Offers

---

## 💰 Pricing Tiers

### 1. Free Plan (₹0/month)
**Target:** Lead generation & engagement
**Features:**
- Basic FIRE Calculator
- Net Worth Tracking
- Basic Dashboard
- Limited tax planning insights
- Community access

**Limitations:**
- No 3D FIRE-Map journey visualization
- No personalized SIP planning
- No expert consultations (only 15-min discovery calls)
- No advanced portfolio analysis

### 2. Premium Plan (₹999/month or ₹9,999/year)
**Target:** Serious DIY investors
**Features:**
- ✅ All Free features
- ✅ 3D FIRE-Map journey visualization
- ✅ Advanced SIP Planning (Step 7)
- ✅ Asset Allocation Designer (Step 6)
- ✅ Advanced Portfolio Analysis
- ✅ Tax optimization strategies
- ✅ 45-min Premium Consultation (monthly)
- ✅ Priority support
- ✅ Export reports (PDF)

**FOMO Campaigns:**
- EARLYBIRD100: 50% off for 12 months (100 slots)
- LAUNCH50: 50% off for 3 months (unlimited, time-limited)

### 3. Expert Plus Plan (₹3,999/month or ₹39,999/year)
**Target:** High-net-worth individuals needing ongoing guidance
**Features:**
- ✅ All Premium features
- ✅ Unlimited expert consultations
- ✅ Quarterly portfolio review
- ✅ Direct WhatsApp support
- ✅ Custom financial planning
- ✅ Tax filing assistance
- ✅ Priority booking

### 4. FOUNDER50 - Lifetime Access (₹14,999 one-time)
**Target:** Early adopters, create urgency
**Features:**
- ✅ Lifetime Premium access
- ✅ All future Premium features
- ✅ Founder badge
- ✅ Community perks
- ✅ Locked-in pricing forever

**FOMO Mechanics:**
- **Limited Slots:** 50 total (starting at 37/50 used)
- **Time Pressure:** 7-day countdown
- **Real-time Updates:** Spots remaining visible
- **Transparency:** Honest slot count (37 = real beta users + team)

---

## 🔄 Complete User Journey Flow

### **Phase 1: Discovery (Free Users)**

#### Entry Points:
1. **Landing Page** → Sign Up → Email verification
2. **Social Media** → Direct app link → Sign Up
3. **Referrals** → Invite code → Sign Up

#### First-Time User Experience:
```
┌─────────────────────────────────────────────────┐
│ 1. User lands on homepage (/)                   │
│    - Hero section with value proposition        │
│    - "Start Your FIRE Journey" CTA              │
│    - Pricing tiers preview (triggers curiosity) │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. User clicks "Get Started" → /login           │
│    - Sign up with email (Supabase Auth)         │
│    - Email verification sent                    │
│    - Redirects to /dashboard after login        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Dashboard shows "Your Financial Journey"     │
│    - Step 0: Enter Details → /enter-details     │
│    - Step 1: Net Worth → /net-worth             │
│    - Step 2: FIRE Calculator → /fire-calculator │
│    - Step 3: Tax Planning → /tax-planning       │
│    - Step 4: Portfolio → /portfolio             │
│    - Step 5-7: LOCKED (Premium badge visible)   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. User completes Free steps (0-4)              │
│    - Gets value from basic tools                │
│    - Sees what they're missing (FOMO trigger)   │
│    - 3D FIRE-Map button shows lock icon         │
└─────────────────────────────────────────────────┘
```

#### FOMO Triggers for Free Users:
1. **Locked Features with Preview:**
   - "🗺️ Your FIRE Map (Premium Only)" - Shows blurred preview
   - "Step 6: Design Asset Allocation 🔒" - Teaser text
   - "Step 7: FIRE Planning 🔒" - "Premium users achieve FIRE 5 years faster"

2. **FloatingFOMOBanner (Shows after 2 min on site):**
   ```
   ⚡ FOUNDER50: Only 13 slots left | ₹14,999 Lifetime Access | Ends in 4d 12h
   [Grab Your Spot →]
   ```

3. **Exit Intent Modal (When user tries to leave):**
   ```
   🎯 Before You Go...
   Join 37 founders who locked in lifetime Premium access

   [FOUNDER50: 13/50 slots remaining]
   [Timer: 4d 12h 34m]

   [See Pricing] [No Thanks]
   ```

4. **Premium Consultation Card (In /consultation-new):**
   ```
   ⭐ PREMIUM ONLY
   45-Minute Deep Dive Consultation

   Upgrade to Premium to unlock expert guidance
   [Upgrade Now →]
   ```

---

### **Phase 2: Conversion (Free → Premium)**

#### Conversion Triggers:

**1. User clicks "Upgrade to Premium" anywhere in app:**
```
┌─────────────────────────────────────────────────┐
│ Redirects to /pricing page                      │
│                                                  │
│ ┌─────────────┐  ┌─────────────┐  ┌───────────┐│
│ │   Premium   │  │ Expert Plus │  │ FOUNDER50 ││
│ │  ₹999/mo    │  │  ₹3,999/mo  │  │  ₹14,999  ││
│ │             │  │             │  │  ONE-TIME ││
│ └─────────────┘  └─────────────┘  └───────────┘│
│                                                  │
│ Promo Code Input: [___________] [Apply]         │
│                                                  │
│ Active Campaigns:                                │
│ • FOUNDER50: 13 slots left (7d remaining)        │
│ • EARLYBIRD100: 50% off for 12 months            │
│ • LAUNCH50: 50% off for 3 months                 │
└─────────────────────────────────────────────────┘
```

**2. User selects plan and clicks "Subscribe Now":**
```
┌─────────────────────────────────────────────────┐
│ Payment Modal Opens                              │
│                                                  │
│ Plan: Premium (Monthly)                          │
│ Price: ₹999/month                                │
│ Promo: EARLYBIRD100 (-50%) → ₹499/month         │
│                                                  │
│ Payment Method:                                  │
│ ⚪ Razorpay (For Indian users - UPI/Card/NB)    │
│ ⚪ Stripe (For international users)              │
│                                                  │
│ [Proceed to Payment →]                           │
└─────────────────────────────────────────────────┘
```

**3. Payment Flow (Razorpay for India):**
```
Frontend: POST /routes/create-razorpay-order
         {user_id, plan_name: 'premium', billing_cycle: 'monthly', promo_code: 'EARLYBIRD100'}
         ↓
Backend:  - Fetches plan details (₹999)
         - Applies 50% discount → ₹499
         - Creates Razorpay order
         - Returns order_id, amount, key_id
         ↓
Frontend: Opens Razorpay checkout modal
         - User completes payment
         - Returns payment_id, signature
         ↓
Frontend: POST /routes/verify-razorpay-payment
         {user_id, order_id, payment_id, signature, plan_name, billing_cycle, promo_code}
         ↓
Backend:  - Verifies signature (HMAC)
         - Calls create_subscription API
         - Generates access code (e.g., FE-2K4X9P)
         - Updates promo_code used_slots
         - Returns subscription_id, access_code
         ↓
Frontend: Shows success modal with access code
         "✅ Welcome to Premium! Your access code: FE-2K4X9P"
```

**4. Access Code Activation:**
```
User automatically redirected to /dashboard
Dashboard checks: GET /routes/user-subscription/{user_id}
Returns: {plan_name: 'premium', status: 'active', features: [...]}

Previously locked features now unlocked:
✅ Step 5: Set Your Goals (SIP Planner - Goals tab)
✅ Step 6: Design Asset Allocation
✅ Step 7: FIRE Planning
✅ 3D FIRE-Map journey visualization
✅ 45-min Premium Consultation booking
```

---

### **Phase 3: Premium User Experience**

#### Enhanced Features Access:

**1. 3D FIRE-Map (/journey3d):**
```
- Full interactive 3D visualization unlocked
- Milestone tracking with progress
- Animated journey stages
- Export functionality
```

**2. SIP Planner - Complete Access (/sip-planner):**
```
Tab 1: Set Goals ✅
- Create multiple financial goals
- Track progress
- Goal priority management

Tab 2: Asset Allocation ✅
- Risk profiling questionnaire
- Recommended allocation based on risk
- Custom allocation designer
- Rebalancing suggestions

Tab 3: FIRE Planning ✅
- Comprehensive SIP recommendations
- Monte Carlo simulations
- Retirement projections
- Tax-efficient strategies
```

**3. Premium Consultation (/consultation-new):**
```
Previously: Only 15-min Discovery Call available
Now: 45-min Premium Consultation unlocked
- Book directly with SEBI advisors
- Choose consultation type: FIRE Planning, Investment Strategy, Tax Optimization
- Pre-consultation questionnaire
- Post-consultation summary email
```

**4. Dashboard Enhancements:**
```
- Advanced analytics visible
- Export all reports to PDF
- Priority badge shown
- Access to exclusive webinars (future)
```

---

### **Phase 4: Consultation Booking Flow**

#### Discovery Call (Free - 15 minutes):

```
User navigates to /consultation-new
         ↓
Sees two cards:
┌─────────────────────┐  ┌─────────────────────┐
│ 📞 Discovery Call   │  │ ⭐ Premium Only      │
│ FREE | 15 minutes   │  │ 45 min (LOCKED)     │
│ [Book Now →]        │  │ [Upgrade Required]  │
└─────────────────────┘  └─────────────────────┘
         ↓
Clicks "Book Now" → Modal opens
         ↓
Fills booking form:
- What to discuss? [FIRE Planning / Investment / Tax]
- Preferred date: [Date Picker]
- Preferred time: [Time Picker]
- Name, Email (pre-filled)
- Message (optional)
         ↓
POST /routes/book-consultation
{user_id, consultation_type_id: 1, preferred_date, preferred_time, ...}
         ↓
Backend: Creates booking record
         Checks expert availability
         Returns booking_id
         ↓
Frontend: Shows success message
         "✅ Discovery Call booked for [date] at [time]"
         Email confirmation sent (future)
```

#### Premium Consultation (Premium Users - 45 minutes):

```
Premium user navigates to /consultation-new
         ↓
Sees two cards - both unlocked:
┌─────────────────────┐  ┌─────────────────────┐
│ 📞 Discovery Call   │  │ ⭐ Premium           │
│ FREE | 15 minutes   │  │ 45 min (UNLOCKED)   │
│ [Book Now →]        │  │ [Book Now →]        │
└─────────────────────┘  └─────────────────────┘
         ↓
Clicks Premium "Book Now"
         ↓
Same booking flow BUT:
Backend checks: GET /routes/user-subscription/{user_id}
If plan_name == 'free': Returns HTTP 403 "Premium subscription required"
If plan_name == 'premium' or 'expert_plus': Allows booking
         ↓
Creates booking with consultation_type_id: 2 (Premium)
Expert receives notification
User receives confirmation
```

---

## 🎯 FOMO Strategy Implementation

### 1. FOUNDER50 Campaign (Lifetime Offer)

**Mechanics:**
- **Slot Display:** Real-time countdown (37/50 → 38/50 → ...)
- **Time Pressure:** 7-day deadline with live countdown
- **Visibility:** Shows on pricing page, FOMO banner, exit intent
- **Transparency:** Honest count (started at 37, not 0)

**Psychological Triggers:**
1. **Scarcity:** "Only 13 spots left"
2. **Urgency:** "Ends in 4d 12h 34m"
3. **Social Proof:** "37 founders already joined"
4. **Loss Aversion:** "Never pay subscription fees again"
5. **Value Anchor:** "₹14,999 vs ₹9,999/year = Break-even in 1.5 years"

**Backend Implementation:**
```sql
promo_codes table:
- code: 'FOUNDER50'
- discount_percentage: 100 (lifetime)
- total_slots: 50
- used_slots: 37 (real count)
- end_date: 7 days from campaign start
- is_active: true
```

**Frontend Components:**
- `SpotsMeter.tsx`: Visual progress bar (37/50)
- `CountdownTimer.tsx`: Live countdown (4d 12h 34m)
- `FloatingFOMOBanner.tsx`: Sticky banner with both metrics
- `ExitIntentModal.tsx`: Last-chance offer before leaving

### 2. EARLYBIRD100 Campaign (50% off for 12 months)

**Mechanics:**
- **Slot Limit:** 100 total spots
- **Discount:** 50% off for first year
- **Auto-revert:** After 12 months, renews at full price
- **No Expiry:** Available until 100 redemptions

**Target:** Users who want to try Premium but hesitant on price

**Value Proposition:**
- Premium: ₹999/mo → ₹499/mo (Save ₹6,000/year)
- Expert Plus: ₹3,999/mo → ₹1,999/mo (Save ₹24,000/year)

### 3. LAUNCH50 Campaign (50% off for 3 months)

**Mechanics:**
- **No Slot Limit:** Unlimited redemptions
- **Time-Limited:** Available for 30 days from launch
- **Discount:** 50% off for first 3 months
- **Auto-revert:** After 3 months, renews at full price

**Target:** Launch buzz, social media campaigns

---

## 📊 Revenue Projections

### Conservative (₹50,000/month):
- 30 Premium monthly @ ₹999 = ₹29,970
- 5 Premium yearly @ ₹9,999 = ₹49,995 (amortized: ₹4,166/mo)
- 10 FOUNDER50 lifetime @ ₹14,999 = ₹1,49,990 (one-time)
- 3 Expert Plus monthly @ ₹3,999 = ₹11,997
- **Total MRR:** ₹46,133 + one-time boosts

### Aggressive (₹2,00,000/month):
- 100 Premium monthly @ ₹999 = ₹99,900
- 20 Premium yearly @ ₹9,999 = ₹1,99,980 (amortized: ₹16,665/mo)
- 50 FOUNDER50 lifetime @ ₹14,999 = ₹7,49,950 (one-time)
- 15 Expert Plus monthly @ ₹3,999 = ₹59,985
- **Total MRR:** ₹1,76,550 + one-time boosts

---

## ✅ Implementation Checklist

### Backend (Complete):
- [x] Database migrations (subscriptions, promo_codes, consultations)
- [x] Subscriptions API (6 endpoints)
- [x] Consultation API (3 endpoints)
- [x] Payment API (Razorpay + Stripe endpoints)
- [x] Access code generation
- [x] Promo code validation
- [x] Subscription checking middleware

### Frontend (In Progress):
- [x] Ultra-modern consultation page (/consultation-new)
- [x] FOMO components (CountdownTimer, SpotsMeter, etc.)
- [x] PromoShowcase demo page
- [x] Navigation links
- [ ] **Razorpay payment component** ← NEXT
- [ ] **Stripe payment component**
- [ ] **Pricing page with tier cards**
- [ ] **Premium feature gates** (lock/unlock based on subscription)
- [ ] **Access code redemption flow**
- [ ] **User subscription status display**

### Still To Do:
- [ ] Run database migrations in Supabase
- [ ] Install payment SDKs (razorpay, stripe)
- [ ] Create email templates (access codes, booking confirmations)
- [ ] Set up SMTP for email delivery
- [ ] Add payment success/failure pages
- [ ] Implement feature gating across all premium features
- [ ] Add "Upgrade to Premium" CTAs in locked features
- [ ] Test complete user flow end-to-end
- [ ] Set up analytics tracking for conversion funnel
- [ ] Create admin dashboard for monitoring (future)

---

## 🔐 Security & Compliance

### Payment Security:
- All API keys stored in environment variables
- HMAC signature verification for Razorpay webhooks
- Stripe webhook signature verification
- No sensitive data in frontend code
- HTTPS required for production

### SEBI Compliance:
- Expert revenue tracking in `expert_revenue` table
- Commission transparency (20-30%)
- Clear disclaimers on consultation pages
- Third-party advisor disclosure
- Audit trail for all transactions

### Data Privacy:
- User data encrypted in Supabase
- GDPR-compliant data handling
- Privacy policy linked in footer
- Terms of service linked in footer
- User consent for email communications

---

## 🎯 Success Metrics to Track

### Conversion Funnel:
1. **Visitors** → How many land on homepage
2. **Signups** → Conversion rate (visitors → free users)
3. **Activation** → % who complete Step 0-4
4. **FOMO Engagement** → % who interact with FOMO components
5. **Premium Conversions** → % who upgrade (free → premium)
6. **Consultation Bookings** → Discovery calls vs Premium consultations
7. **Retention** → Monthly churn rate
8. **Revenue** → MRR, LTV, CAC

### FOMO Effectiveness:
- FOUNDER50 redemption rate
- Exit intent modal conversion rate
- Floating banner click-through rate
- Time to conversion after FOMO trigger
- Slot countdown impact on urgency

---

## Status: ✅ Strategy Documented

Next: Create frontend Razorpay payment component to enable actual subscriptions!
