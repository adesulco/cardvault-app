'use client';
import { Check } from 'lucide-react';
import type { EscrowStatus } from '@/lib/types';

const steps: { key: EscrowStatus[]; label: string }[] = [
  { key: ['pending_payment'], label: 'Payment' },
  { key: ['payment_held', 'awaiting_shipment'], label: 'Escrow' },
  { key: ['shipped'], label: 'Shipped' },
  { key: ['delivered', 'under_inspection'], label: 'Inspection' },
  { key: ['completed', 'auto_completed'], label: 'Complete' },
];

function getStepIndex(status: EscrowStatus): number {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].key.includes(status)) return i;
  }
  return 0;
}

export default function TransactionProgress({ status }: { status: EscrowStatus }) {
  const currentIndex = getStepIndex(status);
  const isDisputed = status === 'disputed';
  const isRefunded = status === 'refunded';

  if (isDisputed || isRefunded) {
    return (
      <div className={`text-center py-3 px-4 rounded-xl text-sm font-medium ${
        isDisputed ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
      }`}>
        {isDisputed ? '⚠️ Transaction Disputed' : '↩️ Transaction Refunded'}
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isComplete
                  ? 'bg-blue-600 text-white'
                  : isCurrent
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {isComplete ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium ${
                isCurrent ? 'text-blue-600' : isComplete ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
