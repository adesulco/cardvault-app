'use client';
import { useState } from 'react';
import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CardGrid from '@/components/CardGrid';
import CategoryFilter from '@/components/CategoryFilter';
import PriceDisplay from '@/components/PriceDisplay';
import { useAppStore } from '@/lib/store';
import { formatIDR, formatUSD, idrToUsd, calculateFees } from '@/lib/currency';

// Listings are now fetched from API - no demo data

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { preferredCurrency } = useAppStore();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch listings from API on mount
  React.useEffect(() => {
    const fetchListings = async () => {
      try {
        // TODO: Replace with actual API call once implemented
        setListings([]);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const catMap: Record<string, string> = {
    pokemon: 'Pokémon', basketball: 'Basketball', baseball: 'Baseball',
    yugioh: 'Yu-Gi-Oh!', mtg: 'Magic: The Gathering', soccer: 'Soccer',
    football: 'Football', hockey: 'Hockey',
  };

  let filtered = listings.filter(c => {
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

      {/* Grid or Empty State */}
      {loading ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-gray-500">Loading listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">No listings yet</p>
          <p className="text-xs text-gray-500">Be the first to list a card on CardVault!</p>
        </div>
      ) : (
        <CardGrid cards={filtered} />
      )}
    </div>
  );
}
