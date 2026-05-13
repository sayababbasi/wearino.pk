import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Base URL - Update this to match your backend
  static const String baseUrl = 'https://wearino-pk.onrender.com';
  // For Android emulator, use: 'http://10.0.2.2:5001'
  // For iOS simulator, use: 'http://localhost:5001'
  // For physical device, use your computer's IP: 'http://192.168.x.x:5001'

  // Get auth token from storage
  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Get headers with optional auth
  static Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      final token = await _getAuthToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    
    return headers;
  }

  // ========== CHAT API ==========
  
  /// Send a message to the chatbot
  static Future<Map<String, dynamic>> sendChatMessage(String message) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/api/chat/send'),
        headers: headers,
        body: jsonEncode({'message': message}),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to send message: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error sending chat message: $e');
    }
  }

  /// Get chat history
  static Future<List<Map<String, dynamic>>> getChatHistory() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/api/chat/history'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['chats'] ?? []);
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  // ========== PRODUCT API ==========
  
  /// Get all products
  static Future<List<Map<String, dynamic>>> getProducts({
    String? category,
    String? search,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (category != null) queryParams['category'] = category;
      // Backend doesn't have search parameter, so we'll filter client-side
      // But we still fetch all products and filter by name

      final uri = Uri.parse('$baseUrl/api/product').replace(queryParameters: queryParams);
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        var products = List<Map<String, dynamic>>.from(data['products'] ?? []);
        
        // Client-side search filtering if search term provided
        if (search != null && search.isNotEmpty) {
          final searchLower = search.toLowerCase();
          products = products.where((product) {
            final name = (product['name'] ?? '').toString().toLowerCase();
            final description = (product['description'] ?? '').toString().toLowerCase();
            return name.contains(searchLower) || description.contains(searchLower);
          }).toList();
        }
        
        return products;
      } else {
        return [];
      }
    } catch (e) {
      // Fallback to mock data if API fails
      return _getMockProducts();
    }
  }

  /// Get product by ID
  static Future<Map<String, dynamic>?> getProductById(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/product/$id'));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['product'];
      } else {
        return null;
      }
    } catch (e) {
      // Fallback to mock data
      final products = _getMockProducts();
      return products.firstWhere(
        (p) => p['product_id'] == id,
        orElse: () => products.first,
      );
    }
  }

  // ========== AUTH API ==========
  
  /// Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Save token
        if (data['token'] != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', data['token']);
        }
        return data;
      } else {
        throw Exception('Login failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error logging in: $e');
    }
  }

  /// Register
  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        // Save token
        if (data['token'] != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', data['token']);
        }
        return data;
      } else {
        throw Exception('Registration failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error registering: $e');
    }
  }

  /// Logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  // ========== INQUIRY/CONTACT API ==========
  
  /// Submit contact form inquiry
  static Future<bool> submitInquiry({
    required String name,
    required String email,
    required String message,
    String? subject,
    int? productId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/inquiry'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'message': message,
          if (subject != null) 'subject': subject,
          if (productId != null) 'productId': productId,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  // ========== MOCK DATA (Fallback) ==========
  
  static List<Map<String, dynamic>> _getMockProducts() {
    return [
      {
        'product_id': '1',
        'name': 'Classic White Tee',
        'description': 'A timeless classic white tee made from premium cotton.',
        'price': 29.99,
        'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
        'rating': 4.5,
        'category_name': 'Women',
        'tags': ['New'],
      },
      {
        'product_id': '2',
        'name': 'Denim Jacket',
        'description': 'Classic denim jacket with a modern fit.',
        'price': 79.99,
        'image': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
        'rating': 4.8,
        'category_name': 'Women',
        'tags': ['Sale'],
        'discount': 20,
      },
    ];
  }
}

