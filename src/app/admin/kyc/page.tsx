'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ChevronLeft, RefreshCw, User } from 'lucide-react';

interface KycApplication {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  userRole: string;
  socialMedia?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  kycSubmittedAt?: string;
  kycReviewNote?: string;
  countryCode?: string;
  createdAt: string;
}

export default function AdminKycPage() {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // The KYC API returns PENDING users by default; we'll fetch all users for filtering
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to fetch KYC applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (appId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewing(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: appId, status, note: reviewNote }),
      });

      if (res.ok) {
        setActionMessage(`User ${status.toLowerCase()} successfully`);
        setSelectedApp(null);
        setReviewNote('');
        // Refresh list
        await fetchApplications();
      } else {
        const data = await res.json();
        setActionMessage(`Error: ${data.error || 'Action failed'}`);
      }
    } catch (error) {
      setActionMessage('Error: Network request failed');
    } finally {
      setReviewing(false);
    }
  };

  const filteredApps = filter === 'ALL'
    ? applications
    : applications.filter(app => app.kycStatus === filter);

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.kycStatus === 'PENDING').length,
    APPROVED: applications.filter(a => a.kycStatus === 'APPROVED').length,
    REJECTED: applications.filter(a => a.kycStatus === 'REJECTED').length,
  };

  // Detail view
  if (selectedApp) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedApp(null); setActionMessage(''); }} className="text-blue-600 hover:text-blue-800">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Review Application</h1>
        </div>

        {actionMessage && (
          <div className={`p-3 rounded-lg text-sm ${actionMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {actionMessage}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {/* User Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedApp.displayName || 'Unnamed'}</p>
                <p className="text-xs text-slate-500">{selectedApp.email}</p>
              </div>
              <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${
                selectedApp.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                selectedApp.kycStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {selectedApp.kycStatus}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Role</p>
              <p className="text-slate-900">{selectedApp.userRole}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Country</p>
              <p className="text-slate-900">{selectedApp.countryCode || 'ID'}</p>
            </div>
            {selectedApp.phone && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Phone</p>
                <p className="text-slate-900">{selectedApp.phone}</p>
              </div>
            )}
            {selectedApp.socialMedia && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase">Social Media</p>
                <a href={selectedApp.socialMedia} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all text-xs">
                  {selectedApp.socialMedia}
                </a>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Registered</p>
              <p className="text-slate-900">{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
            </div>
            {selectedApp.kycReviewNote && (
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-400 uppercase">Previous Review Note</p>
                <p className="text-slate-700 text-xs bg-slate-50 p-2 rounded mt-1">{selectedApp.kycReviewNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Take Action</h3>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Review Note (optional)</label>
            <textarea
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="Add a note about this decision..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAction(selectedApp.id, 'APPROVED')}
              disabled={reviewing}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {reviewing ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => handleAction(selectedApp.id, 'REJECTED')}
              disabled={reviewing}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              {reviewing ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">KYC Approvals</h1>
          <p className="text-sm text-slate-500">Review and manage user verification</p>
        </div>
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      {actionMessage && (
        <div className={`p-3 rounded-lg text-sm ${actionMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {actionMessage}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-900 mb-1">No applications</p>
          <p className="text-xs text-slate-500">
            {filter === 'ALL' ? 'No users registered yet' : `No ${filter.toLowerCase()} applications`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApps.map(app => {
            const statusIcon = app.kycStatus === 'APPROVED' ? (
              <CheckCircle size={16} className="text-emerald-600" />
            ) : app.kycStatus === 'REJECTED' ? (
              <XCircle size={16} className="text-red-600" />
            ) : (
              <Clock size={16} className="text-amber-600" />
            );

            return (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{app.displayName || 'Unnamed'}</p>
                      {statusIcon}
                    </div>
                    <p className="text-xs text-slate-500">{app.email}</p>
                    <p className="text-xs text-slate-400 mt-1">{app.userRole} &middot; Joined {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  {app.kycStatus === 'PENDING' && (
                    <span className="text-xs font-medium px-3 py-1 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
                      Needs Review
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
