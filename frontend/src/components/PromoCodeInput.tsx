import React, { useState } from 'react';
import { Check, X, Loader2, Tag, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface PromoCodeInputProps {
  onValidCode?: (code: string, details: PromoCodeDetails) => void;
  onInvalidCode?: (code: string, message: string) => void;
  placeholder?: string;
  buttonText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface PromoCodeDetails {
  valid: boolean;
  message: string;
  code_name?: string;
  benefits?: Record<string, any>;
  slots_remaining?: number;
  time_remaining?: string;
  discount_percentage?: number;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  onValidCode,
  onInvalidCode,
  placeholder = 'Enter promo code',
  buttonText = 'Apply',
  size = 'md',
  className = '',
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message: string;
    details?: PromoCodeDetails;
  }>({
    status: 'idle',
    message: '',
  });

  const validatePromoCode = async () => {
    if (!code.trim()) {
      setValidationResult({
        status: 'invalid',
        message: 'Please enter a promo code',
      });
      return;
    }

    setIsValidating(true);
    setValidationResult({ status: 'idle', message: '' });

    try {
      const response = await fetch(API_ENDPOINTS.validatePromoCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data: PromoCodeDetails = await response.json();

      if (data.valid) {
        setValidationResult({
          status: 'valid',
          message: data.message,
          details: data,
        });
        if (onValidCode) {
          onValidCode(code.trim().toUpperCase(), data);
        }
      } else {
        setValidationResult({
          status: 'invalid',
          message: data.message,
        });
        if (onInvalidCode) {
          onInvalidCode(code.trim().toUpperCase(), data.message);
        }
      }
    } catch (error) {
      setValidationResult({
        status: 'invalid',
        message: 'Failed to validate promo code. Please try again.',
      });
      if (onInvalidCode) {
        onInvalidCode(code.trim().toUpperCase(), 'Network error');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validatePromoCode();
    }
  };

  const sizeClasses = {
    sm: {
      input: 'text-sm px-3 py-2',
      button: 'text-sm px-4 py-2',
      icon: 'w-4 h-4',
    },
    md: {
      input: 'text-base px-4 py-3',
      button: 'text-base px-6 py-3',
      icon: 'w-5 h-5',
    },
    lg: {
      input: 'text-lg px-5 py-4',
      button: 'text-lg px-8 py-4',
      icon: 'w-6 h-6',
    },
  };

  return (
    <div className={`promo-code-input ${className}`}>
      <div className="flex flex-col gap-2">
        {/* Input Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Tag className={sizeClasses[size].icon} />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setValidationResult({ status: 'idle', message: '' });
              }}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isValidating}
              className={`
                w-full ${sizeClasses[size].input} pl-10 pr-4
                border-2 rounded-lg font-mono uppercase
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  validationResult.status === 'valid'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : validationResult.status === 'invalid'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
            />
            {validationResult.status !== 'idle' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validationResult.status === 'valid' ? (
                  <Check className={`${sizeClasses[size].icon} text-green-500`} />
                ) : (
                  <X className={`${sizeClasses[size].icon} text-red-500`} />
                )}
              </div>
            )}
          </div>

          <button
            onClick={validatePromoCode}
            disabled={isValidating || !code.trim()}
            className={`
              ${sizeClasses[size].button}
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              text-white font-semibold rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center gap-2
              shadow-md hover:shadow-lg
            `}
          >
            {isValidating ? (
              <>
                <Loader2 className={`${sizeClasses[size].icon} animate-spin`} />
                Validating...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>

        {/* Validation Message */}
        {validationResult.message && (
          <div
            className={`
              flex items-start gap-2 p-3 rounded-lg text-sm
              ${
                validationResult.status === 'valid'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
              }
            `}
          >
            {validationResult.status === 'valid' ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{validationResult.message}</div>
              {validationResult.details && validationResult.status === 'valid' && (
                <div className="mt-2 space-y-1">
                  {validationResult.details.discount_percentage && (
                    <div className="text-xs">
                      Discount: {validationResult.details.discount_percentage}% off
                    </div>
                  )}
                  {validationResult.details.slots_remaining && (
                    <div className="text-xs">
                      Slots remaining: {validationResult.details.slots_remaining}
                    </div>
                  )}
                  {validationResult.details.time_remaining && (
                    <div className="text-xs">
                      Time remaining: {validationResult.details.time_remaining}
                    </div>
                  )}
                  {validationResult.details.benefits && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold mb-1">Benefits:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {validationResult.details.benefits.lifetime && (
                          <li>Lifetime Premium Access</li>
                        )}
                        {validationResult.details.benefits.expert_consultation && (
                          <li>
                            Expert Consultation ({validationResult.details.benefits.consultation_minutes} min)
                          </li>
                        )}
                        {validationResult.details.benefits.priority_support && (
                          <li>Priority Support</li>
                        )}
                        {validationResult.details.benefits.badge && (
                          <li>Founder Badge</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodeInput;
