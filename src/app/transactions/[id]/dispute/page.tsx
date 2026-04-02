'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, UploadCloud, ShieldAlert, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function OpenDisputePage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;
  const { user } = useAppStore();

  const [form, setForm] = useState({ reason: '', description: '', evidenceUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          openedByUserId: user.id,
          reason: form.reason,
          description: form.description
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push(`/transactions/${transactionId}`), 3000);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch {
       alert("Network synchronization failed. Escrow could not be frozen.");
    } finally {
       if (!success) setSubmitting(false);
    }
  };

  if (!user) return null;

  if (success) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
           <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-200 animate-pulse">
               <ShieldAlert size={40} className="text-rose-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Escrow Frozen</h2>
           <p className="text-gray-500 text-center max-w-xs text-sm">Your cash has been securely locked. A platform administrator will investigate your physical evidence imminently.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-xl mx-auto pb-10">
      <header className="px-4 py-4 border-b border-gray-100 flex items-center gap-3 bg-rose-50/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-rose-600 hover:bg-rose-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-rose-900">Halt Transaction</h1>
      </header>

      <div className="px-4 py-6 text-sm text-rose-800 bg-rose-50 border-b border-rose-100 flex gap-3">
         <AlertTriangle className="shrink-0" size={20} />
         <p>Warning: Opening a dispute immediately freezes all seller cash flow and alerts platform administrators. <strong>False claims carry an immediate permanent platform ban.</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pt-6">
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Categorize Fraud / Damage *</label>
            <select required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none">
               <option value="">Select Primary Reason</option>
               <option value="counterfeit">Counterfeit / Fake Card</option>
               <option value="damaged">Damaged in Transit (Poor Packaging)</option>
               <option value="wrong_item">Incorrect Item Shipped</option>
               <option value="not_as_described">Not As Described (e.g. Raw not Mint)</option>
               <option value="other">Other Severe Issue</option>
            </select>
         </div>

         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Detailed Physical Rationale *</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Explicitly describe the discrepancy off camera..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-sm" />
         </div>

         <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Unboxing Evidence (Required)</label>
            <div 
               onClick={() => setForm({...form, evidenceUrl: 'mock-upload'})} 
               className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${form.evidenceUrl ? 'bg-blue-50 border-blue-400' : 'hover:bg-slate-50 border-slate-300'}`}
            >
               <UploadCloud size={28} className={`mb-2 ${form.evidenceUrl ? 'text-blue-600' : 'text-slate-400'}`} />
               <p className="text-sm font-semibold text-slate-700">{form.evidenceUrl ? 'Video Log Attached' : 'Attach Unboxing Video (MP4)'}</p>
            </div>
         </div>

         <div className="pt-4">
            <button type="submit" disabled={submitting || !form.reason || !form.description || !form.evidenceUrl} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4.5 py-4 rounded-2xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
               {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldAlert size={20} />}
               Freeze Escrow & Transmit
            </button>
         </div>
      </form>
    </div>
  );
}
