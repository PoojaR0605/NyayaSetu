import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Scale, 
  Users,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useAssessmentStore } from '../../store/assessmentStore';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Results() {
  const { token } = useParams<{ token: string }>();
  
  const {
    currentAssessment,
    supportAssessment,
    eligibility,
    isLoading,
    error,
    loadAssessment,
    loadSupportAssessment,
    loadEligibility,
  } = useAssessmentStore();

  useEffect(() => {
    if (token) {
      loadAssessment(token);
      loadSupportAssessment(token);
      loadEligibility(token);
    }
  }, [token]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading your assessment results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !currentAssessment) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <ErrorMessage
            message={error || 'Assessment not found'}
            onRetry={() => token && loadAssessment(token)}
          />
        </div>
      </Layout>
    );
  }

  const getUrgencyConfig = (level: string) => {
    const configs = {
      NORMAL: { color: 'green', icon: CheckCircle, label: 'Normal', desc: 'No immediate time pressure' },
      IMPORTANT: { color: 'blue', icon: FileText, label: 'Important', desc: 'Should be addressed soon' },
      URGENT: { color: 'amber', icon: AlertTriangle, label: 'Urgent', desc: 'Time-sensitive matter' },
      POSSIBLE_IMMEDIATE_SAFETY_CONCERN: { 
        color: 'red', 
        icon: AlertTriangle, 
        label: 'Safety Concern', 
        desc: 'Requires immediate attention'
      },
    };
    return configs[level as keyof typeof configs] || configs.NORMAL;
  };

  const getEligibilityConfig = (status: string) => {
    const configs = {
      POTENTIALLY_ELIGIBLE: { 
        color: 'green', 
        label: 'Potentially Eligible', 
        desc: 'You likely qualify for legal aid' 
      },
      MAY_BE_ELIGIBLE: { 
        color: 'blue', 
        label: 'May Be Eligible', 
        desc: 'Further verification needed' 
      },
      MORE_INFO_REQUIRED: { 
        color: 'amber', 
        label: 'More Information Required', 
        desc: 'Additional details needed' 
      },
      NOT_ELIGIBLE: { 
        color: 'slate', 
        label: 'Not Eligible', 
        desc: 'Based on current information' 
      },
    };
    return configs[status as keyof typeof configs] || configs.MORE_INFO_REQUIRED;
  };

  const getSupportLevelConfig = (level: string) => {
    const configs = {
      STRONG: { color: 'green', label: 'Strong' },
      MODERATE: { color: 'blue', label: 'Moderate' },
      WEAK: { color: 'amber', label: 'Weak' },
      INSUFFICIENT_INFO: { color: 'slate', label: 'Insufficient Information' },
    };
    return configs[level as keyof typeof configs] || configs.INSUFFICIENT_INFO;
  };

  const urgency = getUrgencyConfig(currentAssessment.urgency_level || 'NORMAL');
  const eligibilityConfig = getEligibilityConfig(currentAssessment.eligibility_status || 'MORE_INFO_REQUIRED');
  const supportConfig = getSupportLevelConfig(currentAssessment.preliminary_support_level || 'INSUFFICIENT_INFO');
  const UrgencyIcon = urgency.icon;

  const justiceReadinessScore = supportAssessment?.justice_readiness_score || currentAssessment.justice_readiness_score || 0;
  const scoreColor = justiceReadinessScore >= 70 ? 'green' : justiceReadinessScore >= 40 ? 'blue' : 'amber';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Assessment Results
          </h1>
          <p className="text-slate-600">
            Based on the information you provided, here's what we understand about your situation
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Legal Issue */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-blue-900" />
              <h3 className="font-semibold text-sm text-slate-600">Legal Issue</h3>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {currentAssessment.legal_issue || 'Under Analysis'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentAssessment.legal_domain || 'Domain pending'}
            </p>
          </div>

          {/* Eligibility */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-900" />
              <h3 className="font-semibold text-sm text-slate-600">Legal Aid Eligibility</h3>
            </div>
            <p className={`text-lg font-semibold text-${eligibilityConfig.color}-600`}>
              {eligibilityConfig.label}
            </p>
            <p className="text-xs text-slate-500 mt-1">{eligibilityConfig.desc}</p>
          </div>

          {/* Support Level */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-900" />
              <h3 className="font-semibold text-sm text-slate-600">Preliminary Support</h3>
            </div>
            <p className={`text-lg font-semibold text-${supportConfig.color}-600`}>
              {supportConfig.label}
            </p>
            <p className="text-xs text-slate-500 mt-1">Assessment level</p>
          </div>

          {/* Urgency */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <UrgencyIcon className={`w-5 h-5 text-${urgency.color}-600`} />
              <h3 className="font-semibold text-sm text-slate-600">Urgency</h3>
            </div>
            <p className={`text-lg font-semibold text-${urgency.color}-600`}>
              {urgency.label}
            </p>
            <p className="text-xs text-slate-500 mt-1">{urgency.desc}</p>
          </div>
        </div>

        {/* Justice Readiness Score */}
        <div className="card mb-8 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - justiceReadinessScore / 100)}`}
                    className={`text-${scoreColor}-500`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{justiceReadinessScore}</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Justice Readiness Score
              </h2>
              <p className="text-slate-600 mb-4">
                This score measures your preparedness to seek professional legal assistance. 
                It does <strong>not predict case outcome</strong> or probability of winning.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {supportAssessment && (
                  <>
                    <div>
                      <p className="text-slate-500">Information</p>
                      <p className="font-semibold">{supportAssessment.information_completeness}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Evidence</p>
                      <p className="font-semibold">{supportAssessment.evidence_readiness}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Timeline</p>
                      <p className="font-semibold">{supportAssessment.timeline_clarity}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Jurisdiction</p>
                      <p className="font-semibold">{supportAssessment.jurisdiction_clarity}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Issue Clarity</p>
                      <p className="font-semibold">{supportAssessment.issue_clarity}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Consistency</p>
                      <p className="font-semibold">{supportAssessment.consistency_score}%</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Indicators */}
        {supportAssessment?.supporting_indicators && supportAssessment.supporting_indicators.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Supporting Indicators</h3>
            <ul className="space-y-2">
              {supportAssessment.supporting_indicators.map((indicator, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Information */}
        {supportAssessment?.missing_information && supportAssessment.missing_information.length > 0 && (
          <div className="card mb-8 bg-amber-50 border-amber-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Missing Information</h3>
            <ul className="space-y-2">
              {supportAssessment.missing_information.map((info, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Eligibility Details */}
        {eligibility && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Eligibility Explanation</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{eligibility.explanation}</p>
            
            {eligibility.matched_rules && eligibility.matched_rules.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 mb-2">Matched Rules:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {eligibility.matched_rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="card bg-blue-50 border-blue-200 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">What's Next?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to={`/eligibility/${token}`} className="card hover:shadow-md transition-shadow bg-white">
              <Users className="w-8 h-8 text-blue-900 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">View Eligibility Details</h4>
              <p className="text-sm text-slate-600 mb-3">Understand your legal aid eligibility</p>
              <span className="text-sm text-blue-900 font-medium inline-flex items-center gap-1">
                Learn More <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to={`/evidence/${token}`} className="card hover:shadow-md transition-shadow bg-white">
              <FileText className="w-8 h-8 text-blue-900 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">Evidence Checklist</h4>
              <p className="text-sm text-slate-600 mb-3">See what documents you need</p>
              <span className="text-sm text-blue-900 font-medium inline-flex items-center gap-1">
                View Checklist <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to={`/resources/${token}`} className="card hover:shadow-md transition-shadow bg-white">
              <ExternalLink className="w-8 h-8 text-blue-900 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">Find Resources</h4>
              <p className="text-sm text-slate-600 mb-3">Connect with legal aid services</p>
              <span className="text-sm text-blue-900 font-medium inline-flex items-center gap-1">
                Find Help <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-100 border border-slate-200 rounded-lg p-6">
          <h4 className="font-semibold text-slate-900 mb-2">Important Disclaimer</h4>
          <p className="text-sm text-slate-700">
            This assessment provides preliminary information only and does not constitute legal advice. 
            The Justice Readiness Score measures your preparedness to seek professional legal assistance, 
            not the likelihood of case success. Please consult a qualified legal professional for advice 
            specific to your situation.
          </p>
        </div>
      </div>
    </Layout>
  );
}
