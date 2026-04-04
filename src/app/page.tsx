'use client';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { BadgeCheck, Globe, Lock, CheckCircle2 } from 'lucide-react';

export const runtime = 'edge';

export default function HomePage() {
  const user = useAppStore((state) => state.user);

  return (
    <div className="space-y-6 pb-12 bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <div className="mx-4 pt-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[16px] p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase">
              BETA
            </span>
            <span className="text-blue-200 text-xs font-medium">Limited Access</span>
          </div>
          
          <h1 className="text-[24px] leading-tight font-bold mb-2">CardVault Beta</h1>
          <p className="text-blue-100 text-[14px] leading-relaxed mb-4">
            Trade with confidence. Your cards, your money &mdash; protected. Buy, sell, and trade collectible cards with vault protection.
          </p>

          <div className="flex flex-col gap-2">
            {!user ? (
              <>
                <Link href="/auth/register" className="w-full bg-white text-indigo-700 font-semibold text-center mt-1 py-3.5 rounded-xl text-[14px] hover:bg-blue-50 transition-colors">
                  Apply to Join Beta
                </Link>
                <Link href="/auth/login" className="w-full bg-white/20 text-white font-semibold text-center py-3.5 rounded-xl text-[14px] hover:bg-white/30 transition-colors">
                  Already a Member? Login
                </Link>
              </>
            ) : (
              <Link href="/explore" className="w-full bg-white text-indigo-700 font-semibold text-center mt-1 py-3.5 rounded-xl text-[14px] hover:bg-blue-50 transition-colors">
                Enter Marketplace
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 content-center justify-center h-[90px]">
          <Lock size={20} className="text-emerald-600 mb-0.5" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">Vault Protected</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 content-center justify-center h-[90px]">
          <BadgeCheck size={20} className="text-blue-600 mb-0.5" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">Verified Sellers</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-indigo-50 content-center justify-center h-[90px]">
          <Globe size={20} className="text-indigo-600 mb-0.5" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">Indonesia-first</span>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 mt-6">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4">How It Works</h2>
        <div className="flex flex-col gap-4">
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-[14px] shrink-0">1</div>
              <div className="pt-1">
                 <h3 className="text-[14px] font-semibold text-slate-900">Place Order</h3>
                 <p className="text-[12px] text-slate-500 mt-0.5 max-w-[240px]">Browse verified listings and make an offer</p>
              </div>
           </div>
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-[14px] shrink-0">2</div>
              <div className="pt-1">
                 <h3 className="text-[14px] font-semibold text-slate-900">Secure Protection</h3>
                 <p className="text-[12px] text-slate-500 mt-0.5 max-w-[240px]">Payment held safely during shipping</p>
              </div>
           </div>
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-[14px] shrink-0">3</div>
              <div className="pt-1">
                 <h3 className="text-[14px] font-semibold text-slate-900">Receive & Confirm</h3>
                 <p className="text-[12px] text-slate-500 mt-0.5 max-w-[240px]">Verify card, confirm receipt, funds released</p>
              </div>
           </div>
        </div>
      </div>

      {/* Beta Features */}
      <div className="px-4 mt-8">
        <h2 className="text-[16px] font-bold text-slate-900 mb-3">Beta Features</h2>
        <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-3">
           <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[12px] text-slate-700 font-medium">Secure vault-protected transactions</span>
           </div>
           <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[12px] text-slate-700 font-medium">Multi-currency support (IDR & USD)</span>
           </div>
           <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[12px] text-slate-700 font-medium">Seller KYC verification</span>
           </div>
           <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[12px] text-slate-700 font-medium">Real-time payment gateways</span>
           </div>
           <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[12px] text-slate-700 font-medium">Dispute resolution system</span>
           </div>
           <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[12px] text-slate-700 font-medium">Seller ratings & reviews</span>
           </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 mt-8 mb-4">
        <h2 className="text-[16px] font-bold text-slate-900 mb-3">FAQ</h2>
        <div className="flex flex-col gap-2">
          <div className="bg-white border border-slate-200 p-3 rounded-lg">
             <p className="text-[12px] font-semibold text-slate-900 mb-1">Is CardVault free to use?</p>
             <p className="text-[12px] text-slate-600 leading-relaxed">Yes, registration is free. We charge a small platform fee on sales (3%).</p>
          </div>
          <div className="bg-white border border-slate-200 p-3 rounded-lg">
             <p className="text-[12px] font-semibold text-slate-900 mb-1">Who can I trade with?</p>
             <p className="text-[12px] text-slate-600 leading-relaxed">You can trade with verified sellers who have passed our KYC process.</p>
          </div>
          <div className="bg-white border border-slate-200 p-3 rounded-lg">
             <p className="text-[12px] font-semibold text-slate-900 mb-1">How long does shipping take?</p>
             <p className="text-[12px] text-slate-600 leading-relaxed">Typically 3-7 days within Indonesia. International varies by carrier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
