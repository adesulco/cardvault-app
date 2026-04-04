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



  if (isAdmin) {
    // Admin structures remain globally unrestrained physically
    return <>{children}</>;
  }

  const isMarketingLanding = pathname === '/';
  const isAuthRoute = pathname.startsWith('/auth');

  if (isGate || isMarketingLanding || isAuthRoute || !user) {
    // Consumer unauthenticated boundaries get strictly boxed into the mobile container seamlessly but without Header/BottomNav
    return (
      <div className="max-w-md mx-auto h-[100dvh] overflow-y-auto bg-slate-50 relative shadow-2xl overflow-x-hidden border-l border-r border-gray-200">
        <main className="w-full h-full relative">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    );
  }

  // Consumer authenticated marketplace pages get the normal mobile shell globally
  return (
    <div className="max-w-md mx-auto h-[100dvh] overflow-y-auto bg-slate-50 relative shadow-2xl overflow-x-hidden border-l border-r border-gray-200">
      <Header />
      <main className="pt-14 pb-20 relative">
        <div className="w-full h-full">{children}</div>
      </main>
      {user && <BottomNav />}
    </div>
  );
}
