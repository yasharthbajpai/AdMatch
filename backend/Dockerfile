# Playwright Python base image — Chromium already installed at /ms-playwright
FROM mcr.microsoft.com/playwright/python:v1.58.0-jammy

WORKDIR /app

# Tell Playwright where the pre-installed browsers are
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh

EXPOSE 8000

CMD ["bash", "start.sh"]
