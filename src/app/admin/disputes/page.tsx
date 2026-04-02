'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, Gavel, CheckCircle, RefreshCw, Undo2, Copy } from 'lucide-react';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/disputes');
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch {
      console.error('Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (disputeId: string, action: 'refund_buyer' | 'release_seller') => {
    if (!confirm(`Are you sure you want to rigorously enforce a ${action.replace('_', ' ').toUpperCase()} verdict? This permanently redirects Escrow cash flow.`)) return;
    
    setResolvingId(disputeId);
    try {
      const res = await fetch('/api/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, resolution: action })
      });
      if (res.ok) fetchDisputes();
      else alert('Failed executing ruling');
    } catch {
       alert('Verification network failed');
    } finally {
       setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 border-l-4 border-rose-600 pl-3">Fraud & Damage Disputes</h1>
          <p className="text-sm text-gray-500 mt-1 pl-4">Platform Escrow Intervention Terminal</p>
        </div>
        <button onClick={fetchDisputes} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
          <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {loading && disputes.length === 0 ? (
        <div className="p-12 text-center text-gray-500">Loading Active Frauds...</div>
      ) : disputes.length === 0 ? (
         <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center">
            <CheckCircle size={40} className="mx-auto text-green-600 mb-3" />
            <h3 className="font-bold text-green-900">Zero Active Escalations</h3>
            <p className="text-sm text-green-700">All P2P marketplace escrows are running harmoniously with zero buyer reports!</p>
         </div>
      ) : (
        <div className="grid gap-6">
          {disputes.map(d => {
             const isResolved = d.resolution !== 'pending';
             const amtIdr = d.transaction.agreedPriceIdr || d.transaction.buyerPaidAmount || 0;
             const targetColor = isResolved ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200';

             return (
               <div key={d.id} className={`border p-6 rounded-2xl shadow-sm ${targetColor}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                     
                     {/* Left Summary Block */}
                     <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                           <ShieldAlert className={isResolved ? 'text-slate-400' : 'text-rose-600 animate-pulse'} size={20} />
                           <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${isResolved ? 'bg-slate-200 text-slate-700' : 'bg-rose-600 text-white'}`}>
                              {d.reason.replace(/_/g, ' ')}
                           </span>
                           <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 group cursor-pointer hover:text-black">
                              ID: {d.id.split('-')[0]} <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                           </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-rose-100/50">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Buyer Testimony</h4>
                           <p className="text-sm font-medium text-gray-800 italic leading-relaxed">"{d.description}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                           <div>
                              <p className="text-gray-500">Card In Dispute</p>
                              <p className="font-bold text-gray-900 truncate">{d.transaction.listing?.card?.cardName}</p>
                           </div>
                           <div>
                              <p className="text-gray-500">Froze Escrow Value</p>
                              <p className="font-bold text-blue-600 font-mono">Rp {amtIdr.toLocaleString('id-ID')}</p>
                           </div>
                        </div>
                     </div>

                     {/* Intercept Terminal Block */}
                     <div className="w-full md:w-64 bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                        <div>
                           <div className="flex items-center justify-between mb-3 text-xs">
                              <span className="text-gray-500">Seller</span>
                              <span className="font-bold text-gray-900 truncate w-24 text-right">{d.transaction.seller.displayName}</span>
                           </div>
                           <div className="flex items-center justify-between mb-4 border-b pb-4 text-xs">
                              <span className="text-gray-500">Buyer</span>
                              <span className="font-bold text-gray-900 truncate w-24 text-right">{d.transaction.buyer.displayName}</span>
                           </div>
                        </div>

                        {isResolved ? (
                           <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center text-sm font-semibold text-slate-700">
                             Verdict Settled: <span className="uppercase">{d.resolution}</span>
                           </div>
                        ) : (
                           <div className="space-y-2 mt-auto">
                              <button 
                                onClick={() => handleResolve(d.id, 'refund_buyer')} 
                                disabled={resolvingId === d.id}
                                className="w-full flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                              >
                                 <Undo2 size={16} /> Force Refund Buyer (Win)
                              </button>
                              <button 
                                onClick={() => handleResolve(d.id, 'release_seller')} 
                                disabled={resolvingId === d.id}
                                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                              >
                                 <Gavel size={16} /> Release To Seller (Win)
                              </button>
                           </div>
                        )}
                     </div>

                  </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
