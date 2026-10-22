import { Link } from 'react-router-dom';
import { MessageSquare, Search, ArrowRight, Shield, Users, FileCheck, Sparkles, CheckCircle, Scale } from 'lucide-react';
import Layout from '../../components/layout/Layout';

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section - Court Themed */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 py-20 md:py-32">
        {/* Wood Grain Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.2) 3px,
              rgba(0,0,0,0.2) 6px
            ), repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.1) 3px,
              rgba(0,0,0,0.1) 6px
            )`
          }} />
        </div>
        
        {/* Court Pillars Decoration */}
        <div className="absolute inset-0 flex justify-between px-8 opacity-10">
          <div className="w-16 bg-gradient-to-b from-amber-300 to-transparent"></div>
          <div className="w-16 bg-gradient-to-b from-amber-300 to-transparent"></div>
          <div className="w-16 bg-gradient-to-b from-amber-300 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Court Emblem */}
            <div className="inline-flex items-center gap-2 bg-amber-800/50 backdrop-blur-sm text-amber-100 px-6 py-3 rounded-lg text-sm font-bold mb-8 border-2 border-amber-600/50 shadow-xl">
              <Scale className="w-5 h-5" />
              <span className="font-serif">Digital Court of Justice</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-amber-50 mb-6 leading-tight font-serif">
              Present Your Case.<br />
              <span className="text-amber-300">Justice Shall Be Served.</span>
            </h1>
            <p className="text-lg md:text-xl text-amber-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Step into the digital courtroom. No legal terminology required. 
              Describe your situation in your own words, and our Hon'ble Court will guide you through the process of seeking justice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/assessment" className="group inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-10 py-5 rounded-lg text-lg font-bold transition-all shadow-2xl hover:shadow-3xl hover:scale-105">
                File Your Petition
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 bg-transparent text-amber-100 border-2 border-amber-400 hover:bg-amber-800/30 px-10 py-5 rounded-lg text-lg font-bold transition-all">
                How Court Works
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-amber-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Legal Knowledge Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                <span>Free Legal Aid Matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Scale className="w-4 h-4" />
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              How NYAYASETU Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to understand your legal situation and find the help you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connection Line - Desktop Only */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transform -translate-y-1/2" style={{ width: '50%', left: '25%' }} />

            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-10 h-10" />
                </div>
              </div>
              <div className="bg-white text-blue-900 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4 text-base font-bold shadow-md border-2 border-blue-100">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Tell Your Story
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Describe your situation in simple words through our friendly chat interface. No legal jargon needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Search className="w-10 h-10" />
                </div>
              </div>
              <div className="bg-white text-blue-900 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4 text-base font-bold shadow-md border-2 border-blue-100">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Understand Your Situation
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI analyzes your case and explains the legal issues, your eligibility for legal aid, and evidence requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center group">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-700 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <FileCheck className="w-10 h-10" />
                </div>
              </div>
              <div className="bg-white text-blue-900 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4 text-base font-bold shadow-md border-2 border-blue-100">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Find Your Next Step
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get a personalized action plan and connect with verified legal aid resources, lawyers, and support services near you.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to="/assessment" className="group inline-flex items-center justify-center gap-2 bg-blue-900 text-white hover:bg-blue-800 px-8 py-4 rounded-lg text-base font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Why Choose NYAYASETU?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Accessible, secure, and designed for everyone seeking justice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-slate-100 hover:border-blue-100 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your information is encrypted and never shared without your consent. Anonymous assessments available.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-slate-100 hover:border-blue-100 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                No Legal Experience Required
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speak in your own language. Our system understands plain descriptions and asks clarifying questions.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-slate-100 hover:border-blue-100 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Verified Resources
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access to verified legal aid offices, pro bono lawyers, NGOs, and government schemes across India.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-slate-100 hover:border-blue-100 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Simple Conversational Interface
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No complex forms. Just have a conversation like you would with a helpful friend or counselor.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-slate-100 hover:border-blue-100 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Eligibility Assessment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Find out if you qualify for free legal aid based on Indian legal aid rules and your circumstances.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-slate-100 hover:border-blue-100 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Actionable Next Steps
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get a clear action plan with priorities, deadlines, and the documents you'll need to gather.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span>Get Started Today</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Find Justice?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start your assessment now. It's free, confidential, and takes about 10-15 minutes.
          </p>
          <Link to="/assessment" className="group inline-flex items-center justify-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-10 py-5 rounded-lg text-lg font-bold transition-all shadow-2xl hover:shadow-3xl hover:scale-105">
            Start Your Assessment
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-8 text-sm text-blue-200 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            No account required to start. Save your progress by creating an account later.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs mt-0.5">
                !
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Important Notice</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  NYAYASETU provides preliminary legal information and connects you with legal aid resources. This is not legal advice and does not create an attorney-client relationship. The Justice Readiness Score measures your preparedness to seek legal assistance, not the likelihood of case success. Always consult a qualified legal professional for advice specific to your situation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
