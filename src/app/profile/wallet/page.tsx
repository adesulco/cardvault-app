'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Coins, Gift, ArrowUpRight, ArrowDownLeft, Zap, ArrowLeft, Loader2 } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAppStore();
  
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spending, setSpending] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchWallet = async () => {
       try {
          const res = await fetch(`/api/economy?userId=${user.id}`);
          const data = await res.json();
          setBalance(data.balance || 0);
          setHistory(data.history || []);
       } catch (err) {
          console.error(err);
       } finally {
          setLoading(false);
       }
    };
    fetchWallet();
  }, [user]);

  const handlePromote = async () => {
     if (balance < 100 || spending) return;
     if (!confirm('This converts 100 CardVault Coins into a 7-Day Global Search algorithm boost for your newest active Listing. Proceed?')) return;
     setSpending(true);
     try {
        const res = await fetch('/api/economy', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId: user?.id, action: 'promote_listing', spendAmount: 100, targetId: 'latest_listing' })
        });
        if (res.ok) {
           alert("Listing Boost Activated! Vault Coins deductive applied.");
           window.location.reload();
        } else {
           const err = await res.json();
           alert(err.error);
        }
     } catch {
        alert("Transaction network failure.");
     } finally {
        setSpending(false);
     }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 pb-20">
      <header className="px-4 py-4 bg-white border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Digital Vault</h1>
      </header>

      {/* Primary Balance Widget */}
      <div className="p-4">
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] p-6 text-white shadow-lg shadow-blue-900/10 relative overflow-hidden">
            {/* Absolute Deco */}
            <div className="absolute -right-4 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-2 relative z-10">
               <Coins size={18} className="text-yellow-400" />
               <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest">CardVault Coins</p>
            </div>
            {loading ? (
               <div className="h-10 w-24 bg-white/10 rounded animate-pulse my-2 relative z-10" />
            ) : (
               <div className="flex items-end gap-2 relative z-10">
                  <h2 className="text-5xl font-black tabular-nums tracking-tight">{balance}</h2>
                  <span className="text-lg text-slate-400 font-bold mb-1.5">CVC</span>
               </div>
            )}
            <p className="text-[11px] text-slate-400 font-medium mt-2 relative z-10 max-w-[200px] leading-relaxed">
               Earned from Escrow conversions (+50), Trust Reviews (+10), and automated engagements!
            </p>
         </div>
      </div>

      {/* Redemption Store */}
      <div className="px-4 mb-6">
         <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-1 mb-3">Loyalty Redemptions</h2>
         <div className="grid grid-cols-2 gap-3">
            <button 
               onClick={handlePromote}
               disabled={balance < 100 || spending}
               className="bg-white border text-left border-yellow-200/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 group flex flex-col justify-between h-[120px]"
            >
               <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 group-hover:bg-yellow-400 group-hover:text-white transition-colors">
                  {spending ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight mb-1">Search Boost Listing</p>
                  <p className="text-[11px] font-black text-yellow-600 bg-yellow-50 inline-block px-1.5 rounded uppercase">-100 CVC</p>
               </div>
            </button>
            <button disabled className="bg-white border text-left border-gray-200 p-4 rounded-2xl shadow-sm opacity-50 flex flex-col justify-between h-[120px]">
               <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <Gift size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight mb-1">5% Fee Commission Drop</p>
                  <p className="text-[11px] font-black text-slate-500 bg-slate-100 inline-block px-1.5 rounded uppercase">-500 CVC</p>
               </div>
            </button>
         </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="px-4">
         <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-1 mb-3">Economy Ledger</h2>
         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {loading ? (
               <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" size={24} /></div>
            ) : history.length === 0 ? (
               <div className="p-8 text-center text-slate-500 text-sm">No coin conversions detected. Complete an Escrow transaction to start earning!</div>
            ) : (
               history.map(item => {
                  const isPositive = item.amount > 0;
                  return (
                     <div key={item.id} className="flex flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-900 capitalize leading-tight">{item.source.replace('_', ' ')}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                           </div>
                        </div>
                        <span className={`text-sm font-black font-mono ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                           {isPositive ? '+' : ''}{item.amount}
                        </span>
                     </div>
                  );
               })
            )}
         </div>
      </div>

    </div>
  );
}
