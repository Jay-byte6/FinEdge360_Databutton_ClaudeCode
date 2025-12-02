# Razorpay Payment Gateway Setup - Quick Start

## ✅ Current Status

Your app already has:
- ✅ Payment API endpoints implemented
- ✅ Razorpay integration code ready
- ✅ Subscription system configured
- ✅ Email notifications working
- ❌ Razorpay credentials not configured yet

## 🚀 Quick Setup (10 minutes)

### Step 1: Create Razorpay Account (5 minutes)

1. **Go to**: https://razorpay.com
2. **Click**: "Sign Up"
3. **Choose**: Business account
4. **Enter**:
   - Business email
   - Mobile number
   - Business name: "FinEdge360" or your company name
5. **Verify**: Email and mobile OTP
6. **Complete**: Basic business details

**Note**: You can use **Test Mode** immediately without KYC for development!

### Step 2: Get Test API Keys (2 minutes)

1. **Login** to Razorpay Dashboard
2. **Go to**: Settings → API Keys
3. **Mode**: Make sure you're in **Test Mode** (toggle at top)
4. **Click**: "Generate Test Keys" (if not already generated)
5. **Copy**:
   - **Key ID**: Starts with `rzp_test_`
   - **Key Secret**: Click "eye" icon to reveal

**Example**:
```
Key ID: rzp_test_AbC123XyZ456
Key Secret: 1a2b3c4d5e6f7g8h9i0j
```

### Step 3: Add to Environment Variables (1 minute)

Add these lines to your `backend/.env` file:

```bash
# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Replace** with your actual keys from Step 2.

### Step 4: Install Razorpay SDK (1 minute)

Run in terminal:

```bash
cd backend
pip install razorpay
```

### Step 5: Restart Backend Server (1 minute)

Stop and restart your backend server to load new environment variables.

You should see in logs:
```
[Payments API] Initialized
  Razorpay configured: True ✅
  Stripe configured: False
```

## 🧪 Test Payment Integration

### Test 1: Check Configuration

```bash
curl http://localhost:8000/routes/payment-config
```

**Expected Response**:
```json
{
  "razorpay_enabled": true,
  "stripe_enabled": false,
  "razorpay_key_id": "rzp_test_..."
}
```

### Test 2: Create Test Order

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
  "key_id": "rzp_test_..."
}
```

### Test 3: Test in Frontend

1. Go to your Pricing page: http://localhost:5173/pricing
2. Click "Subscribe" on Premium plan
3. Razorpay checkout modal should open
4. Use Razorpay **Test Card**:
   - **Card Number**: 4111 1111 1111 1111
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
   - **Name**: Any name
5. Payment should succeed
6. You should receive email with access code

## 📱 Razorpay Test Cards

Razorpay provides test cards for different scenarios:

| Scenario | Card Number | Result |
|----------|-------------|---------|
| Success | 4111 1111 1111 1111 | Payment succeeds |
| Failure | 4000 0000 0000 0002 | Payment fails |
| Timeout | 5200 0000 0000 0007 | Payment timeout |

**Other Test Details**:
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 1234 (for test mode)

## 🔍 Verify Payment in Razorpay Dashboard

After test payment:

1. **Go to**: Razorpay Dashboard → Payments
2. **See**: Your test payment listed
3. **Status**: Success/Failed
4. **Amount**: ₹999 (or your plan amount)
5. **Customer**: Your test user details

## 💰 Pricing Reference

Your current subscription plans:

| Plan | Monthly | Yearly | Features |
|------|---------|--------|----------|
| Free | ₹0 | - | Basic features |
| Premium | ₹999 | ₹9,990 | All features + consultation |
| Expert Plus | ₹3,999 | ₹39,990 | Premium + unlimited support |

## 🎯 Payment Flow Explained

1. **User clicks "Subscribe"** on Pricing page
2. **Frontend calls** `/create-razorpay-order` API
3. **Backend creates** Razorpay order
4. **Frontend shows** Razorpay checkout modal
5. **User enters** card details
6. **Razorpay processes** payment
7. **Frontend receives** payment response
8. **Frontend calls** `/verify-razorpay-payment` API
9. **Backend verifies** payment signature
10. **Backend creates** subscription record
11. **Backend sends** email with access code
12. **User receives** access code email
13. **User activates** Premium access

## 🔒 Security Features

Your payment integration includes:

✅ **Signature Verification**: Validates payment authenticity
✅ **Server-side Validation**: All verification on backend
✅ **HTTPS Only**: Secure communication
✅ **Environment Variables**: Keys not in code
✅ **Amount Validation**: Checks payment amount matches
✅ **Duplicate Prevention**: Prevents double processing

## ⚠️ Important Notes

### Test Mode vs Live Mode

**Test Mode** (Current):
- Use test API keys (rzp_test_...)
- Use test cards
- No real money charged
- Perfect for development

**Live Mode** (Production):
- Requires KYC verification
- Use live API keys (rzp_live_...)
- Real money charged
- Collect actual payments

### When to Switch to Live Mode

Switch to Live Mode when:
1. ✅ All testing complete
2. ✅ KYC verification done
3. ✅ Business documents submitted
4. ✅ Bank account linked
5. ✅ Ready for real customers

## 📋 KYC Requirements (For Live Mode)

To activate Live Mode, submit:

1. **PAN Card** (business/individual)
2. **Business Proof**:
   - Certificate of Incorporation, OR
   - Partnership Deed, OR
   - MSME Registration, OR
   - GST Certificate
3. **Bank Account Details**:
   - Cancelled cheque OR
   - Bank statement
4. **Business Address Proof**:
   - Utility bill
   - Rent agreement

**Timeline**: 2-3 business days for approval

## 🎉 Success Criteria

You'll know Razorpay is working when:

- ✅ Configuration shows "Razorpay configured: True"
- ✅ Test order creation succeeds
- ✅ Razorpay checkout modal opens
- ✅ Test payment goes through
- ✅ Subscription is created
- ✅ Access code email is sent
- ✅ Payment shows in Razorpay dashboard

## 🆘 Troubleshooting

### Issue: "Razorpay not configured"

**Solution**:
1. Check `.env` file has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
2. Restart backend server
3. Verify keys are correct (no extra spaces)

### Issue: "Invalid Key ID"

**Solution**:
1. Make sure you're using TEST keys (rzp_test_...)
2. Regenerate keys in Razorpay dashboard
3. Update `.env` file

### Issue: Payment fails with "Invalid signature"

**Solution**:
1. Check Key Secret is correct
2. Ensure no spaces in key values
3. Restart backend server

### Issue: Checkout modal doesn't open

**Solution**:
1. Check browser console for errors
2. Verify Razorpay script is loaded
3. Check API response has order_id and key_id

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Support**: support@razorpay.com
- **Test Dashboard**: https://dashboard.razorpay.com/test/payments

## 🚀 Next Steps After Setup

1. **Test all payment flows** (monthly, yearly, with/without promo)
2. **Test with different cards** (success, failure scenarios)
3. **Verify email delivery** for each payment
4. **Check Razorpay dashboard** for payment logs
5. **Set up webhooks** (optional, for automatic sync)
6. **Complete KYC** when ready for production
7. **Switch to Live Mode** and go live!

---

**Estimated Setup Time**: 10-15 minutes
**Difficulty**: Easy
**Cost**: Free (Test Mode) | 2% transaction fee (Live Mode)

**Status**: Ready to configure
**Next Step**: Get Razorpay test API keys and add to `.env` file
