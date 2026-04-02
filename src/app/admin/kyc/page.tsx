'use client';
import { useState, useEffect } from 'react';
import { Shield, Check, X, Lock } from 'lucide-react';

export default function AdminKycDashboard() {
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  // Hardcoded dev mode OTP
  const ADMIN_OTP_OVERRIDE = '123456';

  const toggleDocs = (userId: string) => {
    setExpandedDocs(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === ADMIN_OTP_OVERRIDE) {
      setIsVerified(true);
      fetchQueue();
    } else {
      alert('Invalid OTP Security Code.');
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/admin/kyc');
      const data = await res.json();
      setQueue(data.queue || []);
    } catch (err) { }
    finally { setLoading(false); }
  };

  const handleDecision = async (userId: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${action} this identity document?`)) return;
    try {
      setQueue(q => q.filter(u => u.id !== userId));
      await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, note: action === 'REJECTED' ? 'Documents illegible' : null })
      });
    } catch (err) {
      alert('Failed to process.');
    }
  };

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
         <form onSubmit={handleOtpSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Security</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your 6-digit Authenticator OTP to securely access PII (Personally Identifiable Information).</p>
            <input 
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="text-center text-3xl tracking-widest font-mono w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl mb-4 focus:border-blue-500"
            />
            <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold">
              Verify Access
            </button>
         </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" /> KYC Approval Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review pending government IDs and selfies to assign Trusted Seller Badges.</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
          {queue.length} Pending
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading queue...</div>
      ) : queue.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-bold text-gray-900">Queue Null</h3>
          <p className="text-sm text-gray-500">All users have been verified.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map(user => (
            <div key={user.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                 <div>
                   <h3 className="text-lg font-bold text-gray-900">{user.displayName || 'Unknown'}</h3>
                   <p className="text-sm text-gray-500">{user.email}</p>
                 </div>
                 <div className="text-xs text-gray-400">
                   Submitted {new Date(user.kycSubmittedAt).toLocaleDateString()}
                 </div>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
                 <div className="flex gap-4 items-center">
                    <span className="text-sm font-semibold text-gray-700">Verification Files</span>
                    {(!user.idDocumentUrl && !user.selfieUrl) ? (
                       <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Missing Uploads</span>
                    ) : (
                       <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Files Attached</span>
                    )}
                 </div>
                 {(user.idDocumentUrl || user.selfieUrl) && (
                   <button 
                     onClick={() => toggleDocs(user.id)}
                     className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                   >
                     {expandedDocs[user.id] ? 'Hide Documents ▲' : 'View Documents ▼'}
                   </button>
                 )}
              </div>

              {expandedDocs[user.id] && (
                <div className="grid grid-cols-2 gap-6 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Government ID</p>
                    <div className="aspect-[4/3] bg-gray-200 rounded-xl relative overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center">
                      {user.idDocumentUrl ? (
                         <img src={user.idDocumentUrl} alt="Government ID" className="w-full h-full object-cover hover:object-contain transition-all" />
                      ) : (
                         <div className="text-center text-gray-500 font-medium text-sm flex flex-col items-center gap-2">
                           <X className="text-gray-400" size={24} />
                           No ID Uploaded
                         </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Selfie Verification</p>
                    <div className="aspect-[4/3] bg-gray-200 rounded-xl relative overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center">
                      {user.selfieUrl ? (
                         <img src={user.selfieUrl} alt="Selfie Check" className="w-full h-full object-cover hover:object-contain transition-all" />
                      ) : (
                         <div className="text-center text-gray-500 font-medium text-sm flex flex-col items-center gap-2">
                           <X className="text-gray-400" size={24} />
                           No Selfie Uploaded
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => handleDecision(user.id, 'APPROVED')}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Check size={18} /> Approve (+10 Trust Score)
                </button>
                <button 
                  onClick={() => handleDecision(user.id, 'REJECTED')}
                  className="flex-1 py-3 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
