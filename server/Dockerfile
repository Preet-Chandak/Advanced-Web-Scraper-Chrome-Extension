# Use an official Python runtime as a base image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies required by Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libgbm1 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libatk1.0-0 \
    libcups2 \
    libdbus-glib-1-2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libxfixes3 \
    libpango1.0-0 \
    libx11-xcb1 \
    xvfb \
    --no-install-recommends \
    && apt-get clean

# Install Playwright Python package and required dependencies
RUN pip install --upgrade pip
RUN pip install playwright beautifulsoup4 flask flask-cors

# Install Playwright browser binaries and system dependencies
RUN playwright install-deps && playwright install

# Set the working directory
WORKDIR /app

# Copy project files
COPY . .

# Expose port 5000 for Flask
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]
