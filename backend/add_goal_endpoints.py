"""
Script to add goal assignment endpoints to portfolio API
"""

ENDPOINTS_CODE = '''

# =======================
# GOAL ASSIGNMENT ENDPOINTS
# =======================

class AssignGoalRequest(BaseModel):
    """Request model for assigning a holding to a goal"""
    goal_id: Optional[str] = None


def detect_asset_class(scheme_name: str) -> str:
    """
    Detect asset class from mutual fund scheme name
    Returns: Equity, Debt, Hybrid, Gold, or Liquid
    """
    scheme_lower = scheme_name.lower()

    # Gold funds
    if 'gold' in scheme_lower:
        return 'Gold'

    # Liquid funds
    if any(word in scheme_lower for word in ['liquid', 'overnight', 'ultra short']):
        return 'Liquid'

    # Debt funds
    debt_keywords = [
        'debt', 'bond', 'income', 'gilt', 'treasury', 'corporate bond',
        'banking', 'psu', 'credit', 'duration', 'dynamic bond', 'money market'
    ]
    if any(keyword in scheme_lower for keyword in debt_keywords):
        return 'Debt'

    # Hybrid funds
    hybrid_keywords = [
        'hybrid', 'balanced', 'aggressive', 'conservative', 'dynamic asset',
        'multi asset', 'equity savings'
    ]
    if any(keyword in scheme_lower for keyword in hybrid_keywords):
        return 'Hybrid'

    # Equity funds (default if no match)
    equity_keywords = [
        'equity', 'stock', 'elss', 'large cap', 'mid cap', 'small cap',
        'multi cap', 'flexi cap', 'focused', 'dividend', 'growth', 'value',
        'index', 'nifty', 'sensex', 'sector', 'thematic'
    ]
    if any(keyword in scheme_lower for keyword in equity_keywords):
        return 'Equity'

    # Default to Equity if unclear
    return 'Equity'


@router.patch("/portfolio-holdings/{holding_id}/assign-goal")
async def assign_holding_to_goal(holding_id: str, request: AssignGoalRequest):
    """
    Assign a portfolio holding to a specific financial goal
    Also auto-detects and updates the asset class
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        # Fetch the holding
        holding_response = supabase.table('portfolio_holdings').select('*').eq('id', holding_id).single().execute()

        if not holding_response.data:
            raise HTTPException(status_code=404, detail="Holding not found")

        holding = holding_response.data

        # If assigning to a goal, verify goal exists and belongs to same user
        if request.goal_id:
            goal_response = supabase.table('fire_goals').select('user_id').eq('id', request.goal_id).single().execute()

            if not goal_response.data:
                raise HTTPException(status_code=404, detail="Goal not found")

            if goal_response.data['user_id'] != holding['user_id']:
                raise HTTPException(status_code=403, detail="Goal does not belong to the same user")

        # Auto-detect asset class from scheme name
        asset_class = detect_asset_class(holding['scheme_name'])

        # Update holding with goal_id and asset_class
        update_data = {
            'goal_id': request.goal_id,
            'asset_class': asset_class,
            'updated_at': datetime.now().isoformat()
        }

        update_response = supabase.table('portfolio_holdings').update(update_data).eq('id', holding_id).execute()

        return {
            'success': True,
            'message': 'Goal assignment updated successfully',
            'holding': update_response.data[0] if update_response.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Assign Goal] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/goal-investment-summary/{user_id}")
async def get_goal_investment_summary(user_id: str):
    """
    Get investment summary for all user's goals with assigned holdings
    Returns progress, asset allocation, and holdings for each goal
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Database not configured")

        # Fetch all goals for user
        goals_response = supabase.table('fire_goals').select('*').eq('user_id', user_id).eq('is_active', True).execute()

        if not goals_response.data:
            return {
                'goals': [],
                'total_holdings': 0,
                'assigned_holdings': 0
            }

        goals = goals_response.data

        # Fetch all active holdings for user
        holdings_response = supabase.table('portfolio_holdings').select('*').eq('user_id', user_id).eq('is_active', True).execute()

        holdings = holdings_response.data or []
        total_holdings = len(holdings)
        assigned_holdings = len([h for h in holdings if h.get('goal_id')])

        # Process each goal
        goal_summaries = []

        for goal in goals:
            # Filter holdings for this goal
            goal_holdings = [h for h in holdings if h.get('goal_id') == goal['id']]

            # Calculate totals
            total_invested = sum(h['cost_value'] for h in goal_holdings)
            total_current = sum(h['market_value'] for h in goal_holdings)
            total_profit = total_current - total_invested

            # Asset breakdown
            asset_breakdown = {}
            asset_breakdown_pct = {}

            for holding in goal_holdings:
                asset_class = holding.get('asset_class', 'Equity')
                asset_breakdown[asset_class] = asset_breakdown.get(asset_class, 0) + holding['market_value']

            # Calculate percentages
            if total_current > 0:
                for asset_class, value in asset_breakdown.items():
                    asset_breakdown_pct[asset_class] = round((value / total_current) * 100, 1)

            # Calculate recommended allocation based on timeline
            target_year = goal.get('target_year', datetime.now().year + 10)
            current_year = datetime.now().year
            years_to_goal = max(0, target_year - current_year)

            # Timeline-based allocation
            if years_to_goal >= 10:
                recommended_allocation = {'Equity': 80, 'Debt': 15, 'Gold': 5}
            elif years_to_goal >= 5:
                recommended_allocation = {'Equity': 60, 'Debt': 30, 'Gold': 10}
            elif years_to_goal >= 3:
                recommended_allocation = {'Equity': 40, 'Debt': 50, 'Gold': 10}
            else:
                recommended_allocation = {'Equity': 20, 'Debt': 70, 'Gold': 10}

            # Progress calculation
            target_amount = goal.get('target_amount', 0)
            progress_percentage = (total_current / target_amount * 100) if target_amount > 0 else 0
            gap_amount = max(0, target_amount - total_current)
            is_on_track = progress_percentage >= (100 - (years_to_goal / target_year * 100)) if target_year > current_year else progress_percentage >= 100

            # Build holdings list with calculated fields
            holdings_data = []
            for h in goal_holdings:
                holdings_data.append({
                    'id': h['id'],
                    'scheme_name': h['scheme_name'],
                    'folio_number': h['folio_number'],
                    'asset_class': h.get('asset_class', 'Equity'),
                    'units': h['unit_balance'],
                    'cost_value': h['cost_value'],
                    'market_value': h['market_value'],
                    'profit': h['market_value'] - h['cost_value'],
                    'return_pct': ((h['market_value'] - h['cost_value']) / h['cost_value'] * 100) if h['cost_value'] > 0 else 0
                })

            goal_summaries.append({
                'goal_id': goal['id'],
                'goal_name': goal['goal_name'],
                'target_amount': target_amount,
                'target_year': target_year,
                'years_to_goal': years_to_goal,
                'holdings': holdings_data,
                'totals': {
                    'invested': total_invested,
                    'current_value': total_current,
                    'profit': total_profit,
                    'holdings_count': len(goal_holdings)
                },
                'asset_breakdown': asset_breakdown,
                'asset_breakdown_pct': asset_breakdown_pct,
                'recommended_allocation': recommended_allocation,
                'progress': {
                    'percentage': round(progress_percentage, 2),
                    'gap_amount': gap_amount,
                    'is_on_track': is_on_track
                }
            })

        return {
            'goals': goal_summaries,
            'total_holdings': total_holdings,
            'assigned_holdings': assigned_holdings
        }

    except Exception as e:
        print(f"[Goal Investment Summary] Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

'''

def main():
    file_path = 'app/apis/portfolio/__init__.py'

    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find insertion point (before "# Export router")
    insertion_index = -1
    for i, line in enumerate(lines):
        if '# Export router' in line:
            insertion_index = i
            break

    if insertion_index == -1:
        print("ERROR: Could not find '# Export router' comment")
        return

    # Insert the new code
    lines.insert(insertion_index, ENDPOINTS_CODE)

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"[OK] Successfully added goal endpoints to {file_path}")
    print(f"[OK] Inserted at line {insertion_index}")
    print(f"[OK] New total lines: {len(lines)}")

if __name__ == '__main__':
    main()
