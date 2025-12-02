import React, { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Added this line
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

export default function App() {
  const [uspApi, setUspApi] = useState<CarouselApi>();
  const autoplayIntervalUSP = 2000; // 3 seconds
  const autoplayRefUSP = useRef<NodeJS.Timeout | null>(null);

  const stopAutoplayUSP = useCallback(() => {
    if (autoplayRefUSP.current) {
      clearInterval(autoplayRefUSP.current);
      autoplayRefUSP.current = null;
    }
  }, []);

  const startAutoplayUSP = useCallback(() => {
    if (!uspApi) return;
    stopAutoplayUSP(); // Clear any existing interval before starting a new one
    autoplayRefUSP.current = setInterval(() => {
      if (uspApi.canScrollNext()) {
        uspApi.scrollNext();
      } else {
        uspApi.scrollTo(0); // Loop back to start
      }
    }, autoplayIntervalUSP);
  }, [uspApi, stopAutoplayUSP]);

  useEffect(() => {
    if (!uspApi) {
      return;
    }
    startAutoplayUSP();
    return () => stopAutoplayUSP();
  }, [uspApi, startAutoplayUSP, stopAutoplayUSP]);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const scrollBenefitPanelsData = [
    {
      id: "overview",
      title: "End-to-End Financial Planning",
      copy: "Track Net Worth, Plan FIRE, Build tailored SIP Plans, Do intelligent Tax Planning, and get diversified portfolio suggestions all in one platform.",
      bgColor: "bg-purple-50",
      placeholderColor: "bg-purple-200",
      textColor: "text-purple-800",
      titleColor: "text-purple-900",
    },
    {
      id: "insights", // New ID for this specific phrasing
      title: "Personalized & Instant Insights (No Advisor Needed)",
      copy: "Get comprehensive reports and insights instantly by just entering your numbers, no advisor calls needed.",
      bgColor: "bg-cyan-50",
      placeholderColor: "bg-cyan-200",
      textColor: "text-cyan-800",
      titleColor: "text-cyan-900",
    },
    {
      id: "tax",
      title: "Maximize Your Tax Savings",
      copy: "Stop overpaying on taxes and discover hidden opportunities to keep more of your hard-earned money.",
      bgColor: "bg-emerald-50",
      placeholderColor: "bg-emerald-200",
      textColor: "text-emerald-800",
      titleColor: "text-emerald-900",
    },
    {
      id: "quickinsights", // New ID for this variant
      title: "Instant Personalized Insights",
      copy: "See immediate financial projections and key metrics as soon as you input your data, visualized clearly for quick understanding.",
      bgColor: "bg-lime-50",
      placeholderColor: "bg-lime-200",
      textColor: "text-lime-800",
      titleColor: "text-lime-900",
    },
    {
      id: "goals",
      title: "Unlock Smart Financial Guidance",
      copy: "Receive personalized tips and alerts that empower you to make smarter financial decisions, effortlessly.",
      bgColor: "bg-amber-50",
      placeholderColor: "bg-amber-200",
      textColor: "text-amber-800",
      titleColor: "text-amber-900",
    },
    {
      id: "dreams",
      title: "Reach Your Financial Dreams",
      copy: "Turn your biggest financial goals, like early retirement or a dream home, into an actionable reality.",
      bgColor: "bg-rose-50",
      placeholderColor: "bg-rose-200",
      textColor: "text-rose-800",
      titleColor: "text-rose-900",
    },
    {
      id: "fire",
      title: "Built For Professionals Like You",
      copy: "Finally, a financial tool that understands the specific needs and ambitions of salaried and IT experts.",
      bgColor: "bg-sky-50",
      placeholderColor: "bg-sky-200",
      textColor: "text-sky-800",
      titleColor: "text-sky-900",
    },
    {
      id: "security",
      title: "Your Data, Secured",
      copy: "Feel confident knowing your most sensitive financial information is protected with ironclad security.",
      bgColor: "bg-slate-100",
      placeholderColor: "bg-slate-300",
      textColor: "text-slate-800",
      titleColor: "text-slate-900",
    },
  ];

  const featuresData = [
    {
      title: "FIRE Calculator",
      description: "Chart your path to early retirement. Understand your FIRE number and timeline with precision.",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6c.001.03.002.06.002.091.001.031.002.061.002.092a4.5 4.5 0 108.084-2.174c.002-.03.003-.06.003-.091.001-.031.002-.061.002-.092a4.5 4.5 0 00-2.724-4.176zM12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" /> </svg>),
      iconBgColor: "bg-blue-100",
      path: "/FIRECalculator",
    },
    {
      title: "SIP Goal Planner",
      description: "Achieve your dreams. Plan your Systematic Investment Plans for every financial goal.",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600"> <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /> </svg>),
      iconBgColor: "bg-green-100",
      path: "/SIPPlanner",
    },
    {
      title: "Net Worth Tracker",
      description: "See your complete financial picture. Track assets & liabilities in real-time.",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-teal-600"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M12 6.75h.008v.008H12V6.75z" /> </svg>),
      iconBgColor: "bg-teal-100",
      path: "/NetWorth",
    },
    {
      title: "Tax Optimizer",
      description: "Maximize your savings. Get smart insights for efficient tax planning and optimization.",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622a11.99 11.99 0 00-.598-3.75c-.381-1.162-.924-2.255-1.564-3.224a11.959 11.959 0 01-2.18-2.673A11.959 11.959 0 0112 2.25z" /> </svg>),
      iconBgColor: "bg-indigo-100",
      path: "/TaxPlanning",
    },
  ];



  const handleGetStarted = () => {
    // Navigate to Enter Details page if authenticated, otherwise go to login
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
    // Require authentication before booking consultation
    if (isAuthenticated) {
      // Navigate to consultation booking
      navigate("/consultation");
    } else {
      // Redirect to login with return URL
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-green-600 to-teal-700 text-white py-20 md:py-32">
        {/* Optional: Subtle pattern or overlay for depth can be added if desired later */}
        <div className="container mx-auto px-6 relative z-1"> {/* text-center removed, will be applied to text column */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-120 py-10 md:py-10"> {/* Added padding for container, and gap for columns */}
            {/* Text Content */}
            <div className="md:w-3/5 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Unlock Your Financial Potential. <span className="block sm:inline">Secure Your Future.</span>
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto md:mx-0">
                Plan Smart. Retire Early. Save Max Tax.
              </p>
              <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto md:mx-0">
                FinEdge360 empowers <span className="font-semibold text-white">Salaried & IT Professionals</span> with intelligent tools for goal planning, investment tracking, and tax optimization – all designed for your dynamic career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg px-12 py-5 shadow-xl hover:shadow-2xl rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Start My Financial Plan
                </Button>
                <Button
                  size="lg"
                  onClick={handleBookConsultation}
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold text-lg px-8 py-5 shadow-xl hover:shadow-2xl rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white"
                >
                  📞 Book FREE Consultation
                </Button>
              </div>
            </div>
            {/* Image Content */}
            <div className="md:w-2/5 flex justify-center md:justify-end mt-10 md:mt-0">
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/man-seat-on-money-stack-and-achieve-financial-freedom-7303350-6000052.png"
                alt="Man achieving financial freedom with FinEdge360"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 md:py-24 bg-white px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Pillars of Your Financial Strategy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empowering you with the tools and insights for a secure and prosperous financial future.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* This map function assumes 'featuresData' is defined in the component scope */}
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 flex flex-col items-center text-center cursor-pointer group"
                onClick={() => navigate(feature.path)}
              >
                <div className={`p-4 ${feature.iconBgColor} rounded-full mb-6 inline-block transition-transform duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* User Benefits / USPs Section - New Side-by-Side Scroll */}
      {/* User Benefits / USPs Section - Horizontal Carousel */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="text-center mb-12 md:mb-16 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How FinEdge360 Transforms Your Finances
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Swipe or use the arrows to explore the key benefits and take control of your financial future.
          </p>
        </div>
        <Carousel
          setApi={setUspApi}
          opts={{ align: "start", loop: true }}
          onMouseEnter={stopAutoplayUSP}
          onMouseLeave={startAutoplayUSP}
          className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-0"
        >
          <CarouselContent className="-ml-4">
            {scrollBenefitPanelsData.map((panel, index) => {
              const { id, bgColor, textColor, titleColor, title, copy, placeholderColor } = panel;
              let iconContent = null;
              if (id === "fire") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-sky-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6c.001.03.002.06.002.091.001.031.002.061.002.092a4.5 4.5 0 108.084-2.174c.002-.03.003-.06.003-.091.001-.031.002-.061.002-.092a4.5 4.5 0 00-2.724-4.176zM12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                  </svg>
                );
              } else if (id === "tax") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m15 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m12 3c0 1.657-1.343 3-3 3s-3-1.343-3-3m6 0c0-1.657-1.343-3-3-3S9 7.343 9 9m4.5 0a2.25 2.25 0 012.25-2.25h.008c.414 0 .75.336.75.75s-.336.75-.75.75h-.008a2.25 2.25 0 01-2.25-2.25zM12 9.75A.75.75 0 0112.75 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008A.75.75 0 0112 9.75z" />
                  </svg>
                );
              } else if (id === "goals") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                );
              } else if (id === "overview") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                );
              } else if (id === "insights") { // New ID
                iconContent = (
                  // Lightbulb icon
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-cyan-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311V21m-3.75-2.311V21m0 0a3 3 0 01-3-3V6.75A3 3 0 019 3.75h6a3 3 0 013 3v8.25a3 3 0 01-3 3z" />
                  </svg>
                );
              } else if (id === "quickinsights") { // New ID
                iconContent = (
                  // Bar chart icon
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-lime-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                );
              } else if (id === "goals") { // Existing, ensure it's after new ones if order matters for if/else
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                );
              } else if (id === "dreams") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-rose-600">
                    {/* Re-using goals line graph for dreams, colored rose */}
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                );
              } else if (id === "fire") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-sky-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6c.001.03.002.06.002.091.001.031.002.061.002.092a4.5 4.5 0 108.084-2.174c.002-.03.003-.06.003-.091.001-.031.002-.061.002-.092a4.5 4.5 0 00-2.724-4.176zM12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                  </svg>
                );
              } else if (id === "security") {
                iconContent = (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                );
              }
              return (
                <CarouselItem key={id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <div className={`p-6 rounded-xl shadow-lg flex flex-col items-center text-center h-full ${bgColor} border border-gray-200 min-h-[420px] md:min-h-[450px]`}>
                    <div className={`mb-6 mt-2 p-4 rounded-full ${placeholderColor}`}>
                      {iconContent}
                    </div>
                    <h3 className={`text-xl lg:text-2xl font-semibold mb-3 ${titleColor}`}>
                      {title}
                    </h3>
                    <p className={`text-sm lg:text-base leading-relaxed ${textColor} px-2`}>
                      {copy}
                    </p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="absolute left-[-20px] sm:left-[-24px] top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-[-20px] sm:right-[-24px] top-1/2 -translate-y-1/2" />
          </div>
        </Carousel>
      </section>

      {/* New CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Take the first step towards financial clarity and independence. FinEdge360 empowers you with the tools and insights you need.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Get Started Today
            </Button>
            <Button
              onClick={handleLogin}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Our Experts Section */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Experts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the professionals dedicated to your financial success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                name: "Ramesh Narayan",
                title: "Senior Wealth Advisor & Financial Coach",
                image: "/experts/Ramesh_Narayan_FinPlanner_image.jpg",
                credentials: [
                  "20+ years in Financial Planning, Analysis & Technology.",
                  "Experience at Volvo, HP, NetApp.",
                  "Author: 'Hit a Six, Don't Get Caught'.",
                  "Founder: The Wealthy Wickets & Ramesh Narayan International.",
                  "Renowned for integrating profound financial acumen with a result-driven coaching approach."
                ]
              },
              {
                name: "V Arun Menon",
                title: "Financial Wellness Coach & Founder of VAM FinProServ",
                image: "/experts/Arun_FinExpert_image.jpg",
                credentials: [
                  "32+ years of overall experience, 22+ insurance.",
                  "Manages AUM of ₹50 Crore+ in Mutual Funds.",
                  "Serves 1000+ clients.",
                  "Certified Insurance Advisor, Expert Financial Goal Planner & Wealth Manager."
                ]
              },
              {
                name: "Sai Santhosh",
                title: "Chartered Accountant & Startup Management Partner",
                image: "/experts/Santhosh_CA_edited.png",
                credentials: [
                  "VCFO (6+ Years): Your financial co-pilot.",
                  "Investment & Planning: Growth-focused strategies.",
                  "Compliance Pro: GST, ITR, ROC simplified.",
                  "Funding Facilitator: End-to-end support. Both Private and Banks."
                ]
              },
              {
                name: "Sameer Heda",
                title: "CA turned Credit Card Expert",
                image: "/experts/Sameer_CA.png",
                credentials: [
                  "8+ years in business finance, tax, & credit card strategy.",
                  "Founder of Mera Mai Card (AI-powered credit card optimization).",
                  "Guided 100+ clients in maximizing credit card rewards.",
                  "Simplifies complex credit card programs."
                ]
              }
            ].map((expert, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out p-6 flex flex-col items-center text-center">
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-28 h-28 rounded-full mb-4 border-3 border-gray-200 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{expert.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-4">{expert.title}</p>
                <ul className="text-left text-xs text-gray-700 space-y-2">
                  {expert.credentials.map((credential, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{credential}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof/Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-800">
            Trusted by 5000+ Professionals Like You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "FinEdge360 has revolutionized how I manage my finances. The clarity and insights are unparalleled!",
                name: "Priya S.",
                title: "IT Project Manager",
                avatar: "PS"
              },
              {
                quote: "Finally, a tool that understands the unique financial needs of salaried professionals in India. Highly recommended!",
                name: "Arjun K.",
                title: "Software Development Lead",
                avatar: "AK"
              },
              {
                quote: "The tax planning and FIRE calculator are game-changers. I feel much more in control of my financial future.",
                name: "Neha R.",
                title: "Management Consultant",
                avatar: "NR"
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col">
                <svg className="w-10 h-10 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 4.078c.328-.087.672-.087 1 0C12.167 4.26 13 5.27 13 6.5c0 .48-.147.922-.398 1.297Q12.211 8.25 12 8.5q-.211.25-.398.453A1.993 1.993 0 0011 10.5c0 .933.667 1.74 1.5 2.25.328.187.789.347 1.297.398.453.049.909-.02 1.297-.147q.25-.079.453-.147c.933-.328 1.74-.667 2.25-1.5.187-.328.347-.789.398-1.297.049-.453-.02-.909-.147-1.297q-.079-.25-.147-.453c-.328-.933-.667-1.74-1.5-2.25A4.016 4.016 0 0015.5 5c-.933-.667-1.74-.667-2.25-1.5A4.004 4.004 0 0011.953.398C11.5.347 11.047.211 10.5 0 9.953.211 9.5.347 9.047.398A4.004 4.004 0 007.75 1.5C7.083.833 6.26.833 5.5 1.5A4.016 4.016 0 004.203 5c-.933.667-1.74.667-2.25 1.5q-.079.25-.147.453c-.127.388-.196.844-.147 1.297.049.453.211.909.398 1.297.504.833 1.309 1.172 2.25 1.5q.25.079.453.147c.388.127.844.196 1.297.147.504-.049.951-.211 1.297-.398.833-.504 1.5-1.317 1.5-2.25A1.993 1.993 0 008.953 8.953Q8.789 8.75 8.5 8.5q-.211-.25-.398-.453A1.993 1.993 0 017.5 6.5c0-1.23.833-2.24 1.5-2.422.328-.087.672-.087 1 0zM4.5 6.5c0 .933-.667 1.74-1.5 2.25-.328.187-.789.347-1.297.398-.453.049-.909-.02-1.297-.147q-.25-.079-.453-.147c-.933-.328-1.74-.667-2.25-1.5A1.993 1.993 0 01-2.5 5c.667-.933 1.317-1.5 2.25-1.5q.388-.127.844-.196c.453-.049.909.02 1.297.147q.25.079.453.147c.933.328 1.74.667 2.25 1.5A1.993 1.993 0 014.5 6.5z" />
                </svg>
                <p className="text-gray-700 italic text-base leading-relaxed mb-6 flex-grow">
                  \"{testimonial.quote}\"
                </p>
                <div className="mt-auto pt-4 border-t border-slate-200">
                  <p className="text-gray-800 font-semibold text-md">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-800">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                id: "faq-1",
                question: "Is my data secure with FinEdge360?",
                answer: "Absolutely. We prioritize your data security using industry-standard encryption and security protocols to ensure your financial information is always protected. Your trust is paramount to us."
              },
              {
                id: "faq-2",
                question: "Who is FinEdge360 designed for?",
                answer: "FinEdge360 is specifically tailored for salaried employees and IT professionals in India who are looking to take proactive control of their financial planning – from goal setting and SIPs to tax optimization and FIRE (Financial Independence, Retire Early) planning."
              },
              {
                id: "faq-3",
                question: "How does the FIRE calculator work?",
                answer: "Our FIRE calculator uses your current income, expenses, savings rate, and personalized investment return assumptions to project your required retirement corpus. It then estimates the number of years it will take for you to reach financial independence based on your contributions."
              },
              {
                id: "faq-4",
                question: "What kind of support do you offer if I have questions?",
                answer: "We're here to assist you! You can reach our support team via email at support@finedge360.com or through other contact options available within the app once you're logged in. We are committed to helping you make the most of FinEdge360."
              }
            ].map((faq) => (
              <AccordionItem value={faq.id} key={faq.id} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left hover:no-underline py-4 text-lg font-medium text-gray-700 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="https://static.databutton.com/public/c20b7149-cba2-4252-9e94-0e8406b7fcec/FinEdge360_Logo_screenshot.png" alt="FinEdge360 Logo" className="h-14 w-auto mr-2" />
              <span className="text-gray-600 font-semibold">FinEdge360</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} FinEdge360. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
