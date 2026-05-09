#!/bin/bash

# Start Python FastAPI Chatbot Service
# This script starts the Python chatbot service on port 8000
# It uses the virtual environment if it exists

echo "Starting Python Chatbot Service..."
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Warning: Virtual environment not found. Using system Python."
    echo "To create venv, run: python3 -m venv venv"
fi

# Start the FastAPI service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

