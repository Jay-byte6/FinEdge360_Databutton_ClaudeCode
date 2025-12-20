"""
CAMS Statement Parser
Parses PDF and Excel CAMS statements to extract mutual fund holdings
"""

import pdfplumber
import pandas as pd
import re
import traceback
from typing import List, Dict, Any, Optional
from datetime import datetime
from fuzzywuzzy import fuzz, process
import os
from supabase import create_client
import dotenv

# Load environment variables
dotenv.load_dotenv()

# Supabase client for scheme mapping lookups
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


# =======================
# HELPER FUNCTIONS
# =======================

def clean_number(value: Any) -> float:
    """
    Clean and convert string number to float
    Handles rupee symbols, commas, and whitespace
    """
    if value is None or value == '' or value == '-':
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    # Remove rupee symbols, commas, and whitespace
    cleaned = str(value).replace('₹', '').replace(',', '').replace(' ', '').strip()

    # Handle negative numbers in parentheses
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]

    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_folio_number(text: str) -> Optional[str]:
    """
    Extract folio number from text (8-12 digits pattern)
    """
    if not text:
        return None

    # Pattern: 8-12 consecutive digits
    match = re.search(r'\b\d{8,12}\b', str(text))
    return match.group(0) if match else None


def clean_scheme_name(name: str) -> str:
    """
    Clean and normalize scheme name
    """
    if not name:
        return ""

    # Remove extra whitespace
    cleaned = ' '.join(name.split())

    # Remove common suffixes that vary
    suffixes_to_remove = [
        ' - Growth',
        ' - Direct Plan',
        ' - Regular Plan',
        ' - IDCW',
        ' - Dividend',
        'Growth Option',
        'Direct Growth',
        'Regular Growth'
    ]

    for suffix in suffixes_to_remove:
        cleaned = cleaned.replace(suffix, '')

    return cleaned.strip()


def get_scheme_code(scheme_name: str, amc_name: str = None) -> str:
    """
    Get MFAPI scheme code for a scheme name using fuzzy matching

    Args:
        scheme_name: Scheme name from CAMS
        amc_name: AMC name (optional, for better matching)

    Returns:
        MFAPI scheme code or 'UNKNOWN'
    """
    if not supabase:
        print("[Parser] Warning: Supabase not initialized, cannot map scheme codes")
        return "UNKNOWN"

    try:
        # Clean scheme name for better matching
        cleaned_name = clean_scheme_name(scheme_name)

        # Try exact match first
        result = supabase.table('scheme_mappings').select('scheme_code').eq('scheme_name', scheme_name).execute()

        if result.data and len(result.data) > 0:
            # Update usage count
            supabase.table('scheme_mappings').update({
                'usage_count': supabase.rpc('increment_usage', {'id': result.data[0].get('id')})
            }).eq('scheme_name', scheme_name).execute()

            return result.data[0]['scheme_code']

        # Fuzzy match against existing mappings
        all_schemes = supabase.table('scheme_mappings').select('scheme_name, scheme_code').execute()

        if all_schemes.data:
            scheme_names = [s['scheme_name'] for s in all_schemes.data]
            best_match = process.extractOne(cleaned_name, scheme_names, scorer=fuzz.token_sort_ratio)

            if best_match and best_match[1] >= 80:  # 80% match threshold
                matched_scheme = next(s for s in all_schemes.data if s['scheme_name'] == best_match[0])

                # Insert as new mapping for this exact name
                supabase.table('scheme_mappings').insert({
                    'scheme_name': scheme_name,
                    'scheme_code': matched_scheme['scheme_code'],
                    'amc_name': amc_name,
                    'is_verified': False,
                    'usage_count': 1
                }).execute()

                return matched_scheme['scheme_code']

        # No match found - return UNKNOWN and log for manual mapping
        print(f"[Parser] Unknown scheme: {scheme_name} (AMC: {amc_name or 'N/A'})")
        return "UNKNOWN"

    except Exception as e:
        print(f"[Parser] Error getting scheme code: {str(e)}")
        return "UNKNOWN"


# =======================
# PDF PARSER
# =======================

