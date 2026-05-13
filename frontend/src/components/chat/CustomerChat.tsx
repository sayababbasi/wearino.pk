"use client";
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send, Bot, User, ChevronDown, Headphones, Star } from 'lucide-react';

// Config
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://wearino-pk.onrender.com/api').replace(/\/api$/, '');

interface Message {
  id?: number;
  senderRole: 'user' | 'admin' | 'guest' | 'bot';
  content: string;
  createdAt: string;
  isBot?: boolean;
}

type ChatMode = 'bot' | 'human';
type ChatState = 'active' | 'ended' | 'rated';

export default function CustomerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [chatMode, setChatMode] = useState<ChatMode>('bot');
  const [chatState, setChatState] = useState<ChatState>('active');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    let storedId = localStorage.getItem('chat_conversation_id');
    if (!storedId) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          storedId = `user_${user.id}`;
        } catch {
          storedId = `guest_${Math.random().toString(36).substring(2, 9)}`;
        }
      } else {
        storedId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      }
      localStorage.setItem('chat_conversation_id', storedId);
    }
    setConversationId(storedId);

    const savedMode = localStorage.getItem('chat_mode') as ChatMode | null;
    if (savedMode) setChatMode(savedMode);

    const savedState = localStorage.getItem('chat_state') as ChatState | null;
    if (savedState) setChatState(savedState);

    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/${storedId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setChatMode('human');
          localStorage.setItem('chat_mode', 'human');
          setMessages(data.map((m: any) => ({ ...m, isBot: false })));
          return;
        }
      } catch (e) { /* stay in bot mode */ }
    };
    loadHistory();

    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_conversation', storedId);
    });

    newSocket.on('receive_message', (msg: Message) => {
      if (msg.senderRole === 'admin') {
        setMessages(prev => [...prev, { ...msg, isBot: false }]);
        if (!isOpen) setUnreadCount(c => c + 1);
      }
    });

    return () => { newSocket.disconnect(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Send to AI bot
  const sendToBotMode = async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    setInputValue("");

    setMessages(prev => [...prev, {
      senderRole: 'user',
      content: userMsg,
      createdAt: new Date().toISOString(),
      isBot: false,
    }]);
    setIsBotTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      const botReply = data.chat?.bot_reply || "I'm having trouble understanding that. Would you like to speak with a human agent?";

      setMessages(prev => [...prev, {
        senderRole: 'bot' as any,
        content: botReply,
        createdAt: new Date().toISOString(),
        isBot: true,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        senderRole: 'bot' as any,
        content: "I'm having trouble connecting. Would you like to speak with a human agent?",
        createdAt: new Date().toISOString(),
        isBot: true,
      }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Send to human agent
  const sendToHumanMode = () => {
    if (!inputValue.trim() || !socket || !conversationId) return;
    const userMsg = inputValue.trim();
    setInputValue("");

    socket.emit('send_message', {
      conversationId,
      senderRole: 'user',
      content: userMsg,
    });

    setMessages(prev => [...prev, {
      senderRole: 'user',
      content: userMsg,
      createdAt: new Date().toISOString(),
      isBot: false,
    }]);
  };

  // Escalate to human
  const escalateToHuman = async () => {
    setIsEscalating(true);
    try {
      const summaryLines = messages
        .map(m => `[${m.isBot ? 'BOT' : 'CUSTOMER'}] ${m.content}`)
        .join('\n');

      if (summaryLines && socket) {
        socket.emit('send_message', {
          conversationId,
          senderRole: 'user',
          content: `📋 CHAT TRANSCRIPT (AI conversation before escalation):\n\n${summaryLines}`,
        });
      }

      await new Promise(r => setTimeout(r, 500));

      setChatMode('human');
      localStorage.setItem('chat_mode', 'human');

      // Add the "connected" system message
      setMessages(prev => [...prev, {
        senderRole: 'bot' as any,
        content: '🎧 You are now connected with a live support agent from Wearino.pk. Please describe your issue and our team will respond shortly.',
        createdAt: new Date().toISOString(),
        isBot: true,
        isSystem: true,
      } as any]);
    } catch (e) {
      console.error("Escalation failed", e);
    } finally {
      setIsEscalating(false);
    }
  };

  // End conversation
  const endConversation = () => {
    setChatState('ended');
    localStorage.setItem('chat_state', 'ended');
    setMessages(prev => [...prev, {
      senderRole: 'bot' as any,
      content: '✅ This conversation has been closed. Thank you for contacting Wearino.pk support!',
      createdAt: new Date().toISOString(),
      isBot: true,
    }]);
  };

  // Submit rating
  const submitRating = (rating: number) => {
    setSelectedRating(rating);
    setChatState('rated');
    localStorage.setItem('chat_state', 'rated');
    // Optionally send rating to backend here
    console.log(`Chat rated: ${rating}/5 for conversation ${conversationId}`);
  };

  const handleSend = () => {
    if (chatState !== 'active') return;
    if (chatMode === 'bot') sendToBotMode();
    else sendToHumanMode();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all z-50 flex items-center gap-2"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && <span className="font-medium text-sm">Chat with us</span>}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden">

          {/* Header */}
          <div className={`px-4 py-3 flex justify-between items-center ${chatMode === 'human' ? 'bg-green-700' : 'bg-black'} text-white transition-colors duration-500`}>
            <div className="flex items-center gap-2">
              {chatMode === 'bot' ? <Bot size={18} /> : <Headphones size={18} />}
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {chatMode === 'bot' ? 'Wearino AI Assistant' : 'Wearino Live Support'}
                </h3>
                <p className="text-xs opacity-60">
                  {chatMode === 'bot' ? 'Powered by AI · Usually instant' : '👤 Human agent connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {chatState === 'active' && chatMode === 'human' && (
                <button
                  onClick={endConversation}
                  className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition"
                >
                  End chat
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Sub-banner: escalation prompt or connected notice */}
          {chatMode === 'bot' && chatState === 'active' && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Talking to AI bot. Need a human?</p>
              <button
                onClick={escalateToHuman}
                disabled={isEscalating}
                className="text-xs font-semibold text-black underline underline-offset-2 hover:text-gray-600 disabled:opacity-50 shrink-0 ml-2"
              >
                {isEscalating ? 'Connecting…' : 'Talk to agent →'}
              </button>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
                <Bot size={32} className="opacity-30" />
                <p className="text-sm">Hi! I'm the Wearino AI assistant.</p>
                <p className="text-xs">Ask me anything about products, orders, or shipping.</p>
              </div>
            )}

            {messages.map((msg: any, i) => {
              const isMe = msg.senderRole === 'user' || msg.senderRole === 'guest';
              const isBot = msg.isBot || msg.senderRole === 'bot';
              const isSystem = msg.isSystem;

              // System "connected" messages get a centered pill style
              if (isSystem) {
                return (
                  <div key={i} className="flex justify-center">
                    <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-2 rounded-full text-center max-w-[85%]">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.senderRole === 'admin' ? 'bg-green-600' : 'bg-gray-200'
                    }`}>
                      {msg.senderRole === 'admin'
                        ? <User size={12} className="text-white" />
                        : <Bot size={12} className="text-gray-600" />
                      }
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    isMe
                      ? 'bg-black text-white rounded-br-none'
                      : msg.senderRole === 'admin'
                        ? 'bg-green-700 text-white rounded-bl-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {!isMe && msg.senderRole === 'admin' && (
                      <p className="text-[10px] text-green-200 mb-0.5 font-semibold">Support Agent</p>
                    )}
                    <p>{msg.content}</p>
                    <span className={`text-[10px] mt-1 block opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Bot typing */}
            {isBotTyping && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot size={12} className="text-gray-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Rating UI — shown when conversation ended */}
          {chatState === 'ended' && (
            <div className="p-5 bg-white border-t border-gray-100 flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-gray-800">How was your experience?</p>
              <p className="text-xs text-gray-500 text-center">Rate your chat with Wearino Support</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${
                        star <= (hoverRating || selectedRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thank-you after rating */}
          {chatState === 'rated' && (
            <div className="p-5 bg-white border-t border-gray-100 flex flex-col items-center gap-2 text-center">
              <div className="text-2xl">🎉</div>
              <p className="font-semibold text-sm text-gray-800">Thank you for your feedback!</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={18}
                    className={star <= selectedRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">Your review helps us improve our support.</p>
            </div>
          )}

          {/* Input — only shown when active */}
          {chatState === 'active' && (
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={chatMode === 'bot' ? "Ask the AI assistant…" : "Message live agent…"}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isBotTyping || isEscalating}
                  className="text-black disabled:text-gray-300 hover:scale-110 transition-transform"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-center mt-1 text-[10px] text-gray-400">
                Powered by Wearino.pk Support
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
