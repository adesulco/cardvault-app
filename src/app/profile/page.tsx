'use client';
import Link from 'next/link';
import { Settings, ChevronRight, Shield, Star, CreditCard, Bell, HelpCircle, LogOut, Package, Heart, BarChart3 } from 'lucide-react';

const PROFILE = {
  displayName: 'CardCollector',
  email: 'collector@email.com',
  location: 'Jakarta, Indonesia',
  kycStatus: 'verified',
  trustScore: 4.8,
  totalTransactions: 42,
  memberSince: 'Jan 2026',
  cardsOwned: 15,
  totalValue: 'Rp 175,000,000',
};

const MENU_ITEMS = [
  { icon: Package, label: 'My Collection', href: '/cards', badge: '15' },
  { icon: Heart, label: 'Watchlist', href: '/watchlist', badge: '3' },
  { icon: BarChart3, label: 'Transactions', href: '/transactions', badge: null },
  { icon: CreditCard, label: 'Payout Settings', href: '/profile/payout', badge: null },
  { icon: Bell, label: 'Notification Preferences', href: '/profile/notifications', badge: null },
  { icon: Shield, label: 'KYC Verification', href: '/profile/kyc', badge: 'Verified' },
  { icon: Settings, label: 'Account Settings', href: '/profile/settings', badge: null },
  { icon: HelpCircle, label: 'Help & Support', href: '/help', badge: null },
];

export default function ProfilePage() {
  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {PROFILE.displayName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-gray-900">{PROFILE.displayName}</h1>
                {PROFILE.kycStatus === 'verified' && (
                  <Shield size={16} className="text-blue-600 fill-blue-100" />
                )}
              </div>
              <p className="text-xs text-gray-500">{PROFILE.location} · Member since {PROFILE.memberSince}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{PROFILE.trustScore}</span>
                </div>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{PROFILE.totalTransactions} trades</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{PROFILE.cardsOwned}</p>
              <p className="text-[10px] text-gray-500">Cards</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{PROFILE.totalTransactions}</p>
              <p className="text-[10px] text-gray-500">Trades</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{PROFILE.totalValue}</p>
              <p className="text-[10px] text-gray-500">Collection Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['Verified Trader', 'Power Seller', '40+ Trades'].map(badge => (
            <div key={badge} className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {MENU_ITEMS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <item.icon size={20} className="text-gray-500" />
              <span className="flex-1 text-sm text-gray-900">{item.label}</span>
              {item.badge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.badge === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4">
        <button className="w-full flex items-center justify-center gap-2 py-3 text-red-600 text-sm font-medium">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
