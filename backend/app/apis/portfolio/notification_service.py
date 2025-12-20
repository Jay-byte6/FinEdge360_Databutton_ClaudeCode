"""
Portfolio Notification Service
Handles notification creation and email alerts for 10% portfolio changes
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional
from supabase import create_client

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


async def create_notification(
    user_id: str,
    holding_id: str,
    notification_type: str,
    title: str,
    message: str,
    change_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a portfolio notification

    Args:
        user_id: User ID
        holding_id: Holding ID
        notification_type: 'GAIN_10_PERCENT' or 'LOSS_10_PERCENT'
        title: Notification title
        message: Notification message
        change_data: Dict with folio_number, scheme_name, change_percentage, old_value, new_value

    Returns:
        Created notification object
    """
    try:
        # Create notification record
        notification_data = {
            'user_id': user_id,
            'holding_id': holding_id,
            'notification_type': notification_type,
            'title': title,
            'message': message,
            'folio_number': change_data.get('folio_number'),
            'scheme_name': change_data.get('scheme_name'),
            'change_percentage': change_data.get('change_percentage'),
            'old_value': change_data.get('old_value'),
            'new_value': change_data.get('new_value'),
            'is_read': False,
            'is_email_sent': False
        }

        result = supabase.table('portfolio_notifications').insert(notification_data).execute()

        if result.data:
            notification = result.data[0]
            print(f"[Notification Service] Created notification {notification['id']} for user {user_id}")

            # Send email alert (async - don't wait)
            await send_portfolio_alert_email(user_id, notification)

            return notification
        else:
            print(f"[Notification Service] Failed to create notification for user {user_id}")
            return None

    except Exception as e:
        print(f"[Notification Service] Error creating notification: {str(e)}")
        return None


async def send_portfolio_alert_email(user_id: str, notification_data: Dict[str, Any]):
    """
    Send portfolio alert email to user

    Args:
        user_id: User ID
        notification_data: Notification dict with all details
    """
    try:
        # Get user email
        user = supabase.table('users').select('email, name').eq('id', user_id).execute()

        if not user.data or len(user.data) == 0:
            # Try auth.users table
            user = supabase.auth.admin.get_user_by_id(user_id)
            if not user:
                print(f"[Notification Service] User {user_id} not found for email")
                return

            user_email = user.email
            user_name = user.user_metadata.get('name', 'Investor')
        else:
            user_email = user.data[0].get('email')
            user_name = user.data[0].get('name', 'Investor')

        if not user_email:
            print(f"[Notification Service] No email found for user {user_id}")
            return

        # Prepare email data
        change_percentage = notification_data.get('change_percentage', 0)
        is_gain = change_percentage > 0
        change_type = "Gain" if is_gain else "Loss"
        color = "#10b981" if is_gain else "#ef4444"  # green or red
        profit_loss = notification_data.get('new_value', 0) - notification_data.get('old_value', 0)

        email_data = {
            'user_name': user_name,
            'change_type': change_type,
            'scheme_name': notification_data.get('scheme_name', 'Your fund'),
            'folio_number': notification_data.get('folio_number', 'N/A'),
            'change_percentage': abs(change_percentage),
            'increased_or_decreased': 'increased' if is_gain else 'decreased',
            'color': color,
            'old_value': notification_data.get('old_value', 0),
            'new_value': notification_data.get('new_value', 0),
            'profit_loss': abs(profit_loss),
            'profit_color': color,
            'absolute_return': abs(change_percentage)
        }

        # Render email HTML
        html_content = render_portfolio_alert_email(email_data)

        # Send email using existing email service
        from app.utils.email_service import send_email

        subject = f"🔔 Portfolio Alert: {abs(change_percentage):.1f}% {change_type} in {email_data['scheme_name'][:50]}"

        email_sent = send_email(user_email, subject, html_content)

        if email_sent:
            # Update notification as email sent
            supabase.table('portfolio_notifications').update({
                'is_email_sent': True,
                'email_sent_at': datetime.now().isoformat()
            }).eq('id', notification_data.get('id')).execute()

            print(f"[Notification Service] Email sent to {user_email}")
        else:
            print(f"[Notification Service] Failed to send email to {user_email}")

    except Exception as e:
        print(f"[Notification Service] Error sending email: {str(e)}")


