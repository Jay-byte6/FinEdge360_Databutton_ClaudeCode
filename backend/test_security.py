"""
Test script to verify security configuration is loaded
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
import dotenv
dotenv.load_dotenv()

print("=" * 60)
print("SECURITY CONFIGURATION TEST")
print("=" * 60)

# Check environment variables
supabase_url = os.getenv("SUPABASE_URL")
jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

print(f"\n1. Environment Variables:")
print(f"   SUPABASE_URL: {'[OK] SET' if supabase_url else '[FAIL] MISSING'}")
print(f"   SUPABASE_JWT_SECRET: {'[OK] SET (' + jwt_secret[:20] + '...)' if jwt_secret else '[FAIL] MISSING'}")

# Check if security modules exist
try:
    from app.security import verify_user_ownership
    print(f"\n2. Security Module: [OK] Loaded")
except ImportError as e:
    print(f"\n2. Security Module: [FAIL] NOT FOUND - {e}")

# Check if middleware exists
try:
    from app.security.middleware import SecurityHeadersMiddleware
    print(f"3. Security Middleware: [OK] Loaded")
except ImportError as e:
    print(f"3. Security Middleware: [FAIL] NOT FOUND - {e}")

# Check routers.json
import json
with open("routers.json") as f:
    routers = json.load(f)

auth_enabled_count = sum(1 for r in routers["routers"].values() if not r.get("disableAuth", True))
print(f"\n4. Authentication Enabled: {auth_enabled_count}/16 routers")

if auth_enabled_count == 14:  # All except auth and db_schema
    print("   [OK] Correct - 14 routers have authentication enabled")
else:
    print(f"   [WARN] Expected 14, got {auth_enabled_count}")

# Test app creation
print(f"\n5. Testing App Creation...")
try:
    from main import create_app
    app = create_app()

    if app.state.auth_config:
        print(f"   [OK] Auth config created successfully")
        print(f"   Audience: {app.state.auth_config.audience}")
    else:
        print(f"   [FAIL] Auth config is None!")

except Exception as e:
    print(f"   [FAIL] Error creating app: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
