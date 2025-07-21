#!/bin/bash

# GhEHR MOH-Integrated AWS Deployment Script (Windows Compatible)
# This script deploys the Ghana MOH-compliant EHR system to AWS Elastic Beanstalk

set -e

echo "🏥 Starting GhEHR MOH-Integrated Deployment to AWS..."
echo "📅 Deployment Date: $(date)"
echo "🌍 Ghana MOH Features: ENABLED"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf deployment-package.zip

# Clean backend build
if [ -d "backend/dist" ]; then
    rm -rf backend/dist
fi

# Clean frontend build
if [ -d "frontend/build" ]; then
    rm -rf frontend/build
fi

# Frontend Build with MOH Features
echo "🎨 Building frontend with MOH Dashboard and features..."
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create production environment file
echo "REACT_APP_API_URL=https://your-eb-environment.elasticbeanstalk.com" > .env.production

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Verify frontend build
echo "✅ Verifying frontend build..."
if [ ! -d "build" ]; then
    echo "❌ Frontend build failed - build directory not found"
    exit 1
fi

if [ ! -f "build/index.html" ]; then
    echo "❌ Frontend build failed - index.html not found"
    exit 1
fi

echo "✅ Frontend build successful!"
cd ..

# Backend Build with MOH AI and Features
echo "🔧 Building backend with MOH AI and compliance features..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Build TypeScript
echo "🔨 Building backend TypeScript..."
npm run build

# Verify backend build
echo "✅ Verifying backend build..."
if [ ! -d "dist" ]; then
    echo "❌ Backend build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ Backend build failed - index.js not found"
    exit 1
fi

echo "✅ Backend build successful!"
cd ..

# Create AWS deployment structure
echo "📦 Creating AWS Elastic Beanstalk deployment package..."
mkdir -p dist/public

