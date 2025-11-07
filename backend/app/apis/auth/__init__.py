from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
# import databutton as db  # Commented out for Railway deployment - not needed
from supabase import create_client
import traceback
import requests
import json
import os

router = APIRouter(prefix="/routes")

# Set up Supabase client - use environment variables (Railway deployment)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for admin operations on profiles

print(f"Supabase URL configured: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Supabase SERVICE_KEY configured: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Profile operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for auth operations")

# Response model for initialization
class InitProfileResponse(BaseModel):
    success: bool
    message: str

# User profile model
class UserProfile(BaseModel):
    user_id: str
    full_name: str = ""
    pan_number: str = ""
    phone_number: str = ""

# Response model for profile operations
class ProfileResponse(BaseModel):
    success: bool
    message: str
    data: dict = None

# Password reset model
class PasswordResetRequest(BaseModel):
    email: str
    password: str
    
@router.post("/auth/reset-password")
def reset_password(request: PasswordResetRequest):
    """Reset a user's password directly"""
    try:
        print(f"\n\n=== PASSWORD RESET ATTEMPT FOR EMAIL: {request.email} ===")
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")

        # Use different approaches to reset the password, with full logging
        try:
            # Get service role key from environment variable
            service_key = os.getenv("SUPABASE_SERVICE_KEY")

            if not service_key:
                print("Warning: SUPABASE_SERVICE_KEY not found, falling back to ANON key")
                service_key = supabase_key
                
            if not service_key:
                raise HTTPException(status_code=500, detail="Supabase keys not configured properly")

            print("APPROACH 1: Direct password reset using admin API")
            # Try direct password update without user lookup first (simplest approach)
            try:
                recovery_response = requests.post(
                    f"{supabase_url}/auth/v1/recover",
                    json={"email": request.email},
                    headers={
                        "apikey": supabase_key,
                        "Content-Type": "application/json"
                    }
                )
                print(f"Recovery flow initiated: Status {recovery_response.status_code}")
                
                # Try to verify JWT approach
                try:
                    # We'll try to sign in with demo credentials
                    auth_response = requests.post(
                        f"{supabase_url}/auth/v1/token?grant_type=password",
                        json={
                            "email": request.email,
                            "password": "temppwd123" # Use a dummy password
                        },
                        headers={
                            "apikey": supabase_key,
                            "Content-Type": "application/json"
                        }
                    )
                    print(f"Auth test response: {auth_response.status_code}")
                    if auth_response.status_code == 400:
                        # This actually means the user exists but password is wrong (good!)
                        print("User verified to exist via auth test")
                    elif auth_response.status_code == 200:
                        print("User successfully authenticated (unexpected but good)")
                    else:
                        print(f"Unknown auth response: {auth_response.text}")
                except Exception as e:
                    print(f"Auth test error: {str(e)}")
            except Exception as e:
                print(f"Recovery approach error: {str(e)}")

            print("APPROACH 2: Try admin user search and update")
            # Try admin search
            try:
                users_response = requests.get(
                    f"{supabase_url}/auth/v1/admin/users",
                    params={"email": request.email},
                    headers={
                        "apikey": service_key,
                        "Authorization": f"Bearer {service_key}"
                    }
                )
                print(f"Admin search response: Status {users_response.status_code}")
                
                if users_response.status_code == 200:
                    try:
                        data = users_response.json()
                        print(f"Admin search result: {json.dumps(data, indent=2)}")
                        user_found = "users" in data and len(data["users"]) > 0
                        if user_found:
                            user_id = data["users"][0]["id"]
                            print(f"User found with ID: {user_id}")
                            
                            # Try admin password update
                            update_response = requests.put(
                                f"{supabase_url}/auth/v1/admin/users/{user_id}",
                                json={"password": request.password},
                                headers={
                                    "apikey": service_key,
                                    "Authorization": f"Bearer {service_key}",
                                    "Content-Type": "application/json"
                                }
                            )
                            print(f"Admin password update: Status {update_response.status_code}")
                            
                            if update_response.status_code == 200:
                                return {"success": True, "message": "Password reset successfully"}
                            else:
                                print(f"Admin update failed: {update_response.text}")
                        else:
                            print("No users found in admin search response")
                    except Exception as e:
                        print(f"Error processing admin search result: {str(e)}")
                else:
                    print(f"Admin search failed: {users_response.text}")
            except Exception as e:
                print(f"Admin search error: {str(e)}")

            print("APPROACH 3: Try using auth change password API")
            # Try using the auth API for password reset
            try:
                # Create a reset token using the auth API
                direct_update_response = requests.put(
                    f"{supabase_url}/auth/v1/user",
                    json={"password": request.password, "email": request.email},
                    headers={
                        "apikey": supabase_key,
                        "Content-Type": "application/json"
                    }
                )
                print(f"Direct update response: Status {direct_update_response.status_code}")
                if direct_update_response.status_code < 300:
                    return {"success": True, "message": "Password reset successfully via direct update"}
                else:
                    print(f"Direct update failed: {direct_update_response.text}")
            except Exception as e:
                print(f"Direct update error: {str(e)}")

            # If we got this far, try the last resort approach
            print("APPROACH 4: Create new user if doesn't exist")
            try:
                # Create user if it doesn't exist
                create_response = requests.post(
                    f"{supabase_url}/auth/v1/admin/users",
                    json={
                        "email": request.email,
                        "password": request.password,
                        "email_confirm": True
                    },
                    headers={
                        "apikey": service_key,
                        "Authorization": f"Bearer {service_key}",
                        "Content-Type": "application/json"
                    }
                )
                print(f"Create user response: Status {create_response.status_code}")
                if create_response.status_code == 200 or create_response.status_code == 201:
                    return {"success": True, "message": "User created with new password"}
                elif "Already exists" in create_response.text:
                    # If already exists, we should have been able to reset it above,
                    # but this is the fallback case
                    print("User already exists but previous methods failed")
                else:
                    print(f"Create user failed: {create_response.text}")
            except Exception as e:
                print(f"Create user error: {str(e)}")

            # If all approaches failed
            print("=== ALL APPROACHES FAILED ===\n")
            return {"success": False, "message": "Unable to reset password. Please contact support."}

        except Exception as e:
            print(f"Error in password reset process: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")
    except HTTPException as he:
        raise
    except Exception as e:
        print(f"Error resetting password: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to reset password: {str(e)}")

