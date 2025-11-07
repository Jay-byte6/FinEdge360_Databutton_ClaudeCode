from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ValidationError, Field
from typing import List, Optional, Dict, Any, Union
# import databutton as db  # Commented out for Railway deployment - not needed
import json
import re
import traceback
from supabase import create_client
import os

router = APIRouter(prefix="/routes")

# Set up Supabase client - use environment variables (Railway deployment)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Financial Data - Supabase URL: {supabase_url[:30] if supabase_url else 'NOT SET'}...")
print(f"Financial Data - Supabase SERVICE_KEY: {'YES' if supabase_key else 'NO'}")

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
if not supabase_key:
    print("CRITICAL_ERROR: SUPABASE_SERVICE_KEY is not set. Financial data operations will fail.")
elif supabase:
    print("[OK] Supabase client initialized successfully for financial_data operations")

# Helper function to sanitize storage keys
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Data models for financial form data
class PersonalInfo(BaseModel):
    name: str
    age: int
    monthlySalary: float
    monthlyExpenses: float

# Legacy assets and liabilities model (for backward compatibility)
class AssetsLiabilities(BaseModel):
    realEstateValue: float = 0
    goldValue: float = 0
    mutualFundsValue: float = 0
    epfBalance: float = 0
    ppfBalance: float = 0
    homeLoan: float = 0
    carLoan: float = 0
    personalLoan: float = 0
    otherLoans: float = 0

# Detailed models for Net Worth Tracker
class IlliquidAssets(BaseModel):
    home: Optional[float] = 0
    other_real_estate: Optional[float] = 0
    jewellery: Optional[float] = 0
    sgb: Optional[float] = 0
    ulips: Optional[float] = 0
    epf_ppf_vpf: Optional[float] = 0

class LiquidAssets(BaseModel):
    fixed_deposit: Optional[float] = 0
    debt_funds: Optional[float] = 0
    domestic_stock_market: Optional[float] = 0
    domestic_equity_mutual_funds: Optional[float] = 0
    cash_from_equity_mutual_funds: Optional[float] = 0
    us_equity: Optional[float] = 0
    liquid_savings_cash: Optional[float] = 0
    gold_etf_digital_gold: Optional[float] = 0
    crypto: Optional[float] = 0
    reits: Optional[float] = 0

class Assets(BaseModel):
    illiquid: IlliquidAssets = IlliquidAssets()
    liquid: LiquidAssets = LiquidAssets()

class Liabilities(BaseModel):
    home_loan: Optional[float] = 0
    education_loan: Optional[float] = 0
    car_loan: Optional[float] = 0
    personal_gold_loan: Optional[float] = 0
    credit_card: Optional[float] = 0
    other_liabilities: Optional[float] = 0

class Goal(BaseModel):
    name: str
    amount: float
    years: int

class Goals(BaseModel):
    shortTermGoals: List[Goal]
    midTermGoals: List[Goal]
    longTermGoals: List[Goal]

class RiskAppetite(BaseModel):
    risk_tolerance: int = 3  # Using snake_case to match frontend schema
    inflationRate: Optional[float] = 5  # Added from frontend schema
    retirementAge: Optional[int] = 55  # Added from frontend schema
    # Keeping legacy fields for backward compatibility
    riskTolerance: Optional[int] = None
    riskQuestion1: Optional[str] = ""
    riskQuestion2: Optional[str] = ""

class FinancialDataInput(BaseModel):
    personalInfo: PersonalInfo
    # Support both legacy and new detailed structures
    assetsLiabilities: Optional[AssetsLiabilities] = None
    assets: Optional[Assets] = None
    liabilities: Optional[Liabilities] = None
    goals: Goals
    riskAppetite: RiskAppetite
    userId: Optional[str] = Field(default="anonymous")

class FinancialDataOutput(BaseModel):
    personalInfo: PersonalInfo
    # Include both forms for maximum compatibility
    assetsLiabilities: AssetsLiabilities
    assets: Assets
    liabilities: Liabilities
    goals: Goals
    riskAppetite: RiskAppetite
    userId: str

class SaveFinancialDataResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@router.post("/save-financial-data")
def save_financial_data(data: FinancialDataInput) -> SaveFinancialDataResponse:
    try:
        # First try to save to Supabase if available
        try:
            if not supabase:
                print("Supabase client not initialized, using local storage")
                raise Exception("Supabase client not initialized")
                
            # Create or get user
            user_data = {
                "name": data.personalInfo.name,
                "email": f"{sanitize_storage_key(data.userId)}@finnest.example.com"  # Generate a pseudonymous email
            }
            
            # First try to get the user
            user_response = supabase.from_("users")\
                .select("id")\
                .eq("email", user_data["email"])\
                .execute()
            
            user_id = None
            if user_response.data and len(user_response.data) > 0:
                user_id = user_response.data[0]["id"]
            else:
                # Create user if not exists
                user_response = supabase.from_("users")\
                    .insert(user_data)\
                    .execute()
                user_id = user_response.data[0]["id"]
            
            # Now create or update personal_info
            personal_info_data = {
                "user_id": user_id,
                "name": data.personalInfo.name,
                "age": data.personalInfo.age,
                "monthly_salary": data.personalInfo.monthlySalary,
                "monthly_expenses": data.personalInfo.monthlyExpenses,
            }
            
            # Check if personal info already exists
            pi_response = supabase.from_("personal_info")\
                .select("id")\
                .eq("user_id", user_id)\
                .execute()
            
            personal_info_id = None
            if pi_response.data and len(pi_response.data) > 0:
                # Update existing record
                personal_info_id = pi_response.data[0]["id"]
                supabase.from_("personal_info")\
                    .update(personal_info_data)\
                    .eq("id", personal_info_id)\
                    .execute()
            else:
                # Create new record
                pi_response = supabase.from_("personal_info")\
                    .insert(personal_info_data)\
                    .execute()
                personal_info_id = pi_response.data[0]["id"]
            
            # Process assets and liabilities from either detailed structure or legacy format
            # If detailed assets/liabilities provided, compute summaries for backward compatibility
            # Otherwise use provided assetsLiabilities
            assets_data = data.assets if data.assets else Assets()
            liabilities_data = data.liabilities if data.liabilities else Liabilities()
            
            # If assetsLiabilities not provided, compute it from detailed data
            if not data.assetsLiabilities:
                real_estate_value = (assets_data.illiquid.home or 0) + (assets_data.illiquid.other_real_estate or 0) + (assets_data.liquid.reits or 0)
                gold_value = (assets_data.illiquid.jewellery or 0) + (assets_data.illiquid.sgb or 0) + (assets_data.liquid.gold_etf_digital_gold or 0)
                mutual_funds_value = (assets_data.liquid.debt_funds or 0) + (assets_data.liquid.domestic_equity_mutual_funds or 0)
                epf_balance = assets_data.illiquid.epf_ppf_vpf or 0
                ppf_balance = 0  # Not currently separated in our schema
                home_loan = liabilities_data.home_loan or 0
                car_loan = liabilities_data.car_loan or 0
                personal_loan = liabilities_data.personal_gold_loan or 0
                other_loans = (liabilities_data.education_loan or 0) + (liabilities_data.credit_card or 0) + (liabilities_data.other_liabilities or 0)
                
                # Create a synthetic assetsLiabilities object
                computed_al = AssetsLiabilities(
                    realEstateValue=real_estate_value,
                    goldValue=gold_value,
                    mutualFundsValue=mutual_funds_value,
                    epfBalance=epf_balance,
                    ppfBalance=ppf_balance,
                    homeLoan=home_loan,
                    carLoan=car_loan,
                    personalLoan=personal_loan,
                    otherLoans=other_loans
                )
            else:
                computed_al = data.assetsLiabilities
            
            # Now save assets and liabilities
            assets_liabilities_data = {
                "user_id": user_id,
                "personal_info_id": personal_info_id,
                "real_estate_value": computed_al.realEstateValue,
                "gold_value": computed_al.goldValue,
                "mutual_funds_value": computed_al.mutualFundsValue,
                "epf_balance": computed_al.epfBalance,
                "ppf_balance": computed_al.ppfBalance,
                "home_loan": computed_al.homeLoan,
                "car_loan": computed_al.carLoan,
                "personal_loan": computed_al.personalLoan,
                "other_loans": computed_al.otherLoans,
                # Add JSONB columns for detailed data
                "assets_detail": assets_data.dict() if data.assets else None,
                "liabilities_detail": liabilities_data.dict() if data.liabilities else None,
            }
            
            # Check if assets/liabilities already exists
            al_response = supabase.from_("assets_liabilities")\
                .select("id")\
                .eq("personal_info_id", personal_info_id)\
                .execute()
            
            if al_response.data and len(al_response.data) > 0:
                # Update existing record
                al_id = al_response.data[0]["id"]
                supabase.from_("assets_liabilities")\
                    .update(assets_liabilities_data)\
                    .eq("id", al_id)\
                    .execute()
            else:
                # Create new record
                supabase.from_("assets_liabilities")\
                    .insert(assets_liabilities_data)\
                    .execute()
            
            # Save risk appetite
            risk_appetite_data = {
                "user_id": user_id,
                "personal_info_id": personal_info_id,
                "risk_tolerance": data.riskAppetite.risk_tolerance if data.riskAppetite.risk_tolerance is not None else data.riskAppetite.riskTolerance,
                "inflation_rate": data.riskAppetite.inflationRate if hasattr(data.riskAppetite, 'inflationRate') else 5,
                "retirement_age": data.riskAppetite.retirementAge if hasattr(data.riskAppetite, 'retirementAge') else 55,
                "risk_question1": data.riskAppetite.riskQuestion1,
                "risk_question2": data.riskAppetite.riskQuestion2,
            }
            
            # Check if risk appetite already exists
            ra_response = supabase.from_("risk_appetite")\
                .select("id")\
                .eq("personal_info_id", personal_info_id)\
                .execute()
            
            if ra_response.data and len(ra_response.data) > 0:
                # Update existing record
                ra_id = ra_response.data[0]["id"]
                supabase.from_("risk_appetite")\
                    .update(risk_appetite_data)\
                    .eq("id", ra_id)\
                    .execute()
            else:
                # Create new record
                supabase.from_("risk_appetite")\
                    .insert(risk_appetite_data)\
                    .execute()
            
            # Delete existing goals and create new ones
            supabase.from_("goals")\
                .delete()\
                .eq("personal_info_id", personal_info_id)\
                .execute()
            
            # Add short-term goals
            for goal in data.goals.shortTermGoals:
                goal_data = {
                    "user_id": user_id,
                    "personal_info_id": personal_info_id,
                    "name": goal.name,
                    "amount": goal.amount,
                    "years": goal.years,
                    "goal_type": "short_term"
                }
                supabase.from_("goals").insert(goal_data).execute()
            
            # Add mid-term goals
            for goal in data.goals.midTermGoals:
                goal_data = {
                    "user_id": user_id,
                    "personal_info_id": personal_info_id,
                    "name": goal.name,
                    "amount": goal.amount,
                    "years": goal.years,
                    "goal_type": "mid_term"
                }
                supabase.from_("goals").insert(goal_data).execute()
            
            # Add long-term goals
            for goal in data.goals.longTermGoals:
                goal_data = {
                    "user_id": user_id,
                    "personal_info_id": personal_info_id,
                    "name": goal.name,
                    "amount": goal.amount,
                    "years": goal.years,
                    "goal_type": "long_term"
                }
                supabase.from_("goals").insert(goal_data).execute()
            
            return SaveFinancialDataResponse(
                success=True,
                message="Financial data saved successfully to database",
                data={"user_id": user_id, "personal_info_id": personal_info_id}
            )
            
        except Exception as supabase_error:
            # If Supabase fails, raise an error (no db.storage fallback on Railway)
            print(f"Supabase error: {str(supabase_error)}")
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save financial data to Supabase: {str(supabase_error)}"
            )

    except Exception as e:
        print(f"Error saving financial data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save financial data: {str(e)}")

