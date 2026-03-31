import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { useChatStore } from '../../contexts/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatWidget() {
  const { isWidgetOpen, toggleWidget } = useChatStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Main Widget Card - hanya dirender saat terbuka */}
      {isWidgetOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[500px] max-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 origin-bottom-right pointer-events-auto glass-panel shadow-2xl rounded-2xl overflow-hidden border border-white/40 dark:border-gray-700/40">
          <ChatHeader />
          <MessageList />
          <ChatInput />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleWidget}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 pointer-events-auto
          ${isWidgetOpen 
            ? 'bg-gray-800 dark:bg-gray-700 text-white rotate-12' 
            : 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white'}`}
      >
        <MessageSquareText className="w-6 h-6" />
      </button>
    </div>
  );
}

