'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isGate = pathname.startsWith('/gate');
  const user = useAppStore((state) => state.user);
  const { setExchangeRate } = useAppStore();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    const isPublic = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/gate');
    if (!user && !isPublic && !isAdmin && !isGate) {
      router.replace('/');
    }
  }, [user, pathname, isAdmin, isGate, router, hydrated]);

  useEffect(() => {
    // Service Worker currently deferred
  }, []);

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) setExchangeRate(data.rate);
      })
      .catch(console.error);
  }, [setExchangeRate]);

  useEffect(() => {
    // Dynamic Re-hydration: Pull active Postgres state to overwrite stale LocalStorage sessions
    const currentUser = useAppStore.getState().user;
    if (currentUser?.id) {
      fetch(`/api/auth/me`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            useAppStore.setState({ user: data.user });
          }
        })
        .catch(console.error);
    }
  }, []);

  const isLandingAnonymous = pathname === '/' && !user;

  const isPublicRoute = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/gate');
  if (!user && !isPublicRoute && !isAdmin && !isGate) {
    return <div className="min-h-screen bg-slate-50" />; // Prevent flash of unauthorized content
  }

  if (isAdmin || isGate || isLandingAnonymous) {
    // Admin pages and Anonymous Landing render without Header/BottomNav
    return <>{children}</>;
  }

  // Consumer pages get the normal mobile shell
  return (
    <div className="max-w-md mx-auto h-[100dvh] overflow-y-auto bg-slate-50 relative shadow-2xl overflow-x-hidden border-l border-r border-gray-200">
      <Header />
      <main className="pt-14 pb-20 relative">
        {/* Version stamp */}
        <div className="absolute top-0 right-4 pt-1 flex items-center justify-end pointer-events-none">
           <span className="text-[9px] font-bold text-gray-300 pointer-events-auto bg-white/50 px-1 rounded">v0.9.0</span>
        </div>
        <div className="w-full h-full">{children}</div>
        <div className="text-center pb-8 pt-4 text-[10px] text-slate-400 font-mono tracking-widest uppercase shrink-0" aria-hidden="true">
           <p>CardVault Build v0.9.0</p>
        </div>
      </main>
      {user && <BottomNav />}
    </div>
  );
}
