'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Filter, Grid3X3, List } from 'lucide-react';
import CardGrid from '@/components/CardGrid';

const TAB_DEFINITIONS = [
  { id: 'collection', label: 'Collection' },
  { id: 'listed', label: 'Listed' },
  { id: 'transaction', label: 'In Transaction' },
  { id: 'sold', label: 'Sold' },
];

import { useAppStore } from '@/lib/store';

export default function MyCollectionPage() {
  const { user } = useAppStore();
  const [allCards, setAllCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('collection');

  useEffect(() => {
    const fetchMyCards = async () => {
      try {
        if (!user?.id) return;
        const response = await fetch(`/api/user/cards?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setAllCards(data.cards || []);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCards();
  }, [user]);

  const getFilteredCards = (tabId: string) => {
     return allCards.filter(c => {
        if (tabId === 'collection') return c.status === 'in_collection';
        if (tabId === 'listed') return c.status === 'listed_sale' || c.status === 'listed_trade' || c.status === 'auction';
        if (tabId === 'transaction') return c.status === 'in_transaction';
        if (tabId === 'sold') return c.status === 'sold' || c.status === 'traded';
        return false;
     });
  };

  const filtered = getFilteredCards(activeTab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Collection</h1>
          <p className="text-sm text-gray-500">{allCards.length} total cards</p>
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
        {TAB_DEFINITIONS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({getFilteredCards(tab.id).length})
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
         <CardGrid cards={filtered} showPrice={false} />
      ) : (
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
