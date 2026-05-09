# Database Setup & Population Guide

## 📊 Current Status

**Application:** All data is fetched from **PostgreSQL database**
- ✅ Frontend fetches products, categories, orders from database
- ✅ Backend API endpoints fully integrated with database
- ✅ All features require database: products, cart, orders, admin dashboard
- ✅ Database is **required** for the application to function

**Backend:** Fully integrated with database
- ✅ API endpoints implemented and connected to PostgreSQL
- ✅ Models and associations configured
- ✅ Seed script available to populate sample data

---

## 🗄️ How to Populate Database

### Step 1: Install PostgreSQL

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**Linux:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE product_listing_db;

# Create user (optional)
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE product_listing_db TO your_user;

# Exit
\q
```

**Or use command line:**
```bash
createdb product_listing_db
```

### Step 3: Configure Environment Variables

Create `.env` file in `product_listing_app/backend/`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=product_listing_db
DB_PORT=5432

# Server Configuration
PORT=5001

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# Python Chatbot URL
PYTHON_CHATBOT_URL=http://localhost:8000

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Step 4: Run Seed Script

```bash
cd product_listing_app/backend
npm run seed
```

**What the seed script does:**
- ✅ Creates database tables (if they don't exist)
- ✅ Creates categories (Women, Men, Kids, Beauty with subcategories)
- ✅ Adds 15 sample products with:
  - Tags: Sale, New, Trending (for homepage sections)
  - Stock quantities (20-100 items)
  - Images from Unsplash
  - Prices ($19.99 - $99.99)
- ✅ Skips duplicates if run multiple times

### Step 5: Verify

```bash
# Connect to database
psql product_listing_db

# Check products
SELECT COUNT(*) FROM products;
SELECT name, price, stock, tags FROM products LIMIT 5;

# Check categories
SELECT * FROM categories;

# Exit
\q
```

---

## 🔄 Current Data Flow

### Application Architecture

**Frontend:** `product_listing_app/src/lib/api.ts`
- All product data fetched from backend API
- Categories, orders, users all from database
- No mock data in active codebase

**Backend API:** `GET /api/product`
- Returns products directly from PostgreSQL database
- Requires database connection to function
- All CRUD operations interact with database

### Data Sources:

1. **Products:** Fetched from `products` table via `GET /api/product`
2. **Categories:** Fetched from `categories` table via `GET /api/category`
3. **Orders:** Stored in `orders` and `order_items` tables
4. **Users:** Stored in `users` table
5. **Cart:** Stored in `carts` and `cart_items` tables (for logged-in users)

---

## 📝 What to Tell Your Team

### ✅ **Tell Them:**

1. **Database is Required:**
   - Application fetches all data from PostgreSQL database
   - Products, categories, orders, users all stored in database
   - Database must be set up before running the application

2. **Quick Setup:**
   - Follow this guide to set up PostgreSQL
   - Run `npm run seed` to populate sample data
   - All features will work immediately after seeding

3. **Database Features:**
   - Product management with stock tracking
   - Order management and tracking
   - User authentication and accounts
   - Admin dashboard with analytics
   - Persistent cart for logged-in users
   - Chat history storage

4. **Development Workflow:**
   - Set up database once (see steps above)
   - Run seed script to populate sample data
   - All features work with database data
   - Add more products via admin dashboard or seed script

### 📋 **Team Communication Template:**

```
Hi Team,

Quick update on the database setup:

✅ CURRENT STATUS:
- Application uses PostgreSQL database for all data
- Products, categories, orders, users all from database
- Database setup is required for the application to function

🗄️ DATABASE SETUP:
- See DATABASE_SETUP.md for complete instructions
- Quick setup: Install PostgreSQL → Create DB → Run seed script
- Seed script ready: `npm run seed` (adds sample products)

💡 FOR DEVELOPMENT:
- Database is required - follow setup guide
- After seeding, all features work immediately
- Add more products via admin dashboard or seed script

Let me know if you need help setting up the database!
```

---

## 🚀 Quick Start

**Complete setup process:**

1. **Setup database** (see Step 1-3 above)
2. **Run seed script** to populate sample data:
   ```bash
   cd product_listing_app/backend
   npm run seed
   ```
3. **Start services:**
   ```bash
   # Terminal 1: Backend
   cd product_listing_app/backend
   npm run dev
   
   # Terminal 2: Frontend
   cd product_listing_app
   npm run dev
   ```
4. **Application uses database data** ✅
   - Products displayed from database
   - Categories from database
   - All features functional

---

## 🔍 How to Verify Database Connection

**Check Browser Console:**
- Look for API calls to `http://localhost:5001/api/product`
- Successful response with product data → Database connected ✅
- Error or empty response → Check database connection

**Check Network Tab:**
- `GET /api/product` should return products from database
- Check response contains actual product data

**Check Backend Logs:**
- Should show "Database connected successfully"
- No database connection errors

---

## 📚 Related Files

- `product_listing_app/backend/seedProducts.js` - Database seed script (populates sample data)
- `product_listing_app/backend/config/db.js` - Database configuration
- `product_listing_app/src/lib/api.ts` - API client (fetches from database)
- `product_listing_app/backend/models/` - Database models (Product, Category, Order, etc.)

---

## ❓ FAQ

**Q: Do I need database for development?**
A: Yes, the application requires a database connection. Follow the setup steps above.

**Q: What if database is empty?**
A: Run the seed script (`npm run seed`) to populate sample products and categories.

**Q: Can I add my own products?**
A: Yes, use the admin dashboard at `/admin/products` or add them directly to the database.

**Q: What happens if database connection fails?**
A: The backend will show connection errors. Check your `.env` configuration and ensure PostgreSQL is running.

**Q: How do I reset the database?**
A: Drop and recreate the database, then run the seed script again.

---

**Ready to populate?** Follow the steps above! 🚀

