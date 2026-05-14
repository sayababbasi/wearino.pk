@echo off
echo ====================================================
echo 🚀 WEARINO.PK QUICK DEPLOYMENT & SYNC TOOL
echo ====================================================

echo 1. Committing latest connection fixes...
git add .
git commit -m "Fix: Finalize production database and connectivity logic"

echo 2. Pushing to GitHub (main branch)...
echo [Action Required] If prompted, please authorize the push.
git push origin main

echo ----------------------------------------------------
echo ✅ CHANGES PUSHED TO GITHUB
echo ----------------------------------------------------
echo Now Render will automatically start a new build.
echo.
echo 3. Checking Production Status...
echo Once the build is finished, visit:
echo https://wearino-pk.onrender.com/api/status
echo.
echo 💡 This URL will show you exactly what is connected 
echo    (Database, Cloudinary, etc.) and what is missing.
echo.
echo 4. Verifying Environment Variables...
echo If the status URL shows 'DATABASE_URL MISSING', go to:
echo https://dashboard.render.com/web/wearino-pk/env
echo and add:
echo DATABASE_URL = (your neon connection string)
echo.
echo ====================================================
pause
