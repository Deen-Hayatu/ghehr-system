# AWS Deployment Commands for GhEHR MOH System
# Run these in PowerShell or Command Prompt (not bash)

# Check AWS CLI
aws --version

# Check AWS configuration
aws configure list

# Option 1: Deploy to existing environment
# Replace 'your-bucket-name' and 'your-environment-name' with actual values

# Upload to S3
aws s3 cp deployment-package.zip s3://your-bucket-name/ghehr-moh-v20250714.zip

# Create application version
aws elasticbeanstalk create-application-version --application-name ghehr-system --version-label moh-v20250714 --source-bundle S3Bucket="your-bucket-name",S3Key="ghehr-moh-v20250714.zip"

# Deploy to environment
aws elasticbeanstalk update-environment --environment-name ghehr-production-v2 --version-label moh-v20250714

# Option 2: Create new MOH application
aws elasticbeanstalk create-application --application-name ghehr-moh-system --description "Ghana Electronic Health Records with MOH Integration"

# Create S3 bucket
aws s3 mb s3://ghehr-moh-deployments

# Upload package
aws s3 cp deployment-package.zip s3://ghehr-moh-deployments/ghehr-moh-v20250714.zip

# Create environment
aws elasticbeanstalk create-environment --application-name ghehr-moh-system --environment-name ghehr-moh-production --solution-stack-name "64bit Amazon Linux 2 v5.8.4 running Node.js 18"

# Set environment variables (after environment is created)
aws elasticbeanstalk update-environment --environment-name ghehr-moh-production --option-settings Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production Namespace=aws:elasticbeanstalk:application:environment,OptionName=PORT,Value=8080 Namespace=aws:elasticbeanstalk:application:environment,OptionName=GHANA_MOH_ENABLED,Value=true
