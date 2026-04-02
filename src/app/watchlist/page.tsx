'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Heart, Search } from 'lucide-react';
import CardGrid from '@/components/CardGrid';
import Link from 'next/link';

export default function WatchlistPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/watchlist?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setListings(data.listings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-4 pb-20">
      <header className="px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Watchlist</h1>
            <p className="text-sm text-gray-500">{listings.length} saved active listings</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="p-12 flex justify-center text-blue-600"><Loader2 className="animate-spin" /></div>
      ) : listings.length === 0 ? (
        <div className="px-4 py-16 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-rose-400" size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">No Saved Grails</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Heart listings on the marketplace to watch their price trajectories and get notified if they drop!</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            <Search size={18} /> Browse Marketplace
          </Link>
        </div>
      ) : (
        <CardGrid cards={listings} />
      )}
    </div>
  );
}
