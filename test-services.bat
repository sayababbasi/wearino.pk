@echo off
REM Quick Service Test Script (Windows)
REM Tests if all services are running and responding

echo 🧪 Testing All Services...
echo.

REM Test Python Chatbot (port 8000)
echo 1. Testing Python Chatbot (port 8000)...
curl -s http://localhost:8000/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python Chatbot is running
) else (
    echo ❌ Python Chatbot is NOT running
    echo    Start it: cd product_listing_app\backend ^&^& start_chatbot.bat
)

REM Test Express Backend (port 5001)
echo.
echo 2. Testing Express Backend (port 5001)...
curl -s http://localhost:5001/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Express Backend is running
    echo    Testing /api/product endpoint...
    curl -s http://localhost:5001/api/product | findstr /i "products success" >nul
    if %errorlevel% equ 0 (
        echo    ✅ Products API working
    ) else (
        echo    ⚠️  Products API returned unexpected response
    )
) else (
    echo ❌ Express Backend is NOT running
    echo    Start it: cd product_listing_app\backend ^&^& npm run dev
)

REM Test Next.js Frontend (port 3000)
echo.
echo 3. Testing Next.js Frontend (port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Next.js Frontend is running
) else (
    echo ❌ Next.js Frontend is NOT running
    echo    Start it: cd product_listing_app ^&^& npm run dev
)

echo.
echo 📋 Next Steps:
echo    - Open http://localhost:3000 in your browser
echo    - Test features according to TESTING_GUIDE.md
echo    - Check browser console for any errors

pause

