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
  setUser: (user: AppState['user']) => void;
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
      setUser: (user) => set({ user, preferredCurrency: user?.preferredCurrency || 'IDR' }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'cardvault-auth-storage',
    }
  )
);
