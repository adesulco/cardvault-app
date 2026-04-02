'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, KeySquare, HelpCircle, Save } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    marketing: false,
    offers: true,
    messages: true,
    payouts: true
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => {
    alert('Notification preferences updated successfully!');
    router.back();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      <header className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
      </header>

      <div className="px-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-900 text-sm">
          <Bell className="shrink-0 text-blue-600" />
          Customize exactly which alerts push to your phone or get dispatched to your email inbox!
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Escrow & Trading</h3>
          <div className="bg-white border text-sm font-semibold border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="text-gray-900 text-sm">New Trade Offers</p>
                <p className="text-xs font-normal text-gray-500">Alert me when a user counters my card</p>
              </div>
              <input type="checkbox" checked={prefs.offers} onChange={() => togglePref('offers')} className="h-4 w-4 text-blue-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="text-gray-900 text-sm">Direct Messages</p>
                <p className="text-xs font-normal text-gray-500">Emails when buyers ask questions</p>
              </div>
              <input type="checkbox" checked={prefs.messages} onChange={() => togglePref('messages')} className="h-4 w-4 text-blue-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="text-gray-900 text-sm">Payout Status</p>
                <p className="text-xs font-normal text-gray-500">Alert me when cash clears Escrow</p>
              </div>
              <input type="checkbox" checked={prefs.payouts} onChange={() => togglePref('payouts')} className="h-4 w-4 text-blue-600 rounded" />
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2">Marketing</h3>
          <div className="bg-white border text-sm font-semibold border-gray-200 rounded-xl overflow-hidden">
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
              <div>
                <p className="text-gray-900 text-sm">Promotional Emails</p>
                <p className="text-xs font-normal text-gray-500">TCG Drops, curated lists, insights</p>
              </div>
              <input type="checkbox" checked={prefs.marketing} onChange={() => togglePref('marketing')} className="h-4 w-4 text-blue-600 rounded" />
            </label>
          </div>
        </div>

        <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
          <Save size={18} /> Apply Preferences
        </button>
      </div>
    </div>
  );
}
