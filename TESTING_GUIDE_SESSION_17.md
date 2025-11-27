# 🧪 Testing Guide - Session 17

## Date: 2025-11-25 (Evening)

---

## ✅ What to Test Now (Migrations Complete!)

### 1. **Test FIREDEMO Access Code** (5 min)

#### SIP Planner Test:
```
1. Open browser: http://localhost:5173/sip-planner
2. Clear localStorage (F12 → Console):
   localStorage.removeItem('sip_planner_access_granted');
3. Refresh page
4. You should see: Access code entry screen with preview
5. Enter: FIREDEMO (or firedemo, case-insensitive)
6. Click "Unlock Access"
7. ✅ Should see full SIP Planner interface
```

#### Portfolio Test:
```
1. Open: http://localhost:5173/portfolio
2. Clear localStorage:
   localStorage.removeItem('portfolio_access_granted');
3. Refresh page
4. See access code screen
5. Enter: FIREDEMO
6. ✅ Should access Portfolio Analyzer
```

---

### 2. **Test Backend APIs** (10 min)

#### Check Database Tables:
```sql
-- Run in Supabase SQL Editor

-- Should show 3 plans
SELECT * FROM subscription_plans;

-- Should show 3 promo codes
SELECT code, code_name, total_slots, used_slots
FROM promo_codes;

-- Should show 2 consultation types
SELECT * FROM consultation_types;
```

#### Test Promo Code API:
```bash
# Open browser or use Postman
http://localhost:8000/routes/promo-stats/FOUNDER50

# Expected response:
{
  "code": "FOUNDER50",
  "code_name": "Founder's Circle",
  "total_slots": 50,
  "used_slots": 37,
  "remaining_slots": 13,
  "percentage_claimed": 74.0,
  "time_remaining": "Xd Xh Xm",
  "is_active": true
}
```

#### Test Active Promos:
```bash
http://localhost:8000/routes/active-promos

# Should return all 3 promo codes
```

---

### 3. **Test Subscription Creation** (15 min)

#### Test Without Payment (Manual):
```bash
# Use Postman or curl

POST http://localhost:8000/routes/create-subscription
Content-Type: application/json

{
  "user_id": "test-user-123",
  "plan_name": "premium",
  "billing_cycle": "lifetime",
  "promo_code": "FOUNDER50",
  "user_email": "test@example.com",
  "user_name": "Test User"
}
```

#### Expected Response:
```json
{
  "success": true,
  "message": "Subscription created successfully!",
  "subscription_id": "uuid-here",
  "access_code": "FE-ABC123XYZ",
  "plan_details": {
    "plan_name": "Premium",
    "is_lifetime": true,
    "features": {...}
  }
}
```

#### Verify in Supabase:
```sql
-- Check subscription was created
SELECT * FROM user_subscriptions
WHERE user_id = 'test-user-123';

-- Check promo code slot updated
SELECT code, used_slots FROM promo_codes
WHERE code = 'FOUNDER50';
-- used_slots should be 38 now (was 37)
```

---

### 4. **Test Email Service** (5 min)

#### Check Backend Logs:
```
Look for in backend terminal:
[Email Service] SMTP not configured - would send email to test@example.com
[Email Service] Subject: 🎉 Your FinEdge360 Premium Access Code
[Email Service] Content preview: <!DOCTYPE html>...
```

If you see this, email service is working but SMTP is not configured (expected for now).

---

### 5. **Test Access Code Validation** (10 min)

#### Validate the Generated Code:
```bash
POST http://localhost:8000/routes/validate-access-code
Content-Type: application/json

{
  "user_id": "test-user-123",
  "access_code": "FE-ABC123XYZ"  # Use the code from step 3
}
```

#### Expected Response (First Time):
```json
{
  "valid": true,
  "already_redeemed": false,
  "message": "Access code activated successfully!",
  "features_unlocked": {...},
  "is_lifetime": true
}
```

#### Expected Response (Second Time):
```json
{
  "valid": true,
  "already_redeemed": true,
  "message": "Access code already activated",
  "redeemed_at": "2025-11-25T...",
  "features_unlocked": {...}
}
```

---

## 🎯 What Should Work Now

### Frontend:
- ✅ FIREDEMO code unlocks SIP Planner
- ✅ FIREDEMO code unlocks Portfolio
- ✅ Access codes persist in localStorage
- ✅ Preview screens show benefits
- ✅ NavBar shows pricing link

### Backend:
- ✅ All database tables created
- ✅ Subscription plans seeded (Free, Premium, Expert Plus)
- ✅ Promo codes seeded (FOUNDER50, EARLYBIRD100, LAUNCH50)
- ✅ Subscription creation works
- ✅ Access code generation works
- ✅ Access code validation works
- ✅ Promo code tracking works
- ✅ Email service integrated (logs only without SMTP)

### Database:
- ✅ 7 new tables created
- ✅ All indexes created
- ✅ Foreign keys set up
- ✅ Default data seeded

---

## ⚠️ What's Still Pending

### Optional for Testing:
- ⏳ SMTP configuration (email won't actually send)
- ⏳ Razorpay test keys (can't test payment yet)
- ⏳ Stripe test keys (alternative payment)

### Not Needed Yet:
- ⏳ Production deployment
- ⏳ WhatsApp integration
- ⏳ Export PDF functionality
- ⏳ Admin dashboard

---

## 🚨 Common Issues & Fixes

### Issue: "Database not initialized"
**Fix**: Check environment variables:
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

### Issue: "Invalid promo code"
**Fix**: Check promo code exists:
```sql
SELECT code FROM promo_codes WHERE is_active = true;
```

### Issue: "Access code not working"
**Fix**: Check subscription was created:
```sql
SELECT access_code FROM user_subscriptions
WHERE user_id = 'test-user-123';
```

### Issue: FIREDEMO not working
**Fix**:
1. Clear localStorage
2. Check case (should be case-insensitive)
3. Look for typos in code entry

---

## 📊 Test Coverage

### Core Flows to Test:
- [x] FIREDEMO demo access
- [x] Database migrations
- [ ] Manual subscription creation (API test)
- [ ] Access code validation
- [ ] Promo code stats API
- [ ] User subscription status check
- [ ] Payment flow (when keys configured)
- [ ] Email delivery (when SMTP configured)

---

## 🎉 Success Criteria

After testing, you should see:
- ✅ FIREDEMO works on both SIP Planner and Portfolio
- ✅ All 3 subscription plans in database
- ✅ All 3 promo codes active
- ✅ Can create subscription via API
- ✅ Access codes generate in FE-XXXXXX format
- ✅ Access codes validate correctly
- ✅ Promo code slots track correctly
- ✅ Email service logs (even without SMTP)

---

## 🔜 Next Steps After Testing

### If Everything Works:
1. **Configure SMTP** (optional - for real emails)
2. **Set up Razorpay test keys**
3. **Test complete payment flow**
4. **Test end-to-end user journey**

### If Issues Found:
1. **Check backend logs** for errors
2. **Check Supabase logs** for database errors
3. **Verify environment variables** are set
4. **Test each API endpoint** individually

---

## 💡 Quick Debug Commands

```bash
# Check frontend is running
curl http://localhost:5173

# Check backend is running
curl http://localhost:8000/health

# Check database connection
# (Run in Python/backend)
from supabase import create_client
import os
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)
print(supabase.table("subscription_plans").select("*").execute())
```

---

**Last Updated**: 2025-11-25 (Evening)
**Status**: Ready for comprehensive testing
**Estimated Testing Time**: 45-60 minutes

---

*Generated by Claude Code 💙*
*Session 17 Testing Guide*
