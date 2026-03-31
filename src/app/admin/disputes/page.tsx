'use client';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AdminDisputesPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Disputes</h1>
        <p className="text-sm text-slate-500">Resolve buyer and seller disputes</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
        <AlertTriangle size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-900 mb-1">No open disputes</p>
        <p className="text-xs text-slate-500">Disputes will appear here when buyers or sellers report issues with transactions</p>
      </div>
    </div>
  );
}
