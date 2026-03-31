'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Shield, Star, MessageCircle, Flag } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';
import { EscrowProtectionBanner } from '@/components/EscrowBadge';
import { useAppStore } from '@/lib/store';
import { formatIDR, formatUSD, idrToUsd, calculateFees } from '@/lib/currency';

// Demo listing data
const LISTING = {
  id: 'l1',
  cardName: 'Charizard VMAX',
  playerOrCharacter: 'Pokémon',
  year: '2020',
  setName: 'Champions Path',
  brand: 'Pokémon TCG',
  sportOrCategory: 'pokemon',
  condition: 'graded' as const,
  grade: '10',
  gradingCompany: 'PSA',
  certNumber: '12345678',
  frontImageUrl: null,
  backImageUrl: null,
  priceIdr: 25000000,
  isBestOfferEnabled: true,
  viewsCount: 342,
  favoritesCount: 28,
  notes: 'Pristine condition. Card has been stored in a humidity-controlled safe since grading.',
  seller: {
    id: 's1',
    displayName: 'TokyoCards',
    avatarUrl: null,
    trustScore: 4.9,
    totalTransactions: 156,
    kycStatus: 'verified' as const,
    location: 'Jakarta, Indonesia',
  },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { preferredCurrency, exchangeRate } = useAppStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');

  const listing = LISTING;
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
      <div className="mx-4 aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
        <span className="text-6xl">🃏</span>
        {listing.condition === 'graded' && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
            {listing.gradingCompany} {listing.grade}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="px-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{listing.cardName}</h1>
          <p className="text-sm text-gray-500">{listing.playerOrCharacter} · {listing.year} · {listing.setName}</p>
        </div>

        {/* Price */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <PriceDisplay priceIdr={listing.priceIdr} size="lg" />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">
              + {formatIDR(fees.buyerFeeIdr)} buyer fee ({formatUSD(idrToUsd(fees.buyerFeeIdr, exchangeRate))})
            </span>
          </div>
          {listing.isBestOfferEnabled && (
            <p className="text-xs text-blue-600 font-medium mt-1">Offers accepted</p>
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
              ['Cert #', listing.certNumber || 'N/A'],
              ['Category', listing.playerOrCharacter],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-gray-900 font-medium">{value}</p>
              </div>
            ))}
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
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900">{listing.seller.displayName}</p>
                  {listing.seller.kycStatus === 'verified' && (
                    <Shield size={14} className="text-blue-600 fill-blue-100" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {listing.seller.trustScore}
                  </span>
                  <span>·</span>
                  <span>{listing.seller.totalTransactions} trades</span>
                </div>
              </div>
            </div>
            <Link href={`/messages?user=${listing.seller.id}`} className="p-2.5 bg-gray-100 rounded-xl">
              <MessageCircle size={18} className="text-gray-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Make an Offer</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-400">✕</button>
            </div>
            <div>
              <label className="text-sm text-gray-600">Your offer ({preferredCurrency})</label>
              <div className="mt-1.5 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {preferredCurrency === 'IDR' ? 'Rp' : '$'}
                </span>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Submit Offer
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          {listing.isBestOfferEnabled && (
            <button
              onClick={() => setShowOfferModal(true)}
              className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Make Offer
            </button>
          )}
          <Link
            href={`/checkout/${listing.id}`}
            className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm text-center hover:bg-blue-700 transition-colors"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
