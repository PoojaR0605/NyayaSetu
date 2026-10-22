import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, AlertCircle, Calendar, Tag } from 'lucide-react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export default function SavedAssessments() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { savedAssessments, isLoading, error, loadSavedAssessments, deleteAssessment } = useAssessmentStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadSavedAssessments();
  }, [isAuthenticated]);

  const handleDelete = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    setDeletingId(assessmentId);
    try {
      await deleteAssessment(assessmentId);
    } catch (err) {
      // Error handled by store
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      ACTIVE: { className: 'badge-info', label: 'Active' },
      COMPLETED: { className: 'badge-success', label: 'Completed' },
      ABANDONED: { className: 'badge-warning', label: 'Abandoned' },
    };
    const config = configs[status as keyof typeof configs] || configs.ACTIVE;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const getEligibilityBadge = (status?: string) => {
    if (!status) return null;
    const configs = {
      POTENTIALLY_ELIGIBLE: { className: 'badge-success', label: 'Potentially Eligible' },
      MAY_BE_ELIGIBLE: { className: 'badge-info', label: 'May Be Eligible' },
      MORE_INFO_REQUIRED: { className: 'badge-warning', label: 'More Info Required' },
      NOT_ELIGIBLE: { className: 'badge', label: 'Not Eligible' },
    };
    const config = configs[status as keyof typeof configs];
    if (!config) return null;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const getUrgencyBadge = (level?: string) => {
    if (!level) return null;
    const configs = {
      NORMAL: { className: 'badge-success', label: 'Normal' },
      IMPORTANT: { className: 'badge-info', label: 'Important' },
      URGENT: { className: 'badge-warning', label: 'Urgent' },
      POSSIBLE_IMMEDIATE_SAFETY_CONCERN: { className: 'badge-danger', label: 'Safety Concern' },
    };
    const config = configs[level as keyof typeof configs];
    if (!config) return null;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading your assessments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            My Assessments
          </h1>
          <p className="text-slate-600">
            View and manage your saved legal assessments
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadSavedAssessments}
            className="mb-6"
          />
        )}

        {/* New Assessment Button */}
        <div className="mb-6">
          <Link to="/assessment" className="btn btn-primary">
            <FileText className="w-4 h-4 mr-2" />
            Start New Assessment
          </Link>
        </div>

        {/* Assessments List */}
        {savedAssessments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Saved Assessments"
            description="You haven't started any assessments yet. Begin your first assessment to understand your legal situation and find resources."
            action={{
              label: 'Start First Assessment',
              onClick: () => navigate('/assessment'),
            }}
          />
        ) : (
          <div className="space-y-4">
            {savedAssessments.map((assessment) => (
              <div key={assessment.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getStatusBadge(assessment.status)}
                      {assessment.urgency_level && getUrgencyBadge(assessment.urgency_level)}
                      {assessment.eligibility_status && getEligibilityBadge(assessment.eligibility_status)}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {assessment.legal_issue || 'Assessment in Progress'}
                    </h3>

                    {assessment.legal_domain && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <Tag className="w-4 h-4" />
                        <span>{assessment.legal_domain}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created: {new Date(assessment.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Scores */}
                    {assessment.justice_readiness_score !== undefined && (
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Justice Readiness:</span>
                          <span className="font-semibold text-slate-900 ml-2">
                            {assessment.justice_readiness_score}%
                          </span>
                        </div>
                        {assessment.evidence_readiness !== undefined && (
                          <div>
                            <span className="text-slate-500">Evidence:</span>
                            <span className="font-semibold text-slate-900 ml-2">
                              {assessment.evidence_readiness}%
                            </span>
                          </div>
                        )}
                        {assessment.information_completeness !== undefined && (
                          <div>
                            <span className="text-slate-500">Info:</span>
                            <span className="font-semibold text-slate-900 ml-2">
                              {assessment.information_completeness}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Link 
                      to={`/results/${assessment.session_token}`}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(assessment.id)}
                      isLoading={deletingId === assessment.id}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Note */}
        <div className="card bg-blue-50 border-blue-200 mt-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Note:</strong> Your assessments are securely stored and can only be accessed by you. 
              Deleting an assessment will permanently remove all associated data including conversation history, 
              evidence checklists, and action plans.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
