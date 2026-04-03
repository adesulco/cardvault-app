'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface FinancialData {
  totalRevenue: number;
  totalVolume: number;
  completedPayouts: number;
  pendingPayouts: number;
  recentTransactions: any[];
}

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/financials');
      if (res.ok) {
        const financials = await res.json();
        setData(financials);
      }
    } catch (error) {
      console.error('Failed to fetch financials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const SUMMARY_CARDS = data
    ? [
        {
          label: 'Total Platform Revenue',
          value: formatCurrency(data.totalRevenue),
          icon: TrendingUp,
          color: 'bg-blue-500',
        },
        {
          label: 'Gross Volume Processed',
          value: formatCurrency(data.totalVolume),
          icon: DollarSign,
          color: 'bg-green-500',
        },
        {
          label: 'Completed Payouts',
          value: formatCurrency(data.completedPayouts),
          icon: DollarSign,
          color: 'bg-emerald-500',
        },
        {
          label: 'Pending Payouts',
          value: data.pendingPayouts.toString(),
          icon: DollarSign,
          color: 'bg-amber-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financials</h1>
        <p className="text-sm text-slate-500">Platform revenue and payout overview</p>
      </div>

      {/* Summary Cards */}
      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Transaction Volume Trend</h2>
        {!data || loading ? (
          <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
        ) : data.recentTransactions.length === 0 ? (
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
            <p className="text-sm">No transaction data available yet</p>
          </div>
        ) : (
          <div className="h-64 bg-slate-50 rounded-lg flex items-end justify-between px-10 pb-6 pt-10 gap-2 border border-slate-100 overflow-hidden relative" aria-label="Transaction Chart">
             {/* Y-Axis Label */}
             <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest origin-center whitespace-nowrap">Volume (IDR)</div>
             
             {/* X-Axis Label */}
             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Transactions</div>
             
             {data.recentTransactions.slice(0, 30).reverse().map((tx, idx) => {
                const amount = tx.agreedPriceIdr || tx.agreedPriceUsd || 0;
                const maxAmount = Math.max(...data.recentTransactions.map(t => (t.agreedPriceIdr || t.agreedPriceUsd || 100000)));
                const heightPct = Math.max(5, (amount / maxAmount) * 100);
                return (
                   <div key={tx.id || idx} className="flex-1 w-full bg-blue-500/80 hover:bg-blue-600 transition-all rounded-t-sm group relative" style={{ height: `${heightPct}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                         {formatCurrency(amount)}
                      </div>
                   </div>
                );
             })}
          </div>
        )}
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Completed Transactions (30d)</h2>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-xs text-blue-600 font-medium hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {!data || loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : data.recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Seller</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Transaction Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Buyer Fee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Seller Fee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">{tx.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{tx.seller?.displayName || 'User'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 capitalize">{tx.transactionType}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-900">
                      {formatCurrency(tx.agreedPriceIdr || tx.agreedPriceUsd || 0)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{formatCurrency(tx.platformFeeBuyerIdr || 0)}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{formatCurrency(tx.platformFeeSellerIdr || 0)}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{formatDate(tx.completedAt || tx.createdAt)}</td>
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