# Copy backend files to root level (EB Node.js platform requirement)
echo "📋 Copying backend files..."
cp -r backend/dist/* dist/
cp -r backend/node_modules dist/

# Copy package.json and update for AWS
echo "⚙️ Configuring package.json for AWS..."
cp backend/package.json dist/

# Update package.json for AWS deployment
cd dist
# Create temporary script to update package.json
cat > update_package.js << 'EOF'
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.main = 'index.js';
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.start = 'node index.js';
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Package.json updated for AWS deployment');
EOF

node update_package.js
rm update_package.js
cd ..

# Copy frontend build
echo "🌐 Copying frontend files..."
cp -r frontend/build/* dist/public/

# Create AWS-specific configuration
echo "☁️ Creating AWS configuration..."

# Create .ebextensions for MOH-specific AWS settings
mkdir -p dist/.ebextensions

# Environment configuration for MOH features
cat > dist/.ebextensions/01-environment.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
    GHANA_MOH_ENABLED: true
    MOH_FACILITY_TYPES_ENABLED: true
    MOH_DISEASE_SURVEILLANCE_ENABLED: true
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /static: public/static
    /: public
  aws:elasticbeanstalk:environment:proxy:
    ProxyServer: nginx
  aws:autoscaling:launchconfiguration:
    InstanceType: t3.small
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
  aws:elasticbeanstalk:healthreporting:system:
    SystemType: enhanced
EOF

# NGINX configuration for SPA routing (for MOH Dashboard routing)
cat > dist/.ebextensions/02-nginx.config << 'EOF'
files:
  /etc/nginx/conf.d/01-spa.conf:
    mode: "000644"
    owner: root
    group: root
    content: |
      location / {
        try_files $uri $uri/ /index.html;
      }
      
      location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
      }
EOF

# Security headers for HIPAA-like compliance
cat > dist/.ebextensions/03-security.config << 'EOF'
files:
  /etc/nginx/conf.d/02-security.conf:
    mode: "000644"
    owner: root
    group: root
    content: |
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
      add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;" always;
EOF

# Create deployment info file
cat > dist/DEPLOYMENT_INFO.json << EOF
{
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date)",
  "version": "1.0.0-moh-integrated",
  "features": {
    "mohCompliance": true,
    "mohDashboard": true,
    "mohContactInfo": true,
    "mohPatientFields": true,
    "mohDiseaseAI": true,
    "mohFacilityTypes": true,
    "mohDiseaseSurveillance": true
  },
  "components": {
    "frontend": "React with MOH Dashboard",
    "backend": "Node.js with MOH AI",
    "ai": "Ghana Medical NLP",
    "compliance": "MOH Standards"
  }
}
EOF

# Create ZIP package for AWS using Python (cross-platform)
echo "📦 Creating deployment ZIP package..."
cd dist

# Use Python to create zip (more reliable than shell zip commands)
python -c "
import zipfile
import os

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arc_path = os.path.relpath(file_path, path)
            ziph.write(file_path, arc_path)

with zipfile.ZipFile('../deployment-package.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('.', zipf)
    
print('Deployment package created successfully')
"

cd ..

# Verify deployment package
echo "✅ Verifying deployment package..."
if [ -f "deployment-package.zip" ]; then
    PACKAGE_SIZE=$(du -h deployment-package.zip 2>/dev/null || stat -c%s deployment-package.zip 2>/dev/null || echo "Unknown")
    echo "📦 Package size: $PACKAGE_SIZE"
else
    echo "❌ Deployment package creation failed"
    exit 1
fi

# Create deployment summary
echo "📊 Creating deployment summary..."
cat > MOH_DEPLOYMENT_SUMMARY.md << EOF
# GhEHR MOH-Integrated AWS Deployment Summary

## Deployment Information
- **Date**: $(date)
- **Version**: 1.0.0-moh-integrated
- **Package Size**: $PACKAGE_SIZE
- **Target Platform**: AWS Elastic Beanstalk (Node.js)

## MOH Features Included ✅
- ✅ MOH-compliant Patient Registration
- ✅ MOH Priority Disease AI Analysis
- ✅ MOH Dashboard with Analytics
- ✅ MOH Contact Information
- ✅ MOH Facility Type Classification
- ✅ Disease Surveillance Integration
- ✅ Ghana-specific Medical Terminology

## AWS Configuration
- **Instance Type**: t3.small (optimized for healthcare workloads)
- **Environment**: Production
- **Security**: HIPAA-like compliance headers
- **Routing**: SPA routing for MOH Dashboard
- **Proxy**: NGINX with API routing

## Next Steps - AWS Deployment Commands

### Option 1: Manual Upload to Existing Environment
\`\`\`bash
# Upload to S3 (replace with your bucket name)
aws s3 cp deployment-package.zip s3://your-eb-bucket/ghehr-moh-v$(date +%Y%m%d-%H%M%S).zip

# Deploy to existing environment
aws elasticbeanstalk create-application-version \\
  --application-name ghehr-system \\
  --version-label moh-v$(date +%Y%m%d-%H%M%S) \\
  --source-bundle S3Bucket="your-eb-bucket",S3Key="ghehr-moh-v$(date +%Y%m%d-%H%M%S).zip"

aws elasticbeanstalk update-environment \\
  --environment-name ghehr-production-v2 \\
  --version-label moh-v$(date +%Y%m%d-%H%M%S)
\`\`\`

### Option 2: Create New MOH Application
\`\`\`bash
# Create new application for MOH version
aws elasticbeanstalk create-application \\
  --application-name ghehr-moh-system \\
  --description "Ghana Electronic Health Records with MOH Integration"

# Create environment
aws elasticbeanstalk create-environment \\
  --application-name ghehr-moh-system \\
  --environment-name ghehr-moh-production \\
  --solution-stack-name "64bit Amazon Linux 2 v5.8.4 running Node.js 18"
\`\`\`

## Environment Variables Required
\`\`\`
NODE_ENV=production
PORT=8080
JWT_SECRET=your-secure-jwt-secret
GHANA_MOH_ENABLED=true
MOH_FACILITY_TYPES_ENABLED=true
MOH_DISEASE_SURVEILLANCE_ENABLED=true
\`\`\`

EOF

echo ""
echo "🎉 GhEHR MOH-Integrated Deployment Package Ready!"
PACKAGE_SIZE_DISPLAY=$(du -h deployment-package.zip 2>/dev/null | cut -f1 || echo "Created")
echo "📦 Package: deployment-package.zip ($PACKAGE_SIZE_DISPLAY)"
echo "📋 Summary: MOH_DEPLOYMENT_SUMMARY.md"
echo ""
echo "🚀 Next Steps:"
echo "1. Upload deployment-package.zip to AWS S3"
echo "2. Deploy to Elastic Beanstalk environment"
echo "3. Configure environment variables"
echo "4. Test MOH features"
echo ""
echo "🏥 Ghana MOH Features: FULLY INTEGRATED ✅"
echo "🌍 Ready for national healthcare deployment!"
echo ""
echo "📖 See MOH_DEPLOYMENT_SUMMARY.md for detailed AWS deployment commands"
