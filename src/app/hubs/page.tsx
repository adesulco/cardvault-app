'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Store, Navigation, Phone, ShieldCheck } from 'lucide-react';

export default function HubsPage() {
  const router = useRouter();

  const HUBS = [
    {
      id: 1,
      name: 'CardVault HQ / Flagship',
      address: 'Menara Astra, Level 30, Jl. Jend. Sudirman',
      area: 'Jakarta Pusat',
      status: 'Open • Closes 20:00',
      features: ['Grading Drop-off', 'Secure Escrow Handoff', 'Vault Deposit']
    },
    {
      id: 2,
      name: 'HobbiKa Hobby Shop',
      address: 'Neo Soho Mall, Level 3',
      area: 'Jakarta Barat',
      status: 'Open • Closes 22:00',
      features: ['Secure Escrow Handoff']
    },
    {
      id: 3,
      name: 'Senayan Trading Cards',
      address: 'ASHTA District 8, Upper Ground',
      area: 'Jakarta Selatan',
      status: 'Open • Closes 21:00',
      features: ['Grading Drop-off', 'Secure Escrow Handoff']
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <header className="px-4 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-lg font-bold text-gray-900">Retail Hubs</h1>
        </div>
        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
           <MapPin size={16} />
        </div>
      </header>

      <div className="p-5">
         <h2 className="text-xl font-black text-gray-900 mb-2">Offline Trust Network</h2>
         <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">Meet your marketplace buyers securely in public, or drop off your Raw cards for global aggregation grading.</p>

         <div className="space-y-4">
            {HUBS.map(hub => (
               <div key={hub.id} className="bg-white border text-left border-gray-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Store size={18} className="text-blue-600" />
                           <h3 className="font-bold text-gray-900">{hub.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{hub.address}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">{hub.area}</p>
                     </div>
                     <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">
                        {hub.status}
                     </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                     {hub.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                           <ShieldCheck size={12} className="text-blue-500" /> {f}
                        </div>
                     ))}
                  </div>

                  <div className="flex gap-3">
                     <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-sm rounded-xl flex justify-center items-center gap-2 transition-colors">
                        <Navigation size={16} /> Directions
                     </button>
                     <button className="w-14 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl flex justify-center items-center transition-colors">
                        <Phone size={18} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
