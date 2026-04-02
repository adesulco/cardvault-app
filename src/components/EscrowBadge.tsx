'use client';
import { Shield, CheckCircle, Clock, Truck, Eye, AlertTriangle, XCircle } from 'lucide-react';
import type { EscrowStatus } from '@/lib/types';

const statusConfig: Record<EscrowStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  pending_payment: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Awaiting Vault Funding' },
  payment_held: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Shield, label: 'Payment Held in CardVault' },
  awaiting_shipment: { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Truck, label: 'Awaiting Shipment' },
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
    <div className="flex-1 w-full flex flex-col items-center justify-center text-center">
      <Shield size={24} className="text-green-500 mb-2 drop-shadow-sm" />
      <p className="text-xs font-semibold text-green-800">CardVault Protected</p>
      <p className="text-[10px] text-green-700 mt-1 max-w-[200px] font-medium leading-tight">
        Payments held safely until item is strictly verified via unboxing videos.
      </p>
    </div>
  );
}
