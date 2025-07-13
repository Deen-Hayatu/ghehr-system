#!/bin/bash

# AWS Elastic Beanstalk Deployment Script for GhEHR
# This script prepares and deploys your application to AWS Elastic Beanstalk

echo "🚀 Preparing GhEHR for AWS Elastic Beanstalk deployment..."

# Build the application
echo "📦 Building application..."
./scripts/deploy.sh

# Create Elastic Beanstalk application structure
echo "🏗️ Creating Elastic Beanstalk structure..."
mkdir -p aws-deployment/backend
mkdir -p aws-deployment/frontend

# Copy backend files
cp -r dist/backend/* aws-deployment/backend/
cp backend/.env.example aws-deployment/backend/.env

# Create package.json for deployment
cat > aws-deployment/backend/package.json << 'EOF'
{
  "name": "ghehr-backend",
  "version": "1.0.0",
  "description": "GhEHR Backend for AWS Deployment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
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

# Create Procfile for Elastic Beanstalk
echo "web: node server.js" > aws-deployment/backend/Procfile

# Create .ebextensions for additional configuration
mkdir -p aws-deployment/backend/.ebextensions
cat > aws-deployment/backend/.ebextensions/01_node_command.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node server.js"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
EOF

# Create environment configuration
cat > aws-deployment/backend/.ebextensions/02_environment.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    JWT_SECRET: your-super-secure-jwt-secret-change-this
    CORS_ORIGIN: "*"
    PORT: 8080
EOF

# Copy frontend files to S3-ready structure
cp -r dist/frontend/* aws-deployment/frontend/

# Create S3 deployment script
cat > aws-deployment/deploy-frontend-s3.sh << 'EOF'
#!/bin/bash

# Frontend S3 Deployment Script
BUCKET_NAME="ghehr-frontend-bucket"  # Change this to your bucket name
REGION="us-east-1"  # Change to your preferred region

echo "🌐 Deploying frontend to S3..."

# Create S3 bucket (if it doesn't exist)
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload files
aws s3 sync frontend/ s3://$BUCKET_NAME --delete

# Make bucket public
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
    }
  ]
}'

echo "✅ Frontend deployed to: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
EOF

chmod +x aws-deployment/deploy-frontend-s3.sh

# Create backend deployment zip
cd aws-deployment/backend
zip -r ../ghehr-backend-deployment.zip . -x "*.git*" "node_modules/.cache/*"
cd ../..

echo "✅ AWS Elastic Beanstalk deployment package ready!"
echo "📁 Backend package: aws-deployment/ghehr-backend-deployment.zip"
echo "📁 Frontend files: aws-deployment/frontend/"
echo ""
echo "Next steps:"
echo "1. Upload ghehr-backend-deployment.zip to Elastic Beanstalk"
echo "2. Run ./aws-deployment/deploy-frontend-s3.sh to deploy frontend"
echo "3. Configure environment variables in EB console"
