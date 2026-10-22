@echo off
echo ========================================
echo NYAYASETU Backend - Quick Install
echo ========================================

echo.
echo Step 1: Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo Step 2: Creating .env file...
if not exist .env (
    copy .env.example .env
    echo Created .env file
) else (
    echo .env already exists
)

echo.
echo Step 3: Creating logs directory...
if not exist logs mkdir logs

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To initialize the database, run:
echo   python -m app.db.init_db
echo.
echo To start the server, run:
echo   python -m app.main
echo.
pause
