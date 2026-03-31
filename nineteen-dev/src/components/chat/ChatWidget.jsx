import React from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { useChatStore } from '../../contexts/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatWidget() {
  const { isWidgetOpen, toggleWidget } = useChatStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Main Widget Card */}
      {isWidgetOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[500px] max-h-[80vh] flex flex-col pointer-events-auto shadow-xl rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ animation: 'slideUpChat 0.25s ease forwards' }}>
          <ChatHeader />
          <MessageList />
          <ChatInput />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleWidget}
        aria-label="Toggle Chat"
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto
          ${isWidgetOpen
            ? 'bg-gray-800 text-white'
            : 'bg-primary text-white hover:bg-blue-600'}`}
      >
        {isWidgetOpen
          ? <X className="w-5 h-5" />
          : <MessageSquareText className="w-6 h-6" />
        }
      </button>

      <style>{`
        @keyframes slideUpChat {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
