import ChatLog from "../models/ChatLog.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Get bot response from Python FastAPI service
const getBotResponseFromPython = async (message, userId = null) => {
  try {
    const pythonServiceUrl = process.env.PYTHON_CHATBOT_URL || 'http://localhost:8000';
    const response = await fetch(`${pythonServiceUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        user_id: userId || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python service responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.response || data.text || "I'm sorry, I didn't understand that.",
      navigate_to: data.navigate_to || null,
    };
  } catch (error) {
    console.error('Error calling Python chatbot service:', error);
    // Fallback to simple rule-based response
    return {
      text: getSimpleBotReply(message),
      navigate_to: null,
    };
  }
};

// Simple fallback bot response
const getSimpleBotReply = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes("hello") || msg.includes("hi")) return "Hello! How can I help you today?";
  if (msg.includes("price")) return "You can check the product prices on our catalog page.";
  if (msg.includes("thanks") || msg.includes("thank")) return "You're welcome!";
  if (msg.includes("help")) return "I can help you find products, answer questions, or navigate the site. What would you like to know?";
  return "I am still learning. Can you rephrase?";
};

// POST /api/chat/send
export const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null; // Handle optional auth
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ 
      success: false,
      message: "Message is required" 
    });
  }

  // Get response from Python chatbot service
  const botResponse = await getBotResponseFromPython(message, userId);
  
  // Save to database only if user is authenticated
  let chat = null;
  if (userId) {
    try {
      chat = await ChatLog.create({
        user_id: userId,
        message,
        bot_reply: botResponse.text,
      });
    } catch (dbError) {
      console.error('Error saving chat to database:', dbError);
      // Continue even if database save fails
    }
  }

  res.status(201).json({
    success: true,
    message: "Message sent",
    chat: chat || {
      message,
      bot_reply: botResponse.text,
    },
    navigate_to: botResponse.navigate_to, // Include navigation path if provided
  });
});

// GET /api/chat/history
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  // If no user, return empty history
  if (!userId) {
    return res.status(200).json({
      success: true,
      chats: [],
    });
  }

  try {
    const chats = await ChatLog.findAll({
      where: { user_id: userId },
      order: [["timestamp", "ASC"]],
    });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(200).json({
      success: true,
      chats: [],
    });
  }
});
