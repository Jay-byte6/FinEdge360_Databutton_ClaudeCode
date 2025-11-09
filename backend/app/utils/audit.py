"""
Audit logging utility for tracking all data access and modifications.
Logs user actions with IP address, user agent, and metadata.
"""

import os
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import Request
from supabase import create_client
import json

# Set up Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Valid actions for audit logging
VALID_ACTIONS = [
    'data_read',
    'data_write',
    'data_update',
    'data_delete',
    'account_login',
    'account_logout',
    'consent_given',
    'consent_withdrawn',
    'password_reset',
    'export_data'
]


def extract_ip_address(request: Request) -> str:
    """
    Extract IP address from request headers.
    Checks X-Forwarded-For first (for proxied requests), then falls back to client.host

    Args:
        request: FastAPI request object

    Returns:
        IP address as string
    """
    # Check X-Forwarded-For header (common in proxied/load-balanced setups)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded_for.split(',')[0].strip()

    # Check X-Real-IP header (another common proxy header)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fall back to client host
    if request.client:
        return request.client.host

    return "unknown"


def extract_user_agent(request: Request) -> str:
    """
    Extract user agent from request headers.

    Args:
        request: FastAPI request object

    Returns:
        User agent string or 'unknown'
    """
    return request.headers.get("User-Agent", "unknown")


def log_audit(
    user_id: Optional[str],
    action: str,
    request: Request,
    table_name: Optional[str] = None,
    record_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Log an audit event to the database.

    Args:
        user_id: UUID of the user performing the action (can be None for anonymous actions)
        action: Type of action being performed (must be in VALID_ACTIONS)
        request: FastAPI request object
        table_name: Name of the table being accessed (optional)
        record_id: ID of the record being accessed (optional)
        metadata: Additional metadata to store with the audit log (optional)

    Returns:
        True if logging succeeded, False otherwise
    """
    try:
        # Validate action
        if action not in VALID_ACTIONS:
            print(f"Invalid audit action: {action}. Must be one of {VALID_ACTIONS}")
            return False

        if not supabase:
            print("Supabase client not initialized, cannot log audit event")
            return False

        # Extract request information
        ip_address = extract_ip_address(request)
        user_agent = extract_user_agent(request)
        request_method = request.method
        request_path = str(request.url.path)

        # Prepare audit log data
        audit_data = {
            "user_id": user_id,
            "action": action,
            "table_name": table_name,
            "record_id": record_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "request_method": request_method,
            "request_path": request_path,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": json.dumps(metadata) if metadata else None
        }

        # Insert into audit_logs table
        response = supabase.from_("audit_logs").insert(audit_data).execute()

        if response.data:
            print(f"Audit log created: {action} by user {user_id or 'anonymous'} from {ip_address}")
            return True
        else:
            print(f"Failed to create audit log: {action}")
            return False

    except Exception as e:
        print(f"Error logging audit event: {str(e)}")
        # Don't fail the main operation if audit logging fails
        return False


def log_data_read(user_id: str, request: Request, table_name: str, record_id: Optional[str] = None):
    """Log a data read operation"""
    return log_audit(user_id, 'data_read', request, table_name, record_id)


def log_data_write(user_id: str, request: Request, table_name: str, record_id: Optional[str] = None, metadata: Optional[Dict] = None):
    """Log a data write (insert) operation"""
    return log_audit(user_id, 'data_write', request, table_name, record_id, metadata)


def log_data_update(user_id: str, request: Request, table_name: str, record_id: Optional[str] = None, metadata: Optional[Dict] = None):
    """Log a data update operation"""
    return log_audit(user_id, 'data_update', request, table_name, record_id, metadata)


def log_data_delete(user_id: str, request: Request, table_name: str, record_id: Optional[str] = None):
    """Log a data delete operation"""
    return log_audit(user_id, 'data_delete', request, table_name, record_id)


def log_account_login(user_id: str, request: Request, metadata: Optional[Dict] = None):
    """Log a user login"""
    return log_audit(user_id, 'account_login', request, metadata=metadata)


def log_account_logout(user_id: str, request: Request):
    """Log a user logout"""
    return log_audit(user_id, 'account_logout', request)


def log_consent_given(user_id: str, request: Request, metadata: Optional[Dict] = None):
    """Log consent being given"""
    return log_audit(user_id, 'consent_given', request, metadata=metadata)


def log_consent_withdrawn(user_id: str, request: Request, metadata: Optional[Dict] = None):
    """Log consent being withdrawn"""
    return log_audit(user_id, 'consent_withdrawn', request, metadata=metadata)


def log_password_reset(user_id: str, request: Request):
    """Log a password reset"""
    return log_audit(user_id, 'password_reset', request)


def log_export_data(user_id: str, request: Request, metadata: Optional[Dict] = None):
    """Log data export (e.g., PDF download)"""
    return log_audit(user_id, 'export_data', request, metadata=metadata)


def get_user_audit_logs(user_id: str, limit: int = 100) -> list:
    """
    Retrieve audit logs for a specific user.

    Args:
        user_id: UUID of the user
        limit: Maximum number of logs to retrieve

    Returns:
        List of audit log records
    """
    try:
        if not supabase:
            print("Supabase client not initialized")
            return []

        response = supabase.from_("audit_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()

        return response.data if response.data else []

    except Exception as e:
        print(f"Error retrieving audit logs: {str(e)}")
        return []


def get_all_audit_logs(limit: int = 1000) -> list:
    """
    Retrieve all audit logs (admin function).

    Args:
        limit: Maximum number of logs to retrieve

    Returns:
        List of audit log records
    """
    try:
        if not supabase:
            print("Supabase client not initialized")
            return []

        response = supabase.from_("audit_logs")\
            .select("*")\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()

        return response.data if response.data else []

    except Exception as e:
        print(f"Error retrieving all audit logs: {str(e)}")
        return []
