'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload, Search } from 'lucide-react';
import { CARD_CATEGORIES, GRADING_COMPANIES } from '@/lib/types';

export default function AddCardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardName: '',
    playerOrCharacter: '',
    year: '',
    setName: '',
    brand: '',
    sportOrCategory: '',
    condition: 'raw',
    grade: '',
    gradingCompany: '',
    certNumber: '',
    notes: '',
    priceIdr: '',
    listForSale: false,
    isBestOfferEnabled: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCertLookup = () => {
    // In production: query PSA/BGS API to auto-populate
    alert('Cert lookup will auto-populate card details in production.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to /api/cards
    alert('Card added successfully! (Demo mode)');
    router.push('/cards');
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="p-1 text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add New Card</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-5">
        {/* Photo Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700">Card Photos</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {['Front', 'Back'].map(side => (
              <button
                key={side}
                type="button"
                className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
              >
                <Camera size={24} className="text-gray-400" />
                <span className="text-xs text-gray-500">{side} Photo</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cert Number Lookup */}
        <div>
          <label className="text-sm font-medium text-gray-700">Cert Number (Auto-Lookup)</label>
          <div className="flex gap-2 mt-1.5">
            <input
              type="text"
              value={formData.certNumber}
              onChange={e => updateField('certNumber', e.target.value)}
              placeholder="e.g., 12345678"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            />
            <button
              type="button"
              onClick={handleCertLookup}
              className="px-4 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200"
            >
              <Search size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Enter PSA, BGS, SGC, CGC, or CSG cert number to auto-fill details</p>
        </div>

        {/* Card Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Card Name *</label>
          <input
            type="text"
            required
            value={formData.cardName}
            onChange={e => updateField('cardName', e.target.value)}
            placeholder="e.g., Charizard VMAX"
            className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>

        {/* Player / Character */}
        <div>
          <label className="text-sm font-medium text-gray-700">Player / Character</label>
          <input
            type="text"
            value={formData.playerOrCharacter}
            onChange={e => updateField('playerOrCharacter', e.target.value)}
            placeholder="e.g., Charizard, LeBron James"
            className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.sportOrCategory}
            onChange={e => updateField('sportOrCategory', e.target.value)}
            className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none"
          >
            <option value="">Select category</option>
            {CARD_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        </div>

        {/* Year, Set, Brand row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Year</label>
            <input
              type="text"
              value={formData.year}
              onChange={e => updateField('year', e.target.value)}
              placeholder="2024"
              className="w-full mt-1.5 px-3 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Set</label>
            <input
              type="text"
              value={formData.setName}
              onChange={e => updateField('setName', e.target.value)}
              placeholder="Set name"
              className="w-full mt-1.5 px-3 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={e => updateField('brand', e.target.value)}
              placeholder="Brand"
              className="w-full mt-1.5 px-3 py-3 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="text-sm font-medium text-gray-700">Condition</label>
          <div className="flex gap-3 mt-1.5">
            {['raw', 'graded'].map(cond => (
              <button
                key={cond}
                type="button"
                onClick={() => updateField('condition', cond)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                  formData.condition === cond
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {cond === 'raw' ? '📦 Raw' : '🏆 Graded'}
              </button>
            ))}
          </div>
        </div>

        {/* Grading Details (conditional) */}
        {formData.condition === 'graded' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Grading Company</label>
              <select
                value={formData.gradingCompany}
                onChange={e => updateField('gradingCompany', e.target.value)}
                className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none"
              >
                <option value="">Select</option>
                {GRADING_COMPANIES.map(co => (
                  <option key={co} value={co}>{co}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Grade</label>
              <input
                type="text"
                value={formData.grade}
                onChange={e => updateField('grade', e.target.value)}
                placeholder="e.g., 10, 9.5"
                className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => updateField('notes', e.target.value)}
            placeholder="Any additional details..."
            rows={3}
            className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        {/* List for Sale Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">List for Sale</p>
              <p className="text-xs text-gray-500">Make this card available on the marketplace</p>
            </div>
            <button
              type="button"
              onClick={() => updateField('listForSale', !formData.listForSale)}
              className={`w-12 h-7 rounded-full transition-colors ${
                formData.listForSale ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mx-1 ${
                formData.listForSale ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {formData.listForSale && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Price (IDR)</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                  <input
                    type="number"
                    value={formData.priceIdr}
                    onChange={e => updateField('priceIdr', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                {formData.priceIdr && (
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ ${(parseInt(formData.priceIdr) / 15850).toFixed(2)} USD
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Accept Best Offers</span>
                <button
                  type="button"
                  onClick={() => updateField('isBestOfferEnabled', !formData.isBestOfferEnabled)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    formData.isBestOfferEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mx-1 ${
                    formData.isBestOfferEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          {formData.listForSale ? 'Add Card & Create Listing' : 'Add to Collection'}
        </button>
      </form>
    </div>
  );
}
