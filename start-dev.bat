@echo off
REM FinEdge360 - Development Server Startup Script (Windows)
REM This script starts both frontend and backend servers

echo.
echo ========================================
echo  FinEdge360 Development Server Startup
echo ========================================
echo.

REM Check if we're in the project root
if not exist "frontend" (
    echo ERROR: frontend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "backend" (
    echo ERROR: backend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo [Step 1/4] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo Node.js: OK
echo.

echo [Step 2/4] Checking Python installation...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python first.
    echo Download from: https://www.python.org/
    pause
    exit /b 1
)
python --version
echo Python: OK
echo.

echo [Step 3/4] Starting Backend Server (FastAPI)...
echo Backend will run on http://localhost:8000
start "FinEdge360 Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo Backend server started in new window
timeout /t 3 /nobreak >nul
echo.

echo [Step 4/4] Starting Frontend Server (Vite)...
echo Frontend will run on http://localhost:5173
start "FinEdge360 Frontend" cmd /k "cd frontend && npm run dev"
echo Frontend server started in new window
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo  Servers Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Both servers are running in separate windows.
echo To stop: Close the terminal windows or press Ctrl+C in each
echo.
echo Opening frontend in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo Happy coding! :)
pause
