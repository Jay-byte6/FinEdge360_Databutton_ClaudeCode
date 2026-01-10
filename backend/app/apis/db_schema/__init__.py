from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from supabase import create_client, Client
# import databutton as db  # Commented out for Railway deployment - not needed
import os

router = APIRouter(prefix="/routes")

# Get the Supabase credentials from environment variables (Railway deployment)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

print(f"DB Schema - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"DB Schema - Supabase ANON_KEY: {'YES' if supabase_key else 'NO'}")

# Create a Supabase client
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if supabase:
    print("[OK] Supabase client initialized successfully for db_schema operations")

# Response models
class InitializeDatabaseResponse(BaseModel):
    success: bool
    message: str

class DatabaseSchema(BaseModel):
    tables: Optional[Dict[str, List[Dict[str, Any]]]] = None
    message: Optional[str] = None

class SchemaResponse(BaseModel):
    success: bool
    schema: Optional[DatabaseSchema] = None


# Function to initialize the database schema
def initialize_database():
    """Initialize the database schema if it doesn't exist"""
    try:
        if not supabase_url or not supabase_key:
            return {"success": False, "message": "Supabase credentials are missing"}
        
        if not supabase:
            return {"success": False, "message": "Supabase client could not be initialized"}
        
        print(f"Starting database initialization with URL: {supabase_url[:10]}...")
        
        # Since we can't directly create tables via the REST API without special permissions,
        # we need to ask the user to manually create the tables in the Supabase UI.
        # We'll return the success status based on whether we can detect the tables.
        
        # Check for each table
        expected_tables = ["users", "personal_info", "assets_liabilities", "goals", "risk_appetite"]
        missing_tables = []
        
        for table in expected_tables:
            try:
                # Try to select from the table
                response = supabase.from_(table).select('count').limit(1).execute()
                print(f"Table '{table}' exists")
            except Exception as e:
                print(f"Table '{table}' doesn't exist: {str(e)}")
                missing_tables.append(table)
        
        if missing_tables:
            # Return instructions if tables are missing
            sql_instructions = """
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT UNIQUE,
    name TEXT
);

-- Create personal_info table
CREATE TABLE IF NOT EXISTS public.personal_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    monthly_salary NUMERIC NOT NULL,
    monthly_expenses NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets_liabilities table
CREATE TABLE IF NOT EXISTS public.assets_liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    personal_info_id UUID REFERENCES public.personal_info(id) ON DELETE CASCADE,
    real_estate_value NUMERIC NOT NULL DEFAULT 0,
    gold_value NUMERIC NOT NULL DEFAULT 0,
    mutual_funds_value NUMERIC NOT NULL DEFAULT 0,
    epf_balance NUMERIC NOT NULL DEFAULT 0,
    ppf_balance NUMERIC NOT NULL DEFAULT 0,
    home_loan NUMERIC NOT NULL DEFAULT 0,
    car_loan NUMERIC NOT NULL DEFAULT 0,
    personal_loan NUMERIC NOT NULL DEFAULT 0,
    other_loans NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    personal_info_id UUID REFERENCES public.personal_info(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    years INTEGER NOT NULL,
    goal_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT goal_type_check CHECK (goal_type IN ('short_term', 'mid_term', 'long_term'))
);

-- Create risk_appetite table
CREATE TABLE IF NOT EXISTS public.risk_appetite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    personal_info_id UUID REFERENCES public.personal_info(id) ON DELETE CASCADE,
    risk_tolerance INTEGER NOT NULL,
    risk_question1 TEXT,
    risk_question2 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_appetite ENABLE ROW LEVEL SECURITY;

-- Create public policies (for development purposes, should be replaced with proper policies in production)
CREATE POLICY "Allow all operations for all users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations for all users" ON public.personal_info FOR ALL USING (true);
CREATE POLICY "Allow all operations for all users" ON public.assets_liabilities FOR ALL USING (true);
CREATE POLICY "Allow all operations for all users" ON public.goals FOR ALL USING (true);
CREATE POLICY "Allow all operations for all users" ON public.risk_appetite FOR ALL USING (true);
            """
            
            return {
                "success": False, 
                "message": f"The following tables need to be created in Supabase: {', '.join(missing_tables)}.", 
                "sql_instructions": sql_instructions
            }
        
        return {"success": True, "message": "All required database tables exist"}
    except Exception as e:
        print(f"Unexpected error in initialize_database: {str(e)}")
        return {"success": False, "message": f"Error initializing database schema: {str(e)}"}


@router.post("/initialize-database")
def init_database() -> InitializeDatabaseResponse:
    """Initialize the database schema in Supabase"""
    try:
        result = initialize_database()
        if result["success"]:
            return InitializeDatabaseResponse(success=True, message=result["message"])
        else:
            # Include SQL instructions if available
            detail = result["message"]
            if "sql_instructions" in result:
                detail += " SQL instructions have been logged."
                print("SQL for table creation:")
                print(result["sql_instructions"])
            
            raise HTTPException(status_code=400, detail=detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize database: {str(e)}")

@router.get("/payment-config")
async def get_payment_config():
    """
    Get payment configuration (public endpoint - no auth required)
    Returns public keys only for frontend payment gateway initialization
    """
    # Get payment gateway credentials from environment
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    DODO_PAYMENTS_API_KEY = os.getenv("DODO_PAYMENTS_API_KEY", "")
    DODO_PAYMENTS_ENVIRONMENT = os.getenv("DODO_PAYMENTS_ENVIRONMENT", "test_mode")

    return {
        "razorpay": {
            "enabled": bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET),
            "key_id": RAZORPAY_KEY_ID if RAZORPAY_KEY_ID else None
        },
        "stripe": {
            "enabled": bool(STRIPE_SECRET_KEY),
            "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY", "")
        },
        "dodo": {
            "enabled": bool(DODO_PAYMENTS_API_KEY),
            "environment": DODO_PAYMENTS_ENVIRONMENT
        }
    }


