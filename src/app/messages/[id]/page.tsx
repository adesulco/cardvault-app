'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Image, Shield } from 'lucide-react';

const MESSAGES = [
  { id: '1', senderId: 'other', text: 'Hi! I\'m interested in buying the Charizard.', time: '10:30 AM' },
  { id: '2', senderId: 'me', text: 'Great! It\'s still available. PSA 10, pristine condition.', time: '10:32 AM' },
  { id: '3', senderId: 'other', text: 'Can you do Rp 22,000,000?', time: '10:33 AM' },
  { id: '4', senderId: 'me', text: 'I can do Rp 23,500,000. That\'s my best price.', time: '10:35 AM' },
  { id: '5', senderId: 'other', text: 'Deal! I\'ll buy it now.', time: '10:36 AM' },
  { id: '6', senderId: 'me', text: 'I\'ll ship it today!', time: '10:38 AM' },
];

export default function ChatPage() {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // In production: POST to /api/messages
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={() => router.back()} className="p-1 text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">TokyoCards</p>
          <p className="text-[10px] text-green-600">Online</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <Shield size={10} />
          Escrow Active
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {MESSAGES.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              msg.senderId === 'me'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${
                msg.senderId === 'me' ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Image size={22} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2.5 bg-blue-600 rounded-full text-white disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
