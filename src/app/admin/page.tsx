'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, ArrowLeftRight, AlertTriangle, Package, DollarSign, RefreshCw } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  activeTransactions: number;
  totalTransactions: number;
  openDisputes: number;
  activeListings: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  recentTransactions: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [feePercentage, setFeePercentage] = useState<string>('3.0');
  const [gaString, setGaString] = useState<string>('');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [isUpdatingGa, setIsUpdatingGa] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
     try {
       const res = await fetch('/api/admin/config');
       if (res.ok) {
         const data = await res.json();
         if(data.feePercentage !== undefined) setFeePercentage(data.feePercentage.toString());
         if(data.gaId) setGaString(data.gaId);
       }
     } catch(e) { console.error('Failed to grab configs'); }
  };

  const handleUpdateFee = async () => {
    const val = parseFloat(feePercentage);
    if (isNaN(val) || val < 0 || val > 100) return alert('Invalid mathematical percentage');
    setIsUpdatingFee(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feePercentage: val })
      });
      if (res.ok) alert('Active Escrow Platform Fee dynamically modified successfully!');
    } catch(e) { console.error(e); }
    setIsUpdatingFee(false);
  };

  const handleUpdateGa = async () => {
    setIsUpdatingGa(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gaId: gaString })
      });
      if (res.ok) alert('Analytics engine correctly synchronized!');
    } catch(e) { console.error(e); }
    setIsUpdatingGa(false);
  };

  useEffect(() => {
    fetchData();
    fetchConfig();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const STAT_CARDS = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', href: '/admin/users' },
    { label: 'Active Listings', value: stats.activeListings, icon: Package, color: 'bg-purple-500', href: '/admin/listings' },
    { label: 'Total Transactions', value: stats.totalTransactions, icon: ArrowLeftRight, color: 'bg-emerald-500', href: '/admin/transactions' },
    { label: 'Platform Fees', value: formatCurrency(stats.totalRevenue), isFormatted: true, icon: DollarSign, color: 'bg-green-500', href: '/admin/financials' },
    { label: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'bg-amber-500', href: '/admin/kyc' },
    { label: 'Open Disputes', value: stats.openDisputes, icon: AlertTriangle, color: 'bg-red-500', href: '/admin/disputes' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Platform overview and key metrics</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_CARDS.map(stat => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</span>
                </div>
                <p className={`${'isFormatted' in stat ? 'text-lg' : 'text-3xl'} font-bold text-slate-900 group-hover:text-blue-600 transition-colors`}>
                  {stat.value}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {stats && (stats.pendingKyc > 0 || stats.openDisputes > 0) && (
        <div className="space-y-3">
          {stats.pendingKyc > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    {stats.pendingKyc} KYC application{stats.pendingKyc > 1 ? 's' : ''} awaiting review
                  </p>
                  <p className="text-xs text-amber-700">Users waiting for approval to start trading</p>
                </div>
              </div>
              <Link
                href="/admin/kyc"
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                Review Now
              </Link>
            </div>
          )}
          {stats.pendingWithdrawals > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    {stats.pendingWithdrawals} wire request{stats.pendingWithdrawals > 1 ? 's' : ''} processing
                  </p>
                  <p className="text-xs text-emerald-700">Vault withdrawals requiring manual clearing</p>
                </div>
              </div>
              <Link
                href="/admin/financials"
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                Wire Funds
              </Link>
            </div>
          )}
          {stats.openDisputes > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    {stats.openDisputes} open dispute{stats.openDisputes > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-700">Disputes requiring resolution</p>
                </div>
              </div>
              <Link
                href="/admin/disputes"
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Resolve Now
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
            <Link href="/admin/transactions" className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </Link>
          </div>
          {!stats || loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : stats.recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 text-xs font-medium text-slate-600">ID</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-slate-600">Buyer</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-slate-600">Amount</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stats.recentTransactions.slice(0, 5).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-xs font-mono text-slate-600">{tx.id.slice(0, 8)}...</td>
                      <td className="py-3 px-2 text-xs text-slate-600">{tx.buyer?.displayName || 'User'}</td>
                      <td className="py-3 px-2 text-xs font-medium text-slate-900">{formatCurrency(tx.agreedPriceIdr || 0)}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          tx.escrowStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          tx.escrowStatus === 'refunded' ? 'bg-red-100 text-red-800' :
                          tx.escrowStatus === 'pending_payment' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {tx.escrowStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-blue-600 font-medium hover:underline">
              View All
            </Link>
          </div>
          {!stats || loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : stats.recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No users yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{user.displayName || 'Unnamed'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                    user.kycStatus === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : user.kycStatus === 'REJECTED'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {user.kycStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Platform Configuration Vectors ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
               <RefreshCw size={20} className="text-blue-600" />
               <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Dynamic Escrow Fee Configuration</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Adjust the global percentage deducted from sellers when an Escrow mathematically completes.</p>
               </div>
            </div>
            <div className="flex items-center w-full gap-3">
               <div className="relative flex-1">
                  <input 
                     type="text"
                     className="w-full bg-slate-50 border border-slate-200 py-2 pl-4 pr-8 rounded-lg outline-none font-bold text-slate-700 text-sm"
                     value={feePercentage}
                     onChange={e => setFeePercentage(e.target.value)}
                     placeholder="3.0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
               </div>
               <button 
                  onClick={handleUpdateFee}
                  disabled={isUpdatingFee}
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-blue-700 transition"
               >
                  Override Fee
               </button>
            </div>
         </div>
         
         <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center gap-3 mb-4">
               <div>
                  <h2 className="text-sm font-bold text-emerald-900 leading-tight">Global Analytics Module @next</h2>
                  <p className="text-xs text-emerald-700 mt-0.5">Wire an active Google Analytics property across the Edge routing tree dynamically.</p>
               </div>
            </div>
            <div className="flex items-center w-full gap-3">
               <div className="relative flex-1">
                  <input 
                     type="text"
                     className="w-full bg-emerald-50 border border-emerald-200 py-2 px-4 rounded-lg outline-none font-bold text-emerald-900 text-sm placeholder:text-emerald-300"
                     value={gaString}
                     onChange={e => setGaString(e.target.value)}
                     placeholder="G-XXXXXX..."
                  />
               </div>
               <button 
                  onClick={handleUpdateGa}
                  disabled={isUpdatingGa}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition"
               >
                  Connect
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
