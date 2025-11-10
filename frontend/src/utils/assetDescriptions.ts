// Asset field descriptions and tooltips

export interface AssetDescription {
  label: string;
  description: string;
  example?: string;
}

export const illiquidAssetDescriptions: Record<string, AssetDescription> = {
  home: {
    label: "Home",
    description: "The current market value of your primary residential property. This is an illiquid asset as it cannot be quickly converted to cash.",
    example: "If your home is worth ₹50 lakhs, enter 5000000"
  },
  other_real_estate: {
    label: "Other Real Estate",
    description: "Market value of additional properties like rental properties, land, commercial real estate, or vacation homes.",
    example: "Rental apartment worth ₹30 lakhs = 3000000"
  },
  jewellery: {
    label: "Jewellery",
    description: "Total value of gold, diamond, and other precious metal jewelry you own. Use current market rates for valuation.",
    example: "Gold jewelry worth ₹5 lakhs = 500000"
  },
  sgb: {
    label: "Sovereign Gold Bonds (SGB)",
    description: "Government-issued bonds denominated in grams of gold. These are safer than physical gold and earn interest.",
    example: "SGB worth ₹2 lakhs = 200000"
  },
  ulips: {
    label: "ULIPs",
    description: "Unit Linked Insurance Plans - investment-cum-insurance products. Enter the current surrender value or fund value.",
    example: "ULIP fund value of ₹3 lakhs = 300000"
  },
  epf_ppf_vpf: {
    label: "EPF / PPF / VPF",
    description: "Employee Provident Fund, Public Provident Fund, and Voluntary Provident Fund. Long-term retirement savings with tax benefits and guaranteed returns.",
    example: "Total EPF+PPF balance of ₹10 lakhs = 1000000"
  },
};

export const liquidAssetDescriptions: Record<string, AssetDescription> = {
  fixed_deposit: {
    label: "Fixed Deposit",
    description: "Bank fixed deposits (FDs) or corporate deposits. These offer guaranteed returns and can be broken prematurely if needed.",
    example: "FDs totaling ₹5 lakhs = 500000"
  },
  debt_funds: {
    label: "Debt Funds",
    description: "Mutual funds that invest in fixed-income securities like bonds, treasury bills, and corporate debt. Lower risk than equity funds.",
    example: "Debt mutual funds worth ₹2 lakhs = 200000"
  },
  domestic_stock_market: {
    label: "Domestic Stock Market",
    description: "Direct equity investments in Indian stock market - individual stocks you own. Enter current market value.",
    example: "Stocks worth ₹4 lakhs = 400000"
  },
  domestic_equity_mutual_funds: {
    label: "Domestic Equity Mutual Funds",
    description: "Equity mutual funds that invest in Indian stock markets. These offer diversification and professional management.",
    example: "Equity fund value of ₹6 lakhs = 600000"
  },
  cash_from_equity_mutual_funds: {
    label: "Cash from Equity Mutual Funds",
    description: "Liquid/overnight mutual funds and money market funds. These are highly liquid and offer better returns than savings accounts.",
    example: "Liquid funds worth ₹1 lakh = 100000"
  },
  us_equity: {
    label: "US Equity",
    description: "Investments in US stock markets through direct stocks, US mutual funds, or ETFs. Provides international diversification.",
    example: "US stocks/funds worth ₹3 lakhs = 300000"
  },
  liquid_savings_cash: {
    label: "Liquid Savings & Cash",
    description: "Money in savings bank accounts, current accounts, and physical cash. Highly liquid but earns minimal returns.",
    example: "Total savings account balance ₹2 lakhs = 200000"
  },
  gold_etf_digital_gold: {
    label: "Gold ETF / Digital Gold",
    description: "Gold Exchange Traded Funds and digital gold. Easier to buy/sell than physical gold without storage concerns.",
    example: "Gold ETF worth ₹1.5 lakhs = 150000"
  },
  crypto: {
    label: "Cryptocurrency",
    description: "Digital assets like Bitcoin, Ethereum, etc. High risk and high volatility investments. Enter current market value.",
    example: "Crypto holdings worth ₹50,000 = 50000"
  },
  reits: {
    label: "REITs",
    description: "Real Estate Investment Trusts - companies that own/operate income-generating real estate. Traded like stocks, provide rental income.",
    example: "REIT investment of ₹2 lakhs = 200000"
  },
};

export const liabilityDescriptions: Record<string, AssetDescription> = {
  home_loan: {
    label: "Home Loan",
    description: "Outstanding principal amount on your home loan / mortgage. Do not include future interest, only the remaining principal.",
    example: "If ₹40 lakhs principal remaining = 4000000"
  },
  education_loan: {
    label: "Education Loan",
    description: "Outstanding amount on education loans taken for yourself or your children's higher education.",
    example: "Education loan balance of ₹10 lakhs = 1000000"
  },
  car_loan: {
    label: "Car Loan",
    description: "Outstanding principal on auto/vehicle loans. Include all vehicle loans currently active.",
    example: "Car loan balance of ₹5 lakhs = 500000"
  },
  personal_gold_loan: {
    label: "Personal / Gold Loan",
    description: "Personal loans, gold loans, or any other unsecured loans. These typically have higher interest rates.",
    example: "Personal loan of ₹2 lakhs = 200000"
  },
  credit_card: {
    label: "Credit Card Debt",
    description: "Outstanding credit card balances that you carry forward. Enter the total outstanding amount across all cards.",
    example: "Credit card dues of ₹50,000 = 50000"
  },
  other_liabilities: {
    label: "Other Liabilities",
    description: "Any other debts or liabilities like business loans, loans from family/friends, or other financial obligations.",
    example: "Other debts totaling ₹1 lakh = 100000"
  },
};

// Helper function to format field names
export const formatFieldName = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
