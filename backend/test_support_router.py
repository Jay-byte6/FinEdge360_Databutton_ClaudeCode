import os
os.environ['SUPABASE_URL'] = 'test'
os.environ['SUPABASE_SERVICE_KEY'] = 'test'

from app.apis.support import router

print("Support router routes:")
for route in router.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        print(f"  {route.methods} {route.path}")
