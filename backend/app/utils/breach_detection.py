"""
Data breach detection and notification mechanism.
Detects suspicious activity patterns and sends email notifications.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from fastapi import Request
from supabase import create_client

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Email configuration
ADMIN_EMAIL = "seyonshomefashion@gmail.com"
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send an email notification.

    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body (plain text)

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Skip if email is not configured
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("Email not configured. Email notification skipped.")
            print(f"Would have sent email to {to_email}:")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            return False

        # Create message
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        # Connect to SMTP server and send
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(FROM_EMAIL, to_email, text)
        server.quit()

        print(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


def get_recent_audit_logs(user_id: str, minutes: int = 10) -> List[Dict]:
    """
    Get recent audit logs for a user.

    Args:
        user_id: UUID of the user
        minutes: Number of minutes to look back

    Returns:
        List of audit log records
    """
    try:
        if not supabase:
            return []

        cutoff_time = (datetime.utcnow() - timedelta(minutes=minutes)).isoformat()

        response = supabase.from_("audit_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("timestamp", cutoff_time)\
            .execute()

        return response.data if response.data else []

    except Exception as e:
        print(f"Error retrieving recent audit logs: {str(e)}")
        return []


def detect_suspicious_activity(user_id: str, request: Request, current_action: str) -> Optional[str]:
    """
    Detect suspicious activity patterns for a user.

    Checks for:
    1. Multiple failed login attempts (>5 in 10 minutes)
    2. Unusual access patterns (accessing from different IPs within short time)
    3. Bulk data exports (>3 exports in 1 hour)

    Args:
        user_id: UUID of the user
        request: FastAPI request object
        current_action: The action being performed

    Returns:
        Description of suspicious activity if detected, None otherwise
    """
    try:
        current_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
        if ',' in current_ip:
            current_ip = current_ip.split(',')[0].strip()

        # Check 1: Failed login attempts (last 10 minutes)
        recent_logs_10min = get_recent_audit_logs(user_id, minutes=10)
        failed_logins = [log for log in recent_logs_10min if log.get('action') == 'account_login' and log.get('metadata', {}).get('failed')]

        if len(failed_logins) > 5:
            return f"Multiple failed login attempts detected: {len(failed_logins)} attempts in last 10 minutes"

        # Check 2: Different IPs in short time (last 10 minutes)
        unique_ips = set()
        for log in recent_logs_10min:
            if log.get('ip_address'):
                unique_ips.add(log['ip_address'])

        if len(unique_ips) > 3:
            return f"Unusual access pattern detected: Activity from {len(unique_ips)} different IP addresses in last 10 minutes"

        # Check 3: Bulk data exports (last 60 minutes)
        recent_logs_60min = get_recent_audit_logs(user_id, minutes=60)
        data_exports = [log for log in recent_logs_60min if log.get('action') == 'export_data']

        if len(data_exports) > 3:
            return f"Bulk data export detected: {len(data_exports)} exports in last hour"

        return None

    except Exception as e:
        print(f"Error detecting suspicious activity: {str(e)}")
        return None


def send_breach_notification(user_email: str, user_id: str, breach_type: str, details: str) -> bool:
    """
    Send breach notification to user and admin.

    Args:
        user_email: User's email address
        user_id: UUID of the user
        breach_type: Type of suspicious activity
        details: Detailed description of the activity

    Returns:
        True if notifications sent successfully, False otherwise
    """
    try:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Email to user
        user_subject = "Security Alert - FinEdge360 Account Activity"
        user_body = f"""Dear User,

We detected unusual activity on your FinEdge360 account:
- Activity Type: {breach_type}
- Time: {timestamp}
- Details: {details}

If this was you, no action is needed. If you don't recognize this activity, please:
1. Change your password immediately
2. Review your account activity
3. Contact us at support@finedge360.com

Best regards,
FinEdge360 Security Team
"""

        # Email to admin
        admin_subject = "Security Alert - FinEdge360 Suspicious Activity"
        admin_body = f"""Admin Alert,

Suspicious activity detected on FinEdge360:
- User ID: {user_id}
- User Email: {user_email}
- Activity Type: {breach_type}
- Time: {timestamp}
- Details: {details}

Please review this activity and take appropriate action if necessary.

FinEdge360 Security System
"""

        # Send to user
        user_sent = send_email(user_email, user_subject, user_body)

        # Send to admin
        admin_sent = send_email(ADMIN_EMAIL, admin_subject, admin_body)

        return user_sent or admin_sent

    except Exception as e:
        print(f"Error sending breach notification: {str(e)}")
        return False


def check_and_notify_breach(user_id: str, user_email: str, request: Request, current_action: str) -> None:
    """
    Check for suspicious activity and send notifications if detected.

    This should be called after each audit log is created.

    Args:
        user_id: UUID of the user
        user_email: User's email address
        request: FastAPI request object
        current_action: The action being performed
    """
    try:
        suspicious_activity = detect_suspicious_activity(user_id, request, current_action)

        if suspicious_activity:
            print(f"Suspicious activity detected for user {user_id}: {suspicious_activity}")
            send_breach_notification(user_email, user_id, current_action, suspicious_activity)
        else:
            print(f"No suspicious activity detected for user {user_id}")

    except Exception as e:
        print(f"Error in breach check and notify: {str(e)}")


def log_suspicious_activity(user_id: str, activity_type: str, details: Dict) -> bool:
    """
    Log suspicious activity to a dedicated table (optional enhancement).

    Args:
        user_id: UUID of the user
        activity_type: Type of suspicious activity
        details: Details about the activity

    Returns:
        True if logged successfully, False otherwise
    """
    try:
        if not supabase:
            return False

        suspicious_data = {
            "user_id": user_id,
            "activity_type": activity_type,
            "details": details,
            "detected_at": datetime.utcnow().isoformat(),
            "resolved": False
        }

        # Note: This assumes a 'suspicious_activities' table exists
        # You may need to create this table if you want to track suspicious activities separately
        try:
            response = supabase.from_("suspicious_activities").insert(suspicious_data).execute()
            return bool(response.data)
        except Exception:
            # Table might not exist, that's okay
            print("Suspicious activities table not found (optional feature)")
            return False

    except Exception as e:
        print(f"Error logging suspicious activity: {str(e)}")
        return False
