// API base URL - hardcoded to port 5001 (5000 may be taken by macOS)
// To change, update this value or set NEXT_PUBLIC_API_URL in .env.local
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/api$/, '');

export interface ChatMessage {
  chat_id?: string;
  user_id: number;
  message: string;
  bot_reply: string;
  timestamp?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  chat: ChatMessage;
  navigate_to?: string | null;
}

export interface ChatHistoryResponse {
  success: boolean;
  chats: ChatMessage[];
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/**
 * Send a message to the chatbot
 */
export const sendChatMessage = async (
  message: string
): Promise<SendMessageResponse> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add authorization header only if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to send message" }));
    throw new Error(error.message || "Failed to send message");
  }

  return response.json();
};

/**
 * Get chat history for the current user
 */
export const getChatHistory = async (): Promise<ChatHistoryResponse> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add authorization header only if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch chat history" }));
    throw new Error(error.message || "Failed to fetch chat history");
  }

  return response.json();
};

