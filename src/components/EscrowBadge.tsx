'use client';
import { Shield, CheckCircle, Clock, Truck, Eye, AlertTriangle, XCircle } from 'lucide-react';
import type { EscrowStatus } from '@/lib/types';

const statusConfig: Record<EscrowStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  pending_payment: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock, label: 'Pending Payment' },
  payment_held: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Shield, label: 'Payment Held in Escrow' },
  awaiting_shipment: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: Clock, label: 'Awaiting Shipment' },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Truck, label: 'Shipped' },
  delivered: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Eye, label: 'Delivered' },
  under_inspection: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Eye, label: 'Under Inspection' },
  completed: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle, label: 'Completed' },
  disputed: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertTriangle, label: 'Disputed' },
  refunded: { color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: XCircle, label: 'Refunded' },
  auto_completed: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle, label: 'Auto-Completed' },
};

export default function EscrowBadge({ status }: { status: EscrowStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </div>
  );
}

export function EscrowProtectionBanner() {
  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
      <Shield size={20} className="text-green-600 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-green-800">Escrow Protected</p>
        <p className="text-[10px] text-green-600">
          Your payment is held securely until you confirm receipt and satisfaction.
        </p>
      </div>
    </div>
  );
}
