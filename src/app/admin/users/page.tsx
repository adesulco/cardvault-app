'use client';
import { useState, useEffect } from 'react';
import { Search, X, RefreshCw, User, Shield } from 'lucide-react';

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
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
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
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
                  user.kycStatus === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : user.kycStatus === 'REJECTED'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {user.kycStatus}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 ml-10">
                <span>{user.userRole}</span>
                <span>&middot;</span>
                <span>{user.countryCode}</span>
                <span>&middot;</span>
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                {user.lastLogin && (
                  <>
                    <span>&middot;</span>
                    <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
