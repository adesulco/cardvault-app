'use client';
import { useEffect } from 'react';
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

  useEffect(() => {
    const isPublic = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/gate');
    if (!user && !isPublic && !isAdmin && !isGate) {
      router.replace('/');
    }
  }, [user, pathname, isAdmin, isGate, router]);

  useEffect(() => {
    // Initialize Offline Capabilities (PWA)
    if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js').catch(err => console.error('PWA Worker rejected', err));
    }
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
      fetch(`/api/auth/me?userId=${currentUser.id}`)
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
    <>
      <Header />
      <main className="pt-14 pb-20 min-h-screen max-w-lg mx-auto">
        {children}
      </main>
      {user && <BottomNav />}
    </>
  );
}
