'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Users, ShoppingCart, AlertTriangle, DollarSign, Activity, Shield, Globe, Settings, TrendingUp, CreditCard } from 'lucide-react';

const STATS = [
  { label: 'Total Users', value: '1,247', change: '+12%', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Transactions', value: '89', change: '+5%', icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
  { label: 'Open Disputes', value: '3', change: '-2', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  { label: 'Escrow Balance', value: 'Rp 458M', change: '', icon: Shield, color: 'bg-purple-50 text-purple-600' },
  { label: 'Total Volume (30d)', value: 'Rp 2.1B', change: '+18%', icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Fees Collected (30d)', value: 'Rp 126M', change: '+15%', icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
];

const GATEWAYS = [
  { name: 'Midtrans', status: 'healthy', transactions: 156, successRate: '98.7%', volume: 'Rp 890M' },
  { name: 'Xendit', status: 'healthy', transactions: 43, successRate: '97.2%', volume: 'Rp 215M' },
  { name: 'Stripe', status: 'healthy', transactions: 67, successRate: '99.1%', volume: '$42,500' },
  { name: 'PayPal', status: 'degraded', transactions: 12, successRate: '91.7%', volume: '$8,200' },
];

const RECENT_DISPUTES = [
  { id: 'd1', buyer: 'user_42', seller: 'seller_18', reason: 'Not as described', amount: 'Rp 15,000,000', status: 'pending' },
  { id: 'd2', buyer: 'user_105', seller: 'seller_7', reason: 'Wrong item', amount: 'Rp 8,500,000', status: 'pending' },
  { id: 'd3', buyer: 'user_67', seller: 'seller_23', reason: 'Damaged', amount: 'Rp 3,200,000', status: 'pending' },
];

const EXCHANGE_RATE = {
  current: 15850,
  change24h: '+0.3%',
  lastUpdated: '2 minutes ago',
  source: 'Open Exchange Rates',
};

const ADMIN_MENU = [
  { icon: Users, label: 'User Management', href: '/admin/users', desc: 'View, suspend, verify users' },
  { icon: ShoppingCart, label: 'Transactions', href: '/admin/transactions', desc: 'Monitor active escrows' },
  { icon: AlertTriangle, label: 'Disputes', href: '/admin/disputes', desc: 'Resolve buyer/seller disputes' },
  { icon: DollarSign, label: 'Financial Reports', href: '/admin/finance', desc: 'Revenue, payouts, reconciliation' },
  { icon: Activity, label: 'Gateway Health', href: '/admin/gateways', desc: 'Monitor payment gateways' },
  { icon: Globe, label: 'Exchange Rates', href: '/admin/rates', desc: 'Rate history and monitoring' },
  { icon: CreditCard, label: 'Fee Configuration', href: '/admin/fees', desc: 'Adjust platform fees' },
  { icon: Settings, label: 'Platform Settings', href: '/admin/settings', desc: 'App configuration' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-5 pb-8">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">CardVault Platform Management</p>
      </div>

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
                {stat.change && (
                  <span className={`text-[10px] font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Exchange Rate */}
      <div className="mx-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-200">USD/IDR Exchange Rate</p>
            <p className="text-2xl font-bold mt-1">Rp {EXCHANGE_RATE.current.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-green-300">{EXCHANGE_RATE.change24h}</span>
            <p className="text-[10px] text-blue-200 mt-1">Updated {EXCHANGE_RATE.lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Gateway Health */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Gateway Health</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 text-[10px] font-medium text-gray-500">
            <span>Gateway</span><span>Status</span><span>Success</span><span>Volume</span>
          </div>
          {GATEWAYS.map(gw => (
            <div key={gw.name} className="grid grid-cols-4 gap-2 p-3 border-t border-gray-100 text-xs">
              <span className="font-medium text-gray-900">{gw.name}</span>
              <span className={`inline-flex items-center gap-1 ${
                gw.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gw.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {gw.status}
              </span>
              <span className="text-gray-700">{gw.successRate}</span>
              <span className="text-gray-700">{gw.volume}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Disputes */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Recent Disputes</h2>
          <Link href="/admin/disputes" className="text-xs text-blue-600 font-medium">View All</Link>
        </div>
        <div className="space-y-2">
          {RECENT_DISPUTES.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-red-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{d.reason}</p>
                <p className="text-xs text-gray-500">{d.buyer} vs {d.seller} · {d.amount}</p>
              </div>
              <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                Review
              </button>
            </div>
          ))}
        </div>
      </div>

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
