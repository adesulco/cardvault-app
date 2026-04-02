'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import CardGrid from '@/components/CardGrid';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Percent, CheckCircle, Globe, ChevronRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

let discoveryCache: { featured: any[], trending: any[], config: any } | null = null;

// The stunning TCG Hero Slab
const FloatingSlab = ({ img, delay, rotation, zIndex, xOffset, yOffset }: any) => (
  <motion.div
    initial={{ y: 200, opacity: 0, rotate: rotation - 10 }}
    animate={{ y: yOffset, opacity: 1, rotate: rotation, x: xOffset }}
    transition={{ duration: 1.2, delay, type: "spring", bounce: 0.3 }}
    className="absolute shadow-2xl rounded-[18px] border-[1.5px] border-white/20 overflow-hidden bg-slate-900"
    style={{ zIndex, width: 140, height: 200 }}
  >
    <img src={img} alt="Grail Hook" className="w-full h-full object-cover" />
  </motion.div>
);

export default function HomePage() {
  const { user } = useAppStore((state) => state);
  const [mounted, setMounted] = useState(false);
  const [trendingListings, setTrendingListings] = useState<any[]>(discoveryCache?.trending || []);
  const [config, setConfig] = useState<any>(discoveryCache?.config || { feePercentage: 3.0 });
  const [loading, setLoading] = useState(!discoveryCache);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/listings?sort=popular').then(r => r.json()),
      fetch('/api/admin/config').then(r => r.json())
    ]).then(([listingsData, configData]) => {
      discoveryCache = {
         featured: [],
         trending: listingsData.listings || [],
         config: configData || { feePercentage: 3.0 }
      };
      setTrendingListings(discoveryCache.trending);
      setConfig(discoveryCache.config);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  const isZeroFee = config.feePercentage === 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 overflow-x-hidden">
      
      {/* ── CINEMATIC HERO SECTION ── */}
      <div className="relative w-full pt-12 pb-20 px-6 overflow-hidden max-w-lg mx-auto bg-gradient-to-b from-slate-50 to-white">
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="relative z-20"
         >
            {isZeroFee ? (
               <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase mb-6 shadow-sm ring-1 ring-rose-200">
                  <Percent size={12} /> PROMO: 0% SELLER FEES
               </div>
            ) : (
               <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase mb-6 shadow-sm ring-1 ring-blue-200">
                  <Zap size={12} /> LOW {config.feePercentage}% TRANSACTION FEE
               </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
               Trade Grails.<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Defeat Scammers.
               </span>
            </h1>
            <p className="mt-4 text-sm text-slate-600 font-medium leading-relaxed max-w-[280px]">
               CardVault is Indonesia's most secure protection network. We don't vault your cards—we protect your cash until the slab is in your hands.
            </p>

            <div className="mt-8 flex flex-col gap-3">
               {!user ? (
                  <Link href="/auth/register" className="w-full bg-slate-900 text-white font-bold text-center py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/20">
                     Join the Beta <ArrowRight size={18} />
                  </Link>
               ) : (
                  <Link href="/explore" className="w-full bg-blue-600 text-white font-bold text-center py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20">
                     Browse Grails <ArrowRight size={18} />
                  </Link>
               )}
            </div>
         </motion.div>

         {/* Beautiful 3D Slabs Layout */}
         <div className="absolute right-0 top-6 bottom-0 w-[55%] pointer-events-none z-10 hidden sm:block">
             <FloatingSlab img="/seed/blue_eyes.png" delay={0.1} rotation={-12} zIndex={10} xOffset={20} yOffset={20} />
             <FloatingSlab img="/seed/charizard.png" delay={0.3} rotation={5} zIndex={30} xOffset={80} yOffset={40} />
             <FloatingSlab img="/seed/ohtani.png" delay={0.2} rotation={18} zIndex={20} xOffset={160} yOffset={80} />
         </div>
         {/* Mobile Optimized Slabs */}
         <div className="relative h-[240px] mt-10 sm:hidden pointer-events-none mx-auto w-full max-w-[300px]">
             <FloatingSlab img="/seed/blue_eyes.png" delay={0.1} rotation={-15} zIndex={10} xOffset={0} yOffset={20} />
             <FloatingSlab img="/seed/charizard.png" delay={0.3} rotation={0} zIndex={30} xOffset={80} yOffset={0} />
             <FloatingSlab img="/seed/ohtani.png" delay={0.2} rotation={15} zIndex={20} xOffset={160} yOffset={40} />
         </div>
      </div>

      <div className="max-w-lg mx-auto">
         {/* ── SECURITY HOOKS ── */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="px-5 mt-4"
         >
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <ShieldCheck size={24} className="text-emerald-500 mb-2" />
                  <h3 className="font-bold text-slate-900 text-xs">Vault Protection</h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Funds are locked seamlessly via Midtrans until the buyer explicitly accepts the delivery.</p>
               </div>
               <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <CheckCircle size={24} className="text-blue-500 mb-2" />
                  <h3 className="font-bold text-slate-900 text-xs">Verified Sellers</h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Every dealer undergoes strict KYC. No ghosts. No fakes. Real identities backed by local law.</p>
               </div>
            </div>
         </motion.div>

         {/* ── DYNAMIC TRENDING FEED ── */}
         <div className="px-5 mt-10">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Trending Grails</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Verified Protected Listings</p>
               </div>
               <Link href="/explore" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300" aria-label="Explore Active Listings">
                  <ChevronRight size={16} />
               </Link>
            </div>
            
            {loading ? (
               <div className="flex gap-4 overflow-x-hidden opacity-50">
                  <div className="w-[140px] h-[200px] bg-slate-200 rounded-2xl animate-pulse shrink-0" />
                  <div className="w-[140px] h-[200px] bg-slate-200 rounded-2xl animate-pulse shrink-0" />
                  <div className="w-[140px] h-[200px] bg-slate-200 rounded-2xl animate-pulse shrink-0" />
               </div>
            ) : trendingListings.length > 0 ? (
               <div className="pb-4">
                  <CardGrid cards={trendingListings} />
               </div>
            ) : (
               <div className="bg-slate-100 rounded-2xl p-8 text-center border border-slate-200/50">
                  <BrandLogo size={40} />
                  <p className="text-xs text-slate-500 font-bold mt-4">No Active Listings</p>
               </div>
            )}
         </div>

         {/* ── MARKETING FOOTER ── */}
         <div className="px-5 mt-8 pb-12">
            <div className="bg-slate-900 rounded-[24px] p-6 text-center relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BrandLogo size={120} />
               </div>
               <Globe className="text-blue-400 mx-auto mb-3" size={28} />
               <h3 className="text-white font-black text-lg">Built for Indonesia.</h3>
               <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-[240px] mx-auto">
                  Powered natively by Midtrans. Accept QRIS, GoPay, and Bank Transfers seamlessly.
               </p>
               {!user && (
                  <Link href="/auth/register" className="inline-block mt-6 bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors">
                     Create Free Account
                  </Link>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
