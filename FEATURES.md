# FinEdge360 Features Documentation

## Core Features

### 🔥 4 FIRE Scenarios (Top USP)

The flagship feature of FinEdge360 - four personalized retirement scenarios that show users exactly when and how they can achieve Financial Independence.

#### Scenario 1: What if I RETIRE NOW? 🏖️
**Theme**: Orange/Amber gradient
**Purpose**: Coast FIRE scenario - Tests if user can retire immediately

**What it shows**:
- Money needed to survive until retirement age
- Current net worth vs requirement
- Shortfall gap or confirmation of readiness
- Years of survival with current assets

**Calculation Method**:
- Assumes 6% investment returns (matching inflation)
- No additional income or savings
- Covers expenses from current age to retirement age (default 60)

**User Value**: Answers "Can I stop working RIGHT NOW and still be okay?"

---

#### Scenario 2: When Can I RETIRE? ⏰
**Theme**: Blue/Cyan gradient
**Purpose**: Personalized retirement timeline calculator

**What it shows**:
- Exact age when user can achieve FIRE
- Years until financial independence
- Projected net worth at retirement
- Shortfall or surplus at target age

**Calculation Method**:
- Factors in growing savings (10% annual increase)
- Conservative 6% CAGR on investments
- Accounts for inflation-adjusted expenses
- Step-up income modeling

**User Value**: Provides the countdown to freedom - "When will I never have to work again?"

---

#### Scenario 3: SUPPOSE I RETIRE at X? 🎯
**Theme**: Purple/Pink gradient
**Purpose**: "What-If" early retirement scenario

**What it shows**:
- FIRE requirement at user's target age
- Projected wealth at that age
- Shortfall gap or surplus
- Extra SIP needed to close the gap

**Calculation Method**:
- User sets custom retirement age (default 50)
- Calculates wealth with step-up savings
- Compares against FIRE number at that age
- Shows actionable SIP adjustment

**User Value**: Reality-checks dream retirement age - "Can I really retire at 50?"

---

#### Scenario 4: My ACTUAL FIRE at 60 💰
**Theme**: Green/Emerald gradient
**Purpose**: Traditional retirement scenario with full analysis

**What it shows**:
- FIRE number at age 60
- Projected total wealth at 60
- Shortfall or surplus amount
- Bonus: 10% lifestyle cut analysis

**Calculation Method**:
- Most realistic projection
- Accounts for inflation over full period
- Includes step-up savings growth
- Provides reduced FIRE option

**User Value**: Peace of mind number - "Will I have enough at traditional retirement age?"

---

### 🚀 Your NEW FIRE (FIREPlanner Premium)

Advanced retirement planning in the Goal Planning tab with optimized investment returns.

#### Key Features:
1. **Coast FIRE - Retire NOW**: Stop working, let investments grow at 5%
2. **Conservative FIRE**: Safe retirement with balanced growth
3. **Premium NEW FIRE** ⭐:
   - Adjustable CAGR slider (6-18%, default 12%)
   - Real-time years-to-FIRE updates
   - Optimized SIP strategy with step-ups
   - Shows exact age of financial freedom

#### Unique Capabilities:
- **Illiquid Assets Toggle**: Include/exclude real estate and gold
- **Dynamic CAGR Adjustment**: See impact of different return rates
- **Always-Visible Navigation**: Seamless progression through 3 steps
- **Premium Badge**: Visual differentiation for advanced features

---

### 📊 Net Worth Tracking

**Location**: Net Worth page
**Features**:
- Comprehensive asset categorization
- Liquid vs Illiquid asset breakdown
- Real-time net worth calculation
- Historical tracking (if enabled)

**Asset Categories**:
- **Liquid Assets**: Savings, MFs, Stocks, PF, PPF, Bonds, FD, Gold ETF
- **Illiquid Assets**: Home value, Real estate, Physical gold/jewelry

---

### 🎯 Goal-Based Investment Planning

**Location**: FIREPlanner page
**3-Step Process**:

#### Step 1: Set Goals
- Add multiple financial goals (Short/Mid/Long-term)
- Define amount needed, timeframe, inflation rate
- Calculate required SIP for each goal
- Priority-based goal management

#### Step 2: Asset Allocation
- Choose risk profile (Conservative/Moderate/Aggressive)
- Set allocation across Equity/Debt/Gold
- Customizable for each goal type
- Suggested allocations provided

#### Step 3: Goal Planning
- Complete SIP breakdown by asset class
- Month-by-month investment plan
- Capacity vs requirement analysis
- Export-ready investment roadmap

---

### 📈 Tax Planning

**Location**: Tax Planning page
**Features**:
- Income tax calculation
- 80C deductions optimization
- Section-wise tax saving suggestions
- Old vs New regime comparison

---

### 💼 Portfolio Overview

**Location**: Portfolio page
**Features**:
- Asset allocation visualization
- Diversification analysis
- Rebalancing recommendations
- Performance tracking

---

### 🗺️ FIRE Journey Map

**Location**: Journey page
**Features**:
- 7 milestone roadmap to FIRE
- Sequential milestone completion
- Progress tracking
- Visual journey representation

**Milestones**:
1. Calculate Net Worth
2. FIRE Calculator
3. Tax Planning
4. Portfolio Analysis
5. Set Financial Goals
6. Asset Allocation
7. SIP Planning

**Validation**: Must complete previous milestone before moving to next

---

### 📄 Profile & Reports

**Location**: Profile page
**Features**:
- Personal information management
- PDF financial report generation
- "Your NEW FIRE Number" premium feature
- Downloadable comprehensive analysis

---

### 🔐 Access Control

**Premium Features**:
- FIREPlanner (Access code: FIREDEMO)
- Advanced FIRE calculations
- Goal-based planning
- PDF reports with NEW FIRE number

**Value Proposition**:
- 100% discount messaging (removed countdown timers)
- Multiple value benefit screens
- Clear feature differentiation
- Contact support footer

---

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom gradients
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion, Tailwind animations

### Backend
- **Framework**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: RESTful endpoints

### Key Files
- `frontend/src/pages/FIRECalculator.tsx`: 4 FIRE scenarios implementation
- `frontend/src/pages/FIREPlanner.tsx`: Goal-based planning with NEW FIRE
- `frontend/src/utils/financialCalculations.ts`: Core calculation logic
- `frontend/src/utils/pdfExport.ts`: PDF report generation
- `frontend/src/components/journey/MilestoneCompletionCard.tsx`: Journey tracking

---

## User Experience Highlights

### Emotional Connection
- Conversational tooltips in plain English
- Question-based scenario titles ("What if...", "When can I...")
- Aspirational language ("freedom", "dream", "peace of mind")

### Visual Design
- Gradient color themes for each scenario
- Hover animations with lift effect
- Consistent iconography
- Clear visual hierarchy

### Progressive Disclosure
- Always-visible navigation buttons
- Step-by-step guidance
- Inline help with tooltips
- Contextual information display

### Premium Differentiation
- Exclusive features in FIREPlanner
- Visual badges for premium content
- CAGR slider only in premium scenarios
- Advanced calculations in Goal Planning
