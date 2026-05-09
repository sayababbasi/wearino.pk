# Product Listing Website - Complete E-Commerce Platform

A full-stack e-commerce application with web UI (Next.js), mobile app (Flutter), Express backend, and Python chatbot integration.

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20.9.0
- **Python** >= 3.8
- **Flutter** >= 3.0.0 (for mobile app)
- **PostgreSQL** (optional, for database features)

### Start All Services

You'll need **3 terminals** to run all services:

#### Terminal 1: Python Chatbot Service
```bash
cd backend
./setup_venv.sh      # First time only (Mac/Linux)
# OR
setup_venv.bat        # First time only (Windows)
./start_chatbot.sh    # Mac/Linux
# OR
start_chatbot.bat     # Windows
```
**Runs on:** `http://localhost:8000`

#### Terminal 2: Express Backend
```bash
cd backend
npm install          # First time only
npm run dev
```
**Runs on:** `http://localhost:5001`

#### Terminal 3: Next.js Frontend
```bash
cd frontend
npm install          # First time only
npm run dev
```
**Runs on:** `http://localhost:3000`

### Quick Test
```bash
# Verify all services are running
./test-services.sh   # Mac/Linux
# OR
test-services.bat    # Windows
```

---

## ✨ Features

### Web UI (Next.js)
- ✅ **Product Display** - Homepage sections by tags (Sale, New Arrivals, Trending)
- ✅ **Category Navigation** - Women's, Men's, Kids, Beauty with subcategories
- ✅ **Shopping Cart** - Works for both guest and logged-in users
- ✅ **Checkout** - Multi-step checkout with Cash on Delivery (COD) and Stripe payment
- ✅ **Order Management** - Order creation, receipt generation, stock management
- ✅ **User Authentication** - Login, register, JWT-based auth
- ✅ **Floating Chatbot** - Integrated chatbot widget on all pages
- ✅ **Admin Dashboard** - Order management, stock tracking, product management
- ✅ **Product Search & Filters** - Advanced filtering and sorting

### Mobile App (Flutter)
- ✅ Complete UI matching web version
- ✅ Product browsing with filters, sorting, and pagination
- ✅ Shopping cart and checkout
- ✅ User authentication
- ✅ Chatbot integration (floating widget)
- ✅ Cross-platform (iOS & Android)
- ✅ Order receipt and contact pages

### Backend (Express + Python)
- ✅ RESTful API with comprehensive endpoints
- ✅ JWT authentication (with guest user support)
- ✅ Python chatbot service (FastAPI)
- ✅ Database integration (PostgreSQL with Sequelize)
- ✅ Payment processing (Stripe integration)
- ✅ Stock management (automatic stock reduction on orders)
- ✅ Order management (create, update, track orders)
- ✅ Cart management (persistent carts for users and guests)

---

## 📁 Project Structure

```
Product-Listing-Website/
├── backend/                      # Express + Python Backend
│   ├── setup_venv.sh             # Mac/Linux Python setup
│   ├── setup_venv.bat            # Windows Python setup
│   ├── start_chatbot.sh          # Mac/Linux start script
│   ├── start_chatbot.bat         # Windows start script
│   ├── controllers/              # API controllers
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── chatbot/                  # Python chatbot logic
│   └── .env                      # Environment variables
│
├── frontend/                     # Next.js frontend
│   ├── app/                      # Next.js app router pages
│   ├── components/               # React components
│   ├── lib/                      # Utilities and API clients
│   └── hooks/                    # Custom React hooks
│
├── mobile_app/                   # Flutter Mobile App
│   ├── setup.sh                 # Mac/Linux setup
│   ├── setup.bat                # Windows setup
│   ├── run.sh                   # Mac/Linux run
│   ├── run.bat                  # Windows run
│   └── lib/                     # Flutter source code
│
├── TESTING_GUIDE.md            # Complete testing checklist
├── SETUP_GUIDE.md              # Detailed setup instructions
└── README.md                    # This file
```

---

## 🛠️ Technology Stack

- **Frontend (Web)**: Next.js 16, React, TypeScript, Tailwind CSS
- **Frontend (Mobile)**: Flutter, Dart
- **Backend**: Node.js, Express.js
- **Chatbot**: Python, FastAPI, Uvicorn
- **Database**: PostgreSQL, Sequelize ORM
- **Payment**: Stripe Payment Gateway
- **State Management**: Zustand (web), Provider (Flutter)
- **Authentication**: JWT tokens

---

