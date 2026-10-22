import { Shield, Lock, Eye, Database } from 'lucide-react';
import Layout from '../../components/layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <div className="card bg-blue-50 border-blue-200 mb-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-900 flex-shrink-0" />
              <div>
                <p className="text-slate-700">
                  <strong>Last Updated:</strong> September 2026
                </p>
                <p className="text-slate-700 mt-2">
                  Your privacy is important to us. This policy explains how NYAYASETU collects, uses, 
                  and protects your personal information.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="card">
              <div className="flex items-start gap-4">
                <Database className="w-8 h-8 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">Information We Collect</h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Information you provide during assessment conversations</li>
                    <li>Account information (email, name, phone number) if you register</li>
                    <li>Usage data and analytics to improve our services</li>
                    <li>Location data (only with your permission) to recommend nearby resources</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">How We Use Your Information</h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>To analyze your legal situation and provide relevant information</li>
                    <li>To recommend appropriate legal aid resources</li>
                    <li>To save your assessment history (if you have an account)</li>
                    <li>To improve our AI models and platform services</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">How We Protect Your Data</h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>All data is encrypted in transit and at rest</li>
                    <li>Access to personal data is strictly limited and audited</li>
                    <li>We use industry-standard security practices</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <Eye className="w-8 h-8 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">Your Rights</h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Right to access your personal data</li>
                    <li>Right to correct inaccurate information</li>
                    <li>Right to delete your account and associated data</li>
                    <li>Right to withdraw consent for data processing</li>
                    <li>Right to data portability</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-amber-50 border-amber-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Important Notes</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>
                  <strong>Anonymous Assessments:</strong> You can use NYAYASETU without creating an account. 
                  Anonymous assessment data is not linked to any personal identifier.
                </li>
                <li>
                  <strong>No Sharing Without Consent:</strong> We never share your personal information with 
                  third parties without your explicit consent, except as required by law.
                </li>
                <li>
                  <strong>Data Retention:</strong> We retain your data as long as your account is active. 
                  You can request deletion at any time.
                </li>
              </ul>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact Us</h2>
              <p className="text-slate-700 mb-3">
                If you have questions about this privacy policy or how we handle your data, please contact us:
              </p>
              <ul className="space-y-1 text-slate-700">
                <li>Email: privacy@nyayasetu.gov.in</li>
                <li>Phone: 1800-XXX-XXXX (Toll Free)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
