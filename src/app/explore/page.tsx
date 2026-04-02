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

let mpListingsCache: any[] = [];
let mpUsersCache: any[] = [];
let mpIsCached = false;

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { preferredCurrency, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'listings' | 'vaults'>('listings');
  const [listings, setListings] = useState<any[]>(mpListingsCache);
  const [users, setUsers] = useState<any[]>(mpUsersCache);
  const [loading, setLoading] = useState(!mpIsCached);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isInitialMount = React.useRef(true);

  // Fetch active mode resources when query mutates
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'listings') {
           const params = new URLSearchParams();
           if (search) params.append('q', search);
           if (sortBy) params.append('sort', sortBy);
           params.append('page', page.toString());

           if (page > 1) setLoadingMore(true);

           const response = await fetch(`/api/listings?${params.toString()}`);
           if (!response.ok) throw new Error('Failed to fetch listings');
           const data = await response.json();
           
           if (page === 1) {
              if (!search && sortBy==='newest') { mpListingsCache = data.listings || []; mpIsCached = true; }
              setListings(data.listings || []);
           } else {
              setListings(prev => [...prev, ...(data.listings || [])]);
           }
           setHasMore(data.hasMore);
        } else {
           const response = await fetch(`/api/users/search?q=${encodeURIComponent(search || 'a')}&userId=${user?.id || ''}`);
           const data = await response.json();
           if (!search) { mpUsersCache = data.users || []; }
           setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isInitialMount.current || !search) {
       // Fire instantly without debounce on first mount or empty query clearance
       isInitialMount.current = false;
       fetchData();
       return;
    }

    const delayDebounceFn = setTimeout(() => {
       fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, sortBy, activeTab, user?.id, page]);

  // Reset page cleanly whenever search configs adjust
  React.useEffect(() => {
     setPage(1);
  }, [search, sortBy, activeTab]);

  const catMap: Record<string, string> = {
    pokemon: 'Pokémon', basketball: 'Basketball', baseball: 'Baseball',
    yugioh: 'Yu-Gi-Oh!', mtg: 'Magic: The Gathering', soccer: 'Soccer',
    football: 'Football', hockey: 'Hockey',
  };

  const filtered = listings.filter(c => {
    const matchesCat = !selectedCategory || c.sportOrCategory === catMap[selectedCategory];
    return matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Structural Headers */}
      <div className="px-4 pt-4 sticky top-0 z-20 bg-slate-50 pb-2 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Explore Database</h1>
        
        {/* Tab Selection */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl w-full mb-3">
           <button 
              onClick={() => setActiveTab('listings')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'listings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
           >
              Listings
           </button>
           <button 
              onClick={() => setActiveTab('vaults')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'vaults' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
           >
              Users & Vaults
           </button>
        </div>

      {/* Search Bar */}
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
            disabled={activeTab === 'vaults'}
            className={`p-3 rounded-xl border transition-colors ${
              activeTab === 'vaults' ? 'bg-transparent text-gray-300 border-gray-100 opacity-50 cursor-not-allowed' :
              showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filters Panel (Listings Mode Only) */}
      {showFilters && activeTab === 'listings' && (
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

      {/* Results Selection Engine */}
      {activeTab === 'listings' ? (
         <>
          {/* Categories */}
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

          {/* Results count */}
          <div className="px-4">
            <p className="text-xs text-gray-500">{filtered.length} cards found</p>
          </div>

          {/* Grid or Empty State */}
          {loading && page === 1 ? (
            <div className="px-4 py-12 text-center" aria-live="polite">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                 <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                 Loading Database...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">No results mapped</p>
              <p className="text-xs text-gray-500">Try adjusting your filters or search metrics.</p>
            </div>
          ) : (
            <>
               <CardGrid cards={filtered} />
               {hasMore && (
                  <div className="pt-6 pb-12 flex justify-center w-full px-4">
                     <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={loadingMore}
                        className="py-3 px-6 bg-white border border-gray-200 font-bold text-sm text-gray-700 rounded-xl shadow-sm hover:border-gray-300 transition-colors w-full sm:w-auto"
                        aria-label="Load more cards"
                     >
                        {loadingMore ? 'Extracting Data...' : 'Load More Grails'}
                     </button>
                  </div>
               )}
            </>
          )}
         </>
      ) : (
         <div className="px-4 space-y-3 pb-8">
            <p className="text-xs text-gray-500 px-1">{users.length} users found</p>
            {loading ? (
               <div className="py-12 text-center text-sm text-gray-500">Searching global network...</div>
            ) : users.length === 0 ? (
               <div className="py-12 text-center text-sm text-gray-500">No users match your query.</div>
            ) : (
               <div className="grid gap-3">
                  {users.map(u => (
                     <a key={u.id} href={`/profile/${u.id}`} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex flex-shrink-0 items-center justify-center font-bold text-gray-400">
                              {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : (u.displayName?.[0] || '?')}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">{u.displayName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">@{u.username}</p>
                           </div>
                        </div>
                        <div className="flex gap-1.5">
                           <button onClick={(e) => { e.preventDefault(); window.location.href = `/messages/${u.id}`; }} className="text-[10px] bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700">Message</button>
                           <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border ${u.isFollowed ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {u.isFollowed ? 'Following' : 'View'}
                           </span>
                        </div>
                     </a>
                  ))}
               </div>
            )}
         </div>
      )}
    </div>
  );
}
