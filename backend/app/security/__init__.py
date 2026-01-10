"""
Security utilities for user ownership verification and audit logging
"""

import logging
from fastapi import HTTPException
from databutton_app.mw.auth_mw import User
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


def is_admin_user(user: User) -> bool:
    """
    Check if the authenticated user is an admin.
    Admins can access any user's data (for support purposes).

    Args:
        user: Authenticated user from JWT token

    Returns:
        bool: True if user is admin, False otherwise
    """
    if not user.email:
        return False

    admin_emails = [
        "dineshshaja1645@gmail.com",
        # Add more admin emails here
    ]

    return user.email.lower() in admin_emails


def verify_user_ownership(authenticated_user: User, requested_user_id: str) -> None:
    """
    Verify that the authenticated user is accessing their own data.
    Raises HTTPException if user tries to access someone else's data.

    Args:
        authenticated_user: User from JWT token
        requested_user_id: User ID being requested

    Raises:
        HTTPException: 403 Forbidden if user tries to access other user's data
    """
    auth_user_id = authenticated_user.sub

    if auth_user_id != requested_user_id:
        logger.warning(
            f"[SECURITY] VIOLATION: User {auth_user_id} attempted to access data for user {requested_user_id}"
        )
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only access your own data."
        )

    logger.info(f"[SECURITY] User ownership verified: {auth_user_id}")


def verify_user_or_admin(authenticated_user: User, requested_user_id: str) -> None:
    """
    Verify that user is accessing their own data OR is an admin.
    Admins can access any user's data for support purposes.

    Args:
        authenticated_user: User from JWT token
        requested_user_id: User ID being requested

    Raises:
        HTTPException: 403 Forbidden if non-admin user tries to access other user's data
    """
    # Check if user is admin
    if is_admin_user(authenticated_user):
        logger.info(f"[SECURITY] Admin access granted: {authenticated_user.email}")
        return

    # Not admin - verify ownership
    verify_user_ownership(authenticated_user, requested_user_id)


def sanitize_user_id(user_id: str) -> str:
    """
    Validate and sanitize user ID to prevent injection attacks.
    User IDs should be valid UUIDs (36 characters, alphanumeric + hyphens).

    Args:
        user_id: User ID to validate

    Returns:
        str: Validated user ID

    Raises:
        HTTPException: 400 Bad Request if user ID is invalid
    """
    if not user_id or len(user_id) != 36:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format. Expected UUID."
        )

    # UUID format: 8-4-4-4-12 hexadecimal characters with hyphens
    allowed_chars = set("abcdefghijklmnopqrstuvwxyz0123456789-")
    if not all(c.lower() in allowed_chars for c in user_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID characters. Expected UUID format."
        )

    return user_id


def validate_email(email: str) -> str:
    """
    Validate and sanitize email address.

    Args:
        email: Email address to validate

    Returns:
        str: Validated email address

    Raises:
        HTTPException: 400 Bad Request if email is invalid
    """
    if not email or "@" not in email or len(email) > 254:
        raise HTTPException(
            status_code=400,
            detail="Invalid email address format"
        )

    return email.lower().strip()


def log_data_access(
    user_id: str,
    action: str,
    resource: str,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log data access for audit trail and compliance.
    Records READ, UPDATE, DELETE operations on sensitive data.

    Args:
        user_id: ID of user performing the action
        action: Type of action (READ, UPDATE, DELETE, CREATE)
        resource: Resource being accessed (e.g., "financial_data", "portfolio")
        details: Optional additional details about the operation
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "action": action,
        "resource": resource,
        "details": details or {}
    }

    logger.info(f"📊 [AUDIT LOG] {log_entry}")

    # TODO: Store audit logs in database for compliance
    # For now, logs go to stdout (captured by Railway/Databutton logs)
