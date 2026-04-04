import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';
import Providers from '@/components/Providers';
import { GoogleAnalytics } from '@next/third-parties/google';
import { WebVitals } from '@/components/WebVitals';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';

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
     const getGaId = unstable_cache(async () => {
        const config = await prisma.platformConfig.findUnique({ where: { configKey: 'google_analytics_id' } });
        return config?.configValue || null;
     }, ['global-ga-id'], { revalidate: 3600 });
     gaId = await getGaId();
  } catch(e) {}

  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <html lang="en">
      <body className={`bg-gray-100 text-slate-900 antialiased ${jakarta.className}`}>
         <Providers>
            <LayoutShell>{children}</LayoutShell>
         </Providers>
         <WebVitals />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
