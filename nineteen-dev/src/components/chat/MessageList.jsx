import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import ProjectCard from './ProjectCard';
import ContactCard from './ContactCard';

export default function MessageList() {
  const { messages, isTyping } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-1">
      {messages.map((msg) => {
        if (msg.type === 'text') {
          return <MessageBubble key={msg.id} message={msg} />;
        } else if (msg.type === 'function_call') {
          return (
            <React.Fragment key={msg.id}>
              {msg.content && <MessageBubble message={{ ...msg, type: 'text' }} />}
              {msg.functionName === 'show_portfolio_projects' && <ProjectCard data={msg.functionArgs} />}
              {msg.functionName === 'show_contact_info' && <ContactCard />}
            </React.Fragment>
          );
        }
        return null;
      })}

      {isTyping && (
        <div className="flex justify-start mb-4">
          <div className="px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
