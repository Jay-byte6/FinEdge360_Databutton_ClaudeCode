# SMTP Email Configuration Guide - FinEdge360

## Date: 2025-11-25

---

## 🎯 Purpose

Configure SMTP email service to enable:
- Access code delivery after subscription purchase
- Payment receipts
- Consultation booking confirmations
- Subscription expiry reminders

---

## ⏱️ Time Required: 10 minutes

---

## 📋 Prerequisites

- Gmail account OR SendGrid account
- Backend/.env file access

---

## 🔧 Option 1: Gmail (Recommended for Testing)

### Step 1: Enable 2-Step Verification (If not already enabled)

1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup wizard
4. Verify with your phone

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or search "App passwords" in Google Account settings
2. You may need to verify your password
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **FinEdge360**
6. Click **Generate**
7. **COPY the 16-character password** (spaces don't matter)
   - Example: `abcd efgh ijkl mnop`

### Step 3: Configure Backend Environment

Open `backend/.env` and add:

```bash
# SMTP Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
FROM_EMAIL=noreply@finedge360.com
```

**Replace**:
- `your-email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the 16-character app password (remove spaces)

### Step 4: Restart Backend Server

```bash
# Stop backend (Ctrl+C in the terminal running it)
# Then restart:
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Verify Configuration

You should see in the terminal:
```
[Email Service] Initialized
  SMTP Server: smtp.gmail.com:587
  SMTP Configured: YES
```

---

## 🔧 Option 2: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account

1. Go to: https://signup.sendgrid.com/
2. Sign up for free account (100 emails/day free forever)
3. Verify your email address
4. Complete sender verification

### Step 2: Create API Key

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Name: **FinEdge360 Production**
4. Select: **Full Access** (or Restricted with Mail Send permission)
5. Click "Create & View"
6. **COPY the API key** (you won't see it again!)
   - Example: `SG.abc123xyz...`

### Step 3: Configure Backend Environment

Open `backend/.env` and add:

```bash
# SMTP Configuration (SendGrid)
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-api-key-here
FROM_EMAIL=noreply@finedge360.com
```

**Replace**:
- `SG.your-api-key-here` with your actual SendGrid API key
- Keep `SMTP_USERNAME=apikey` as-is (don't change this!)

### Step 4: Verify Sender Email (Important!)

1. Go to: https://app.sendgrid.com/settings/sender_auth
2. Click "Verify a Single Sender"
3. Enter email: `noreply@finedge360.com` (or your domain)
4. Fill in sender details
5. Check your email and click verification link

**Note**: For production, use domain authentication instead of single sender

### Step 5: Restart Backend Server

```bash
# Stop backend (Ctrl+C)
# Restart:
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 6: Verify Configuration

Terminal should show:
```
[Email Service] Initialized
  SMTP Server: smtp.sendgrid.net:587
  SMTP Configured: YES
```

---

## 🔧 Option 3: Other SMTP Providers

### Popular Options:

#### Mailgun
```bash
SMTP_SERVER=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
FROM_EMAIL=noreply@finedge360.com
```

#### AWS SES
```bash
SMTP_SERVER=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
FROM_EMAIL=noreply@finedge360.com
```

#### Outlook/Office 365
```bash
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
FROM_EMAIL=your-email@outlook.com
```

---

## ✅ Testing Email Delivery

### Test 1: Check Configuration Endpoint

```bash
# In browser or curl
http://localhost:8000/routes/test-email-config
```

Expected response:
```json
{
  "smtp_configured": true,
  "smtp_server": "smtp.gmail.com:587",
  "from_email": "noreply@finedge360.com"
}
```

### Test 2: Send Test Email via API

```bash
curl -X POST http://localhost:8000/routes/create-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "plan_name": "premium",
    "billing_cycle": "lifetime",
    "promo_code": "FOUNDER50",
    "user_email": "YOUR_EMAIL@gmail.com",
    "user_name": "Test User"
  }'
```

**Replace** `YOUR_EMAIL@gmail.com` with your actual email.

### Test 3: Check Your Inbox

Within 1-2 minutes, you should receive:
- Subject: "🎉 Your FinEdge360 Premium Access Code"
- Beautiful HTML email
- Access code in format: FE-XXXXXX
- Professional formatting

**Check spam folder if not received!**

---

## 🔍 Troubleshooting

### Issue 1: "SMTP not configured"

**Symptom**: Backend logs show `SMTP Configured: NO`

**Solution**:
1. Check `.env` file has SMTP variables
2. Verify no typos in variable names
3. Restart backend server
4. Check environment variables loaded:
   ```python
   import os
   print(os.getenv("SMTP_USERNAME"))
   ```

---

### Issue 2: "Authentication failed"

**Symptom**: Error when sending email

**Gmail Solutions**:
- Verify app password is correct (no spaces)
- Check 2-Step Verification is enabled
- Try generating new app password
- Ensure "Less secure app access" is OFF (use app passwords instead)

**SendGrid Solutions**:
- Verify API key is correct
- Check API key has Mail Send permission
- Verify sender email is authenticated

---

### Issue 3: Email goes to spam

**Solutions**:
1. **SPF Record**: Add to DNS
   ```
   v=spf1 include:_spf.google.com ~all  (for Gmail)
   v=spf1 include:sendgrid.net ~all     (for SendGrid)
   ```

2. **DKIM**: Enable in SendGrid dashboard

3. **DMARC**: Add DNS record
   ```
   v=DMARC1; p=none; rua=mailto:admin@finedge360.com
   ```

4. **Content**: Avoid spam trigger words
   - Remove: "FREE", "URGENT", "ACT NOW"
   - Use professional language
   - Include unsubscribe link (for marketing emails)

---

### Issue 4: Email not sending

**Check Backend Logs**:
```
[Email Service] Error sending email: [error message]
```

**Common Errors**:

1. **Connection timeout**:
   - Check SMTP_SERVER and SMTP_PORT
   - Verify firewall allows outbound port 587
   - Try port 465 (SSL) instead

2. **Authentication error**:
   - Verify username and password
   - Check credentials are not expired

3. **Recipient rejected**:
   - Verify email address is valid
   - Check recipient domain exists

---

### Issue 5: Emails sending slowly

**Solutions**:
1. Use async email sending (queue)
2. Implement retry logic
3. Use dedicated email service (SendGrid, Mailgun)
4. Monitor rate limits

---

## 📊 Email Service Limits

### Gmail (Free):
- 500 emails/day
- 100 recipients per email
- Good for: Testing, small projects

### SendGrid (Free Tier):
- 100 emails/day forever
- 40,000 emails first 30 days
- Good for: Small to medium projects

### SendGrid (Essentials - $19.95/mo):
- 50,000 emails/month
- Good for: Production use

### Mailgun (Free):
- 5,000 emails/month for 3 months
- Then pay-as-you-go
- Good for: Production use

---

## 🔒 Security Best Practices

### 1. Never commit credentials
```bash
# .gitignore should include:
.env
.env.local
*.env
```

### 2. Use environment-specific configs
```bash
# Development
.env.development

# Production
.env.production
```

### 3. Rotate credentials regularly
- Change app passwords every 3-6 months
- Regenerate API keys quarterly

### 4. Monitor email bounces
- Track bounce rate
- Remove invalid emails
- Handle unsubscribes

### 5. Use dedicated sending domain
- Not your main domain
- Example: mail.finedge360.com
- Protects main domain reputation

---

## 📧 Email Templates Included

Your system has 3 email templates ready:

### 1. Access Code Email
**File**: `backend/app/utils/email_service.py` (lines 65-277)

**Features**:
- Beautiful gradient header
- Large access code display (36px)
- Step-by-step instructions
- Feature list with checkmarks
- CTA button to dashboard
- Professional footer

**Triggered**: After subscription purchase

---

### 2. Payment Receipt Email
**File**: `backend/app/utils/email_service.py` (lines 280-391)

**Features**:
- Clean invoice format
- Transaction details
- Plan information
- Payment confirmation

**Triggered**: After payment verification

---

### 3. Subscription Expiry Reminder
**File**: `backend/app/utils/email_service.py` (lines 394-444)

**Features**:
- Urgent alert design
- Days remaining countdown
- Renewal CTA button

**Triggered**: 30/7/1 days before expiry (needs cron job)

---

## 🎯 Production Checklist

Before launching:

- [ ] SMTP configured with production credentials
- [ ] Sender email verified
- [ ] SPF record added to DNS
- [ ] DKIM configured (for SendGrid)
- [ ] Test email delivery to multiple providers
- [ ] Check spam score (use mail-tester.com)
- [ ] Set up email monitoring
- [ ] Configure bounce handling
- [ ] Add unsubscribe link (for marketing emails)
- [ ] Implement rate limiting
- [ ] Set up email logs
- [ ] Test on mobile devices

---

## 📈 Monitoring Email Delivery

### Key Metrics to Track:

1. **Delivery Rate**: % of emails delivered
   - Target: > 95%

2. **Open Rate**: % of emails opened
   - Target: 20-30% (access codes likely higher)

3. **Bounce Rate**: % of emails bounced
   - Target: < 2%

4. **Spam Complaints**: Users marking as spam
   - Target: < 0.1%

5. **Send Time**: Time to deliver
   - Target: < 30 seconds

### Monitoring Tools:
- SendGrid Dashboard (built-in analytics)
- Google Postmaster Tools (for Gmail delivery)
- Mail-Tester.com (spam score checker)

---

## 🆘 Support Resources

### Gmail:
- Help: https://support.google.com/mail
- App Passwords: https://support.google.com/accounts/answer/185833
- Status: https://www.google.com/appsstatus

### SendGrid:
- Docs: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
- Status: https://status.sendgrid.com/

### General SMTP:
- RFC 5321: https://tools.ietf.org/html/rfc5321
- Email Testing: https://www.mail-tester.com/

---

## ✅ Quick Setup Summary

**For Testing (Gmail)**:
1. Enable 2-Step Verification
2. Generate App Password
3. Add to backend/.env:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=noreply@finedge360.com
   ```
4. Restart backend
5. Test with create-subscription API

**For Production (SendGrid)**:
1. Create SendGrid account
2. Generate API key
3. Add to backend/.env:
   ```
   SMTP_SERVER=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USERNAME=apikey
   SMTP_PASSWORD=SG.your-api-key
   FROM_EMAIL=noreply@finedge360.com
   ```
4. Verify sender email
5. Restart backend
6. Test delivery

**Time**: 10 minutes
**Difficulty**: Easy
**Cost**: Free (Gmail/SendGrid free tier)

---

**Last Updated**: 2025-11-25
**Status**: Ready to configure
**Next Step**: Choose Gmail or SendGrid and follow steps above

---

*Complete SMTP Email Setup Guide for FinEdge360*
