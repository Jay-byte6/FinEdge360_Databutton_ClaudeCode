#!/bin/bash
# FinEdge360 - Development Server Startup Script (Unix/Mac/Linux)
# This script starts both frontend and backend servers

echo ""
echo "========================================"
echo " FinEdge360 Development Server Startup"
echo "========================================"
echo ""

# Check if we're in the project root
if [ ! -d "frontend" ]; then
    echo "ERROR: frontend directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

if [ ! -d "backend" ]; then
    echo "ERROR: backend directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "[Step 1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi
node --version
echo "Node.js: OK"
echo ""

echo "[Step 2/4] Checking Python installation..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python not found. Please install Python first."
    echo "Download from: https://www.python.org/"
    exit 1
fi

if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

$PYTHON_CMD --version
echo "Python: OK"
echo ""

echo "[Step 3/4] Starting Backend Server (FastAPI)..."
echo "Backend will run on http://localhost:8000"

# Start backend in background
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend && '$PYTHON_CMD' -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"'
else
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd backend && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd backend && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" &
    else
        # Fallback: run in background
        cd backend && $PYTHON_CMD -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
        BACKEND_PID=$!
        echo "Backend started (PID: $BACKEND_PID)"
        cd ..
    fi
fi

echo "Backend server started"
sleep 3
echo ""

echo "[Step 4/4] Starting Frontend Server (Vite)..."
echo "Frontend will run on http://localhost:5173"

# Start frontend in background
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/frontend && npm run dev"'
else
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd frontend && npm run dev" &
    else
        # Fallback: run in background
        cd frontend && npm run dev > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend started (PID: $FRONTEND_PID)"
        cd ..
    fi
fi

echo "Frontend server started"
sleep 3
echo ""

echo "========================================"
echo " Servers Started Successfully!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Both servers are running in separate windows."
echo "To stop: Close the terminal windows or press Ctrl+C in each"
echo ""

# Open browser (cross-platform)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo "Happy coding! :)"
