import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageChats = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // 1. Fetch Chat Sessions
    useEffect(() => {
        fetchSessions();

        // Listen for new sessions needing human help
        const sessionChannel = supabase.channel('public:chat_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, payload => {
                fetchSessions(); // Refresh list on any session change
            })
            .subscribe();

        return () => supabase.removeChannel(sessionChannel);
    }, []);

    // 2. Fetch Messages when a session is selected
    useEffect(() => {
        if (!activeSession) return;

        fetchMessages(activeSession.id);

        // Listen for new messages in this session
        const messageChannel = supabase.channel(`admin_chat_${activeSession.id}`)
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
        // Mark session as human_active
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
        setNewMessage(''); // Clear input optimistically

        await supabase.from('chat_messages').insert([{
            session_id: activeSession.id,
            role: 'admin',
            content: sentMsg
        }]);
    };

    return (
        <div className="p-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 mr-4 text-gray-400 bg-gray-800 rounded-full hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 tracking-wider">
                        Live Chat Support
                    </h1>
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Sidebar: Sessions List */}
                <div className="w-1/3 bg-gray-900/80 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-800 bg-gray-900 font-bold text-gray-300">
                        Active Sessions
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {sessions.map(s => (
                            <div 
                                key={s.id} 
                                onClick={() => handleAcceptChat(s)}
                                className={`p-4 rounded-lg cursor-pointer border transition-all ${activeSession?.id === s.id ? 'bg-cyan-900/30 border-cyan-500' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white max-w-[150px] truncate">{s.visitor_id.split('-')[0]}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'human_requested' ? 'bg-pink-500/20 text-pink-500 border border-pink-500/50 animate-pulse' : s.status === 'human_active' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-gray-800 text-gray-400'}`}>
                                        {s.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">{new Date(s.updated_at).toLocaleTimeString()}</span>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="text-center text-gray-600 p-8">No active chats.</div>
                        )}
                    </div>
                </div>

                {/* Main: Chat Window */}
                <div className="flex-1 bg-gray-900/80 border border-gray-800 rounded-xl flex flex-col overflow-hidden relative">
                    {activeSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                                <span className="font-bold text-cyan-400">Chatting with Visitor: {activeSession.visitor_id.split('-')[0]}</span>
                                <button 
                                    onClick={handleResolveChat}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-full flex items-center transition-colors shadow-lg"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Resolved
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-3 rounded-2xl ${
                                            msg.role === 'admin' 
                                                ? 'bg-cyan-600 text-white rounded-tr-sm' 
                                                : msg.role === 'user' 
                                                    ? 'bg-gray-800 text-gray-200 rounded-tl-sm'
                                                    : 'bg-pink-900/40 border border-pink-500/30 text-pink-100 rounded-tl-sm' /* AI msg */
                                        }`}>
                                            <div className="text-xs opacity-50 mb-1 font-mono uppercase tracking-wider">{msg.role}</div>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message as Admin..."
                                    className="flex-1 bg-black/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black p-3 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                            <p>Select a session from the sidebar to view chat history or reply.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageChats;
