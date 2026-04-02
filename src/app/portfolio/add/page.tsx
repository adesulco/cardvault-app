'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AddToDeckPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    cardName: '',
    year: '',
    setName: '',
    brand: '',
    sportOrCategory: 'Pokémon',
    language: 'EN',
    condition: 'raw',
    grade: '',
    gradingCompany: ''
  });

  const update = (field: string, val: string) => setFormData(p => ({ ...p, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync');
      
      // Auto-trigger a valuation immediately
      await fetch('/api/portfolio/valuation', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ cardId: data.card.id })
      });

      router.push('/portfolio');
    } catch(err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Please login.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/portfolio" className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">Add to The Deck</h1>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
           <h3 className="text-sm font-black text-blue-900 mb-1">Precision Constraints</h3>
           <p className="text-[11px] text-blue-700 leading-relaxed">To successfully route this asset to an Oracle Pricing Authority (TCGPlayer / Yuyu-tei / eBay), you absolutely must enter the precise Year and Set Name.</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl mb-4 font-bold border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Card Name</label>
              <input required value={formData.cardName} onChange={e=>update('cardName', e.target.value)} placeholder="e.g. Charizard Base Set" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 placeholder:font-medium outline-blue-500" />
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Year</label>
                 <input required value={formData.year} onChange={e=>update('year', e.target.value)} placeholder="e.g. 1999" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 placeholder:font-medium outline-blue-500" />
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Language</label>
                 <select value={formData.language} onChange={e=>update('language', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-blue-500 appearance-none">
                    <option value="EN">English</option>
                    <option value="JP">Japanese</option>
                    <option value="UN">Other</option>
                 </select>
              </div>
           </div>

           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Set Name</label>
              <input required value={formData.setName} onChange={e=>update('setName', e.target.value)} placeholder="e.g. Sword & Shield 151" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-300 placeholder:font-medium outline-blue-500" />
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Category</label>
                 <select value={formData.sportOrCategory} onChange={e=>update('sportOrCategory', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-blue-500 appearance-none">
                    <option value="Pokémon">Pokémon TCG</option>
                    <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
                    <option value="MTG">Magic: The Gathering</option>
                    <option value="One Piece">One Piece TCG</option>
                    <option value="Sports">Sports</option>
                 </select>
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Condition</label>
                 <select value={formData.condition} onChange={e=>update('condition', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-blue-500 appearance-none">
                    <option value="raw">Raw (Ungraded)</option>
                    <option value="graded">Graded Slab</option>
                 </select>
              </div>
           </div>

           {formData.condition === 'graded' && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Company</label>
                    <select required value={formData.gradingCompany} onChange={e=>update('gradingCompany', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-blue-500 appearance-none">
                       <option value="" disabled>Select</option>
                       <option value="PSA">PSA</option>
                       <option value="BGS">BGS</option>
                       <option value="CGC">CGC</option>
                       <option value="UGA">UGA</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Grade</label>
                    <input required value={formData.grade} onChange={e=>update('grade', e.target.value)} placeholder="e.g. 9.5" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold placeholder:text-slate-300 placeholder:font-medium outline-blue-500" />
                 </div>
              </div>
           )}

           <button disabled={loading} className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-slate-900 border border-slate-800 shadow-xl shadow-slate-900/20 rounded-2xl font-black text-sm text-white hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Booting Valuation Engine...' : <><Plus size={18} /> Secure Asset to Deck</>}
           </button>
        </form>
      </div>
    </div>
  );
}
