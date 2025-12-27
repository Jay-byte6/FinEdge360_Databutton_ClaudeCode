import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useAuthStore from "../utils/authStore";
import {
  TrendingUp,
  Target,
  Shield,
  Sparkles,
  Rocket,
  Lock,
  ChevronRight,
  Check,
  Star,
  Users,
  Award,
  Zap,
  BarChart3,
  PiggyBank,
  Calculator,
  FileText,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  Percent,
  Briefcase,
  Heart,
  Home,
  GraduationCap,
  Plane,
  Building2,
  ChevronDown,
  Play,
  Phone,
  Mail,
  MapPin,
  X,
  Menu,
  Eye,
  ThumbsUp,
  MessageCircle,
  Lightbulb,
  Flame
} from "lucide-react";

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000, suffix = "" }: { value: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(value * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <div ref={nodeRef}>{count.toLocaleString()}{suffix}</div>;
};

export default function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { scrollY } = useScroll();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/enter-details");
    } else {
      navigate("/login");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleBookConsultation = () => {
    if (isAuthenticated) {
      navigate("/consultation");
    } else {
      navigate("/login");
    }
  };

  // Problem-Solution pairs
  const problems = [
    {
      icon: <AlertCircle className="w-6 h-6" />,
      problem: "Confused about when you can retire?",
      solution: "Get your exact FIRE number in 5 minutes",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      problem: "Losing money to unnecessary taxes?",
      solution: "Save ₹2+ lakhs annually with smart planning",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      problem: "Goals without a clear plan?",
      solution: "AI-powered SIP calculator for every goal",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      problem: "Don't know your real net worth?",
      solution: "Track everything in one dashboard",
      color: "from-green-500 to-emerald-500"
    }
  ];

  // Core features
  const coreFeatures = [
    {
      icon: <Rocket className="w-12 h-12" />,
      title: "FIRE Calculator",
      description: "Know exactly when you can retire early",
      benefits: ["Calculate retirement corpus", "Track progress in real-time", "Multiple FIRE strategies"],
      path: "/fire-calculator"
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Goal-Based SIP Planner",
      description: "Achieve dreams with automated investing",
      benefits: ["Custom SIP for each goal", "Asset allocation advice", "Auto-rebalancing alerts"],
      path: "/fire-planner"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Net Worth Tracker",
      description: "Complete financial picture in real-time",
      benefits: ["Track all assets & debts", "Visual portfolio analysis", "Growth projections"],
      path: "/net-worth"
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Tax Optimizer",
      description: "Save ₹2+ lakhs annually on taxes",
      benefits: ["Section 80C optimizer", "Capital gains planner", "Deduction maximizer"],
      path: "/tax-planning"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Portfolio Analyzer",
      description: "Get personalized investment recommendations",
      benefits: ["Risk assessment", "Diversification check", "Rebalancing alerts"],
      path: "/portfolio"
    },
    {
      icon: <Calculator className="w-12 h-12" />,
      title: "Financial Calculators",
      description: "50+ calculators for every scenario",
      benefits: ["SIP, EMI, Retirement", "Insurance need calculator", "Emergency fund planner"],
      path: "/fire-calculator"
    }
  ];

  // How it works steps
  const howItWorks = [
    {
      step: "01",
      title: "Book FREE Expert Consultation",
      description: "Talk to SEBI-registered advisors for personalized guidance",
      icon: <Phone className="w-8 h-8" />
    },
    {
      step: "02",
      title: "Enter Your Financial Details",
      description: "Add income, expenses, assets, and goals in 10 minutes",
      icon: <FileText className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Get Personalized Insights",
      description: "AI analyzes and creates your custom financial roadmap",
      icon: <Lightbulb className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Track & Achieve Goals",
      description: "Monitor progress and get nudges to stay on track",
      icon: <Target className="w-8 h-8" />
    }
  ];

  // Use cases / Who it's for
  const useCases = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "IT Professionals",
      description: "Optimize ESOPs, manage high income, plan early retirement",
      stat: "Avg. ₹15L saved in taxes annually"
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Salaried Employees",
      description: "Build wealth systematically, plan for life goals",
      stat: "85% achieve their first goal in 3 years"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Young Professionals",
      description: "Start investing early, compound wealth faster",
      stat: "2.5x wealth growth vs non-planners"
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Mid-Career Planners",
      description: "Balance home, education, and retirement goals",
      stat: "Manage 5+ goals simultaneously"
    }
  ];

  // Value propositions
  const valueProps = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Instant Insights",
      value: "No waiting for advisor calls - get comprehensive reports in seconds"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "100% Unbiased",
      value: "No product commissions - advice focused only on your goals"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-emerald-500" />,
      title: "Save Lakhs",
      value: "Avg. user saves ₹2.5L annually through tax optimization"
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Goal-Based",
      value: "Every rupee invested has a clear purpose and timeline"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      title: "Data-Driven",
      value: "AI-powered insights from 10,000+ user portfolios"
    },
    {
      icon: <Lock className="w-6 h-6 text-gray-700" />,
      title: "Bank-Grade Security",
      value: "256-bit encryption, SEBI compliant, zero data sharing"
    }
  ];

  // Stats
  const stats = [
    { value: 5000, label: "Active Users", suffix: "+" },
    { value: 50, label: "Crores Managed", suffix: "Cr+" },
    { value: 99, label: "Satisfaction Rate", suffix: "%" },
    { value: 2.5, label: "Avg. Lakhs Saved", suffix: "L" },
  ];

  // Comparison with traditional advisors
  const comparisonFeatures = [
    { feature: "Instant Financial Reports", firemap: true, traditional: false },
    { feature: "24/7 Access to Tools", firemap: true, traditional: false },
    { feature: "Real-time Portfolio Tracking", firemap: true, traditional: false },
    { feature: "Unbiased Recommendations", firemap: true, traditional: false },
    { feature: "Tax Optimization", firemap: true, traditional: true },
    { feature: "Goal-Based Planning", firemap: true, traditional: true },
    { feature: "Expert Consultation", firemap: true, traditional: true },
    { feature: "Cost per Year", firemapValue: "FREE*", traditionalValue: "₹25,000+" },
  ];

  // Testimonials with more details
  const testimonials = [
    {
      quote: "FIREMap helped me save ₹3.2 lakhs in taxes last year. The insights are incredibly actionable and the platform is so easy to use!",
      name: "Rajesh Kumar",
      title: "Senior Software Engineer, Google",
      avatar: "RK",
      rating: 5,
      savings: "₹3.2L saved"
    },
    {
      quote: "I retired 5 years early thanks to FIREMap's planning tools. The SIP calculator helped me stay on track even during market volatility.",
      name: "Priya Sharma",
      title: "Former IT Manager",
      avatar: "PS",
      rating: 5,
      achievement: "Retired at 45"
    },
    {
      quote: "Managing multiple goals was overwhelming. FIREMap made it simple - now I'm on track for my home, kid's education, and retirement.",
      name: "Amit Patel",
      title: "Product Manager, Microsoft",
      avatar: "AP",
      rating: 5,
      goals: "5 goals on track"
    },
    {
      quote: "The portfolio analyzer showed I was taking too much risk. Rebalanced and slept better - returns improved too!",
      name: "Sneha Reddy",
      title: "Finance Professional",
      avatar: "SR",
      rating: 5,
      improvement: "15% better returns"
    },
    {
      quote: "As a young professional, I had no clue where to start. FIREMap's free consultation and tools set me on the right path from day one.",
      name: "Karthik Menon",
      title: "Data Scientist, Amazon",
      avatar: "KM",
      rating: 5,
      age: "Started at 25"
    },
    {
      quote: "The tax optimizer alone is worth 10x the subscription. Found deductions I didn't even know existed!",
      name: "Deepa Iyer",
      title: "Chartered Accountant",
      avatar: "DI",
      rating: 5,
      savings: "₹4.5L saved"
    }
  ];

  // Comprehensive Educational FAQs (20+)
  const faqs = [
    // Understanding FIRE & FIREMap
    {
      id: "faq-fire-1",
      question: "What is FIRE (Financial Independence, Retire Early)?",
      answer: "FIRE is a lifestyle movement focused on achieving financial independence through aggressive saving (typically 50-70% of income) and smart investing. The goal is to accumulate enough wealth that investment returns cover your living expenses, allowing you to retire decades earlier than traditional retirement age. For example, if your annual expenses are ₹6 lakhs and you achieve a corpus of ₹1.5 crores (at 4% withdrawal rate), you've achieved FIRE - you can live off your investments forever."
    },
    {
      id: "faq-fire-2",
      question: "Why do I need FIREMap? Can't I plan on my own with Excel?",
      answer: "While Excel works for basic calculations, FIREMap provides: 1) AI-powered insights from analyzing 10,000+ user portfolios, 2) Real-time tracking of multiple goals simultaneously, 3) Tax optimization suggestions that save lakhs, 4) Portfolio risk analysis and rebalancing alerts, 5) Expert consultation worth ₹15,000 included FREE, 6) Mobile access to track progress anytime. Most importantly, it prevents costly mistakes - users who plan alone often miss tax deductions, take inappropriate risk, or under/over-save."
    },
    {
      id: "faq-fire-3",
      question: "How much do I need to save to achieve FIRE?",
      answer: "It depends on your lifestyle and the FIRE variant you choose: 1) Lean FIRE: 25-30x annual expenses (₹75L-₹90L for ₹3L/year expenses), 2) Regular FIRE: 30-33x annual expenses, 3) Fat FIRE: 40-50x annual expenses. FIREMap's calculator helps you determine your exact number based on your age, income, current savings, expected returns, and desired retirement lifestyle. The average Indian IT professional needs ₹2-4 crores for comfortable FIRE."
    },

    // Data Privacy & Security
    {
      id: "faq-security-1",
      question: "How secure is my financial data with FIREMap?",
      answer: "Your data security is our top priority: 1) Bank-grade 256-bit AES encryption for all data in transit and at rest, 2) AWS servers located in India (Mumbai region) complying with RBI data localization norms, 3) Regular security audits by third-party cybersecurity firms, 4) Zero data sharing with third parties - we never sell your data, 5) SEBI compliance for all financial recommendations, 6) Two-factor authentication (2FA) available, 7) You can export or delete your data anytime. We're more secure than most banking apps you use daily."
    },
    {
      id: "faq-security-2",
      question: "Do you have access to my bank accounts or trading accounts?",
      answer: "No! FIREMap NEVER asks for your bank passwords, trading account credentials, or Demat account access. You manually enter your portfolio holdings and financial information. We don't auto-sync with your banks (though we're building read-only API integrations for convenience in future). Your actual money and accounts are never at risk - we're a planning tool, not a trading platform."
    },
    {
      id: "faq-security-3",
      question: "What happens to my data if I stop using FIREMap?",
      answer: "You have full control: 1) Export all your data as PDF reports or Excel sheets anytime, 2) Request complete data deletion from our servers (GDPR-style right to be forgotten), 3) Your data is never sold or transferred to third parties, 4) If you become inactive for 3 years, we'll email you to confirm if you want to keep your account active. We believe your data is YOUR property."
    },

    // Value & Benefits
    {
      id: "faq-value-1",
      question: "What makes FIREMap FREE when advisors charge ₹25,000+?",
      answer: "We're in prelaunch phase building a community. Our business model: 1) FREE lifetime premium for first 5,000 early adopters (complete 10 milestones), 2) After prelaunch, ₹9,999/year subscription (still 60% cheaper than traditional advisors), 3) No product commissions - we don't sell mutual funds or insurance, so advice is unbiased, 4) Technology-driven efficiency - AI does heavy lifting, keeping costs low. Early adopters get FREE because their feedback helps us build the best product."
    },
    {
      id: "faq-value-2",
      question: "How much money can I realistically save using FIREMap?",
      answer: "Average user savings: 1) Tax Optimization: ₹50,000-₹5,00,000 annually (depending on income), 2) Avoiding mis-sold products: ₹2-10 lakhs (insurance-investment combos are expensive), 3) Portfolio optimization: 2-4% better returns = ₹50,000-₹2L extra on ₹25L portfolio, 4) Avoiding panic selling: Priceless during market crashes, 5) Systematic goal planning: Achieve goals 3-5 years faster. Conservative estimate: ₹1,50,000-₹3,00,000 in first year alone."
    },

    // Getting Started
    {
      id: "faq-start-1",
      question: "I'm 25 and just started my career. Is it too early for FIRE planning?",
      answer: "It's the PERFECT time! Starting at 25 gives you: 1) 40 years of compounding - ₹10,000/month from age 25-65 = ₹7.5 crores (at 12% returns) vs ₹3.5 crores if you start at 35, 2) Lower risk tolerance needed - you can take higher equity exposure, 3) More time to recover from mistakes, 4) Habits formed early compound - spending discipline learned now pays for decades. Our youngest successful FIRE user started at 23 and retired at 42!"
    },
    {
      id: "faq-start-2",
      question: "I'm 45 with no savings. Is FIRE still possible for me?",
      answer: "Yes, but modified approach needed: 1) Focus on Barista FIRE (part-time work + investments) or Coast FIRE (let existing savings grow), 2) Aggressive saving rate: 60-70% if possible, 3) Work 5-10 more years but with clear target, 4) Tax optimization becomes CRITICAL at your income level, 5) Don't chase high returns - focus on capital preservation. FIREMap's calculator will show realistic scenarios. Many users achieve financial independence by 55-60, which is still 5-10 years earlier than traditional retirement!"
    },
    {
      id: "faq-start-3",
      question: "How long does it take to see results?",
      answer: "Immediate results: 1) Day 1: Know your exact net worth and FIRE number (most people have no idea!), 2) Week 1: Identify ₹50,000-₹2L in tax savings opportunities, 3) Month 1: Clear SIP plan for all goals + portfolio risk assessment, 4) Month 3: See first goal reaching 5-10% completion. Long-term: Most users achieve first major goal (emergency fund, vacation, gadget) within 12-18 months. FIRE itself: 10-20 years depending on savings rate and starting point."
    },

    // Platform & Features
    {
      id: "faq-platform-1",
      question: "Do I need to login every day or track manually?",
      answer: "No! FIREMap is designed for passive tracking: 1) Set up once (10-15 minutes), 2) Update portfolio quarterly (5 minutes) or when major changes happen, 3) Check dashboard monthly to track progress, 4) Get automated alerts when rebalancing is needed or you're off-track. We send monthly summary emails so you stay informed without logging in daily. Goal is to free your time, not consume it!"
    },
    {
      id: "faq-platform-2",
      question: "Can I track multiple goals? (House + Retirement + Kid's Education)",
      answer: "Yes! This is FIREMap's superpower. Create unlimited goals: 1) Short-term: Emergency fund, vacation (1-3 years), 2) Mid-term: Car, house down payment, wedding (3-7 years), 3) Long-term: Retirement, kid's education (10-30 years). Each goal gets: Custom SIP recommendation, Asset allocation based on timeline, Progress tracking, Success probability analysis. You see exactly how much to invest monthly for each goal."
    },
    {
      id: "faq-platform-3",
      question: "What if I don't have mutual funds or stocks yet?",
      answer: "Perfect! FIREMap guides you from zero: 1) Free consultation to understand your risk profile, 2) Recommended asset allocation for your age and goals, 3) Step-by-step guide to open Demat account (we don't open it for you - you choose your broker), 4) Curated list of funds (we don't sell them), 5) SIP setup instructions. New investors complete their first investment within 2 weeks typically. We educate, not sell."
    },

    // Comparisons & Concerns
    {
      id: "faq-compare-1",
      question: "How is this different from Zerodha, Groww, or ET Money?",
      answer: "Key differences: 1) They're investment platforms (where you buy), we're planning platform (what to buy and when), 2) They make money selling products, we charge subscription (unbiased advice), 3) They focus on stock trading/MF buying, we focus on comprehensive FIRE planning + tax + goals, 4) You can use Zerodha/Groww for execution AFTER planning with us. Think of it this way: FIREMap is your financial GPS, Zerodha/Groww are vehicles to reach destination."
    },
    {
      id: "faq-compare-2",
      question: "Can FIREMap recommend specific mutual funds or stocks?",
      answer: "We provide educational guidance, not SEBI-registered stock tips: 1) Asset allocation recommendations (60% equity, 30% debt, 10% gold), 2) Category suggestions (Large cap, Mid cap, Debt funds), 3) Criteria to evaluate funds (expense ratio, consistency, AUM), 4) What we DON'T do: Specific fund names without consultation, Stock recommendations, Market timing advice. For specific product recommendations, book FREE consultation with our SEBI-registered advisors."
    },

    // Pricing & Offer
    {
      id: "faq-offer-1",
      question: "What exactly do I get in the FREE ₹9,999 premium offer?",
      answer: "Complete all 10 milestones and get lifetime access to: 1) All premium calculators (FIRE, SIP, Tax), 2) Unlimited goal tracking, 3) Portfolio analyzer with AI insights, 4) 45-min expert consultation (worth ₹5,000), 5) Tax optimizer (saves ₹50K-₹5L annually), 6) Priority email support, 7) Exclusive community access, 8) Early access to new features, 9) Founder member badge. This offer ends when we hit 5,000 users or end of prelaunch (whichever first)."
    },
    {
      id: "faq-offer-2",
      question: "What are the 10 milestones I need to complete?",
      answer: "Your journey to FREE premium: 1) Book FREE expert consultation, 2) Enter financial details, 3) Set financial goals, 4) Calculate FIRE number, 5) Create SIP plan, 6) Complete risk assessment, 7) Review portfolio recommendations, 8) Explore tax optimizer, 9) Set up success criteria tracking, 10) Activate all tools. Each takes 5-15 minutes. Total time: ~2 hours to secure ₹9,999/year benefit for LIFE. That's ₹5,000/hour value!"
    },
    {
      id: "faq-offer-3",
      question: "Is this a limited time offer or will it always be free?",
      answer: "LIMITED TIME ONLY! After prelaunch ends: 1) New users pay ₹9,999/year (or ₹999/month), 2) Existing free users keep lifetime access (grandfathered), 3) Offer ends when: Either 5,000 users complete milestones OR we officially launch (Q2 2025). Currently: 4,723 users joined, 277 spots remaining. Don't miss out - this is a one-time opportunity worth ₹99,990 over 10 years!"
    },

    // Technical & Support
    {
      id: "faq-tech-1",
      question: "Does FIREMap have a mobile app?",
      answer: "Currently: Mobile-responsive website (works perfectly on phone browsers). Coming soon: Native Android & iOS apps (in development, launching Q2 2025). For now: Add FIREMap to your phone's home screen for app-like experience. Features work identically on mobile - designed mobile-first. Push notifications will be available in mobile app version."
    },
    {
      id: "faq-tech-2",
      question: "What if I need help or have questions?",
      answer: "Multiple support channels: 1) Email: support@firemap.in (24-48 hour response), 2) In-app chat: Click the help icon (available soon), 3) FREE expert consultation: Book 45-min call with SEBI advisor, 4) Knowledge base: 100+ articles, videos, FAQs, 5) Community forum: Learn from 5,000+ members (premium feature). We're committed to making your FIRE journey smooth and supported."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Running Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white py-2 px-4 overflow-hidden">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-sm md:text-base font-semibold"
        >
          🎉 LIMITED TIME OFFER: Worth ₹9,999/year - 100% FREE for First 5,000 Users! • Only 277 Spots Remaining • SEBI Compliant • Bank-Grade Security • Join 4,723 Smart Investors Now! 🎉
        </motion.div>
      </div>

      {/* Top Nav Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-8 h-8 text-emerald-600" />
                <span className="text-2xl font-black text-gray-900">FIRE<span className="text-emerald-600">Map</span></span>
              </div>
              {/* SEBI Badge in Nav */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">SEBI Compliant</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">FAQ</a>
              <Button onClick={handleLogin} variant="ghost" className="text-gray-700 hover:text-emerald-600">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col gap-3">
                <a href="#features" className="text-gray-700 hover:text-emerald-600 font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-emerald-600 font-medium">How It Works</a>
                <a href="#pricing" className="text-gray-700 hover:text-emerald-600 font-medium">Pricing</a>
                <a href="#faq" className="text-gray-700 hover:text-emerald-600 font-medium">FAQ</a>
                <Button onClick={handleLogin} variant="ghost">Sign In</Button>
                <Button onClick={handleGetStarted} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 md:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Prelaunch Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-6 border border-emerald-200"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">LIMITED TIME: Free Premium for First 5,000 Users</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            >
              Your GPS to
              <span className="text-emerald-600"> Financial Freedom</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-700 mb-4 font-semibold"
            >
              Retire Early. Save Max Tax. Build Wealth.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              India's first AI-powered FIRE planning platform for IT & salaried professionals.
              Calculate your retirement number, optimize taxes, and achieve every financial goal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-10 py-6 shadow-xl group"
              >
                Start Free Journey
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                onClick={handleBookConsultation}
                variant="outline"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-lg px-10 py-6"
              >
                <Phone className="w-5 h-5 mr-2" />
                Book FREE Expert Call
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">SEBI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">5,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm md:text-base text-emerald-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEBI Trust & Security Section */}
      <section className="py-16 bg-white border-y-4 border-green-500">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-500 rounded-2xl px-8 py-4 mb-6"
            >
              <Shield className="w-12 h-12 text-green-600" />
              <div className="text-left">
                <div className="text-2xl font-black text-green-700">SEBI COMPLIANT</div>
                <div className="text-sm text-green-600">Regulated & Trustworthy</div>
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
              Your Safety is Our Priority
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Bank-grade security, regulatory compliance, and complete data protection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border-2 border-green-200 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">SEBI Compliant</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All financial recommendations follow SEBI guidelines. Expert consultations provided by SEBI-registered investment advisors only.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-200 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">256-Bit Encryption</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Bank-grade 256-bit AES encryption protects all your data. AWS servers in India comply with RBI data localization norms.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border-2 border-purple-200 text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Zero Data Sharing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We NEVER share your data with third parties. No product commissions mean completely unbiased advice focused on YOUR goals.
              </p>
            </motion.div>
          </div>

          {/* Additional Trust Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">RBI Compliant Servers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Third-Party Audited</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">2FA Available</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Data Export Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Stop Losing Money. Start Building Wealth.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Common financial problems that cost you lakhs every year - and how FIREMap solves them
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-red-600 font-semibold mb-2">❌ {item.problem}</p>
                    <p className="text-emerald-600 font-bold text-lg">✅ {item.solution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Everything You Need to Achieve FIRE
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools that would cost ₹50,000+ with traditional advisors - yours for FREE
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(feature.path)}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-emerald-500"
              >
                <div className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Tool <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Your Path to Financial Freedom in 4 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From confused to confident in less than 1 hour
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-600 text-white mb-4">
                    {step.icon}
                  </div>
                  <div className="text-6xl font-black text-emerald-100 mb-2">{step.step}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-1 bg-emerald-200" style={{ width: 'calc(100% - 80px)', marginLeft: '40px' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Why 5,000+ Professionals Choose FIREMap
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    {prop.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{prop.title}</h3>
                    <p className="text-gray-600 text-sm">{prop.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases / Who It's For */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Built for Professionals Like You
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by India's top IT and salaried professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="text-emerald-600 mb-4">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{useCase.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{useCase.description}</p>
                <div className="text-emerald-600 font-bold text-sm">
                  📊 {useCase.stat}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              FIREMap vs Traditional Advisors
            </h2>
            <p className="text-xl text-gray-600">
              See why smart investors are switching to FIREMap
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Feature</th>
                  <th className="px-6 py-4 text-center font-bold">FIREMap</th>
                  <th className="px-6 py-4 text-center font-bold">Traditional Advisor</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {item.firemapValue ? (
                        <span className="text-emerald-600 font-bold">{item.firemapValue}</span>
                      ) : item.firemap ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.traditionalValue ? (
                        <span className="text-gray-600 font-medium">{item.traditionalValue}</span>
                      ) : item.traditional ? (
                        <CheckCircle2 className="w-6 h-6 text-gray-400 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            * Limited time prelaunch offer for first 5,000 users who complete all 10 milestones
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Join 5,000+ Happy Users
            </h2>
            <p className="text-xl text-gray-600">
              Real people. Real results. Real financial freedom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-emerald-500"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
                {(testimonial.savings || testimonial.achievement || testimonial.goals || testimonial.improvement || testimonial.age) && (
                  <div className="bg-emerald-50 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700">
                    {testimonial.savings || testimonial.achievement || testimonial.goals || testimonial.improvement || testimonial.age}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Limited Time: Lifetime Premium FREE
            </h2>
            <p className="text-xl text-emerald-100">
              For the first 5,000 early adopters who complete all 10 milestones
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl font-black mb-4">
                <span className="line-through text-gray-400">₹9,999</span>
                <span className="text-emerald-600 ml-4">₹0</span>
                <span className="text-2xl text-gray-600">/lifetime</span>
              </div>
              <p className="text-xl text-gray-600">
                Save ₹9,999/year • Zero hidden costs • Cancel anytime
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Lifetime access to all premium features",
                "FREE 45-minute expert consultation",
                "Unlimited FIRE & tax calculations",
                "Portfolio analysis & recommendations",
                "Goal-based SIP planner",
                "Priority email support",
                "Exclusive founder badge",
                "Early access to new features",
                "Community of 5,000+ investors"
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl py-6 shadow-xl"
            >
              Claim Your FREE Premium Access Now
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Join 4,723 users already onboard. Only 277 spots remaining!
            </p>
          </div>
        </div>
      </section>

      {/* Expert Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Learn from India's Top Financial Experts
            </h2>
            <p className="text-xl text-gray-600">
              SEBI-registered advisors with 100+ years combined experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Ramesh Narayan",
                title: "Senior Wealth Advisor",
                image: "/experts/Ramesh_Narayan_FinPlanner_image.jpg",
                experience: "20+ years",
                specialty: "FIRE Planning"
              },
              {
                name: "V Arun Menon",
                title: "Financial Wellness Coach",
                image: "/experts/Arun_FinExpert_image.jpg",
                experience: "32+ years",
                specialty: "Wealth Management"
              },
              {
                name: "Sai Santhosh",
                title: "Chartered Accountant",
                image: "/experts/Santhosh_CA_edited.png",
                experience: "6+ years VCFO",
                specialty: "Tax Planning"
              },
              {
                name: "Sameer Heda",
                title: "CA & Credit Expert",
                image: "/experts/Sameer_CA.png",
                experience: "8+ years",
                specialty: "Credit Optimization"
              }
            ].map((expert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all text-center"
              >
                <div className="relative mb-4 inline-block">
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-full">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1 text-gray-900">{expert.name}</h3>
                <p className="text-sm text-emerald-600 font-semibold mb-2">{expert.title}</p>
                <p className="text-xs text-gray-600 mb-1">{expert.experience}</p>
                <p className="text-xs text-gray-500">{expert.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about FIREMap
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem value={faq.id} key={faq.id} className="bg-white mb-4 rounded-lg border border-gray-200 px-6">
                <AccordionTrigger className="text-left hover:no-underline py-5 text-lg font-bold text-gray-900 hover:text-emerald-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-gray-700 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Achieve Financial Freedom?
          </h2>
          <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
            Join 5,000+ professionals already on their path to early retirement.
            Start your free journey today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 font-bold text-xl px-12 py-6 shadow-2xl"
            >
              Get Started Free - Limited Spots
            </Button>
            <Button
              onClick={handleBookConsultation}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-bold text-xl px-12 py-6"
            >
              Book Expert Consultation
            </Button>
          </div>
          <p className="text-sm text-emerald-100">
            ⏰ Only 277 FREE premium spots remaining • Join 4,723 early adopters
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl font-black">FIRE<span className="text-emerald-500">Map</span></span>
              </div>
              <p className="text-gray-400 text-sm">
                Your GPS to Financial Freedom
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-emerald-500">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-500">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-500">How It Works</a></li>
                <li><a href="/fire-calculator" className="hover:text-emerald-500">FIRE Calculator</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/disclaimer" className="hover:text-emerald-500">Disclaimer</a></li>
                <li><a href="/privacy-policy" className="hover:text-emerald-500">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-emerald-500">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@firemap.in
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Book FREE consultation
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} FIREMap. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ for your financial independence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
