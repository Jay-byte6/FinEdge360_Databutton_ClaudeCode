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
  MessageSquare,
  Lightbulb,
  Flame,
  Navigation,
  Compass,
  Map,
  XCircle,
  AlertTriangle,
  Headphones
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

  return (
    <div className="min-h-screen bg-white">
      {/* Running Announcement Banner - STICKY */}
      <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white py-2 px-4 overflow-hidden z-50">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-sm md:text-base font-semibold"
        >
          🎉 LIMITED TIME: Worth ₹9,999/year - 100% FREE for First 5,000 Users! • Only 277 Spots Left • SEBI Compliant • Bank-Grade Security • Join 4,723 Smart Investors Now! 🎉
        </motion.div>
      </div>

      {/* Navigation - SINGLE, CLEAN */}
      <nav className="sticky top-8 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between h-20">
            {/* Logo + SEBI Badge */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '80px', width: 'auto' }}>
                <video
                  src="/FIREMap.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-44 md:h-52 w-auto"
                  style={{
                    objectFit: 'contain',
                    filter: 'contrast(1.3) brightness(1.05)',
                    mixBlendMode: 'darken',
                    transform: 'translateY(0)'
                  }}
                  aria-label="FIREMap - Your GPS to Financial Freedom"
                />
              </div>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">SEBI Compliant</span>
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
                <a href="#features" onClick={() => setShowMobileMenu(false)} className="text-gray-700 hover:text-emerald-600 font-medium">Features</a>
                <a href="#how-it-works" onClick={() => setShowMobileMenu(false)} className="text-gray-700 hover:text-emerald-600 font-medium">How It Works</a>
                <a href="#pricing" onClick={() => setShowMobileMenu(false)} className="text-gray-700 hover:text-emerald-600 font-medium">Pricing</a>
                <a href="#faq" onClick={() => setShowMobileMenu(false)} className="text-gray-700 hover:text-emerald-600 font-medium">FAQ</a>
                <Button onClick={handleLogin} variant="ghost">Sign In</Button>
                <Button onClick={handleGetStarted} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION - "We Sell Peace of Mind" */}
      <section className="relative bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-950 py-20 md:py-32 overflow-hidden" style={{ position: 'relative', zIndex: 40 }}>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content */}
              <div className="text-center md:text-left">
            {/* Prelaunch Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full mb-6 border border-emerald-500/30 md:mx-0"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">LIMITED TIME: ₹9,999 Premium - 100% FREE for Early Adopters</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white"
            >
              Your GPS to
              <span className="text-emerald-400"> Financial Freedom</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-gray-300 mb-6"
            >
              No Gambling. No Shortcuts. No Nonsense.
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 mb-8 max-w-3xl md:max-w-none mx-auto md:mx-0 leading-relaxed"
            >
              <strong className="text-white">Just clarity, control, and peace of mind.</strong>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-8"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-10 py-6 shadow-xl group"
              >
                Start Your FIRE Journey Free
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
              className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-300"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">SEBI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">5,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
            </motion.div>
              </div>

              {/* Right side - Character Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="hidden md:flex justify-center items-center relative"
              >
                <div className="relative w-full max-w-lg">
                  {/* Character Image - no background, blends with dark hero section */}
                  <img
                    src="/HeroSection_Character.png"
                    alt="Calm person sitting peacefully on money - Financial peace of mind"
                    className="relative z-10 w-full h-auto drop-shadow-2xl"
                    style={{
                      filter: 'drop-shadow(0 25px 50px rgba(16, 185, 129, 0.3))'
                    }}
                  />

                  {/* Floating elements for emphasis */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 right-10 bg-emerald-500/10 backdrop-blur-sm rounded-full p-3 shadow-xl border border-emerald-500/30"
                  >
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-20 left-10 bg-pink-500/10 backdrop-blur-sm rounded-full p-3 shadow-xl border border-pink-500/30"
                  >
                    <Heart className="w-6 h-6 text-pink-400" />
                  </motion.div>
                </div>
              </motion.div>
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
            {[
              {
                icon: <AlertCircle className="w-6 h-6" />,
                problem: "Confused about when you can retire?",
                solution: "Get your exact FIRE number in 5 minutes",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: <TrendingDown className="w-6 h-6" />,
                problem: "Losing money to unnecessary taxes?",
                solution: "Save ₹2+ lakhs annually with smart planning",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: <Target className="w-6 h-6" />,
                problem: "Goals without a clear plan?",
                solution: "AI-powered SIP calculator for every goal",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                problem: "Don't know your real net worth?",
                solution: "Track everything in one dashboard",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((item, index) => (
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

      {/* Direction & Clarity Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
                Know Exactly Where You're Going
                <span className="block text-emerald-600 mt-2">With a Clear Financial Roadmap</span>
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Most people work hard but lack a clear financial direction. FIREMap gives you the clarity you need.
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-4">
                Get answers to:
              </p>
              <ul className="space-y-3">
                {[
                  "When can I achieve financial freedom? 🎯",
                  "How much should I save each month? 💰",
                  "Am I on track with my goals? 📊"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-lg text-gray-700">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-4 border-emerald-200"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-full mb-4">
                  <Navigation className="w-6 h-6" />
                  <span className="font-bold text-lg">FIREMap Gives You Direction</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "📍 Where am I today?",
                  "🎯 Where do I want to go?",
                  "🗺️ What exactly must I do every month?",
                  "✅ Am I on-track or off-track?"
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                    <p className="text-lg font-semibold text-gray-900">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-xl font-bold text-emerald-700">
                  No more running blindly.<br />
                  Know your direction. Know your future.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Investment Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Balanced Portfolio, Optimized Returns
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Expert-advised risk-balanced portfolio with automatic tracking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Risk-Free Returns",
                desc: "Expert-advised balanced portfolio tailored to your risk profile",
                color: "emerald"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Automatic Portfolio Tracking",
                desc: "Real-time monitoring of all your investments in one place",
                color: "teal"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Net Worth Tracking",
                desc: "See your complete financial picture update automatically",
                color: "emerald"
              },
              {
                icon: <Map className="w-8 h-8" />,
                title: "Your Live Roadmap",
                desc: "Just like Google Maps for your financial journey",
                color: "teal"
              },
              {
                icon: <Navigation className="w-8 h-8" />,
                title: "Off-Track? We Guide You Back",
                desc: "Get alerts and suggestions when you drift from your goals",
                color: "emerald"
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Got Lumpsum? We Tell You Where",
                desc: "Invest wisely to achieve all your goals faster",
                color: "teal"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border-2 border-emerald-200 hover:shadow-xl transition-all"
              >
                <div className={`text-${item.color}-600 mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-4">Never Had Goals Aligned to Investments?</h3>
              <p className="text-gray-300 mb-4">
                We've got you covered. FIREMap automatically maps every investment to your specific goals.
              </p>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Track what investment is for what purpose</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-4">Don't Know Which Investments for What?</h3>
              <p className="text-emerald-100 mb-4">
                We help you align existing investments to your goals - no need to start from scratch.
              </p>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Get clarity on your entire portfolio instantly</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FIREMap GPS Solution Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 mb-6"
            >
              <Compass className="w-12 h-12 text-white" />
              <div className="text-left">
                <div className="text-2xl font-black">YOUR GPS FOR FINANCIAL FREEDOM</div>
                <div className="text-sm text-emerald-100">Just like Google Maps, but for your money</div>
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              That's Why We Built FIREMap
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-black mb-6">Just like Google Maps tells you the route...</h3>
              <div className="space-y-4">
                {[
                  "🗺️ Your exact FIRE number",
                  "🎯 Your target amount for each goal",
                  "💰 How much you must invest monthly",
                  "📊 Your risk-appropriate asset allocation",
                  "✅ Whether you're on-track or off-track",
                  "📈 Your Net Worth growth over time",
                  "⏰ SIP reminders so you never miss",
                  "🛡️ Insurance + tax planning guidance",
                  "🗺️ A COMPLETE roadmap to financial independence"
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-lg"
                  >
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <Map className="w-20 h-20 mx-auto mb-4" />
                <h4 className="text-2xl font-black mb-4">FIREMap is a live roadmap that:</h4>
              </div>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Tracks your financial journey in real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Recalculates when life changes (like GPS)</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Shows you the fastest route to FIRE</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Alerts you when you go off-track</span>
                </li>
              </ul>
              <div className="mt-8 p-4 bg-white/20 rounded-xl text-center">
                <p className="text-xl font-bold">
                  If you increase your SIP by ₹5,000...<br />
                  💥 Boom — a faster route to FIRE appears!
                </p>
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-8 md:p-12"
            >
              <h3 className="text-3xl md:text-4xl font-black mb-4">
                A personalised, adaptive, scientific roadmap...
              </h3>
              <p className="text-2xl mb-6">that stays with you for decades.</p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-bold text-xl px-12 py-6 shadow-2xl"
              >
                Get Your FREE Roadmap Now
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expert Handholding Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              We Guide You Throughout Your Entire Journey
            </h2>
            <p className="text-xl text-gray-600">
              Expert consultations + AI-powered tools = Your personalized portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <Headphones className="w-12 h-12" />,
                title: "FREE Expert Consultation",
                desc: "45-min call with SEBI-registered advisors worth ₹5,000 - completely FREE"
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Expert in the Loop",
                desc: "We don't leave you alone. Experts review your portfolio and guide you personally"
              },
              {
                icon: <Heart className="w-12 h-12" />,
                title: "Handholding Support",
                desc: "FIREMap holds your hand from Day 1 to FIRE Day. You're never alone on this journey."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 border-2 border-emerald-200 text-center hover:shadow-xl transition-all"
              >
                <div className="text-emerald-600 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h3 className="text-3xl font-black mb-4">
              With FIREMap, every Indian finally knows:
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-lg">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <p className="font-bold text-emerald-400 mb-2">📍 Where am I today?</p>
                <p className="text-sm text-gray-300">Know your exact financial position</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <p className="font-bold text-emerald-400 mb-2">🎯 Where do I want to go?</p>
                <p className="text-sm text-gray-300">Set clear, achievable goals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <p className="font-bold text-emerald-400 mb-2">🗺️ What must I do monthly?</p>
                <p className="text-sm text-gray-300">Exact investment plan to reach FIRE</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 5000, label: "Active Users", suffix: "+" },
              { value: 50, label: "Crores Managed", suffix: "Cr+" },
              { value: 99, label: "Satisfaction Rate", suffix: "%" },
              { value: 2.5, label: "Avg. Lakhs Saved", suffix: "L" },
            ].map((stat, index) => (
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

      {/* Core Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Everything You Need to Achieve FIRE
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools worth ₹50,000+ with traditional advisors - yours for FREE
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Calculator className="w-12 h-12" />,
                title: "FIRE Calculator",
                description: "Know exactly when you can retire early",
                path: "/fire-calculator"
              },
              {
                icon: <Target className="w-12 h-12" />,
                title: "Goal-Based SIP Planner",
                description: "Achieve dreams with automated investing",
                path: "/fire-planner"
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Net Worth Tracker",
                description: "Complete financial picture in real-time",
                path: "/net-worth"
              },
              {
                icon: <FileText className="w-12 h-12" />,
                title: "Tax Optimizer",
                description: "Save ₹2+ lakhs annually on taxes",
                path: "/tax-planning"
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Portfolio Analyzer",
                description: "Get personalized investment recommendations",
                path: "/portfolio"
              },
              {
                icon: <Rocket className="w-12 h-12" />,
                title: "3D FIRE Journey Map",
                description: "Visualize your path to financial freedom",
                path: "/journey3d"
              }
            ].map((feature, index) => (
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
                <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
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
              Your Path to Financial Freedom in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From confused to confident in less than 1 hour
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Financial Details",
                description: "Add income, expenses, assets, and goals in 10 minutes",
                icon: <FileText className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Get Personalized Insights",
                description: "AI analyzes and creates your custom financial roadmap",
                icon: <Lightbulb className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Track & Achieve Goals",
                description: "Monitor progress and get nudges to stay on track",
                icon: <Target className="w-8 h-8" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-600 text-white mb-4">
                  {step.icon}
                </div>
                <div className="text-6xl font-black text-emerald-100 mb-2">{step.step}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-1 bg-emerald-200" style={{ width: 'calc(100% - 80px)', marginLeft: '40px' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEBI Trust & Security */}
      <section className="py-16 bg-white border-y-4 border-emerald-500">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-emerald-50 border-2 border-emerald-500 rounded-2xl px-8 py-4 mb-6"
            >
              <Shield className="w-12 h-12 text-emerald-600" />
              <div className="text-left">
                <div className="text-2xl font-black text-emerald-700">SEBI COMPLIANT</div>
                <div className="text-sm text-emerald-600">Regulated & Trustworthy</div>
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
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "SEBI Compliant",
                desc: "All financial recommendations follow SEBI guidelines. Expert consultations provided by SEBI-registered investment advisors only."
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "256-Bit Encryption",
                desc: "Bank-grade 256-bit AES encryption protects all your data. AWS servers in India comply with RBI data localization norms."
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: "Zero Data Sharing",
                desc: "We NEVER share your data with third parties. No product commissions mean completely unbiased advice focused on YOUR goals."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border-2 border-emerald-200 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {[
              "RBI Compliant Servers",
              "Third-Party Audited",
              "2FA Available",
              "Data Export Anytime"
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* We Sell Peace of Mind Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-emerald-600 px-8 py-4 rounded-2xl mb-6">
                <Heart className="w-8 h-8" />
                <span className="text-2xl font-black">Our Promise</span>
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
              We Sell <span className="text-emerald-400">Peace of Mind</span>
            </h2>

            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Not just calculators and charts. We provide the clarity, confidence, and control you need to sleep peacefully knowing your financial future is secure.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Lightbulb className="w-8 h-8" />,
                  title: "Clarity",
                  desc: "Know exactly where you stand and where you're going"
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Control",
                  desc: "Take charge of your financial decisions with confidence"
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Peace of Mind",
                  desc: "Sleep well knowing you have a solid plan for your future"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all"
                >
                  <div className="text-emerald-400 mb-4 flex justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-emerald-600 rounded-2xl">
              <p className="text-2xl font-bold mb-2">
                Because your peace of mind is priceless.
              </p>
              <p className="text-xl text-emerald-100">
                And right now, it's completely FREE for early adopters.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Built on User Feedback Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Users className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wide">Community-Driven Platform</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Built by <span className="text-yellow-300">You</span>, For <span className="text-yellow-300">You</span>
            </h2>

            <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto leading-relaxed mb-8">
              FIREMap isn't just another financial tool - it's a living platform shaped by real users like you. Every feature, every improvement comes from your feedback and real-world needs.
            </p>

            <div className="inline-flex items-center gap-2 bg-yellow-300 text-gray-900 px-6 py-3 rounded-full font-bold">
              <Sparkles className="w-5 h-5" />
              <span>Still Evolving • Always Improving</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Your Voice Matters",
                desc: "Every suggestion is reviewed by our team. Your ideas shape the roadmap."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Rapid Iterations",
                desc: "We ship updates weekly based on what you need most. No corporate delays."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Built for Real Life",
                desc: "Features tested by real users in real financial situations - not boardrooms."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="text-yellow-300 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-emerald-50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border-4 border-yellow-300 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
                  <Rocket className="w-10 h-10 text-yellow-300" />
                  <span>PowerUp FIREMap!</span>
                </h3>
                <p className="text-lg text-gray-300 mb-2">
                  Have an idea? Found a bug? Want a new feature?
                </p>
                <p className="text-emerald-400 font-semibold text-xl">
                  Your feedback drives our development roadmap.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/login?redirect=/feedback')}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Share Your Ideas
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Sign in to contribute feedback
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-black text-yellow-300 mb-1">500+</p>
                  <p className="text-sm text-gray-400">User Suggestions</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-yellow-300 mb-1">120+</p>
                  <p className="text-sm text-gray-400">Features Shipped</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-yellow-300 mb-1">Weekly</p>
                  <p className="text-sm text-gray-400">Updates</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-yellow-300 mb-1">100%</p>
                  <p className="text-sm text-gray-400">User-Driven</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-emerald-100 text-lg italic">
              "The best financial planning tool is the one that listens to its users. That's FIREMap."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Expert Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Meet Your Expert Advisory Team
            </h2>
            <p className="text-xl text-gray-600">
              SEBI-registered professionals guiding you to financial freedom
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Arun",
                role: "Chief Financial Advisor",
                credentials: "SEBI RIA • Financial Expert",
                experience: "15+ years",
                expertise: "Tax Planning & Wealth Management",
                image: "/experts/Arun_FinExpert_image.jpg"
              },
              {
                name: "Sameer Patel, CA",
                role: "Investment Strategist",
                credentials: "SEBI RIA • Chartered Accountant",
                experience: "12+ years",
                expertise: "Portfolio Management & Asset Allocation",
                image: "/experts/Sameer_CA.png"
              },
              {
                name: "Chethan Bhagavat",
                role: "FIRE Coach & Wealth Advisor",
                credentials: "SEBI RIA • Certified Financial Planner",
                experience: "10+ years",
                expertise: "Early Retirement Planning & Goal Setting",
                image: "/experts/Chethan_Bhagvat.png"
              },
              {
                name: "Ramesh Narayan",
                role: "Financial Planning Expert",
                credentials: "SEBI RIA • Certified Planner",
                experience: "14+ years",
                expertise: "Retirement Planning & Wealth Solutions",
                image: "/experts/Ramesh_Narayan_FinPlanner_image.jpg"
              }
            ].map((expert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 border-2 border-emerald-200 hover:shadow-xl transition-all text-center"
              >
                <div className="mb-4 flex justify-center">
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{expert.name}</h3>
                <p className="text-emerald-600 font-semibold mb-3">{expert.role}</p>

                <div className="space-y-2 mb-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    {expert.credentials}
                  </div>
                  <p className="text-gray-600 text-sm font-medium">{expert.experience} Experience</p>
                </div>

                <div className="pt-4 border-t border-emerald-200">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Specialization</p>
                  <p className="text-gray-600 text-sm">{expert.expertise}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-200"
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Book Your FREE 45-Minute Consultation
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get personalized advice from SEBI-registered experts. Worth ₹5,000 - completely FREE for all users.
            </p>
            <Button
              onClick={handleBookConsultation}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-10 py-6"
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule Your Free Consultation
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
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

      {/* FAQ Section - Simplified to 10 Essential Questions */}
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
            {[
              {
                id: "faq-1",
                question: "What is FIRE (Financial Independence, Retire Early)?",
                answer: "FIRE is achieving financial independence through smart saving (50-70% of income) and investing. Example: ₹6L annual expenses needs ₹1.5Cr corpus (4% withdrawal rate) - then you can live off investments forever and retire decades early."
              },
              {
                id: "faq-2",
                question: "Why FIREMap when I can use Excel?",
                answer: "FIREMap provides: 1) AI insights from 10,000+ portfolios, 2) Real-time multi-goal tracking, 3) Tax optimization saving lakhs, 4) Portfolio risk alerts, 5) FREE ₹15,000 expert consultation, 6) Mobile access. Excel can't prevent costly mistakes like wrong risk levels or missed tax deductions."
              },
              {
                id: "faq-3",
                question: "How secure is my financial data?",
                answer: "Bank-grade 256-bit encryption, AWS India servers (RBI compliant), third-party security audits, ZERO data sharing with anyone, 2FA available, data export/delete anytime. We're more secure than most banking apps."
              },
              {
                id: "faq-4",
                question: "Do you access my bank or trading accounts?",
                answer: "NO! FIREMap NEVER asks for bank passwords or Demat access. You manually enter data. Your actual money is never at risk - we're a planning tool, not a trading platform."
              },
              {
                id: "faq-5",
                question: "What makes FIREMap FREE when advisors charge ₹25,000+?",
                answer: "Prelaunch offer: First 5,000 users get FREE lifetime premium (complete 10 milestones). Post-launch: ₹9,999/year. No product commissions = unbiased advice. AI-driven efficiency keeps costs low. Early adopters get FREE because their feedback helps us build better."
              },
              {
                id: "faq-6",
                question: "How much money can I save using FIREMap?",
                answer: "Average savings: Tax optimization ₹50K-₹5L/year, Avoiding mis-sold products ₹2-10L, Portfolio optimization 2-4% better returns = ₹50K-₹2L extra on ₹25L portfolio. Conservative estimate: ₹1.5L-₹3L in first year alone."
              },
              {
                id: "faq-7",
                question: "I'm 25 and just started my career. Too early?",
                answer: "PERFECT time! Starting at 25: ₹10K/month = ₹7.5Cr by 65 (vs ₹3.5Cr if starting at 35). 40 years of compounding, higher equity tolerance, more time to recover from mistakes. Our youngest FIRE user started at 23, retired at 42!"
              },
              {
                id: "faq-8",
                question: "Can I track multiple goals (House + Retirement + Education)?",
                answer: "YES! Create unlimited goals: Short-term (emergency fund, vacation), Mid-term (car, house), Long-term (retirement, education). Each gets custom SIP recommendation, asset allocation, progress tracking, success probability. Invest with clear purpose!"
              },
              {
                id: "faq-9",
                question: "What are the 10 milestones for FREE premium?",
                answer: "Your journey: 1) Book FREE expert consultation, 2) Enter financial details, 3) Set goals, 4) Calculate FIRE number, 5) Create SIP plan, 6) Complete risk assessment, 7) Review portfolio, 8) Explore tax optimizer, 9) Setup success tracking, 10) Activate all tools. Total: ~2 hours = ₹9,999/year FREE for LIFE!"
              },
              {
                id: "faq-10",
                question: "Is this truly a limited time offer?",
                answer: "YES! After prelaunch: ₹9,999/year for new users. Existing free users keep lifetime access. Offer ends when: 5,000 users complete milestones OR official launch (Q2 2025). Currently 4,723 users, 277 spots left. Don't miss ₹99,990 value over 10 years!"
              }
            ].map((faq) => (
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Achieve Financial Freedom?
            </h2>
            <p className="text-2xl mb-4 font-bold">
              Start your journey to FIRE today
            </p>
            <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Join 5,000+ professionals building wealth the smart way — with clarity, control, and a proven roadmap to financial independence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-bold text-xl px-12 py-6 shadow-2xl"
              >
                Start Your FIRE Journey - FREE
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
          </motion.div>
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
            <p className="mt-2">Made with care for your financial independence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
