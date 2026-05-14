@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo 🌟 WEARINO.PK FULL PRODUCTION DEPLOYMENT SYSTEM 🌟
echo ====================================================
echo.

:: 1. GIT SYNC
echo [1/4] Preparing Code for Production...
git add .
set /p commit_msg="Enter deployment message (default: Production Sync): "
if "!commit_msg!"=="" set commit_msg=Production Sync
git commit -m "!commit_msg!"

echo [2/4] Deploying to GitHub...
echo (This triggers Vercel and Render deployments automatically)
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Git push failed. Please check your internet or credentials.
    pause
    exit /b
)

echo.
echo ----------------------------------------------------
echo ✅ CODE DEPLOYED TO CLOUD
echo ----------------------------------------------------
echo.

:: 2. CONNECTION VERIFICATION
echo [3/4] Verifying Service Connections...
echo ⏳ Waiting for services to restart (takes ~2 mins)...
echo.
echo Check Backend Status:  https://wearino-pk.onrender.com/api/status
echo Check Live Website:    https://wearino-pk.vercel.app
echo.

:: 3. DASHBOARD LINKS
echo [4/4] Quick Links for Maintenance:
echo ----------------------------------------------------
echo 📦 Render (Backend):  https://dashboard.render.com/web/wearino-pk
echo 🎨 Vercel (Frontend): https://vercel.com/sayababbasi/wearino-pk
echo 🗄️  Neon (Database):  https://console.neon.tech
echo 🖼️  Cloudinary:      https://cloudinary.com/console
echo ----------------------------------------------------
echo.

echo 💡 TIP: If the site is down, check Render Environment Variables 
echo    first to ensure DATABASE_URL is set correctly.
echo.
echo ====================================================
echo 🎉 DEPLOYMENT SEQUENCE COMPLETE
echo ====================================================
pause
