'use client';
import { usePathname } from 'next/navigation';
import MessagesSidebar from '@/components/MessagesSidebar';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === '/messages';

  return (
    <div className="flex h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] max-w-[1200px] mx-auto bg-white md:border-x border-gray-100 overflow-hidden shadow-sm relative pt-safe">
       {/* Sidebar Zone */}
       <div className={`w-full md:w-[380px] border-r border-gray-100 flex-shrink-0 bg-white z-20 ${isRoot ? 'block' : 'hidden md:block'}`}>
         <MessagesSidebar />
       </div>
       
       {/* Active Chat Stream Zone */}
       <div className={`w-full flex-1 flex flex-col bg-slate-50 relative ${!isRoot ? 'block' : 'hidden md:flex'}`}>
         {children}
       </div>
    </div>
  );
}
