import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Lock, Shield, Database, Eye, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto max-w-4xl py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-8 h-8 text-green-600" />
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Last Updated: November 24, 2025</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                FinEdge360 ("we", "our", or "us") is committed to protecting your privacy and personal
                information. This Privacy Policy explains how we collect, use, store, and protect your
                data when you use our Service.
              </p>
            </section>

            <Separator />

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                2. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">2.1 Account Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Email address</li>
                    <li>Full name</li>
                    <li>Password (encrypted)</li>
                    <li>Account creation date</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2.2 Financial Information (Optional)</h3>
                  <p className="mb-2">You may choose to provide:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Income and expense details</li>
                    <li>Asset and liability information</li>
                    <li>Investment portfolio details</li>
                    <li>Financial goals and targets</li>
                    <li>Risk assessment responses</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2.3 Usage Data</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Pages visited and features used</li>
                    <li>Device information (browser, operating system)</li>
                    <li>IP address and location data</li>
                    <li>Session duration and interaction patterns</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2.4 Cookies and Tracking</h3>
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage,
                    and maintain your session.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                3. How We Use Your Information
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, operate, and maintain the Service</li>
                  <li>Create and manage your account</li>
                  <li>Perform financial calculations and generate reports</li>
                  <li>Save your financial data and preferences</li>
                  <li>Improve and personalize your user experience</li>
                  <li>Analyze usage patterns and optimize the Service</li>
                  <li>Communicate with you about updates, features, and support</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <div className="bg-green-50 border border-green-300 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-green-900">Important:</p>
                  <p className="text-sm text-green-800 mt-1">
                    We do NOT sell, rent, or share your personal or financial information with third
                    parties for marketing purposes. Your data is yours.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                4. Data Storage and Security
              </h2>
              <div className="space-y-3 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">4.1 Where We Store Your Data</h3>
                  <p>
                    Your data is stored securely using Supabase, a trusted database platform with
                    enterprise-grade security and encryption.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4.2 Security Measures</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>End-to-end encryption for data transmission (HTTPS/SSL)</li>
                    <li>Encrypted password storage (bcrypt hashing)</li>
                    <li>Row-level security policies in database</li>
                    <li>Regular security audits and updates</li>
                    <li>Secure authentication via Google OAuth</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4.3 Data Retention</h3>
                  <p>
                    We retain your personal and financial data for as long as your account is active.
                    You can delete your account and all associated data at any time through your
                    Profile settings.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
              <div className="space-y-3 text-gray-700">
                <p>We use the following third-party services:</p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Supabase (Database & Authentication)</p>
                    <p className="text-sm">
                      Stores user accounts and financial data. Review their{' '}
                      <a
                        href="https://supabase.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Privacy Policy
                      </a>.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Google OAuth (Sign-In)</p>
                    <p className="text-sm">
                      Enables Google account login. Review{' '}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Google's Privacy Policy
                      </a>.
                    </p>
                  </div>
                </div>
                <p className="mt-3">
                  These services have their own privacy policies. We are not responsible for their
                  data handling practices.
                </p>
              </div>
            </section>

            <Separator />

            {/* Your Privacy Rights */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                6. Your Privacy Rights
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> View and download all your personal and financial data</li>
                  <li><strong>Edit:</strong> Update or correct your information at any time</li>
                  <li><strong>Delete:</strong> Permanently delete your account and all associated data</li>
                  <li><strong>Export:</strong> Download your financial data as a PDF report</li>
                  <li><strong>Withdraw Consent:</strong> Stop using the Service and delete your account</li>
                  <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:privacy@finedge360.com" className="text-blue-600 underline hover:text-blue-800">
                    privacy@finedge360.com
                  </a>
                  {' '}or use the account deletion feature in your Profile.
                </p>
              </div>
            </section>

            <Separator />

            {/* Cookies Policy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies Policy</h2>
              <div className="space-y-3 text-gray-700">
                <p>We use cookies to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Keep you logged in (session cookies)</li>
                  <li>Remember your preferences</li>
                  <li>Analyze how you use the Service</li>
                  <li>Improve performance and user experience</li>
                </ul>
                <p className="mt-3">
                  You can disable cookies in your browser settings, but this may limit functionality
                  of the Service.
                </p>
              </div>
            </section>

            <Separator />

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p className="text-gray-700">
                FinEdge360 is not intended for users under the age of 18. We do not knowingly collect
                personal information from children. If you believe a child has provided us with
                personal information, please contact us immediately.
              </p>
            </section>

            <Separator />

            {/* Data Breaches */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Data Breach Notification</h2>
              <p className="text-gray-700">
                In the unlikely event of a data breach that affects your personal information, we will
                notify you via email within 72 hours and provide details about the breach, affected
                data, and steps we're taking to resolve it.
              </p>
            </section>

            <Separator />

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of significant
                changes by posting the updated policy on this page with a new "Last Updated" date.
                Continued use of the Service after changes are posted constitutes acceptance of the
                updated Privacy Policy.
              </p>
            </section>

            <Separator />

            {/* International Users */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. International Users</h2>
              <p className="text-gray-700">
                FinEdge360 is operated from India. If you are accessing the Service from outside India,
                please be aware that your information may be transferred to, stored, and processed in
                India. By using the Service, you consent to this transfer.
              </p>
            </section>

            <Separator />

            {/* Contact Us */}
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or how we handle your data,
                please contact us:
              </p>
              <div className="mt-3 space-y-1 text-gray-700">
                <p><strong>Privacy Email:</strong> privacy@finedge360.com</p>
                <p><strong>General Support:</strong> support@finedge360.com</p>
                <p><strong>Website:</strong> www.finedge360.com</p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Your privacy matters to us.</strong> We are committed to transparency and
                protecting your personal and financial information. If you have concerns about how
                we handle your data, please don't hesitate to contact us.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
