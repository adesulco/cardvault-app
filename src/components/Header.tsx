'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import BrandLogo from '@/components/BrandLogo';

export default function Header() {
  const { preferredCurrency, setCurrency, user } = useAppStore();
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={32} />
          <span className="font-bold text-lg text-brand-gradient">CardVault</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {preferredCurrency === 'IDR' ? 'Rp' : '$'}
              <span className="text-xs">{preferredCurrency}</span>
              <ChevronDown size={14} />
            </button>
            {showCurrencyMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCurrencyMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 min-w-[120px]">
                  <button
                    onClick={() => { setCurrency('IDR'); setShowCurrencyMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                      preferredCurrency === 'IDR' ? 'text-blue-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-base">🇮🇩</span> IDR (Rp)
                  </button>
                  <button
                    onClick={() => { setCurrency('USD'); setShowCurrencyMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                      preferredCurrency === 'USD' ? 'text-blue-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-base">🇺🇸</span> USD ($)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <Link href="/notifications" className="relative p-2 text-slate-600 hover:text-slate-900">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </div>
      </div>
    </header>
  );
}
