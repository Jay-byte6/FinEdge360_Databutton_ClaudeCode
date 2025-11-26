import React, { useState } from 'react';
import CountdownTimer from '../components/CountdownTimer';
import SpotsMeter from '../components/SpotsMeter';
import PromoCodeInput from '../components/PromoCodeInput';
import { usePromoStats, useActivePromos } from '../hooks/usePromoStats';
import { Sparkles, Gift, Clock, Users } from 'lucide-react';

const PromoShowcase: React.FC = () => {
  const [selectedPromo, setSelectedPromo] = useState<string>('FOUNDER50');
  const { stats, loading, error } = usePromoStats(selectedPromo, true, 10000);
  const { promos, loading: promosLoading } = useActivePromos(true, 30000);

  const handleValidCode = (code: string, details: any) => {
    console.log('Valid code applied:', code, details);
    // Here you would typically store this in state/context for the checkout flow
  };

  const handleInvalidCode = (code: string, message: string) => {
    console.log('Invalid code:', code, message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <Sparkles className="w-4 h-4" />
            Limited Time Offer
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Exclusive Founder's Circle
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join the first 50 members and get lifetime Premium access with exclusive benefits
          </p>
        </div>

        {/* Main FOMO Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Timer & Spots */}
          <div className="space-y-6">
            {/* Countdown Timer Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Offer Expires In
                </h2>
              </div>
              {stats?.end_date && (
                <CountdownTimer
                  targetDate={new Date(stats.end_date)}
                  size="lg"
                  className="justify-center"
                  onExpire={() => console.log('Promo expired!')}
                />
              )}
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                This is a one-time opportunity that won't be repeated
              </div>
            </div>

            {/* Spots Meter Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Limited Availability
                </h2>
              </div>
              {loading && (
                <div className="text-center py-8 text-gray-500">Loading stats...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-500">
                  Error: {error}
                </div>
              )}
              {stats && (
                <SpotsMeter
                  totalSlots={stats.total_slots || 50}
                  usedSlots={stats.used_slots}
                  promoCode={stats.code}
                  promoName={stats.code_name}
                  size="lg"
                  animated={true}
                />
              )}
            </div>
          </div>

          {/* Right: Benefits & Promo Code */}
          <div className="space-y-6">
            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="w-6 h-6" />
                <h2 className="text-2xl font-bold">What You Get</h2>
              </div>
              <ul className="space-y-4">
                {[
                  {
                    title: 'Lifetime Premium Access',
                    desc: 'Never pay monthly fees again - one-time deal',
                  },
                  {
                    title: '45-Minute Expert Consultation',
                    desc: 'Free session with SEBI registered advisor',
                  },
                  {
                    title: 'Founder Badge',
                    desc: 'Exclusive recognition as an early supporter',
                  },
                  {
                    title: 'Priority Support',
                    desc: '24/7 premium support for all your queries',
                  },
                  {
                    title: 'Future Features Access',
                    desc: 'First access to all new features we launch',
                  },
                ].map((benefit, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold">{benefit.title}</div>
                      <div className="text-sm text-white/80">{benefit.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-sm text-white/80 mb-2">Regular Price</div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold line-through opacity-60">
                    ₹11,988
                  </span>
                  <span className="text-4xl font-bold">₹0</span>
                </div>
                <div className="text-sm mt-1 text-white/80">
                  Save ₹11,988 per year • Lifetime access
                </div>
              </div>
            </div>

            {/* Promo Code Input Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Enter Promo Code
              </h2>
              <PromoCodeInput
                onValidCode={handleValidCode}
                onInvalidCode={handleInvalidCode}
                placeholder="FOUNDER50"
                buttonText="Validate"
                size="lg"
              />
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                Use code <span className="font-mono font-bold">FOUNDER50</span> to unlock
                this offer
              </div>
            </div>
          </div>
        </div>

        {/* Active Promos Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            All Active Promotions
          </h2>
          {promosLoading && (
            <div className="text-center py-8 text-gray-500">Loading promotions...</div>
          )}
          {!promosLoading && promos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active promotions at the moment
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <div
                key={promo.code}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all cursor-pointer"
                onClick={() => setSelectedPromo(promo.code)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-lg text-purple-600">
                    {promo.code}
                  </span>
                  {promo.code === selectedPromo && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {promo.code_name}
                </h3>
                {promo.total_slots && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {promo.remaining_slots}/{promo.total_slots} spots left
                  </div>
                )}
                {promo.time_remaining && (
                  <div className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                    Expires in: {promo.time_remaining}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
            Join These Happy Founders
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Raj K.',
                role: 'Software Engineer',
                quote: 'Best investment decision! The FIRE planner alone is worth it.',
              },
              {
                name: 'Priya M.',
                role: 'Entrepreneur',
                quote: 'Expert consultation helped me optimize my portfolio perfectly.',
              },
              {
                name: 'Amit S.',
                role: 'Finance Professional',
                quote: 'Lifetime access at this price? No-brainer for serious investors.',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoShowcase;
