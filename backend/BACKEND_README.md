# Shopping Website - Backend Documentation

## 📋 Overview

This is a **Node.js + Express** backend for a full-featured e-commerce shopping website. It includes user authentication, product management, shopping cart, orders, wishlists, payments, chatbot support, and admin dashboard analytics.

---

## 🚀 Features Included

### 1. **Authentication & Authorization** 🔐

- User registration and login
- JWT (JSON Web Token) based authentication
- Password hashing with bcryptjs
- Role-based access control (User & Admin)
- Protected routes with `protect` and `isAdmin` middleware

**Files:**

- `controllers/authController.js`
- `routes/authRoutes.js`
- `middleware/authMiddleware.js`

**Endpoints:**

```
POST /api/auth/register   - Register a new user
POST /api/auth/login      - User login
```

---

### 2. **Product Management** 📦

- CRUD operations for products
- Image upload to Cloudinary
- Category-based product organization
- Product listing with category details
- Admin-only product creation/updates

**Files:**

- `controllers/productController.js`
- `routes/productRoutes.js`
- `models/Product.js`
- `middleware/upload.js` (Cloudinary integration)

**Endpoints:**

```
GET    /api/product           - Get all products
GET    /api/product/:id       - Get single product
POST   /api/product           - Create product (Admin only)
PUT    /api/product/:id       - Update product (Admin only)
DELETE /api/product/:id       - Delete product (Admin only)
```

---

### 3. **Category Management** 📂

- Create, read, update, and delete product categories
- Admin-only category management
- Product association with categories

**Files:**

- `controllers/categoryController.js`
- `routes/categoryRoutes.js`
- `models/Category.js`

**Endpoints:**

```
GET    /api/category         - Get all categories
GET    /api/category/:id     - Get single category
POST   /api/category         - Create category (Admin only)
PUT    /api/category/:id     - Update category (Admin only)
DELETE /api/category/:id     - Delete category (Admin only)
```

---

### 4. **Shopping Cart** 🛒

- Add/remove items from cart
- Update cart item quantities
- Cart persistence per user
- Cart item management

**Files:**

- `controllers/cartController.js`
- `routes/cartRoutes.js`
- `models/Cart.js`
- `models/CartItem.js`

**Endpoints:**

```
GET    /api/cart              - Get user's cart
POST   /api/cart/items        - Add item to cart
PUT    /api/cart/items/:id    - Update cart item
DELETE /api/cart/items/:id    - Remove item from cart
```

---

### 5. **Orders & Order Management** 📦

- Create orders from cart
- Order tracking
- Order history per user
- Order item details
- Admin order management

**Files:**

- `controllers/orderController.js`
- `routes/orderRoutes.js`
- `models/Order.js`
- `models/OrderItem.js`

**Endpoints:**

```
GET    /api/order             - Get all orders (Admin)
GET    /api/order/user        - Get user's orders
POST   /api/order             - Create new order
GET    /api/order/:id         - Get order details
PUT    /api/order/:id         - Update order status (Admin)
```

---

### 6. **Wishlist Management** ❤️

- Add/remove items from wishlist
- View user's wishlist
- Wishlist persistence

**Files:**

- `controllers/wishlistController.js`
- `routes/wishlistRoutes.js`
- `models/Wishlist.js`

**Endpoints:**

```
GET    /api/wishlist          - Get user's wishlist
POST   /api/wishlist          - Add item to wishlist
DELETE /api/wishlist/:id      - Remove from wishlist
```

---

### 7. **Payment Processing** 💳

- Stripe integration for payments
- Payment webhook handling
- Payment status tracking
- Secure payment processing

**Files:**

- `controllers/paymentController.js`
- `routes/paymentRoutes.js`
- `controllers/webhookController.js`
- `config/stripe.js`

**Endpoints:**

```
POST   /api/payment           - Process payment
POST   /api/webhook           - Stripe webhook
GET    /api/payment/:id       - Get payment details
```

---

### 8. **User Inquiries** ❓

- Customer inquiries about products
- Inquiry tracking and management
- Both authenticated and guest inquiries

**Files:**

- `controllers/inquiryController.js`
- `routes/inquiryRoutes.js`
- `models/Inquiry.js`

**Endpoints:**

```
POST   /api/inquiry           - Create new inquiry
GET    /api/inquiry           - Get all inquiries (Admin)
```

---

### 9. **Chatbot Support** 🤖

- AI-powered chatbot integration
- Intent-based responses
- Chat history logging
- Natural language processing

**Files:**

- `controllers/chatController.js`
- `routes/chatRoutes.js`
- `chatbot/chatbot_logic.py` (Python backend)
- `chatbot/intents.json`
- `models/ChatLog.js`
- `main.py` (Python server)

**Endpoints:**

```
POST   /api/chat              - Send message to chatbot
GET    /api/chat/history      - Get chat history
```

---

### 10. **Admin Dashboard** 📊

- Admin-only dashboard access
- User management
- Product statistics
- Sales overview
- Order tracking

**Files:**

