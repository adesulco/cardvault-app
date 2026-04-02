'use client';
import Link from 'next/link';
import { BadgeCheck, ChevronRight, Star } from 'lucide-react';

export default function BelowFold({ homeData }: { homeData: any }) {
  return (
    <>
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
                     <p className="text-[11px] font-bold text-gray-800 w-full text-center truncate" title={seller.displayName}>{seller.displayName}</p>
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
    </>
  );
}
