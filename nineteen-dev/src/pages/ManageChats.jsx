import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MessageSquare, Send, CheckCircle2, Clock, User, Bot } from 'lucide-react';
import SEO from '../components/SEO';

const ManageChats = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    const sessionChannel = supabase
      .channel('public:chat_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => fetchSessions())
      .subscribe();
    return () => supabase.removeChannel(sessionChannel);
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    fetchMessages(activeSession.id);

    const messageChannel = supabase
      .channel(`admin_chat_${activeSession.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${activeSession.id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();
    return () => supabase.removeChannel(messageChannel);
  }, [activeSession]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setSessions(data);
  };

  const fetchMessages = async (sessionId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleAcceptChat = async (session) => {
    await supabase.from('chat_sessions').update({ status: 'human_active' }).eq('id', session.id);
    setActiveSession(session);
  };

  const handleResolveChat = async () => {
    if (!activeSession) return;
    await supabase.from('chat_sessions').update({ status: 'resolved' }).eq('id', activeSession.id);
    setActiveSession(null);
    setMessages([]);
    fetchSessions();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;
    const sentMsg = newMessage;
    setNewMessage('');
    await supabase.from('chat_messages').insert([{
      session_id: activeSession.id,
      role: 'admin',
      content: sentMsg
    }]);
  };

  const getSessionStatus = (status) => {
    switch (status) {
      case 'human_requested':
        return { label: 'Butuh Admin', cls: 'bg-red-50 text-red-600 animate-pulse' };
      case 'human_active':
        return { label: 'Aktif', cls: 'bg-emerald-50 text-emerald-700' };
      case 'resolved':
        return { label: 'Selesai', cls: 'bg-gray-100 text-gray-500' };
      default:
        return { label: status, cls: 'bg-blue-50 text-primary' };
    }
  };

  return (
    <div className="h-[calc(100vh-128px)] flex flex-col">
      <SEO title="Live Chat Support" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Live Chat Support</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Monitor & balas pesan pengunjung</p>
        </div>
        <span className="ml-auto bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-full">
          {sessions.filter(s => s.status === 'human_requested').length} menunggu
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Sessions List */}
        <div className="w-72 shrink-0 bg-white rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Sesi Aktif</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-gray-300">
                <MessageSquare className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">Tidak ada sesi</p>
              </div>
            ) : sessions.map(s => {
              const { label, cls } = getSessionStatus(s.status);
              const isActive = activeSession?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleAcceptChat(s)}
                  className={`w-full text-left p-3 rounded-md transition-all ${
                    isActive ? 'bg-primary text-white' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-foreground'}`}>
                      {s.visitor_id.split('-')[0]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ml-1 ${isActive ? 'bg-white/20 text-white' : cls}`}>
                      {label}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(s.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-lg flex flex-col overflow-hidden">
          {activeSession ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Visitor: {activeSession.visitor_id.split('-')[0]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activeSession.status === 'human_active' ? '● Sedang Aktif' : getSessionStatus(activeSession.status).label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResolveChat}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-secondary text-sm font-bold rounded-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Selesaikan
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'admin' && (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'assistant' ? 'bg-primary' : 'bg-gray-200'}`}>
                        {msg.role === 'assistant'
                          ? <Bot className="w-3.5 h-3.5 text-white" />
                          : <User className="w-3.5 h-3.5 text-gray-500" />}
                      </div>
                    )}
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'admin'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : msg.role === 'assistant'
                          ? 'bg-blue-50 text-foreground rounded-tl-sm border border-blue-100'
                          : 'bg-white text-foreground rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-0.5">
                        {msg.role === 'admin' ? 'Admin' : msg.role === 'assistant' ? 'AI' : 'Visitor'}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'admin' && (
                      <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="px-4 py-3 border-t border-gray-100 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik balasan sebagai Admin..."
                  className="input-flat flex-1"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <MessageSquare className="w-14 h-14 mb-4" />
              <p className="font-semibold text-sm">Pilih sesi dari sidebar</p>
              <p className="text-xs text-gray-400 mt-1">untuk melihat percakapan dan membalas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageChats;
