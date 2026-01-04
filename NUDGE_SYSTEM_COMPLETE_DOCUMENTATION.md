# NUDGE SYSTEM - COMPLETE DOCUMENTATION
## FIREMap User Engagement & Feedback System

**LAST UPDATED**: 2026-01-02
**STATUS**: ACTIVE REFERENCE DOCUMENT

---

## 📋 TABLE OF CONTENTS

1. [Running Offer Banner](#running-offer-banner)
2. [Milestone Nudge Pop-ups (Dynamic)](#milestone-nudge-pop-ups)
3. [Celebration Pop-ups (Event-Based)](#celebration-pop-ups)
4. [Feedback Nudge System](#feedback-nudge-system)
5. [Smart Nudge Logic](#smart-nudge-logic)
6. [User Control & Dismissal](#user-control--dismissal)

---

# RUNNING OFFER BANNER

## 🎯 Purpose
Promote prelaunch offer across all authenticated pages

## 📍 Location
**Component**: `frontend/src/components/AppProvider.tsx` (Lines 119-129)

## 🎨 Design
- **Position**: Sticky top banner
- **Animation**: Horizontal scrolling text (30s duration, infinite loop)
- **Colors**: Gradient from emerald-600 → teal-600 → emerald-600
- **Z-index**: 50 (always on top)

## 📝 Content
```
🎉 LIMITED TIME: Worth ₹9,999/year - 100% FREE for First 5,000 Users!
• Only 277 Spots Left
• SEBI Compliant
• Bank-Grade Security
• Join 4,723 Smart Investors Now! 🎉
```

## 📄 Pages Where Banner Shows
✅ **SHOWS ON:**
- Dashboard (`/dashboard`)
- FIRE Calculator (`/fire-calculator`)
- FIRE Planner (`/fire-planner`)
- Portfolio (`/portfolio`)
- Tax Planning (`/tax-planning`)
- Net Worth (`/net-worth`)
- Journey Maps (`/journey`, `/journey3d`, `/journey-map`)
- Profile (`/profile`)
- Consultation (`/consultation`)
- Enter Details (`/enter-details`)
- Pricing (`/pricing`)
- All other authenticated pages

❌ **HIDDEN ON:**
- Landing Page (`/`)
- Login Page (`/login`)

## 🔧 Implementation
```typescript
// AppProvider.tsx Line 36-37
const hideNavbarRoutes = ["/login", "/"];
const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

// Lines 119-129
{shouldShowNavbar && (
  <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white py-2 px-4 overflow-hidden z-50">
    <motion.div
      animate={{ x: ["100%", "-100%"] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="whitespace-nowrap text-sm md:text-base font-semibold"
    >
      {/* Banner text */}
    </motion.div>
  </div>
)}
```

## 🐛 Troubleshooting

**Issue**: Banner not showing
- **Cause**: Browser cache or z-index conflict
- **Fix**: Hard refresh (`Ctrl + Shift + R`)

**Issue**: Banner not scrolling
- **Cause**: Framer Motion not loaded
- **Fix**: Check console for errors, verify motion import

---

# MILESTONE NUDGE POP-UPS

## 🎯 Purpose
Guide users through 10-milestone journey to FIRE readiness

## 📍 Location
**Component**: `frontend/src/components/MilestoneNudgePopup.tsx`
**Hook**: `frontend/src/hooks/useJourneyNudge.ts`

## 🧠 Smart Display Logic

### Timing Rules:
1. **Cooldown**: 15 minutes between nudges
2. **Delay**: 5 seconds after page load
3. **Session Limit**: Maximum 3 nudges per 4-hour session
4. **Page-Specific**: Only shows nudges relevant to current page

### Page-to-Nudge Mapping:
```typescript
const ROUTE_NUDGE_RULES = {
  '/dashboard': {
    allowedMilestones: [1, 2, 8, 10], // High-level nudges only
    suppressMilestones: [3, 4, 5, 6, 7, 9]
  },
  '/enter-details': {
    allowedMilestones: [], // NO nudges - user is working
    suppressMilestones: [1-10] // All suppressed
  },
  '/fire-planner': {
    allowedMilestones: [], // NO nudges - user is planning
    suppressMilestones: [1-10]
  },
  '/fire-calculator': {
    allowedMilestones: [4, 9], // SIP plan or automation
    suppressMilestones: [1, 2, 3, 5, 6, 7, 8, 10]
  },
  '/portfolio': {
    allowedMilestones: [5, 6], // Risk or optimization
    suppressMilestones: [1, 2, 3, 4, 7, 8, 9, 10]
  },
  '/tax-planning': {
    allowedMilestones: [], // NO nudges - user is working
    suppressMilestones: [1-10]
  }
};
```

---

## 📊 ALL 10 MILESTONE NUDGES

### MILESTONE 1: Book Expert Consultation
- **Icon**: 🎓 Users
- **Title**: Book Free Expert Consultation
- **Description**: Get personalized guidance to set up goals and align holdings properly
- **Action Button**: "Book Your Free Expert Session"
- **Route**: `/consultation`
- **Color Gradient**: violet-500 → purple-500
- **Benefit**: Professional advice tailored to your situation
- **Time Estimate**: 30 minutes (call)
- **Shows On Pages**: Dashboard

---

### MILESTONE 2: Enter Financial Details
- **Icon**: 📊 TrendingUp
- **Title**: Enter Your Financial Details
- **Description**: Track your net worth to understand your financial starting point
- **Action Button**: "Enter Your Financial Details"
- **Route**: `/enter-details`
- **Color Gradient**: blue-500 → cyan-500
- **Benefit**: Know exactly where you stand financially
- **Time Estimate**: 5-10 minutes
- **Shows On Pages**: Dashboard, Net Worth

---

### MILESTONE 3: Set Your Goals
- **Icon**: 🎯 Target
- **Title**: Set Your Goals
- **Description**: Define your short, mid, and long-term financial objectives
- **Action Button**: "Set Financial Goals"
- **Route**: `/fire-planner?tab=set-goals`
- **Color Gradient**: green-500 → emerald-500
- **Benefit**: Clear roadmap for your financial future
- **Time Estimate**: 10-15 minutes
- **Shows On Pages**: Dashboard, Net Worth

---

### MILESTONE 4: Calculate FIRE Number
- **Icon**: 🔢 Calculator
- **Title**: Calculate Your FIRE Number
- **Description**: Discover how much you need to achieve financial independence
- **Action Button**: "Calculate FIRE Number"
- **Route**: `/fire-calculator`
- **Color Gradient**: orange-500 → amber-500
- **Benefit**: Your personalized path to early retirement
- **Time Estimate**: 5 minutes
- **Shows On Pages**: Dashboard, FIRE Calculator

---

### MILESTONE 5: Plan SIP Strategy
- **Icon**: 💰 PiggyBank
- **Title**: Plan Your SIP Strategy
- **Description**: Create a systematic investment plan to reach your goals
- **Action Button**: "Create SIP Plan"
- **Route**: `/fire-planner?tab=sip-plan`
- **Color Gradient**: purple-500 → pink-500
- **Benefit**: Automated wealth building on autopilot
- **Time Estimate**: 10 minutes
- **Shows On Pages**: Portfolio, FIRE Calculator

---

### MILESTONE 6: Assess Risk Profile
- **Icon**: 🛡️ Shield
- **Title**: Assess Your Risk Profile
- **Description**: Understand your investment risk tolerance and optimal portfolio mix
- **Action Button**: "Complete Risk Assessment"
- **Route**: `/portfolio`
- **Color Gradient**: indigo-500 → purple-500
- **Benefit**: Invest with confidence and peace of mind
- **Time Estimate**: 5 minutes
- **Shows On Pages**: Portfolio, Dashboard

---

### MILESTONE 7: Optimize Portfolio
- **Icon**: 📈 TrendingUp
- **Title**: Optimize Your Portfolio
- **Description**: Get personalized recommendations to maximize returns
- **Action Button**: "Review Portfolio Recommendations"
- **Route**: `/portfolio#portfolio-recommendations`
- **Color Gradient**: teal-500 → cyan-500
- **Benefit**: Better returns with lower risk
- **Time Estimate**: 10 minutes
- **Shows On Pages**: Portfolio

---

### MILESTONE 8: Master Tax Optimization
- **Icon**: 📋 FileText
- **Title**: Master Tax Optimization
- **Description**: Learn smart tax-saving strategies to keep more of your money
- **Action Button**: "Explore Tax Strategies"
- **Route**: `/tax-planning`
- **Color Gradient**: rose-500 → pink-500
- **Benefit**: Save lakhs in taxes legally
- **Time Estimate**: 15 minutes
- **Shows On Pages**: Dashboard, Profile

---

### MILESTONE 9: Automate Success Criteria
- **Icon**: 🚀 Rocket
- **Title**: Automate Success Criteria
- **Description**: Set up automated tracking for your financial goals
- **Action Button**: "Setup Success Tracking"
- **Route**: `/fire-planner?tab=sip-plan#success-criteria`
- **Color Gradient**: amber-500 → orange-500
- **Benefit**: Stay on track effortlessly
- **Time Estimate**: 5 minutes
- **Shows On Pages**: FIRE Calculator

---

### MILESTONE 10: Unlock Premium
- **Icon**: 🎉 CheckCircle2
- **Title**: Unlock Premium Features
- **Description**: Get lifetime access to advanced tools and insights
- **Action Button**: "Claim Your Free Premium"
- **Route**: `/premium-upgrade`
- **Color Gradient**: green-500 → emerald-500
- **Benefit**: ₹9,999 value - FREE for prelaunch users!
- **Time Estimate**: 2 minutes
- **Shows On Pages**: Dashboard, Profile

---

## 🎨 Nudge Pop-up Structure

### Header:
- Progress bar showing X/10 completed
- Milestone number badge
- "Your Next Step (Milestone X/10)" label

### Body:
- **Icon + Title**: Large colorful icon with milestone title
- **Description**: What this milestone is about
- **Benefits Section**:
  - "Why This Matters" - Benefit explanation
  - "Time Required" - Estimated time
- **Motivation Message**: Dynamic based on progress:
  - 0 completed: "🌟 Every journey starts with a single step!"
  - 1-4 completed: "💪 Great! X/10 done!"
  - 5-7 completed: "🔥 X to go!"
  - 8-9 completed: "🎯 X more for FREE Premium!"
  - 10 completed: "🎉 Journey complete!"

### Footer:
- **"Remind Later"** button (outline)
- **"Don't Show Again"** button (ghost, small text)
- **Main Action Button** (gradient, prominent)

---

# CELEBRATION POP-UPS

## 🎯 Purpose
Celebrate milestone completions with confetti and encouragement

## 📍 Location
**Component**: `frontend/src/components/MilestoneCelebration.tsx`

## 🎊 Trigger Events
Appears IMMEDIATELY after completing a milestone action:
1. Saved financial details → Milestone 2
2. Set goals → Milestone 3
3. Calculated FIRE → Milestone 4
4. Created SIP plan → Milestone 5
5. Completed risk assessment → Milestone 6
6. Optimized portfolio → Milestone 7
7. Saved tax plan → Milestone 8
8. Booked consultation → Milestone 9
9. (Milestone 10 is journey completion)

## 🎨 Design Elements

### Visual Effects:
- **Confetti animation** (3 seconds)
- **Trophy icon** with pulse animation
- **Progress badge**: Green "✓ X/10 Milestones Complete"

### Content Structure:

**Congratulations Message** (Examples):
- Milestone 2: "📊 Financial details entered!"
- Milestone 3: "🎯 Goals set! Roadmap created!"
- Milestone 7: "📋 Tax master! Saving lakhs!"

**Explanation**:
- What they accomplished
- Why it matters

**What's Next**:
- Purple gradient box
- Next milestone preview
- Action-oriented language

### Buttons:
- **"Continue to Next"** (primary, gradient)
- **"Don't show celebration popups again"** (ghost, bottom)

## 📊 Celebration Messages (All 10)

### Milestone 1:
- **Congrats**: "🎓 Expert consultation booked!"
- **Message**: "Professional guidance is now available to help you succeed!"
- **Next**: "Next: Enter your financial details"

### Milestone 2:
- **Congrats**: "📊 Financial details entered!"
- **Message**: "You now have a clear picture of your financial starting point!"
- **Next**: "Next: Set your financial goals"

### Milestone 3:
- **Congrats**: "🎯 Goals set! Roadmap created!"
- **Message**: "With clear goals, you now have a destination to work towards!"
- **Next**: "Next: Calculate your FIRE number"

### Milestone 4:
- **Congrats**: "🔢 FIRE number calculated!"
- **Message**: "You know exactly how much you need for financial freedom!"
- **Next**: "Next: Create your SIP strategy"

### Milestone 5:
- **Congrats**: "💰 SIP Plan created!"
- **Message**: "You're on autopilot to wealth with systematic investing!"
- **Next**: "Next: Assess your risk profile"

### Milestone 6:
- **Congrats**: "🛡️ Risk profile complete!"
- **Message**: "Understanding your risk helps you invest confidently!"
- **Next**: "Next: Optimize your portfolio"

### Milestone 7:
- **Congrats**: "📈 Portfolio optimized!"
- **Message**: "You're investing smarter with better returns!"
- **Next**: "Next: Master tax optimization"

### Milestone 8:
- **Congrats**: "📋 Tax master! Saving lakhs!"
- **Message**: "Smart tax planning keeps more money in your pocket!"
- **Next**: "Next: Get expert consultation"

### Milestone 9:
- **Congrats**: "🎓 Consultation complete!"
- **Message**: "Professional advice received!"
- **Next**: "Final Step: Claim FREE Premium!"

### Milestone 10:
- **Congrats**: "🏆 Journey Complete!"
- **Message**: "You've mastered your financial future!"
- **Next**: "Enjoy lifetime Premium - worth ₹9,999!"

---

# FEEDBACK NUDGE SYSTEM

## 🎯 Purpose
Collect user feedback at strategic moments using interactive UI (NO typing required!)

## 📍 NEW COMPONENT TO CREATE
`frontend/src/components/FeedbackNudge.tsx`

## ⏰ When to Show

### Trigger Points:
1. **After Milestone 3** (Set Goals) - 5 min delay
2. **After Milestone 6** (Risk Assessment) - 5 min delay
3. **After Milestone 10** (Journey Complete) - Immediate
4. **Random Check-in** - Every 7 days of active use
5. **Before Logout** - 20% probability

### Smart Display Rules:
- ❌ Don't show more than once per 7 days
- ❌ Don't show if user dismissed forever
- ❌ Don't interrupt active workflows
- ✅ Show after user completes an action
- ✅ Can be easily dismissed

## 🎨 Interactive Feedback Design

### Type 1: Quick Rating (Most Common)
```
╔════════════════════════════════════╗
║ 💬 How's your experience so far?  ║
╠════════════════════════════════════╣
║                                    ║
║    😠   😞   😐   🙂   😍         ║
║    1    2    3    4    5          ║
║  [Click an emoji to rate]          ║
║                                    ║
║  [Maybe Later]  [Don't Ask Again]  ║
╚════════════════════════════════════╝
```

### Type 2: Feature Satisfaction
```
╔════════════════════════════════════╗
║ 📊 How useful was the FIRE         ║
║    Calculator for you?             ║
╠════════════════════════════════════╣
║                                    ║
║  Not Useful              Very      ║
║  ●────○────○────○────○  Useful    ║
║  1    2    3    4    5             ║
║                                    ║
║  [Submit]        [Skip]            ║
╚════════════════════════════════════╝
```

### Type 3: Multiple Choice
```
╔════════════════════════════════════╗
║ 🎯 What's your PRIMARY goal?       ║
╠════════════════════════════════════╣
║                                    ║
║  [ ] Early Retirement (FIRE)       ║
║  [ ] Build Emergency Fund          ║
║  [ ] Save for Home                 ║
║  [ ] Children's Education          ║
║  [ ] Tax Optimization              ║
║  [ ] Grow Wealth                   ║
║                                    ║
║  [Submit]        [Skip]            ║
╚════════════════════════════════════╝
```

### Type 4: Yes/No Quick Poll
```
╔════════════════════════════════════╗
║ ❓ Did you find what you were      ║
║    looking for today?              ║
╠════════════════════════════════════╣
║                                    ║
║     [✅ Yes]      [❌ No]          ║
║                                    ║
║  If No selected:                   ║
║  What were you looking for?        ║
║  [ ] Tax saving tips               ║
║  [ ] Investment advice             ║
║  [ ] FIRE roadmap                  ║
║  [ ] Portfolio analysis            ║
║  [ ] Other (please tell us)        ║
║                                    ║
╚════════════════════════════════════╝
```

### Type 5: Journey Progress Check
```
╔════════════════════════════════════╗
║ 🗺️ How confident do you feel       ║
║    about your FIRE journey?        ║
╠════════════════════════════════════╣
║                                    ║
║  [ ] Very Confused                 ║
║  [ ] Somewhat Unclear              ║
║  [ ] Getting There                 ║
║  [ ] Pretty Confident              ║
║  [ ] Totally Clear!                ║
║                                    ║
║  [Submit]        [Skip]            ║
╚════════════════════════════════════╝
```

## 💾 Feedback Storage

### Database Schema:
```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  feedback_type VARCHAR(50), -- 'rating', 'feature_satisfaction', 'goal', 'found_what_looking_for', 'journey_confidence'
  milestone_number INTEGER, -- Which milestone triggered it
  rating INTEGER, -- 1-5 stars/emojis
  selected_option VARCHAR(200), -- For multiple choice
  optional_text TEXT, -- Only if user chooses "Other"
  created_at TIMESTAMP DEFAULT NOW(),
  page_location VARCHAR(100), -- Where they were when feedback shown
  session_id VARCHAR(100) -- Track session
);
```

---

# SMART NUDGE LOGIC

## 🧠 Intelligence Rules

### Frequency Control:
```typescript
const NUDGE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const NUDGE_DELAY_MS = 5000; // 5 seconds after page load
const MAX_NUDGES_PER_SESSION = 3; // Maximum 3 per 4-hour session
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
```

### Priority System:
1. **Critical**: Milestone 1 (Expert Consultation) - Always show first
2. **High**: Milestones 2-4 (Foundation building)
3. **Medium**: Milestones 5-8 (Optimization)
4. **Low**: Milestones 9-10 (Advanced features)

### Context Awareness:
- ✅ **Show**: User idle for 30 seconds
- ✅ **Show**: User completed an action
- ✅ **Show**: User viewing relevant page
- ❌ **Don't Show**: User typing
- ❌ **Don't Show**: User has form open
- ❌ **Don't Show**: Data is loading
- ❌ **Don't Show**: On error state

### Page-Specific Rules:
```typescript
// Don't interrupt workflows
suppressPages = [
  '/enter-details', // User entering data
  '/fire-planner',  // User planning
  '/tax-planning',  // User calculating taxes
  '/consultation'   // User booking consultation
];

// Only show on engagement pages
showOnPages = [
  '/dashboard',     // Overview
  '/net-worth',     // Viewing progress
  '/fire-calculator', // Analyzing scenarios
  '/portfolio',     // Reviewing holdings
  '/profile'        // Account management
];
```

---

# USER CONTROL & DISMISSAL

## 🎛️ Dismissal Options

### Temporary Dismissal:
- **"Remind Later"** button
- **Effect**: 15-minute cooldown
- **Storage**: Session storage (resets on refresh)

### Permanent Dismissal:
- **"Don't Show Again"** button
- **Effect**: Never show THIS specific nudge again
- **Storage**: localStorage + database
- **Key**: `nudge_dismissed_milestone_X`

### Complete Opt-Out:
- **"Don't show celebration popups again"** (on celebration)
- **Effect**: No more ANY nudges/celebrations
- **Storage**: localStorage + database
- **Key**: `celebration_popups_dismissed`

## 💾 Persistence

### localStorage Keys:
```typescript
// Nudge system
'finedge360_journey_nudge_state_{userId}' // Complete nudge state
'celebration_popups_dismissed' // Global celebration opt-out
'feedback_nudge_dismissed_{type}' // Per-feedback-type dismissal
'feedback_last_shown' // Timestamp of last feedback request

// Session tracking
'nudge_session_start' // When session started
'nudge_session_count' // How many nudges shown this session
```

### Database Tracking:
```sql
CREATE TABLE user_nudge_preferences (
  user_id UUID PRIMARY KEY,
  celebration_popups_enabled BOOLEAN DEFAULT true,
  milestone_nudges_enabled BOOLEAN DEFAULT true,
  feedback_nudges_enabled BOOLEAN DEFAULT true,
  last_nudge_shown TIMESTAMP,
  total_nudges_shown INTEGER DEFAULT 0,
  total_nudges_dismissed INTEGER DEFAULT 0,
  dismissed_milestone_ids INTEGER[],
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# IMPLEMENTATION CHECKLIST

## ✅ Completed:
- [x] Milestone nudge pop-ups (10 milestones)
- [x] Celebration pop-ups (10 celebrations)
- [x] Smart display logic (cooldowns, session limits)
- [x] Page-specific nudge rules
- [x] Persistent dismissal (localStorage)
- [x] Mobile-responsive design
- [x] Running offer banner

## 🔲 To Implement:
- [ ] Interactive feedback nudge component
- [ ] Feedback database storage
- [ ] Backend API for feedback collection
- [ ] Feedback analytics dashboard (admin)
- [ ] A/B testing for different nudge messages
- [ ] Machine learning for optimal nudge timing
- [ ] Email follow-up for dismissed nudges

---

# METRICS TO TRACK

## 📊 Engagement Metrics:
1. **Nudge Impressions**: How many times nudges shown
2. **Click-Through Rate**: % who clicked action button
3. **Dismissal Rate**: % who dismissed vs engaged
4. **Completion Rate**: % who completed milestone after nudge
5. **Time to Action**: How long after nudge user acted
6. **Session Engagement**: Average nudges per session

## 📈 Feedback Metrics:
1. **Response Rate**: % who provided feedback
2. **Average Rating**: Overall satisfaction score
3. **Feature Satisfaction**: Per-feature ratings
4. **Goal Distribution**: What users' primary goals are
5. **Confidence Levels**: How confident users feel
6. **Feedback by Milestone**: Which milestones get best feedback

---

**END OF DOCUMENTATION**

**Last Updated**: 2026-01-02
**Next Review**: 2026-02-01
**Maintained By**: Development Team

---

## 📞 CONTACT

For questions about the nudge system:
- Technical: Check code comments in components
- Product: Review this documentation
- Analytics: Query user_feedback and user_nudge_preferences tables
