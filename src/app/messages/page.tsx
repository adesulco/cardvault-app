'use client';
import { MessageCircle } from 'lucide-react';

export default function MessagesRootPage() {
  // Desktop only UI (Mobile hides this view natively via the layout wrappers)
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
       <div className="w-24 h-24 border-4 border-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <MessageCircle size={40} className="text-gray-300 stroke-[1.5px]" />
       </div>
       <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Your Messages</h2>
       <p className="text-sm font-medium text-gray-500 max-w-xs">
         Send private details, coordinate listings, and negotiate proxy transactions seamlessly. Select an existing conversation or start a new one to begin.
       </p>
    </div>
  );
}
