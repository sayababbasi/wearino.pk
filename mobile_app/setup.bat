@echo off
echo ========================================
echo Flutter Mobile App Setup (Windows)
echo ========================================
echo.

REM Check if Flutter is installed
where flutter >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Flutter is not installed or not in PATH
    echo Please install Flutter from: https://flutter.dev/docs/get-started/install/windows
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking Flutter installation...
flutter --version
echo.

echo [2/3] Installing Flutter dependencies...
flutter pub get
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/3] Verifying setup...
flutter doctor
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update API base URL in lib/services/api_service.dart if needed
echo 2. For Android Emulator: Use http://10.0.2.2:5001
echo 3. For Physical Device: Use http://YOUR_COMPUTER_IP:5001
echo 4. Run: flutter run
echo.
pause

