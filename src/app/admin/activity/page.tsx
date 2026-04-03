'use client';
import { useState, useEffect } from 'react';
import { Users, ShieldCheck, ArrowLeftRight, AlertTriangle } from 'lucide-react';

interface Activity {
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/activity');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users size={18} className="text-blue-600" />;
      case 'kyc_submission':
        return <ShieldCheck size={18} className="text-amber-600" />;
      case 'transaction':
        return <ArrowLeftRight size={18} className="text-emerald-600" />;
      case 'dispute':
        return <AlertTriangle size={18} className="text-red-600" />;
      default:
        return <Users size={18} className="text-slate-600" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100 text-blue-800';
      case 'kyc_submission':
        return 'bg-amber-100 text-amber-800';
      case 'transaction':
        return 'bg-emerald-100 text-emerald-800';
      case 'dispute':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-sm text-slate-500">Recent platform activities and events</p>
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading && activities.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">No activities yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                    {getIconForType(activity.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(activity.type)}`}>
                          {activity.type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      {activity.metadata.userId && (
                        <div>
                          <span className="font-medium">User ID:</span> {activity.metadata.userId.slice(0, 8)}...
                        </div>
                      )}
                      {activity.metadata.transactionId && (
                        <div>
                          <span className="font-medium">Transaction ID:</span> {activity.metadata.transactionId.slice(0, 8)}...
                        </div>
                      )}
                      {activity.metadata.amount && (
                        <div>
                          <span className="font-medium">Amount:</span>{' '}
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                            activity.metadata.amount
                          )}
                        </div>
                      )}
                      {activity.metadata.status && (
                        <div>
                          <span className="font-medium">Status:</span> {activity.metadata.status}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-medium text-slate-700 mb-3">Activity Types</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <span className="text-xs text-slate-600">User Registration</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-600" />
            <span className="text-xs text-slate-600">KYC Submission</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-emerald-600" />
            <span className="text-xs text-slate-600">Transaction</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-xs text-slate-600">Dispute</span>
          </div>
        </div>
      </div>
    </div>
  );
}
