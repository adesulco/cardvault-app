import { create } from 'zustand';

interface AppState {
  preferredCurrency: 'IDR' | 'USD';
  exchangeRate: number;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: string;
    countryCode: string;
    preferredCurrency: 'IDR' | 'USD';
  } | null;

  setCurrency: (currency: 'IDR' | 'USD') => void;
  setExchangeRate: (rate: number) => void;
  setUser: (user: AppState['user']) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  preferredCurrency: 'IDR',
  exchangeRate: 15850,
  user: null,

  setCurrency: (currency) => set({ preferredCurrency: currency }),
  setExchangeRate: (rate) => set({ exchangeRate: rate }),
  setUser: (user) => set({ user, preferredCurrency: user?.preferredCurrency || 'IDR' }),
  logout: () => set({ user: null }),
}));
