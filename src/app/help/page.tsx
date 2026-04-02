'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LifeBuoy, Mail, ShieldAlert } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  const faqs = [
    {
      q: "How does CardVault Protection work?",
      a: "When a buyer purchases your card, the funds are immediately locked inside CardVault's secure holdings. You package the card and ship it with tracking. Only when the buyer scans it as 'Delivered' and confirms the condition does CardVault automatically route the cleared cash into your selected Payout method."
    },
    {
      q: "What if the buyer claims a fake/damaged card?",
      a: "As a seller, you are heavily protected. Our Dispute administrators demand rigorous unboxing video evidence from the buyer. If the dispute is triggered, our platform halts the cash flow and physically investigates the tracking chains and uploaded photos before making a fair market decision."
    },
    {
      q: "How long do payouts take?",
      a: "Once escrow is released by the buyer's confirmation, Midtrans and Bank Transfer payouts generally clear instantaneously natively into Indonesian and global accounts, but can take up to 24 hours depending on the designated routing infrastructure."
    },
    {
      q: "Why is KYC required?",
      a: "Preventing scams is our highest priority! Mandating official Government ID prevents banned scammers from creating anonymous burner accounts to list fake Grails. This ensures absolute trust across the marketplace."
    }
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      <header className="px-4 pt-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Help & Support</h1>
      </header>

      <div className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg mb-8">
          <LifeBuoy size={48} className="mx-auto mb-3 text-blue-200" />
          <h2 className="text-2xl font-bold mb-2">We've got your back.</h2>
          <p className="text-blue-100 text-sm mb-6">Need to dispute an ongoing trade or have questions about CardVault Protection?</p>
          <a href="mailto:support@cardvault.id" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            <Mail size={18} /> Contact Support Staff
          </a>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
          <ShieldAlert size={20} className="text-amber-500" /> Security FAQ
        </h3>
        
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-2 leading-tight">{faq.q}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