## 📚 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing checklist and procedures
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions for all components
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup and population guide
- **[API_ROUTES.md](./API_ROUTES.md)** - Complete API routes documentation
- **[NODE_VERSION_FIX.md](./NODE_VERSION_FIX.md)** - Troubleshooting Node.js version issues
- **[mobile_app/README.md](./mobile_app/README.md)** - Mobile app specific documentation
- **[mobile_app/WINDOWS_SETUP_GUIDE.md](./mobile_app/WINDOWS_SETUP_GUIDE.md)** - Windows setup guide for Flutter mobile app
- **[product_listing_app/backend/BACKEND_README.md](./product_listing_app/backend/BACKEND_README.md)** - Backend API documentation

---

## 🎯 Key Features Explained

### Product Display by Tags
Products are displayed on the homepage in sections based on tags:
- **Sale** - Products with "Sale" tag (Flash Sale Faves section)
- **New Arrivals** - Products with "New" tag (Women's New Arrivals section)
- **Trending** - Products with "Trending" tag (Trending Now section)

### Category & Subcategory Navigation
- Main categories: Women's, Men's, Kids, Beauty
- Subcategories: Women's Top, Jackets, Trousers, etc.
- Dynamic routing: `/categories/[slug]` and `/categories/[slug]/[subcategory]`

### Shopping Cart
- **Guest Users**: Cart stored in localStorage, persists across sessions
- **Logged-in Users**: Cart synced with backend database
- Add, remove, update quantities
- Real-time price calculations

### Checkout Process
1. **Contact Information** - Email and phone
2. **Shipping Address** - Full address details
3. **Payment Method** - Choose between:
   - **Cash on Delivery (COD)** - Order created immediately
   - **Stripe Payment** - Redirects to Stripe Checkout, order created after payment

### Stock Management
- Products have `stock` field in database
- Stock automatically decreases when order is placed
- Prevents overselling (validates stock before order creation)
- Admin can manage stock from dashboard

### Order Management
- Orders created for both guest and logged-in users
- Order receipt generated with order number
- Admin dashboard shows all orders
- Order status tracking

---

## 🔧 Environment Configuration

### Backend (.env)
1. Copy the example file: `cp backend/.env.example backend/.env`
2. Update with your values:
```env
PORT=5001
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password_here
DB_NAME=product_listing_db
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key (optional)
PYTHON_CHATBOT_URL=http://localhost:8000
```

### Frontend (.env.local)
1. Copy the example file: `cp frontend/.env.local.example frontend/.env.local`
2. Update with your values:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key (optional)
```

**Note:** Example files (`.env.example` and `.env.local.example`) are provided in the repository for easy setup.

---

## 🧪 Testing

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for complete testing procedures.

**Quick Test:**
1. Start all 3 services (see Quick Start above)
2. Run `./test-services.sh` to verify services
3. Open `http://localhost:3000` in browser
4. Test features:
   - Home page product sections
   - Category navigation
   - Add to cart (guest & logged-in)
   - Checkout (COD & Stripe)
   - Chatbot integration
   - Admin dashboard

---

## 📝 Notes

- Backend can run without database for basic chatbot testing
- Chat history requires database connection
- Payment features require Stripe API keys (test mode works)
- Mobile app needs backend running to function fully
- Guest users can shop and place orders without registration

---

## 🐛 Troubleshooting

### Services not starting
- Check if ports 3000, 5001, 8000 are available
- Verify Node.js version >= 20.9.0
- Check Python version >= 3.8

### Database connection errors
- Ensure PostgreSQL is running
- Check `.env` configuration
- Backend works without DB for basic features

### Frontend not loading products
- Verify backend is running on port 5001
- Check browser console for API errors
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Stripe payment not working
- Verify Stripe keys are set in backend `.env`
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in frontend `.env.local`
- Use test mode keys for development

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for more troubleshooting tips.

---

## 🎯 Recent Updates

### E-Commerce Integration
- ✅ Product display by tags (Sale, New Arrivals, Trending)
- ✅ Category and subcategory navigation
- ✅ Shopping cart for guest and logged-in users
- ✅ Multi-step checkout with COD and Stripe
- ✅ Order management and receipt generation
- ✅ Stock management (automatic stock reduction)
- ✅ Admin dashboard for orders and stock

### Chatbot Integration
- ✅ Floating chatbot widget on all pages (web & mobile)
- ✅ Python FastAPI chatbot service with enhanced NLP
- ✅ **Navigation support** - Chatbot can automatically redirect users to specific pages
- ✅ Intent recognition and entity extraction
- ✅ Database integration for product search
- ✅ Works for both guest and logged-in users
- ✅ Chat history for authenticated users

### Mobile App
- ✅ Complete Flutter app matching web UI
- ✅ All e-commerce features
- ✅ Chatbot integration with navigation support
- ✅ Cross-platform support (iOS, Android, Windows)
- ✅ Windows setup guide included

---

## 📄 License

[Your License Here]

---

**Ready for Production!** ✅

All features are implemented, tested, and documented. The application is ready for deployment and review.
#   w e a r i n o . p k  
 