def render_portfolio_alert_email(data: Dict[str, Any]) -> str:
    """
    Render portfolio alert email HTML

    Args:
        data: Email template data

    Returns:
        HTML string
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio Alert</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f5;
            }}
            .container {{
                background-color: #ffffff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            h1 {{
                color: {data['color']};
                font-size: 24px;
                margin-bottom: 20px;
                border-bottom: 3px solid {data['color']};
                padding-bottom: 10px;
            }}
            p {{
                margin: 15px 0;
                font-size: 16px;
            }}
            .details {{
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }}
            .details table {{
                width: 100%;
                border-collapse: collapse;
            }}
            .details td {{
                padding: 10px 0;
                font-size: 15px;
            }}
            .details td:first-child {{
                font-weight: 600;
                color: #64748b;
                width: 40%;
            }}
            .details td:last-child {{
                text-align: right;
                font-weight: 600;
            }}
            .cta-button {{
                display: inline-block;
                background-color: {data['color']};
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 25px;
                transition: opacity 0.2s;
            }}
            .cta-button:hover {{
                opacity: 0.9;
            }}
            .footer {{
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                color: #64748b;
                font-size: 14px;
            }}
            .footer a {{
                color: {data['color']};
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔔 Portfolio Alert: {data['change_type']}</h1>

            <p>Hi {data['user_name']},</p>

            <p>Your mutual fund <strong>{data['scheme_name']}</strong> (Folio: {data['folio_number']}) has <span style="color: {data['color']}; font-weight: 600;">{data['increased_or_decreased']} by {data['change_percentage']:.2f}%</span>.</p>

            <div class="details">
                <table>
                    <tr>
                        <td>Previous Value:</td>
                        <td>₹{data['old_value']:,.2f}</td>
                    </tr>
                    <tr>
                        <td>Current Value:</td>
                        <td>₹{data['new_value']:,.2f}</td>
                    </tr>
                    <tr>
                        <td>Profit/Loss:</td>
                        <td style="color: {data['profit_color']}">₹{data['profit_loss']:,.2f}</td>
                    </tr>
                    <tr>
                        <td>Return:</td>
                        <td style="color: {data['color']}">{data['absolute_return']:.2f}%</td>
                    </tr>
                </table>
            </div>

            <p>This notification was triggered because your portfolio value changed by more than 10%. You can view your complete portfolio and track all your investments on FinEdge360.</p>

            <a href="https://finedge360.com/portfolio" class="cta-button">View Full Portfolio →</a>

            <div class="footer">
                <p>
                    <strong>FinEdge360</strong> - Your Personal Finance Companion<br>
                    <a href="https://finedge360.com">Visit Website</a> |
                    <a href="https://finedge360.com/portfolio">Portfolio</a> |
                    <a href="https://finedge360.com/profile">Settings</a>
                </p>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
                    This is an automated notification. To manage your alert preferences, visit your profile settings.
                </p>
            </div>
        </div>
    </body>
    </html>
    """


async def get_unread_notifications(user_id: str, limit: int = 50) -> list:
    """
    Get unread notifications for a user

    Args:
        user_id: User ID
        limit: Maximum notifications to return

    Returns:
        List of unread notifications
    """
    try:
        result = supabase.table('portfolio_notifications').select('*').eq('user_id', user_id).eq('is_read', False).order('created_at', desc=True).limit(limit).execute()

        return result.data if result.data else []

    except Exception as e:
        print(f"[Notification Service] Error getting unread notifications: {str(e)}")
        return []


# Export functions
__all__ = ['create_notification', 'send_portfolio_alert_email', 'get_unread_notifications']
