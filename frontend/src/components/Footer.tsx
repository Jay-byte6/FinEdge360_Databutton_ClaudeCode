import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white mt-auto">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <div className="mb-3">
              <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '64px', width: 'auto' }}>
                <video
                  src="/FIREMap.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-24 md:h-28 w-auto"
                  style={{
                    objectFit: 'contain',
                    filter: 'contrast(1.4) brightness(1.3) invert(1)',
                    mixBlendMode: 'lighten',
                    transform: 'translateY(0)'
                  }}
                  aria-label="FIREMap - Your GPS to Financial Freedom"
                />
              </div>
            </div>
            <p className="text-sm text-blue-300 font-medium mb-3 italic">Your GPS to Financial Freedom</p>
            <p className="text-sm text-gray-300 mb-3">
              Your trusted educational financial planning tool for achieving Financial Independence
              and Retire Early (FIRE) goals.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Shield className="w-4 h-4" />
              <span>SEBI Compliant Educational Tool</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/fire-calculator" className="text-gray-300 hover:text-white transition-colors">
                  FIRE Calculator
                </Link>
              </li>
              <li>
                <Link to="/net-worth" className="text-gray-300 hover:text-white transition-colors">
                  Net Worth Tracker
                </Link>
              </li>
              <li>
                <Link to="/sip-planner" className="text-gray-300 hover:text-white transition-colors">
                  SIP Planner
                </Link>
              </li>
              <li>
                <Link to="/journey3d" className="text-gray-300 hover:text-white transition-colors">
                  FIRE Journey Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Disclaimer
                </Link>
              </li>
              <li>
                <a
                  href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  Find SEBI Advisor
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="border-t border-slate-700 pt-6 mb-6">
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-200 font-semibold mb-1">IMPORTANT DISCLAIMER</p>
                <p className="text-xs text-amber-100">
                  FIREMap is an educational financial planning tool. We do NOT provide investment
                  advice, recommend specific securities, or manage investments. All content is for
                  educational purposes only. Please consult a{' '}
                  <a
                    href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    SEBI Registered Investment Advisor
                  </a>
                  {' '}for personalized financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} FIREMap. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Made with care to help you achieve financial independence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
