'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Shield, Star, MessageCircle, Flag } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';
import { EscrowProtectionBanner } from '@/components/EscrowBadge';
import TierBadge from '@/components/TierBadge';
import { useAppStore } from '@/lib/store';
import { formatIDR, formatUSD, idrToUsd, calculateFees } from '@/lib/currency';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { preferredCurrency, exchangeRate, user } = useAppStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  React.useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/listings/${params.id}`)
      .then(res => res.json())
      .then(data => {
         if (data.listing) setListing(data.listing);
         setLoading(false);
         // Fire V11-015 View Tracking mapping session explicitly
         const sessionHash = typeof window !== 'undefined' ? (window.sessionStorage.getItem('cv_anon_tracking') || Math.random().toString(36).slice(2)) : 'anon';
         if (typeof window !== 'undefined') window.sessionStorage.setItem('cv_anon_tracking', sessionHash);
         fetch(`/api/listings/${params.id}/views`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ sessionId: sessionHash })
         }).catch(() => {});
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [params.id]);

  React.useEffect(() => {
     if (!listing?.expiresAt || listing.listingMode !== 'auction') return;
     const interval = setInterval(() => {
        const diff = new Date(listing.expiresAt).getTime() - Date.now();
        if (diff <= 0) {
           setTimeLeft('Auction Ended');
           clearInterval(interval);
        } else {
           const d = Math.floor(diff / (1000 * 60 * 60 * 24));
           const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
           const m = Math.floor((diff / 1000 / 60) % 60);
           const s = Math.floor((diff / 1000) % 60);
           setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }
     }, 1000);
     return () => clearInterval(interval);
  }, [listing]);

  const submitOffer = async () => {
    if (!user) { alert('Please log in to participate'); return router.push('/auth/login'); }
    if (!offerAmount) return;
    
    // V11-027 KYC Active Enforcement mapped physically to limit structural bypass
    if (parseInt(offerAmount) > 10000000 && user.kycStatus !== 'APPROVED') {
        alert('KYC IDENTIFICATION REQUIRED: Mandatory regulatory KYC verification must be confirmed via the Admin dashboard before initiating any transactions exceeding Rp 10.000.000');
        return;
    }

    try {
      if (listing.listingMode === 'auction') {
         const res = await fetch(`/api/listings/${listing.id}/bids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amountIdr: parseInt(offerAmount), bidderId: user.id })
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         alert('Bid signature recorded securely! You are now the highest bidder.');
         setListing({ ...listing, currentBidIdr: parseInt(offerAmount) }); // Optimistic UI
      } else {
         const res = await fetch('/api/offers', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ listingId: listing.id, offerAmountIdr: parseInt(offerAmount), fromUserId: user.id })
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error || 'Failed to submit offer');
         alert('Offer submitted securely! Seller has 24 hours to respond.');
      }
      setShowOfferModal(false);
      setOfferAmount('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading asset securely...</div>;
  if (!listing) return <div className="p-8 text-center text-gray-500">Asset not found</div>;

  const fees = calculateFees(listing.priceIdr, 'sale', false);
  const usdPrice = idrToUsd(listing.priceIdr, exchangeRate);

  return (
    <div className="space-y-4 pb-24">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsFavorited(!isFavorited)} className="p-2">
            <Heart size={22} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>
          <button className="p-2 text-gray-600">
            <Share2 size={22} />
          </button>
        </div>
      </div>

      {/* Card Image */}
      <div className="mx-4 aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-100">
        {listing.frontImageUrl ? (
          <img src={listing.frontImageUrl} alt={listing.cardName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl text-gray-400 mix-blend-multiply">🃏</span>
        )}
        {listing.condition === 'graded' && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-lg">
            {listing.gradingCompany} {listing.grade}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="px-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{listing.cardName}</h1>
          <p className="text-sm text-gray-500">{[listing.playerOrCharacter, listing.year, listing.setName].filter(Boolean).join(' · ')}</p>
        </div>

        {/* Price Engine */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative overflow-hidden">
          {listing.listingMode === 'auction' ? (
             <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="flex justify-between items-start mb-1">
                   <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Current Bid</p>
                   {timeLeft && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${timeLeft === 'Auction Ended' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700 animate-pulse'}`}>
                        ⏳ {timeLeft}
                      </span>
                   )}
                </div>
                <PriceDisplay priceIdr={listing.currentBidIdr || listing.startingBidIdr || 0} size="lg" />
                <p className="text-[10px] text-gray-400 mt-2">Bids are legally binding. Escrow vault protects funds during checkout phase.</p>
             </>
          ) : (
             <>
                <PriceDisplay priceIdr={listing.priceIdr} size="lg" />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500">
                    + {formatIDR(fees.buyerFeeIdr)} buyer fee ({formatUSD(idrToUsd(fees.buyerFeeIdr, exchangeRate))})
                  </span>
                </div>
                {listing.isBestOfferEnabled && (
                  <p className="text-xs text-blue-600 font-medium mt-1">Offers accepted</p>
                )}
             </>
          )}
        </div>

        {/* Escrow Protection */}
        <EscrowProtectionBanner />

        {/* Card Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Card Details</h2>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            {[
              ['Brand', listing.brand],
              ['Set', listing.setName],
              ['Year', listing.year],
              ['Condition', listing.condition === 'graded' ? `Graded (${listing.gradingCompany} ${listing.grade})` : 'Raw'],
              ['Category', listing.playerOrCharacter],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-gray-900 font-medium">{value}</p>
              </div>
            ))}
            <div>
               <p className="text-xs text-gray-400">Cert #</p>
               {listing.certNumber && listing.gradingCompany === 'PSA' ? (
                 <a 
                   href={`https://www.psacard.com/cert/${listing.certNumber}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                 >
                   {listing.certNumber} (Verify ↗)
                 </a>
               ) : (
                 <p className="text-sm text-gray-900 font-medium">{listing.certNumber || 'N/A'}</p>
               )}
            </div>
          </div>
          {listing.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Notes</p>
              <p className="text-sm text-gray-700 mt-0.5">{listing.notes}</p>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {listing.seller.displayName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{listing.seller.displayName}</p>
                  <TierBadge totalTransactions={listing.seller.totalTransactions || 0} trustScore={listing.seller.trustScore || 0} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {listing.seller.trustScore}
                  </span>
                  <span>·</span>
                  <span>{listing.seller.totalTransactions} {listing.seller.totalTransactions === 1 ? 'trade' : 'trades'}</span>
                </div>
              </div>
            </div>
            <Link href={`/messages/${listing.seller.id}?listingRef=${listing.id}`} className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors">
              <MessageCircle size={15} className="fill-blue-600 text-blue-600" /> Ask Seller
            </Link>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{listing.listingMode === 'auction' ? 'Place Max Bid' : 'Make an Offer'}</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-400">✕</button>
            </div>
            
            {listing.listingMode === 'auction' && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 shadow-sm leading-relaxed">
                 <span className="font-bold flex items-center gap-1 mb-1">⚠️ Anti-Sniping Guard</span>
                 If this auction has fewer than 10 minutes remaining, you must have previously participated to be cleared for bidding.
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600">
                {listing.listingMode === 'auction' ? 'Your Maximum Proxy Bid' : 'Your offer'} ({preferredCurrency})
              </label>
              <div className="mt-1.5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                  {preferredCurrency === 'IDR' ? 'Rp' : '$'}
                </span>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 ${listing.listingMode === 'auction' ? 'border-teal-200 focus:border-teal-400' : 'border-gray-200 focus:border-blue-400'} rounded-xl text-sm outline-none transition-colors font-semibold`}
                  placeholder="0"
                />
              </div>
              {listing.listingMode === 'auction' && (
                <p className="text-[10px] text-gray-500 mt-2">
                   Enter the absolute limit you are willing to pay. Our engine will bid on your behalf only when outbid, securely maintaining your minimal lead.
                </p>
              )}
            </div>
            <button 
              onClick={submitOffer}
              disabled={!offerAmount}
              className={`w-full py-3.5 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${listing.listingMode === 'auction' ? 'bg-gradient-to-r from-teal-500 to-emerald-600 shadow-emerald-500/20 shadow-lg' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {listing.listingMode === 'auction' ? 'Authorize Proxy Bid' : 'Submit Offer Securely'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.04)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3 max-w-lg mx-auto">
          {listing.listingMode === 'fixed' ? (
             <>
                {listing.isBestOfferEnabled && (
                  <button onClick={() => setShowOfferModal(true)} className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">Make Offer</button>
                )}
                <Link href={`/checkout/${listing.id}`} className="flex-1 flex items-center justify-center py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm text-center hover:bg-blue-700 transition-colors shadow-sm">
                   Instant Buy
                </Link>
             </>
          ) : (
             <>
                <button
                  onClick={() => setShowOfferModal(true)}
                  disabled={timeLeft === 'Auction Ended'}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm text-center disabled:opacity-50 hover:opacity-90 transition-opacity shadow-sm"
                >
                  {timeLeft === 'Auction Ended' ? 'Auction Closed' : 'Place Formal Bid'}
                </button>
             </>
          )}
        </div>
      </div>
    </div>
  );
}
