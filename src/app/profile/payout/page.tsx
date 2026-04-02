'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, CreditCard } from 'lucide-react';

const PAYOUT_METHODS = [
  { id: 'midtrans', label: 'Midtrans Virtual Account / E-Wallet' },
  { id: 'bank_transfer', label: 'Direct Bank Transfer' },
  { id: 'gopay', label: 'GoPay Direct' },
  { id: 'qris', label: 'QRIS Settlement' }
];

export default function PayoutSettingsPage() {
  const { user } = useAppStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    payoutMethod: '',
    payoutAccountId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFormData({
            payoutMethod: data.user.payoutMethod || '',
            payoutAccountId: data.user.payoutAccountId || ''
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...formData })
      });
      if (res.ok) alert('Payout configuration secured.');
    } catch {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      <header className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Payout Settings</h1>
      </header>

      {loading ? (
        <div className="p-12 flex justify-center text-blue-600"><Loader2 className="animate-spin" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
            <CreditCard className="text-blue-600 shrink-0" />
            <p className="text-sm text-blue-900">When you actively sell an item through CardVault Escrow, this is where your cleared funds will be seamlessly deposited!</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payout Gateway</label>
            <select 
              value={formData.payoutMethod} 
              onChange={e => setFormData({...formData, payoutMethod: e.target.value})} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 bg-white"
            >
              <option value="">Select Gateway</option>
              {PAYOUT_METHODS.map(method => (
                <option key={method.id} value={method.id}>{method.label}</option>
              ))}
            </select>
          </div>

          {formData.payoutMethod && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account ID / Number 
                <span className="text-xs text-gray-400 ml-2">(e.g. BCA 12345678)</span>
              </label>
              <input type="text" value={formData.payoutAccountId} onChange={e => setFormData({...formData, payoutAccountId: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 bg-white font-mono" placeholder="Enter routing or wallet ID" />
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={saving || !formData.payoutMethod || !formData.payoutAccountId} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50">
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Secure Processor Link
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
