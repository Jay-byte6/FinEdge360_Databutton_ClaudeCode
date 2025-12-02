# Run All Required Migrations for Email Testing

## 📋 Current Status

✅ `subscription_plans` table created
❌ `promo_codes` table missing
❌ Other supporting tables may be missing

## 🚀 Quick Solution - Run All Migrations

To test the email functionality, you need to run these 3 migrations **in order**:

### Migration 1: Subscriptions
**File**: `backend/migrations/001_subscriptions.sql`
**Status**: ✅ Already done!

### Migration 2: Promo Codes
**File**: `backend/migrations/002_promo_codes.sql`
**Action**: Run this NOW

1. Go to: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/sql/new
2. Open file: `backend/migrations/002_promo_codes.sql`
3. Copy entire contents
4. Paste in SQL Editor
5. Click **Run**

This creates:
- `promo_codes` table with FOUNDER50, EARLYBIRD100, LAUNCH50 campaigns
- `promo_code_usage` tracking table
- Default promo codes ready to use

### Migration 3: Consultations (Optional for email test)
**File**: `backend/migrations/003_consultations.sql`
**Action**: Can skip for now, only needed for consultation bookings

## ✅ After Running Migration 2

Test the email again:

```bash
curl -X POST http://localhost:8000/routes/create-subscription -H "Content-Type: application/json" -d "{\"user_id\":\"test-123\",\"plan_name\":\"premium\",\"billing_cycle\":\"lifetime\",\"promo_code\":\"FOUNDER50\",\"user_email\":\"jsjaiho5@gmail.com\",\"user_name\":\"Test User\"}"
```

### Expected Success Response:

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "id": "uuid-here",
    "user_id": "test-123",
    "plan_name": "premium",
    "access_code": "FE-ABC123",
    "status": "active",
    "billing_cycle": "lifetime",
    "promo_code_used": "FOUNDER50",
    "subscription_start": "2025-12-02T...",
    "subscription_end": null,
    "is_lifetime": true
  },
  "email_sent": true
}
```

### Check Backend Logs:

You should see:
```
[Email Service] Sending access code email to jsjaiho5@gmail.com
[Email Service] Email sent successfully to jsjaiho5@gmail.com
```

### Check Your Email (within 2 minutes):

**To**: jsjaiho5@gmail.com
**Subject**: 🎉 Your FinEdge360 Premium Access Code
**Content**: Beautiful HTML email with access code FE-ABC123

## 🎯 Quick Reference - All Migrations

For completeness, here's what each migration does:

| Migration | File | Purpose | Required for Email Test? |
|-----------|------|---------|-------------------------|
| 001 | subscriptions.sql | Subscription plans & user subs | ✅ YES |
| 002 | promo_codes.sql | Promo codes & usage tracking | ✅ YES |
| 003 | consultations.sql | Expert consultations & bookings | ❌ NO |

## 🔍 Verify Tables Exist

After running migrations, verify:

```sql
-- Run in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'subscription_plans',
    'user_subscriptions',
    'promo_codes',
    'promo_code_usage'
  )
ORDER BY table_name;
```

Should return all 4 tables.

## ⚠️ Common Issues

### Issue: "Table already exists"
**Solution**: Safe to ignore, migration uses `CREATE TABLE IF NOT EXISTS`

### Issue: "Duplicate key value violates unique constraint"
**Solution**: Default data already inserted, safe to ignore

### Issue: Still getting table not found error
**Solution**:
1. Check you ran migration in correct Supabase project (gzkuoojfoaovnzoczibc)
2. Refresh schema cache in Supabase
3. Restart backend server

## 📧 Final Email Test

Once Migration 2 is complete, the email test should work!

**Test Command**:
```bash
curl -X POST http://localhost:8000/routes/create-subscription -H "Content-Type: application/json" -d "{\"user_id\":\"test-123\",\"plan_name\":\"premium\",\"billing_cycle\":\"lifetime\",\"promo_code\":\"FOUNDER50\",\"user_email\":\"jsjaiho5@gmail.com\",\"user_name\":\"Test User\"}"
```

**What Happens**:
1. ✅ Creates subscription record
2. ✅ Generates access code (FE-XXXXXX)
3. ✅ Sends HTML email via SMTP
4. ✅ Email arrives in your inbox
5. ✅ You see beautiful professional email

## 🎉 Success Indicators

You'll know it worked when:
- ✅ API returns `"email_sent": true`
- ✅ Backend logs show "Email sent successfully"
- ✅ Email arrives within 2 minutes
- ✅ Email has beautiful formatting
- ✅ Access code is clearly visible

---

**Next Step**: Run `002_promo_codes.sql` migration in Supabase
**Time Required**: 1 minute
**Then**: Re-run curl command to test email
