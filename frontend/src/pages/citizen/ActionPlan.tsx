import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Circle, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAssessmentStore } from '../../store/assessmentStore';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

export default function ActionPlan() {
  const { token } = useParams<{ token: string }>();
  const { 
    currentAssessment, 
    actionPlan, 
    isLoading, 
    error, 
    loadAssessment, 
    loadActionPlan,
    updateActionItemStatus
  } = useAssessmentStore();
  
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadAssessment(token).then(() => {
        if (currentAssessment?.id) {
          loadActionPlan(currentAssessment.id);
        }
      });
    }
  }, [token]);

  const handleStatusChange = async (itemId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    setUpdatingItemId(itemId);
    try {
      await updateActionItemStatus(itemId, newStatus);
    } catch (err) {
      // Error handled by store
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading action plan...</p>
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
            message={error || 'Action plan not found'}
            onRetry={() => token && loadAssessment(token)}
          />
        </div>
      </Layout>
    );
  }

  const pendingItems = actionPlan.filter(item => item.status === 'PENDING');
  const inProgressItems = actionPlan.filter(item => item.status === 'IN_PROGRESS');
  const completedItems = actionPlan.filter(item => item.status === 'COMPLETED');

  const completionPercentage = actionPlan.length > 0 
    ? Math.round((completedItems.length / actionPlan.length) * 100) 
    : 0;

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
            Your Action Plan
          </h1>
          <p className="text-slate-600">
            Step-by-step guidance for moving forward with your legal situation
          </p>
        </div>

        {/* Progress Card */}
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
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{completionPercentage}%</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Overall Progress</h2>
              <p className="text-slate-600">
                <strong>{completedItems.length}</strong> of <strong>{actionPlan.length}</strong> actions completed
              </p>
            </div>
          </div>
        </div>

        {/* No Actions */}
        {actionPlan.length === 0 && (
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Action Plan Pending
              </h3>
              <p className="text-slate-600 mb-4">
                Continue your assessment to receive a personalized action plan.
              </p>
              <Link to={`/assessment`} className="btn btn-primary">
                Continue Assessment
              </Link>
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgressItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              In Progress ({inProgressItems.length})
            </h3>
            <div className="space-y-4">
              {inProgressItems.map((item) => (
                <div key={item.id} className="card border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 text-lg">{item.title}</h4>
                        {item.priority && (
                          <span className="badge badge-info text-xs ml-4">
                            Priority {item.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 mb-3">{item.description}</p>
                      {item.deadline && (
                        <p className="text-sm text-amber-700 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Deadline: {new Date(item.deadline).toLocaleDateString('en-IN')}
                        </p>
                      )}
                      {item.category && (
                        <span className="text-xs text-slate-500">Category: {item.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange(item.id, 'PENDING')}
                      disabled={updatingItemId === item.id}
                    >
                      Mark as Pending
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                      disabled={updatingItemId === item.id}
                    >
                      Mark as Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending */}
        {pendingItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Circle className="w-6 h-6 text-slate-400" />
              To Do ({pendingItems.length})
            </h3>
            <div className="space-y-4">
              {pendingItems.sort((a, b) => (a.priority || 999) - (b.priority || 999)).map((item) => (
                <div key={item.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 text-lg">{item.title}</h4>
                        {item.priority && (
                          <span className={`badge text-xs ml-4 ${
                            item.priority <= 2 ? 'badge-danger' : 
                            item.priority <= 4 ? 'badge-warning' : 
                            'badge-info'
                          }`}>
                            Priority {item.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 mb-3">{item.description}</p>
                      {item.deadline && (
                        <p className="text-sm text-amber-700 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Deadline: {new Date(item.deadline).toLocaleDateString('en-IN')}
                        </p>
                      )}
                      {item.category && (
                        <span className="text-xs text-slate-500">Category: {item.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                      disabled={updatingItemId === item.id}
                    >
                      Start Working on This
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Completed ({completedItems.length})
            </h3>
            <div className="space-y-4">
              {completedItems.map((item) => (
                <div key={item.id} className="card bg-green-50 border-green-200 opacity-75">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Links */}
        <div className="card bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Related Resources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              to={`/evidence/${token}`}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-slate-900 mb-1">Evidence Checklist</h4>
              <p className="text-sm text-slate-600">Review documents you need to gather</p>
            </Link>

            <Link 
              to={`/resources/${token}`}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h4 className="font-semibold text-slate-900 mb-1">Legal Resources</h4>
              <p className="text-sm text-slate-600">Find legal aid services near you</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
