'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, BarChart3, Plus, Trophy, ChevronRight } from 'lucide-react';

export default function PortfolioPage() {
  const { user } = useAppStore();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  
  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/user/cards'); // We need to build this endpoint to grab 'in_collection' cards
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards.filter((c: any) => c.status === 'in_collection'));
      }
    } catch(e) { console.error('Failed to sync The Deck', e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) fetchPortfolio();
  }, [user]);

  const handleRefreshValue = async (cardId: string) => {
    setRefreshingId(cardId);
    try {
      const res = await fetch('/api/portfolio/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
      if (res.ok) {
        const data = await res.json();
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, estimatedValueIdr: data.estimatedValueIdr } : c));
      }
    } catch(e) { console.error(e); }
    finally { setRefreshingId(null); }
  };

  const totalValue = cards.reduce((sum, c) => sum + (c.estimatedValueIdr || 0), 0);
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <BarChart3 size={48} className="text-slate-300 mb-4" />
         <h1 className="text-xl font-bold">The Deck is locked.</h1>
         <p className="text-sm text-slate-500 mt-2">Sign in to sync your portfolio.</p>
         <Link href="/auth/login" className="mt-6 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700">Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">The Deck</h1>
        </div>
      </div>

      {/* DASHBOARD HERO */}
      <div className="bg-slate-900 px-6 py-8 rounded-b-[2rem] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><BarChart3 size={150} /></div>
         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net Worth Evaluator</p>
         <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{formatIDR(totalValue)}</h2>
         <div className="mt-4 flex items-center gap-2">
            <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
               <Trophy size={12} /> {cards.length} Grails Secured
            </div>
         </div>
      </div>

      {/* ACTION BLOCK */}
      <div className="px-5 mt-6 flex gap-3">
         <Link href="/portfolio/add" className="flex-1 bg-blue-600 text-white font-bold text-sm text-center py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">
            <Plus size={18} /> Add Grail to Deck
         </Link>
      </div>

      {/* ASSETS */}
      <div className="px-5 mt-8">
         <h3 className="font-bold text-slate-900 text-sm mb-4">Your Secured Assets</h3>
         
         {loading ? (
            <div className="space-y-3">
               {[1,2,3].map(i => <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl h-[88px] animate-pulse" />)}
            </div>
         ) : cards.length > 0 ? (
            <div className="space-y-3">
               {cards.map(card => (
                  <div key={card.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-4">
                     <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        {card.frontImageUrl ? (
                           <img src={card.frontImageUrl} alt={card.cardName} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">NO IMG</div>
                        )}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-start justify-between">
                           <div>
                              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">{card.year} {card.setName}</p>
                              <h4 className="text-sm font-bold text-slate-900 leading-tight">{card.cardName}</h4>
                           </div>
                           <button 
                              onClick={() => handleRefreshValue(card.id)} 
                              disabled={refreshingId === card.id}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-50 disabled:animate-spin"
                           >
                              <RefreshCw size={16} />
                           </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              {card.condition === 'graded' ? (
                                 <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                    {card.gradingCompany} {card.grade}
                                 </span>
                              ) : (
                                 <span className="bg-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">RAW</span>
                              )}
                              <span className="text-[10px] font-bold text-slate-400">{card.language || 'EN'}</span>
                           </div>
                           <span className="font-black text-slate-900 tracking-tight">{formatIDR(card.estimatedValueIdr || 0)}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="bg-slate-100 border border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-400">
                  <BarChart3 size={20} />
               </div>
               <p className="text-xs font-bold text-slate-600">Your deck is empty</p>
               <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Add grails to your portfolio to actively monitor their global market fluctuations.</p>
            </div>
         )}
      </div>
    </div>
  );
}
