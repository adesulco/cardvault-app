import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  preferredCurrency: 'IDR' | 'USD';
  exchangeRate: number;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: string;
    kycStatus: string;
    countryCode: string;
    preferredCurrency: 'IDR' | 'USD';
  } | null;

  setCurrency: (currency: 'IDR' | 'USD') => void;
  setExchangeRate: (rate: number) => void;
  setUser: (user: Omit<AppState['user'], 'role'> & { role?: string } | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      preferredCurrency: 'IDR',
      exchangeRate: 15850,
      user: null,

      setCurrency: (currency) => set({ preferredCurrency: currency }),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      setUser: (user) => {
        if (typeof window !== 'undefined') localStorage.removeItem('cv_session'); // Purge old tokens
        if (!user) return set({ user: null });
        const safeUser = { ...user } as any;
        delete safeUser.role; // Strip role from client storage as per V12-002
        delete safeUser.isAdmin;
        delete safeUser.userRole;
        set({ user: safeUser, preferredCurrency: safeUser?.preferredCurrency || 'IDR' });
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'cardvault-auth-storage',
    }
  )
);