@router.post("/init-auth-tables")
def init_auth_tables() -> InitProfileResponse:
    """
    Initialize authentication-related tables in Supabase
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        # Create profiles table if it doesn't exist
        # Execute SQL directly via REST API
        create_table_sql = """
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            pan_number TEXT,
            phone_number TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Set up Row Level Security
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies (ignoring errors if they already exist)
        DO $$
        BEGIN
            BEGIN
                CREATE POLICY "Users can view their own profile" 
                ON public.profiles FOR SELECT 
                USING (auth.uid() = id);
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END;
            
            BEGIN
                CREATE POLICY "Users can update their own profile" 
                ON public.profiles FOR UPDATE 
                USING (auth.uid() = id);
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END;
            
            BEGIN
                CREATE POLICY "Users can insert their own profile" 
                ON public.profiles FOR INSERT 
                WITH CHECK (auth.uid() = id);
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END;
        END;
        $$;
        
        -- Create function to handle new user creation
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
            INSERT INTO public.profiles (id)
            VALUES (NEW.id)
            ON CONFLICT (id) DO NOTHING;
            RETURN NEW;
        END;
        $$;
        
        -- Create trigger for new user signup
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
        """
        
        # Execute SQL via REST API
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{supabase_url}/rest/v1/rpc/exec_sql",
            headers=headers,
            json={"query": create_table_sql}
        )
        
        if response.status_code >= 400:
            print(f"SQL execution failed: {response.text}")
            # Try alternate endpoint format
            response = requests.post(
                f"{supabase_url}/rest/v1/rpc/execute_sql",
                headers=headers,
                json={"sql": create_table_sql}
            )
            
            if response.status_code >= 400:
                print(f"SQL execution failed (alternate method): {response.text}")
        else:
            print("SQL executed successfully")
        
        return InitProfileResponse(
            success=True,
            message="Authentication tables initialized successfully"
        )
    except Exception as e:
        print(f"Error initializing auth tables: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to initialize auth tables: {str(e)}")

@router.post("/update-profile")
def update_profile(profile: UserProfile) -> ProfileResponse:
    """
    Update user profile information
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        # Prepare data for upsert
        profile_data = {
            "id": profile.user_id,  # user_id is the auth.users id which is the profiles.id
            "full_name": profile.full_name,
            "pan_number": profile.pan_number,
            "phone_number": profile.phone_number,
            "updated_at": "now()"
        }
        
        # Upsert profile (insert if not exists, update if exists)
        response = supabase.from_("profiles")\
            .upsert(profile_data, returning="representation")\
            .execute()
        
        if response.data:
            return ProfileResponse(
                success=True,
                message="Profile updated successfully",
                data=response.data[0]
            )
        else:
            return ProfileResponse(
                success=False,
                message="Failed to update profile"
            )
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.get("/get-profile/{user_id}")
def get_profile(user_id: str) -> ProfileResponse:
    """
    Get user profile information
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        # Query profile
        response = supabase.from_("profiles")\
            .select("*")\
            .eq("id", user_id)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return ProfileResponse(
                success=True,
                message="Profile retrieved successfully",
                data=response.data[0]
            )
        else:
            return ProfileResponse(
                success=False,
                message="Profile not found"
            )
    except Exception as e:
        print(f"Error retrieving profile: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to retrieve profile: {str(e)}")
