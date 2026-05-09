@echo off
REM Setup Python Virtual Environment for Chatbot Service (Windows)
REM This script creates a virtual environment and installs dependencies

echo Setting up Python virtual environment...

cd /d "%~dp0"

REM Create virtual environment
if exist "venv" (
    echo Virtual environment already exists. Skipping creation.
) else (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created!
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo Setup complete! Virtual environment is ready.
echo.
echo To activate the virtual environment manually, run:
echo   venv\Scripts\activate.bat
echo.
echo To start the chatbot service, run:
echo   start_chatbot.bat
echo.

pause

