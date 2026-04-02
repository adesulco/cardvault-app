'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { BadgeCheck, ChevronRight, Star } from 'lucide-react';

export default function HomePage() {
  const user = useAppStore((state) => state.user);
  const [homeData, setHomeData] = useState<any>({
    featuredSellers: [
      { id: 'mock-1', displayName: 'CardVault Official', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80', totalTransactions: 154 },
      { id: 'mock-2', displayName: 'Kanto Curator', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80', totalTransactions: 89 },
      { id: 'mock-3', displayName: 'TokyoCards', avatarUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=200&h=200&fit=crop&q=80', totalTransactions: 42 }
    ],
    featuredListings: [
      { id: 'mock-lst-1', card: { cardName: 'Charizard Base Set Holo', frontImageUrl: '/mock/charizard_slab_1775067166104.png' }, priceIdr: 15500000, seller: { displayName: 'CardVault Official' } },
      { id: 'mock-lst-2', card: { cardName: 'Blue-Eyes White Dragon', frontImageUrl: '/mock/blue_eyes_slab_1775067182285.png' }, priceIdr: 45000000, seller: { displayName: 'Kanto Curator' } },
      { id: 'mock-lst-3', card: { cardName: 'Shohei Ohtani Chrome RC', frontImageUrl: '/mock/ohtani_slab_1775067262564.png' }, priceIdr: 25000000, seller: { displayName: 'TokyoCards' } }
    ],
    latestUploads: [
      { id: 'mock-new-1', card: { cardName: 'Babe Ruth Vintage 1933', frontImageUrl: '/mock/ohtani_slab_1775067262564.png' }, priceIdr: 125000000, seller: { displayName: 'VintageVault' } },
      { id: 'mock-new-2', card: { cardName: 'Pikachu Illustrator SSR', frontImageUrl: '/mock/charizard_slab_1775067166104.png' }, priceIdr: 85000000, seller: { displayName: 'Kanto Curator' } },
      { id: 'mock-new-3', card: { cardName: 'Dark Magician Ghost Rare', frontImageUrl: '/mock/blue_eyes_slab_1775067182285.png' }, priceIdr: 18000000, seller: { displayName: 'TokyoCards' } }
    ],
    banners: []
  });

  useEffect(() => {
     fetch('/api/home')
       .then(r => r.json())
       .then(data => {
          if (data && (data.featuredListings?.length || data.banners?.length)) {
             setHomeData({
                ...homeData,
                banners: data.banners || [],
                featuredListings: data.featuredListings?.length ? data.featuredListings : homeData.featuredListings,
                latestUploads: data.latestUploads?.length ? data.latestUploads : homeData.latestUploads,
             });
          }
       }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    return (
      <div className="pt-2 pb-6 flex flex-col gap-2 bg-slate-50 overflow-x-hidden">
        <h1 className="sr-only">CardVault Marketplace Home</h1>
        {/* 1. Marketing Banners */}
        <div className="w-full overflow-x-auto flex gap-4 px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           {homeData.banners && homeData.banners.length > 0 ? (
              homeData.banners.map((banner: any) => (
                 <a key={banner.id} href={banner.linkUrl} className="snap-start shrink-0 w-[95%] md:w-[85%] rounded-[16px] overflow-hidden shadow-sm relative block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageUrl} alt={banner.altText || ''} className="w-full h-full object-cover shrink-0 aspect-[21/9]" onError={(e) => { e.currentTarget.src = '/fallback-card.png'; }} />
                 </a>
              ))
           ) : (
             <>
               {/* Banner 1: Security/Protection */}
               <div className="snap-start shrink-0 w-[95%] md:w-[85%] rounded-[16px] overflow-hidden shadow-sm relative" style={{ background: 'linear-gradient(135deg, #2563EB, #4338CA)', padding: '24px', color: '#fff' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <span style={{ display: 'inline-block', padding: '4px 10px', background: '#F59E0B', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '999px' }}>
                       BETA
                     </span>
                     <span style={{ fontSize: '12px', color: '#BFDBFE' }}>CardVault Protection</span>
                   </div>
                   <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>Trade with confidence.</h2>
                   <p style={{ color: '#BFDBFE', fontSize: '13px', lineHeight: 1.5, marginBottom: '0' }}>
                     Your cards, your money &mdash; protected. Buy, sell, and trade collectible cards with absolute vault protection.
                   </p>
               </div>
               
               {/* Banner 2: Secure Transactions */}
               <div className="snap-start shrink-0 w-[95%] md:w-[85%] rounded-[16px] overflow-hidden shadow-sm relative" style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: '24px', color: '#fff' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <span style={{ display: 'inline-block', padding: '4px 10px', background: '#047857', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '999px' }}>
                       SECURE
                     </span>
                     <span style={{ fontSize: '12px', color: '#D1FAE5' }}>Protected Transactions</span>
                   </div>
                   <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>Trade with peace of mind.</h2>
                   <p style={{ color: '#D1FAE5', fontSize: '13px', lineHeight: 1.5, marginBottom: '0' }}>
                     Funds are strictly protected on the platform and only hit the seller's account after receipt is safely verified.
                   </p>
               </div>

               {/* Banner 3: Seller Verification */}
               <div className="snap-start shrink-0 w-[95%] md:w-[85%] rounded-[16px] overflow-hidden shadow-sm relative" style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)', padding: '24px', color: '#fff' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                     <span style={{ display: 'inline-block', padding: '4px 10px', background: '#5B21B6', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '999px' }}>
                       VERIFIED
                     </span>
                     <span style={{ fontSize: '12px', color: '#E9D5FF' }}>Seller Verification</span>
                   </div>
                   <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>A Verified Seller Network.</h2>
                   <p style={{ color: '#E9D5FF', fontSize: '13px', lineHeight: 1.5, marginBottom: '0' }}>
                     Buy with absolute confidence. Every single seller on our platform undergoes a strict identity and reputation vetting process.
                   </p>
               </div>
             </>
           )}
        </div>

        {/* 2. Top Sellers */}
        {homeData?.featuredSellers?.length > 0 && (
           <div className="mt-8">
              <div className="px-4 flex items-center justify-between mb-3">
                 <h2 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Top Curated Vaults <BadgeCheck size={16} className="text-blue-600" />
                 </h2>
                 <Link href="/explore?tab=vaults" className="text-[12px] font-bold text-blue-600 flex items-center">
                    View All <ChevronRight size={14} />
                 </Link>
              </div>
              <div className="w-full overflow-x-auto flex gap-3 px-4 pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                 {homeData.featuredSellers.map((seller: any) => (
                    <Link key={seller.id} href={`/profile/${seller.id}`} className="snap-start shrink-0 w-[100px] flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-[14px] p-3 shadow-sm hover:border-gray-300 transition-colors">
                       <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center font-bold text-gray-400 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {seller.avatarUrl ? <img src={seller.avatarUrl} className="w-full h-full object-cover shrink-0" alt="" /> : seller.displayName?.[0]}
                       </div>
                       <p className="text-[11px] font-bold text-gray-800 w-full text-center truncate">{seller.displayName}</p>
                       <p className="text-[9px] text-gray-500 font-medium tracking-tight whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full">{seller.totalTransactions || 0} Trades</p>
                    </Link>
                 ))}
              </div>
           </div>
        )}

        {/* 3. Featured Grails */}
        {homeData?.featuredListings?.length > 0 && (
           <div className="mt-8">
              <div className="px-4 flex items-center justify-between mb-4">
                 <h2 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Featured Grails <Star size={16} className="text-amber-500 fill-amber-500" />
                 </h2>
                 <Link href="/explore" className="text-[12px] font-bold text-blue-600 flex items-center">
                    Browse Grid <ChevronRight size={14} />
                 </Link>
              </div>
              <div className="w-full overflow-x-auto flex gap-4 px-4 pb-4 snap-x snap-mandatory pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                 {homeData.featuredListings.map((listing: any) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`} className="snap-start shrink-0 w-[240px] bg-white border border-gray-200/80 rounded-[18px] shadow-sm overflow-hidden flex flex-col relative group">
                       <div className="w-full aspect-[3/4] bg-gray-100 relative">
                          {listing.card?.frontImageUrl ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={listing.card.frontImageUrl} className="w-full h-full object-cover shrink-0" alt="" onError={(e) => { e.currentTarget.src = '/fallback-card.png'; }} />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       </div>
                       <div className="p-3">
                          <p className="text-[14px] font-bold text-gray-900 leading-tight line-clamp-1" title={listing.card?.cardName}>{listing.card?.cardName}</p>
                          <p className="text-[11px] font-semibold text-blue-600 mt-1 uppercase tracking-tight">Rp {listing.priceIdr?.toLocaleString('id-ID')}</p>
                          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100">
                             <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-[8px] font-bold">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {listing.seller?.avatarUrl ? <img src={listing.seller.avatarUrl} className="shrink-0" /> : listing.seller?.displayName?.[0]}
                             </div>
                             <p className="text-[10px] text-gray-500 font-medium truncate" title={`Vault: ${listing.seller?.displayName}`}>Vault: {listing.seller?.displayName}</p>
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
        )}

        {/* 4. Latest Uploaded Cards for Sale */}
        {homeData?.latestUploads?.length > 0 && (
           <div className="mt-8">
              <div className="px-4 flex items-center justify-between mb-4">
                 <h2 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Latest Uploads ⚡️
                 </h2>
                 <Link href="/explore?tab=latest" className="text-[12px] font-bold text-blue-600 flex items-center">
                    View All <ChevronRight size={14} />
                 </Link>
              </div>
              <div className="w-full overflow-x-auto flex gap-4 px-4 pb-4 snap-x snap-mandatory pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                 {homeData.latestUploads.map((listing: any) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`} className="snap-start shrink-0 w-[200px] bg-white border border-gray-200/80 rounded-[14px] shadow-sm overflow-hidden flex flex-col relative group">
                       <div className="w-full aspect-[4/5] bg-gray-100 relative">
                          {listing.card?.frontImageUrl ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={listing.card.frontImageUrl} className="w-full h-full object-cover shrink-0" alt="" onError={(e) => { e.currentTarget.src = '/fallback-card.png'; }} />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       </div>
                       <div className="p-3">
                          <p className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-1" title={listing.card?.cardName}>{listing.card?.cardName}</p>
                          <p className="text-[11px] font-semibold text-blue-600 mt-1 uppercase tracking-tight">Rp {listing.priceIdr?.toLocaleString('id-ID')}</p>
                          <div className="mt-2 flex items-center gap-2 pt-2 border-t border-gray-100">
                             <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-[7px] font-bold">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {listing.seller?.avatarUrl ? <img src={listing.seller.avatarUrl} className="shrink-0" /> : listing.seller?.displayName?.[0]}
                             </div>
                             <p className="text-[9px] text-gray-500 font-medium truncate" title={listing.seller?.displayName}>{listing.seller?.displayName}</p>
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
        )}

        {/* 5. Start Collection Call to Action */}
        <div className="mt-6 px-4">
           <Link href="/explore" className="w-full bg-blue-600 flex items-center justify-between text-white rounded-2xl p-4 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-[18px] font-bold leading-tight">Start Your Collection Today</h3>
                 <p className="text-[12px] opacity-80 font-medium mt-1">Find the latest cards securely posted by verified sellers</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 relative z-10 group-hover:bg-white/30 transition-colors">
                 <ChevronRight size={20} />
              </div>
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
           </Link>
        </div>
      </div>
    );
  }

  // Anonymous Landing View
  return (
    <div style={{ 
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      paddingBottom: '20px'
    }}>
      {/* Hero Banner */}
      <div style={{ margin: '16px 16px 0', background: 'linear-gradient(135deg, #2563EB, #4338CA)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ display: 'inline-block', padding: '4px 10px', background: '#F59E0B', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '999px' }}>
            BETA
          </span>
          <span style={{ fontSize: '12px', color: '#BFDBFE' }}>Limited Access</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>CardVault Beta</h1>
        <p style={{ color: '#BFDBFE', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          Trade with confidence. Your cards, your money &mdash; protected. Buy, sell, and trade collectible cards with vault protection.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!user ? (
            <>
              <Link href="/auth/register" style={{ display: 'block', background: '#fff', color: '#4338CA', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', transition: 'background 0.2s' }} className="hover:bg-[#EFF6FF]">
                Apply to Join Beta
              </Link>
              <Link href="/auth/login" style={{ display: 'block', background: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', transition: 'background 0.2s' }} className="hover:bg-white/30">
                Already a Member? Login
              </Link>
            </>
          ) : (
            <Link href="/explore" style={{ display: 'block', background: '#fff', color: '#4338CA', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', transition: 'background 0.2s' }} className="hover:bg-[#EFF6FF]">
              Enter Marketplace
            </Link>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '0 16px', marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', borderRadius: '12px', background: '#F0FDF4' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#334155', textAlign: 'center' }}>Vault Protected</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', borderRadius: '12px', background: '#EFF6FF' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#334155', textAlign: 'center' }}>Verified Sellers</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', borderRadius: '12px', background: '#EEF2FF' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#334155', textAlign: 'center' }}>Indonesia-first</span>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '0 16px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>How It Works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { num: 1, title: 'Place Order', desc: 'Browse verified listings and make an offer' },
            { num: 2, title: 'Secure Protection', desc: 'Payment held safely during shipping' },
            { num: 3, title: 'Receive & Confirm', desc: 'Verify card, confirm receipt, funds released' }
          ].map((step) => (
            <div key={step.num} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flexShrink: 0, width: '32px', height: '32px', background: 'linear-gradient(135deg, #2563EB, #4338CA)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                {step.num}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '4px' }}>
                <h3 style={{ fontWeight: 500, fontSize: '14px', color: '#0F172A', margin: 0 }}>{step.title}</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, marginTop: '2px' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Beta Features */}
      <div style={{ padding: '0 16px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Beta Features</h2>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Secure vault-protected transactions', 'Multi-currency support (IDR & USD)', 'Seller KYC verification', 'Real-time payment gateways', 'Dispute resolution system', 'Seller ratings & reviews'].map((ft, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style={{ fontSize: '12px', color: '#334155' }}>{ft}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '0 16px', marginTop: '24px', paddingBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {q: 'Is CardVault free to use?', a: 'Yes, registration is free. We charge a small platform fee on sales (3%).'},
            {q: 'Who can I trade with?', a: 'You can trade with verified sellers who have passed our KYC process.'},
            {q: 'How long does shipping take?', a: 'Typically 3-7 days within Indonesia. International varies by carrier.'}
          ].map((faq, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', margin: 0, marginBottom: '4px' }}>{faq.q}</p>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
