import { Scale, Users, Shield, Target } from 'lucide-react';
import Layout from '../../components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About NYAYASETU</h1>
        
        <div className="prose prose-slate max-w-none">
          <div className="card mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Scale className="w-12 h-12 text-blue-900" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Bridging People to Justice</h2>
                <p className="text-slate-600">
                  NYAYASETU is a digital platform that helps Indian citizens understand their legal situations 
                  and connects them with appropriate legal aid resources and services.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <Target className="w-10 h-10 text-blue-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-slate-600">
                To make legal assistance accessible to all citizens by simplifying the process of understanding 
                legal issues and connecting people with verified legal aid resources.
              </p>
            </div>

            <div className="card">
              <Users className="w-10 h-10 text-blue-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Who We Serve</h3>
              <p className="text-slate-600">
                We serve all Indian citizens seeking legal assistance, with special focus on those who may 
                qualify for free legal aid under Indian law.
              </p>
            </div>
          </div>

          <div className="card bg-blue-50 border-blue-200 mb-8">
            <Shield className="w-10 h-10 text-blue-900 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-4">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              <li>Share your situation through our conversational interface</li>
              <li>Our AI analyzes your case and identifies relevant legal issues</li>
              <li>Receive a preliminary assessment of your eligibility for legal aid</li>
              <li>Get connected with verified legal resources near you</li>
              <li>Access a personalized action plan for your next steps</li>
            </ol>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Important Information</h3>
            <div className="space-y-4 text-slate-700">
              <p>
                <strong>Not Legal Advice:</strong> NYAYASETU provides information and connects you with resources, 
                but does not provide legal advice. Always consult a qualified legal professional for advice specific 
                to your situation.
              </p>
              <p>
                <strong>Privacy Protected:</strong> Your information is encrypted and secure. We follow strict 
                privacy guidelines and never share your personal information without your consent.
              </p>
              <p>
                <strong>Free to Use:</strong> NYAYASETU is a free service designed to help citizens access justice. 
                There is no charge for using our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
