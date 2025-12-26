"""
Email Service for FIREMap
Handles all email communications including access codes, receipts, and notifications
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from datetime import datetime

# SMTP Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@finedge360.com")
ADMIN_EMAIL = "seyonshomefashion@gmail.com"

print(f"[Email Service] Initialized")
print(f"  SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
print(f"  SMTP Configured: {'YES' if SMTP_USERNAME and SMTP_PASSWORD else 'NO'}")

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send an email using configured SMTP server

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email

    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print(f"[Email Service] SMTP not configured - would send email to {to_email}")
            print(f"[Email Service] Subject: {subject}")
            print(f"[Email Service] Content preview: {html_content[:200]}...")
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

        print(f"[Email Service] Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"[Email Service] Error sending email: {str(e)}")
        return False


def send_access_code_email(
    to_email: str,
    user_name: str,
    access_code: str,
    plan_name: str,
    is_lifetime: bool = False
) -> bool:
    """
    Send access code email after successful subscription purchase

    Args:
        to_email: User's email address
        user_name: User's name
        access_code: Generated access code (e.g., FE-ABC123)
        plan_name: Subscription plan name (Premium/Expert Plus)
        is_lifetime: Whether it's a lifetime subscription

    Returns:
        bool: True if sent successfully
    """

    subject = f"🎉 Your FIREMap {plan_name.title()} Access Code"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f9fc;
        }}
        .email-container {{
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #2563eb;
            margin: 0;
            font-size: 28px;
        }}
        .access-code-box {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }}
        .access-code {{
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }}
        .access-code-label {{
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
        }}
        .instructions {{
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .instructions h3 {{
            margin-top: 0;
            color: #1e40af;
        }}
        .instructions ol {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .instructions li {{
            margin: 8px 0;
        }}
        .features {{
            margin: 30px 0;
        }}
        .feature-item {{
            display: flex;
            align-items: start;
            margin: 12px 0;
        }}
        .feature-icon {{
            color: #10b981;
            margin-right: 10px;
            font-size: 20px;
        }}
        .badge {{
            display: inline-block;
            background: #fbbf24;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }}
        .cta-button {{
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }}
        .cta-button:hover {{
            background: #1d4ed8;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎉 Welcome to FIREMap {plan_name.title()}!</h1>
            <p>Thank you for subscribing, {user_name}!</p>
            {"<span class='badge'>LIFETIME ACCESS</span>" if is_lifetime else ""}
        </div>

        <div class="access-code-box">
            <div class="access-code-label">Your Access Code:</div>
            <div class="access-code">{access_code}</div>
            <p style="margin: 10px 0; font-size: 14px; opacity: 0.9;">
                Save this code - you'll need it to unlock premium features
            </p>
        </div>

        <div class="instructions">
            <h3>📝 How to Use Your Access Code:</h3>
            <ol>
                <li>Log in to your FIREMap account</li>
                <li>Navigate to <strong>SIP Planner</strong> or <strong>Portfolio Analyzer</strong></li>
                <li>Enter your access code when prompted</li>
                <li>Start exploring your premium features!</li>
            </ol>
        </div>

        <div class="features">
            <h3>✨ What You've Unlocked:</h3>
            <div class="feature-item">
                <span class="feature-icon">✅</span>
                <div><strong>Advanced SIP Planning</strong><br>Goal-based investment planning with inflation-adjusted calculations</div>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✅</span>
                <div><strong>AI-Powered Portfolio Analysis</strong><br>Risk assessment and personalized asset allocation recommendations</div>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✅</span>
                <div><strong>3D FIRE Map Journey</strong><br>Visualize your path to financial independence</div>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✅</span>
                <div><strong>Expert Consultation</strong><br>45-minute session with SEBI registered advisor</div>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✅</span>
                <div><strong>Export Reports</strong><br>Download your financial plans as PDF</div>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✅</span>
                <div><strong>Priority Support</strong><br>Get help when you need it</div>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="http://localhost:5173/dashboard" class="cta-button">
                Go to Dashboard →
            </a>
        </div>

        <div class="footer">
            <p><strong>Need help?</strong></p>
            <p>Contact us at <a href="mailto:support@finedge360.com">support@finedge360.com</a></p>
            <p>WhatsApp: <a href="https://wa.me/yourwhatsapplink">Chat with Expert</a></p>
            <p style="margin-top: 20px; font-size: 12px;">
                FIREMap | Your Path to Financial Freedom<br>
                © {datetime.now().year} All rights reserved
            </p>
        </div>
    </div>
</body>
</html>
"""

    return send_email(to_email, subject, html_content)


def send_payment_receipt_email(
    to_email: str,
    user_name: str,
    plan_name: str,
    amount: float,
    payment_id: str,
    billing_cycle: str
) -> bool:
    """
    Send payment receipt email after successful payment

    Args:
        to_email: User's email
        user_name: User's name
        plan_name: Subscription plan
        amount: Payment amount
        payment_id: Payment transaction ID
        billing_cycle: monthly/yearly/lifetime
    """

    subject = f"Payment Receipt - FIREMap {plan_name.title()} Subscription"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .receipt {{
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 30px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .receipt-details {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .detail-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }}
        .detail-label {{
            font-weight: 600;
        }}
        .total-row {{
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Thank you for your payment, {user_name}!</p>
        </div>

        <div class="receipt-details">
            <div class="detail-row">
                <span class="detail-label">Plan:</span>
                <span>{plan_name.title()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Billing Cycle:</span>
                <span>{billing_cycle.title()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span>{payment_id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>{datetime.now().strftime("%B %d, %Y")}</span>
            </div>
            <div class="detail-row total-row">
                <span class="detail-label">Amount Paid:</span>
                <span>₹{amount:,.2f}</span>
            </div>
        </div>

        <p style="margin-top: 30px; text-align: center; color: #6b7280;">
            A separate email with your access code has been sent to activate your subscription.
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            Questions? Contact us at support@finedge360.com
        </p>
    </div>
</body>
</html>
"""

    return send_email(to_email, subject, html_content)


def send_subscription_expiry_reminder(
    to_email: str,
    user_name: str,
    plan_name: str,
    days_remaining: int
) -> bool:
    """Send reminder email when subscription is about to expire"""

    subject = f"⏰ Your FIREMap Subscription Expires in {days_remaining} Days"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .alert-box {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 4px;
        }}
        .cta-button {{
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class="alert-box">
        <h2>Hi {user_name},</h2>
        <p>Your <strong>{plan_name.title()}</strong> subscription will expire in <strong>{days_remaining} days</strong>.</p>
        <p>Don't lose access to your premium features!</p>
        <a href="http://localhost:5173/pricing" class="cta-button">Renew Now →</a>
    </div>
</body>
</html>
"""

    return send_email(to_email, subject, html_content)
