'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload, Search, Loader2 } from 'lucide-react';
import { CARD_CATEGORIES, GRADING_COMPANIES } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';

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
    listingMode: 'fixed',
    durationDays: 7,
    startingBidIdr: '',
    isBestOfferEnabled: false,
    minOfferIdr: '',
  });

  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);

  const [isLookingUp, setIsLookingUp] = useState(false);
  const { user } = useAppStore();

  useEffect(() => {
    // Basic Auth Gate for Beta
    // if (!user) {
    //   router.push('/auth/login');
    // }
  }, [user, router]);

  const updateField = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getVerifyLink = (company: string, cert: string) => {
    if (!cert) return '#';
    switch (company) {
      case 'PSA': return `https://www.psacard.com/cert/${cert}`;
      case 'BGS': return `https://www.beckett.com/grading/card-lookup?item_type=BGS&cert_no=${cert}`;
      case 'CGC': return `https://www.cgccards.com/certlookup/${cert}/`;
      case 'SGC': return `https://www.gosgc.com/cert-code/${cert}`;
      case 'CSG': return `https://www.csgcards.com/certlookup/${cert}/`;
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in to construct a CardVault item.');
    if (formData.listForSale && user.kycStatus === 'PENDING') return alert('You must be KYC Verified by an admin before you can post public listings.');

    setIsLookingUp(true);
    try {
      let finalFrontUrl = null;
      let finalBackUrl = null;

      if (frontImageFile) {
        const fForm = new FormData();
        fForm.append('file', frontImageFile);
        const resFront = await fetch('/api/upload', { method: 'POST', body: fForm });
        if (resFront.ok) finalFrontUrl = (await resFront.json()).url;
      }

      if (backImageFile) {
        const bForm = new FormData();
        bForm.append('file', backImageFile);
        const resBack = await fetch('/api/upload', { method: 'POST', body: bForm });
        if (resBack.ok) finalBackUrl = (await resBack.json()).url;
      }

      const cardRes = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          ownerId: user.id,
          frontImageUrl: finalFrontUrl,
          backImageUrl: finalBackUrl
        })
      });
      const card = await cardRes.json();
      
      if (formData.listForSale && card.id) {
         await fetch('/api/listings', {
            method: 'POST',
            body: JSON.stringify({
              cardId: card.id,
              sellerId: user.id,
              listingMode: formData.listingMode,
              durationDays: formData.durationDays,
              priceIdr: formData.listingMode === 'fixed' ? parseInt(formData.priceIdr) : null,
              startingBidIdr: formData.listingMode === 'auction' ? parseInt(formData.startingBidIdr) : null,
              priceUsd: formData.priceIdr ? (parseInt(formData.priceIdr) / 15850) : null
            })
         });
      }
      alert('Asset secured in Vault successfully!');
      router.push('/cards');
    } catch(err) {
      alert('Error saving securing asset');
    } finally {
      setIsLookingUp(false);
    }
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
            <label className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative overflow-hidden">
              {frontImageFile ? (
                 <img src={URL.createObjectURL(frontImageFile)} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Front Photo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={e => setFrontImageFile(e.target.files?.[0] || null)} />
            </label>

            <label className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer relative overflow-hidden">
              {backImageFile ? (
                 <img src={URL.createObjectURL(backImageFile)} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Back Photo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={e => setBackImageFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        {/* Condition - Moved to top UX priority */}
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

        {/* Cert Number Lookup */}
        {formData.condition === 'graded' && (
          <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl">
            <label className="text-sm font-medium text-gray-800">Certification Number</label>
            <div className="flex gap-2 mt-1.5">
              <input
                type="text"
                value={formData.certNumber}
                onChange={e => updateField('certNumber', e.target.value)}
                placeholder="e.g., 12345678"
                className="flex-1 px-4 py-3 bg-white border border-gray-200 focus:border-blue-400 rounded-xl text-sm outline-none transition-colors"
              />
              {getVerifyLink(formData.gradingCompany, formData.certNumber) !== null && (
                 <button
                   type="button"
                   onClick={() => {
                      const link = getVerifyLink(formData.gradingCompany, formData.certNumber);
                      if (link && link !== '#') window.open(link, '_blank', 'noopener,noreferrer');
                   }}
                   disabled={!formData.certNumber}
                   className="px-4 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                 >
                   <Search size={16} /> Verify
                 </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Entering the official certification number allows buyers to verify the graded slab's authenticity.</p>
          </div>
        )}

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
            <div className="space-y-4 pt-2">
              {/* Format Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                 <button type="button" onClick={() => updateField('listingMode', 'fixed')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.listingMode === 'fixed' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>Fixed Price</button>
                 <button type="button" onClick={() => updateField('listingMode', 'auction')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.listingMode === 'auction' ? 'bg-indigo-600 shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}>Timed Auction</button>
              </div>

              {formData.listingMode === 'fixed' ? (
                 <>
                   <div>
                     <label className="text-sm font-medium text-gray-700">Buy It Now Price (IDR)</label>
                     <div className="relative mt-1.5">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                       <input type="number" value={formData.priceIdr} onChange={e => updateField('priceIdr', e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                     </div>
                   </div>
                 </>
              ) : (
                 <>
                   <div>
                     <label className="text-sm font-medium text-gray-700">Starting Bid (IDR)</label>
                     <div className="relative mt-1.5">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">Rp</span>
                       <input type="number" value={formData.startingBidIdr} onChange={e => updateField('startingBidIdr', e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-indigo-200 focus:border-indigo-400 rounded-xl text-sm outline-none transition-colors" />
                     </div>
                     <p className="text-[10px] text-gray-500 mt-2">Bids will begin at this identical figure and step up automatically.</p>
                   </div>
                 </>
              )}

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-gray-700">Listing Expires In</label>
                <select value={formData.durationDays} onChange={e => updateField('durationDays', parseInt(e.target.value))} className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none outline-none">
                   <option value={1}>1 Day (24 hours)</option>
                   <option value={3}>3 Days</option>
                   <option value={7}>7 Days</option>
                   <option value={30}>30 Days</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-2">Item is formally hidden from generic marketplace arrays upon explicit clock expiration.</p>
              </div>

              {formData.listingMode === 'fixed' && (
                 <>
                   <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                     <span className="text-sm text-gray-700 font-medium">Accept Best Offers</span>
                     <button type="button" onClick={() => updateField('isBestOfferEnabled', !formData.isBestOfferEnabled)} className={`w-12 h-7 rounded-full transition-colors ${formData.isBestOfferEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                       <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mx-1 ${formData.isBestOfferEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                   </div>
                   {formData.isBestOfferEnabled && (
                     <div className="pt-1">
                       <label className="text-sm font-medium text-gray-700">Minimum Acceptable Offer (IDR)</label>
                       <p className="text-[10px] text-gray-500 mb-1.5">Systematically autorejects bids trailing this dynamic minimum.</p>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                         <input type="number" value={formData.minOfferIdr} onChange={e => updateField('minOfferIdr', e.target.value)} placeholder="e.g. 500000" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                       </div>
                     </div>
                   )}
                 </>
              )}
            </div>
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
