# Changelog

All notable changes to FinEdge360 will be documented in this file.

## [2.1.0] - 2024-12-09

### Enhanced - 4 FIRE Scenarios (Top USP)

#### Visual & UX Improvements
- **Main Heading Transformation**
  - Enhanced title with vibrant gradient effect (orange → red → pink)
  - Increased font size to 4xl for better prominence
  - Added compelling tagline: "Discover Your Path to Financial Freedom"
  - Added descriptive subtitle explaining the four personalized scenarios
  - Removed technical subtitle for cleaner, more user-friendly presentation

- **Individual Scenario Cards - Premium Design**
  - Each scenario now features distinct color themes:
    - Scenario 1 (Retire NOW): Orange/Amber gradient theme
    - Scenario 2 (When Can I RETIRE): Blue/Cyan gradient theme
    - Scenario 3 (SUPPOSE I RETIRE at X): Purple/Pink gradient theme
    - Scenario 4 (My ACTUAL FIRE at 60): Green/Emerald gradient theme
  - Added hover effects with shadow elevation and lift animation
  - Implemented colored gradient headers for each card
  - Increased icon size to 2xl for better visual impact
  - Added 2px colored borders matching each scenario theme

- **User-Centric Scenario Titles**
  - Scenario 1: "What if I RETIRE NOW?" - Connects to immediate freedom desire
  - Scenario 2: "When Can I RETIRE?" - Addresses countdown to freedom
  - Scenario 3: "SUPPOSE I RETIRE at X?" - Enables dream age exploration
  - Scenario 4: "My ACTUAL FIRE at 60" - Provides security scorecard

#### Educational Tooltips (Plain English Explanations)
- **Scenario 1 Tooltip**: Explains Coast FIRE concept - "Can I stop working right now and maintain my lifestyle?"
- **Scenario 2 Tooltip**: Describes retirement timeline calculation with increasing savings
- **Scenario 3 Tooltip**: Explains the "What-If" scenario for target retirement age
- **Scenario 4 Tooltip**: Details the realistic traditional retirement scenario

### Enhanced - FIREPlanner Page

#### Goal Planning Tab Improvements
- **Title Enhancement**
  - Renamed "Your 3 FIRE Scenarios" to "Your NEW FIRE"
  - Applied gradient text effect (purple → pink → red)
  - Updated tagline to "Advanced Retirement Scenarios with Optimized Investment Returns"

- **Feature Reorganization**
  - Moved Illiquid Assets toggle from above scenarios to below title
  - Created prominent purple gradient toggle box
  - Added CAGR slider (6-18%, default 12%) exclusively to Premium NEW FIRE scenario
  - Removed redundant checkbox for illiquid assets

- **Navigation Improvements**
  - Made "Next Step" buttons always visible (removed conditional logic)
  - Step 1 → Step 2: Blue gradient pulsing button
  - Step 2 → Step 3: Purple gradient pulsing button
  - Added animated chevron icons with bounce effect

### Enhanced - FIRECalculator Page

#### Feature Cleanup
- Removed Illiquid Assets toggle (moved to FIREPlanner)
- Removed CAGR sliders from Scenarios 3 & 4 (feature exclusive to FIREPlanner)
- Cleaned up state management by removing unused variables

### Technical Improvements
- Added InfoTooltip component import to FIREPlanner
- Implemented dynamic CAGR calculation in Premium NEW FIRE scenario
- Enhanced card styling with Tailwind utility classes
- Improved component accessibility with proper ARIA labels

### User Experience
- **Emotional Connection**: Tooltips written in conversational language connecting to user aspirations
- **Visual Hierarchy**: Clear color-coding helps users distinguish between scenarios
- **Progressive Disclosure**: Always-visible navigation reduces confusion about multi-step process
- **Premium Differentiation**: CAGR slider exclusive to FIREPlanner creates upgrade incentive

---

## [2.0.0] - 2024-12-08

### Added
- 3-4 comprehensive FIRE scenarios with dynamic liquid/illiquid asset toggle
- Premium "Your NEW FIRE Number" feature in Profile page and PDF reports
- Sequential milestone completion with navigation and validation
- AlertDialog component for milestone flow control
- Previous/Next milestone navigation buttons

### Enhanced
- Premium value differentiation across access code unlock screens
- Contact footer with support information
- Value proposition messaging replacing countdown timers

### Fixed
- PDF export error: newFireNumber variable naming issue (pdfExport.ts:194)

---

## Previous Versions
See git history for earlier changes.
