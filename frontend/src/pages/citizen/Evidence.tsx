import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileCheck, FileX, FileQuestion, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAssessmentStore } from '../../store/assessmentStore';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Evidence() {
  const { token } = useParams<{ token: string }>();
  const { currentAssessment, evidence, isLoading, error, loadAssessment, loadEvidence } = useAssessmentStore();
  useEffect(() => {
    if (token) {
      loadAssessment(token).then(() => {
        if (currentAssessment?.id) {
          loadEvidence(currentAssessment.id);
        }
      });
    }
  }, [token]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading evidence checklist...</p>
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
            message={error || 'Evidence information not found'}
            onRetry={() => token && loadAssessment(token)}
          />
        </div>
      </Layout>
    );
  }

  const availableEvidence = evidence.filter(e => e.availability_status === 'AVAILABLE');
  const missingEvidence = evidence.filter(e => e.availability_status === 'MISSING');
  const unknownEvidence = evidence.filter(e => e.availability_status === 'UNKNOWN');

  const evidenceReadiness = currentAssessment.evidence_readiness || 0;
  const readinessColor = evidenceReadiness >= 70 ? 'green' : evidenceReadiness >= 40 ? 'blue' : 'red';

  const getImportanceIcon = (importance: string) => {
    const classes = {
      CRITICAL: 'bg-red-100 text-red-800',
      IMPORTANT: 'bg-amber-100 text-amber-800',
      HELPFUL: 'bg-blue-100 text-blue-800',
    };
    return classes[importance as keyof typeof classes] || classes.HELPFUL;
  };

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
            Evidence Checklist
          </h1>
          <p className="text-slate-600">
            Documents and evidence needed to support your case
          </p>
        </div>

        {/* Evidence Readiness Score */}
        <div className="card mb-8 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-slate-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - evidenceReadiness / 100)}`}
                  className={`text-${readinessColor}-500`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{evidenceReadiness}%</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Evidence Readiness</h2>
              <p className="text-slate-600">
                You have <strong>{availableEvidence.length}</strong> of <strong>{evidence.length}</strong> recommended pieces of evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Available Evidence */}
        {availableEvidence.length > 0 && (
          <div className="card mb-8 bg-green-50 border-green-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-green-600" />
              Available Evidence ({availableEvidence.length})
            </h3>
            <div className="space-y-4">
              {availableEvidence.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-green-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{item.evidence_type}</h4>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      {item.notes && (
                        <p className="text-sm text-slate-500 mt-2 italic">{item.notes}</p>
                      )}
                    </div>
                    <span className={`badge ${getImportanceIcon(item.importance)} text-xs ml-4`}>
                      {item.importance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Evidence */}
        {missingEvidence.length > 0 && (
          <div className="card mb-8 bg-red-50 border-red-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileX className="w-6 h-6 text-red-600" />
              Missing Evidence ({missingEvidence.length})
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              These documents are currently missing. Try to gather them to strengthen your case.
            </p>
            <div className="space-y-4">
              {missingEvidence.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-red-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{item.evidence_type}</h4>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      {item.notes && (
                        <p className="text-sm text-slate-500 mt-2 italic">{item.notes}</p>
                      )}
                    </div>
                    <span className={`badge ${getImportanceIcon(item.importance)} text-xs ml-4`}>
                      {item.importance}
                    </span>
                  </div>
                  {/* Future: Add upload button here */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unknown Evidence */}
        {unknownEvidence.length > 0 && (
          <div className="card mb-8 bg-amber-50 border-amber-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileQuestion className="w-6 h-6 text-amber-600" />
              Status Unknown ({unknownEvidence.length})
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              We're not sure if you have these documents. Check if they're available.
            </p>
            <div className="space-y-4">
              {unknownEvidence.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-amber-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{item.evidence_type}</h4>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      {item.notes && (
                        <p className="text-sm text-slate-500 mt-2 italic">{item.notes}</p>
                      )}
                    </div>
                    <span className={`badge ${getImportanceIcon(item.importance)} text-xs ml-4`}>
                      {item.importance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Evidence Data */}
        {evidence.length === 0 && (
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Evidence Analysis Pending
              </h3>
              <p className="text-slate-600 mb-4">
                Continue your assessment conversation to receive a detailed evidence checklist.
              </p>
              <Link to={`/assessment`} className="btn btn-primary">
                Continue Assessment
              </Link>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="card bg-blue-50 border-blue-200 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Tips for Gathering Evidence
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Keep all original documents safe and make multiple copies</li>
            <li>• Organize documents by date and category</li>
            <li>• If documents are in electronic form, keep backups</li>
            <li>• Get witness statements in writing where possible</li>
            <li>• Take photographs of physical evidence with dates</li>
            <li>• Keep a detailed timeline of events with dates</li>
            <li>• Preserve all communication (emails, messages, letters)</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="card bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <Link 
              to={`/action-plan/${token}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div>
                <h4 className="font-semibold text-slate-900">View Action Plan</h4>
                <p className="text-sm text-slate-600">See step-by-step guidance for your next actions</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-blue-900 transform rotate-180" />
            </Link>

            <Link 
              to={`/resources/${token}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div>
                <h4 className="font-semibold text-slate-900">Find Legal Resources</h4>
                <p className="text-sm text-slate-600">Connect with legal aid services and lawyers</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-blue-900 transform rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
