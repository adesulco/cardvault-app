'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Tag, Repeat, Trash2 } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';

const CARD = {
  id: 'mc1',
  cardName: 'Charizard VMAX',
  playerOrCharacter: 'Pokémon',
  year: '2020',
  setName: 'Champions Path',
  brand: 'Pokémon TCG',
  condition: 'graded' as const,
  grade: '10',
  gradingCompany: 'PSA',
  certNumber: '12345678',
  estimatedValueIdr: 25000000,
  status: 'in_collection',
  notes: 'Pristine condition.',
};

export default function CardDetailPage() {
  const router = useRouter();

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="p-1 text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Card Details</h1>
      </div>

      {/* Image */}
      <div className="mx-4 aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <span className="text-6xl">🃏</span>
      </div>

      {/* Info */}
      <div className="px-4 space-y-4">
        <div>
          <h2 className="text-xl font-bold">{CARD.cardName}</h2>
          <p className="text-sm text-gray-500">{CARD.playerOrCharacter} · {CARD.year} · {CARD.setName}</p>
          <div className="mt-2 inline-flex px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium capitalize">
            {CARD.status.replace('_', ' ')}
          </div>
        </div>

        {CARD.estimatedValueIdr && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">Estimated Value</p>
            <PriceDisplay priceIdr={CARD.estimatedValueIdr} size="lg" />
          </div>
        )}

        {/* Details Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-y-3">
            {[
              ['Brand', CARD.brand],
              ['Set', CARD.setName],
              ['Year', CARD.year],
              ['Condition', CARD.condition === 'graded' ? `${CARD.gradingCompany} ${CARD.grade}` : 'Raw'],
              ['Cert #', CARD.certNumber || 'N/A'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            <Tag size={18} />
            List for Sale
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            <Repeat size={18} />
            List for Trade
          </button>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">
              <Edit size={16} /> Edit
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50">
              <Trash2 size={16} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
