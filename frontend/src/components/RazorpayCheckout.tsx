import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, XCircle, Loader2, Sparkles, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthStore from '@/utils/authStore';
import { API_ENDPOINTS } from '@/config/api';

interface RazorpayCheckoutProps {
  planName: string; // 'premium' or 'expert_plus'
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  onSuccess?: (subscriptionId: string, accessCode: string) => void;
  onClose?: () => void;
}

interface PaymentConfig {
  razorpay: {
    enabled: boolean;
    key_id: string | null;
  };
  stripe: {
    enabled: boolean;
    publishable_key: string;
  };
}

interface OrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  subscription_id: string;
  access_code: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  planName,
  billingCycle,
  onSuccess,
  onClose
}) => {
  const { user } = useAuthStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [originalAmount, setOriginalAmount] = useState(0);

  // Plan pricing (in rupees)
  const planPricing = {
    premium: {
      monthly: 3999,
      yearly: 3999,
      lifetime: 3999
    },
    expert_plus: {
      monthly: 1999,
      yearly: 19999,
      lifetime: 0
    },
    founder50: {
      lifetime: 14999
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (planName === 'founder50' && billingCycle === 'lifetime') return 'FOUNDER50 Lifetime Access';
    if (planName === 'expert_plus') return 'Expert Plus';
    return 'Premium';
  };

  // Get price
  const getPrice = () => {
    // FOUNDER50 special promo (only when explicitly selected)
    if (planName === 'founder50' && billingCycle === 'lifetime') {
      return planPricing.founder50.lifetime;
    }
    // Regular plans (including Premium lifetime at ₹3,999)
    return planPricing[planName as keyof typeof planPricing]?.[billingCycle] || 0;
  };

  const finalAmount = getPrice() - discount;

  // Update original amount when plan or billing cycle changes
  useEffect(() => {
    setOriginalAmount(getPrice());
  }, [planName, billingCycle]);

  // Load payment config and Razorpay script once on mount
  useEffect(() => {
    fetchPaymentConfig();
    loadRazorpayScript();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.paymentConfig);
      const data = await response.json();
      setPaymentConfig(data);
    } catch (error) {
      console.error('Failed to fetch payment config:', error);
      toast.error('Failed to load payment configuration');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.validatePromoCode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase() })
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedPromo(promoCode.toUpperCase());

        // Calculate discount
        if (data.promo.discount_percentage) {
          const discountAmount = (originalAmount * data.promo.discount_percentage) / 100;
          setDiscount(discountAmount);
          toast.success(`${data.promo.discount_percentage}% discount applied! Save ₹${discountAmount}`);
        }
      } else {
        toast.error(data.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      toast.error('Failed to validate promo code');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user?.id) {
      toast.error('Please login to continue');
      return;
    }

    if (!paymentConfig?.razorpay.enabled) {
      toast.error('Payment gateway not configured');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch(API_ENDPOINTS.createRazorpayOrder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          plan_name: billingCycle === 'lifetime' ? 'premium' : planName,
          billing_cycle: billingCycle,
          promo_code: appliedPromo,
          payment_method: 'razorpay'
        })
      });

      const orderData: OrderResponse = await orderResponse.json();

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'FinEdge360',
        description: `${getDisplayName()} - ${billingCycle}`,
        image: 'https://static.databutton.com/public/c20b7149-cba2-4252-9e94-0e8406b7fcec/FinEdge360_Logo_screenshot.png',
        prefill: {
          name: user.email?.split('@')[0] || '',
          email: user.email || '',
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: any) => {
          await verifyPayment(orderData.order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    setVerifying(true);

    try {
      const response = await fetch(API_ENDPOINTS.verifyRazorpayPayment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          order_id: orderId,
          payment_id: paymentId,
          signature: signature,
          plan_name: billingCycle === 'lifetime' ? 'premium' : planName,
          billing_cycle: billingCycle,
          promo_code: appliedPromo
        })
      });

      const data: VerifyResponse = await response.json();

      if (data.success) {
        toast.success('🎉 Payment successful! Welcome to Premium!');

        // Show access code
        setTimeout(() => {
          toast.success(`Your Access Code: ${data.access_code}`, {
            duration: 10000
          });
        }, 1000);

        if (onSuccess) {
          onSuccess(data.subscription_id, data.access_code);
        }

        // Refresh page after 3 seconds to update subscription status
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-blue-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Secure Checkout</CardTitle>
                    <CardDescription className="text-blue-100">
                      {getDisplayName()}
                    </CardDescription>
                  </div>
                </div>
                {billingCycle === 'lifetime' && (
                  <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    LIMITED
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Payment not configured warning */}
              {!paymentConfig?.razorpay.enabled && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-900">Payment Gateway Not Configured</p>
                    <p className="text-yellow-700">Please contact support to complete your subscription.</p>
                  </div>
                </div>
              )}

              {/* Promo Code Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Have a Promo Code?</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={appliedPromo !== null || loading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={appliedPromo !== null || loading || !promoCode.trim()}
                    variant="outline"
                    className="min-w-[100px]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : appliedPromo ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                {appliedPromo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-green-600"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">{appliedPromo} applied!</span>
                  </motion.div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Plan Price</span>
                  <span className="font-semibold text-gray-900">₹{originalAmount.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-semibold text-green-600">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="h-px bg-gray-300"></div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <div className="text-right">
                    {discount > 0 && (
                      <div className="text-sm text-gray-500 line-through">₹{originalAmount.toLocaleString()}</div>
                    )}
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{finalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {billingCycle === 'monthly' && (
                  <div className="text-xs text-gray-500 text-center">
                    Billed monthly • Cancel anytime
                  </div>
                )}
                {billingCycle === 'yearly' && (
                  <div className="text-xs text-gray-500 text-center">
                    Billed annually • Save 17%
                  </div>
                )}
                {billingCycle === 'lifetime' && (
                  <div className="text-xs text-green-600 text-center font-semibold">
                    One-time payment • Lifetime access • Never pay again!
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Secured by Razorpay • 256-bit SSL</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || verifying}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={loading || verifying || !paymentConfig?.razorpay.enabled}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ₹{finalAmount.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="text-center text-xs text-gray-500">
                <p>By proceeding, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RazorpayCheckout;
