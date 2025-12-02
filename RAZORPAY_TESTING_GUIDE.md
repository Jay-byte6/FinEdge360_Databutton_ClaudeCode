# Razorpay Payment Testing Guide

## ✅ Configuration Status

**Razorpay is now fully configured!**

```json
{
  "razorpay": {
    "enabled": true,
    "key_id": "rzp_test_RmpuAHqs0CJMQB"
  }
}
```

## 🧪 How to Test Razorpay Payments

### Option 1: Test via API (Quick Test)

Create a test order:

```bash
curl -X POST http://localhost:8000/routes/create-razorpay-order \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000123",
    "plan_name": "premium",
    "billing_cycle": "monthly",
    "promo_code": null,
    "payment_method": "razorpay"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "order_id": "order_ABC123...",
  "amount": 99900,
  "currency": "INR",
  "key_id": "rzp_test_RmpuAHqs0CJMQB"
}
```

### Option 2: Test via Frontend (Full User Experience)

1. **Go to Pricing Page**:
   ```
   http://localhost:5173/pricing
   ```

2. **Click "Subscribe" on Premium Plan**

3. **Razorpay Checkout Modal Opens**

4. **Enter Test Card Details**:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Cardholder Name**: Any name
   - **OTP** (if prompted): `1234`

5. **Click "Pay"**

6. **Payment Succeeds**

7. **You receive email** with access code within 60 seconds

## 💳 Razorpay Test Cards

Use these test cards for different scenarios:

| Scenario | Card Number | Expiry | CVV | Result |
|----------|-------------|--------|-----|--------|
| **Success** | 4111 1111 1111 1111 | Any future | Any | Payment succeeds ✅ |
| **Failure** | 4000 0000 0000 0002 | Any future | Any | Payment fails ❌ |
| **Timeout** | 5200 0000 0000 0007 | Any future | Any | Payment times out ⏱️ |
| **Insufficient Funds** | 4000 0000 0000 9995 | Any future | Any | Insufficient funds ⚠️ |

**Test Mode OTP**: Always use `1234`

## 📊 Verify Payment in Razorpay Dashboard

After making a test payment:

1. **Login to Razorpay Dashboard**: https://dashboard.razorpay.com/test/payments
2. **Go to**: Payments section
3. **See your test payment**:
   - Status: Captured/Failed
   - Amount: ₹999.00 (or your plan amount)
   - Customer: Your test user details
   - Payment Method: Card

## 💰 Plan Pricing

| Plan | Monthly | Yearly | Lifetime (via FOUNDER50) |
|------|---------|--------|--------------------------|
| Free | ₹0 | - | - |
| Premium | ₹999 | ₹9,990 | ₹0 (with promo) |
| Expert Plus | ₹3,999 | ₹39,990 | ₹0 (with promo) |

**Note**: FOUNDER50 promo code gives lifetime Premium access for free!

## 🔄 Complete Payment Flow Test

### Step-by-Step Walkthrough:

1. **User on Pricing Page**
   - Sees all 3 plans (Free, Premium, Expert Plus)
   - Clicks "Subscribe" on Premium

2. **Create Order API Called**
   - Frontend sends: `POST /create-razorpay-order`
   - Backend creates Razorpay order
   - Returns order details + Razorpay key

3. **Razorpay Checkout Opens**
   - Modal shows plan details
   - Amount: ₹999
   - User enters card details

4. **User Pays**
   - Razorpay processes payment
   - Returns payment response to frontend

5. **Verify Payment API Called**
   - Frontend sends: `POST /verify-razorpay-payment`
   - Backend verifies payment signature
   - Creates subscription record
   - Generates access code (e.g., FE-ABC123)

6. **Email Sent**
   - User receives email with access code
   - Email has beautiful HTML formatting
   - Includes activation instructions

7. **User Activates**
   - User enters access code in dashboard
   - Premium features unlocked
   - Status shows "Premium"

## 🎯 What to Test

### Test Case 1: Successful Payment (Monthly Premium)

**Steps**:
1. Go to pricing page
2. Click Subscribe on Premium (Monthly)
3. Enter test card: 4111 1111 1111 1111
4. Complete payment

**Expected**:
- ✅ Payment succeeds
- ✅ Subscription created in database
- ✅ Access code generated
- ✅ Email sent to user
- ✅ Payment shows in Razorpay dashboard

### Test Case 2: Successful Payment (Yearly Premium)

**Steps**:
1. Same as above but select "Yearly" billing
2. Amount should be ₹9,990