@router.get("/get-financial-data/{user_id}")
def get_financial_data(user_id: str) -> FinancialDataOutput:
    print(f"-----> Attempting to get financial data for user_id: {user_id} <-----")
    try:
        # First try to get data from Supabase
        try:
            if not supabase:
                raise Exception("Supabase client not initialized")
                
            # Get the user
            user_email = f"{sanitize_storage_key(user_id)}@finnest.example.com"
            user_response = supabase.from_("users")\
                .select("id")\
                .eq("email", user_email)\
                .execute()
            
            if not user_response.data or len(user_response.data) == 0:
                raise Exception("User not found in database")
                
            user_id_db = user_response.data[0]["id"]
            
            # Get personal info
            pi_response = supabase.from_("personal_info")\
                .select("*")\
                .eq("user_id", user_id_db)\
                .execute()
                
            if not pi_response.data or len(pi_response.data) == 0:
                raise Exception("Personal info not found in database")
                
            personal_info = pi_response.data[0]
            personal_info_id = personal_info["id"]
            
            # Get assets and liabilities
            al_response = supabase.from_("assets_liabilities")\
                .select("*")\
                .eq("personal_info_id", personal_info_id)\
                .execute()
                
            if not al_response.data or len(al_response.data) == 0:
                raise Exception("Assets and liabilities not found in database")
                
            assets_liabilities = al_response.data[0]
            
            # Extract detailed assets and liabilities if available, or create default structures
            detailed_assets = None
            detailed_liabilities = None
            
            # Check if we have detailed JSON data
            if "assets_detail" in assets_liabilities and assets_liabilities["assets_detail"]:
                detailed_assets = Assets(**assets_liabilities["assets_detail"])
            else:
                # Create default assets structure
                illiquid_assets = IlliquidAssets(
                    home=assets_liabilities["real_estate_value"] / 2,  # Estimate
                    other_real_estate=assets_liabilities["real_estate_value"] / 2,  # Estimate
                    epf_ppf_vpf=assets_liabilities["epf_balance"]  # Direct map
                )
                
                liquid_assets = LiquidAssets(
                    debt_funds=assets_liabilities["mutual_funds_value"] / 2,  # Estimate
                    domestic_equity_mutual_funds=assets_liabilities["mutual_funds_value"] / 2  # Estimate
                )
                
                detailed_assets = Assets(illiquid=illiquid_assets, liquid=liquid_assets)
            
            if "liabilities_detail" in assets_liabilities and assets_liabilities["liabilities_detail"]:
                detailed_liabilities = Liabilities(**assets_liabilities["liabilities_detail"])
            else:
                # Create default liabilities structure
                detailed_liabilities = Liabilities(
                    home_loan=assets_liabilities["home_loan"],
                    car_loan=assets_liabilities["car_loan"],
                    personal_gold_loan=assets_liabilities["personal_loan"],
                    other_liabilities=assets_liabilities["other_loans"]
                )
            
            # Get risk appetite
            ra_response = supabase.from_("risk_appetite")\
                .select("*")\
                .eq("personal_info_id", personal_info_id)\
                .execute()
                
            if not ra_response.data or len(ra_response.data) == 0:
                raise Exception("Risk appetite not found in database")
                
            risk_appetite = ra_response.data[0]
            
            # Extract new fields if available
            inflation_rate = risk_appetite.get("inflation_rate", 5)
            retirement_age = risk_appetite.get("retirement_age", 55)
            
            # Get goals
            goals_response = supabase.from_("goals")\
                .select("*")\
                .eq("personal_info_id", personal_info_id)\
                .execute()
                
            goals = goals_response.data
            
            # Format the data to match the FinancialData model
            short_term_goals = []
            mid_term_goals = []
            long_term_goals = []
            
            for goal in goals:
                goal_obj = {
                    "name": goal["name"],
                    "amount": float(goal["amount"]),
                    "years": goal["years"]
                }
                
                if goal["goal_type"] == "short_term":
                    short_term_goals.append(goal_obj)
                elif goal["goal_type"] == "mid_term":
                    mid_term_goals.append(goal_obj)
                elif goal["goal_type"] == "long_term":
                    long_term_goals.append(goal_obj)
            
            # Create the response object
            response_data = {
                "personalInfo": {
                    "name": personal_info["name"],
                    "age": personal_info["age"],
                    "monthlySalary": float(personal_info["monthly_salary"]),
                    "monthlyExpenses": float(personal_info["monthly_expenses"])
                },
                "assetsLiabilities": {
                    "realEstateValue": float(assets_liabilities["real_estate_value"]),
                    "goldValue": float(assets_liabilities["gold_value"]),
                    "mutualFundsValue": float(assets_liabilities["mutual_funds_value"]),
                    "epfBalance": float(assets_liabilities["epf_balance"]),
                    "ppfBalance": float(assets_liabilities["ppf_balance"]),
                    "homeLoan": float(assets_liabilities["home_loan"]),
                    "carLoan": float(assets_liabilities["car_loan"]),
                    "personalLoan": float(assets_liabilities["personal_loan"]),
                    "otherLoans": float(assets_liabilities["other_loans"])
                },
                "assets": detailed_assets,
                "liabilities": detailed_liabilities,
                "goals": {
                    "shortTermGoals": short_term_goals,
                    "midTermGoals": mid_term_goals,
                    "longTermGoals": long_term_goals
                },
                "riskAppetite": {
                    "risk_tolerance": risk_appetite["risk_tolerance"],  # New name
                    "inflationRate": inflation_rate,  # New field
                    "retirementAge": retirement_age,  # New field
                    # Legacy fields
                    "riskTolerance": risk_appetite["risk_tolerance"],
                    "riskQuestion1": risk_appetite["risk_question1"] or "",
                    "riskQuestion2": risk_appetite["risk_question2"] or ""
                },
                "userId": user_id
            }
            
            return FinancialDataOutput(**response_data)
            
        except Exception as supabase_error:
            # No db.storage fallback on Railway - raise the error
            print(f"Supabase retrieve error: {str(supabase_error)}")
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve financial data from Supabase: {str(supabase_error)}"
            )

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to retrieve financial data: {str(e)}")
