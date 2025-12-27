import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
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
  FileText
} from "lucide-react";

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
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

  return <div ref={nodeRef}>{count.toLocaleString()}</div>;
};

// Floating element component
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [uspApi, setUspApi] = useState<CarouselApi>();
  const autoplayIntervalUSP = 3000;
  const autoplayRefUSP = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const stopAutoplayUSP = useCallback(() => {
    if (autoplayRefUSP.current) {
      clearInterval(autoplayRefUSP.current);
      autoplayRefUSP.current = null;
    }
  }, []);

  const startAutoplayUSP = useCallback(() => {
    if (!uspApi) return;
    stopAutoplayUSP();
    autoplayRefUSP.current = setInterval(() => {
      if (uspApi.canScrollNext()) {
        uspApi.scrollNext();
      } else {
        uspApi.scrollTo(0);
      }
    }, autoplayIntervalUSP);
  }, [uspApi, stopAutoplayUSP]);

  useEffect(() => {
    if (!uspApi) return;
    startAutoplayUSP();
    return () => stopAutoplayUSP();
  }, [uspApi, startAutoplayUSP, stopAutoplayUSP]);

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

  const featuresData = [
    {
      title: "FIRE Calculator",
      description: "Chart your path to early retirement with precision timing and clarity",
      icon: <Rocket className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-50",
      path: "/fire-calculator",
    },
    {
      title: "SIP Goal Planner",
      description: "Transform dreams into reality with systematic investment strategies",
      icon: <Target className="w-8 h-8" />,
      color: "from-emerald-500 to-green-500",
      iconBg: "bg-emerald-50",
      path: "/fire-planner",
    },
    {
      title: "Net Worth Tracker",
      description: "Complete financial picture with real-time asset monitoring",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-50",
      path: "/net-worth",
    },
    {
      title: "Tax Optimizer",
      description: "Maximize savings with intelligent tax planning insights",
      icon: <FileText className="w-8 h-8" />,
      color: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50",
      path: "/tax-planning",
    },
  ];

  const benefitsData = [
    {
      id: 1,
      title: "End-to-End Financial Planning",
      description: "Complete financial ecosystem in one platform",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-blue-500/10 to-cyan-500/10",
    },
    {
      id: 2,
      title: "Instant Personalized Insights",
      description: "No advisor needed - get comprehensive reports instantly",
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500/10 to-pink-500/10",
    },
    {
      id: 3,
      title: "Maximize Tax Savings",
      description: "Keep more of your hard-earned money legally",
      icon: <PiggyBank className="w-6 h-6" />,
      color: "from-emerald-500/10 to-green-500/10",
    },
    {
      id: 4,
      title: "Built For Professionals",
      description: "Designed for salaried and IT experts like you",
      icon: <Users className="w-6 h-6" />,
      color: "from-amber-500/10 to-orange-500/10",
    },
    {
      id: 5,
      title: "Your Data, Secured",
      description: "Bank-grade encryption protects your information",
      icon: <Lock className="w-6 h-6" />,
      color: "from-slate-500/10 to-gray-500/10",
    },
    {
      id: 6,
      title: "Reach Financial Dreams",
      description: "Turn goals into actionable reality",
      icon: <Award className="w-6 h-6" />,
      color: "from-rose-500/10 to-red-500/10",
    },
  ];

  const statsData = [
    { value: 5000, label: "Active Users", suffix: "+" },
    { value: 10, label: "Core Features", suffix: "" },
    { value: 99, label: "User Satisfaction", suffix: "%" },
    { value: 50, label: "Crores Managed", suffix: "Cr+" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section - Modern Gradient with Animations */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
            {/* Hero Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-center lg:text-left"
            >
              {/* Prelaunch Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Limited Time: Free Premium for Early Adopters</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Your GPS to
                </span>
                <br />
                <span className="text-gray-900">Financial Freedom</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl sm:text-2xl text-gray-700 mb-4 font-medium"
              >
                Plan Smart. Retire Early. Save Max Tax.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                FIREMap empowers{" "}
                <span className="font-bold text-blue-600">Salaried & IT Professionals</span>{" "}
                with intelligent tools for goal planning, investment tracking, and tax optimization
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Start My Financial Plan
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  onClick={handleBookConsultation}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-6 shadow-lg"
                >
                  Book FREE Consultation
                </Button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">SEBI Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">5000+ Users</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image with Float Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex-1 flex justify-center lg:justify-end"
            >
              <FloatingElement>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl" />
                  <img
                    src="https://cdn3d.iconscout.com/3d/premium/thumb/man-seat-on-money-stack-and-achieve-financial-freedom-7303350-6000052.png"
                    alt="Financial Freedom"
                    className="relative w-full max-w-md lg:max-w-lg object-contain"
                  />
                </div>
              </FloatingElement>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-4xl lg:text-5xl font-black mb-2">
                  <AnimatedCounter value={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-sm lg:text-base text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Core Pillars of Your Financial Strategy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to achieve financial independence, all in one platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresData.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(feature.path)}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`${feature.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-6 h-6 text-blue-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              How FIREMap Transforms Your Finances
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to accelerate your path to financial freedom
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsData.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`relative bg-gradient-to-br ${benefit.color} backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {benefit.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join 5000+ professionals who are already on their path to financial independence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-10 py-6 shadow-2xl hover:shadow-white/20"
              >
                Start Your Journey Now
              </Button>
              <Button
                onClick={handleLogin}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-10 py-6"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Experts Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600">
              Seasoned professionals dedicated to your financial success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Ramesh Narayan",
                title: "Senior Wealth Advisor & Financial Coach",
                image: "/experts/Ramesh_Narayan_FinPlanner_image.jpg",
                credentials: [
                  "20+ years in Financial Planning",
                  "Ex-Volvo, HP, NetApp",
                  "Author: 'Hit a Six, Don't Get Caught'",
                ],
              },
              {
                name: "V Arun Menon",
                title: "Financial Wellness Coach",
                image: "/experts/Arun_FinExpert_image.jpg",
                credentials: [
                  "32+ years experience",
                  "₹50 Crore+ AUM",
                  "1000+ satisfied clients",
                ],
              },
              {
                name: "Sai Santhosh",
                title: "Chartered Accountant",
                image: "/experts/Santhosh_CA_edited.png",
                credentials: [
                  "VCFO with 6+ years",
                  "Startup specialist",
                  "Tax & compliance expert",
                ],
              },
              {
                name: "Sameer Heda",
                title: "CA & Credit Card Expert",
                image: "/experts/Sameer_CA.png",
                credentials: [
                  "8+ years in finance",
                  "Founder: Mera Mai Card",
                  "100+ clients guided",
                ],
              },
            ].map((expert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-blue-100">
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-1/2 translate-x-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">
                  {expert.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-4 text-center">
                  {expert.title}
                </p>
                <ul className="space-y-2">
                  {expert.credentials.map((cred, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{cred}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              Trusted by 5000+ Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their journey to financial freedom
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "FIREMap has revolutionized how I manage my finances. The clarity and insights are unparalleled!",
                name: "Priya S.",
                title: "IT Project Manager",
                avatar: "PS",
              },
              {
                quote:
                  "Finally, a tool that understands the unique financial needs of salaried professionals in India.",
                name: "Arjun K.",
                title: "Software Development Lead",
                avatar: "AK",
              },
              {
                quote:
                  "The tax planning and FIRE calculator are game-changers. I feel in control of my future.",
                name: "Neha R.",
                title: "Management Consultant",
                avatar: "NR",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about FIREMap
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  id: "faq-1",
                  question: "Is my data secure with FIREMap?",
                  answer:
                    "Absolutely. We prioritize your data security using industry-standard encryption and security protocols. Your financial information is protected with bank-grade security.",
                },
                {
                  id: "faq-2",
                  question: "Who is FIREMap designed for?",
                  answer:
                    "FIREMap is specifically tailored for salaried employees and IT professionals in India who want to take control of their financial planning – from goal setting and SIPs to tax optimization and FIRE planning.",
                },
                {
                  id: "faq-3",
                  question: "How does the FIRE calculator work?",
                  answer:
                    "Our FIRE calculator uses your current income, expenses, savings rate, and investment return assumptions to project your retirement corpus and estimate when you'll achieve financial independence.",
                },
                {
                  id: "faq-4",
                  question: "What support do you offer?",
                  answer:
                    "We provide comprehensive support via email at support@finedge360.com and within the app. Our team is committed to helping you make the most of FIREMap.",
                },
              ].map((faq) => (
                <AccordionItem value={faq.id} key={faq.id} className="border-b">
                  <AccordionTrigger className="text-left hover:no-underline py-5 text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <video
                src="/FIREMap.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-16 w-auto object-contain"
                aria-label="FIREMap Logo"
              />
              <div>
                <div className="font-bold text-xl">FIREMap</div>
                <div className="text-sm text-gray-400">Your GPS to Financial Freedom</div>
              </div>
            </div>
            <div className="text-center md:text-right text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} FIREMap. All rights reserved.</p>
              <p className="mt-1">Made with care for your financial independence</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
