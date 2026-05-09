# Product Listing Mobile App (Flutter)

Flutter mobile app that duplicates the web UI functionality with integrated chatbot.

## Features

- ✅ **Home Screen** - Hero slider, product sections, banners
- ✅ **Products Listing** - Browse all products with grid view
- ✅ **Product Details** - View product details, add to cart
- ✅ **Categories** - Browse products by category
- ✅ **Shopping Cart** - Add/remove items, update quantities
- ✅ **Checkout** - Place orders
- ✅ **Search** - Search products
- ✅ **Wishlist** - Save favorite products
- ✅ **Authentication** - Login and register
- ✅ **Chatbot Integration** - Floating chat button on all screens

## Technology Stack

- **Frontend**: Flutter (Dart)
- **State Management**: Provider
- **Navigation**: GoRouter
- **HTTP Client**: http, dio
- **Backend**: Express.js (Node.js) + Python FastAPI

## Setup Instructions

### Prerequisites

- Flutter SDK (>=3.0.0) - [Download](https://flutter.dev/docs/get-started/install)
- Dart SDK (comes with Flutter)
- Backend running on `http://localhost:5001`
- Python chatbot service running on `http://localhost:8000`

### Quick Setup (Recommended)

#### Windows:
```cmd
cd mobile_app
setup.bat
run.bat
```

#### Mac/Linux:
```bash
cd mobile_app
chmod +x setup.sh run.sh
./setup.sh
./run.sh
```

### Manual Installation

1. **Install dependencies:**
   ```bash
   cd mobile_app
   flutter pub get
   ```

2. **Update API base URL** (if needed):
   - Open `lib/services/api_service.dart`
   - Update `baseUrl` constant (line 7):
     ```dart
     // For Android Emulator
     static const String baseUrl = 'http://10.0.2.2:5001';
     
     // For iOS Simulator
     static const String baseUrl = 'http://localhost:5001';
     
     // For Physical Device (replace with your computer's IP)
     static const String baseUrl = 'http://192.168.1.100:5001';
     ```
   - To find your computer's IP:
     - **Windows**: Run `ipconfig` and look for IPv4 Address
     - **Mac/Linux**: Run `ifconfig` or `ip addr` and look for inet

3. **Run the app:**
   ```bash
   flutter run
   ```

### Environment Configuration

The app uses a hardcoded API base URL in `lib/services/api_service.dart`. Update the `baseUrl` constant based on your testing environment:

- **Android Emulator**: `http://10.0.2.2:5001` (special IP for Android emulator)
- **iOS Simulator**: `http://localhost:5001`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5001` (must be on same network)

## Project Structure

```
mobile_app/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── models/
│   │   └── product.dart          # Product model
│   ├── providers/
│   │   ├── cart_provider.dart    # Cart state management
│   │   ├── wishlist_provider.dart # Wishlist state management
│   │   ├── auth_provider.dart    # Authentication state
│   │   └── product_provider.dart # Products state
│   ├── screens/
│   │   ├── home_screen.dart      # Home page
│   │   ├── products_screen.dart # Products listing
│   │   ├── product_detail_screen.dart # Product details
│   │   ├── categories_screen.dart # Categories
│   │   ├── category_products_screen.dart # Category products
│   │   ├── cart_screen.dart      # Shopping cart
│   │   ├── checkout_screen.dart  # Checkout
│   │   ├── search_screen.dart   # Search
│   │   ├── wishlist_screen.dart # Wishlist
│   │   └── auth/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   ├── services/
│   │   └── api_service.dart     # Backend API communication
│   └── widgets/
│       ├── product_card.dart    # Product card widget
│       └── chat/
│           └── chat_widget.dart # Chatbot widget
└── pubspec.yaml                 # Dependencies
```

## Chatbot Integration

The chatbot is integrated as a floating button that appears on all screens:

- **Location**: `lib/widgets/chat/chat_widget.dart`
- **API Service**: Uses `ApiService.sendChatMessage()` to communicate with Express backend
- **Navigation**: Automatically navigates to suggested pages (e.g., "Show me dresses" → `/categories/women`)
- **Features**:
  - Greets visitors
  - Answers FAQs
  - Product search with navigation
  - Chat history (for authenticated users)

## Backend Integration

The mobile app connects to:
- **Express Backend** (`http://localhost:5001`):
  - `/api/chat/send` - Send chat messages
  - `/api/chat/history` - Get chat history
  - `/api/products` - Get products
  - `/api/auth/login` - Login
  - `/api/auth/register` - Register

- **Python FastAPI** (via Express):
  - Express backend forwards chat requests to Python service
  - Python service processes chatbot logic and returns responses

## State Management

Using **Provider** for state management:
- `CartProvider` - Shopping cart state
- `WishlistProvider` - Wishlist state
- `AuthProvider` - Authentication state
- `ProductProvider` - Products state

## Running the Complete Stack

1. **Start Python Chatbot Service:**
   ```bash
   cd product_listing_app/backend
   ./start_chatbot.sh  # or start_chatbot.bat on Windows
   ```

2. **Start Express Backend:**
   ```bash
   cd product_listing_app/backend
   npm run dev
   ```

3. **Start Flutter App:**
   ```bash
   cd mobile_app
   flutter run
   ```

## Notes

- The chatbot widget appears on all screens via the global builder in `main.dart`
- API calls fall back to mock data if backend is unavailable
- Authentication is optional - chatbot works without login
- Chat history is saved for authenticated users

## Troubleshooting

### Chatbot not responding
- Ensure Express backend is running on port 5001
- Ensure Python chatbot service is running on port 8000
- Check API base URL in `api_service.dart`

### Products not loading
- Check backend API endpoints
- Verify network connectivity
- App will fall back to mock data if API fails

### Navigation not working
- Ensure GoRouter is properly configured
- Check route paths match backend navigation paths

