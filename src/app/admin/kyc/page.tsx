'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  createdAt: string;
}

export default function AdminKycPage() {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/admin/kyc?status=${filter}`);
        // const data = await response.json();
        // setApplications(data);

        setApplications([]);
      } catch (error) {
        console.error('Failed to fetch KYC applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filter]);

  const handleApprove = async (appId: string) => {
    setReviewing(true);
    try {
      // TODO: Call API to approve
      // await fetch(`/api/admin/kyc/${appId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: 'APPROVED', note: reviewNote }),
      // });
      setSelectedApp(null);
      setReviewNote('');
      // Refresh list
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async (appId: string) => {
    setReviewing(true);
    try {
      // TODO: Call API to reject
      // await fetch(`/api/admin/kyc/${appId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: 'REJECTED', note: reviewNote }),
      // });
      setSelectedApp(null);
      setReviewNote('');
      // Refresh list
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setReviewing(false);
    }
  };

  const filteredApps = filter === 'ALL'
    ? applications
    : applications.filter(app => app.kycStatus === filter);

  if (selectedApp) {
    return (
      <div className="space-y-4 p-4 pb-12">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedApp(null)} className="text-blue-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Review Application</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Applicant Info</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{selectedApp.displayName}</p>
            <p className="text-xs text-gray-600">{selectedApp.email}</p>
            {selectedApp.phone && <p className="text-xs text-gray-600">{selectedApp.phone}</p>}
            <p className="text-xs text-gray-600">Role: {selectedApp.userRole}</p>
          </div>

          {selectedApp.socialMedia && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Social Media</label>
              <a href={selectedApp.socialMedia} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 break-all">
                {selectedApp.socialMedia}
              </a>
            </div>
          )}

          {selectedApp.idDocumentUrl && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">ID Document</label>
              <a href={selectedApp.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                View Document
              </a>
            </div>
          )}

          {selectedApp.selfieUrl && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Selfie</label>
              <a href={selectedApp.selfieUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                View Photo
              </a>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Status: <span className="font-medium text-gray-700">{selectedApp.kycStatus}</span></p>
            <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {selectedApp.kycStatus === 'PENDING' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Review Notes (optional)</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Add notes about this application..."
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(selectedApp.id)}
                disabled={reviewing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {reviewing ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={reviewing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {reviewing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">KYC Applications</h1>
        <p className="text-sm text-gray-500">Review seller verification applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 flex gap-2 overflow-x-auto">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Loading applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">No applications</p>
          <p className="text-xs text-gray-500">
            {filter === 'ALL' ? 'No KYC applications yet' : `No ${filter.toLowerCase()} applications`}
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filteredApps.map(app => {
            const statusIcon = app.kycStatus === 'APPROVED' ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : app.kycStatus === 'REJECTED' ? (
              <XCircle size={16} className="text-red-600" />
            ) : (
              <Clock size={16} className="text-yellow-600" />
            );

            return (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="w-full bg-white rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{app.displayName}</p>
                      {statusIcon}
                    </div>
                    <p className="text-xs text-gray-600">{app.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{app.userRole} • Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
