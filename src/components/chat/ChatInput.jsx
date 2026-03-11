import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../../contexts/ChatContext';

export default function ChatInput() {
  const { sendMessage, isTyping } = useChatStore();
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isTyping) return;
    sendMessage(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-b-2xl border-t border-gray-200/20 dark:border-gray-700/30">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 resize-none h-12 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all scrollbar-hide"
          rows={1}
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!text.trim() || isTyping}
          className="absolute right-2 p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white transition-colors"
        >
          {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
      <div className="text-center mt-2">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Powered by Gemini AI</span>
      </div>
    </div>
  );
}
