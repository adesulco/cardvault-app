'use client';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface User {
  id: string;
  displayName: string;
  email: string;
  userRole: string;
  kycStatus: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/admin/users?search=${search}&role=${filter}`);
        // const data = await response.json();
        // setUsers(data);

        setUsers([]);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search, filter]);

  return (
    <div className="space-y-4 pb-12">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">Manage all platform users</p>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 flex gap-2 overflow-x-auto">
        {['all', 'BUYER', 'SELLER', 'ADMIN'].map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === role
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {role === 'all' ? 'All' : role}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">No users</p>
          <p className="text-xs text-gray-500">No users match your search</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                  user.kycStatus === 'APPROVED'
                    ? 'bg-green-50 text-green-700'
                    : user.kycStatus === 'REJECTED'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {user.kycStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500">{user.userRole} • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
