'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Search },
  { href: '/cards/new', label: 'Sell', icon: PlusCircle },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
