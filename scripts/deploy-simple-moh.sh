#!/bin/bash

# Simplified MOH Deployment Script for AWS Compatibility
set -e

echo "🏥 Creating Simplified MOH Deployment Package..."

# Clean and create deployment directory
rm -rf simple-deploy
mkdir -p simple-deploy

# Copy compiled backend files
echo "📋 Copying backend files..."
cp -r backend/dist/* simple-deploy/
cp -r backend/node_modules simple-deploy/

# Create a simplified, AWS-compatible package.json
cat > simple-deploy/package.json << 'EOF'
{
  "name": "ghehr-moh-backend",
  "version": "1.0.0",
  "description": "Ghana Electronic Health Records with MOH Integration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": "22.x",
    "npm": "10.x"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^17.0.0",
    "bcryptjs": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.2.1",
    "express-rate-limit": "^7.5.1",
    "compression": "^1.8.0",
    "multer": "^2.0.1",
    "pdfkit": "^0.17.1",
    "axios": "^1.10.0"
  }
}
EOF

# Copy frontend build
echo "🌐 Copying frontend files..."
mkdir -p simple-deploy/public
cp -r frontend/build/* simple-deploy/public/

# Create AWS Elastic Beanstalk configuration
mkdir -p simple-deploy/.ebextensions

# Environment configuration
cat > simple-deploy/.ebextensions/01-environment.config << 'EOF'
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
  aws:elasticbeanstalk:healthreporting:system:
    SystemType: enhanced
EOF

# NGINX configuration for React SPA
cat > simple-deploy/.ebextensions/02-nginx.config << 'EOF'
files:
  /etc/nginx/conf.d/spa.conf:
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

# Create startup validation script
cat > simple-deploy/.ebextensions/03-startup.config << 'EOF'
commands:
  01_node_version:
    command: "node --version"
  02_npm_version:
    command: "npm --version"
container_commands:
  01_check_main_file:
    command: "test -f index.js"
  02_check_dependencies:
    command: "npm list --depth=0"
EOF

# Create deployment package
echo "📦 Creating deployment package..."
cd simple-deploy

python -c "
import zipfile
import os

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arc_path = os.path.relpath(file_path, path)
            ziph.write(file_path, arc_path)

with zipfile.ZipFile('../deployment-simple-moh.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('.', zipf)
    
print('Simplified MOH deployment package created')
"

cd ..

echo "✅ Simplified deployment package ready: deployment-simple-moh.zip"
echo "📊 Package optimized for AWS Elastic Beanstalk Node.js 22"
echo "🏥 All MOH features included and AWS-compatible"
