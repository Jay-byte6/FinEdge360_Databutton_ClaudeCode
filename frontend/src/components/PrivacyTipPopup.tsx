import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyTipPopupProps {
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
  isOpen: boolean;
}

export const PrivacyTipPopup: React.FC<PrivacyTipPopupProps> = ({
  onClose,
  onConfirm,
  isOpen,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl m-4 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h3 className="text-lg font-bold">Privacy Protection Tip</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-gray-700 font-semibold">
            For your privacy, use factored data instead of real amounts:
          </p>

          {/* Method 1 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">Method 1: Cut off one zero</p>
            <p className="text-xs text-blue-800">
              Real: ₹10,00,000 → Enter: ₹1,00,000
            </p>
          </div>

          {/* Method 2 */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
            <p className="text-sm font-semibold text-purple-900 mb-1">Method 2: Use consistent factor</p>
            <p className="text-xs text-purple-800">
              Divide all amounts by 10 throughout
            </p>
          </div>

          {/* Example */}
          <div className="bg-green-50 border border-green-300 p-3 rounded">
            <p className="text-xs font-semibold text-green-900 mb-1">📌 Example:</p>
            <p className="text-xs text-green-800">
              Salary ₹50,000 → Enter ₹5,000<br />
              Expenses ₹30,000 → Enter ₹3,000<br />
              <span className="italic">All calculations remain accurate!</span>
            </p>
          </div>

          {/* Important note */}
          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            <strong>💡 Tip:</strong> Choose one method and use it consistently for all fields.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t rounded-b-lg">
          <div className="flex flex-col gap-3">
            {/* Don't show again checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Don't show this message again</span>
            </label>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-md"
            >
              Yes, I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
