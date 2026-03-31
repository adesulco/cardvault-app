'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin pages render without Header/BottomNav — admin layout handles its own shell
    return <>{children}</>;
  }

  // Consumer pages get the normal mobile shell
  return (
    <>
      <Header />
      <main className="pt-14 pb-20 min-h-screen max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
