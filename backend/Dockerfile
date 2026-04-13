# Use Microsoft's official Playwright Python image — has all Chromium system deps pre-installed
FROM mcr.microsoft.com/playwright/python:v1.58.0-jammy

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium

# Copy source
COPY . .

# Expose port (Railway overrides with $PORT at runtime)
EXPOSE 8000

# Start server — use $PORT so Railway can route traffic correctly
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
