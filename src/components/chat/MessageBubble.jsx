import React from 'react';
import { Bot, User } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isBot = message.role === 'model';

  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-3 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className="flex-shrink-0 mt-1">
          {isBot ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>
        
        <div 
          className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-sm shadow-sm
            ${isBot 
              ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700/50' 
              : 'bg-indigo-500 text-white rounded-tr-sm'
            }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
