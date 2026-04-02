'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw, Eye, EyeOff, Save, X } from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    linkUrl: '',
    altText: '',
    sortOrder: 0,
    isActive: true
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = { ...formData, ...(editingId ? { id: editingId } : {}) };

      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setShowModal(false);
        fetchBanners();
      } else {
        alert('Failed to save banner');
      }
    } catch (error) {
      alert('Error saving banner');
    }
  };

  const handleToggleActive = async (banner: any) => {
    await fetch('/api/admin/banners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: banner.id, isActive: !banner.isActive })
    });
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    await fetch('/api/admin/banners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'delete' })
    });
    fetchBanners();
  };

  const openEdit = (banner: any) => {
    setEditingId(banner.id);
    setFormData({
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      altText: banner.altText || '',
      sortOrder: banner.sortOrder,
      isActive: banner.isActive
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ imageUrl: '', linkUrl: '', altText: '', sortOrder: 0, isActive: true });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Promo Banners</h1>
          <p className="text-sm text-gray-500">Manage homepage marketing carousels</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchBanners} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            <Plus size={16} /> New Banner
          </button>
        </div>
      </div>

      {loading && banners.length === 0 ? (
        <p className="text-sm text-gray-500">Loading banners...</p>
      ) : (
        <div className="bg-white border text-sm border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Preview</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Link</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map(banner => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageUrl} alt={banner.altText || 'Banner'} className="h-12 w-24 object-cover rounded border" />
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono">{banner.sortOrder}</td>
                  <td className="px-4 py-3 text-blue-600">{banner.linkUrl ? <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="hover:underline">Link</a> : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(banner)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {banner.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {banner.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(banner)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No promo banners configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">{editingId ? 'Edit Banner' : 'Create Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL *</label>
                <input required type="url" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg tex-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Link URL</label>
                <input type="url" value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg tex-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alt Text</label>
                <input type="text" value={formData.altText} onChange={e => setFormData({ ...formData, altText: e.target.value })} className="w-full px-3 py-2 border rounded-lg tex-sm" placeholder="Promo description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sort Priority</label>
                  <input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg tex-sm" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Is Active</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                  <Save size={16} /> Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
