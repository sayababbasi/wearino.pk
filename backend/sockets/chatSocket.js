import Message from "../models/Message.js";

export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined ${conversationId}`);
        });

        // Admin joining the global admin room or monitoring all
        socket.on('join_admin', () => {
            socket.join('admin_notifications');
            console.log(`Admin ${socket.id} joined notification channel`);
        });

        // Send a message
        socket.on('send_message', async (data) => {
            // data: { conversationId, senderId, senderRole ('user'|'admin'), content }
            const { conversationId, senderId, senderRole, content } = data;

            try {
                // Save to DB
                const newMessage = await Message.create({
                    conversationId,
                    senderId: senderId || null,
                    senderRole,
                    content,
                    isRead: false
                });

                // Emit to the specific conversation room (User <-> Admin)
                io.to(conversationId).emit('receive_message', newMessage);

                // If user sent it, notify admin room
                if (senderRole === 'user' || senderRole === 'guest') {
                    io.to('admin_notifications').emit('admin_new_message_notification', {
                        conversationId,
                        snippet: content.substring(0, 50),
                        createdAt: newMessage.createdAt
                    });
                }

            } catch (err) {
                console.error('Error saving message:', err);
            }
        });

        // Typing indicators
        socket.on('typing', (data) => {
            socket.to(data.conversationId).emit('typing', data);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
