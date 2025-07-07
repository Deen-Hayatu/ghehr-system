#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Print each command before executing it
set -x

# Frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Backend
echo "Building backend..."
cd backend
npm install
npm run build
cd ..

# Create distribution folder
echo "Creating distribution folder..."
rm -rf dist
mkdir -p dist/backend

# Copy files
echo "Copying files..."
cp -r backend/dist/* dist/backend/
cp -r backend/node_modules dist/backend/
cp backend/package.json dist/backend/
cp -r frontend/build dist/frontend

echo "Deployment package ready in dist folder."
