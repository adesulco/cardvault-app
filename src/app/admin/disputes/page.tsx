'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';

interface Dispute {
  id: string;
  transactionId: string;
  transaction: { id: string; agreedPriceIdr: number };
  openedBy: { id: string; email: string; displayName: string };
  reason: string;
  description: string;
  evidenceUrls: string;
  resolution: string;
  refundAmountIdr: number;
  resolutionNotes: string;
  createdAt: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<Record<string, string>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [refundAmount, setRefundAmount] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/disputes');
      if (res.ok) {
        const data = await res.json();
        setDisputes(data);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (disputeId: string) => {
    const resolution = selectedResolution[disputeId];
    if (!resolution) {
      alert('Please select a resolution');
      return;
    }

    setResolving(disputeId);
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: disputeId,
          resolution,
          resolutionNotes: resolutionNotes[disputeId] || null,
          refundAmountIdr: refundAmount[disputeId] ? parseFloat(refundAmount[disputeId]) : null,
        }),
      });

      if (res.ok) {
        fetchDisputes();
        setSelectedResolution((prev) => {
          const next = { ...prev };
          delete next[disputeId];
          return next;
        });
        setResolutionNotes((prev) => {
          const next = { ...prev };
          delete next[disputeId];
          return next;
        });
        setRefundAmount((prev) => {
          const next = { ...prev };
          delete next[disputeId];
          return next;
        });
        setExpandedId(null);
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      alert('Failed to resolve dispute');
    } finally {
      setResolving(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const getResolutionColor = (resolution: string) => {
    switch (resolution) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refund_buyer':
        return 'bg-red-100 text-red-800';
      case 'release_seller':
        return 'bg-emerald-100 text-emerald-800';
      case 'partial_refund':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <p className="text-sm text-slate-500">Manage and resolve buyer-seller disputes</p>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-900 mb-1">No open disputes</p>
            <p className="text-xs text-slate-500">Disputes will appear here when buyers or sellers report issues</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Trans ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Opened By</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Reason</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase">Date</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {disputes.map((dispute) => (
                    <tbody key={dispute.id}>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-xs font-mono text-slate-600">{dispute.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-600">{dispute.transactionId.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-xs text-slate-600">{dispute.openedBy.displayName || dispute.openedBy.email}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 capitalize">{dispute.reason.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getResolutionColor(dispute.resolution)}`}>
                            {dispute.resolution}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">{formatDate(dispute.createdAt)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setExpandedId(expandedId === dispute.id ? null : dispute.id)}
                            className="inline-flex items-center justify-center p-1 hover:bg-slate-200 rounded"
                          >
                            <ChevronDown size={16} className={`transition-transform ${expandedId === dispute.id ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedId === dispute.id && dispute.resolution === 'pending' && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-medium text-slate-700">Description</label>
                                  <p className="mt-1 text-sm text-slate-600">{dispute.description || 'No description provided'}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-700">Transaction Amount</label>
                                  <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(dispute.transaction.agreedPriceIdr)}</p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-200 space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-slate-700">Resolution</label>
                                  <select
                                    value={selectedResolution[dispute.id] || ''}
                                    onChange={(e) =>
                                      setSelectedResolution((prev) => ({
                                        ...prev,
                                        [dispute.id]: e.target.value,
                                      }))
                                    }
                                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select resolution...</option>
                                    <option value="refund_buyer">Refund Buyer</option>
                                    <option value="release_seller">Release to Seller</option>
                                    <option value="partial_refund">Partial Refund</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>

                                {selectedResolution[dispute.id] === 'partial_refund' && (
                                  <div>
                                    <label className="text-xs font-medium text-slate-700">Refund Amount (IDR)</label>
                                    <input
                                      type="number"
                                      value={refundAmount[dispute.id] || ''}
                                      onChange={(e) =>
                                        setRefundAmount((prev) => ({
                                          ...prev,
                                          [dispute.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="Enter refund amount"
                                      className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                )}

                                <div>
                                  <label className="text-xs font-medium text-slate-700">Resolution Notes</label>
                                  <textarea
                                    value={resolutionNotes[dispute.id] || ''}
                                    onChange={(e) =>
                                      setResolutionNotes((prev) => ({
                                        ...prev,
                                        [dispute.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Add resolution notes..."
                                    className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                  <button
                                    onClick={() => setExpandedId(null)}
                                    className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleResolveDispute(dispute.id)}
                                    disabled={resolving === dispute.id || !selectedResolution[dispute.id]}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {resolving === dispute.id ? 'Resolving...' : 'Resolve Dispute'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expanded Details - Resolved */}
                      {expandedId === dispute.id && dispute.resolution !== 'pending' && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={7} className="p-4">
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium text-slate-700">Description</label>
                                <p className="mt-1 text-sm text-slate-600">{dispute.description || 'No description'}</p>
                              </div>
                              {dispute.resolutionNotes && (
                                <div>
                                  <label className="text-xs font-medium text-slate-700">Resolution Notes</label>
                                  <p className="mt-1 text-sm text-slate-600">{dispute.resolutionNotes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
