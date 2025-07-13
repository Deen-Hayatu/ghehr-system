#!/bin/bash

# Quick deployment script for Railway (simpler than AWS)
set -e

echo "=== GhEHR Quick Deployment to Railway ==="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm install
npm run build
cd ..

# Create deployment folder
echo "Creating unified deployment..."
rm -rf railway-deploy
mkdir -p railway-deploy

# Copy backend (Railway expects everything in root)
cp -r backend/dist/* railway-deploy/
cp -r backend/node_modules railway-deploy/
cp backend/package.json railway-deploy/

# Copy frontend build to public
mkdir -p railway-deploy/public
cp -r frontend/build/* railway-deploy/public/

# Create Railway-specific files
cat > railway-deploy/Procfile << EOF
web: node index.js
EOF

cat > railway-deploy/.railwayignore << EOF
node_modules
*.log
.git
EOF

# Update package.json for Railway
cd railway-deploy
sed -i 's/"main": "dist\/index.js"/"main": "index.js"/' package.json
sed -i 's/"start": "node dist\/index.js"/"start": "node index.js"/' package.json

# Add Railway-specific environment
cat >> .env << EOF

# Railway Production Settings
NODE_ENV=production
PORT=3000
EOF

cd ..

echo "✅ Railway deployment prepared!"
echo "📁 Files ready in: railway-deploy/"
echo ""
echo "🚀 Next steps:"
echo "1. cd railway-deploy"
echo "2. railway login"
echo "3. railway init"
echo "4. railway up"
echo ""
echo "🌐 This will give you a working HTTPS URL automatically!"
