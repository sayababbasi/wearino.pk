"use client";
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageSquare, Search, Bot, Headphones, Circle } from 'lucide-react';

// Config
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');

interface Message {
    id: number;
    conversationId: string;
    senderRole: 'user' | 'admin' | 'guest' | 'bot';
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface Conversation {
    conversationId: string;
    lastMessage?: string;
    lastActive?: string;
    unread?: number;
    isEscalated?: boolean;
}

export default function AdminChatPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // 1. Initialize Socket & Fetch Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/messages/conversations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    const convMap = new Map<string, Conversation>();
                    data.forEach((msg: any) => {
                        const existing = convMap.get(msg.conversationId);
                        const isTranscript = msg.content?.startsWith('📋 CHAT TRANSCRIPT');
                        const isEscalated = isTranscript || msg.senderRole === 'admin' || (existing?.isEscalated ?? false);

                        convMap.set(msg.conversationId, {
                            conversationId: msg.conversationId,
                            lastMessage: (msg.content || '').substring(0, 60) + ((msg.content?.length || 0) > 60 ? '…' : ''),
                            lastActive: msg.createdAt,
                            unread: (existing?.unread || 0) + (!msg.isRead && msg.senderRole !== 'admin' ? 1 : 0),
                            isEscalated,
                        });
                    });

                    const sorted = Array.from(convMap.values()).sort((a, b) =>
                        new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime()
                    );
                    setConversations(sorted);
                }
            } catch (e) {
                console.error("Failed to load conversations", e);
            }
        };
        fetchConversations();

        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_admin');
        });

        newSocket.on('admin_new_message_notification', (data: { conversationId: string, snippet: string, createdAt: string }) => {
            setConversations(prev => {
                const existing = prev.find(c => c.conversationId === data.conversationId);
                const isEscalated = data.snippet.startsWith('📋 CHAT TRANSCRIPT') || (existing?.isEscalated ?? false);
                const updated: Conversation = {
                    conversationId: data.conversationId,
                    lastMessage: data.snippet,
                    lastActive: data.createdAt,
                    unread: (existing?.unread || 0) + 1,
                    isEscalated,
                };
                return [updated, ...prev.filter(c => c.conversationId !== data.conversationId)];
            });
        });

        newSocket.on('receive_message', (msg: Message) => {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            setConversations(prev => prev.map(c =>
                c.conversationId === msg.conversationId
                    ? { ...c, lastMessage: msg.content.substring(0, 60), lastActive: msg.createdAt }
                    : c
            ));
        });

        return () => { newSocket.disconnect(); };
    }, []);

    // 2. Fetch History when Conversation Selected
    useEffect(() => {
        if (!selectedConversationId) return;
        if (socket) socket.emit('join_conversation', selectedConversationId);

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const res = await fetch(`${API_URL}/api/messages/${selectedConversationId}`);
                const data = await res.json();
                if (Array.isArray(data)) setMessages(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();

        setConversations(prev => prev.map(c =>
            c.conversationId === selectedConversationId ? { ...c, unread: 0 } : c
        ));
    }, [selectedConversationId, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || !socket || !selectedConversationId) return;
        const userStr = localStorage.getItem('user');
        const adminId = userStr ? JSON.parse(userStr).id : 1;

        socket.emit('send_message', {
            conversationId: selectedConversationId,
            senderRole: 'admin',
            content: inputValue,
            senderId: adminId,
        });
        setInputValue("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.conversationId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const selectedConv = conversations.find(c => c.conversationId === selectedConversationId);

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare size={20} /> Live Conversations
                    </h2>
                    <div className="mt-3 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.conversationId}
                            onClick={() => setSelectedConversationId(conv.conversationId)}
                            className={`p-4 cursor-pointer hover:bg-white transition-colors flex items-start gap-3 ${
                                selectedConversationId === conv.conversationId ? 'bg-white border-l-4 border-l-black' : ''
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                                conv.isEscalated ? 'bg-green-600' : 'bg-gray-400'
                            }`}>
                                {conv.isEscalated ? <Headphones size={18} /> : <Bot size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                        {conv.conversationId.startsWith('guest_') ? 'Guest Customer' : `User ${conv.conversationId.replace('user_', '#')}`}
                                    </h4>
                                    {!!conv.unread && (
                                        <span className="bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Circle size={6} className={conv.isEscalated ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'} />
                                    <span className="text-[10px] text-gray-400">
                                        {conv.isEscalated ? 'Human requested' : 'AI bot only'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                            <p>No conversations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConversationId ? (
                    <>
                        {/* Header */}
                        <div className={`p-4 border-b border-gray-200 flex items-center gap-3 ${
                            selectedConv?.isEscalated ? 'bg-green-700 text-white' : 'bg-gray-900 text-white'
                        }`}>
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                {selectedConv?.isEscalated ? <Headphones size={18} /> : <Bot size={18} />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">
                                    {selectedConversationId.startsWith('guest_') ? 'Guest Customer' : 'Registered User'}
                                </h3>
                                <p className="text-xs opacity-70">
                                    {selectedConv?.isEscalated ? '🟢 Escalated — Human reply needed' : '🤖 AI only — no human needed yet'} · {selectedConversationId}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                </div>
                            ) : messages.map((msg, i) => {
                                const isAdmin = msg.senderRole === 'admin';
                                const isTranscript = msg.content?.startsWith('📋 CHAT TRANSCRIPT');
                                return (
                                    <div key={i} className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        {!isAdmin && (
                                            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                                <User size={13} className="text-gray-600" />
                                            </div>
                                        )}
                                        <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                                            isAdmin
                                                ? 'bg-black text-white rounded-br-none'
                                                : isTranscript
                                                    ? 'bg-yellow-50 border border-yellow-200 text-gray-700 rounded-bl-none text-xs font-mono'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                        }`}>
                                            {isTranscript && (
                                                <p className="font-bold text-yellow-700 mb-1 text-xs">📋 AI Conversation Transcript</p>
                                            )}
                                            <p>{isTranscript
                                                ? msg.content.replace('📋 CHAT TRANSCRIPT (AI conversation before escalation):\n\n', '')
                                                : msg.content}
                                            </p>
                                            <span className="text-[10px] mt-1 block opacity-50">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isAdmin ? ' · You' : ' · Customer'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            {!selectedConv?.isEscalated && !messages.some(m => m.senderRole === 'admin') && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                                    ⚠️ This customer is chatting with the AI bot and hasn&apos;t requested a human agent yet.
                                </p>
                            )}
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={selectedConv?.isEscalated ? "Type your reply..." : "You can still reply proactively..."}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Send size={16} />
                                    <span>Send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 gap-2">
                        <MessageSquare size={48} className="opacity-20" />
                        <p className="font-medium">Select a conversation</p>
                        <p className="text-sm text-center max-w-xs">Conversations escalated from the AI bot will appear here in real-time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
