from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ValidationError, Field
from typing import List, Optional, Dict, Any, Union
# import databutton as db  # Commented out for Railway deployment - not needed
import json
import re
import traceback
from supabase import create_client
import os
from databutton_app.mw.auth_mw import User, get_authorized_user
from app.security import verify_user_ownership, sanitize_user_id

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

class TaxDeduction(BaseModel):
    name: str
    section: str
    amount: float
    maxLimit: Optional[float] = None
    eligible: bool = True

class TaxPlan(BaseModel):
    yearlyIncome: float
    otherIncome: Optional[float] = 0  # NEW: Other income (interest, rental, freelancing, etc.)
    capitalGains: Optional[float] = 0  # NEW: Capital gains from stocks, property, etc.
    selectedRegime: str  # "old" or "new" or "compare"
    deductions: Optional[List[TaxDeduction]] = []
    taxUnderOldRegime: Optional[float] = 0
    taxUnderNewRegime: Optional[float] = 0
    moreBeneficialRegime: Optional[str] = ""
    taxSavings: Optional[float] = 0
    hraExemption: Optional[float] = 0

class FinancialDataInput(BaseModel):
    personalInfo: Optional[PersonalInfo] = None
    # Support both legacy and new detailed structures
    assetsLiabilities: Optional[AssetsLiabilities] = None
    assets: Optional[Assets] = None
    liabilities: Optional[Liabilities] = None
    goals: Optional[Goals] = None
    riskAppetite: Optional[RiskAppetite] = None
    taxPlan: Optional[TaxPlan] = None  # NEW: Tax planning data
    userId: Optional[str] = Field(default="anonymous")

class FinancialDataOutput(BaseModel):
    personalInfo: PersonalInfo
    # Include both forms for maximum compatibility
    assetsLiabilities: AssetsLiabilities
    assets: Assets
    liabilities: Liabilities
    goals: Goals
    riskAppetite: RiskAppetite
    taxPlan: Optional[TaxPlan] = None  # NEW: Tax planning data
    userId: str

class SaveFinancialDataResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# Risk Assessment Models
class RiskQuizAnswer(BaseModel):
    questionId: int
    score: int

class PortfolioAllocation(BaseModel):
    Equity: float
    Debt: float
    Gold: float
    REITs: float
    Cash: float

class RiskAssessmentData(BaseModel):
    userId: str
    riskScore: int
    riskType: str
    quizAnswers: Optional[List[RiskQuizAnswer]] = None
    idealPortfolio: PortfolioAllocation
    currentPortfolio: PortfolioAllocation
    difference: Dict[str, str]
    summary: str
    educationalInsights: List[str]
    encouragement: str

class RiskAssessmentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@router.post("/save-financial-data")
def save_financial_data(data: FinancialDataInput, current_user: User = Depends(get_authorized_user)) -> SaveFinancialDataResponse:
    print(f"===== [SAVE FINANCIAL DATA] START =====")
    print(f"User ID: {data.userId}")
    print(f"Has Personal Info: {data.personalInfo is not None}")
    print(f"Has Assets: {data.assets is not None}")
    print(f"Has Liabilities: {data.liabilities is not None}")

    # SECURITY: Verify user can only save their own data
    data.userId = sanitize_user_id(data.userId)
    verify_user_ownership(current_user, data.userId)

    try:
        # First try to save to Supabase if available
        try:
            if not supabase:
                print("Supabase client not initialized, using local storage")
                raise Exception("Supabase client not initialized")

            # Use the authenticated user's ID directly
            # The data.userId comes from the authenticated user session in the frontend
            user_id = data.userId
            print(f"Saving for authenticated user_id: {user_id}")

            # CRITICAL: Ensure user exists in users table before saving to personal_info
            # This prevents foreign key constraint violations
            try:
                user_check = supabase.from_("users").select("id").eq("id", user_id).execute()
                if not user_check.data or len(user_check.data) == 0:
                    # User doesn't exist in users table, create it
                    print(f"[CRITICAL FIX] User {user_id} not found in users table, creating entry...")
                    user_name = data.personalInfo.name if data.personalInfo else "User"
                    user_email = f"{user_id}@finedge360.com"  # Temporary email, will be updated by profile

                    supabase.from_("users").insert({
                        "id": user_id,
                        "email": user_email,
                        "name": user_name
                    }).execute()
                    print(f"[CRITICAL FIX] User {user_id} created successfully in users table")
            except Exception as user_create_error:
                print(f"[ERROR] Failed to create user in users table: {user_create_error}")
                # Continue anyway - the insert might fail but at least we logged it

            # Now create or update personal_info
            personal_info_data = {
                "user_id": user_id,
            }

            # Add personal info if provided
            if data.personalInfo:
                personal_info_data.update({
                    "name": data.personalInfo.name,
                    "age": data.personalInfo.age,
                    "monthly_salary": data.personalInfo.monthlySalary,
                    "monthly_expenses": data.personalInfo.monthlyExpenses,
                })

            # Add tax plan if provided (stored as JSONB)
            if data.taxPlan:
                personal_info_data["tax_plan"] = data.taxPlan.dict()
            
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
            
            # Save risk appetite (only if provided)
            if data.riskAppetite:
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
            
            # Delete existing goals and create new ones (only if goals provided)
            if data.goals:
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
def get_financial_data(user_id: str, current_user: User = Depends(get_authorized_user)) -> FinancialDataOutput:
    print(f"-----> Attempting to get financial data for user_id: {user_id} <-----")

    try:
        print(f"[DEBUG] current_user type: {type(current_user)}")
        print(f"[DEBUG] current_user is None: {current_user is None}")
        if current_user:
            print(f"[DEBUG] current_user.sub: {current_user.sub}")
        print(f"[DEBUG] requested user_id: {user_id}")
    except Exception as debug_err:
        print(f"[DEBUG ERROR] Failed to print debug info: {debug_err}")

    # SECURITY: Verify user can only access their own data
    user_id = sanitize_user_id(user_id)
    print(f"[DEBUG] About to call verify_user_ownership...")
    verify_user_ownership(current_user, user_id)
    print(f"[DEBUG] verify_user_ownership completed successfully")

    try:
        # First try to get data from Supabase
        try:
            if not supabase:
                raise Exception("Supabase client not initialized")
                
            # Use user_id directly - don't convert to email format
            # This ensures we look up data for the actual authenticated user
            print(f"Found user by UUID: {user_id}")

            # Get personal info directly using the user_id
            pi_response = supabase.from_("personal_info")\
                .select("*")\
                .eq("user_id", user_id)\
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
                try:
                    detailed_assets = Assets(**assets_liabilities["assets_detail"])
                except Exception as asset_parse_error:
                    print(f"Error parsing assets_detail: {asset_parse_error}")
                    print(f"assets_detail value: {assets_liabilities['assets_detail']}")
                    # Create default assets structure as fallback
                    illiquid_assets = IlliquidAssets(
                        home=float(assets_liabilities.get("real_estate_value", 0)) / 2,  # Estimate
                        other_real_estate=float(assets_liabilities.get("real_estate_value", 0)) / 2,  # Estimate
                        epf_ppf_vpf=float(assets_liabilities.get("epf_balance", 0))  # Direct map
                    )

                    liquid_assets = LiquidAssets(
                        debt_funds=float(assets_liabilities.get("mutual_funds_value", 0)) / 2,  # Estimate
                        domestic_equity_mutual_funds=float(assets_liabilities.get("mutual_funds_value", 0)) / 2  # Estimate
                    )

                    detailed_assets = Assets(illiquid=illiquid_assets, liquid=liquid_assets)
            else:
                # Create default assets structure
                illiquid_assets = IlliquidAssets(
                    home=float(assets_liabilities.get("real_estate_value", 0)) / 2,  # Estimate
                    other_real_estate=float(assets_liabilities.get("real_estate_value", 0)) / 2,  # Estimate
                    epf_ppf_vpf=float(assets_liabilities.get("epf_balance", 0))  # Direct map
                )

                liquid_assets = LiquidAssets(
                    debt_funds=float(assets_liabilities.get("mutual_funds_value", 0)) / 2,  # Estimate
                    domestic_equity_mutual_funds=float(assets_liabilities.get("mutual_funds_value", 0)) / 2  # Estimate
                )

                detailed_assets = Assets(illiquid=illiquid_assets, liquid=liquid_assets)
            
            if "liabilities_detail" in assets_liabilities and assets_liabilities["liabilities_detail"]:
                try:
                    detailed_liabilities = Liabilities(**assets_liabilities["liabilities_detail"])
                except Exception as liab_parse_error:
                    print(f"Error parsing liabilities_detail: {liab_parse_error}")
                    print(f"liabilities_detail value: {assets_liabilities['liabilities_detail']}")
                    # Create default liabilities structure as fallback
                    detailed_liabilities = Liabilities(
                        home_loan=float(assets_liabilities.get("home_loan", 0)),
                        car_loan=float(assets_liabilities.get("car_loan", 0)),
                        personal_gold_loan=float(assets_liabilities.get("personal_loan", 0)),
                        other_liabilities=float(assets_liabilities.get("other_loans", 0))
                    )
            else:
                # Create default liabilities structure
                detailed_liabilities = Liabilities(
                    home_loan=float(assets_liabilities.get("home_loan", 0)),
                    car_loan=float(assets_liabilities.get("car_loan", 0)),
                    personal_gold_loan=float(assets_liabilities.get("personal_loan", 0)),
                    other_liabilities=float(assets_liabilities.get("other_loans", 0))
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
            
            # Extract tax_plan if available (stored as JSONB in personal_info table)
            tax_plan_data = None
            if "tax_plan" in personal_info and personal_info["tax_plan"]:
                try:
                    tax_plan_data = TaxPlan(**personal_info["tax_plan"])
                except Exception as tax_error:
                    print(f"Error parsing tax_plan: {tax_error}")
                    tax_plan_data = None

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
                "taxPlan": tax_plan_data,  # NEW: Include tax plan data if available
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

# Risk Assessment Endpoints
@router.post("/save-risk-assessment")
def save_risk_assessment(data: RiskAssessmentData, current_user: User = Depends(get_authorized_user)) -> RiskAssessmentResponse:
    """Save user's risk assessment data to database"""

    # SECURITY: Verify user can only save their own data
    data.userId = sanitize_user_id(data.userId)
    verify_user_ownership(current_user, data.userId)

    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Get user ID from database
        user_email = f"{sanitize_storage_key(data.userId)}@finnest.example.com"
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id_db = user_response.data[0]["id"]
        
        # Prepare risk assessment data
        risk_assessment_data = {
            "user_id": user_id_db,
            "risk_score": data.riskScore,
            "risk_type": data.riskType,
            "quiz_answers": [answer.dict() for answer in data.quizAnswers] if data.quizAnswers else None,
            "ideal_portfolio": data.idealPortfolio.dict(),
            "current_portfolio": data.currentPortfolio.dict(),
            "difference": data.difference,
            "summary": data.summary,
            "educational_insights": data.educationalInsights,
            "encouragement": data.encouragement
        }
        
        # Check if risk assessment already exists for this user
        existing_response = supabase.from_("risk_assessments").select("id").eq("user_id", user_id_db).execute()
        
        if existing_response.data and len(existing_response.data) > 0:
            # Update existing record
            assessment_id = existing_response.data[0]["id"]
            supabase.from_("risk_assessments").update(risk_assessment_data).eq("id", assessment_id).execute()
            message = "Risk assessment updated successfully"
        else:
            # Create new record
            supabase.from_("risk_assessments").insert(risk_assessment_data).execute()
            message = "Risk assessment saved successfully"
        
        return RiskAssessmentResponse(
            success=True,
            message=message,
            data={"user_id": user_id_db}
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error saving risk assessment: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to save risk assessment: {str(e)}")

@router.get("/get-risk-assessment/{user_id}")
def get_risk_assessment(user_id: str, current_user: User = Depends(get_authorized_user)) -> Optional[Dict[str, Any]]:
    """Retrieve user's risk assessment data from database"""

    # SECURITY: Verify user can only access their own data
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Get user ID from database
        user_email = f"{sanitize_storage_key(user_id)}@finnest.example.com"
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            return None  # User not found, return None instead of error
        
        user_id_db = user_response.data[0]["id"]
        
        # Get risk assessment
        assessment_response = supabase.from_("risk_assessments").select("*").eq("user_id", user_id_db).execute()
        
        if not assessment_response.data or len(assessment_response.data) == 0:
            return None  # No assessment found
        
        assessment = assessment_response.data[0]
        
        # Format response
        return {
            "riskScore": assessment["risk_score"],
            "riskType": assessment["risk_type"],
            "quizAnswers": assessment.get("quiz_answers"),
            "idealPortfolio": assessment["ideal_portfolio"],
            "currentPortfolio": assessment["current_portfolio"],
            "difference": assessment["difference"],
            "summary": assessment["summary"],
            "educationalInsights": assessment["educational_insights"],
            "encouragement": assessment["encouragement"]
        }
        
    except Exception as e:
        print(f"Error retrieving risk assessment: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return None  # Return None on error instead of raising exception

@router.delete("/delete-risk-assessment/{user_id}")
def delete_risk_assessment(user_id: str, current_user: User = Depends(get_authorized_user)) -> Dict[str, str]:
    """Delete user's risk assessment data from database"""

    # SECURITY: Verify user can only delete their own data
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Get user ID from database
        user_email = f"{sanitize_storage_key(user_id)}@finnest.example.com"
        user_response = supabase.from_("users").select("id").eq("email", user_email).execute()

        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user_id_db = user_response.data[0]["id"]

        # Delete risk assessment
        supabase.from_("risk_assessments").delete().eq("user_id", user_id_db).execute()

        return {"message": "Risk assessment deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting risk assessment: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to delete risk assessment: {str(e)}")

# SIP Planner Models
class SIPGoal(BaseModel):
    id: str
    name: str
    priority: int
    timeYears: int
    goalType: str  # 'Short-Term', 'Mid-Term', 'Long-Term'
    amountRequiredToday: float
    amountAvailableToday: float
    goalInflation: float
    stepUp: float
    amountRequiredFuture: Optional[float] = None
    sipRequired: Optional[float] = None
    sipCalculated: bool = False

class SIPCalculation(BaseModel):
    goalName: str
    monthlySip: float

class SIPPlannerData(BaseModel):
    userId: str
    userEmail: Optional[str] = None  # User's actual email from Supabase auth
    goals: List[SIPGoal]
    sipCalculations: Optional[List[SIPCalculation]] = None

class SIPPlannerResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# SIP Planner Endpoints
@router.post("/save-sip-planner")
def save_sip_planner(data: SIPPlannerData, current_user: User = Depends(get_authorized_user)) -> SIPPlannerResponse:
    """Save user's SIP planner goals and calculations to database"""

    # SECURITY: Verify user can only save their own data
    data.userId = sanitize_user_id(data.userId)
    verify_user_ownership(current_user, data.userId)

    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Use the user ID from auth
        user_id_db = data.userId

        # Ensure user exists in public.users table (for foreign key constraint)
        # Check if user exists
        user_check = supabase.from_("users").select("id").eq("id", user_id_db).execute()

        if not user_check.data or len(user_check.data) == 0:
            # User doesn't exist in public.users, create entry
            user_data = {
                "id": user_id_db,
                "email": data.userEmail if data.userEmail else f"user_{user_id_db}@temp.com",
                "created_at": "now()",
                "updated_at": "now()"
            }
            try:
                supabase.from_("users").insert(user_data).execute()
            except Exception as insert_error:
                # User might have been created by another request, ignore duplicate key errors
                print(f"User insert warning (may be duplicate): {insert_error}")

        # Prepare SIP planner data
        sip_planner_data = {
            "user_id": user_id_db,
            "goals": [goal.dict() for goal in data.goals],
            "sip_calculations": [calc.dict() for calc in data.sipCalculations] if data.sipCalculations else None
        }

        # Check if SIP planner data already exists for this user
        existing_response = supabase.from_("sip_planner_data").select("id").eq("user_id", user_id_db).execute()

        if existing_response.data and len(existing_response.data) > 0:
            # Update existing record
            planner_id = existing_response.data[0]["id"]
            supabase.from_("sip_planner_data").update(sip_planner_data).eq("id", planner_id).execute()
            message = "SIP planner data updated successfully"
        else:
            # Create new record
            supabase.from_("sip_planner_data").insert(sip_planner_data).execute()
            message = "SIP planner data saved successfully"

        # CRITICAL: Also save goals to the goals table for portfolio alignment
        # This allows portfolio page to show goals in dropdowns and track progress
        print(f"[save-sip-planner] Saving {len(data.goals)} goals to goals table for portfolio alignment...")

        for goal in data.goals:
            # Only save calculated goals (sipCalculated = true)
            if goal.sipCalculated:
                goal_data = {
                    "user_id": user_id_db,
                    "name": goal.name,
                    "amount": goal.amountRequiredFuture or goal.amountRequiredToday,
                    "years": goal.timeYears,
                    "goal_type": goal.goalType.lower().replace('-', '_'),  # "Short-Term" → "short_term"
                    "amount_available_today": goal.amountAvailableToday,
                    "amount_required_future": goal.amountRequiredFuture,
                    "goal_inflation": goal.goalInflation,
                    "step_up_percentage": goal.stepUp,
                    "sip_required": goal.sipRequired,
                    "priority": goal.priority,
                    "personal_info_id": None  # Nullable as per migration 016
                }

                # Check if goal already exists (match by user_id + name)
                existing_goal = supabase.from_("goals").select("id").eq("user_id", user_id_db).eq("name", goal.name).execute()

                if existing_goal.data and len(existing_goal.data) > 0:
                    # Update existing goal
                    goal_id = existing_goal.data[0]["id"]
                    supabase.from_("goals").update(goal_data).eq("id", goal_id).execute()
                    print(f"[save-sip-planner] Updated goal in goals table: {goal.name}")
                else:
                    # Insert new goal
                    supabase.from_("goals").insert(goal_data).execute()
                    print(f"[save-sip-planner] Inserted new goal in goals table: {goal.name}")

        return SIPPlannerResponse(
            success=True,
            message=message,
            data={"user_id": user_id_db}
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error saving SIP planner data: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to save SIP planner data: {str(e)}")

@router.get("/get-sip-planner/{user_id}")
def get_sip_planner(user_id: str, current_user: User = Depends(get_authorized_user)) -> Optional[Dict[str, Any]]:
    """Retrieve user's SIP planner data from database"""

    # SECURITY: Verify user can only access their own data
    user_id = sanitize_user_id(user_id)
    verify_user_ownership(current_user, user_id)

    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not initialized")

        # Use the user ID directly - no need to look up by email
        user_id_db = user_id

        # Get SIP planner data
        planner_response = supabase.from_("sip_planner_data").select("*").eq("user_id", user_id_db).execute()

        if not planner_response.data or len(planner_response.data) == 0:
            return None  # No SIP planner data found

        planner_data = planner_response.data[0]

        # Format response
        return {
            "goals": planner_data["goals"],
            "sipCalculations": planner_data.get("sip_calculations")
        }

    except Exception as e:
        print(f"Error retrieving SIP planner data: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return None  # Return None on error instead of raising exception
