#!/bin/bash

# GhEHR System - macOS Startup Script
# This script starts both backend and frontend servers

echo "🍎 Starting GhEHR System on macOS..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exist
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Dependencies installed"
fi

# Build backend if needed
if [ ! -d "backend/dist" ]; then
    echo "🔨 Building backend..."
    cd backend && npm run build && cd ..
    echo "✅ Backend built"
fi

# Start backend in background
echo "🚀 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd frontend && npm start

# If frontend exits, kill backend
echo "Shutting down backend..."
kill $BACKEND_PID 2>/dev/null || true
echo "🛑 GhEHR System stopped"
