'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import PriceDisplay from '@/components/PriceDisplay';
import Image from 'next/image';

export default function ProfileOffersPage() {
  const { user } = useAppStore();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
     if (!user?.id) return;
     try {
       const res = await fetch(`/api/offers?userId=${user.id}`);
       if (res.ok) {
         const data = await res.json();
         setOffers(data.offers || []);
       }
     } catch (err) {
       console.error(err);
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => { fetchOffers(); }, [user?.id]);

  const handleAction = async (offerId: string, action: 'accept' | 'decline') => {
    try {
       const res = await fetch('/api/offers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId, action, userId: user?.id })
       });
       if (res.ok) fetchOffers(); // Refresh
    } catch (err) {
       console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
         <h1 className="text-xl font-bold text-gray-900">Incoming Offers</h1>
         <Link href="/profile" className="text-sm text-blue-600 font-medium">Back to Profile</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
           <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-base font-bold text-gray-800">No active offers</h2>
          <p className="text-sm text-gray-500 mt-1">Offers sent by buyers for your listings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => (
             <div key={offer.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden relative">
               
               {offer.status === 'accepted' && <div className="absolute inset-0 bg-green-50/50 flex items-center justify-center z-10 backdrop-blur-[1px]"><div className="bg-white px-4 py-2 rounded-full font-bold text-green-600 shadow-sm border border-green-100 flex gap-2 items-center"><CheckCircle size={18} /> Accepted! Check Messages</div></div>}
               {offer.status === 'declined' && <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center z-10 backdrop-blur-[1px]"><div className="bg-white px-4 py-2 rounded-full font-bold text-red-600 shadow-sm border border-red-100 flex gap-2 items-center"><XCircle size={18} /> Declined</div></div>}
               
               <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-sm">Offer Received</span>
                     <span className="text-[10px] text-gray-400 font-medium flex gap-1 items-center">
                        <Clock size={10} /> 
                        {new Date(offer.createdAt).toLocaleDateString()}
                     </span>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-gray-500 uppercase font-medium">From</p>
                     <p className="text-sm font-bold text-gray-900">{offer.fromUser?.displayName || 'Unknown Buyer'}</p>
                     <p className="text-[10px] text-gray-400">★ {offer.fromUser?.trustScore.toFixed(1)} Trust</p>
                  </div>
               </div>

               <div className="flex gap-4">
                 <div className="w-16 h-20 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                    {offer.listing?.card?.frontImageUrl ? (
                       <Image src={offer.listing.card.frontImageUrl} alt="" fill className="object-cover" />
                    ) : (
                       <span className="absolute inset-0 flex items-center justify-center text-3xl">🃏</span>
                    )}
                 </div>
                 
                 <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{offer.listing?.card?.cardName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{offer.listing?.card?.setName} · {offer.listing?.card?.condition}</p>
                    
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-2.5">
                       <p className="text-[10px] text-blue-600 uppercase font-bold mb-0.5">Offered Amount</p>
                       <PriceDisplay priceIdr={offer.offeredAmountIdr} size="md" />
                    </div>
                 </div>
               </div>

               {offer.status === 'pending' && (
                 <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                   <button onClick={() => handleAction(offer.id, 'decline')} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-red-50 hover:text-red-600 transition-colors">
                     Decline
                   </button>
                   <button onClick={() => handleAction(offer.id, 'accept')} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                     Accept Offer
                   </button>
                 </div>
               )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
