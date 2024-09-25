# Use a lightweight version of Python
FROM python:3.9-slim

# Install system dependencies needed for Playwright and other libraries
RUN apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libdrm2 libgbm1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    ca-certificates fonts-liberation libappindicator3-1 \
    libasound2 lsb-release wget

# Install Playwright dependencies
RUN pip install playwright && playwright install

# Set the working directory inside the container
WORKDIR /app

# Copy your project files to the container
COPY . /app

# Install Python dependencies
RUN pip install -r requirements.txt

# Expose port 5000 for Flask app
EXPOSE 5000

# Define the command to run the app
CMD ["python", "app.py"]
