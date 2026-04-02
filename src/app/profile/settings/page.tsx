'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user } = useAppStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    phone: ''
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
            displayName: data.user.displayName || '',
            bio: data.user.bio || '',
            location: data.user.location || '',
            phone: data.user.phone || ''
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
      if (res.ok) alert('Profile updated securely.');
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
        <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
      </header>

      {loading ? (
        <div className="p-12 flex justify-center text-blue-600"><Loader2 className="animate-spin" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 bg-white" placeholder="Store Name or Username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 bg-white" placeholder="City, Country" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Secure)</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 bg-white" placeholder="+62..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store / Profile Bio</label>
            <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 bg-white" placeholder="Let buyers know your specialty..." />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={saving} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50">
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Apply Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
