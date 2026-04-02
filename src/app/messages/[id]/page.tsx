'use client';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Shield, Info, Check, CheckCheck, MessageCircle, Link2, X } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import PriceDisplay from '@/components/PriceDisplay';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export default function ChatThreadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const listingRef = searchParams.get('listingRef');
  const counterpartId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { user } = useAppStore();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [referencedItem, setReferencedItem] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const conversationId = user ? [user.id, counterpartId].sort().join('-chat-') : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user?.id || !conversationId) return;

    const fetchThread = async (initialRun = false) => {
      try {
        const res = await fetch(`/api/messages?conversationId=${conversationId}&userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          if (initialRun) setTimeout(scrollToBottom, 50);
        }
      } catch (err) {
         console.error(err);
      } finally {
         if (loading) setLoading(false);
      }
    };

    fetchThread(true);
    pollTimer.current = setInterval(() => fetchThread(false), 3000);

    return () => {
       if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [user?.id, conversationId, loading]);

  useEffect(() => {
    if (listingRef) {
       fetch(`/api/listings/${listingRef}`)
         .then(res => res.json())
         .then(data => {
            if (data.listing) setReferencedItem(data.listing);
         }).catch(console.error);
    }
  }, [listingRef]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const currentText = text;
    setText('');
    
    // Inject Listing payload seamlessly as stringified JSON if actively inquiring
    const finalPayload = referencedItem 
      ? JSON.stringify({ 
           text: currentText, 
           listingId: referencedItem.id, 
           listingName: referencedItem.cardName, 
           listingImage: referencedItem.frontImageUrl, 
           priceIdr: referencedItem.listingMode === 'auction' ? referencedItem.currentBidIdr || referencedItem.startingBidIdr : referencedItem.priceIdr,
           listingMode: referencedItem.listingMode
        }) 
      : currentText;

    if (referencedItem) {
      setReferencedItem(null);
      router.replace(`/messages/${counterpartId}`);
    }
    
    const mockMessage: Message = {
      id: Math.random().toString(),
      content: finalPayload,
      senderId: user.id,
      recipientId: counterpartId,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl }
    };
    
    setMessages(prev => [...prev, mockMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: counterpartId,
          content: finalPayload
        })
      });
    } catch (err) {
      console.error(err);
      setText(currentText);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative isolate w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex items-center px-4 py-3 shrink-0 sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.push('/messages')} className="mr-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold text-gray-900 tracking-tight leading-none mb-1">Negotations</h1>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
            <Shield size={10} className="fill-emerald-200" /> Vault Security Active
          </p>
        </div>
      </div>

      {/* Embedded Commerce Pre-Injection Context */}
      {referencedItem && (
         <div className="bg-white border-b border-gray-100 flex items-center px-4 py-2.5 gap-3 transition-colors z-10 shadow-sm shrink-0 relative">
            <div className="w-10 h-10 md:h-12 bg-gray-200 rounded-lg border border-gray-100 shrink-0 overflow-hidden relative shadow-sm">
               {referencedItem.frontImageUrl && <Image src={referencedItem.frontImageUrl} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Inquiring About</p>
               <p className="text-[13px] font-bold text-gray-900 truncate tracking-tight">{referencedItem.cardName}</p>
            </div>
            <button onClick={() => { setReferencedItem(null); router.replace(`/messages/${counterpartId}`);}} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors absolute right-4 top-1/2 -translate-y-1/2">
               <X size={16} />
            </button>
         </div>
      )}

      {/* Messages Thread Zone */}
      <div className="flex-1 overflow-y-auto w-full px-4 py-6 z-0" style={{ paddingBottom: '90px' }}>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-900">Start the conversation</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[220px] mx-auto leading-relaxed">Keep all negotiations inside CardVault to strictly ensure escrow payment protection.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              
              let parsedJSON = null;
              let contentBlob = msg.content;
              const isSystem = msg.content.includes('[SYS]');

              if (isSystem) {
                 contentBlob = contentBlob.replace('[SYS]', '').trim();
              } else {
                 try {
                    const parsed = JSON.parse(msg.content);
                    if (parsed.text && parsed.listingId) {
                       contentBlob = parsed.text;
                       parsedJSON = parsed;
                    }
                 } catch(e) {}
              }

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl px-4 py-3 flex gap-2 max-w-[85%] shadow-sm w-full md:w-auto">
                        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[13px] font-semibold text-indigo-900 leading-snug">{contentBlob}</p>
                        </div>
                     </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 mr-2 mt-auto mb-1 overflow-hidden relative border border-gray-100 shadow-sm">
                      {msg.sender.avatarUrl ? (
                        <Image src={msg.sender.avatarUrl} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold uppercase bg-gradient-to-tr from-gray-100 to-gray-200">
                          {msg.sender.displayName?.[0] || '?'}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                    {/* ECommerce Listing Bubble Injection */}
                    {parsedJSON && (
                       <Link href={`/explore/${parsedJSON.listingId}`} className={`block mb-1 w-full max-w-[240px] rounded-xl overflow-hidden border bg-white hover:border-blue-400 transition-colors shadow-sm ${isMine ? 'border-blue-200' : 'border-gray-200'}`}>
                          <div className="flex items-center p-2 gap-2.5">
                             <div className="w-10 h-14 bg-gray-100 rounded relative overflow-hidden shrink-0 border border-gray-100">
                                {parsedJSON.listingImage ? <Image src={parsedJSON.listingImage} fill alt="" className="object-cover" /> : <div className="w-full h-full text-[10px] flex items-center justify-center font-bold text-gray-400">IMG</div>}
                             </div>
                             <div className="flex-1 min-w-0 pr-1">
                                <p className="text-[11px] font-bold text-gray-900 truncate leading-snug">{parsedJSON.listingName}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{parsedJSON.listingMode || 'Listing'}</p>
                                <div className="mt-1">
                                   <PriceDisplay priceIdr={parsedJSON.priceIdr || 0} size="sm" />
                                </div>
                             </div>
                          </div>
                          <div className={`text-[10px] font-bold tracking-widest uppercase text-center py-1.5 ${isMine ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                             View Active Listing
                          </div>
                       </Link>
                    )}

                    <div 
                      className={`px-4 py-2.5 rounded-2xl relative ${
                        isMine 
                          ? 'bg-blue-600 text-white rounded-br-sm shadow-sm' 
                          : 'bg-white text-gray-900 border border-gray-200/60 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-[14.5px] font-medium leading-[1.45] break-words whitespace-pre-wrap tracking-[-0.01em]">{contentBlob}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {isMine && (
                        msg.isRead ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Engine Input Stream */}
      <div className="absolute bottom-16 md:bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-3 z-20 w-full">
        <form onSubmit={handleSend} className="flex gap-2 w-full max-w-3xl mx-auto">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Securely negotiate..."
            className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-medium hover:bg-black disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-all shrink-0 shadow-sm shadow-slate-900/10 active:scale-95"
          >
            <Send size={18} className="translate-x-[1px] -translate-y-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
