import React from 'react';
import { Bot, UserSquare2, X } from 'lucide-react';
import { useChatStore } from '../../contexts/ChatContext';

export default function ChatHeader() {
  const { isHumanHandoff, toggleWidget } = useChatStore();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/20 dark:border-gray-700/30 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-t-2xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center p-[2px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
              {isHumanHandoff ? (
                <UserSquare2 className="w-5 h-5 text-indigo-500" />
              ) : (
                <Bot className="w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            {isHumanHandoff ? 'Krido Bahtiar' : 'AI Assistant'}
          </h3>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            {isHumanHandoff ? 'Online' : 'Usually replies instantly'}
          </p>
        </div>
      </div>
      <button 
        onClick={toggleWidget}
        className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
