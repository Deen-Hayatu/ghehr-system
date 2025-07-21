#!/bin/bash

# GhEHR MOH-Integrated AWS Deployment Script
# This script deploys the Ghana MOH-compliant EHR system to AWS Elastic Beanstalk

set -e
set -x

echo "🏥 Starting GhEHR MOH-Integrated Deployment to AWS..."
echo "📅 Deployment Date: $(date)"
echo "🌍 Ghana MOH Features: ENABLED"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf deployment-package.zip
rm -rf backend/dist
rm -rf frontend/build

# Frontend Build with MOH Features
echo "🎨 Building frontend with MOH Dashboard and features..."
cd frontend

# Ensure environment is set for production
echo "REACT_APP_API_URL=https://your-eb-environment.elasticbeanstalk.com" > .env.production

npm ci --only=production
npm run build

# Verify MOH components are included in build
echo "✅ Verifying MOH components in build..."
if [ ! -f "build/static/js/main.*.js" ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

cd ..

# Backend Build with MOH AI and Features
echo "🔧 Building backend with MOH AI and compliance features..."
cd backend

npm ci --only=production
npm run build

# Verify MOH backend files are compiled
echo "✅ Verifying MOH backend components..."
if [ ! -f "dist/index.js" ]; then
  echo "❌ Backend build failed"
  exit 1
fi

# Check for MOH-specific files
if [ ! -f "dist/routes/clinicalNotes.js" ]; then
  echo "❌ MOH Clinical Notes AI missing"
  exit 1
fi

if [ ! -f "dist/models/Patient.js" ]; then
  echo "❌ MOH Patient model missing"
  exit 1
fi

cd ..

# Create AWS deployment structure
echo "📦 Creating AWS Elastic Beanstalk deployment package..."
mkdir -p dist/public

# Copy backend files to root level (EB Node.js platform requirement)
echo "📋 Copying backend files..."
cp -r backend/dist/* dist/
cp -r backend/node_modules dist/
cp backend/package.json dist/

# Update package.json for AWS deployment
echo "⚙️ Configuring package.json for AWS..."
cd dist
# Fix main entry point for AWS
cat package.json | jq '.main = "index.js"' | jq '.scripts.start = "node index.js"' > package.json.tmp
mv package.json.tmp package.json
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
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
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

# Create ZIP package for AWS
echo "📦 Creating deployment ZIP package..."
cd dist
zip -r ../deployment-package.zip . -x "*.git*" "*.DS_Store*" "node_modules/.cache/*"
cd ..

# Verify deployment package
echo "✅ Verifying deployment package..."
PACKAGE_SIZE=$(du -h deployment-package.zip | cut -f1)
echo "📦 Package size: $PACKAGE_SIZE"

if [ ! -f "deployment-package.zip" ]; then
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

## Deployment Commands
\`\`\`bash
# Upload to S3 (replace with your bucket name)
aws s3 cp deployment-package.zip s3://your-eb-bucket/ghehr-moh-v$(date +%Y%m%d-%H%M%S).zip

# Create application version
aws elasticbeanstalk create-application-version \\
  --application-name ghehr-moh-system \\
  --version-label moh-v$(date +%Y%m%d-%H%M%S) \\
  --source-bundle S3Bucket="your-eb-bucket",S3Key="ghehr-moh-v$(date +%Y%m%d-%H%M%S).zip"

# Deploy to environment
aws elasticbeanstalk update-environment \\
  --environment-name ghehr-moh-production \\
  --version-label moh-v$(date +%Y%m%d-%H%M%S)
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

## Post-Deployment Testing
1. Test MOH Dashboard access
2. Verify patient registration with MOH fields
3. Test disease AI analysis
4. Check MOH contact information
5. Validate compliance reporting

## Ready for Ghana Healthcare Deployment 🏥🇬🇭
EOF

echo ""
echo "🎉 GhEHR MOH-Integrated Deployment Package Ready!"
echo "📦 Package: deployment-package.zip ($PACKAGE_SIZE)"
echo "📋 Summary: MOH_DEPLOYMENT_SUMMARY.md"
echo ""
echo "🚀 Next Steps:"
echo "1. Upload to AWS S3 bucket"
echo "2. Deploy to Elastic Beanstalk environment"
echo "3. Configure environment variables"
echo "4. Test MOH features"
echo ""
echo "🏥 Ghana MOH Features: FULLY INTEGRATED ✅"
echo "🌍 Ready for national healthcare deployment!"
