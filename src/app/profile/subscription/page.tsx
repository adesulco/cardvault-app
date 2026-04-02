'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Check, Crown, Zap, Shield, Loader2 } from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAppStore();
  
  const [activeTier, setActiveTier] = useState<string>('BRONZE');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      try {
        const res = await fetch(`/api/subscriptions?userId=${user.id}`);
        const data = await res.json();
        setActiveTier(data.tier || 'BRONZE');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, [user]);

  const handleUpgrade = async (targetTier: string) => {
    if (!user || upgrading) return;
    setUpgrading(targetTier);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tierName: targetTier, billingCycle: 'MONTHLY' })
      });
      if (res.ok) {
         alert(`Congratulations! You are officially a ${targetTier} Seller! Gamification perks unlocked.`);
         window.location.reload();
      } else {
         const d = await res.json();
         alert(d.error);
      }
    } catch {
       alert("Upgrade simulation network issue.");
    } finally {
       setUpgrading(null);
    }
  };

  if (!user) return null;

  const TIERS = [
    {
      id: 'BRONZE',
      name: 'Standard Vault',
      price: 'Free',
      period: 'Forever',
      popular: false,
      features: ['5% Flat Commission Rate', 'Standard Escrow Access', 'Digital Ledger'],
      icon: <Shield size={24} className="text-gray-500" />
    },
    {
      id: 'SILVER',
      name: 'Silver Pro',
      price: 'Rp 99K',
      period: 'Per Month',
      popular: true,
      features: ['4% Cut Commission Rate', 'Verified Silver Badge', 'Advanced Pricing Tools'],
      icon: <Zap size={24} className="text-blue-500" />
    },
    {
      id: 'GOLD',
      name: 'Gold Enterprise',
      price: 'Rp 299K',
      period: 'Per Month',
      popular: false,
      features: ['3% Lowest Commission', '+500 Coins Sign-On Bonus', 'Top Priority Placement', 'Dedicated Account Manager'],
      icon: <Crown size={24} className="text-yellow-500" />
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-slate-50 pb-20">
      <header className="px-4 py-4 bg-white border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pro Subscriptions</h1>
      </header>

      <div className="p-6 text-center max-w-sm mx-auto pt-10">
         <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">Scale Your Marketplace Presence</h2>
         <p className="text-xs text-gray-500 mb-8 leading-relaxed font-medium">Overcome baseline 5% commissions. Protect your absolute margin on grails by unlocking our exclusive seller pricing tiers.</p>
         
         {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
         ) : (
            <div className="space-y-4 text-left">
               {TIERS.map(tier => {
                  const isActive = activeTier === tier.id;
                  return (
                    <div key={tier.id} className={`relative bg-white border-2 rounded-2xl p-5 transition-shadow ${isActive ? 'border-green-500 shadow-sm' : tier.popular ? 'border-blue-500 shadow-md' : 'border-gray-200 shadow-sm'}`}>
                       {tier.popular && !isActive && (
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-sm">
                           Most Popular
                         </div>
                       )}
                       {isActive && (
                         <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-sm">
                           Current Plan
                         </div>
                       )}

                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-green-50' : 'bg-slate-50 border border-slate-100'}`}>
                                {tier.icon}
                             </div>
                             <div>
                                <h3 className="font-bold text-gray-900">{tier.name}</h3>
                                <p className="text-xs text-gray-500 font-semibold">{tier.price} <span className="font-normal">/ {tier.period}</span></p>
                             </div>
                          </div>
                          {isActive && <Check className="text-green-500" size={24} />}
                       </div>

                       <div className="space-y-2.5 mb-5 pl-1">
                          {tier.features.map((feat, i) => (
                             <div key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                                <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                                {feat}
                             </div>
                          ))}
                       </div>

                       {!isActive && (
                          <button 
                             disabled={upgrading !== null}
                             onClick={() => handleUpgrade(tier.id)}
                             className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm ${
                                tier.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-gray-800'
                             } disabled:opacity-50`}
                          >
                             {upgrading === tier.id ? <Loader2 size={18} className="animate-spin" /> : `Upgrade to ${tier.name}`}
                          </button>
                       )}
                    </div>
                  );
               })}
            </div>
         )}
      </div>

    </div>
  );
}
