import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer } from 'lucide-react';

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ open, onOpenChange }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: {new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introduction */}
            <section>
              <p className="text-gray-700">
                Your data is very important to us, and we take its protection seriously.
                This policy explains how we collect, store, and use the information you provide.
              </p>
            </section>

            {/* 1. Data Collection */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Data Collection</h3>
              <p className="text-gray-700 mb-3">
                We collect information related to your financial planning, such as your assets,
                liabilities, and income details.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-3">
                <p className="font-semibold text-blue-900 mb-2">💡 Privacy Protection Tip:</p>
                <p className="text-blue-800">
                  To protect your privacy, we encourage you to enter <strong>factored data</strong> rather
                  than your real amounts. For example, you can cut off a zero at the end of each amount
                  or enter a consistent fraction of the real amount. This way, the app's output will be
                  factored accordingly, allowing you to easily understand and correlate the amounts.
                </p>
              </div>
            </section>

            {/* 2. Data Storage and Protection */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Data Storage and Protection</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>We employ security measures to protect your data, including <strong>encryption</strong> and secure databases.</li>
                <li>Your data is stored on <strong>secure servers</strong> with industry-standard security practices.</li>
                <li>Your data is encrypted both <strong>at rest</strong> (stored data) and <strong>in transit</strong> (data being transferred).</li>
                <li>Your data is accessed only by <strong>authorized personnel</strong> for legitimate purposes.</li>
              </ul>
            </section>

            {/* 3. Purpose of Processing */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Purpose of Processing</h3>
              <p className="text-gray-700 mb-3">
                We will process your personal data only for the purposes explicitly mentioned below:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Service Provision:</strong> To provide, operate, and maintain all features of the FIREMap services.</li>
                <li><strong>KYC and Regulatory Compliance:</strong> To fulfill our legal obligations, including Anti-Money Laundering (AML), Know Your Customer (KYC) requirements, and other statutory reporting under Indian law.</li>
                <li><strong>Security and Fraud Prevention:</strong> To detect, prevent, and address fraudulent activities and technical issues.</li>
                <li><strong>Service Communication:</strong> To send transactional alerts, service updates, security notices, and to respond to your queries.</li>
                <li><strong>Marketing (Optional Consent):</strong> To send you promotional offers and information about products/services only if you have provided separate, specific consent for marketing communications.</li>
              </ul>
            </section>

            {/* 4. Your Rights under DPDP Act */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Your Rights (Data Principal Rights under DPDP Act)</h3>
              <p className="text-gray-700 mb-3">
                As a Data Principal, you have the following rights, which you can exercise by contacting our Grievance Officer:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Right to Information:</strong> The right to obtain an itemised description of the personal data collected, categories of data shared, and the identities of all Data Fiduciaries and Data Processors with whom the data has been shared.</li>
                <li><strong>Right to Access:</strong> The right to access your personal data and a summary of the processing activities.</li>
                <li><strong>Right to Correction & Erasure:</strong> The right to request the correction, completion, or updation of inaccurate, incomplete, or unnecessary personal data, and the erasure of your personal data when the purpose of collection is no longer being served (subject to legal retention requirements).</li>
                <li><strong>Right to Grievance Redressal:</strong> The right to have your grievances addressed by us.</li>
                <li><strong>Right to Nominate:</strong> The right to nominate an individual who will exercise your rights in case of your death or incapacity.</li>
                <li><strong>Right to Withdraw Consent:</strong> The right to withdraw your consent at any time. Withdrawal of consent may limit or discontinue your access to certain services that require that specific data.</li>
              </ul>
            </section>

            {/* 5. Data Retention and Deletion */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention and Deletion</h3>
              <p className="text-gray-700">
                We will retain your personal data only for as long as is necessary to fulfill the purposes
                for which it was collected or as required by any applicable Indian law (e.g., RBI/KYC
                guidelines may require longer retention periods).
              </p>
              <p className="text-gray-700 mt-2">
                Upon withdrawal of consent or a request for erasure, we will cease to retain your data
                unless its retention is mandated by law.
              </p>
            </section>

            {/* 6. Data Security and Breach Notification */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Data Security and Breach Notification</h3>
              <p className="text-gray-700 mb-3">
                We are committed to implementing reasonable security safeguards to protect the personal
                data under our control from data breaches.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>We use <strong>encryption</strong> for sensitive personal data, both at rest and in transit, as per industry best practices and regulatory requirements.</li>
                <li>In the event of a data breach, we will notify the <strong>Data Protection Board of India (DPBI)</strong> and the affected Data Principals without undue delay.</li>
              </ul>
            </section>

            {/* 7. Sharing of Personal Data */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Sharing of Personal Data</h3>
              <p className="text-gray-700 mb-3">
                We may share your data with third parties (Data Processors) only for the specified purpose
                for which you have given consent and on a need-to-know basis. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Regulatory Authorities:</strong> Sharing with RBI, SEBI, law enforcement, or government bodies as required by Indian law.</li>
                <li><strong>Service Providers:</strong> Sharing with third-party vendors for payment processing, cloud hosting, analytics, and KYC services, all of whom are bound by contractual obligations to comply with the DPDP Act.</li>
                <li><strong>Affiliates/Group Companies:</strong> For administrative and business purposes, with adequate safeguards.</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>We do not share your real data with third parties without your explicit consent.</strong>
              </p>
            </section>

            {/* 8. Guideline for Entering Factored Financial Data */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Guideline for Entering Factored Financial Data</h3>
              <p className="text-gray-700 mb-3">
                To protect your privacy while using our personal financial health check-up app, we
                recommend entering <strong>factored data</strong> rather than your real amounts. This way,
                your personal financial information remains secure, while you can still understand the
                output and correlate it back to your real finances.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-3">
                <h4 className="font-semibold text-gray-900 mb-3">How to Enter Factored Data:</h4>

                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-800">Method 1: Cut Off a Zero</p>
                    <p className="text-gray-700 text-sm mt-1">
                      For each amount you enter, simply cut off the last zero. For example, if your
                      income is ₹50,000, you can enter ₹5,000. The app's output will then be factored
                      down by the same factor, allowing you to easily multiply the result by ten to get
                      your real amount.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2 text-sm">
                      <p className="text-blue-900">
                        <strong>Example:</strong> Real income: ₹50,000 → Enter: ₹5,000<br/>
                        Result shown: ₹3,000 → Your real result: ₹30,000
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">Method 2: Use a Consistent Factor</p>
                    <p className="text-gray-700 text-sm mt-1">
                      Alternatively, you can use a consistent factor like one-sixth or one-seventh of
                      the real amount for all your entries. Ensure you apply the same factor to all
                      your financial data so the output remains consistent.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2 text-sm">
                      <p className="text-blue-900">
                        <strong>Example:</strong> Using factor of 1/6:<br/>
                        Real income: ₹60,000 → Enter: ₹10,000<br/>
                        Real assets: ₹12,00,000 → Enter: ₹2,00,000<br/>
                        Result shown: ₹50,000 → Your real result: ₹3,00,000 (multiply by 6)
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mt-3">
                  By following this guideline, you can effectively protect your privacy while still
                  utilizing the benefits of our financial health check-up app.
                </p>
              </div>
            </section>

            {/* 9. Important Disclaimer */}
            <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Important Disclaimer</h3>
              <p className="text-yellow-800">
                The personal financial health check-up is provided for <strong>general information and
                educational purposes only</strong>. It is <strong>not intended to be financial advice</strong>.
                You should consult with a qualified financial expert for advice tailored to your specific situation.
              </p>
            </section>

            {/* 10. Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Contact Information</h3>
              <p className="text-gray-700 mb-2">
                If you have any concerns, questions, or wish to exercise your rights under this Privacy Policy,
                please contact our Grievance Officer:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800">
                  <strong>Email:</strong> <a href="mailto:support@finedge360.com" className="text-blue-600 hover:underline">support@finedge360.com</a>
                </p>
                <p className="text-gray-800 mt-1">
                  <strong>Address:</strong> FIREMap, India
                </p>
              </div>
            </section>

            {/* Legal Notice */}
            <section className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-500">
                <strong>Legal Notice:</strong> This Privacy Policy is provided for informational purposes.
                FIREMap is committed to complying with applicable data protection laws including the
                Digital Personal Data Protection Act (DPDP Act) of India. This policy may be updated from
                time to time, and the latest version will always be available in the application.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
