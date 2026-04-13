#!/bin/bash
set -e

# Find where Playwright actually installed Chromium in this image
FOUND=$(find /ms-playwright /root/.cache/ms-playwright /home -name "chrome-linux" -o -name "chrome" 2>/dev/null | head -1)
echo "Playwright browser found at: $FOUND"
echo "PLAYWRIGHT_BROWSERS_PATH=$PLAYWRIGHT_BROWSERS_PATH"
echo "PORT=$PORT"

exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
