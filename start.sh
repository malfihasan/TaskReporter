#!/bin/bash

# TaskReporter Start Script
# Starts both backend (Flask) and frontend (Next.js)

echo "🚀 Starting TaskReporter..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo -e "${GREEN}Setting up backend...${NC}"
source venv/bin/activate
pip install -r backend/requirements.txt --quiet

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Start backend in background
echo -e "${GREEN}Starting Flask backend on port 5001...${NC}"
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}Starting Next.js frontend on port 3000...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ TaskReporter is running!${NC}"
echo ""
echo "📋 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001/api"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Trap to kill both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait
