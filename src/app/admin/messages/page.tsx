'use client';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface Message {
  id: string;
  sender: { id: string; email: string; displayName: string };
  recipient: { id: string; email: string; displayName: string };
  content: string;
  transactionId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchMessages = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', pageNum.toString());
      params.append('limit', '50');

      const res = await fetch(`/api/admin/messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  };

  const truncateContent = (content: string, length = 50) => {
    return content.length > length ? content.substring(0, length) + '...' : content;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500">Monitor messages between users</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => fetchMessages(1)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => {
              setSearch('');
              fetchMessages(1);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && messages.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">From</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">To</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Message</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Transaction</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-xs text-slate-600">{message.sender.displayName || message.sender.email}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{message.recipient.displayName || message.recipient.email}</td>
                    <td className="py-3 px-4 text-xs text-slate-700" title={message.content}>
                      {truncateContent(message.content)}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {message.transactionId ? message.transactionId.slice(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          message.isRead ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {message.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{formatDate(message.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
