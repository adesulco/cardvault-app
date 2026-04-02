'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, ChevronRight, Shield, Star, CreditCard, Bell, HelpCircle, LogOut, Package, Heart, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import TierBadge from '@/components/TierBadge';

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
  const { user, logout } = useAppStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ cardsOwned: 0, watchlistCount: 0, totalTransactions: 0 });

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      fetch(`/api/profile/stats?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('cardvault_user');
    router.push('/auth/login');
  };

  if (!mounted) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const profile = user as any;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Logged In</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Please sign in to view your profile
        </p>
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {profile.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-gray-900">{profile.displayName}</h1>
                {profile.kycStatus === 'APPROVED' && (
                  <Shield size={16} className="text-blue-600 fill-blue-100" />
                )}
                <TierBadge totalTransactions={profile.totalTransactions || 0} trustScore={profile.trustScore || 0} />
              </div>
              <p className="text-xs text-gray-500">{profile.location || 'Location not set'}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{profile.trustScore || '0'}</span>
                </div>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{profile.totalTransactions || '0'} trades</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{stats.cardsOwned}</p>
              <p className="text-[10px] text-gray-500">Cards</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-[10px] text-gray-500">Trades</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{profile.totalValue || 'Rp 0'}</p>
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
          {MENU_ITEMS.map(item => {
            let actualBadge = item.badge;
            if (item.label === 'My Collection') actualBadge = stats.cardsOwned.toString();
            if (item.label === 'Watchlist') actualBadge = stats.watchlistCount > 0 ? stats.watchlistCount.toString() : null;
            if (item.label === 'Transactions') actualBadge = stats.totalTransactions > 0 ? stats.totalTransactions.toString() : null;
            if (item.label === 'KYC Verification') actualBadge = profile.kycStatus === 'APPROVED' ? 'Verified' : 'Pending';

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
               >
                <item.icon size={20} className="text-gray-500" />
                <span className="flex-1 text-sm text-gray-900">{item.label}</span>
                {actualBadge && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    actualBadge === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {actualBadge}
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
