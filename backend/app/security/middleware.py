"""
Security middleware for FastAPI application
Provides security headers, rate limiting, and request logging
"""

import logging
import time
from collections import defaultdict
from datetime import datetime, timedelta
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to all HTTP responses.
    Protects against XSS, clickjacking, MIME sniffing, and other attacks.
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS filtering
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://gzkuoojfoaovnzoczibc.supabase.co"
        )

        # Force HTTPS in production
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

        # Don't send referrer to external sites
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions policy
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to prevent abuse and DDoS attacks.
    Limits requests per minute and per hour per IP address.
    """

    def __init__(
        self,
        app,
        requests_per_minute: int = 100,
        requests_per_hour: int = 1000
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour

        # Store request timestamps per IP
        self.minute_requests = defaultdict(list)
        self.hour_requests = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request headers"""
        # Check for proxy headers first
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to direct connection
        if request.client:
            return request.client.host

        return "unknown"

    def _clean_old_requests(self, requests_dict: dict, cutoff_time: datetime):
        """Remove requests older than cutoff time"""
        for ip in list(requests_dict.keys()):
            requests_dict[ip] = [
                t for t in requests_dict[ip] if t > cutoff_time
            ]
            if not requests_dict[ip]:
                del requests_dict[ip]

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)

        # FIX: Exempt localhost from rate limiting for development
        if client_ip in ("127.0.0.1", "localhost", "::1"):
            return await call_next(request)

        now = datetime.utcnow()

        # Clean old requests
        minute_ago = now - timedelta(minutes=1)
        hour_ago = now - timedelta(hours=1)
        self._clean_old_requests(self.minute_requests, minute_ago)
        self._clean_old_requests(self.hour_requests, hour_ago)

        # Count requests in current window
        minute_count = len(self.minute_requests[client_ip])
        hour_count = len(self.hour_requests[client_ip])

        # Check rate limits
        if minute_count >= self.requests_per_minute:
            logger.warning(
                f"🚫 Rate limit exceeded (per minute): {client_ip} - "
                f"{minute_count} requests in last minute"
            )
            return Response(
                content=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute.",
                status_code=429,
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int((minute_ago + timedelta(minutes=1)).timestamp()))
                }
            )

        if hour_count >= self.requests_per_hour:
            logger.warning(
                f"🚫 Rate limit exceeded (per hour): {client_ip} - "
                f"{hour_count} requests in last hour"
            )
            return Response(
                content=f"Rate limit exceeded. Maximum {self.requests_per_hour} requests per hour.",
                status_code=429,
                headers={
                    "Retry-After": "3600",
                    "X-RateLimit-Limit": str(self.requests_per_hour),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int((hour_ago + timedelta(hours=1)).timestamp()))
                }
            )

        # Record this request
        self.minute_requests[client_ip].append(now)
        self.hour_requests[client_ip].append(now)

        # Process request
        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.requests_per_minute - minute_count - 1)
        )

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs all incoming requests for debugging and security monitoring.
    Includes method, path, IP address, status code, and duration.
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"

        # Log request
        logger.info(
            f"[REQUEST] {request.method} {request.url.path} from {client_ip}"
        )

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log response
        logger.info(
            f"[RESPONSE] {request.method} {request.url.path} - "
            f"Status: {response.status_code} - Duration: {duration:.3f}s"
        )

        return response
