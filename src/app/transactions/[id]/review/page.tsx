'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;
  const { user } = useAppStore();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0 || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          reviewerId: user.id,
          rating,
          comment
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/transactions');
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit review.');
      }
    } catch (error) {
       alert('Verification network failed. Please try again.');
    } finally {
      if (!success) setSubmitting(false);
    }
  };

  if (!user) return null;

  if (success) {
     return (
        <div className="h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
           <div className="w-20 h-20 bg-green-100 rounded-full flex flex-col items-center justify-center mb-6 shadow-sm border border-green-200">
               <ShieldCheck size={40} className="text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Escrow Concluded</h2>
           <p className="text-gray-500 text-center max-w-xs text-sm">Your secure rating has been mapped successfully to the seller's primary trust profile.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-xl mx-auto pb-10">
      <header className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Grade Your Experience</h1>
      </header>

      <div className="p-6 flex-1 flex flex-col items-center pt-10">
         <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">How was delivery?</h2>
         <p className="text-gray-500 text-sm mb-10 text-center px-4">Rate the accuracy, packaging, and speed of your active P2P CardVault transaction.</p>

         <div className="flex gap-2 mb-10">
           {[1, 2, 3, 4, 5].map((star) => (
             <button
               key={star}
               type="button"
               disabled={submitting}
               className="p-1 transition-transform hover:scale-110 active:scale-95 disabled:scale-100 disabled:opacity-50"
               onClick={() => setRating(star)}
               onMouseEnter={() => setHoverRating(star)}
               onMouseLeave={() => setHoverRating(0)}
             >
               <Star 
                 size={48} 
                 className={`transition-colors duration-200 ${
                   star <= (hoverRating || rating)
                     ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                     : 'fill-slate-100 text-slate-200'
                 }`} 
               />
             </button>
           ))}
         </div>

         <div className="w-full space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label className="text-sm font-bold text-gray-700">Detailed Feedback (Optional)</label>
            <textarea
               value={comment}
               onChange={e => setComment(e.target.value)}
               disabled={submitting}
               rows={4}
               placeholder="Was the card mint? Protected well during shipping?"
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-colors outline-none text-sm placeholder:text-gray-400 disabled:opacity-50"
            />
         </div>

         <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
         >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
            Confirm Public Rating
         </button>
      </div>
    </div>
  );
}
