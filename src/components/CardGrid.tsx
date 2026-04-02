'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDualCurrency } from '@/lib/currency';
import PriceDisplay from './PriceDisplay';

interface CardItem {
  id: string;
  cardName: string;
  playerOrCharacter?: string | null;
  frontImageUrl?: string | null;
  condition: string;
  grade?: string | null;
  gradingCompany?: string | null;
  priceIdr?: number | null;
  status?: string;
  seller?: { displayName: string | null; trustScore: number } | null;
  listingId?: string;
  favoritesCount?: number;
}

export default function CardGrid({ cards, showPrice = true }: { cards: CardItem[]; showPrice?: boolean }) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <div className="text-5xl mb-3">🃏</div>
        <p className="text-sm">No cards found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.listingId ? `/explore/${card.listingId}` : `/cards/${card.id}`}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`View ${card.condition === 'graded' ? card.grade : ''} ${card.cardName} Listing`}
        >
          {/* Card Image Wrapper with Skeleton Pulse Base */}
          <div className="aspect-[3/4] bg-slate-200 animate-pulse relative overflow-hidden">
            {card.frontImageUrl ? (
              <>
                <div className="absolute inset-0 bg-slate-200 animate-pulse -z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.frontImageUrl}
                  alt={card.cardName}
                  className="w-full h-full object-cover transition-opacity duration-700 opacity-0"
                  onLoad={(e) => { e.currentTarget.classList.remove('opacity-0'); e.currentTarget.parentElement?.classList.remove('animate-pulse'); }}
                  onError={(e) => {
                     e.currentTarget.src = '/fallback-card.png';
                     e.currentTarget.classList.remove('opacity-0');
                     e.currentTarget.parentElement?.classList.remove('animate-pulse');
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-4xl">🃏</span>
              </div>
            )}
            {/* Grading Badge */}
            {card.condition === 'graded' && card.grade && (
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {card.gradingCompany} {card.grade}
              </div>
            )}
            {/* Favorite */}
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-rose-50 transition-colors group focus:ring-2 focus:ring-blue-500"
              aria-label="Add to Favorites"
            >
              <Heart size={14} className="text-gray-500 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>

          {/* Card Info */}
          <div className="p-2.5">
            <h3 className="text-sm font-semibold text-gray-900 truncate" title={card.cardName}>{card.cardName}</h3>
            {card.playerOrCharacter && (
              <p className="text-xs text-gray-500 truncate">{card.playerOrCharacter}</p>
            )}
            {showPrice && card.priceIdr && (
              <div className="mt-1.5">
                <PriceDisplay priceIdr={card.priceIdr} size="sm" />
              </div>
            )}
            {card.seller && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <Shield 
                  size={10} 
                  className={card.seller.trustScore > 90 ? "text-yellow-500 fill-yellow-500" : "text-green-500"} 
                />
                <span className="text-[10px] text-gray-500 truncate" title={card.seller.displayName || 'Seller'}>
                  {card.seller.displayName || 'Seller'}{card.seller.trustScore > 0 ? ` · ★ ${card.seller.trustScore.toFixed(1)}` : ''}
                </span>
                {card.seller.trustScore > 90 && (
                  <span className="text-[8px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-sm flex items-center shadow-sm">
                    {/* Gamified visual badge */}
                    TRUSTED
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
