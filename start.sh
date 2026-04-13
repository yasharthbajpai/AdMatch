#!/usr/bin/env bash
# Start both frontend and backend dev servers

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Backend
echo "Starting FastAPI backend on :8000 ..."
cd "$ROOT/backend"
source venv/bin/activate
export $(grep -v '^#' .env | xargs) 2>/dev/null || true
export PLAYWRIGHT_BROWSERS_PATH="$ROOT/backend/browsers"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Frontend
echo "Starting Vite dev server on :5173 ..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
