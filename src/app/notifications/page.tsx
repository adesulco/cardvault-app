'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Bell, Shield, Hammer, Wallet, MessageSquare, Info, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`/api/notifications?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
           setAlerts(data.notifications);
        }
      })
      .finally(() => setLoading(false));

    // Optimistically mark all as read automatically on view
    fetch('/api/notifications', {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ userId: user.id })
    }).catch(console.error);

  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Bell className="text-blue-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-500 max-w-sm">Securely authenticate to view your Protection and Proxy timeline.</p>
      </div>
    );
  }

  const getIconForType = (type: string) => {
     if (type.includes('kyc') || type.includes('registration')) return <Shield size={18} className="text-emerald-500" />;
     if (type.includes('outbid') || type.includes('auction')) return <Hammer size={18} className="text-rose-500" />;
     if (type.includes('payment') || type.includes('escrow')) return <Wallet size={18} className="text-blue-600" />;
     if (type.includes('message')) return <MessageSquare size={18} className="text-indigo-500" />;
     return <Info size={18} className="text-gray-500" />;
  };

  const getBgForType = (type: string) => {
     if (type.includes('kyc') || type.includes('registration')) return 'bg-emerald-100/50 border-emerald-200';
     if (type.includes('outbid') || type.includes('auction')) return 'bg-rose-100/50 border-rose-200';
     if (type.includes('payment') || type.includes('escrow')) return 'bg-blue-100/50 border-blue-200';
     if (type.includes('message')) return 'bg-indigo-100/50 border-indigo-200';
     return 'bg-gray-100/50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 max-w-xl mx-auto md:border-x border-gray-100 shadow-sm pt-safe">
      <div className="bg-white px-4 py-3 sticky top-0 z-20 border-b border-gray-100 flex items-center shadow-sm">
        <button onClick={() => router.back()} className="mr-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Notifications</h1>
      </div>

      <div className="p-4">
        {loading ? (
           <div className="flex justify-center py-12">
             <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
           </div>
        ) : alerts.length === 0 ? (
           <div className="text-center py-20 px-8 text-gray-400 opacity-60">
             <Bell size={48} className="mx-auto mb-4 text-gray-300" />
             <p className="text-sm font-bold text-gray-800 tracking-tight">You're all caught up.</p>
             <p className="text-xs mt-1.5 leading-relaxed text-gray-500">When you get cleanly outbid, securely receive a payment, or pass KYC, the systemic alerts will trigger here.</p>
           </div>
        ) : (
           <div className="space-y-3">
             {alerts.map((alert) => (
               <div key={alert.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3.5 relative overflow-hidden group hover:border-blue-200 transition-colors">
                 {/* Unread dot visually mapped before the cleanup interval runs */}
                 {!alert.isRead && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 m-3 rounded-full" />
                 )}
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getBgForType(alert.type)}`}>
                   {getIconForType(alert.type)}
                 </div>
                 <div className="flex-1 min-w-0 pr-2">
                   <h3 className={`text-[14px] font-bold text-gray-900 tracking-tight leading-snug mb-0.5 ${!alert.isRead && 'text-blue-900'}`}>
                     {alert.title}
                   </h3>
                   <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                     {alert.body}
                   </p>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2">
                     {new Date(alert.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </p>
                 </div>
               </div>
             ))}
             
             <div className="flex items-center justify-center gap-2 text-gray-400 py-6 opacity-50">
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">End of History</span>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
