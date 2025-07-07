#!/bin/bash

# Production startup script for GhEHR
echo "Starting GhEHR Production Server..."

# Check if production environment file exists
if [ ! -f .env.production ]; then
    echo "Warning: .env.production file not found. Using default .env"
    ENV_FILE=".env"
else
    ENV_FILE=".env.production"
fi

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Check if build exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found. Please run 'npm run build' first."
    exit 1
fi

# Start the server
echo "Starting backend server..."
NODE_ENV=production node dist/server.js

echo "GhEHR backend server started successfully!"
