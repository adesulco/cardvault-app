'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Header() {
  const { preferredCurrency, setCurrency, user } = useAppStore();
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CV</span>
          </div>
          <span className="font-bold text-lg text-gray-900">CardVault</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {preferredCurrency === 'IDR' ? 'Rp' : '$'}
              <span className="text-xs">{preferredCurrency}</span>
              <ChevronDown size={14} />
            </button>
            {showCurrencyMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCurrencyMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                  <button
                    onClick={() => { setCurrency('IDR'); setShowCurrencyMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      preferredCurrency === 'IDR' ? 'text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base">🇮🇩</span> IDR (Rp)
                  </button>
                  <button
                    onClick={() => { setCurrency('USD'); setShowCurrencyMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                      preferredCurrency === 'USD' ? 'text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base">🇺🇸</span> USD ($)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </div>
      </div>
    </header>
  );
}