@router.get("/schema")
def get_database_schema() -> SchemaResponse:
    """Get the current database schema from Supabase"""
    try:
        if not supabase_url or not supabase_key:
            return SchemaResponse(success=False, schema=DatabaseSchema(message="Supabase credentials are missing"))
        
        if not supabase:
            return SchemaResponse(success=False, schema=DatabaseSchema(message="Supabase client could not be initialized"))
        
        # Get all tables
        tables = {}
        
        # Check if our tables exist
        for table_name in ["users", "personal_info", "assets_liabilities", "goals", "risk_appetite"]:
            try:
                # Try to get column info
                print(f"Checking schema for table {table_name}...")
                
                # If table exists, try to get a row to extract column names
                response = supabase.from_(table_name).select("*").limit(1).execute()
                
                if response and response.data is not None:
                    # If we have data, extract column names and types from the first row
                    columns = []
                    if len(response.data) > 0:
                        for key in response.data[0].keys():
                            # We can't infer the exact type from JSON, so we'll use basic types
                            value = response.data[0][key]
                            col_type = "unknown"
                            
                            if isinstance(value, str):
                                col_type = "text"
                            elif isinstance(value, int):
                                col_type = "integer"
                            elif isinstance(value, float):
                                col_type = "numeric"
                            elif value is None:
                                col_type = "unknown (null value)"
                            
                            columns.append({
                                "column_name": key,
                                "data_type": col_type,
                                "is_nullable": "YES"  # Can't infer this from the data
                            })
                    
                    tables[table_name] = columns
            except Exception as table_error:
                # Table doesn't exist or other error
                print(f"Error getting schema for {table_name}: {str(table_error)}")
        
        # Format the response
        return SchemaResponse(success=True, schema=DatabaseSchema(tables=tables))
    except Exception as e:
        print(f"Unexpected error in get_database_schema: {str(e)}")
        return SchemaResponse(success=False, schema=DatabaseSchema(message=f"Failed to get database schema: {str(e)}"))
