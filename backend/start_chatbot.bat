@echo off
REM Start Python FastAPI Chatbot Service (Windows)
REM This script starts the Python chatbot service on port 8000
REM It uses the virtual environment if it exists

echo Starting Python Chatbot Service...
cd /d "%~dp0"

REM Activate virtual environment if it exists
if exist "venv" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Warning: Virtual environment not found. Using system Python.
    echo To create venv, run: python -m venv venv
)

REM Start the FastAPI service
echo Starting FastAPI server on http://localhost:8000...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause

