'use client';
import { useState } from 'react';
import Link from 'next/link';
import EscrowBadge from '@/components/EscrowBadge';
import TransactionProgress from '@/components/TransactionProgress';
import PriceDisplay from '@/components/PriceDisplay';
import type { EscrowStatus } from '@/lib/types';

const TRANSACTIONS = [
  {
    id: 't1', cardName: 'Charizard VMAX', seller: 'TokyoCards', buyer: 'You',
    priceIdr: 25750000, escrowStatus: 'shipped' as EscrowStatus,
    paymentGateway: 'midtrans', date: '2 hours ago', role: 'buyer' as const,
  },
  {
    id: 't2', cardName: 'Luka Doncic Prizm', seller: 'You', buyer: 'HoopFan88',
    priceIdr: 15450000, escrowStatus: 'awaiting_shipment' as EscrowStatus,
    paymentGateway: 'stripe', date: '1 day ago', role: 'seller' as const,
  },
  {
    id: 't3', cardName: 'Pikachu V Full Art', seller: 'You', buyer: 'PKMNCollector',
    priceIdr: 3605000, escrowStatus: 'completed' as EscrowStatus,
    paymentGateway: 'midtrans', date: '5 days ago', role: 'seller' as const,
  },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'buying' | 'selling'>('all');

  const filtered = TRANSACTIONS.filter(t => {
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
