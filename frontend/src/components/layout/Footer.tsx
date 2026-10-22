import { Link } from 'react-router-dom';
import { Scale, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <Scale className="w-8 h-8" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-xl">NYAYASETU</span>
                <span className="text-xs text-slate-400">Bridging People to Justice</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 max-w-md">
              NYAYASETU helps citizens understand their legal situations and connects them with appropriate legal aid resources and services across India.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:support@nyayasetu.gov.in" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                support@nyayasetu.gov.in
              </a>
              <a href="tel:1800-xxx-xxxx" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                1800-XXX-XXXX (Toll Free)
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-white transition-colors">Start Assessment</Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">Find Resources</Link>
              </li>
              <li>
                <Link to="/assessments" className="hover:text-white transition-colors">My Assessments</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© {currentYear} NYAYASETU. All rights reserved.</p>
            <p className="text-xs">
              Disclaimer: This platform provides preliminary legal information only. It does not constitute legal advice. Please consult a qualified legal professional for your specific situation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
