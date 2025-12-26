"""
Data retention policy implementation.
Checks for inactive users (18+ months) and sends admin notifications.
Does NOT auto-delete users - requires manual admin decision.
"""

import os
from datetime import datetime, timedelta
from typing import List, Dict
from supabase import create_client
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

# Retention policy: 18 months of inactivity
RETENTION_MONTHS = 18


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send an email notification."""
    try:
        # Skip if email is not configured
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("Email not configured. Email notification skipped.")
            print(f"Would have sent email to {to_email}:")
            print(f"Subject: {subject}")
            print(f"Body:\n{body}")
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


def get_inactive_users(months: int = RETENTION_MONTHS) -> List[Dict]:
    """
    Get list of users who have been inactive for specified number of months.

    Args:
        months: Number of months of inactivity to check for

    Returns:
        List of inactive user records
    """
    try:
        if not supabase:
            print("Supabase client not initialized")
            return []

        # Calculate cutoff date
        cutoff_date = (datetime.utcnow() - timedelta(days=months * 30)).isoformat()

        # Query users with last_activity older than cutoff
        response = supabase.from_("users")\
            .select("id, email, created_at, last_activity")\
            .lt("last_activity", cutoff_date)\
            .execute()

        inactive_users = response.data if response.data else []

        print(f"Found {len(inactive_users)} inactive users (>{months} months)")
        return inactive_users

    except Exception as e:
        print(f"Error getting inactive users: {str(e)}")
        return []


def calculate_days_inactive(last_activity: str) -> int:
    """Calculate number of days since last activity."""
    try:
        last_activity_date = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
        days = (datetime.utcnow().replace(tzinfo=last_activity_date.tzinfo) - last_activity_date).days
        return days
    except Exception as e:
        print(f"Error calculating days inactive: {str(e)}")
        return 0


def send_admin_notification(inactive_users: List[Dict]) -> bool:
    """
    Send email notification to admin about inactive users.

    Args:
        inactive_users: List of inactive user records

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        if not inactive_users:
            print("No inactive users to report")
            return True

        subject = f"FIREMap Inactive Users Alert - {len(inactive_users)} users require review"

        # Build email body
        body = f"""Admin,

This is an automated notification from the FIREMap Data Retention System.

The following {len(inactive_users)} user(s) have been inactive for {RETENTION_MONTHS} months or more:

"""

        for user in inactive_users:
            user_id = user.get('id', 'Unknown')
            user_email = user.get('email', 'Unknown')
            last_activity = user.get('last_activity', user.get('created_at', 'Unknown'))
            days_inactive = calculate_days_inactive(last_activity) if last_activity != 'Unknown' else 0

            body += f"""
User ID: {user_id}
Email: {user_email}
Last Activity: {last_activity}
Days Inactive: {days_inactive}
---
"""

        body += f"""

IMPORTANT: No automatic deletion will occur. Please review each user and decide whether to:
1. Contact the user to reactivate their account
2. Archive the user's data locally for backup
3. Delete the account manually through the admin interface

Data Retention Policy: {RETENTION_MONTHS} months of inactivity

This notification is sent daily. To adjust the retention period or notification frequency,
update the configuration in backend/app/tasks/data_retention.py.

Best regards,
FIREMap Data Retention System
"""

        return send_email(ADMIN_EMAIL, subject, body)

    except Exception as e:
        print(f"Error sending admin notification: {str(e)}")
        return False


def check_inactive_users() -> Dict[str, any]:
    """
    Main function to check for inactive users and send notifications.
    This should be called by a scheduler (e.g., daily cron job).

    Returns:
        Dictionary with results of the check
    """
    try:
        print(f"Running data retention check (cutoff: {RETENTION_MONTHS} months)")

        # Get inactive users
        inactive_users = get_inactive_users(RETENTION_MONTHS)

        if not inactive_users:
            print("No inactive users found")
            return {
                "success": True,
                "inactive_count": 0,
                "message": "No inactive users found"
            }

        # Send notification to admin
        email_sent = send_admin_notification(inactive_users)

        return {
            "success": True,
            "inactive_count": len(inactive_users),
            "email_sent": email_sent,
            "message": f"Found {len(inactive_users)} inactive users. Admin notification {'sent' if email_sent else 'failed'}."
        }

    except Exception as e:
        print(f"Error in check_inactive_users: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Error checking inactive users"
        }


def run_retention_check_now():
    """
    Utility function to manually trigger the retention check.
    Useful for testing or manual runs.
    """
    print("=" * 60)
    print("MANUAL DATA RETENTION CHECK")
    print("=" * 60)

    result = check_inactive_users()

    print("\nResults:")
    print(f"Success: {result.get('success')}")
    print(f"Inactive Users: {result.get('inactive_count', 0)}")
    print(f"Email Sent: {result.get('email_sent', False)}")
    print(f"Message: {result.get('message')}")

    if 'error' in result:
        print(f"Error: {result['error']}")

    print("=" * 60)

    return result


# For testing purposes
if __name__ == "__main__":
    run_retention_check_now()
