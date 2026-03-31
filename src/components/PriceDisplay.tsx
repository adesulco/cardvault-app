'use client';
import { useAppStore } from '@/lib/store';
import { formatDualCurrency } from '@/lib/currency';

interface PriceDisplayProps {
  priceIdr: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceDisplay({ priceIdr, size = 'md', className = '' }: PriceDisplayProps) {
  const { preferredCurrency, exchangeRate } = useAppStore();
  const { primary, secondary } = formatDualCurrency(priceIdr, exchangeRate, preferredCurrency);

  const sizes = {
    sm: { primary: 'text-sm font-bold', secondary: 'text-[10px]' },
    md: { primary: 'text-base font-bold', secondary: 'text-xs' },
    lg: { primary: 'text-xl font-bold', secondary: 'text-sm' },
  };

  return (
    <div className={className}>
      <div className={`${sizes[size].primary} text-gray-900`}>{primary}</div>
      <div className={`${sizes[size].secondary} text-gray-400`}>{secondary}</div>
    </div>
  );
}
