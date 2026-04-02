'use client';
import { useState, useEffect } from 'react';
import { Search, X, Save, Star } from 'lucide-react';

export default function FeaturedConfigPage() {
  const [activeTab, setActiveTab] = useState<'sellers' | 'listings'>('sellers');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [sellers, setSellers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/featured?type=configs')
      .then(r => r.json())
      .then(d => { setSellers(d.sellers || []); setListings(d.listings || []); });
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    const delay = setTimeout(() => {
       fetch(`/api/admin/featured?type=${activeTab === 'sellers' ? 'search_users' : 'search_listings'}&q=${encodeURIComponent(searchTerm)}`)
         .then(r => r.json())
         .then(d => setSearchResults(d));
       setIsSearching(false);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm, activeTab]);

  const addSeller = (user: any) => {
    if (sellers.find(s => s.id === user.id)) return;
    setSellers([...sellers, user]);
    setSearchTerm('');
  };

  const removeSeller = (id: string) => setSellers(sellers.filter(s => s.id !== id));

  const addListing = (listing: any) => {
    if (listings.find(l => l.id === listing.id)) return;
    setListings([...listings, listing]);
    setSearchTerm('');
  };

  const removeListing = (id: string) => setListings(listings.filter(l => l.id !== id));

  const saveSellers = async () => {
    setIsSaving(true);
    await fetch('/api/admin/featured', { method: 'POST', body: JSON.stringify({ sellers: sellers.map(s => s.id) }) });
    setIsSaving(false);
    alert('Featured Sellers Rail updated and pushed to global edge.');
  };

  const saveListings = async () => {
    setIsSaving(true);
    await fetch('/api/admin/featured', { method: 'POST', body: JSON.stringify({ listings: listings.map(l => l.id) }) });
    setIsSaving(false);
    alert('Featured High-Value Grails updated and pushed to global edge.');
  };

  const moveItem = (arr: any[], setArr: any, index: number, direction: 'up' | 'down') => {
    const newArr = [...arr];
    if (direction === 'up' && index > 0) {
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
    } else if (direction === 'down' && index < newArr.length - 1) {
      [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
    }
    setArr(newArr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Featured Rails</h1>
          <p className="text-sm text-gray-500">Curate Home Page Top Sellers & High-Value Cards globally</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('sellers')} className={`pb-3 font-semibold text-sm border-b-2 ${activeTab === 'sellers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Top Sellers</button>
        <button onClick={() => setActiveTab('listings')} className={`pb-3 font-semibold text-sm border-b-2 ${activeTab === 'listings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Featured Grails</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Live Order Board */}
         <div className="bg-white border text-sm border-gray-200 rounded-lg shadow-sm p-4 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
               <h2 className="font-bold text-gray-800">Live Rail Sequence</h2>
               <button onClick={activeTab === 'sellers' ? saveSellers : saveListings} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  <Save size={14} /> {isSaving ? 'Deploying...' : 'Publish to Edge'}
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
               {(activeTab === 'sellers' ? sellers : listings).map((item, i, arr) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-lg group">
                     <div className="flex flex-col text-gray-400">
                        <button onClick={() => moveItem(arr, activeTab === 'sellers' ? setSellers : setListings, i, 'up')} className="hover:text-blue-600 disabled:opacity-30" disabled={i === 0}>▲</button>
                        <button onClick={() => moveItem(arr, activeTab === 'sellers' ? setSellers : setListings, i, 'down')} className="hover:text-blue-600 disabled:opacity-30" disabled={i === arr.length - 1}>▼</button>
                     </div>
                     <div className="flex-1 min-w-0">
                        {activeTab === 'sellers' ? (
                           <>
                              <p className="font-bold text-gray-800 truncate">{item.displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{item.email}</p>
                           </>
                        ) : (
                           <>
                              <p className="font-bold text-gray-800 truncate">{item.card?.cardName}</p>
                              <p className="text-xs text-gray-500 truncate">Vault/Owner: {item.seller?.displayName}</p>
                           </>
                        )}
                     </div>
                     <button onClick={() => activeTab === 'sellers' ? removeSeller(item.id) : removeListing(item.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0">
                        <X size={16} />
                     </button>
                  </div>
               ))}
               {(activeTab === 'sellers' ? sellers : listings).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <Star size={32} className="mb-2 opacity-50" />
                     <p>Frontpage Rail is currently empty.</p>
                  </div>
               )}
            </div>
         </div>

         {/* Search & Add DB Engine */}
         <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 h-[600px] flex flex-col">
            <h2 className="font-bold text-gray-800 mb-4 border-b pb-4">Query Global Database</h2>
            <div className="relative mb-4">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={activeTab === 'sellers' ? 'Search vault networks by name/email...' : 'Search listings by card name directly...'} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-blue-500 text-sm font-semibold text-gray-800" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
               {isSearching ? <div className="text-xs text-gray-500 text-center py-4">Executing DB Probe...</div> : searchResults.length === 0 && searchTerm ? <div className="text-xs text-gray-500 text-center py-4">No exact matches hit</div> : searchResults.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg hover:border-blue-400 cursor-pointer transition-colors" onClick={() => activeTab === 'sellers' ? addSeller(item) : addListing(item)}>
                     <div className="min-w-0">
                        {activeTab === 'sellers' ? (
                           <>
                              <p className="font-bold text-sm text-gray-800 truncate">{item.displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{item.email}</p>
                           </>
                        ) : (
                           <>
                              <p className="font-bold text-sm text-gray-800 truncate">{item.card?.cardName}</p>
                              <p className="text-xs text-gray-500 truncate">Vault: {item.seller?.displayName}</p>
                           </>
                        )}
                     </div>
                     <span className="text-[10px] font-bold tracking-wider shrink-0 uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">ADD +</span>
                  </div>
               ))}
               {!searchTerm && (
                  <div className="text-xs text-gray-500 text-center py-4 mt-8 flex flex-col items-center">
                     <Search size={24} className="mb-2 opacity-50" />
                     Type at least 2 characters to trigger live database link
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
