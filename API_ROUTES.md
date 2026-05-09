# API Routes Documentation

Complete list of all implemented API routes in the backend.

**Base URL:** `http://localhost:5001/api`

---

## 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login user and get JWT token |

---

## 📦 Product Routes (`/api/product`)

| Method | Endpoint | Auth | Description | Query Params |
|--------|----------|------|-------------|--------------|
| GET | `/api/product` | Public | Get all products | `?tag=Sale`, `?department=Women`, `?category=Top`, `?subcategory=Jackets` |
| GET | `/api/product/:id` | Public | Get single product by ID | - |
| POST | `/api/product` | Admin | Create new product | - |
| PUT | `/api/product/:id` | Admin | Update product | - |
| DELETE | `/api/product/:id` | Admin | Delete product | - |

**Product Filtering:**
- `tag` - Filter by tag (Sale, New, Trending)
- `department` - Filter by department (Women, Men, Kids, Beauty)
- `category` - Filter by category
- `subcategory` - Filter by subcategory

---

## 🛒 Cart Routes (`/api/cart`)

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| GET | `/api/cart` | Optional | Get user's cart (guest or logged-in) | - |
| POST | `/api/cart` | Optional | Add item to cart | `{ productId, quantity }` |
| PUT | `/api/cart/item/:cartItemId` | Optional | Update cart item quantity | `{ quantity }` |
| DELETE | `/api/cart/item/:cartItemId` | Optional | Remove item from cart | - |
| DELETE | `/api/cart` | Optional | Clear entire cart | - |

**Note:** Uses `optionalAuth` - works for both guest and logged-in users.

---

## 📋 Order Routes (`/api/order`)

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| POST | `/api/order` | Optional | Create new order (guest or logged-in) | `{ shippingAddress, paymentMethod, items }` |
| GET | `/api/order` | Required | Get orders (admin: all, user: own) | - |
| GET | `/api/order/:id` | Required | Get order by ID | - |
| PUT | `/api/order/:id/status` | Required | Update order status (admin only) | `{ status }` |

**Note:** Order creation supports both guest and logged-in users. Stock is automatically decreased when order is created.

---

## 💳 Payment Routes (`/api/payment`)

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| POST | `/api/payment/create-checkout-session` | Required | Create Stripe checkout session | `{ items, shippingAddress }` |
| POST | `/api/payment/webhook` | Stripe | Stripe webhook handler | Stripe event |

---

## 💬 Chat Routes (`/api/chat`)

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| POST | `/api/chat/send` | Optional | Send chat message | `{ message, user_id? }` |
| GET | `/api/chat/history` | Optional | Get chat history | - |

**Note:** Uses `optionalAuth` - works for both guest and logged-in users. Chatbot can return `navigate_to` for automatic navigation.

---

## 📁 Category Routes (`/api/category`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/category` | Public | Get all categories |
| GET | `/api/category/:id` | Public | Get category by ID |
| POST | `/api/category` | Admin | Create new category |
| PUT | `/api/category/:id` | Admin | Update category |
| DELETE | `/api/category/:id` | Admin | Delete category |

---

## ❤️ Wishlist Routes (`/api/wishlist`)

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| GET | `/api/wishlist` | Required | Get user's wishlist | - |
| POST | `/api/wishlist` | Required | Add product to wishlist | `{ productId }` |
| DELETE | `/api/wishlist/:productId` | Required | Remove product from wishlist | - |

---

## 📧 Inquiry Routes (`/api/inquiry`)

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| POST | `/api/inquiry` | Public | Create inquiry/contact form | `{ name, email, message }` |
| GET | `/api/inquiry` | Admin | Get all inquiries | - |

---

## 📊 Admin Dashboard Routes (`/api/admin/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard/stats` | Admin | Get admin statistics |
| GET | `/api/admin/dashboard/charts/users` | Admin | Get monthly user stats |
| GET | `/api/admin/dashboard/charts/products` | Admin | Get monthly product stats |
| GET | `/api/admin/dashboard/latest/users` | Admin | Get latest registered users |
| GET | `/api/admin/dashboard/latest/inquiries` | Admin | Get latest inquiries |
| GET | `/api/admin/dashboard/products/low-stock` | Admin | Get products with low stock |
| GET | `/api/admin/dashboard/products/most-wishlisted` | Admin | Get most wishlisted products |

---

## 📈 Analytics Routes (`/api/analytics`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/top-viewed` | Admin | Get top viewed products |
| GET | `/api/analytics/counts` | Admin | Get counts (users, products, orders) |

---

## 🔑 Authentication Middleware

### `protect`
- Requires valid JWT token
- Sets `req.user` with user data
- Returns 401 if not authenticated

### `optionalAuth`
- Attempts to verify JWT token
- Sets `req.user` if authenticated, `null` if not
- Allows both guest and logged-in users
- Used for: Cart, Orders (create), Chat

### `isAdmin`
- Must be used after `protect`
- Checks if user role is 'admin'
- Returns 403 if not admin

---

## 📝 Request/Response Examples

### Get Products by Tag
```bash
GET /api/product?tag=Sale
```

### Add to Cart
```bash
POST /api/cart
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Create Order
```bash
POST /api/order
Content-Type: application/json

{
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "paymentMethod": "cod",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 29.99
    }
  ]
}
```

### Send Chat Message
```bash
POST /api/chat/send
Content-Type: application/json

{
  "message": "Show me dresses",
  "user_id": null  // Optional, null for guest
}
```

**Response:**
```json
{
  "response": "Here are some dresses for you!",
  "navigate_to": "/categories/women/dresses"
}
```

---

## 🚀 Quick Reference

**Public Routes (No Auth):**
- `GET /api/product`
- `GET /api/product/:id`
- `GET /api/category`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/inquiry`

**Guest-Friendly Routes (Optional Auth):**
- All `/api/cart/*` routes
- `POST /api/order` (create order)
- All `/api/chat/*` routes

**User Routes (Requires Auth):**
- `GET /api/order`
- `GET /api/order/:id`
- All `/api/wishlist/*` routes

**Admin Routes (Requires Admin Role):**
- All product CRUD (POST, PUT, DELETE)
- All category CRUD (POST, PUT, DELETE)
- All `/api/admin/dashboard/*` routes
- All `/api/analytics/*` routes
- `PUT /api/order/:id/status`
- `GET /api/inquiry`

---

## 🔗 Related Documentation

- [Backend README](./product_listing_app/backend/BACKEND_README.md) - Detailed backend documentation
- [Testing Guide](./TESTING_GUIDE.md) - API testing procedures
- [Setup Guide](./SETUP_GUIDE.md) - Backend setup instructions

