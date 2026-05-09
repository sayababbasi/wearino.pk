#!/bin/bash

echo "========================================"
echo "Flutter Mobile App Setup (Mac/Linux)"
echo "========================================"
echo ""

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "[ERROR] Flutter is not installed or not in PATH"
    echo "Please install Flutter from: https://flutter.dev/docs/get-started/install"
    echo ""
    exit 1
fi

echo "[1/3] Checking Flutter installation..."
flutter --version
echo ""

echo "[2/3] Installing Flutter dependencies..."
flutter pub get
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi
echo ""

echo "[3/3] Verifying setup..."
flutter doctor
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update API base URL in lib/services/api_service.dart if needed"
echo "2. For Android Emulator: Use http://10.0.2.2:5001"
echo "3. For iOS Simulator: Use http://localhost:5001"
echo "4. For Physical Device: Use http://YOUR_COMPUTER_IP:5001"
echo "5. Run: flutter run"
echo ""

