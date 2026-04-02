'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import { EscrowProtectionBanner } from '@/components/EscrowBadge';
import { useAppStore } from '@/lib/store';
import { formatIDR, formatUSD, idrToUsd, calculateFees } from '@/lib/currency';

export default function CheckoutPage() {
  const router = useRouter();
  const { preferredCurrency, exchangeRate } = useAppStore();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>('midtrans');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'review' | 'payment' | 'offer' | 'confirmation'>('review');
  const [offerAmount, setOfferAmount] = useState<string>('');

  const params = useParams();
  const listingId = params?.id as string;
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    fetch(`/api/listings/${listingId}`)
      .then(res => res.json())
      .then(data => {
        setListing(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [listingId]);

  const fees = calculateFees(listing.priceIdr, 'sale', false);
  const totalIdr = fees.totalIdr;
  const totalUsd = idrToUsd(totalIdr, exchangeRate);

  const handlePayment = async () => {
    if (!selectedPayment || !listing) return;
    setProcessing(true);
    
    try {
      const tx = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: listing.sellerId,
          listingId: listing.id,
          priceIdr: listing.priceIdr,
          buyerFeeIdr: fees.buyerFeeIdr,
          totalIdr: totalIdr,
          paymentGateway: selectedGateway,
          paymentMethodType: selectedPayment
        })
      });
      if (tx.ok) {
        setStep('confirmation');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleOfferSubmit = async () => {
    if (!offerAmount || !listing) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          fromUserId: 'mock-buyer-id-999', // beta fallback
          offerAmountIdr: parseInt(offerAmount),
          offerAmountUsd: idrToUsd(parseInt(offerAmount), exchangeRate)
        })
      });

      const json = await res.json();
      if (res.ok) {
        setStep('confirmation');
      } else {
        alert(json.error || 'Failed to submit offer');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) return <div className="text-center py-20 text-gray-500">Listing not found.</div>;

  if (step === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Shield size={36} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {step === 'confirmation' && offerAmount ? 'Offer Submitted!' : 'Payment Secured!'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          {offerAmount 
            ? `Your offer of ${formatIDR(parseInt(offerAmount))} has been sent. The seller has 24 hours to respond.`
            : `Your payment of ${formatIDR(totalIdr)} is now held in escrow. The seller has been notified to ship.`}
        </p>
        <div className="w-full mt-6 space-y-3">
          <button
            onClick={() => router.push('/transactions')}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/explore')}
            className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => step !== 'review' ? setStep('review') : router.back()} className="p-1 text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {step === 'review' ? 'Order Review' : step === 'offer' ? 'Make Offer' : 'Payment'}
        </h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 px-4 mb-4">
        {['Review', 'Payment'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              (step === 'review' && i === 0) || (step === 'payment' && i <= 1)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className="text-xs text-gray-600">{label}</span>
            {i < 1 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {step === 'review' && (
          <>
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h2>
              <div className="flex gap-3">
                <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  🃏
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{listing.card?.cardName || listing.cardName}</p>
                  <p className="text-xs text-gray-500">{listing.card?.gradingCompany || listing.gradingCompany} {listing.card?.grade || listing.grade}</p>
                  <p className="text-xs text-gray-500">Seller: {listing.seller?.displayName || listing.seller}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Item Price</span>
                  <span className="text-gray-900">{formatIDR(listing.priceIdr)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Buyer Fee (3%)</span>
                  <span className="text-gray-900">{formatIDR(fees.buyerFeeIdr)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <div className="text-right">
                    <div>{formatIDR(totalIdr)}</div>
                    <div className="text-xs font-normal text-gray-400">~{formatUSD(totalUsd)}</div>
                  </div>
                </div>
              </div>
            </div>

            <EscrowProtectionBanner />

            {/* How Escrow Works */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">How Escrow Works</h3>
              <div className="space-y-2.5">
                {[
                  ['1', 'You pay — funds held securely'],
                  ['2', 'Seller ships the card with tracking'],
                  ['3', 'You receive and inspect (48 hours)'],
                  ['4', 'Confirm satisfaction — seller gets paid'],
                ].map(([num, text]) => (
                  <div key={num} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {num}
                    </div>
                    <p className="text-xs text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('payment')}
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Instant Buy
              </button>
              {listing.isBestOfferEnabled && (
                <button
                  onClick={() => setStep('offer')}
                  className="flex-1 py-3.5 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-semibold text-sm transition-colors"
                >
                  Make Offer
                </button>
              )}
            </div>
          </>
        )}

        {step === 'offer' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
             <h2 className="text-sm font-semibold text-gray-900 mb-2">Propose your price</h2>
             <p className="text-xs text-gray-500 mb-4">The seller has 24 hours to accept, reject, or counter your offer.</p>
             <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:border-blue-500"
                />
             </div>

             <button
               onClick={handleOfferSubmit}
               disabled={!offerAmount || processing}
               className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center"
             >
               {processing ? 'Submitting...' : 'Submit Binding Offer'}
             </button>
          </div>
        )}

        {step === 'payment' && (
          <>
            <PaymentMethodSelector
              countryCode="ID"
              selectedMethod={selectedPayment}
              onSelect={(method, gateway) => {
                setSelectedPayment(method);
                setSelectedGateway(gateway);
              }}
            />

            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Total to Pay</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatIDR(totalIdr)}</div>
                  <div className="text-xs text-gray-400">~{formatUSD(totalUsd)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
              <Lock size={12} />
              <span>Secured by {selectedGateway === 'midtrans' ? 'Midtrans' : selectedGateway === 'stripe' ? 'Stripe' : 'PayPal'}</span>
            </div>
          </>
        )}
      </div>

      {/* Fixed Pay Button */}
      {step === 'payment' && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handlePayment}
              disabled={!selectedPayment || processing}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Pay {formatIDR(totalIdr)}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
