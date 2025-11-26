import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PhoneCall, X, Mail, User, Briefcase, MessageCircle, Calendar, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import useAuthStore from '../utils/authStore';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

export default function Consultation() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [selectedService, setSelectedService] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userMessage, setUserMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a consultation');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (showModal && user) {
      setUserName(profile?.full_name || user?.email?.split('@')[0] || '');
      setUserEmail(user?.email || '');
    }
  }, [showModal, user, profile]);

  const financialServices = [
    { id: 'fire', label: 'FIRE Planning & Early Retirement', icon: '🔥' },
    { id: 'investment', label: 'Investment Strategy & Portfolio Review', icon: '📈' },
    { id: 'tax', label: 'Tax Planning & Optimization', icon: '💰' },
    { id: 'goals', label: 'Financial Goals & SIP Planning', icon: '🎯' },
    { id: 'networth', label: 'Net Worth Analysis & Asset Allocation', icon: '💎' },
    { id: 'retirement', label: 'Retirement Planning', icon: '🏖️' },
    { id: 'insurance', label: 'Insurance & Risk Management', icon: '🛡️' },
    { id: 'general', label: 'General Financial Planning', icon: '📊' },
  ];

  const expertTypes = [
    { id: 'certified', label: 'SEBI Registered Investment Advisor (RIA)', icon: '✅' },
    { id: 'tax', label: 'Chartered Accountant (CA)', icon: '📋' },
    { id: 'financial', label: 'Certified Financial Planner (CFP)', icon: '🎓' },
    { id: 'any', label: 'Any Available Expert', icon: '👤' },
  ];

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first to book a consultation');
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form
    setSelectedService('');
    setSelectedExpert('');
    setUserMessage('');
  };

  const handleSubmitConsultation = async () => {
    // Validation
    if (!selectedService) {
      toast.error('Please select a financial service');
      return;
    }
    if (!selectedExpert) {
      toast.error('Please select an expert type');
      return;
    }
    if (!userName || !userEmail) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email notification to admin and support
      const serviceLabel = financialServices.find(s => s.id === selectedService)?.label || selectedService;
      const expertLabel = expertTypes.find(e => e.id === selectedExpert)?.label || selectedExpert;

      const emailData = {
        to: ['seyonshomefashion@gmail.com', 'support@finedge360.com'],
        subject: `New Consultation Request - ${serviceLabel}`,
        html: `
          <h2>New Consultation Booking Request</h2>
          <p><strong>User Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Phone:</strong> ${userPhone || 'Not provided'}</li>
          </ul>
          <p><strong>Service Requested:</strong> ${serviceLabel}</p>
          <p><strong>Expert Type:</strong> ${expertLabel}</p>
          <p><strong>Additional Message:</strong></p>
          <p>${userMessage || 'No additional message'}</p>
          <hr>
          <p><em>This request was submitted through FinEdge360 consultation booking system.</em></p>
        `,
      };

      // Send to backend API for email
      const response = await fetch(`${API_BASE_URL}/routes/send-consultation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error('Failed to send consultation request');
      }

      toast.success('Consultation request submitted!', {
        description: 'Our team will contact you shortly to schedule your consultation.',
      });

      // Open calendar booking link (placeholder for now)
      const calendarURL = 'https://calendly.com/your-booking-link'; // Replace with actual Calendly link
      setTimeout(() => {
        window.open(calendarURL, '_blank');
        toast.info('Opening calendar to schedule your consultation...', {
          description: 'Please select your preferred date and time.',
        });
      }, 1000);

      handleCloseModal();
    } catch (error: any) {
      console.error('Consultation booking error:', error);
      toast.error('Failed to submit consultation request', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            📞 Book Your FREE Consultation
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized guidance from certified financial experts
          </p>
        </div>

        {/* SEBI Compliance Notice */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">
                  SEBI Registered Expert Consultation
                </p>
                <p className="text-xs text-green-700">
                  Our partner advisors are SEBI Registered Investment Advisors (RIA).
                  This consultation is provided by independent third-party experts, not by FinEdge360.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Call to Action */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <CardDescription>
              Click below to book your FREE 30-minute consultation with our certified experts
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Step 1</p>
                <p className="text-sm text-gray-600">Fill Consultation Form</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Step 2</p>
                <p className="text-sm text-gray-600">Receive Confirmation Email</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <PhoneCall className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">Step 3</p>
                <p className="text-sm text-gray-600">Schedule on Calendar</p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleOpenModal}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
            >
              <PhoneCall className="w-5 h-5 mr-2" />
              Book Your FREE Consultation Now
            </Button>
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card className="mb-6 bg-amber-50 border-amber-300">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">What to Expect</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• FREE 30-minute consultation with certified experts</li>
                  <li>• Personalized financial advice based on your situation</li>
                  <li>• No obligation - purely educational consultation</li>
                  <li>• Confirmation email with meeting details</li>
                  <li>• Calendar invite for easy scheduling</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-red-50 border-2 border-red-300">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900 mb-2">IMPORTANT DISCLAIMER</p>
                <p className="text-xs text-red-800">
                  This consultation is provided by independent SEBI Registered Investment Advisors and certified professionals,
                  NOT by FinEdge360. FinEdge360 is an educational tool and does NOT provide
                  investment advice. The advisors you consult with are third-party professionals
                  with their own certifications. Any investment decisions you make are your
                  responsibility. Please verify the advisor's credentials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-blue-600"
          >
            ← Back to Home
          </Button>
        </div>
      </main>

      {/* Consultation Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Book Your Consultation</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Financial Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  What financial service do you need?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {financialServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedService === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{service.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{service.label}</span>
                        {selectedService === service.id && (
                          <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Expert Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 inline mr-2" />
                  What type of expert do you prefer?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {expertTypes.map((expert) => (
                    <button
                      key={expert.id}
                      onClick={() => setSelectedExpert(expert.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedExpert === expert.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{expert.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{expert.label}</span>
                        {selectedExpert === expert.id && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* User Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tell us a bit about yourself
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email *</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Additional Message (Optional)</label>
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us more about your financial goals or concerns..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitConsultation}
                  disabled={isSubmitting || !selectedService || !selectedExpert}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Processing...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Submit & Schedule
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-600">
                By submitting, you agree to receive emails about your consultation booking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
