# Start Python FastAPI Chatbot Service (Windows PowerShell)
# This script starts the Python chatbot service on port 8000
# It uses the virtual environment if it exists

Write-Host "Starting Python Chatbot Service..." -ForegroundColor Green

# Change to script directory
Set-Location $PSScriptRoot

# Activate virtual environment if it exists
if (Test-Path "venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "Warning: Virtual environment not found. Using system Python." -ForegroundColor Yellow
    Write-Host "To create venv, run: python -m venv venv" -ForegroundColor Yellow
}

# Start the FastAPI service
Write-Host "Starting FastAPI server on http://localhost:8000..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

