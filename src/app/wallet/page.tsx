'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Wallet, ArrowDownLeft, ArrowUpRight, History, ShieldAlert, Building2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function WalletDashboard() {
  const { user } = useAppStore();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'topup' | 'withdraw'>('none');
  const [amount, setAmount] = useState('');
  const [bankParams, setBankParams] = useState({ code: 'bca', num: '', name: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLedger = () => {
    if (!user?.id) return;
    fetch(`/api/wallet/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setBalance(data.walletBalanceIdr || 0);
        setHistory(data.history || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, [user?.id]);

  const handleTopUp = async () => {
    const val = parseInt(amount.replace(/\D/g, ''));
    if (!val || val < 10000) return alert('Minimum Rp 10.000');
    setIsProcessing(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amountIdr: val, paymentMethod: 'qris' }) 
        // Defaulting to qris for standard midtrans simulation
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // Hand off to Midtrans
      } else {
        alert(data.error || 'Gateway refused connection');
      }
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  const handleWithdraw = async () => {
    const val = parseInt(amount.replace(/\D/g, ''));
    if (!val || val > balance) return alert('Insufficient Vault Limits');
    if (!bankParams.num || !bankParams.name) return alert('Complete Bank Routing needed');
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           userId: user?.id, 
           amountIdr: val, 
           bankCode: bankParams.code, 
           accountNumber: bankParams.num, 
           accountName: bankParams.name 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Withdrawal queued for secure settlement.');
        setActiveModal('none');
        setAmount('');
        fetchLedger();
      } else {
        alert(data.error || 'Failed to queue payout');
      }
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading Ledger...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto md:border-x shadow-sm md:mt-4 md:rounded-3xl md:h-[calc(100vh-2rem)] md:overflow-y-auto relative">
      <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 rounded-b-[40px] px-6 pt-12 pb-14 shadow-xl relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <BrandLogo size={120} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-blue-100 font-medium text-sm tracking-widest uppercase mb-1">Active Vault Balance</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-blue-200 font-semibold">Rp</span>
            <span className="text-5xl font-black text-white tracking-tight">{balance.toLocaleString()}</span>
          </div>

          <div className="flex gap-4 mt-8">
             <button 
                onClick={() => setActiveModal('topup')}
                className="flex-1 bg-white text-blue-900 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition active:scale-95 shadow-lg shadow-blue-900/20"
             >
                <ArrowDownLeft size={20} /> Load Cash
             </button>
             <button 
                onClick={() => setActiveModal('withdraw')}
                className="flex-1 bg-blue-700/50 backdrop-blur-sm text-white border border-blue-600/50 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-95"
             >
                <ArrowUpRight size={20} /> Withdraw
             </button>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
         <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
               <History size={18} className="text-blue-500"/> Transaction Ledger
            </h3>
            
            <div className="space-y-4">
               {history.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">Your vault history is pristine.</p>
               ) : history.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                           tx.amountIdr > 0 ? 'bg-emerald-100/50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                           {tx.amountIdr > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                           <p className="text-[14px] font-bold text-slate-800 leading-tight">{tx.description || tx.type.replace('_', ' ')}</p>
                           <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                             {new Date(tx.createdAt).toLocaleDateString()} • {tx.status}
                           </p>
                        </div>
                     </div>
                     <span className={`font-black text-[15px] ${tx.amountIdr > 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {tx.amountIdr > 0 ? '+' : ''}{tx.amountIdr.toLocaleString()}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal !== 'none' && (
         <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setActiveModal('none')}>
            <div className="bg-white w-full max-w-lg rounded-t-[32px] rounded-b-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col gap-6" onClick={e => e.stopPropagation()}>
               <div className="text-center pb-2 border-b border-slate-100">
                  <h3 className="font-black text-xl text-slate-800">
                     {activeModal === 'topup' ? 'Load Vault Cash' : 'Withdraw Funds'}
                  </h3>
               </div>

               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Rp</span>
                  <input 
                     type="text" 
                     placeholder="0"
                     className="w-full text-4xl font-black text-slate-800 bg-slate-50 py-6 pl-14 pr-6 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all border border-slate-200"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                  />
               </div>

               {activeModal === 'topup' ? (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3">
                     <ShieldAlert size={20} className="shrink-0 text-blue-600" />
                     <p>Midtrans gateway fees (~0.7% for QRIS) will be dynamically applied to your cart at checkout. Balance is credited instantly.</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     <select 
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 uppercase"
                       value={bankParams.code} onChange={(e) => setBankParams({...bankParams, code: e.target.value})}
                     >
                       <option value="bca">BCA (Bank Central Asia)</option>
                       <option value="mandiri">Mandiri</option>
                       <option value="bni">BNI</option>
                       <option value="bri">BRI</option>
                     </select>
                     <input 
                       type="text" placeholder="Account Number"
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                       value={bankParams.num} onChange={(e) => setBankParams({...bankParams, num: e.target.value})}
                     />
                     <input 
                       type="text" placeholder="Exact Acc Name"
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                       value={bankParams.name} onChange={(e) => setBankParams({...bankParams, name: e.target.value.toUpperCase()})}
                     />
                     <p className="text-xs text-slate-400 text-center font-medium mt-1">Manual processing usually resolves within 1-2 hours.</p>
                  </div>
               )}

               <button 
                  onClick={activeModal === 'topup' ? handleTopUp : handleWithdraw}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl disabled:opacity-50 mt-2"
               >
                  {isProcessing ? 'Connecting Gateway...' : (activeModal === 'topup' ? 'Secure Checkout' : 'Confirm & Request Wire')}
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
