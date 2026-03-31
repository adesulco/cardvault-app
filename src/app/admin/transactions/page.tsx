'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

interface Transaction {
  id: string;
  buyer: { displayName: string; email: string };
  seller: { displayName: string; email: string };
  agreedPrice: number;
  escrowStatus: string;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/admin/transactions?status=${filter}`);
        // const data = await response.json();
        // setTransactions(data);

        setTransactions([]);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filter]);

  return (
    <div className="space-y-4 pb-12">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500">Monitor all marketplace transactions</p>
      </div>

      {/* Filter */}
      <div className="px-4 flex gap-2 overflow-x-auto">
        {['all', 'pending', 'completed', 'disputed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">No transactions</p>
          <p className="text-xs text-gray-500">No transactions in this category yet</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {transactions.map(tx => (
            <div
              key={tx.id}
              className="bg-white rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-gray-900">{tx.id.slice(0, 8)}</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  tx.escrowStatus === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : tx.escrowStatus === 'disputed'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {tx.escrowStatus}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{tx.buyer.displayName} → {tx.seller.displayName}</p>
              <p className="text-xs text-gray-500">Rp {tx.agreedPrice.toLocaleString()} • {new Date(tx.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
