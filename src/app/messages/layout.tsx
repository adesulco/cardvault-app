'use client';
import { usePathname } from 'next/navigation';
import MessagesSidebar from '@/components/MessagesSidebar';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === '/messages';

  return (
    <div className="flex w-full bg-white relative overflow-hidden" style={{ minHeight: 'calc(100dvh - 136px)' }}>
       {isRoot ? (
         <div className="w-full flex-1 bg-white z-20">
           <MessagesSidebar />
         </div>
       ) : (
         <div className="w-full flex-1 flex flex-col bg-slate-50 relative">
           {children}
         </div>
       )}
    </div>
  );
}
