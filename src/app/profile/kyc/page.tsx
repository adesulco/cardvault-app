'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, UploadCloud, Loader2, AlertCircle } from 'lucide-react';

export default function KycPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState({ idDocumentUrl: '', selfieUrl: '' });

  useEffect(() => {
    if (!user) return;
    fetch(`/api/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) setKycStatus(data.user.kycStatus);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSimulateUpload = async (field: 'idDocumentUrl' | 'selfieUrl') => {
    // In production, this would trigger our /api/upload endpoint exactly like auth/register does
    setDocuments(prev => ({ ...prev, [field]: 'https://cardvault.id/mock-upload-success.jpg' }));
  };

  const submitKyc = async () => {
    if (!user || !documents.idDocumentUrl || !documents.selfieUrl) return;
    setUploading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          idDocumentUrl: documents.idDocumentUrl,
          selfieUrl: documents.selfieUrl,
          kycStatus: 'PENDING'
        })
      });
      if (res.ok) {
        setKycStatus('PENDING');
        alert('KYC documentation submitted securely for Admin Review.');
      }
    } catch {
      alert('Verification request failed. Please retry.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      <header className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Identity Verification</h1>
      </header>

      {loading ? (
        <div className="p-12 flex justify-center text-blue-600"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="px-4 space-y-6">
          {kycStatus === 'APPROVED' ? (
             <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
               <ShieldCheck size={48} className="text-green-600 mx-auto mb-3" />
               <h2 className="text-lg font-bold text-green-900 mb-1">Fully Verified</h2>
               <p className="text-sm text-green-700">Your account is physically verified and you have full unrestricted access to global marketplace Escrow functionality!</p>
             </div>
          ) : kycStatus === 'PENDING' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center animate-pulse">
              <Loader2 size={48} className="text-blue-600 mx-auto mb-3 animate-spin" />
              <h2 className="text-lg font-bold text-blue-900 mb-1">Under Review</h2>
              <p className="text-sm text-blue-700">Our compliance administrators are systematically reviewing your submitted Government ID. Please hold tight!</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-sm">
                <AlertCircle className="shrink-0 text-amber-600" />
                You must perform strict platform KYC verification before deploying listings or completing high-value cash settlement trades.
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => handleSimulateUpload('idDocumentUrl')}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${documents.idDocumentUrl ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-gray-300'}`}
                >
                  <UploadCloud size={24} className={`mx-auto mb-2 ${documents.idDocumentUrl ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold">{documents.idDocumentUrl ? 'ID Document Secured' : 'Upload Government ID (KTP/Passport)'}</p>
                </div>

                <div 
                  onClick={() => handleSimulateUpload('selfieUrl')}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${documents.selfieUrl ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-gray-300'}`}
                >
                  <UploadCloud size={24} className={`mx-auto mb-2 ${documents.selfieUrl ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold">{documents.selfieUrl ? 'Liveness Selfie Secured' : 'Snap a quick Selfie'}</p>
                </div>
              </div>

              <button 
                disabled={uploading || !documents.idDocumentUrl || !documents.selfieUrl}
                onClick={submitKyc}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                Transmit for Verification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
