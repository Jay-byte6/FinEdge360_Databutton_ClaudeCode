import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, TrendingUp, Shield, Clock, Users, ArrowRight, Flame, Calendar, Bell, PieChart, Target, AlertCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RazorpayCheckout from '../components/RazorpayCheckout';
import CountdownTimer from '../components/CountdownTimer';
import SpotsMeter from '../components/SpotsMeter';
import { toast } from 'sonner';
import useAuthStore from '@/utils/authStore';
import { useNavigate } from 'react-router-dom';

interface PlanFeature {
  text: string;
  included: boolean;
  comingSoon?: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  icon: any;
  price: {
    monthly: number;
    yearly: number;
  };
  popular?: boolean;
  featured?: boolean;
  features: PlanFeature[];
  gradient: string;
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
}

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ plan: string; cycle: 'monthly' | 'yearly' | 'lifetime' } | null>(null);
  const [founder50Stats, setFounder50Stats] = useState<any>(null);

  useEffect(() => {
    // Fetch FOUNDER50 stats
    fetchFounder50Stats();
  }, []);

  const fetchFounder50Stats = async () => {
    try {
      const response = await fetch('http://localhost:8000/routes/promo-stats/FOUNDER50');
      const data = await response.json();
      setFounder50Stats(data);
    } catch (error) {
      console.error('Failed to fetch FOUNDER50 stats:', error);
    }
  };

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'free',
      displayName: 'Free',
      tagline: 'Start your FIRE journey',
      icon: Zap,
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: 'Basic FIRE Calculator', included: true },
        { text: 'Net Worth Tracking', included: true },
        { text: 'Basic Dashboard', included: true },
        { text: 'Tax Planning Insights', included: true },
        { text: 'Community Access', included: true },
        { text: '3D FIRE-Map Journey', included: false },
        { text: 'Advanced SIP Planning', included: false },
        { text: 'Asset Allocation Designer', included: false },
        { text: 'Premium Consultations', included: false },
        { text: 'Export Reports (PDF)', included: false }
      ],
      gradient: 'from-gray-600 to-gray-800',
      buttonText: 'Get Started Free',
      buttonVariant: 'outline'
    },
    {
      id: 'premium',
      name: 'premium',
      displayName: 'Premium',
      tagline: 'Lifetime access + 1 Free Consultation',
      icon: TrendingUp,
      price: { monthly: 2999, yearly: 2999 },
      popular: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: '3D FIRE-Map Journey', included: true },
        { text: 'Advanced SIP Planning', included: true },
        { text: 'Asset Allocation Designer', included: true },
        { text: 'Advanced Portfolio Analysis', included: true },
        { text: 'Tax Optimization Strategies', included: true },
        { text: '1 FREE 45-min Expert Consultation', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Export Reports (PDF)', included: true },
        { text: 'Lifetime access to all features', included: true }
      ],
      gradient: 'from-blue-600 to-cyan-600',
      buttonText: 'Get Premium (One-time)'
    },
    {
      id: 'expert_plus',
      name: 'expert_plus',
      displayName: 'Expert Plus',
      tagline: 'Complete financial management',
      icon: Crown,
      price: { monthly: 3999, yearly: 39999 },
      featured: true,
      features: [
        { text: 'Everything in Premium', included: true },
        { text: '1 Monthly Expert Consultation (45min)', included: true },
        { text: 'FREE Income Tax Filing (ITR 1-4)', included: true },
        { text: 'Peace of Mind - Complete Tax Support', included: true },
        { text: 'Review current investments/SIPs', included: true },
        { text: 'Risk coverage advice', included: true },
        { text: 'Portfolio change advice (market-based)', included: true },
        { text: 'Net Worth Tracker (automated)', included: true, comingSoon: true },
        { text: 'FIRE Tracker (progress monitoring)', included: true, comingSoon: true },
        { text: 'Goal Tracker (multi-goal planning)', included: true, comingSoon: true },
        { text: 'SIP & Insurance Reminders', included: true, comingSoon: true },
        { text: 'Monthly Budget Tracker', included: true, comingSoon: true },
        { text: 'Direct WhatsApp Support', included: true },
        { text: 'Dedicated Financial Advisor', included: true }
      ],
      gradient: 'from-purple-600 to-pink-600',
      buttonText: 'Subscribe Monthly'
    }
  ];

  const handleSelectPlan = (planId: string, cycle: 'monthly' | 'yearly' | 'lifetime') => {
    if (!isAuthenticated) {
      toast.info('Please login to subscribe');
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      toast.info('You are already on the Free plan!');
      return;
    }

    setSelectedPlan({ plan: planId, cycle });
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (subscriptionId: string, accessCode: string) => {
    setShowCheckout(false);
    toast.success('🎉 Welcome to Premium! Refreshing your dashboard...');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Choose Your Financial Freedom Path</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start free, upgrade when ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* FOUNDER50 Banner - Only show if active */}
        {founder50Stats && founder50Stats.active && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                      <Flame className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        FOUNDER50 - Lifetime Access
                        <Badge className="bg-red-600 text-white">LIMITED</Badge>
                      </h3>
                      <p className="text-gray-700 font-medium">₹14,999 one-time • Never pay subscription fees again!</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectPlan('premium', 'lifetime')}
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold shadow-lg"
                  >
                    Claim Your Spot
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Spots Remaining:</p>
                    <SpotsMeter
                      totalSlots={founder50Stats.total_slots}
                      usedSlots={founder50Stats.used_slots}
                      promoCode="FOUNDER50"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Time Remaining:</p>
                    <CountdownTimer endDate={founder50Stats.end_date} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = plan.price.monthly;
            // Premium is one-time, Expert Plus is monthly
            const isPremium = plan.id === 'premium';
            const isExpertPlus = plan.id === 'expert_plus';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className={`relative ${plan.popular || plan.featured ? 'md:scale-105' : ''}`}
              >
                <Card className={`h-full border-2 ${
                  plan.featured
                    ? 'border-purple-400 shadow-2xl shadow-purple-200'
                    : plan.popular
                    ? 'border-blue-400 shadow-2xl shadow-blue-200'
                    : 'border-gray-200 shadow-lg'
                }`}>
                  {(plan.popular || plan.featured) && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className={`px-4 py-1 ${
                        plan.featured
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                      } text-white text-sm font-bold shadow-lg`}>
                        {plan.featured ? '👑 BEST VALUE' : '⭐ ONE-TIME PAYMENT'}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="space-y-4 pt-8">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {plan.displayName}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        {plan.tagline}
                      </CardDescription>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          ₹{price.toLocaleString()}
                        </span>
                        {price > 0 && (
                          <span className="text-gray-500">
                            {isPremium ? 'one-time' : isExpertPlus ? '/month' : ''}
                          </span>
                        )}
                      </div>
                      {isPremium && price > 0 && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          Lifetime access • No recurring fees
                        </p>
                      )}
                      {isExpertPlus && (
                        <p className="text-sm text-purple-600 font-semibold mt-1">
                          Billed monthly • Cancel anytime
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 ${feature.included ? 'text-green-600' : 'text-gray-300'}`}>
                            <Check className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                              {feature.text}
                            </span>
                            {feature.comingSoon && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan.id, isPremium ? 'lifetime' : 'monthly')}
                      className={`w-full py-6 text-lg font-semibold ${
                        plan.featured
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                          : plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                          : ''
                      }`}
                      variant={plan.buttonVariant || 'default'}
                    >
                      {plan.buttonText}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { icon: Shield, text: 'SEBI Registered Advisors', color: 'blue' },
            { icon: Users, text: '500+ Happy Users', color: 'green' },
            { icon: Clock, text: '24/7 Support', color: 'purple' },
            { icon: TrendingUp, text: 'Proven Results', color: 'orange' }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg"
            >
              <div className={`w-12 h-12 rounded-full bg-${item.color}-100 flex items-center justify-center mb-3`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <p className="font-semibold text-gray-900">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section (Optional - can be added later) */}
      </div>

      {/* Razorpay Checkout Modal */}
      {showCheckout && selectedPlan && (
        <RazorpayCheckout
          planName={selectedPlan.plan}
          billingCycle={selectedPlan.cycle}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
};

export default Pricing;
