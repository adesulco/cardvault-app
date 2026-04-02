'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, CheckCircle, ShieldCheck, AlertTriangle, Truck, Loader2, MessageSquare, Star, Printer } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;
  const { user } = useAppStore();

  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trackingNo, setTrackingNo] = useState('');

  const fetchTx = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}`);
      if (res.ok) {
        const data = await res.json();
        setTx(data.transaction);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !transactionId) return;
    fetchTx();
    const interval = setInterval(fetchTx, 5000);
    return () => clearInterval(interval);
  }, [user, transactionId]);

  const advanceEscrow = async (actionStr: string) => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/advance`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            userId: user.id,
            action: actionStr,
            trackingNumber: trackingNo
         })
      });
      if (res.ok) fetchTx();
      else {
         const d = await res.json();
         alert(d.error);
      }
    } catch {
       alert("Network synchronization failed.");
    } finally {
       setSubmitting(false);
    }
  };

  if (!user || loading) return <div className="p-12 flex justify-center text-blue-600"><Loader2 className="animate-spin" /></div>;
  if (!tx) return <div className="p-12 text-center text-gray-500">Transaction Not Found</div>;

  const isSeller = tx.sellerId === user.id;
  const isBuyer = tx.buyerId === user.id;
  const amt = tx.buyerPaidAmount || tx.agreedPriceIdr || 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20 max-w-lg mx-auto">
      <header className="px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
             <h1 className="text-sm font-bold text-gray-900 leading-tight">Secure Escrow Tracker</h1>
             <p className="text-[10px] text-gray-400 font-mono">ID: {tx.id.split('-')[0]}</p>
          </div>
        </div>
        <Link href={`/messages/${[tx.buyerId, tx.sellerId].sort().join('-chat-')}`} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full">
           <MessageSquare size={18} />
        </Link>
      </header>

      <div className="p-4 space-y-4">
         {/* Live Status Bar */}
         <div className="bg-white border text-sm font-semibold border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-3">
               {tx.escrowStatus === 'pending_payment' && <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center shrink-0"><Package size={20} /></div>}
               {tx.escrowStatus === 'payment_held' && <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0"><ShieldCheck size={20} /></div>}
               {tx.escrowStatus === 'shipped' && <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0"><Truck size={20} /></div>}
               {tx.escrowStatus === 'disputed' && <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={20} /></div>}
               {tx.escrowStatus === 'completed' && <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0"><CheckCircle size={20} /></div>}
               
               <div className="flex-1">
                 <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Physical State</p>
                 <h2 className="text-lg font-black text-gray-900 capitalize leading-tight">
                    {tx.escrowStatus.replace('_', ' ')}
                 </h2>
               </div>
            </div>

            {tx.escrowStatus === 'payment_held' && isSeller && (
               <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-xl leading-relaxed">
                  Funds secure! Package card safely and attach tracking code below instantly.
               </div>
            )}
            {tx.escrowStatus === 'shipped' && isBuyer && (
               <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl leading-relaxed font-medium flex gap-2">
                  <Truck className="shrink-0" size={16} /> Tracked Delivery running: {tx.trackingNumberSeller}
               </div>
            )}
            {tx.escrowStatus === 'completed' && (
               <div className="bg-green-50 border border-green-200 text-green-900 text-xs p-3 rounded-xl leading-relaxed font-bold flex items-center gap-2">
                 <ShieldCheck size={16} /> Funds Transferred Successfully
               </div>
            )}
         </div>

         {/* Product Details */}
         <div className="bg-white border text-sm font-semibold border-gray-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-16 h-20 bg-slate-200 rounded-lg shrink-0 overflow-hidden shadow-sm">
               {tx.listing?.card?.frontImageUrl && (
                  <img src={tx.listing.card.frontImageUrl} alt="Card" className="w-full h-full object-cover" />
               )}
            </div>
            <div className="flex-1">
               <h3 className="text-base text-gray-900 mb-1">{tx.listing?.card?.cardName}</h3>
               <p className="text-xs text-gray-500 font-normal mb-2">{isBuyer ? 'Purchased from Seller:' : 'Sold to Buyer:'} {isBuyer ? tx.seller.displayName : tx.buyer.displayName}</p>
               <div className="font-mono text-blue-600 font-bold tracking-tight">Rp {amt.toLocaleString('id-ID')}</div>
            </div>
         </div>

          {/* Interactive Workflow Buttons depending on Escrow State & Identity */}
         <div className="pt-2 space-y-3">
            {isSeller && tx.escrowStatus === 'payment_held' && (
               <>
                 <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
                    <p className="text-xs text-slate-300 font-bold leading-relaxed">
                       Escrow is secured and verified. You may now generate the official CardVault AWB shipping label or use your own courier.
                    </p>
                    <button 
                       onClick={() => {
                          window.open(`/logistics/print/${tx.id}`, '_blank');
                          // Systematically generate tracking & advance the escrow state
                          const awb = `CV-AWB-${Math.floor(Math.random() * 100000000)}`;
                          setTrackingNo(awb);
                          advanceEscrow('ship_item');
                       }}
                       disabled={submitting}
                       className="w-full bg-white text-slate-900 font-black py-3.5 rounded-xl shadow-lg flex justify-center items-center gap-2 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
                    >
                       {submitting ? 'Generating...' : <><Printer size={18} /> GENERATE OFFICIAL LOGISTICS LABEL</>}
                    </button>
                    <div className="text-center">
                       <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">or manually dispatch below</span>
                    </div>
                 </div>

                 <label className="block text-xs font-bold text-gray-700 ml-1 mt-4">Attach Waybill Tracking Code</label>
                 <input type="text" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} disabled={submitting} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 font-mono text-sm shadow-sm" placeholder="JNE/J&T/Sicepat..." />
                 <button onClick={() => advanceEscrow('ship_item')} disabled={!trackingNo || submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50">
                   {submitting ? 'Authenticating...' : 'Mark as Dispatched / Shipped'}
                 </button>
               </>
            )}

            {isBuyer && tx.escrowStatus === 'shipped' && (
               <>
                 <button onClick={() => advanceEscrow('release_escrow')} disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl disabled:opacity-50 shadow-md flex justify-center items-center gap-2">
                   <CheckCircle size={18} /> Physical Inspection Passed! (Release Escrow)
                 </button>
                 <Link href={`/transactions/${tx.id}/dispute`} className="flex justify-center items-center gap-1.5 w-full bg-white text-rose-600 border border-rose-200 font-bold py-3.5 rounded-xl hover:bg-rose-50 transition-colors">
                   <AlertTriangle size={16} /> Open Fraud / Damage Dispute
                 </Link>
                 <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed font-medium">Warning: Clicking "Release Escrow" permanently severs CardVault's protection capabilities and transfers cash to the seller's bank.</p>
               </>
            )}

            {tx.escrowStatus === 'completed' && isBuyer && (
               <Link href={`/transactions/${tx.id}/review`} className="flex w-full items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  <Star size={18} className="text-amber-400 fill-amber-400" /> Grade Seller Trust Reputation
               </Link>
            )}
         </div>

      </div>
    </div>
  );
}
