'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';

function OAuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    // If NextAuth has successfully validated a session (e.g., via Google OAuth) but our local Zustand store is empty
    if (status === 'authenticated' && session?.user && !user) {
      const payload = {
         id: (session.user as any).id,
         email: session.user.email || '',
         displayName: (session.user as any).displayName || session.user.name || '',
         avatarUrl: (session.user as any).avatarUrl || session.user.image || '',
         role: (session.user as any).role || 'BUYER',
         kycStatus: (session.user as any).kycStatus || 'UNVERIFIED',
         countryCode: 'ID',
         preferredCurrency: 'IDR' as 'IDR'
      };
      
      setUser(payload as any);
      localStorage.setItem('cardvault_user', JSON.stringify(payload));
    }
    // Optional: if unauthenticated, we could wipe Zustand, but allowing manual fallback is safer right now
  }, [session, status, user, setUser]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OAuthSync>{children}</OAuthSync>
    </SessionProvider>
  );
}
