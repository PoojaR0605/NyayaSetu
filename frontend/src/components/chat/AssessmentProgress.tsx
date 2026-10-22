import { AlertTriangle, CheckCircle, FileText, Scale } from 'lucide-react';

interface AssessmentProgressProps {
  detectedDomain?: string | null;
  urgencyLevel?: string | null;
  messageCount: number;
}

export default function AssessmentProgress({ 
  detectedDomain, 
  urgencyLevel, 
  messageCount 
}: AssessmentProgressProps) {
  const getUrgencyBadge = () => {
    if (!urgencyLevel) return null;

    const urgencyConfig = {
      NORMAL: { icon: CheckCircle, className: 'bg-green-100 text-green-800', label: 'Normal' },
      IMPORTANT: { icon: FileText, className: 'bg-blue-100 text-blue-800', label: 'Important' },
      URGENT: { icon: AlertTriangle, className: 'bg-amber-100 text-amber-800', label: 'Urgent' },
      POSSIBLE_IMMEDIATE_SAFETY_CONCERN: { 
        icon: AlertTriangle, 
        className: 'bg-red-100 text-red-800', 
        label: 'Safety Concern' 
      },
    };

    const config = urgencyConfig[urgencyLevel as keyof typeof urgencyConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <div className={`badge ${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3">
      <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Assessment in Progress</span>
        </div>

        {detectedDomain && (
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-900" />
            <span className="text-slate-700 font-medium">{detectedDomain}</span>
          </div>
        )}

        {urgencyLevel && getUrgencyBadge()}

        <div className="ml-auto text-slate-500">
          {messageCount} message{messageCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
