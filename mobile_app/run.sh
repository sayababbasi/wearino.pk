#!/bin/bash

echo "========================================"
echo "Starting Flutter Mobile App"
echo "========================================"
echo ""

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "[ERROR] Flutter is not installed or not in PATH"
    exit 1
fi

echo "Starting Flutter app..."
echo ""
echo "Note: Make sure backend services are running:"
echo "- Express backend on http://localhost:5001"
echo "- Python chatbot on http://localhost:8000"
echo ""

flutter run

