import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hi! I am the portfolio assistant. How can I help you today? You can ask me about projects, contact info, or my skills.',
      type: 'text'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isHumanHandoff, setIsHumanHandoff] = useState(false);

  const toggleWidget = useCallback(() => {
    setIsWidgetOpen(prev => !prev);
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send message to the serverless function
      const history = [...messages, userMessage].map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();
      setIsTyping(false);

      if (!res.ok) {
         addMessage({
          id: Date.now().toString(),
          role: 'model',
          content: 'Sorry, I encountered an error communicating with the server.',
          type: 'text'
        });
        return;
      }

      if (data.type === 'function_call') {
        addMessage({
          id: Date.now().toString(),
          role: 'model',
          content: data.text || '',
          type: 'function_call',
          functionName: data.functionName,
          functionArgs: data.functionArgs
        });
      } else {
        addMessage({
          id: Date.now().toString(),
          role: 'model',
          content: data.text,
          type: 'text'
        });
        
        // Very basic mock human handoff logic
        if (data.text.toLowerCase().includes('human')) {
            setIsHumanHandoff(true);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      addMessage({
        id: Date.now().toString(),
        role: 'model',
        content: 'Sorry, there was a network error.',
        type: 'text'
      });
    }
  }, [messages, addMessage]);

  return (
    <ChatContext.Provider value={{
      messages,
      isTyping,
      isWidgetOpen,
      isHumanHandoff,
      toggleWidget,
      sendMessage,
      addMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatStore = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatStore must be used within a ChatProvider');
  }
  return context;
};