def parse_cams_pdf(file_path: str, password: str = None) -> List[Dict[str, Any]]:
    """
    Parse CAMS PDF statement to extract holdings

    Args:
        file_path: Path to PDF file
        password: Password for protected PDFs (optional)

    Returns:
        List of holding dictionaries
    """
    holdings = []
    current_folio = None
    current_amc = None

    try:
        # Open PDF with password if provided
        with pdfplumber.open(file_path, password=password) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                print(f"[PDF Parser] Processing page {page_num}/{len(pdf.pages)}")

                # Extract text and tables
                text = page.extract_text()
                tables = page.extract_tables()

                # Look for AMC name in text
                amc_match = re.search(r'([A-Z][A-Za-z\s]+(?:Mutual Fund|Asset Management|AMC))', text)
                if amc_match:
                    current_amc = amc_match.group(1).strip()

                # Process tables
                for table in tables:
                    if not table or len(table) < 2:
                        continue

                    # Try to identify column headers
                    headers = table[0]
                    if not headers:
                        continue

                    # Look for key columns (case-insensitive)
                    folio_col = None
                    scheme_col = None
                    units_col = None
                    nav_col = None
                    cost_col = None
                    value_col = None

                    for i, header in enumerate(headers):
                        if header:
                            header_lower = str(header).lower()
                            if 'folio' in header_lower:
                                folio_col = i
                            elif 'scheme' in header_lower or 'fund' in header_lower:
                                scheme_col = i
                            elif 'unit' in header_lower or 'balance' in header_lower:
                                units_col = i
                            elif 'nav' in header_lower and 'date' not in header_lower:
                                nav_col = i
                            elif 'cost' in header_lower or 'invested' in header_lower:
                                cost_col = i
                            elif 'value' in header_lower or 'market' in header_lower:
                                value_col = i

                    # Parse data rows
                    for row in table[1:]:
                        if not row or len(row) == 0:
                            continue

                        # Extract folio number
                        if folio_col is not None and row[folio_col]:
                            folio = extract_folio_number(row[folio_col])
                            if folio:
                                current_folio = folio

                        # Extract scheme data
                        if scheme_col is not None and row[scheme_col]:
                            scheme_name = str(row[scheme_col]).strip()

                            # Skip if it's a header or empty
                            if not scheme_name or len(scheme_name) < 5:
                                continue

                            # Extract numeric values
                            units = clean_number(row[units_col]) if units_col is not None and len(row) > units_col else 0
                            nav = clean_number(row[nav_col]) if nav_col is not None and len(row) > nav_col else 0
                            cost = clean_number(row[cost_col]) if cost_col is not None and len(row) > cost_col else 0
                            value = clean_number(row[value_col]) if value_col is not None and len(row) > value_col else 0

                            # Validate required fields
                            if units > 0 and (nav > 0 or cost > 0 or value > 0):
                                # Calculate missing values
                                if nav == 0 and value > 0 and units > 0:
                                    nav = value / units

                                if cost == 0 and units > 0:
                                    # Use NAV as approximation if cost not available
                                    cost = value if value > 0 else (nav * units)

                                avg_cost = cost / units if units > 0 else 0

                                # Get scheme code
                                scheme_code = get_scheme_code(scheme_name, current_amc)

                                holding = {
                                    'folio_number': current_folio or 'UNKNOWN',
                                    'scheme_name': scheme_name,
                                    'scheme_code': scheme_code,
                                    'amc_name': current_amc,
                                    'unit_balance': units,
                                    'avg_cost_per_unit': avg_cost,
                                    'cost_value': cost,
                                    'current_nav': nav,
                                    'nav_date': datetime.now().date().isoformat(),  # Use today's date as fallback
                                }

                                holdings.append(holding)
                                print(f"[PDF Parser] Extracted: {scheme_name} ({units} units)")

        print(f"[PDF Parser] Total holdings extracted: {len(holdings)}")
        return holdings

    except Exception as e:
        error_msg = str(e) if str(e) else repr(e)
        error_type = type(e).__name__
        print(f"[PDF Parser] Error: {error_msg}")
        print(f"[PDF Parser] Error type: {error_type}")
        print(f"[PDF Parser] Full traceback:")
        traceback.print_exc()

        # Provide specific error messages for common issues
        if 'password' in error_msg.lower() or 'encrypted' in error_msg.lower():
            raise Exception("This PDF is password-protected. Please check the 'My PDF is password-protected' box and enter your password (usually your PAN in lowercase).")
        elif error_type == 'PDFPasswordIncorrect':
            raise Exception("Incorrect PDF password. CAMS PDFs are typically protected with your PAN number in lowercase.")
        else:
            raise Exception(f"Failed to parse PDF: {error_msg}")


