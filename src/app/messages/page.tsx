'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const CONVERSATIONS = [
  {
    id: 'c1', user: 'TokyoCards', avatar: 'T', lastMessage: 'I\'ll ship it today!',
    time: '2m ago', unread: 2, transactionRef: 'Charizard VMAX',
  },
  {
    id: 'c2', user: 'HoopFan88', avatar: 'H', lastMessage: 'Is the card still available?',
    time: '1h ago', unread: 0, transactionRef: 'Luka Doncic Prizm',
  },
  {
    id: 'c3', user: 'PKMNCollector', avatar: 'P', lastMessage: 'Thanks for the trade!',
    time: '2d ago', unread: 0, transactionRef: null,
  },
];

export default function MessagesPage() {
  const [search, setSearch] = useState('');

  const filtered = CONVERSATIONS.filter(c =>
    !search || c.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
      </div>

      <div className="px-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.map(conv => (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {conv.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{conv.user}</p>
                <span className="text-[10px] text-gray-400">{conv.time}</span>
              </div>
              {conv.transactionRef && (
                <p className="text-[10px] text-blue-600 font-medium">{conv.transactionRef}</p>
              )}
              <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
            </div>
            {conv.unread > 0 && (
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-white font-bold">{conv.unread}</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm text-gray-500">No conversations yet</p>
        </div>
      )}
    </div>
  );
}
