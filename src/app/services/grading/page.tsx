'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, CheckCircle2, PackageSearch, Award, Gem, SearchCheck } from 'lucide-react';

export default function GradingConcierge() {
  const router = useRouter();
  const { user } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ cardName: '', declaredValue: '', grader: 'PSA' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3); // Complete
  };

  if (!user) return <div className="p-8 text-center text-gray-500">Sign in to use concierge tools.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <header className="px-4 py-4 bg-white border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Grading Concierge</h1>
      </header>

      {/* Hero */}
      <div className="bg-slate-900 px-6 py-10 relative overflow-hidden">
         <div className="absolute right-0 top-0 w-40 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 to-transparent pointer-events-none" />
         <Gem className="text-blue-500 mb-4" size={36} />
         <h2 className="text-2xl font-black text-white mb-2 leading-tight">Turn Raw Cards into Graded Grails.</h2>
         <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">Mail your unprotected cards to the CardVault Hub in Jakarta. We batch-insure them, manage customs to the USA, get them PSA authenticated, and auto-list them on your profile instantly upon return!</p>
      </div>

      <div className="p-4 pt-6 space-y-6">

         {/* Steps Indicator */}
         <div className="flex justify-between relative px-2 mb-8">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200 z-0">
               <div className="h-full bg-blue-600 transition-all" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 relative z-10 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 relative z-10 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-50 relative z-10 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <CheckCircle2 size={16} />
            </div>
         </div>

         {step === 1 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><PackageSearch size={20} /></div>
                  <h3 className="font-bold text-gray-900">Define Your Card</h3>
               </div>
               
               <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Card Description</label>
                     <input required value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} type="text" placeholder="e.g. 2012 Panini Prizm LeBron James Base" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm placeholder:text-gray-400" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Declared Value (IDR) — For Insurance</label>
                     <input required value={formData.declaredValue} onChange={e => setFormData({...formData, declaredValue: e.target.value})} type="number" placeholder="5000000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 font-mono rounded-xl focus:border-blue-500 outline-none text-sm placeholder:text-gray-400" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Target Authority</label>
                     <div className="grid grid-cols-2 gap-3">
                        <div onClick={() => setFormData({...formData, grader: 'PSA'})} className={`border-2 p-3 rounded-xl cursor-pointer text-center font-bold transition-all ${formData.grader === 'PSA' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                           PSA
                        </div>
                        <div onClick={() => setFormData({...formData, grader: 'BGS'})} className={`border-2 p-3 rounded-xl cursor-pointer text-center font-bold transition-all ${formData.grader === 'BGS' ? 'border-slate-800 bg-slate-100 text-slate-900' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                           Beckett
                        </div>
                     </div>
                  </div>
                  
                  <button type="submit" disabled={!formData.cardName || !formData.declaredValue} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 mt-2">
                     Continue To Shipping
                  </button>
               </form>
            </div>
         )}

         {step === 2 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 animate-in slide-in-from-right-4 fade-in">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Award size={20} /></div>
                  <h3 className="font-bold text-gray-900">Ship to Hub</h3>
               </div>
               
               <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm text-slate-700 mb-6 font-mono leading-loose">
                  Attn: CardVault Concierge<br/>
                  Menara Astra, Level 30<br/>
                  Jl. Jend. Sudirman Kav 5-6<br/>
                  Jakarta Pusat 10220
               </div>

               <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                     <span>Authentication Fee (PSA)</span>
                     <span>Rp 550.000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                     <span>Concierge Margin</span>
                     <span>Rp 150.000</span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between items-center font-black text-blue-900">
                     <span>Total Due</span>
                     <span>Rp 700.000</span>
                  </div>
               </div>

               <p className="text-[10px] text-gray-500 text-center mb-4">By booking, you agree to the 45-60 day PSA turnaround window.</p>
               
               <form onSubmit={handleSubmit} className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                     Back
                  </button>
                  <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors">
                     Pay & Generate Ticket
                  </button>
               </form>
            </div>
         )}

         {step === 3 && (
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-200 text-center animate-in zoom-in-95 fade-in">
               <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/20">
                  <SearchCheck size={40} />
               </div>
               <h3 className="text-2xl font-black text-emerald-900 mb-2">Ticket #CV-{Math.floor(Math.random() * 10000)}</h3>
               <p className="text-sm text-emerald-700 font-medium mb-8">We've secured your pipeline. Please mail your raw {formData.cardName} within 7 days using the address above.</p>
               <button onClick={() => router.push('/profile')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md">
                 Return to Vault
               </button>
            </div>
         )}

      </div>
    </div>
  );
}
