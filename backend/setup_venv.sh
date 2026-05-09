#!/bin/bash

# Setup Python Virtual Environment for Chatbot Service
# This script creates a virtual environment and installs dependencies

echo "Setting up Python virtual environment..."

cd "$(dirname "$0")"

# Create virtual environment
if [ -d "venv" ]; then
    echo "Virtual environment already exists. Skipping creation."
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created!"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo ""
echo "Setup complete! Virtual environment is ready."
echo ""
echo "To activate the virtual environment manually, run:"
echo "  source venv/bin/activate"
echo ""
echo "To start the chatbot service, run:"
echo "  ./start_chatbot.sh"
echo ""

