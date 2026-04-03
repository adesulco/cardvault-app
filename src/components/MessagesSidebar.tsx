'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, Search, Shield, Info, Edit, X, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';

interface Conversation {
  conversationId: string;
  counterpartUser: { id: string; displayName: string | null; avatarUrl: string | null; username: string | null };
  latestMessage: string;
  timestamp: string;
  unread: number;
  isSystem: boolean;
}

export default function MessagesSidebar() {
  const { user } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerSearch, setComposerSearch] = useState('');
  const [composerResults, setComposerResults] = useState<any[]>([]);
  const [isSearchingComposer, setIsSearchingComposer] = useState(false);
  
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchInbox = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.id}&_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (loading) setLoading(false);
      }
    };

    fetchInbox();
    
    // Visibility-aware optimized polling
    pollTimer.current = setInterval(() => {
      if (document.visibilityState === 'visible') fetchInbox();
    }, 15000);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [user?.id, loading]);

  useEffect(() => {
     if (isComposerOpen && composerSearch.length >= 2) {
        setIsSearchingComposer(true);
        fetch(`/api/users/search?q=${encodeURIComponent(composerSearch)}&userId=${user?.id}&_t=${Date.now()}`, { cache: 'no-store' })
           .then(r => r.json())
           .then(data => {
              if (data.users) setComposerResults(data.users);
           })
           .finally(() => setIsSearchingComposer(false));
     } else {
        setComposerResults([]);
     }
  }, [composerSearch, user?.id, isComposerOpen]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full">
        <MessageCircle className="text-blue-600 opacity-50 mb-4" size={32} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
        <Link href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold mt-4">
          Log In
        </Link>
      </div>
    );
  }

  const filtered = conversations.filter(c => 
     c.counterpartUser?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
     c.latestMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-white px-4 py-3 shrink-0 border-b border-gray-100 z-10">
        <div className="flex items-center justify-between">
           <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h1>
           <button onClick={(e) => { e.preventDefault(); setIsComposerOpen(true); }} className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative z-20 cursor-pointer">
              <Edit size={22} className="stroke-[2px]" />
           </button>
        </div>
        
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 stroke-[2.5px]" />
          <input
            type="text"
            placeholder="Search Direct Messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-medium placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full CustomScrollbar">
        {loading ? (
           <div className="flex justify-center py-10">
             <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
           </div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-16 text-gray-400 px-4">
             <MessageCircle size={36} className="mx-auto mb-4 opacity-30 text-gray-500" />
             <p className="text-sm font-bold text-gray-800">No active discussions</p>
             <p className="text-xs mt-1 text-gray-500">Your direct messages with sellers and buyers will populate here seamlessly.</p>
           </div>
        ) : (
           <div className="divide-y divide-gray-50">
             {filtered.map(conv => {
                const isActive = pathname.includes(conv.counterpartUser.id);
                
                // Parse potential JSON
                let snippet = conv.latestMessage;
                if (snippet.includes('[SYS]')) snippet = snippet.replace('[SYS]', '').trim();
                else {
                   try {
                     const parsed = JSON.parse(snippet);
                     if (parsed.text) snippet = parsed.text;
                   } catch(e) {}
                }

                return (
                 <Link 
                   key={conv.conversationId} 
                   href={`/messages/${conv.counterpartUser.id}`}
                   className={`block p-4 transition-colors relative ${isActive ? 'bg-slate-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                 >
                   <div className="flex gap-3 items-center">
                     <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 relative overflow-hidden border border-gray-100">
                       {conv.counterpartUser.avatarUrl ? (
                          <Image src={conv.counterpartUser.avatarUrl} alt="" fill className="object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gradient-to-br from-gray-100 to-gray-200 uppercase">
                             {conv.counterpartUser.displayName?.[0] || '?'}
                          </div>
                       )}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between">
                          <h3 className={`text-[15px] font-bold truncate pr-2 flex items-center gap-1.5 ${conv.unread > 0 ? 'text-gray-900' : 'text-gray-800'}`}>
                            {conv.counterpartUser.displayName || 'Unknown Vault User'}
                            <Shield size={12} className="text-blue-500" />
                          </h3>
                          <span className={`text-[11px] font-bold flex-shrink-0 pt-0.5 ${conv.unread > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {new Date(conv.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-1 mt-0.5">
                         {conv.isSystem && <Info size={14} className="text-indigo-500 shrink-0" />}
                         <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                            {conv.isSystem ? <span className="text-indigo-600 font-bold">Alert: </span> : ''}
                            {snippet}
                         </p>
                       </div>
                     </div>
                     
                     {conv.unread > 0 && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-sm ring-4 ring-white" />
                     )}
                   </div>
                 </Link>
                );
             })}
           </div>
        )}
      </div>

      {/* Global Composer Slide-In */}
      <div className={`absolute inset-0 z-[100] bg-white transition-transform duration-300 ease-in-out shadow-2xl ${
         isComposerOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
         <div className="bg-white border-b border-gray-100 pt-safe px-4 py-3 flex items-center gap-3">
            <button onClick={() => setIsComposerOpen(false)} className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
               <ArrowLeft size={22} />
            </button>
            <h2 className="text-base font-bold text-gray-900">New Direct Message</h2>
         </div>
         
         <div className="px-4 py-3 bg-white border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">To:</h3>
            <div className="relative">
               <input
                  type="text"
                  autoFocus={isComposerOpen}
                  placeholder="Search globally by display name..."
                  value={composerSearch}
                  onChange={e => setComposerSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] outline-none focus:border-blue-400 focus:bg-white transition-colors font-bold tracking-tight text-gray-900 placeholder:font-medium placeholder:text-gray-400"
               />
               {composerSearch && (
                  <button onClick={() => setComposerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                     <X size={16} />
                  </button>
               )}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-4 py-3 h-[calc(100%-140px)]">
            {isSearchingComposer ? (
               <div className="py-10 flex justify-center"><div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full" /></div>
            ) : composerSearch.length < 2 ? (
               <div className="text-center py-10 opacity-60">
                  <Search size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-semibold text-gray-800">Search the Directory</p>
               </div>
            ) : composerResults.length === 0 ? (
               <div className="text-center py-10 opacity-60">
                  <p className="text-sm font-semibold text-gray-800">No users found</p>
               </div>
            ) : (
               <div className="space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Global Results</p>
                  {composerResults.map((u) => (
                     <button
                        key={u.id}
                        onClick={() => {
                           setIsComposerOpen(false);
                           setComposerSearch('');
                           router.push(`/messages/${u.id}`);
                        }}
                        className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 transition-colors text-left"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-100 rounded-full flex overflow-hidden items-center justify-center font-bold text-gray-400 border border-gray-200">
                              {u.avatarUrl ? <Image src={u.avatarUrl} alt="" fill className="object-cover" /> : (u.displayName?.[0] || '?')}
                           </div>
                           <div>
                              <p className="text-[14px] font-bold text-gray-900 leading-tight">{u.displayName}</p>
                              <p className="text-[12px] font-medium text-gray-500">@{u.username}</p>
                           </div>
                        </div>
                        {u.isFollowed && <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-bold border border-blue-100">Following</span>}
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