# =======================
# EXCEL PARSER
# =======================

def parse_cams_excel(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse CAMS Excel statement to extract holdings

    Args:
        file_path: Path to Excel file

    Returns:
        List of holding dictionaries
    """
    holdings = []

    try:
        # Read Excel file
        df = pd.read_excel(file_path, sheet_name=0)

        print(f"[Excel Parser] Loaded {len(df)} rows")

        # Find header row (contains "Folio" or "Scheme")
        header_row = None
        for i, row in df.iterrows():
            row_str = ' '.join(str(x).lower() for x in row if pd.notna(x))
            if 'folio' in row_str or 'scheme' in row_str:
                header_row = i
                break

        if header_row is None:
            raise Exception("Could not find header row in Excel file")

        # Set headers
        df.columns = df.iloc[header_row]
        df = df.iloc[header_row + 1:].reset_index(drop=True)

        # Identify columns (case-insensitive)
        col_mapping = {}
        for col in df.columns:
            col_lower = str(col).lower()
            if 'folio' in col_lower:
                col_mapping['folio'] = col
            elif 'scheme' in col_lower or 'fund' in col_lower:
                col_mapping['scheme'] = col
            elif 'amc' in col_lower or 'house' in col_lower:
                col_mapping['amc'] = col
            elif 'unit' in col_lower or 'balance' in col_lower:
                col_mapping['units'] = col
            elif 'nav' in col_lower and 'date' not in col_lower:
                col_mapping['nav'] = col
            elif 'cost' in col_lower or 'invested' in col_lower:
                col_mapping['cost'] = col
            elif ('value' in col_lower or 'market' in col_lower) and 'cost' not in col_lower:
                col_mapping['value'] = col

        print(f"[Excel Parser] Column mapping: {col_mapping}")

        # Parse rows
        current_folio = None
        current_amc = None

        for _, row in df.iterrows():
            # Extract folio
            if 'folio' in col_mapping and pd.notna(row[col_mapping['folio']]):
                folio = extract_folio_number(str(row[col_mapping['folio']]))
                if folio:
                    current_folio = folio

            # Extract AMC
            if 'amc' in col_mapping and pd.notna(row[col_mapping['amc']]):
                current_amc = str(row[col_mapping['amc']]).strip()

            # Extract scheme
            if 'scheme' not in col_mapping or pd.isna(row[col_mapping['scheme']]):
                continue

            scheme_name = str(row[col_mapping['scheme']]).strip()

            if not scheme_name or len(scheme_name) < 5:
                continue

            # Extract numeric values
            units = clean_number(row[col_mapping['units']]) if 'units' in col_mapping else 0
            nav = clean_number(row[col_mapping['nav']]) if 'nav' in col_mapping else 0
            cost = clean_number(row[col_mapping['cost']]) if 'cost' in col_mapping else 0
            value = clean_number(row[col_mapping['value']]) if 'value' in col_mapping else 0

            # Validate and calculate
            if units > 0 and (nav > 0 or cost > 0 or value > 0):
                if nav == 0 and value > 0 and units > 0:
                    nav = value / units

                if cost == 0 and units > 0:
                    cost = value if value > 0 else (nav * units)

                avg_cost = cost / units if units > 0 else 0

                # Get scheme code
                scheme_code = get_scheme_code(scheme_name, current_amc)

                holding = {
                    'folio_number': current_folio or 'UNKNOWN',
                    'scheme_name': scheme_name,
                    'scheme_code': scheme_code,
                    'amc_name': current_amc,
                    'unit_balance': units,
                    'avg_cost_per_unit': avg_cost,
                    'cost_value': cost,
                    'current_nav': nav,
                    'nav_date': datetime.now().date().isoformat(),
                }

                holdings.append(holding)
                print(f"[Excel Parser] Extracted: {scheme_name} ({units} units)")

        print(f"[Excel Parser] Total holdings extracted: {len(holdings)}")
        return holdings

    except Exception as e:
        error_msg = str(e) if str(e) else repr(e)
        print(f"[Excel Parser] Error: {error_msg}")
        print(f"[Excel Parser] Error type: {type(e).__name__}")
        print(f"[Excel Parser] Full traceback:")
        traceback.print_exc()
        raise Exception(f"Failed to parse Excel: {error_msg}")


# Export functions
__all__ = ['parse_cams_pdf', 'parse_cams_excel', 'get_scheme_code']
