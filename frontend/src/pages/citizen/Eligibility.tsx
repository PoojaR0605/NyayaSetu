import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAssessmentStore } from '../../store/assessmentStore';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Eligibility() {
  const { token } = useParams<{ token: string }>();
  const { eligibility, isLoading, error, loadEligibility } = useAssessmentStore();

  useEffect(() => {
    if (token) {
      loadEligibility(token);
    }
  }, [token]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading eligibility details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !eligibility) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <ErrorMessage
            message={error || 'Eligibility information not found'}
            onRetry={() => token && loadEligibility(token)}
          />
        </div>
      </Layout>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      POTENTIALLY_ELIGIBLE: { 
        color: 'green', 
        icon: CheckCircle, 
        label: 'Potentially Eligible',
        desc: 'Based on the information provided, you likely qualify for legal aid services.'
      },
      MAY_BE_ELIGIBLE: { 
        color: 'blue', 
        icon: Info, 
        label: 'May Be Eligible',
        desc: 'You may qualify for legal aid, but further verification is needed.'
      },
      MORE_INFO_REQUIRED: { 
        color: 'amber', 
        icon: AlertCircle, 
        label: 'More Information Required',
        desc: 'We need additional information to determine your eligibility.'
      },
      NOT_ELIGIBLE: { 
        color: 'slate', 
        icon: AlertCircle, 
        label: 'Not Eligible',
        desc: 'Based on current information, you may not qualify for legal aid. However, other options may be available.'
      },
    };
    return configs[status as keyof typeof configs] || configs.MORE_INFO_REQUIRED;
  };

  const statusConfig = getStatusConfig(eligibility.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Back Link */}
        <Link 
          to={`/results/${token}`} 
          className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Legal Aid Eligibility
          </h1>
          <p className="text-slate-600">
            Understanding your eligibility for free or subsidized legal assistance
          </p>
        </div>

        {/* Status Card */}
        <div className={`card mb-8 border-2 border-${statusConfig.color}-200 bg-${statusConfig.color}-50`}>
          <div className="flex items-start gap-4">
            <StatusIcon className={`w-12 h-12 text-${statusConfig.color}-600 flex-shrink-0`} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {statusConfig.label}
              </h2>
              <p className="text-slate-700 text-lg">
                {statusConfig.desc}
              </p>
              {eligibility.confidence_score && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                    <span>Confidence Level</span>
                    <span className="font-semibold">{eligibility.confidence_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`bg-${statusConfig.color}-600 h-2 rounded-full`}
                      style={{ width: `${eligibility.confidence_score}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Detailed Explanation</h3>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {eligibility.explanation}
          </p>
        </div>

        {/* Matched Rules */}
        {eligibility.matched_rules && eligibility.matched_rules.length > 0 && (
          <div className="card mb-8 bg-green-50 border-green-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Matched Eligibility Criteria
            </h3>
            <ul className="space-y-3">
              {eligibility.matched_rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Information */}
        {eligibility.missing_information && eligibility.missing_information.length > 0 && (
          <div className="card mb-8 bg-amber-50 border-amber-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              Additional Information Needed
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Providing the following information will help us better assess your eligibility:
            </p>
            <ul className="space-y-3">
              {eligibility.missing_information.map((info, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-700">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What is Legal Aid */}
        <div className="card mb-8 bg-blue-50 border-blue-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">What is Legal Aid?</h3>
          <div className="space-y-4 text-slate-700">
            <p>
              Legal aid provides free or subsidized legal assistance to individuals who cannot afford private legal services. In India, legal aid is guaranteed under Article 39A of the Constitution.
            </p>
            <div>
              <h4 className="font-semibold mb-2">Who typically qualifies for legal aid in India:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>Persons with annual income below ₹3 lakhs (varies by state)</li>
                <li>Members of Scheduled Castes or Scheduled Tribes</li>
                <li>Women and children</li>
                <li>Persons with disabilities</li>
                <li>Victims of trafficking, mass disasters, or violence</li>
                <li>Industrial workmen</li>
                <li>Persons in custody</li>
              </ul>
            </div>
            <p className="text-sm">
              <strong>Note:</strong> Eligibility criteria may vary by state and legal aid authority. 
              The assessment provided here is preliminary. Final eligibility will be determined by the legal aid office.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <Link 
              to={`/resources/${token}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div>
                <h4 className="font-semibold text-slate-900">Find Legal Aid Offices</h4>
                <p className="text-sm text-slate-600">Connect with verified legal aid services near you</p>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-900" />
            </Link>

            <Link 
              to={`/evidence/${token}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div>
                <h4 className="font-semibold text-slate-900">Review Evidence Checklist</h4>
                <p className="text-sm text-slate-600">See what documents you'll need to gather</p>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-900" />
            </Link>

            <Link 
              to={`/action-plan/${token}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div>
                <h4 className="font-semibold text-slate-900">View Action Plan</h4>
                <p className="text-sm text-slate-600">Get step-by-step guidance for next actions</p>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-900" />
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-slate-100 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
          <strong>Disclaimer:</strong> This eligibility assessment is preliminary and based on the information you provided. 
          Final eligibility for legal aid will be determined by the respective Legal Services Authority. 
          Please contact a legal aid office or qualified legal professional for definitive guidance.
        </div>
      </div>
    </Layout>
  );
}