**Expected**:
- ✅ Higher amount charged
- ✅ Subscription shows yearly billing

### Test Case 3: Payment with Promo Code

**Steps**:
1. Go to pricing page
2. Enter promo code: FOUNDER50
3. Click Subscribe on Premium
4. Payment amount should be ₹0

**Expected**:
- ✅ Free lifetime subscription
- ✅ No payment required
- ✅ Access code still generated
- ✅ Email still sent

### Test Case 4: Failed Payment

**Steps**:
1. Go to pricing page
2. Click Subscribe
3. Enter failure test card: 4000 0000 0000 0002
4. Try to pay

**Expected**:
- ❌ Payment fails
- ❌ Subscription not created
- ❌ No email sent
- ✅ Error message shown to user

### Test Case 5: Expert Plus Plan

**Steps**:
1. Test with Expert Plus plan
2. Amount: ₹3,999 monthly or ₹39,990 yearly

**Expected**:
- ✅ Higher amount charged
- ✅ Subscription created for correct plan
- ✅ Email mentions Expert Plus features

## 🔍 Backend Logs to Check

After payment, check backend logs for:

```
[Create Razorpay Order] User: ..., Plan: premium
[Create Razorpay Order] Created order: order_...
[Verify Razorpay Payment] Verifying payment: ...
[Verify Razorpay Payment] Payment verified successfully
[Create Subscription] Generated access code: FE-ABC123
[Email Service] Email sent successfully to user@email.com
```

## ✅ Success Checklist

Payment integration is working when:

- [ ] Payment config shows Razorpay enabled
- [ ] Create order API returns order_id
- [ ] Razorpay checkout modal opens
- [ ] Test card payment succeeds
- [ ] Payment signature verifies correctly
- [ ] Subscription created in database
- [ ] Access code generated
- [ ] Email sent to user
- [ ] Payment shows in Razorpay dashboard
- [ ] Access code can be activated

## 🐛 Troubleshooting

### Issue: Razorpay checkout doesn't open

**Solution**:
1. Check browser console for errors
2. Verify Razorpay script is loaded
3. Check order API returns valid response

### Issue: Payment fails with "Invalid signature"

**Solution**:
1. Check RAZORPAY_KEY_SECRET in .env
2. Ensure no spaces in key values
3. Restart backend server

### Issue: Email not sent after payment

**Solution**:
1. Check SMTP configuration
2. Verify backend logs for email errors
3. Check spam folder

### Issue: "Razorpay not configured"

**Solution**:
1. Verify .env has both key_id and key_secret
2. Restart backend server
3. Check payment-config endpoint

## 🔐 Security Verification

The payment integration includes:

✅ **Signature Verification**: Every payment verified server-side
✅ **Amount Validation**: Ensures payment amount matches plan
✅ **Server-side Processing**: All critical logic on backend
✅ **Environment Variables**: Keys not in code
✅ **HTTPS Only**: Secure communication (in production)
✅ **Duplicate Prevention**: Same payment not processed twice

## 📞 Support

If you encounter issues:

1. **Check Razorpay Logs**: Dashboard → Payments
2. **Check Backend Logs**: Terminal running uvicorn
3. **Check Browser Console**: F12 → Console tab
4. **Razorpay Docs**: https://razorpay.com/docs/payments/
5. **Razorpay Support**: support@razorpay.com

## 🚀 Next Steps

After successful testing:

1. **Test all payment scenarios** (success, failure, timeout)
2. **Test with different plans** (Premium, Expert Plus)
3. **Test promo codes** (FOUNDER50, EARLYBIRD100)
4. **Verify email delivery** for each payment
5. **Check database records** are created correctly
6. **Test access code activation** in dashboard
7. **Complete KYC** in Razorpay dashboard
8. **Switch to Live Mode** when ready for production

## 🎉 Going Live Checklist

Before switching to production:

- [ ] All test cases pass
- [ ] KYC verification completed in Razorpay
- [ ] Live API keys generated
- [ ] Update .env with live keys (rzp_live_...)
- [ ] Test with real cards (small amounts first)
- [ ] Set up webhooks for payment sync
- [ ] Enable logging and monitoring
- [ ] Add error handling for edge cases
- [ ] Test on mobile devices
- [ ] Verify SSL certificate is valid

---

**Status**: Razorpay configured and ready to test ✅
**Test Mode**: Active (using rzp_test_... keys)
**Next Step**: Test payment flow via frontend
**Documentation**: Full testing guide above
