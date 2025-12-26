# Payment Integration Setup Guide

## Overview

FinEdge360 supports two payment gateways:
1. **Razorpay** - For Indian customers (INR)
2. **Stripe** - For international customers (USD/EUR)

---

## 🇮🇳 Razorpay Setup (India)

### Step 1: Create Razorpay Account

1. Go to https://razorpay.com
2. Sign up for a business account
3. Complete KYC verification
4. Activate your account

### Step 2: Get API Keys

1. Go to **Settings** → **API Keys**
2. Generate **Test Keys** (for development)
3. Later, generate **Live Keys** (for production)

### Step 3: Set Environment Variables

Add to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
```

### Step 4: Install Razorpay SDK

```bashJay Palani Palya No no no
cd backend
pip install razorpay
```

### Step 5: Update Payment API

Uncomment the Razorpay integration code in:
- `backend/app/apis/payments/__init__.py`

---

## 🌍 Stripe Setup (International)

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete business verification

### Step 2: Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### Step 3: Set Environment Variables

Add to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

### Step 4: Install Stripe SDK

```bash
cd backend
pip install stripe
```

### Step 5: Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/routes/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
4. Copy the **Webhook signing secret**

---

## 📋 Implementation Checklist

### Backend API Endpoints Created:

✅ **POST** `/routes/create-razorpay-order`
- Creates Razorpay order
- Returns order_id, amount, key_id

✅ **POST** `/routes/verify-razorpay-payment`
- Verifies payment signature
- Creates subscription
- Returns access code

✅ **POST** `/routes/create-stripe-session`
- Creates Stripe checkout session
- Returns session_id

✅ **POST** `/routes/stripe-webhook`
- Handles Stripe webhook events
- Updates subscription status

✅ **GET** `/routes/payment-config`
- Returns payment gateway configuration
- Public keys only

### Still To Do:

⏳ **Install Payment SDKs**
```bash
pip install razorpay stripe
```

⏳ **Uncomment Integration Code**
- Razorpay client initialization
- Stripe session creation
- Webhook signature verification

⏳ **Create Frontend Payment Components**
- Razorpay payment modal
- Stripe Elements integration
- Payment success/failure pages

⏳ **Test Payment Flows**
- Test Razorpay with test card numbers
- Test Stripe with test card: `4242 4242 4242 4242`

---

## 💳 Test Cards

### Razorpay Test Cards

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`

### Stripe Test Cards

**Success:**
- Card: `4242 4242 4242 4242`
- CVV: Any 3 digits
- Expiry: Any future date
- ZIP: Any 5 digits

**3D Secure:**
- Card: `4000 0027 6000 3184`

---

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use test keys** in development
3. **Verify webhook signatures** always
4. **Log all transactions** for audit trail
5. **Use HTTPS** in production
6. **Implement rate limiting** on payment endpoints
7. **Store payment details** in Supabase with encryption

---

## 🚀 Going Live

### Before Production:

1. ✅ Complete KYC for both gateways
2. ✅ Switch to live API keys
3. ✅ Update webhook URLs
4. ✅ Test with small real transactions
5. ✅ Set up monitoring and alerts
6. ✅ Configure proper error handling
7. ✅ Add payment failure retry logic
8. ✅ Set up customer support for payment issues

### Live Keys Setup:

```bash
# Production .env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

---

## 📊 Payment Flow

### Razorpay Flow:

1. User selects plan (Premium/Expert Plus)
2. Frontend calls `/create-razorpay-order`
3. Backend creates order, returns order_id
4. Frontend opens Razorpay checkout modal
5. User completes payment
6. Razorpay returns payment_id and signature
7. Frontend calls `/verify-razorpay-payment`
8. Backend verifies signature
9. Backend creates subscription
10. Backend returns access code
11. User can now access premium features

### Stripe Flow:

1. User selects plan
2. Frontend calls `/create-stripe-session`
3. Backend creates Stripe checkout session
4. User redirected to Stripe hosted page
5. User completes payment
6. Stripe sends webhook to backend
7. Backend verifies webhook signature
8. Backend creates subscription
9. User redirected to success page
10. Access code displayed/emailed

---

## 🛠️ Troubleshooting

### Common Issues:

**"Payment gateway not configured"**
- Check `.env` file has correct keys
- Restart backend server after adding keys

**"Invalid signature"**
- Verify webhook secret is correct
- Check signature verification logic

**"Order creation failed"**
- Check Razorpay/Stripe account is active
- Verify API keys have correct permissions

**"Webhook not receiving events"**
- Check webhook URL is publicly accessible
- Verify webhook endpoint is registered
- Check webhook logs in dashboard

---

## 📞 Support

- **Razorpay Support:** https://razorpay.com/support/
- **Stripe Support:** https://support.stripe.com/
- **FinEdge360 Docs:** See `SESSION_14_PROGRESS.md`

---

## Status: ⚠️ Needs SDK Installation & Frontend Integration

Backend API structure is ready. Next steps:
1. Install payment SDKs (razorpay, stripe)
2. Uncomment integration code
3. Create frontend payment components
4. Test payment flows
