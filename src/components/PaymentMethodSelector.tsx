'use client';
import { useState } from 'react';
import { CreditCard, Smartphone, Building2, QrCode, Store } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  gateway: string;
}

const indonesianMethods: PaymentMethod[] = [
  { id: 'gopay', name: 'GoPay', icon: Smartphone, description: 'Pay with GoPay e-wallet', gateway: 'midtrans' },
  { id: 'ovo', name: 'OVO', icon: Smartphone, description: 'Pay with OVO e-wallet', gateway: 'midtrans' },
  { id: 'dana', name: 'DANA', icon: Smartphone, description: 'Pay with DANA e-wallet', gateway: 'midtrans' },
  { id: 'shopeepay', name: 'ShopeePay', icon: Smartphone, description: 'Pay with ShopeePay', gateway: 'midtrans' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, description: 'BCA, BNI, BRI, Mandiri', gateway: 'midtrans' },
  { id: 'qris', name: 'QRIS', icon: QrCode, description: 'Scan QR to pay', gateway: 'midtrans' },
  { id: 'convenience_store', name: 'Convenience Store', icon: Store, description: 'Alfamart, Indomaret', gateway: 'midtrans' },
  { id: 'card_id', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard', gateway: 'midtrans' },
];

const internationalMethods: PaymentMethod[] = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex', gateway: 'stripe' },
  { id: 'apple_pay', name: 'Apple Pay', icon: Smartphone, description: 'Pay with Apple Pay', gateway: 'stripe' },
  { id: 'google_pay', name: 'Google Pay', icon: Smartphone, description: 'Pay with Google Pay', gateway: 'stripe' },
  { id: 'paypal', name: 'PayPal', icon: CreditCard, description: 'Pay with PayPal balance or cards', gateway: 'paypal' },
];

interface Props {
  countryCode: string;
  selectedMethod: string | null;
  onSelect: (methodId: string, gateway: string) => void;
}

export default function PaymentMethodSelector({ countryCode, selectedMethod, onSelect }: Props) {
  const methods = countryCode === 'ID' ? indonesianMethods : internationalMethods;
  const otherMethods = countryCode === 'ID' ? internationalMethods.filter(m => m.id === 'paypal') : [];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 px-1">Payment Method</h3>
      <div className="space-y-1.5">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id, method.gateway)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {method.name}
                </p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {otherMethods.length > 0 && (
        <>
          <p className="text-xs text-gray-400 px-1 pt-2">Other payment options</p>
          <div className="space-y-1.5">
            {otherMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => onSelect(method.id, method.gateway)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
