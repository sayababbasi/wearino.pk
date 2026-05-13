"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { io, Socket } from 'socket.io-client';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://wearino-pk.onrender.com').replace(/\/api$/, '');
const SOCKET_URL = API_URL;

interface Message {
    id: number;
    text: string;
    sender: 'bot' | 'user' | 'system';
    timestamp: string;
    isSystemAction?: boolean;
    actionTaken?: boolean;
}



const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 shrink-0 border border-neutral-300">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    </div>
);

const WearinoIcon = () => (
    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shrink-0 border border-black shadow-sm">
        <span className="font-serif italic font-bold text-lg pr-0.5">W</span>
    </div>
);

const TypingDots = () => (
    <div className="flex space-x-1.5 p-1">
        <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"></div>
    </div>
);

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // 'bot' = Python Bot, 'agent' = Human Admin (Socket)
    const [chatMode, setChatMode] = useState<'bot' | 'agent'>('bot');

    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversationId, setConversationId] = useState<string>("");

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Welcome to WEARINO. How can we assist with your look today?',
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
    ]);

    const router = useRouter();
    const pathname = usePathname();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { setHasMounted(true); }, []);

    // Load Conversation ID
    useEffect(() => {
        if (!hasMounted) return;
        let storedId = localStorage.getItem('chat_conversation_id');
        if (!storedId) {
            storedId = `guest_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('chat_conversation_id', storedId);
        }
        setConversationId(storedId);
    }, [hasMounted]);

    // Socket Connection (Only active in Agent mode)
    useEffect(() => {
        if (!hasMounted || chatMode !== 'agent' || !conversationId) return;

        console.log("Connecting to Agent Socket...");
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to agent server');
            newSocket.emit('join_conversation', conversationId);
            // Notify admin? Rely on first message.
        });

        newSocket.on('receive_message', (msg: any) => {
            const isMe = msg.senderRole === 'user' || msg.senderRole === 'guest';
            // Only add messages from Admin (bot role in UI) or if we want to sync
            if (!isMe) {
                setMessages(prev => [...prev, {
                    id: msg.id || Date.now(),
                    text: msg.content,
                    sender: 'bot', // Display as 'bot' icon (the brand icon) even if human
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        });

        newSocket.on('typing', () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [hasMounted, chatMode, conversationId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Listen for custom event to open chat (e.g., from Product Page)
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    if (!hasMounted) return null;

    const switchToAgent = (messageId?: number) => {
        if (chatMode === 'agent') return;

        setChatMode('agent');

        // Mark the message that triggered this as "taken"
        if (messageId) {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, actionTaken: true } : m));
        }

        setMessages(prev => [...prev, {
            id: Date.now(),
            text: "Connecting you to a human agent... Please wait.",
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const content = input;
        setInput('');

        // 1. Optimistic Add
        const userMsg: Message = {
            id: Date.now(),
            text: content,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // 2. Branch Logic
        if (chatMode === 'agent') {
            // --- AGENT MODE (Socket) ---
            if (socket) {
                socket.emit('send_message', {
                    conversationId,
                    senderRole: 'user',
                    content: content
                });
            } else {
                // If socket not ready (unlikely), fallback
                console.warn("Socket not connected yet");
            }
            setIsTyping(false); // Socket 'typing' event handles specific feedback, but for self ignore
        } else {
            // --- BOT MODE (REST API) ---
            try {
                const res = await fetch(`${API_URL}/api/chat/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: content }) // user_id handling is optional in controller
                });

                const data = await res.json();
                setIsTyping(false);

                if (data.success) {
                    const botReply = data.chat?.bot_reply || data.message || "I didn't understand.";

                    // Add Bot Response
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        text: botReply,
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);

                    // Check for navigation
                    if (data.navigate_to) {
                        router.push(data.navigate_to);
                    }

                    // HEURISTIC: Offer Agent if bot seems unsure or user asks
                    const lowerReply = botReply.toLowerCase();
                    const lowerInput = content.toLowerCase();
                    const triggerAgent =
                        lowerReply.includes("i am still learning") ||
                        lowerReply.includes("i didn't understand") ||
                        lowerInput.includes("human") ||
                        lowerInput.includes("admin") ||
                        lowerInput.includes("agent");

                    if (triggerAgent) {
                        setMessages(prev => [...prev, {
                            id: Date.now() + 2,
                            text: "Would you like to speak to an admin?",
                            sender: 'system',
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isSystemAction: true
                        }]);
                    }
                }
            } catch (error) {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: "Sorry, I'm having trouble connecting. connecting you to admin...",
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString()
                }]);
                switchToAgent();
            }
        }
    };

    if (pathname?.startsWith('/admin')) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased flex flex-col items-end">
            <div
                className={`
                    w-[90vw] sm:w-[350px] h-[460px]
                    bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden
                    border border-neutral-300 mb-6 origin-bottom-right 
                    transition-all duration-300 ease-out
                    ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-10 scale-95 pointer-events-none absolute bottom-0 right-0'}
                `}
            >
                {/* Header */}
                <div className="bg-white p-4 flex justify-between items-center shrink-0 border-b-[1.5px] border-neutral-200 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white font-serif italic text-xl border border-black">W</div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-black font-extrabold tracking-wide text-base">
                                {chatMode === 'agent' ? 'LIVE SUPPORT' : 'WEARINO AI'}
                            </span>
                            <span className="text-neutral-500 text-xs font-medium flex items-center gap-1">
                                {isTyping ? (
                                    <span className="text-neutral-600 animate-pulse font-semibold">Typing...</span>
                                ) : (
                                    <><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online</>
                                )}
                            </span>
                        </div>
                    </div>
                    <button onClick={toggleChat} className="text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors p-2 rounded-lg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-white p-4 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-neutral-300">
                    <div className="flex justify-center my-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-md">Today</span>
                    </div>

                    {messages.map((msg, i) => (
                        <React.Fragment key={i}>
                            <div className={`flex w-full gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender !== 'user' && <WearinoIcon />}

                                <div className={`flex flex-col max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        py-3 px-4 text-[15px] font-medium leading-relaxed shadow-sm
                                        ${msg.sender === 'user'
                                            ? 'bg-black text-white rounded-2xl rounded-tr-none'
                                            : msg.sender === 'system'
                                                ? 'bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-xl'
                                                : 'bg-[#E5E5EA] text-black rounded-2xl rounded-tl-none'}
                                    `}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[11px] text-neutral-500 font-medium mt-1.5 px-1">{msg.timestamp}</span>
                                </div>

                                {msg.sender === 'user' && <UserIcon />}
                            </div>

                            {/* System Action Buttons */}
                            {msg.isSystemAction && msg.sender === 'system' && !msg.actionTaken && (
                                <div className="flex justify-center mt-2">
                                    <button
                                        onClick={() => switchToAgent(msg.id)}
                                        className="bg-black text-white text-xs px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                                    >
                                        Yes, Connect me to Admin
                                    </button>
                                </div>
                            )}
                        </React.Fragment>
                    ))}

                    {isTyping && (
                        <div className="flex w-full gap-3 justify-start animate-in fade-in duration-300">
                            <WearinoIcon />
                            <div className="bg-[#E5E5EA] py-4 px-5 rounded-2xl rounded-tl-none flex items-center">
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t-[1.5px] border-neutral-200">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder={chatMode === 'agent' ? "Message the admin..." : "Ask AI..."}
                            className="flex-1 bg-neutral-100 text-black placeholder-neutral-500 border border-neutral-200 
                                       focus:border-black focus:bg-white rounded-xl px-4 py-3 text-sm font-medium 
                                       outline-none transition-all duration-200"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`
                                h-[46px] px-6 min-w-[110px] rounded-xl font-bold text-sm tracking-wide 
                                transition-all duration-200 shadow-sm flex items-center justify-center gap-2
                                ${input.trim()
                                    ? 'bg-black text-white hover:bg-neutral-800 active:scale-95 cursor-pointer'
                                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}
                            `}
                        >
                            <span>SEND</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={toggleChat}
                className={`
                    group relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center 
                    transition-all duration-500 z-[10000]
                    ${isOpen ? 'rotate-90 bg-neutral-900' : 'rotate-0 bg-black hover:scale-105'}
                `}
            >
                {isOpen ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-black rounded-full"></span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
