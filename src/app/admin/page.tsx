'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, ArrowLeftRight, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  activeTransactions: number;
  openDisputes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setRecentUsers(usersData.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', href: '/admin/users' },
    { label: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'bg-amber-500', href: '/admin/kyc' },
    { label: 'Active Transactions', value: stats.activeTransactions, icon: ArrowLeftRight, color: 'bg-emerald-500', href: '/admin/transactions' },
    { label: 'Open Disputes', value: stats.openDisputes, icon: AlertTriangle, color: 'bg-red-500', href: '/admin/disputes' },
  ] : [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your platform</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(stat => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {stats && stats.pendingKyc > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {stats.pendingKyc} KYC application{stats.pendingKyc > 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-xs text-amber-700">New users are waiting for approval to start trading</p>
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

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Users</h2>
          <Link href="/admin/users" className="text-xs text-blue-600 font-medium hover:underline">
            View All
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500">No users yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.displayName || 'Unnamed'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    user.kycStatus === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : user.kycStatus === 'REJECTED'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {user.kycStatus}
                  </span>
                  <span className="text-xs text-slate-400">{user.userRole}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
