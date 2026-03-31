import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AdminRouteDetector from '@/components/AdminRouteDetector';

export const metadata: Metadata = {
  title: 'CardVault - Secure Trading Card Marketplace',
  description: 'Trade with confidence. Your cards, your money — protected. Buy, sell, and trade collectible cards with escrow protection.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563EB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
        <AdminRouteDetector>
          {(isAdmin) => isAdmin ? (
            // Admin pages render without Header/BottomNav — admin layout handles its own shell
            <>{children}</>
          ) : (
            // Consumer pages get the normal mobile shell
            <>
              <Header />
              <main className="pt-14 pb-20 min-h-screen max-w-lg mx-auto">
                {children}
              </main>
              <BottomNav />
            </>
          )}
        </AdminRouteDetector>
      </body>
    </html>
  );
}
