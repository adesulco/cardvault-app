import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';
import Providers from '@/components/Providers';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'CardVault - Secure Trading Card Marketplace',
  description: 'Trade with confidence. Your cards, your money — protected. Buy, sell, and trade collectible cards with escrow protection.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-gray-100 text-slate-900 antialiased ${jakarta.className}`}>
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl overflow-x-hidden border-l border-r border-gray-200">
           <Providers>
              <LayoutShell>{children}</LayoutShell>
           </Providers>
        </div>
      </body>
    </html>
  );
}
