import React from 'react';
import { Bot, UserSquare2, X } from 'lucide-react';
import { useChatStore } from '../../contexts/ChatContext';

export default function ChatHeader() {
  const { isHumanHandoff, toggleWidget } = useChatStore();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-primary">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            {isHumanHandoff ? (
              <UserSquare2 className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary rounded-full"></span>
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">
            {isHumanHandoff ? 'Krido Bahtiar' : 'AI Assistant'}
          </h3>
          <p className="text-xs text-blue-100 font-medium">
            {isHumanHandoff ? 'Online' : 'Usually replies instantly'}
          </p>
        </div>
      </div>
      <button
        onClick={toggleWidget}
        className="p-1.5 rounded-md hover:bg-white/20 transition-colors text-white"
        aria-label="Close chat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
