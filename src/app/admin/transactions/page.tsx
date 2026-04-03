'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, ArrowRight, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  buyer: { id: string; displayName: string; email: string };
  seller: { id: string; displayName: string; email: string };
  transactionType: string;
  agreedPriceIdr: number | null;
  agreedPriceUsd: number | null;
  escrowStatus: string;
  paymentGateway: string | null;
  trackingNumberSeller: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-slate-100 text-slate-700' },
  payment_held: { label: 'Payment Held', color: 'bg-blue-50 text-blue-700' },
  awaiting_shipment: { label: 'Awaiting Shipment', color: 'bg-amber-50 text-amber-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-50 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-cyan-50 text-cyan-700' },
  under_inspection: { label: 'Under Inspection', color: 'bg-purple-50 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
  disputed: { label: 'Disputed', color: 'bg-red-50 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-orange-50 text-orange-700' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [overriding, setOverriding] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOverride = async () => {
    if (!selected || !overrideStatus) return;
    setOverriding(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: selected.id,
          escrowStatus: overrideStatus,
          note: overrideNote,
        }),
      });

      if (res.ok) {
        setMessage('Transaction status updated successfully');
        setSelected(null);
        setOverrideStatus('');
        setOverrideNote('');
        await fetchTransactions();
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.error || 'Update failed'}`);
      }
    } catch {
      setMessage('Error: Network request failed');
    } finally {
      setOverriding(false);
    }
  };

  const filteredTx = filter === 'all'
    ? transactions
    : transactions.filter(tx => tx.escrowStatus === filter);

  // Detail view
  if (selected) {
    const statusInfo = STATUS_MAP[selected.escrowStatus] || { label: selected.escrowStatus, color: 'bg-slate-100 text-slate-700' };
    const price = selected.agreedPriceIdr
      ? `Rp ${selected.agreedPriceIdr.toLocaleString('id-ID')}`
      : selected.agreedPriceUsd
      ? `$${selected.agreedPriceUsd.toLocaleString()}`
      : 'N/A';

    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelected(null); setMessage(''); }} className="text-blue-600">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Transaction Detail</h1>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-slate-400">#{selected.id.slice(0, 12)}</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900">{price}</p>
            <p className="text-xs text-slate-500 mt-1">{selected.transactionType} &middot; Created {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase font-medium">Buyer</p>
                <p className="font-medium text-slate-900">{selected.buyer.displayName || 'Unnamed'}</p>
                <p className="text-xs text-slate-500">{selected.buyer.email}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300" />
              <div className="flex-1 text-right">
                <p className="text-xs text-slate-400 uppercase font-medium">Seller</p>
                <p className="font-medium text-slate-900">{selected.seller.displayName || 'Unnamed'}</p>
                <p className="text-xs text-slate-500">{selected.seller.email}</p>
              </div>
            </div>
          </div>

          {selected.trackingNumberSeller && (
            <div className="p-4">
              <p className="text-xs text-slate-400 uppercase font-medium">Tracking Number</p>
              <p className="text-sm text-slate-900 font-mono">{selected.trackingNumberSeller}</p>
            </div>
          )}

          {selected.paymentGateway && (
            <div className="p-4">
              <p className="text-xs text-slate-400 uppercase font-medium">Payment Gateway</p>
              <p className="text-sm text-slate-900">{selected.paymentGateway}</p>
            </div>
          )}
        </div>

        {/* Override panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Admin Override
          </h3>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Change Status To</label>
            <select
              value={overrideStatus}
              onChange={e => setOverrideStatus(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select new status...</option>
              {Object.entries(STATUS_MAP).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Admin Note</label>
            <textarea
              value={overrideNote}
              onChange={e => setOverrideNote(e.target.value)}
              placeholder="Reason for override..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              rows={2}
            />
          </div>
          <button
            onClick={handleOverride}
            disabled={overriding || !overrideStatus}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {overriding ? 'Updating...' : 'Override Status'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-500">Monitor and manage marketplace escrows</p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'pending_payment', 'payment_held', 'shipped', 'completed', 'disputed', 'refunded'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status === 'all' ? `All (${transactions.length})` : (STATUS_MAP[status]?.label || status)}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredTx.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-900 mb-1">No transactions</p>
          <p className="text-xs text-slate-500">No transactions in this category yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTx.map(tx => {
            const statusInfo = STATUS_MAP[tx.escrowStatus] || { label: tx.escrowStatus, color: 'bg-slate-100 text-slate-700' };
            const price = tx.agreedPriceIdr
              ? `Rp ${tx.agreedPriceIdr.toLocaleString('id-ID')}`
              : tx.agreedPriceUsd
              ? `$${tx.agreedPriceUsd.toLocaleString()}`
              : 'N/A';

            return (
              <button
                key={tx.id}
                onClick={() => setSelected(tx)}
                className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-slate-400">#{tx.id.slice(0, 8)}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">{price}</p>
                <p className="text-xs text-slate-500">
                  {tx.buyer.displayName || 'Unnamed'} → {tx.seller.displayName || 'Unnamed'} &middot; {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
