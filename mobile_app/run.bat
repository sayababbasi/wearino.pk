@echo off
echo ========================================
echo Starting Flutter Mobile App
echo ========================================
echo.

REM Check if Flutter is installed
where flutter >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Flutter is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting Flutter app...
echo.
echo Note: Make sure backend services are running:
echo - Express backend on http://localhost:5001
echo - Python chatbot on http://localhost:8000
echo.

flutter run

pause

