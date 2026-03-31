'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShoppingCart, AlertTriangle, DollarSign, Activity, Shield, Globe, Settings, TrendingUp, CreditCard } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  activeTransactions: number;
  openDisputes: number;
  escrowBalance: number;
  totalVolume30d: number;
  feesCollected30d: number;
}

const ADMIN_MENU = [
  { icon: Users, label: 'KYC Management', href: '/admin/kyc', desc: 'Review seller applications' },
  { icon: ShoppingCart, label: 'Transactions', href: '/admin/transactions', desc: 'Monitor active escrows' },
  { icon: Users, label: 'User Management', href: '/admin/users', desc: 'Manage all users' },
  { icon: AlertTriangle, label: 'Disputes', href: '/admin/disputes', desc: 'Resolve buyer/seller disputes' },
  { icon: DollarSign, label: 'Financial Reports', href: '/admin/finance', desc: 'Revenue, payouts, reconciliation' },
  { icon: Activity, label: 'Gateway Health', href: '/admin/gateways', desc: 'Monitor payment gateways' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingKyc: 0,
    activeTransactions: 0,
    openDisputes: 0,
    escrowBalance: 0,
    totalVolume30d: 0,
    feesCollected30d: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        // setStats(data);

        // For now, show empty stats
        setStats({
          totalUsers: 0,
          pendingKyc: 0,
          activeTransactions: 0,
          openDisputes: 0,
          escrowBalance: 0,
          totalVolume30d: 0,
          feesCollected30d: 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const STATS = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending KYC', value: stats.pendingKyc.toString(), icon: AlertTriangle, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Active Transactions', value: stats.activeTransactions.toString(), icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Open Disputes', value: stats.openDisputes.toString(), icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">CardVault Platform Management</p>
      </div>

      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Loading stats...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 px-4">
            {STATS.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Info */}
          {stats.totalUsers === 0 && (
            <div className="mx-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 font-medium">Welcome to the Admin Dashboard</p>
              <p className="text-xs text-blue-700 mt-1">
                Start by reviewing pending KYC applications in the KYC Management section.
              </p>
            </div>
          )}
        </>
      )}

      {/* Admin Menu */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Management</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {ADMIN_MENU.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <item.icon size={18} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
