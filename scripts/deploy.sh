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
mkdir -p dist/public

# Copy backend files to root level (for Elastic Beanstalk Node.js platform)
echo "Copying backend files to root level..."
cp -r backend/dist/* dist/
cp -r backend/node_modules dist/
cp backend/package.json dist/
cp backend/.env dist/

# Copy .ebextensions if it exists
if [ -d ".ebextensions" ]; then
  echo "Copying .ebextensions..."
  cp -r .ebextensions dist/
fi

# Update package.json to have correct main entry point
echo "Updating package.json for deployment..."
cd dist
# Update the main field to point to index.js instead of dist/index.js
sed -i 's/"main": "dist\/index.js"/"main": "index.js"/' package.json
# Update the start script to use index.js instead of dist/index.js
sed -i 's/"start": "node dist\/index.js"/"start": "node index.js"/' package.json
cd ..

# Copy frontend build to public directory (to be served as static files)
echo "Copying frontend files to public directory..."
cp -r frontend/build/* dist/public/

# Create deployment ZIP package
echo "Creating deployment ZIP package..."
cd dist
py -m zipfile -c ../deployment-package.zip .
cd ..

echo "Deployment package created: deployment-package.zip"
echo "Ready for AWS Elastic Beanstalk deployment."
