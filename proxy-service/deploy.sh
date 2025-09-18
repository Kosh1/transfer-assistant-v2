#!/bin/bash

# Transfer Proxy Service Deployment Script

set -e

echo "🚀 Starting deployment of Transfer Proxy Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Install dependencies
print_status "Installing dependencies..."
npm install

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing process if running
print_status "Stopping existing processes..."
pm2 stop transfer-proxy 2>/dev/null || true
pm2 delete transfer-proxy 2>/dev/null || true

# Start the service
print_status "Starting Transfer Proxy Service..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "✅ Deployment completed successfully!"
print_status "Service is running on port 3001"
print_status "Health check: curl http://localhost:3001/health"
print_status "Cache stats: curl http://localhost:3001/api/cache/stats"

# Show PM2 status
pm2 status
