import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { AdminDashboardStats } from '../../types';
import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.detail || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <ErrorMessage message={error} onRetry={loadStats} />
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Overview of NYAYASETU platform analytics and statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assessments */}
          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-10 h-10 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total_assessments}</p>
          </div>

          {/* Completed */}
          <div className="card bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-slate-900">{stats.completed_assessments}</p>
          </div>

          {/* Potentially Eligible */}
          <div className="card bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Potentially Eligible</p>
            <p className="text-3xl font-bold text-slate-900">{stats.potentially_eligible}</p>
          </div>

          {/* Urgent Cases */}
          <div className="card bg-gradient-to-br from-amber-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Urgent Cases</p>
            <p className="text-3xl font-bold text-slate-900">{stats.urgent_cases}</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Active Assessments */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Assessment Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Active</span>
                <span className="font-semibold text-slate-900">{stats.active_assessments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-slate-900">{stats.completed_assessments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold text-slate-900">{stats.total_assessments}</span>
              </div>
            </div>
          </div>

          {/* Referrals */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Referrals Made</h3>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-900">{stats.referrals_made}</span>
              </div>
              <p className="text-sm text-slate-600">
                Total number of resource referrals provided to users
              </p>
            </div>
          </div>
        </div>

        {/* Common Legal Domains */}
        {stats.common_legal_domains && stats.common_legal_domains.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Common Legal Domains
            </h3>
            <div className="space-y-3">
              {stats.common_legal_domains.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-700 font-medium">{item.domain}</span>
                      <span className="text-sm text-slate-600">{item.count} cases</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / stats.total_assessments) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="card bg-blue-50 border-blue-200 mt-8">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This dashboard provides a high-level overview of platform usage. 
            All user data is anonymized and aggregated to protect privacy.
          </p>
        </div>
      </div>
    </Layout>
  );
}
