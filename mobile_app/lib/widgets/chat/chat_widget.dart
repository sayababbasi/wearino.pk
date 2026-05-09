import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';

class ChatWidget extends StatefulWidget {
  const ChatWidget({super.key});

  @override
  State<ChatWidget> createState() => _ChatWidgetState();
}

class _ChatWidgetState extends State<ChatWidget> {
  bool _isOpen = false;
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _messages.add(ChatMessage(
      text: 'Welcome to FASHION. How can we assist with your look today?',
      isBot: true,
      timestamp: DateTime.now(),
    ));
    _loadChatHistory();
  }

  Future<void> _loadChatHistory() async {
    try {
      final history = await ApiService.getChatHistory();
      if (history.isNotEmpty) {
        setState(() {
          _messages.clear();
          _messages.add(ChatMessage(
            text: 'Welcome to FASHION. How can we assist with your look today?',
            isBot: true,
            timestamp: DateTime.now(),
          ));
          for (var chat in history) {
            _messages.add(ChatMessage(
              text: chat['message'] ?? '',
              isBot: false,
              timestamp: DateTime.parse(chat['timestamp'] ?? DateTime.now().toIso8601String()),
            ));
            _messages.add(ChatMessage(
              text: chat['bot_reply'] ?? '',
              isBot: true,
              timestamp: DateTime.parse(chat['timestamp'] ?? DateTime.now().toIso8601String()),
            ));
          }
        });
        _scrollToBottom();
      }
    } catch (e) {
      // Ignore errors loading history
    }
  }

  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty || _isLoading) return;

    // Add user message
    setState(() {
      _messages.add(ChatMessage(
        text: message,
        isBot: false,
        timestamp: DateTime.now(),
      ));
      _isLoading = true;
    });
    _messageController.clear();
    _scrollToBottom();

    try {
      final response = await ApiService.sendChatMessage(message);
      
      final botReply = response['chat']?['bot_reply'] ?? 'Sorry, something went wrong.';
      final navigateTo = response['navigate_to'];

      setState(() {
        _messages.add(ChatMessage(
          text: botReply,
          isBot: true,
          timestamp: DateTime.now(),
        ));
        _isLoading = false;
      });
      _scrollToBottom();

      // Handle navigation if chatbot suggests a path
      if (navigateTo != null && navigateTo.toString().isNotEmpty) {
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) {
            context.go(navigateTo.toString());
            setState(() {
              _isOpen = false;
            });
          }
        });
      }
    } catch (e) {
      setState(() {
        _messages.add(ChatMessage(
          text: 'I am having trouble connecting to the server. Please make sure the backend is running on port 5001.',
          isBot: true,
          timestamp: DateTime.now(),
        ));
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Chat window overlay (when open) - blocks interaction with content
        if (_isOpen)
          Positioned.fill(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _isOpen = false;
                });
              },
              child: Container(
                color: Colors.black.withOpacity(0.3),
              ),
            ),
          ),

        // Floating button - always visible and clickable
        Positioned(
          bottom: 20,
          right: 20,
          child: FloatingActionButton(
            onPressed: () {
              setState(() {
                _isOpen = !_isOpen;
              });
            },
            backgroundColor: Colors.black,
            elevation: 8,
            child: Icon(
              _isOpen ? Icons.close : Icons.chat,
              color: Colors.white,
            ),
          ),
        ),

        // Chat window
        if (_isOpen)
          Positioned(
            bottom: 80,
            right: 20,
            child: GestureDetector(
                onTap: () {}, // Prevent tap from closing when clicking inside
                child: Container(
                  width: MediaQuery.of(context).size.width * 0.9,
                  height: MediaQuery.of(context).size.height * 0.7,
                  constraints: const BoxConstraints(
                    maxWidth: 400,
                    maxHeight: 600,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Header
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(16),
                            topRight: Radius.circular(16),
                          ),
                        ),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: Colors.white,
                              child: Text(
                                'F',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'FASHION',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    'Online',
                                    style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, color: Colors.white),
                              onPressed: () {
                                setState(() {
                                  _isOpen = false;
                                });
                              },
                            ),
                          ],
                        ),
                      ),

                      // Messages
                      Expanded(
                        child: ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: _messages.length + (_isLoading ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == _messages.length && _isLoading) {
                              return const Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: Colors.grey,
                                      radius: 16,
                                      child: Text('F', style: TextStyle(color: Colors.white, fontSize: 12)),
                                    ),
                                    SizedBox(width: 8),
                                    SizedBox(
                                      width: 40,
                                      height: 40,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    ),
                                  ],
                                ),
                              );
                            }

                            final message = _messages[index];
                            return ChatBubble(message: message);
                          },
                        ),
                      ),

                      // Input
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border(
                            top: BorderSide(color: Colors.grey.shade200),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _messageController,
                                decoration: InputDecoration(
                                  hintText: 'Type a message...',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(24),
                                    borderSide: BorderSide(color: Colors.grey.shade300),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                ),
                                onSubmitted: (_) => _sendMessage(),
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              onPressed: _sendMessage,
                              icon: const Icon(Icons.send),
                              color: Colors.black,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isBot;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isBot,
    required this.timestamp,
  });
}

class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment:
            message.isBot ? MainAxisAlignment.start : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (message.isBot) ...[
            const CircleAvatar(
              backgroundColor: Colors.grey,
              radius: 16,
              child: Text(
                'F',
                style: TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: message.isBot ? Colors.grey.shade200 : Colors.black,
                borderRadius: BorderRadius.circular(16).copyWith(
                  bottomLeft: message.isBot ? Radius.zero : null,
                  bottomRight: message.isBot ? null : Radius.zero,
                ),
              ),
              child: Text(
                message.text,
                style: TextStyle(
                  color: message.isBot ? Colors.black : Colors.white,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          if (!message.isBot) ...[
            const SizedBox(width: 8),
            const CircleAvatar(
              backgroundColor: Colors.grey,
              radius: 16,
              child: Icon(Icons.person, size: 16, color: Colors.white),
            ),
          ],
        ],
      ),
    );
  }
}

