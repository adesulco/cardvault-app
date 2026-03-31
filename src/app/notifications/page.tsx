'use client';
import { useEffect, useState } from 'react';
import { Bell, Shield, Truck, MessageCircle, Star, CreditCard } from 'lucide-react';

const iconColors: Record<string, string> = {
  payment: 'bg-blue-100 text-blue-600',
  shipped: 'bg-indigo-100 text-indigo-600',
  message: 'bg-green-100 text-green-600',
  review: 'bg-yellow-100 text-yellow-600',
  payout: 'bg-purple-100 text-purple-600',
};

const iconMap: Record<string, any> = {
  payment: Shield,
  shipped: Truck,
  message: MessageCircle,
  review: Star,
  payout: CreditCard,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        // setNotifications(data);

        setNotifications([]);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="space-y-3">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        {notifications.length > 0 && (
          <button className="text-xs text-blue-600 font-medium">Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-sm text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">You'll see updates about your transactions here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map(n => {
            const Icon = iconMap[n.type] || Bell;
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
      )}
    </div>
  );
}
