import os
import pathlib
import json
import dotenv
import logging
# Consultation API added
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

dotenv.load_dotenv()

from databutton_app.mw.auth_mw import AuthConfig, get_authorized_user
from app.security.middleware import SecurityHeadersMiddleware, RateLimitMiddleware, RequestLoggingMiddleware


class CustomCORSMiddleware(BaseHTTPMiddleware):
    """Custom CORS middleware that manually adds headers to all responses."""

    # Allowed origins for production and development
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://localhost:5181",
        "http://localhost:5182",
        "http://localhost:5183",
        "http://localhost:5184",
        "http://localhost:5185",
        "https://finedge360-claudecode.vercel.app",  # Vercel production
        "https://finedge360databuttonclaudecode-production.up.railway.app",  # Railway backend
        "https://www.finedge360.com",  # Custom domain with www
        "https://finedge360.com",  # Custom domain without www
    ]

    async def dispatch(self, request: Request, call_next):
        logger.info(f"[CORS Middleware] {request.method} {request.url.path}")

        # Get the origin from the request
        origin = request.headers.get("origin", "*")

        # Check if origin is in allowed list or allow all for development
        allowed_origin = origin if origin in self.ALLOWED_ORIGINS or origin.endswith(".vercel.app") else "*"

        # Handle OPTIONS preflight requests immediately
        if request.method == "OPTIONS":
            logger.info(f"[CORS Middleware] Handling OPTIONS preflight for {request.url.path}")
            cors_methods = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            logger.info(f"[CORS Middleware] Sending methods: {cors_methods}")
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": allowed_origin,
                    "Access-Control-Allow-Methods": cors_methods,
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "600",
                },
                content=""
            )

        # Process the request normally
        response = await call_next(request)

        # Add CORS headers to all responses
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"

        return response


def get_router_config() -> dict:
    try:
        # Note: This file is not available to the agent
        cfg = json.loads(open("routers.json").read())
        print(f"Loaded routers.json successfully")
        return cfg
    except Exception as e:
        print(f"Failed to load routers.json: {e}. Using default config (auth disabled for local dev)")
        # Return default config for local development
        return {"routers": {}}


def is_auth_disabled(router_config: dict, name: str) -> bool:
    # If router not in config, disable auth by default for local dev
    if not router_config.get("routers"):
        return True
    if name not in router_config["routers"]:
        return True
    return router_config["routers"][name]["disableAuth"]


