import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle2, Shield, Sparkles,
  ArrowRight, Lock, Crown, Zap, Users, Star,
  Phone, Mail, MessageSquare, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useAuthStore from '../utils/authStore';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

interface ConsultationType {
  type_name: string;
  duration_minutes: number;
  price: number;
  is_free: boolean;
  description: string;
  features: string[];
}

export default function ConsultationNew() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuthStore();

  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userMessage, setUserMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a consultation');
      navigate('/login');
      return;
    }

    fetchConsultationTypes();

    if (user) {
      setUserName(profile?.full_name || user?.email?.split('@')[0] || '');
      setUserEmail(user?.email || '');
    }
  }, [isAuthenticated, navigate, user, profile]);

  const fetchConsultationTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/routes/consultation-types`);
      const data = await response.json();

      if (data.success) {
        setConsultationTypes(data.consultation_types);
      }
    } catch (error) {
      console.error('Failed to fetch consultation types:', error);
      toast.error('Failed to load consultation options');
    } finally {
      setLoading(false);
    }
  };

  const financialServices = [
    { id: 'fire', label: 'FIRE Planning & Early Retirement', gradient: 'from-orange-500 to-red-500' },
    { id: 'investment', label: 'Investment Strategy & Portfolio Review', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'tax', label: 'Tax Planning & Optimization', gradient: 'from-green-500 to-emerald-500' },
    { id: 'goals', label: 'Financial Goals & SIP Planning', gradient: 'from-purple-500 to-pink-500' },
    { id: 'networth', label: 'Net Worth Analysis', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'retirement', label: 'Retirement Planning', gradient: 'from-indigo-500 to-purple-500' },
  ];

  const handleSelectType = (typeName: string) => {
    setSelectedType(typeName);

    if (typeName === 'premium_consultation') {
      // Check if user has premium subscription
      // For now, just proceed to booking
      setShowBookingModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/routes/book-consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.uid,
          consultation_type: selectedType,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          user_name: userName,
          user_email: userEmail,
          user_phone: userPhone,
          selected_service: selectedService,
          user_message: userMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Consultation booked successfully!', {
          description: 'You will receive a confirmation email shortly.',
        });
        setShowBookingModal(false);
        // Reset form
        setSelectedService('');
        setSelectedDate('');
        setSelectedTime('');
        setUserMessage('');
      } else {
        throw new Error(data.detail || 'Failed to book consultation');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('Failed to book consultation', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const discoveryCall = consultationTypes.find(t => t.type_name === 'discovery_call');
  const premiumConsultation = consultationTypes.find(t => t.type_name === 'premium_consultation');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg shadow-blue-500/50"
            >
              <Sparkles className="w-4 h-4" />
              Expert Financial Guidance
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
              Book Your Expert
              <br />
              Consultation
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get personalized financial guidance from SEBI certified advisors.
              Choose the consultation that fits your needs.
            </p>
          </motion.div>

          {/* Two-Tier Consultation Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {/* Discovery Call */}
            {discoveryCall && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl">
                  {/* Card Header */}
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
                        FREE
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Discovery Call
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {discoveryCall.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{discoveryCall.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>For Everyone</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-8">
                    <div className="space-y-4 mb-8">
                      {discoveryCall.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSelectType('discovery_call')}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <span>Book Discovery Call</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            )}

            {/* Premium Consultation */}
            {premiumConsultation && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                {/* Premium Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    PREMIUM ONLY
                  </div>
                </div>

                <Card className="relative overflow-hidden border-2 border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/80 dark:to-pink-950/80 backdrop-blur-xl shadow-xl hover:shadow-2xl">
                  {/* Premium Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10" />

                  {/* Card Header */}
                  <div className="relative p-8 border-b border-purple-100 dark:border-purple-900">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                        <Lock className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                        <span className="text-purple-700 dark:text-purple-400 text-sm font-bold">
                          Premium Required
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-pink-900 dark:from-purple-100 dark:to-pink-100 bg-clip-text text-transparent mb-2">
                      Premium Consultation
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {premiumConsultation.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{premiumConsultation.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span>In-Depth Analysis</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="relative p-8">
                    <div className="space-y-4 mb-8">
                      {premiumConsultation.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSelectType('premium_consultation')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Book Premium Consultation
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>

                  {/* Premium Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            )}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    SEBI Certified Advisors
                  </h4>
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  All consultations are provided by independent SEBI Registered Investment Advisors (RIA) and certified financial professionals. FIREMap is an educational platform and does not provide investment advice directly.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedType === 'discovery_call' ? 'Book Discovery Call' : 'Book Premium Consultation'}
                    </h3>
                    <p className="text-sm text-white/80">
                      {selectedType === 'discovery_call' ? '15 minutes' : '45 minutes'} consultation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    What would you like to discuss? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {financialServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedService === service.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                            : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.label}
                          </span>
                          {selectedService === service.id && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Additional Message (Optional)
                    </label>
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-white resize-none"
                      placeholder="Tell us more about your financial goals..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-6 text-base font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBookConsultation}
                    disabled={isSubmitting || !selectedService || !selectedDate || !selectedTime}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
