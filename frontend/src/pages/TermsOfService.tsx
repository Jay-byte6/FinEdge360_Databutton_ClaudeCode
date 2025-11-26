import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Last Updated: November 24, 2025</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to FinEdge360. These Terms of Service ("Terms") govern your access to and use of
                FinEdge360's website, application, and services (collectively, the "Service"). By accessing
                or using the Service, you agree to be bound by these Terms.
              </p>
            </section>

            <Separator />

            {/* Service Description */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
              <div className="space-y-3 text-gray-700">
                <p>FinEdge360 is an <strong>educational financial planning tool</strong> that provides:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Financial calculators (Net Worth, FIRE Calculator, SIP Planner, Tax Planning)</li>
                  <li>Educational content about financial independence and retirement planning</li>
                  <li>Self-service tools for tracking and planning your financial journey</li>
                  <li>Generic asset allocation strategies based on risk profiles</li>
                </ul>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">Important Notice:</p>
                      <p className="text-sm text-amber-800 mt-1">
                        FinEdge360 does NOT provide investment advice, recommend specific securities,
                        or manage investments. We are not a SEBI Registered Investment Advisor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* User Responsibilities */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <div className="space-y-3 text-gray-700">
                <p>By using FinEdge360, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain the security and confidentiality of your account credentials</li>
                  <li>Use the Service for educational and personal financial planning purposes only</li>
                  <li>Not rely solely on FinEdge360 for investment decisions</li>
                  <li>Consult qualified financial professionals before making investment decisions</li>
                  <li>Not use the Service for any illegal or unauthorized purpose</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* No Investment Advice */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. No Investment Advice</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">
                  FinEdge360 does NOT provide investment advice or personalized financial recommendations.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All content is for educational and informational purposes only</li>
                  <li>We do NOT recommend specific stocks, mutual funds, or other securities</li>
                  <li>We do NOT manage or control user investments</li>
                  <li>We do NOT charge fees for investment advisory services</li>
                  <li>Users are solely responsible for their own investment decisions</li>
                </ul>
                <p className="mt-3">
                  For personalized investment advice, please consult a{' '}
                  <a
                    href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    SEBI Registered Investment Advisor
                  </a>.
                </p>
              </div>
            </section>

            <Separator />

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Disclaimer of Warranties</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind,
                  either express or implied, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accuracy, reliability, or completeness of information</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement of intellectual property rights</li>
                  <li>Uninterrupted or error-free operation</li>
                </ul>
                <p className="mt-3">
                  FinEdge360 makes no guarantee about the accuracy of calculations, projections,
                  or any other information provided through the Service.
                </p>
              </div>
            </section>

            <Separator />

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  To the maximum extent permitted by law, FinEdge360 and its affiliates, officers,
                  directors, employees, and agents shall NOT be liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Any investment losses or financial damages</li>
                  <li>Indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, or use</li>
                  <li>Damages arising from reliance on information provided by the Service</li>
                </ul>
                <p className="mt-3 font-semibold">
                  You assume all risks associated with your use of the Service and any investment
                  decisions you make.
                </p>
              </div>
            </section>

            <Separator />

            {/* Data Privacy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Privacy</h2>
              <p className="text-gray-700">
                Your use of the Service is also governed by our{' '}
                <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">
                  Privacy Policy
                </a>.
                We collect, use, and protect your personal and financial data as described in our Privacy Policy.
              </p>
            </section>

            <Separator />

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  All content, features, and functionality of the Service, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Text, graphics, logos, icons, and images</li>
                  <li>Software, algorithms, and calculators</li>
                  <li>Design, layout, and user interface</li>
                </ul>
                <p className="mt-3">
                  are owned by FinEdge360 or our licensors and are protected by copyright, trademark,
                  and other intellectual property laws.
                </p>
              </div>
            </section>

            <Separator />

            {/* Account Termination */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Account Termination</h2>
              <div className="space-y-3 text-gray-700">
                <p>We reserve the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Suspend or terminate your account at any time for any reason</li>
                  <li>Refuse service to anyone for any reason</li>
                  <li>Modify or discontinue the Service without notice</li>
                </ul>
                <p className="mt-3">
                  You may delete your account at any time through your Profile settings.
                </p>
              </div>
            </section>

            <Separator />

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. We will notify you of material changes
                by posting the updated Terms on this page with a new "Last Updated" date. Your
                continued use of the Service after changes are posted constitutes acceptance of
                the updated Terms.
              </p>
            </section>

            <Separator />

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of India.
                Any disputes arising from these Terms or your use of the Service shall be subject to
                the exclusive jurisdiction of the courts in [Your City/State], India.
              </p>
            </section>

            <Separator />

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 space-y-1 text-gray-700">
                <p><strong>Email:</strong> support@finedge360.com</p>
                <p><strong>Website:</strong> www.finedge360.com</p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>By using FinEdge360, you acknowledge that you have read, understood,
                and agree to be bound by these Terms of Service.</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
