# Complete Setup Guide - Product Listing Website

This guide covers setup for all components: Web UI, Backend, Python Chatbot, and Flutter Mobile App.

## 📋 Prerequisites

### Required Software
- **Node.js** (v20.9.0 or higher) - [Download](https://nodejs.org/)
- **Python** (3.7 or higher) - [Download](https://www.python.org/downloads/)
- **PostgreSQL** (Optional, for database features) - [Download](https://www.postgresql.org/download/)
- **Flutter** (3.0.0 or higher) - [Download](https://flutter.dev/docs/get-started/install)
- **Git** - [Download](https://git-scm.com/downloads)

### Verify Installations
```bash
node --version    # Should be >= 20.9.0
python --version  # Should be >= 3.7
flutter --version # Should be >= 3.0.0
```

---

## 🚀 Quick Start (All Platforms)

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd Product-Listing-Website--main
```

### 2. Setup Backend (Express + Python Chatbot)

#### Windows:
```cmd
cd backend
setup_venv.bat
start_chatbot.bat
```

#### Mac/Linux:
```bash
cd backend
chmod +x setup_venv.sh start_chatbot.sh
./setup_venv.sh
./start_chatbot.sh
```

#### Manual Setup:
```bash
cd backend

# Setup Python virtual environment
python -m venv venv

# Activate venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Start Python chatbot (Terminal 1)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start Express backend (Terminal 2)
npm run dev
```

### 3. Setup Web Frontend (Next.js)

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Web UI will be available at: `http://localhost:3000`

### 4. Setup Flutter Mobile App

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

#### Manual Setup:
```bash
cd mobile_app
flutter pub get
flutter run
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/`:

```env
# Server Configuration
PORT=5001

# Database (PostgreSQL - Optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here

# Python Chatbot Service
PYTHON_CHATBOT_URL=http://localhost:8000

# Stripe Payment (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# Cloudinary Image Upload (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note:** The backend can run without database, Stripe, or Cloudinary for basic chatbot testing.

### Flutter Mobile App Configuration

Update API base URL in `mobile_app/lib/services/api_service.dart`:

```dart
// For Android Emulator
static const String baseUrl = 'http://10.0.2.2:5001';

// For iOS Simulator
static const String baseUrl = 'http://localhost:5001';

// For Physical Device (replace with your computer's IP)
static const String baseUrl = 'http://192.168.1.100:5001';
```

To find your computer's IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr` (look for inet)

---

## 📱 Running All Services

You can easily run the frontend and backend using a single command from the root directory:

```bash
# From the root Product-Listing-Website directory
npm install concurrently -D
npm run install:all
npm run dev
```

Or run them individually in **4 terminals**:

### Terminal 1: Python Chatbot Service
```bash
cd backend

# Windows
start_chatbot.bat

# Mac/Linux
./start_chatbot.sh

# Or manually
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate    # Windows
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
**Runs on:** `http://localhost:8000`

### Terminal 2: Express Backend
```bash
cd backend
npm run dev
```
**Runs on:** `http://localhost:5001`

### Terminal 3: Next.js Web Frontend
```bash
cd frontend
npm run dev
```
**Runs on:** `http://localhost:3000`

### Terminal 4: Flutter Mobile App
```bash
cd mobile_app

# Windows
run.bat

# Mac/Linux
./run.sh

# Or manually
flutter run
```

---

## 🧪 Testing the Setup

### 1. Test Backend
```bash
# Test Express backend
curl http://localhost:5001/api/products

# Test Python chatbot
curl http://localhost:8000/chat -X POST -H "Content-Type: application/json" -d '{"message":"Hello"}'
```

### 2. Test Web UI
1. Open `http://localhost:3000`
2. Look for floating chat button (bottom-right)
3. Click and send a test message

### 3. Test Mobile App
1. Run Flutter app on emulator/device
2. Look for floating chat button
3. Test navigation and product browsing
4. Test chatbot functionality

---

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use:**
```bash
# Find process using port
# Windows: netstat -ano | findstr :5001
# Mac/Linux: lsof -i :5001

# Kill process or change PORT in .env
```

**Python Chatbot Not Starting:**
- Ensure virtual environment is activated
- Check `requirements.txt` is installed: `pip list`
- Verify Python version: `python --version`

**Database Connection Errors:**
- Backend can run without database for chatbot testing
- Chat history won't be saved without database
- Set up PostgreSQL if you need persistent data

### Flutter Issues

**Flutter Not Found:**
- Add Flutter to PATH
- Run `flutter doctor` to check setup

**API Connection Failed:**
- Verify backend is running on port 5001
- Check API base URL in `api_service.dart`
- For physical device, ensure device and computer are on same network
- Check firewall settings

**Build Errors:**
```bash
flutter clean
flutter pub get
flutter run
```

### Web UI Issues

**Module Not Found:**
```bash
cd frontend
rm -rf node_modules .next
npm install --legacy-peer-deps
npm run dev
```

**Turbopack Issues:**
- Clear `.next` cache: `rm -rf .next`
- Restart dev server

---

## 📂 Project Structure

```
Product-Listing-Website/
├── frontend/                     # Web Application (Next.js)
│   └── src/                     # Next.js frontend
│       └── components/
│           └── chat/
│               └── chat_widget.tsx
│
├── backend/                      # Express + Python Backend
│   ├── setup_venv.sh        # Mac/Linux Python setup
│   ├── setup_venv.bat       # Windows Python setup
│   ├── start_chatbot.sh     # Mac/Linux start script
│   ├── start_chatbot.bat    # Windows start script
│   ├── .env                 # Environment variables
│   ├── requirements.txt     # Python dependencies
│   └── package.json         # Node.js dependencies
│
├── mobile_app/                  # Flutter Mobile App
│   ├── setup.sh                 # Mac/Linux setup
│   ├── setup.bat                # Windows setup
│   ├── run.sh                   # Mac/Linux run
│   ├── run.bat                  # Windows run
│   ├── .env.example            # Environment template
│   ├── pubspec.yaml            # Flutter dependencies
│   └── lib/
│       ├── main.dart
│       ├── services/
│       │   └── api_service.dart
│       └── widgets/
│           └── chat/
│               └── chat_widget.dart
│
└── SETUP_GUIDE.md              # This file
```

---

## ✅ Verification Checklist

Before submitting for review, verify:

- [ ] All services start without errors
- [ ] Web UI loads at `http://localhost:3000`
- [ ] Flutter app runs on emulator/device
- [ ] Chatbot responds on both web and mobile
- [ ] Products load and display correctly
- [ ] Navigation works (categories, search, etc.)
- [ ] Cart functionality works
- [ ] Authentication works (login/register)
- [ ] All scripts (.bat/.sh) are executable
- [ ] Environment variables are documented
- [ ] README files are complete

---

## 📝 Additional Resources

- **Backend Documentation**: `product_listing_app/backend/BACKEND_README.md`
- **Mobile App README**: `mobile_app/README.md`
- **Database Setup**: `DATABASE_SETUP.md`
- **API Documentation**: `API_ROUTES.md`

---

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages carefully
3. Verify all prerequisites are installed
4. Ensure all services are running
5. Check environment variables are set correctly

---

**Last Updated:** 2024
**Version:** 1.0

