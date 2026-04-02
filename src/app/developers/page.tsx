'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Code2, Server, Key, Terminal, Cpu } from 'lucide-react';

export default function DevelopersPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 pb-20 font-mono text-slate-300">
      <header className="px-5 py-5 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="text-white hover:text-blue-400 transition-colors">
              <ArrowLeft size={22} />
           </button>
           <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
             <Code2 className="text-blue-500" /> Developers Portal
           </h1>
        </div>
      </header>

      <div className="p-6">
         <div className="mb-10">
            <h2 className="text-3xl font-black text-white mb-3">CardVault Pay <span className="text-blue-500">API</span></h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">Embed Indonesia's most secure 3-way physical Escrow engine directly into your sneaker, watch, or electronics marketplace. Zero chargebacks, automated tracking hooks.</p>
         </div>

         <div className="space-y-8">
            {/* Quickstart Config */}
            <div>
               <div className="flex items-center gap-2 mb-3">
                  <Key size={16} className="text-yellow-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Authentication</h3>
               </div>
               <p className="text-xs text-slate-400 mb-3 font-sans">All API requests require a Bearer token mapped directly to your commercial business entity.</p>
               <div className="p-4 bg-black/50 border border-white/10 rounded-xl relative overflow-x-auto text-xs text-blue-300">
                  <span className="text-slate-500">Authorization:</span> Bearer CV_LIVE_***
               </div>
            </div>

            {/* REST Endpoint Generator */}
            <div>
               <div className="flex items-center gap-2 mb-3">
                  <Server size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Escrow Route</h3>
               </div>
               <p className="text-xs text-slate-400 mb-3 font-sans">Generate a physical escrow hold checkout URL to embed seamlessly into your platform's checkout flow.</p>
               
               <div className="bg-black/50 border border-emerald-500/20 rounded-xl overflow-hidden">
                  <div className="flex items-center px-4 py-2 border-b border-white/5 bg-white/5 gap-3">
                     <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">POST</span>
                     <span className="text-xs opacity-70">/api/v1/escrow/create</span>
                  </div>
                  <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto text-slate-300">
{`curl -X POST https://api.cardvault.id/v1/escrow/create \\
  -H "Authorization: Bearer CV_LIVE_sk_test_123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "partnerId": "usr_99X",
    "itemName": "Rolex Submariner 124060",
    "priceIdr": 185000000,
    "callbackUrl": "https://your-marketplace.id/webhook/escrow"
  }'`}
                  </pre>
               </div>
            </div>

            {/* Expected Response Payload */}
            <div>
               <div className="flex items-center gap-2 mb-3">
                  <Terminal size={16} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Engine Response</h3>
               </div>
               <div className="bg-black/50 border border-purple-500/20 rounded-xl overflow-hidden">
                  <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto text-purple-200/80">
{`{
  "success": true,
  "data": {
    "escrowId": "ex_cv_981ab2",
    "paymentUrl": "https://beta.cardvault.id/gate/checkout/ex_cv_981ab2",
    "status": "pending_funding",
    "expiresAt": "2026-04-01T21:00:00.000Z"
  }
}`}
                  </pre>
               </div>
            </div>

         </div>

         <button className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors font-sans shadow-lg shadow-blue-500/20">
            <Cpu size={18} /> Request Production Keys
         </button>
      </div>
    </div>
  );
}
