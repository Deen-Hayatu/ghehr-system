#!/bin/bash

# GhEHR MOH AWS Deployment Commands
# Run these commands in your terminal with your AWS CLI

echo "🏥 GhEHR MOH AWS Deployment Commands"
echo "=================================="
echo ""

# Check if AWS CLI is configured
echo "Checking AWS CLI configuration..."
aws configure list

echo ""
echo "Available deployment commands:"
echo ""

echo "📦 Option 1: Upload to existing S3 bucket and deploy"
echo "Replace 'your-bucket-name' with your actual S3 bucket name:"
echo ""
echo "aws s3 cp deployment-package.zip s3://your-bucket-name/ghehr-moh-v20250714.zip"
echo ""
echo "aws elasticbeanstalk create-application-version \\"
echo "  --application-name ghehr-system \\"
echo "  --version-label moh-v20250714 \\"
echo "  --source-bundle S3Bucket=\"your-bucket-name\",S3Key=\"ghehr-moh-v20250714.zip\""
echo ""
echo "aws elasticbeanstalk update-environment \\"
echo "  --environment-name ghehr-production-v2 \\"
echo "  --version-label moh-v20250714"
echo ""

echo "📦 Option 2: Create new MOH application"
echo ""
echo "aws elasticbeanstalk create-application \\"
echo "  --application-name ghehr-moh-system \\"
echo "  --description \"Ghana Electronic Health Records with MOH Integration\""
echo ""
echo "aws s3 mb s3://ghehr-moh-deployments"
echo ""
echo "aws s3 cp deployment-package.zip s3://ghehr-moh-deployments/ghehr-moh-v20250714.zip"
echo ""
echo "aws elasticbeanstalk create-environment \\"
echo "  --application-name ghehr-moh-system \\"
echo "  --environment-name ghehr-moh-production \\"
echo "  --solution-stack-name \"64bit Amazon Linux 2 v5.8.4 running Node.js 18\""
echo ""

echo "🔧 Set environment variables after deployment:"
echo "NODE_ENV=production"
echo "PORT=8080"
echo "JWT_SECRET=your-secure-jwt-secret"
echo "GHANA_MOH_ENABLED=true"
echo "MOH_FACILITY_TYPES_ENABLED=true"
echo "MOH_DISEASE_SURVEILLANCE_ENABLED=true"
echo ""

echo "📍 Your deployment package is ready at: deployment-package.zip"
echo "📊 Package size: 17MB"
echo "🏥 MOH features: Fully integrated"
