import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Set environment variables before importing
os.environ['SUPABASE_URL'] = os.getenv('SUPABASE_URL', '')
os.environ['SUPABASE_SERVICE_KEY'] = os.getenv('SUPABASE_SERVICE_KEY', '')

try:
    from app.apis.support import router as support_router

    print("Support router imported successfully")
    print(f"Number of routes: {len(support_router.routes)}")
    print("\nRoutes:")
    for route in support_router.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ','.join(route.methods)
            print(f"  {methods:10} {route.path}")

except Exception as e:
    print(f"Error importing support router: {e}")
    import traceback
    traceback.print_exc()
