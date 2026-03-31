'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import EscrowBadge from '@/components/EscrowBadge';
import TransactionProgress from '@/components/TransactionProgress';
import PriceDisplay from '@/components/PriceDisplay';
import type { EscrowStatus } from '@/lib/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buying' | 'selling'>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/transactions?filter=' + filter);
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

  const filtered = transactions.filter(t => {
    if (filter === 'buying') return t.role === 'buyer';
    if (filter === 'selling') return t.role === 'seller';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500">Track your escrow payments</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 px-4">
        {(['all', 'buying', 'selling'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction Cards */}
      <div className="space-y-3 px-4">
        {filtered.map(tx => (
          <Link
            key={tx.id}
            href={`/transactions/${tx.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex gap-3 mb-3">
              <div className="w-14 h-18 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                🃏
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{tx.cardName}</h3>
                  <span className="text-[10px] text-gray-400">{tx.date}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {tx.role === 'buyer' ? `From: ${tx.seller}` : `To: ${tx.buyer}`}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <PriceDisplay priceIdr={tx.priceIdr} size="sm" />
                  <EscrowBadge status={tx.escrowStatus} />
                </div>
              </div>
            </div>
            <TransactionProgress status={tx.escrowStatus} />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm text-gray-500">No transactions yet</p>
        </div>
      )}
    </div>
  );
}
