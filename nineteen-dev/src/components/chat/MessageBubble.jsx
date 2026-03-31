import React from 'react';
import { Bot, User } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isBot = message.role === 'model';

  return (
    <div className={`flex w-full mb-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-2 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isBot ? (
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
              <User className="w-3.5 h-3.5 text-gray-600" />
            </div>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-xl whitespace-pre-wrap text-sm leading-relaxed
            ${isBot
              ? 'bg-white text-foreground border border-gray-200 shadow-sm rounded-tl-none'
              : 'bg-primary text-white rounded-tr-none'
            }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
