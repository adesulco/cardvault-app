'use client';
import Link from 'next/link';
import { ArrowRight, Shield, CheckCircle, Globe, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6 pb-20">
      {/* Hero Banner with BETA Badge */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
            BETA
          </span>
          <span className="text-xs text-blue-100">Limited Access</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-2">
          CardVault Beta
        </h1>
        <p className="text-blue-100 text-sm leading-relaxed mb-4">
          Secure Trading Card Marketplace with Escrow Protection. Buy, sell, and trade collectible cards with confidence.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/auth/register"
            className="bg-white text-blue-700 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors text-center"
          >
            Apply to Join Beta
          </Link>
          <Link
            href="/auth/login"
            className="bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors text-center"
          >
            Already a Member? Login
          </Link>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 px-4">
        {[
          { icon: Lock, label: 'Escrow Protected', color: 'text-green-600 bg-green-50' },
          { icon: CheckCircle, label: 'Verified Sellers', color: 'text-blue-600 bg-blue-50' },
          { icon: Globe, label: 'Indonesia-first', color: 'text-purple-600 bg-purple-50' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${color.split(' ')[1]}`}>
            <Icon size={20} className={color.split(' ')[0]} />
            <span className="text-[10px] font-medium text-gray-700 text-center">{label}</span>
          </div>
        ))}
      </div>

      {/* How Escrow Works */}
      <div className="px-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Place Order', desc: 'Browse verified listings and make an offer' },
            { step: '2', title: 'Secure Escrow', desc: 'Payment held safely during shipping' },
            { step: '3', title: 'Receive & Confirm', desc: 'Verify card, confirm receipt, funds released' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Beta Features</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          {[
            'Secure escrow-protected transactions',
            'Multi-currency support (IDR & USD)',
            'Seller KYC verification',
            'Real-time payment gateways',
            'Dispute resolution system',
            'Seller ratings & reviews',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <span className="text-xs text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">FAQ</h2>
        <div className="space-y-2">
          {[
            { q: 'Is CardVault free to use?', a: 'Yes, registration is free. We charge a small platform fee on sales (3%).' },
            { q: 'Who can I trade with?', a: 'You can trade with verified sellers who have passed our KYC process.' },
            { q: 'How long does shipping take?', a: 'Typically 3-7 days within Indonesia. International varies by carrier.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-900 mb-1">{item.q}</p>
              <p className="text-xs text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 text-center">
        <p className="text-xs text-gray-500">
          CardVault Beta v0.1 - Limited Access
        </p>
        <p className="text-xs text-gray-400 mt-2">
          We're still in beta. Your feedback helps us improve.
        </p>
      </div>
    </div>
  );
}
