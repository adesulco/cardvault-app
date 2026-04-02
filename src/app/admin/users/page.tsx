'use client';
import { useState, useEffect } from 'react';
import { Search, X, RefreshCw, User, Shield, EllipsisVertical, Trash2, ShieldAlert } from 'lucide-react';

interface UserRecord {
  id: string;
  displayName: string;
  email: string;
  userRole: string;
  kycStatus: string;
  isAdmin: boolean;
  isSuspended: boolean;
  countryCode: string;
  phone?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', displayName: '', password: '', role: 'Admin' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        
        // Quick local evaluation to enable Super Admin UI features visually if they represent themselves
        const selfUser = data.find((u:any) => u.email === 'adesulistioputra@gmail.com');
        if (selfUser && selfUser.role === 'SUPER_ADMIN') setIsSuperAdmin(true);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminProvision = async (e: React.FormEvent) => {
     e.preventDefault();
     const r = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(adminForm)
     });
     if (r.ok) {
        setShowAdminModal(false);
        setAdminForm({email:'', displayName:'', password:'', role:'Admin'});
        fetchUsers();
     } else alert('Failed to provision admin');
  };

  const toggleSuspend = async (id: string) => {
     if(!confirm('Toggle suspension?')) return;
     await fetch('/api/admin/users', { method:'PATCH', body: JSON.stringify({id, action: 'suspend'})});
     fetchUsers();
  };

  const deleteUser = async (id: string) => {
     if(!confirm('Permanently delete this user from database? This ruins active accounting audits.')) return;
     await fetch('/api/admin/users', { method:'PATCH', body: JSON.stringify({id, action: 'delete'})});
     fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search ||
      user.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || user.userRole === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
             <button onClick={() => setShowAdminModal(true)} className="px-3 py-2 text-sm text-white bg-slate-900 font-bold rounded-lg hover:bg-black">
               + Create Admin
             </button>
          )}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={16} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'BUYER', 'SELLER', 'BOTH', 'ADMIN'].map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === role
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {role === 'all' ? 'All' : role}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <p className="text-sm font-medium text-slate-900 mb-1">No users found</p>
          <p className="text-xs text-slate-500">Try a different search or filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    {user.isAdmin ? (
                      <Shield size={14} className="text-blue-600" />
                    ) : (
                      <User size={14} className="text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.displayName || 'Unnamed'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  user.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {user.kycStatus}
                </span>
                
                {/* Actions */}
                {isSuperAdmin && (
                   <div className="flex gap-2 ml-4">
                     <button onClick={() => toggleSuspend(user.id)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-red-600 bg-slate-50 px-2 rounded hover:bg-red-50">
                        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                     </button>
                     <button onClick={() => deleteUser(user.id)} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 rounded hover:bg-red-100">
                        Delete
                     </button>
                   </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 ml-10">
                <span className={`font-bold ${user.userRole === 'BOTH' ? 'text-purple-600' : ''}`}>{user.userRole}</span>
                {user.role && user.role !== 'user' && user.role !== 'ADMIN' && (
                   <span className="font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded uppercase tracking-tighter">[{user.role}]</span>
                )}
                <span>&middot;</span>
                {user.isSuspended && <span className="font-bold text-red-600 tracking-wider">SUSPENDED &middot;</span>}
                <span>{user.countryCode}</span>
                <span>&middot;</span>
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Creation Modal */}
      {showAdminModal && (
         <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <form onSubmit={handleAdminProvision} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg text-slate-900 tracking-tight">Provision Sub-Admin</h2>
                  <button type="button" onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Staff Name</label>
                    <input required value={adminForm.displayName} onChange={e=>setAdminForm({...adminForm, displayName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none focus:border-blue-500" placeholder="e.g. Budi Finance" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Staff Email</label>
                    <input required type="email" value={adminForm.email} onChange={e=>setAdminForm({...adminForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none focus:border-blue-500" placeholder="email@cardvault.id" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Direct Login Password</label>
                    <input required type="password" value={adminForm.password} onChange={e=>setAdminForm({...adminForm, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none focus:border-blue-500" placeholder="Requires native un-oauth fallback..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Specific Role Title</label>
                    <input required value={adminForm.role} onChange={e=>setAdminForm({...adminForm, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none focus:border-blue-500" placeholder="e.g. Finance Moderator" />
                  </div>
               </div>
               <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-6">Authorize Provision</button>
            </form>
         </div>
      )}
    </div>
  );
}
