'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Filter, Grid3X3, List } from 'lucide-react';
import CardGrid from '@/components/CardGrid';

const STATUS_FILTERS = [
  { value: null, label: 'All' },
  { value: 'in_collection', label: 'In Collection' },
  { value: 'listed_sale', label: 'Listed' },
  { value: 'in_transaction', label: 'In Transaction' },
  { value: 'sold', label: 'Sold' },
];

export default function MyCollectionPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards?status=' + (statusFilter || 'all'));
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCards(data.cards || []);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [statusFilter]);

  const filtered = statusFilter
    ? cards.filter(c => c.status === statusFilter)
    : cards;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Collection</h1>
          <p className="text-sm text-gray-500">{cards.length} cards</p>
        </div>
        <Link
          href="/cards/new"
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Card
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <CardGrid cards={filtered} showPrice={false} />

      {filtered.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-3">📦</div>
          <h3 className="text-base font-semibold text-gray-900">No cards yet</h3>
          <p className="text-sm text-gray-500 mt-1">Start building your collection by adding your first card.</p>
          <Link
            href="/cards/new"
            className="inline-flex items-center gap-1.5 mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus size={16} />
            Add Your First Card
          </Link>
        </div>
      )}
    </div>
  );
}
