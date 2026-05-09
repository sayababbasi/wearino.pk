# Setup Python Virtual Environment for Chatbot Service (Windows PowerShell)
# This script creates a virtual environment and installs dependencies

Write-Host "Setting up Python virtual environment..." -ForegroundColor Green

# Change to script directory
Set-Location $PSScriptRoot

# Create virtual environment
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Skipping creation." -ForegroundColor Yellow
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    Write-Host "Virtual environment created!" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host ""
Write-Host "Setup complete! Virtual environment is ready." -ForegroundColor Green
Write-Host ""
Write-Host "To activate the virtual environment manually, run:" -ForegroundColor Yellow
Write-Host "  venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host ""
Write-Host "To start the chatbot service, run:" -ForegroundColor Yellow
Write-Host "  .\start_chatbot.ps1" -ForegroundColor White
Write-Host ""

