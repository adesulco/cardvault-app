'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CardGrid from '@/components/CardGrid';
import CategoryFilter from '@/components/CategoryFilter';
import PriceDisplay from '@/components/PriceDisplay';
import { useAppStore } from '@/lib/store';
import { formatIDR, formatUSD, idrToUsd, calculateFees } from '@/lib/currency';

const ALL_LISTINGS = [
  { id: '1', cardName: 'Charizard VMAX', playerOrCharacter: 'Pokémon', frontImageUrl: null, condition: 'graded' as const, grade: '10', gradingCompany: 'PSA', priceIdr: 25000000, status: 'listed_sale' as const, listingId: 'l1', seller: { displayName: 'TokyoCards', trustScore: 4.9 } },
  { id: '2', cardName: 'Luka Doncic Prizm Silver', playerOrCharacter: 'Basketball', frontImageUrl: null, condition: 'graded' as const, grade: '9.5', gradingCompany: 'BGS', priceIdr: 15000000, status: 'listed_sale' as const, listingId: 'l2', seller: { displayName: 'HoopCards_ID', trustScore: 4.7 } },
  { id: '3', cardName: 'Blue-Eyes White Dragon', playerOrCharacter: 'Yu-Gi-Oh!', frontImageUrl: null, condition: 'graded' as const, grade: '8', gradingCompany: 'CGC', priceIdr: 8500000, status: 'listed_sale' as const, listingId: 'l3', seller: { displayName: 'DuelMaster', trustScore: 4.5 } },
  { id: '4', cardName: 'Mike Trout Topps Chrome RC', playerOrCharacter: 'Baseball', frontImageUrl: null, condition: 'raw' as const, grade: null, gradingCompany: null, priceIdr: 5000000, status: 'listed_sale' as const, listingId: 'l4', seller: { displayName: 'CardCollectorJKT', trustScore: 4.8 } },
  { id: '5', cardName: 'Black Lotus', playerOrCharacter: 'Magic: The Gathering', frontImageUrl: null, condition: 'graded' as const, grade: '7', gradingCompany: 'PSA', priceIdr: 150000000, status: 'listed_sale' as const, listingId: 'l5', seller: { displayName: 'VintageMTG', trustScore: 5.0 } },
  { id: '6', cardName: 'Pikachu Illustrator', playerOrCharacter: 'Pokémon', frontImageUrl: null, condition: 'graded' as const, grade: '9', gradingCompany: 'PSA', priceIdr: 75000000, status: 'listed_sale' as const, listingId: 'l6', seller: { displayName: 'RareFinds', trustScore: 4.6 } },
  { id: '7', cardName: 'LeBron James Rookie', playerOrCharacter: 'Basketball', frontImageUrl: null, condition: 'graded' as const, grade: '9', gradingCompany: 'PSA', priceIdr: 45000000, status: 'listed_sale' as const, listingId: 'l7', seller: { displayName: 'SlamDunkCards', trustScore: 4.4 } },
  { id: '8', cardName: 'Mewtwo GX Rainbow', playerOrCharacter: 'Pokémon', frontImageUrl: null, condition: 'graded' as const, grade: '10', gradingCompany: 'CGC', priceIdr: 12000000, status: 'listed_sale' as const, listingId: 'l8', seller: { displayName: 'PKMNHub', trustScore: 4.3 } },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { preferredCurrency } = useAppStore();

  const catMap: Record<string, string> = {
    pokemon: 'Pokémon', basketball: 'Basketball', baseball: 'Baseball',
    yugioh: 'Yu-Gi-Oh!', mtg: 'Magic: The Gathering', soccer: 'Soccer',
    football: 'Football', hockey: 'Hockey',
  };

  let filtered = ALL_LISTINGS.filter(c => {
    const matchesSearch = !search ||
      c.cardName.toLowerCase().includes(search.toLowerCase()) ||
      (c.playerOrCharacter && c.playerOrCharacter.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !selectedCategory || c.playerOrCharacter === catMap[selectedCategory];
    return matchesSearch && matchesCat;
  });

  // Sort
  if (sortBy === 'price_asc') filtered.sort((a, b) => (a.priceIdr || 0) - (b.priceIdr || 0));
  if (sortBy === 'price_desc') filtered.sort((a, b) => (b.priceIdr || 0) - (a.priceIdr || 0));

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards, players, sets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-colors ${
              showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Sort by</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {([
                  ['newest', 'Newest'],
                  ['price_asc', 'Price: Low → High'],
                  ['price_desc', 'Price: High → Low'],
                  ['popular', 'Most Popular'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Condition</label>
              <div className="flex gap-2 mt-1.5">
                {['All', 'Graded', 'Raw'].map(c => (
                  <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      {/* Results count */}
      <div className="px-4">
        <p className="text-xs text-gray-500">{filtered.length} cards found</p>
      </div>

      {/* Grid */}
      <CardGrid cards={filtered} />
    </div>
  );
}
