import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Shield, TrendingUp, BookOpen } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
              <CardTitle className="text-3xl font-bold">Disclaimer</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Last Updated: November 24, 2025</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Important Notice */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-2">IMPORTANT NOTICE</h2>
                  <p className="text-amber-900 font-semibold">
                    FinEdge360 is an EDUCATIONAL financial planning tool. We do NOT provide
                    investment advice, recommend specific securities, or manage investments.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Not Investment Advice */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                1. Not Investment Advice
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">
                  FinEdge360 does NOT provide investment advice or personalized financial recommendations.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All content is for <strong>educational and informational purposes only</strong></li>
                  <li>We do NOT recommend specific stocks, mutual funds, bonds, or other securities</li>
                  <li>We do NOT provide buy, sell, or hold recommendations</li>
                  <li>We do NOT offer portfolio management services</li>
                  <li>We are NOT a SEBI Registered Investment Advisor</li>
                </ul>

                <div className="bg-red-50 border border-red-300 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-red-900">
                    Always consult a{' '}
                    <a
                      href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-red-700"
                    >
                      SEBI Registered Investment Advisor
                    </a>
                    {' '}before making any investment decisions.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Educational Tool */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                2. Educational Tool Only
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>FinEdge360 is a self-service educational platform that provides:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Financial Calculators:</strong> Net Worth Tracker, FIRE Calculator, SIP Planner, Tax Planning</li>
                  <li><strong>Generic Information:</strong> Financial literacy content, FIRE concepts, retirement planning basics</li>
                  <li><strong>Self-Assessment Tools:</strong> Risk profiling questionnaire, asset allocation templates</li>
                  <li><strong>Mathematical Projections:</strong> Based solely on user-provided inputs and assumptions</li>
                </ul>
                <p className="mt-3">
                  <strong>All tools and information are generic</strong> and not tailored to your specific
                  financial situation, goals, or risk tolerance.
                </p>
              </div>
            </section>

            <Separator />

            {/* No Guarantee of Accuracy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. No Guarantee of Accuracy</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  While we strive to provide accurate and up-to-date information, we make NO warranties
                  or guarantees regarding:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accuracy, completeness, or reliability of calculations</li>
                  <li>Correctness of financial projections or estimates</li>
                  <li>Suitability of information for your specific needs</li>
                  <li>Tax laws, investment regulations, or financial rules</li>
                  <li>Third-party data sources or links</li>
                </ul>
                <p className="mt-3 font-semibold">
                  Financial laws, tax regulations, and market conditions change frequently. Always verify
                  information with qualified professionals.
                </p>
              </div>
            </section>

            <Separator />

            {/* Investment Risks */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                4. Investment Risks
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">ALL INVESTMENTS INVOLVE RISK.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Past performance does NOT guarantee future results</li>
                  <li>Market volatility can cause significant losses</li>
                  <li>You may lose some or all of your invested capital</li>
                  <li>Returns are never guaranteed</li>
                  <li>Inflation can erode purchasing power</li>
                  <li>Tax implications vary by individual circumstances</li>
                </ul>
                <p className="mt-3">
                  <strong>You assume ALL risks</strong> associated with your investment decisions.
                  FinEdge360 is not responsible for any financial losses you may incur.
                </p>
              </div>
            </section>

            <Separator />

            {/* No Professional Relationship */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. No Professional Relationship</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Using FinEdge360 does NOT create:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>An advisor-client relationship</li>
                  <li>A fiduciary duty on our part</li>
                  <li>Any legal, financial, or contractual obligations beyond our{' '}
                    <a href="/terms-of-service" className="text-blue-600 underline hover:text-blue-800">
                      Terms of Service
                    </a>
                  </li>
                </ul>
                <p className="mt-3">
                  We are a technology platform, not financial advisors. We do not owe you a fiduciary
                  duty to act in your best interests.
                </p>
              </div>
            </section>

            <Separator />

            {/* Third-Party Content */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Third-Party Content and Links</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  FinEdge360 may contain links to third-party websites, resources, or educational content.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We do NOT endorse or control third-party content</li>
                  <li>We are NOT responsible for the accuracy of external information</li>
                  <li>Third-party sites have their own terms and privacy policies</li>
                  <li>Access third-party content at your own risk</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">
                  To the maximum extent permitted by law, FinEdge360 and its affiliates shall NOT be
                  liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Any investment losses or financial damages</li>
                  <li>Losses arising from use of our calculators or information</li>
                  <li>Indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, revenue, data, or opportunities</li>
                  <li>Damages from reliance on our content</li>
                  <li>Errors, omissions, or inaccuracies in our Service</li>
                </ul>
                <p className="mt-3 font-semibold text-red-700">
                  YOU ASSUME FULL RESPONSIBILITY FOR ALL INVESTMENT AND FINANCIAL DECISIONS YOU MAKE.
                </p>
              </div>
            </section>

            <Separator />

            {/* Tax and Legal Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Tax and Legal Disclaimer</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  FinEdge360 does NOT provide:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tax advice or tax planning services</li>
                  <li>Legal advice or legal opinions</li>
                  <li>Accounting or bookkeeping services</li>
                </ul>
                <p className="mt-3">
                  Our Tax Planning tool provides generic calculations for educational purposes only.
                  Consult a qualified Chartered Accountant or tax professional for personalized tax advice.
                </p>
              </div>
            </section>

            <Separator />

            {/* SEBI Compliance */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                9. SEBI Compliance Statement
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  FinEdge360 is an educational tool compliant with SEBI regulations as a self-service
                  platform that does NOT require SEBI Investment Advisor registration.
                </p>
                <p>
                  We operate within legal boundaries by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>NOT providing personalized investment advice</li>
                  <li>NOT recommending specific securities or financial products</li>
                  <li>NOT charging fees for investment advisory services</li>
                  <li>NOT managing client investments</li>
                </ul>
                <p className="mt-3">
                  For personalized investment advice, please consult a{' '}
                  <a
                    href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    SEBI Registered Investment Advisor (RIA)
                  </a>.
                </p>
              </div>
            </section>

            <Separator />

            {/* User Responsibility */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Your Responsibility</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">
                  By using FinEdge360, you acknowledge and accept that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are solely responsible for your financial decisions</li>
                  <li>You will seek professional advice before investing</li>
                  <li>You understand the risks involved in investing</li>
                  <li>You will not rely solely on FinEdge360 for investment decisions</li>
                  <li>You have read and understood this Disclaimer</li>
                  <li>You agree to our{' '}
                    <a href="/terms-of-service" className="text-blue-600 underline hover:text-blue-800">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Contact Us */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Disclaimer or our Service, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-gray-700">
                <p><strong>Email:</strong> support@finedge360.com</p>
                <p><strong>Website:</strong> www.finedge360.com</p>
              </div>
            </section>

            {/* Final Warning */}
            <div className="mt-8 p-6 bg-red-50 border-2 border-red-400 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-900 text-lg mb-2">
                    FINAL WARNING
                  </p>
                  <p className="text-red-900">
                    <strong>Investing involves risk, including potential loss of principal.</strong>
                    {' '}FinEdge360 is an educational tool, NOT a substitute for professional financial advice.
                    Always consult qualified professionals (SEBI Registered Investment Advisors,
                    Chartered Accountants, Financial Planners) before making investment or financial decisions.
                  </p>
                  <p className="text-red-900 mt-3 font-semibold">
                    By using FinEdge360, you accept full responsibility for all financial decisions
                    and agree that FinEdge360 is not liable for any losses you may incur.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
