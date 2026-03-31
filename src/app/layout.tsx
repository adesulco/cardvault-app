import type { Metadata, Viewport } from 'next';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';

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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
