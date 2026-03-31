'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import CardGrid from '@/components/CardGrid';
import CategoryFilter from '@/components/CategoryFilter';

// Demo data for the MVP
const DEMO_CARDS = [
  {
    id: '1', cardName: 'Charizard VMAX', playerOrCharacter: 'Pokémon',
    frontImageUrl: null, condition: 'graded' as const, grade: '10', gradingCompany: 'PSA',
    priceIdr: 25000000, status: 'listed_sale' as const, listingId: 'l1',
    seller: { displayName: 'TokyoCards', trustScore: 4.9 },
  },
  {
    id: '2', cardName: 'Luka Doncic Prizm Silver', playerOrCharacter: 'Basketball',
    frontImageUrl: null, condition: 'graded' as const, grade: '9.5', gradingCompany: 'BGS',
    priceIdr: 15000000, status: 'listed_sale' as const, listingId: 'l2',
    seller: { displayName: 'HoopCards_ID', trustScore: 4.7 },
  },
  {
    id: '3', cardName: 'Blue-Eyes White Dragon', playerOrCharacter: 'Yu-Gi-Oh!',
    frontImageUrl: null, condition: 'graded' as const, grade: '8', gradingCompany: 'CGC',
    priceIdr: 8500000, status: 'listed_sale' as const, listingId: 'l3',
    seller: { displayName: 'DuelMaster', trustScore: 4.5 },
  },
  {
    id: '4', cardName: 'Mike Trout Topps Chrome RC', playerOrCharacter: 'Baseball',
    frontImageUrl: null, condition: 'raw' as const, grade: null, gradingCompany: null,
    priceIdr: 5000000, status: 'listed_sale' as const, listingId: 'l4',
    seller: { displayName: 'CardCollectorJKT', trustScore: 4.8 },
  },
  {
    id: '5', cardName: 'Black Lotus', playerOrCharacter: 'Magic: The Gathering',
    frontImageUrl: null, condition: 'graded' as const, grade: '7', gradingCompany: 'PSA',
    priceIdr: 150000000, status: 'listed_sale' as const, listingId: 'l5',
    seller: { displayName: 'VintageMTG', trustScore: 5.0 },
  },
  {
    id: '6', cardName: 'Pikachu Illustrator', playerOrCharacter: 'Pokémon',
    frontImageUrl: null, condition: 'graded' as const, grade: '9', gradingCompany: 'PSA',
    priceIdr: 75000000, status: 'listed_sale' as const, listingId: 'l6',
    seller: { displayName: 'RareFinds', trustScore: 4.6 },
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCards = selectedCategory
    ? DEMO_CARDS.filter(c => {
        const catMap: Record<string, string> = {
          pokemon: 'Pokémon', basketball: 'Basketball', baseball: 'Baseball',
          yugioh: 'Yu-Gi-Oh!', mtg: 'Magic: The Gathering',
        };
        return c.playerOrCharacter === catMap[selectedCategory];
      })
    : DEMO_CARDS;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
        <h1 className="text-xl font-bold leading-tight">
          Trade Cards Safely<br />with Escrow Protection
        </h1>
        <p className="text-blue-100 text-sm mt-2 leading-relaxed">
          Buy, sell, and trade collectible cards with secure payments in IDR & USD.
        </p>
        <div className="flex gap-2 mt-4">
          <Link
            href="/marketplace"
            className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Explore Cards
          </Link>
          <Link
            href="/cards/new"
            className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            List a Card
          </Link>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 px-4">
        {[
          { icon: Shield, label: 'Escrow Protected', color: 'text-green-600 bg-green-50' },
          { icon: Zap, label: 'Instant Pay IDR', color: 'text-blue-600 bg-blue-50' },
          { icon: Globe, label: 'Global Trading', color: 'text-purple-600 bg-purple-50' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${color.split(' ')[1]}`}>
            <Icon size={20} className={color.split(' ')[0]} />
            <span className="text-[10px] font-medium text-gray-700 text-center">{label}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between px-4 mb-1">
          <h2 className="text-base font-bold text-gray-900">Browse Categories</h2>
        </div>
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* Trending Listings */}
      <div>
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-bold text-gray-900">Trending Now</h2>
          <Link href="/marketplace" className="text-sm text-blue-600 font-medium flex items-center gap-1">
            See All <ArrowRight size={14} />
          </Link>
        </div>
        <CardGrid cards={filteredCards} />
      </div>

      {/* Recently Listed */}
      <div>
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-bold text-gray-900">Recently Listed</h2>
          <Link href="/marketplace?sort=newest" className="text-sm text-blue-600 font-medium flex items-center gap-1">
            See All <ArrowRight size={14} />
          </Link>
        </div>
        <CardGrid cards={[...DEMO_CARDS].reverse().slice(0, 4)} />
      </div>
    </div>
  );
}
