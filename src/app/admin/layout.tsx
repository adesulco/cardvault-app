'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, ShieldCheck, ArrowLeftRight,
  AlertTriangle, LogOut, Menu, X, Package, MessageSquare,
  DollarSign, Settings, ScrollText, Image as ImageIcon, Star
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

interface AdminUser {
  id: string;
  email: string;
}

interface BadgeCounts {
  pendingKyc: number;
  openDisputes: number;
  pendingTransactions: number;
}

const AdminContext = createContext<{ user: AdminUser | null }>({ user: null });
export const useAdmin = () => useContext(AdminContext);

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/kyc', label: 'KYC Approvals', icon: ShieldCheck, badge: 'pendingKyc' },
  { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight, badge: 'pendingTransactions' },
  { href: '/admin/listings', label: 'Listings', icon: Package },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle, badge: 'openDisputes' },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/financials', label: 'Financials', icon: DollarSign },
  { href: '/admin/banners', label: 'Promo Banners', icon: ImageIcon },
  { href: '/admin/featured', label: 'Featured Rails', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/activity', label: 'Activity Log', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<BadgeCounts>({
    pendingKyc: 0,
    openDisputes: 0,
    pendingTransactions: 0,
  });

  // Skip auth check for the login page
  const isLoginPage = pathname?.includes('/login');

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.replace('/admin/login');
        }
      } catch {
        router.replace('/admin/login');
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [isLoginPage, router]);

  useEffect(() => {
    if (isLoginPage || !user) return;

    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/badges');
        if (res.ok) {
          const data = await res.json();
          setBadges(data);
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user, isLoginPage]);

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.replace('/admin/login');
  };

  // Login page renders without admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <BrandLogo size={48} className="mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminContext.Provider value={{ user }}>
      <div className="min-h-screen bg-slate-100 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
            <BrandLogo size={32} />
            <div>
              <p className="text-sm font-bold">CardVault</p>
              <p className="text-[10px] text-slate-400">Admin Panel</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              const badgeKey = item.badge as keyof BadgeCounts | undefined;
              const badgeCount = badgeKey ? badges[badgeKey] : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-700 p-4 space-y-3">
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
              CVOS v0.82.0 &copy; {new Date().getFullYear()}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar (mobile) */}
          <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
              <Menu size={22} />
            </button>
            <h1 className="text-sm font-bold text-slate-900">Admin Panel</h1>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