def import_api_routers() -> APIRouter:
    """Create top level router including all user defined endpoints."""
    routes = APIRouter()  # No prefix - routes will use their own prefixes

    router_config = get_router_config()

    src_path = pathlib.Path(__file__).parent

    # Import API routers from "src/app/apis/*/__init__.py"
    apis_path = src_path / "app" / "apis"

    api_names = [
        p.relative_to(apis_path).parent.as_posix()
        for p in apis_path.glob("*/__init__.py")
    ]

    api_module_prefix = "app.apis."

    for name in api_names:
        print(f"Importing API: {name}")
        try:
            api_module = __import__(api_module_prefix + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            print(f"  - Router found: {api_router is not None}")
            print(f"  - Is APIRouter: {isinstance(api_router, APIRouter)}")
            if isinstance(api_router, APIRouter):
                auth_disabled = is_auth_disabled(router_config, name)
                print(f"  - Auth disabled: {auth_disabled}")
                print(f"  - Router has {len(api_router.routes)} routes before inclusion")
                routes.include_router(
                    api_router,
                    dependencies=(
                        []
                        if auth_disabled
                        else [Depends(get_authorized_user)]
                    ),
                )
                print(f"  - [OK] Router included successfully")
                print(f"  - Main routes now has {len(routes.routes)} total routes")
        except Exception as e:
            print(f"  - [ERROR] {e}")
            import traceback
            traceback.print_exc()
            continue

    print(routes.routes)

    return routes


def get_firebase_config() -> dict | None:
    extensions = os.environ.get("DATABUTTON_EXTENSIONS", "[]")
    extensions = json.loads(extensions)

    for ext in extensions:
        if ext["name"] == "firebase-auth":
            return ext["config"]["firebaseConfig"]

    return None


def create_app() -> FastAPI:
    """Create the app. This is called by uvicorn with the factory option to construct the app object."""
    app = FastAPI()

    # Add security middlewares (ORDER MATTERS - applied in reverse order)
    # 1. Request logging (first to log everything)
    app.add_middleware(RequestLoggingMiddleware)

    # 2. Rate limiting (second to block excessive requests early)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=100, requests_per_hour=1000)

    # 3. Security headers (third to add security headers to all responses)
    app.add_middleware(SecurityHeadersMiddleware)

    # 4. Custom CORS middleware (last to handle CORS properly)
    app.add_middleware(CustomCORSMiddleware)

    app.include_router(import_api_routers())

    # Test endpoint to verify CORS is working
    @app.get("/test-cors")
    async def test_cors():
        return {"message": "CORS is working"}

    for route in app.routes:
        if hasattr(route, "methods"):
            for method in route.methods:
                print(f"{method} {route.path}")

    # Try Firebase config first (for Databutton environment)
    firebase_config = get_firebase_config()

    if firebase_config is not None:
        print("[AUTH] Firebase auth configured")
        auth_config = {
            "jwks_url": "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
            "audience": firebase_config["projectId"],
            "header": "authorization",
        }
        app.state.auth_config = AuthConfig(**auth_config)
    else:
        # Use Supabase config for Railway deployment
        print("Firebase config not found, using Supabase auth config")
        supabase_url = os.getenv("SUPABASE_URL")
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

        if supabase_url and jwt_secret:
            print("[AUTH] Supabase auth configured with JWT_SECRET")
            print(f"[AUTH] Supabase URL: {supabase_url}")
            print(f"[AUTH] JWT_SECRET configured: [OK] YES")

            # NOTE: jwks_url not used when JWT_SECRET is available
            # but required by AuthConfig model
            auth_config = {
                "jwks_url": f"{supabase_url}/auth/v1/jwks",  # Not used with JWT_SECRET
                "audience": "authenticated",
                "header": "authorization",
            }

            print(f"Supabase auth configured for project")
            app.state.auth_config = AuthConfig(**auth_config)
        else:
            print("[ERROR] WARNING: No auth config found!")
            print(f"   SUPABASE_URL: {'[OK]' if supabase_url else '[MISSING]'}")
            print(f"   SUPABASE_JWT_SECRET: {'[OK]' if jwt_secret else '[MISSING]'}")
            app.state.auth_config = None

    return app


app = create_app()


# =======================
# APSCHEDULER INTEGRATION (Temporarily disabled - will enable after testing)
# =======================

# TODO: Enable scheduler after testing portfolio upload feature
# from app.tasks.daily_nav_updater import scheduler
#
# @app.on_event("startup")
# async def startup_event():
#     """Start APScheduler on application startup"""
#     try:
#         print("\n" + "="*60)
#         print("[Startup] Initializing APScheduler...")
#         scheduler.start()
#         print("[Startup] ✅ APScheduler started successfully!")
#         print("[Startup] Daily NAV update job scheduled for 7:00 PM IST")
#         print("="*60 + "\n")
#     except Exception as e:
#         print(f"[Startup] ❌ Error starting scheduler: {str(e)}")
#
#
# @app.on_event("shutdown")
# async def shutdown_event():
#     """Shutdown APScheduler gracefully"""
#     try:
#         print("\n[Shutdown] Stopping APScheduler...")
#         scheduler.shutdown()
#         print("[Shutdown] ✅ APScheduler stopped successfully!")
#     except Exception as e:
#         print(f"[Shutdown] ❌ Error stopping scheduler: {str(e)}")


# Trigger Railway deployment - v2