- `controllers/adminDashboardController.js`
- `routes/adminDashboardRoutes.js`

**Endpoints:**

```
GET    /api/admin/dashboard   - Get dashboard data (Admin only)
```

---

### 11. **Analytics & Reporting** 📈

- Sales analytics
- Revenue tracking
- Product performance metrics
- User activity tracking

**Files:**

- `controllers/analyticsController.js`
- `routes/analyticsRoutes.js`

**Endpoints:**

```
GET    /api/analytics         - Get analytics data (Admin only)
```

---

## 🛡️ Security Features

### Middleware Implemented:

- **Helmet** - Sets HTTP headers for security
- **CORS** - Cross-Origin Resource Sharing
- **XSS Protection** - XSS-Clean middleware
- **Rate Limiting** - API request rate limiting
- **HPP** - HTTP Parameter Pollution protection
- **Morgan** - Request logging
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for secure passwords

**Files:**

- `middleware/authMiddleware.js` - Auth & role checking
- `middleware/errorHandle.js` - Error handling
- `middleware/apiLimiter.js` - Rate limiting
- `middleware/asyncHandler.js` - Async error handling
- `middleware/upload.js` - Cloudinary file uploads

---

## 📊 Database Models

1. **User** - User accounts with roles
2. **Product** - Product catalog
3. **Category** - Product categories
4. **Cart** - Shopping carts
5. **CartItem** - Items in cart
6. **Order** - Customer orders
7. **OrderItem** - Items in orders
8. **Wishlist** - User wishlists
9. **Inquiry** - Customer inquiries
10. **ChatLog** - Chat history

**Files:** `models/` directory

---

## ⚙️ Configuration Files

| File                   | Purpose                          |
| ---------------------- | -------------------------------- |
| `config/db.js`         | Database (PostgreSQL) connection |
| `config/stripe.js`     | Stripe payment configuration     |
| `config/cloudinary.js` | Cloudinary image upload config   |
| `.env`                 | Environment variables            |

---

## 🔌 External Integrations

### Cloudinary

- Image upload and storage for products
- Automatic image optimization

### Stripe

- Payment processing
- Webhook integration for payment events

### Python Chatbot

- Natural language processing
- Intent-based responses
- ML model for intent recognition

---

## 📦 Dependencies

### Core Dependencies:

- `express` - Web framework
- `sequelize` - ORM for database
- `pg` & `pg-hstore` - PostgreSQL driver
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - Request logging
- `xss-clean` - XSS protection
- `hpp` - HPP protection
- `express-rate-limit` - Rate limiting

### File Upload:

- `cloudinary` - Cloud storage
- `multer` - File upload handler
- `multer-storage-cloudinary` - Multer Cloudinary adapter

### Payment:

- `stripe` - Payment processing

---

## 🚀 Getting Started

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# See .env.example for reference
```

### Environment Variables (.env)

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_PORT=5432

JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Server runs on http://localhost:3000
```

---

## 📝 API Authentication

Most routes require JWT authentication. Include the token in headers:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access:

- **User Role**: Can shop, create orders, manage wishlist
- **Admin Role**: Can manage products, categories, view analytics, manage users

---

## 🐛 Error Handling

All errors are handled with consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

HTTP Status Codes Used:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📂 Project Structure

```
backend/
├── config/              # Configuration files
├── controllers/         # Business logic
├── middleware/          # Custom middleware
├── models/              # Database models
├── routes/              # API routes
├── chatbot/             # Python chatbot logic
├── index.js             # Server entry point
├── main.py              # Python server
├── .env                 # Environment variables
└── package.json         # Dependencies
```

---

## 🔄 Middleware Pipeline

Request flow:

1. `helmet` - Security headers
2. `morgan` - Request logging
3. `express.json()` - Parse JSON
4. `CORS` - Handle cross-origin
5. `xss` - XSS protection
6. `hpp` - HPP protection
7. `rateLimiter` - Rate limiting
8. Route handlers
9. `errorHandle` - Error handling

---

## 📱 Response Format

### Success Response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## 🧪 Testing

To test the API:

1. Use **Postman** or **Thunderclient**
2. Register a user account
3. Get JWT token from login
4. Add token to Authorization header
5. Test protected endpoints

---

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [JWT Guide](https://jwt.io/)
- [Stripe Documentation](https://stripe.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## 👨‍💻 Developer Notes

### Best Practices Implemented:

✅ Async/await for error handling  
✅ Environment-based configuration  
✅ Role-based access control  
✅ Secure password hashing  
✅ Rate limiting for API protection  
✅ CORS security  
✅ Input validation  
✅ Error logging  
✅ Database associations

### Future Improvements:

- [ ] Add email verification
- [ ] Implement refresh tokens
- [ ] Add product reviews/ratings
- [ ] Enhanced analytics dashboard
- [ ] Email notifications
- [ ] Inventory management

---

## 📞 Support

For issues or questions about the backend:

1. Check the error logs
2. Verify environment variables
3. Ensure database connection
4. Check middleware order in routes

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0
