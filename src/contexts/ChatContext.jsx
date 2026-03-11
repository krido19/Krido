import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

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
  const [sessionId, setSessionId] = useState(null);

  // Initialize or fetch session when widget opens
  useEffect(() => {
     if (isWidgetOpen && !sessionId) {
        initSession();
     }
  }, [isWidgetOpen]);

  // Listen to realtime messages if in Human Handoff mode
  useEffect(() => {
      if (!isHumanHandoff || !sessionId) return;

      const channel = supabase.channel(`chat_${sessionId}`)
         .on(
             'postgres_changes',
             { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
             (payload) => {
                 const newMessage = payload.new;
                 if (newMessage.role === 'admin') {
                     addMessage({
                         id: newMessage.id,
                         role: 'model', // Render as the AI chat bubble but text is from admin
                         content: newMessage.content,
                         type: 'text',
                         isAdmin: true
                     });
                 }
             }
         )
         .subscribe();

      return () => {
          supabase.removeChannel(channel);
      }
  }, [isHumanHandoff, sessionId]);

  const initSession = async () => {
      // Create a persistent session in Supabase when the chat is opened
      let visitorId = localStorage.getItem('chat_visitor_id');
      if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('chat_visitor_id', visitorId);
      }

      const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{ visitor_id: visitorId, status: 'ai_active' }])
          .select()
          .single();
          
      if (data) {
          setSessionId(data.id);
      }
  };

  const handleCreateHandoff = async () => {
      setIsHumanHandoff(true);
      if (sessionId) {
          await supabase.from('chat_sessions').update({ status: 'human_requested' }).eq('id', sessionId);
      }
  };

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
      // If Human Handoff is active, send direct to Supabase bypassing Gemini
      if (isHumanHandoff && sessionId) {
          setIsTyping(false); // No AI typing delay
          await supabase.from('chat_messages').insert([{
              session_id: sessionId,
              role: 'user',
              content: content
          }]);
          return;
      }

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
        if (data.functionName === 'request_human_handoff') {
            handleCreateHandoff();
            addMessage({
              id: Date.now().toString(),
              role: 'model',
              content: 'I have requested an Admin to join the chat. Please wait a moment while they connect...',
              type: 'text'
            });
        } else {
            addMessage({
              id: Date.now().toString(),
              role: 'model',
              content: data.text || '',
              type: 'function_call',
              functionName: data.functionName,
              functionArgs: data.functionArgs
            });
        }
      } else {
        addMessage({
          id: Date.now().toString(),
          role: 'model',
          content: data.text,
          type: 'text'
        });
        
        // Save AI reply to DB if session exists
        if (sessionId) {
            await Promise.all([
               supabase.from('chat_messages').insert([{ session_id: sessionId, role: 'user', content: userMessage.content }]),
               supabase.from('chat_messages').insert([{ session_id: sessionId, role: 'ai', content: data.text }])
            ]);
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
