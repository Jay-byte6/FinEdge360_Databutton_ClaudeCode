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

  // FAQs with more comprehensive answers
  const faqs = [
    {
      id: "faq-1",
      question: "Is my financial data secure with FIREMap?",
      answer: "Absolutely. We use bank-grade 256-bit encryption for all data transmission and storage. Your data is stored in secure AWS servers in India, complying with RBI data localization norms. We never share your data with third parties and are fully SEBI compliant. You can delete your data anytime."
    },
    {
      id: "faq-2",
      question: "How is FIREMap different from traditional financial advisors?",
      answer: "Traditional advisors charge ₹15,000-₹50,000 annually and often have product biases. FIREMap gives you instant access to comprehensive planning tools, unbiased AI-powered recommendations, and optional expert consultations - all for FREE during prelaunch. You get 24/7 access vs scheduled meetings."
    },
    {
      id: "faq-3",
      question: "Do I need investment knowledge to use FIREMap?",
      answer: "Not at all! FIREMap is designed for everyone - from complete beginners to seasoned investors. We explain every concept in simple language, provide tooltips for technical terms, and offer video tutorials. Our free expert consultation helps you get started on the right foot."
    },
    {
      id: "faq-4",
      question: "What is the FIRE (Financial Independence, Retire Early) movement?",
      answer: "FIRE is about achieving financial freedom through disciplined saving and smart investing, allowing you to retire early or work on your terms. FIREMap helps you calculate your FIRE number, track progress, and provides strategies to achieve financial independence faster."
    },
    {
      id: "faq-5",
      question: "Can FIREMap help with tax planning?",
      answer: "Yes! Our tax optimizer analyzes your income, investments, and expenses to maximize deductions under Section 80C, 80D, and other sections. Users typically save ₹2-5 lakhs annually. We also help plan for capital gains tax on equity and debt investments."
    },
    {
      id: "faq-6",
      question: "Is the platform really free? What's the catch?",
      answer: "During our prelaunch phase, we're offering lifetime premium access FREE to early adopters who complete all 10 milestones. Regular price will be ₹9,999/year. No hidden costs, no product commissions. We're building a community of smart investors - that's our priority right now."
    },
    {
      id: "faq-7",
      question: "How long does it take to set up my financial plan?",
      answer: "Initial setup takes just 10-15 minutes. You'll add basic income, expenses, and goals. Our AI generates instant insights. For comprehensive planning with expert consultation, allocate 45-60 minutes for the first session. You can always update and refine over time."
    },
    {
      id: "faq-8",
      question: "Can I track mutual funds and stocks on FIREMap?",
      answer: "Yes! You can manually add your portfolio holdings or import from broker statements. We provide real-time valuation, asset allocation analysis, and rebalancing suggestions. Integration with major platforms is coming soon."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-black text-gray-900">FIRE<span className="text-emerald-600">Map</span></span>
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
