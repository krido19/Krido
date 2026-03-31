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
    <div className="p-3 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya sesuatu..."
          className="flex-1 pl-4 pr-4 py-2.5 bg-muted border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:bg-white resize-none h-11 text-sm text-foreground placeholder-gray-400 transition-all"
          rows={1}
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!text.trim() || isTyping}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md bg-primary hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-primary text-white transition-colors"
        >
          {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
      <div className="text-center mt-2">
        <span className="text-[10px] text-gray-400 font-medium">Powered by Gemini AI</span>
      </div>
    </div>
  );
}
