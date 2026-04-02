import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';
import Providers from '@/components/Providers';
import { GoogleAnalytics } from '@next/third-parties/google';
import prisma from '@/lib/prisma';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'CardVault - Secure Trading Card Marketplace',
  description: 'Trade with confidence. Your cards, your money — protected. Buy, sell, and trade collectible cards with absolute vault protection.',
  manifest: '/manifest.json',
  openGraph: {
    images: [{ url: '/logo.svg' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let gaId = null;
  try {
     const config = await prisma.platformConfig.findUnique({ where: { configKey: 'google_analytics_id' } });
     if (config && config.configValue) gaId = config.configValue;
  } catch(e) {}

  return (
    <html lang="en">
      <body className={`bg-gray-100 text-slate-900 antialiased ${jakarta.className}`}>
         <Providers>
            <LayoutShell>{children}</LayoutShell>
         </Providers>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
