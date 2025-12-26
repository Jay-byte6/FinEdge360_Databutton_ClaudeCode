import ast

tree = ast.parse(open('app/apis/portfolio/__init__.py').read())
funcs = [n.name for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
print(f'Total functions: {len(funcs)}')
print('\nAll functions found:')
for f in funcs:
    print(f'  - {f}')

print('\nLooking for our new functions:')
print(f'  assign_holding_to_goal: {"FOUND" if "assign_holding_to_goal" in funcs else "NOT FOUND"}')
print(f'  get_goal_investment_summary: {"FOUND" if "get_goal_investment_summary" in funcs else "NOT FOUND"}')
