'use client';
import { Bell, Shield, Truck, MessageCircle, Star, CreditCard } from 'lucide-react';

const NOTIFICATIONS = [
  { id: '1', type: 'payment', icon: Shield, title: 'Payment Secured', body: 'Your payment of Rp 25,750,000 for Charizard VMAX is held in escrow.', time: '2 hours ago', isRead: false },
  { id: '2', type: 'shipped', icon: Truck, title: 'Card Shipped!', body: 'TokyoCards shipped your Charizard VMAX. Tracking: JNE-123456789.', time: '1 hour ago', isRead: false },
  { id: '3', type: 'message', icon: MessageCircle, title: 'New Message', body: 'HoopFan88: Is the Luka card still available?', time: '3 hours ago', isRead: true },
  { id: '4', type: 'review', icon: Star, title: 'New Review', body: 'PKMNCollector left you a 5-star review!', time: '2 days ago', isRead: true },
  { id: '5', type: 'payout', icon: CreditCard, title: 'Payout Complete', body: 'Rp 3,500,000 has been sent to your BCA account.', time: '5 days ago', isRead: true },
];

const iconColors: Record<string, string> = {
  payment: 'bg-blue-100 text-blue-600',
  shipped: 'bg-indigo-100 text-indigo-600',
  message: 'bg-green-100 text-green-600',
  review: 'bg-yellow-100 text-yellow-600',
  payout: 'bg-purple-100 text-purple-600',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-3">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <button className="text-xs text-blue-600 font-medium">Mark all read</button>
      </div>

      <div className="divide-y divide-gray-100">
        {NOTIFICATIONS.map(n => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`flex gap-3 px-4 py-3.5 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[n.type]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
