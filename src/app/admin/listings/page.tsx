'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Listing {
  id: string;
  cardId: string;
  card: { cardName: string };
  seller: { id: string; email: string; displayName: string };
  listingType: string;
  priceIdr: number;
  status: string;
  viewsCount: number;
  createdAt: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'traded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Listings</h1>
        <p className="text-sm text-slate-500">Manage card listings on the marketplace</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by card name or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="sold">Sold</option>
            <option value="traded">Traded</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchListings}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && listings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">No listings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Card Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Seller</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Views</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">{listing.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-xs text-slate-900 font-medium">{listing.card.cardName}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{listing.seller.displayName || listing.seller.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {listing.listingType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-900">
                      {listing.priceIdr ? formatCurrency(listing.priceIdr) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{listing.viewsCount}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{formatDate(listing.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
