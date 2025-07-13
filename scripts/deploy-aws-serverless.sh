#!/bin/bash

# AWS Serverless Deployment for GhEHR using SAM
echo "☁️ Preparing GhEHR for AWS Serverless deployment..."

# Install SAM CLI if not available
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI not found. Please install it first:"
    echo "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
fi

# Create SAM template
cat > template.yaml << 'EOF'
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: GhEHR - Ghana Electronic Health Records System

Globals:
  Function:
    Timeout: 30
    Runtime: nodejs18.x
    Environment:
      Variables:
        NODE_ENV: production
        JWT_SECRET: !Ref JWTSecret
        CORS_ORIGIN: !Ref CORSOrigin

Parameters:
  JWTSecret:
    Type: String
    Description: JWT Secret for authentication
    NoEcho: true
  CORSOrigin:
    Type: String
    Description: CORS origin URL
    Default: "*"

Resources:
  # Lambda function for backend API
  GhEHRFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: dist/backend/
      Handler: lambda.handler
      Events:
        Api:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
        Root:
          Type: Api
          Properties:
            Path: /
            Method: ANY

  # S3 bucket for frontend
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "${AWS::StackName}-frontend"
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  # Bucket policy for public access
  FrontendBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref FrontendBucket
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal: "*"
            Action: s3:GetObject
            Resource: !Sub "${FrontendBucket}/*"

  # CloudFront distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt FrontendBucket.DomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: ""
        Enabled: true
        DefaultRootObject: index.html
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
        PriceClass: PriceClass_100

Outputs:
  ApiUrl:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
  
  FrontendUrl:
    Description: "Frontend S3 website URL"
    Value: !GetAtt FrontendBucket.WebsiteURL
  
  CloudFrontUrl:
    Description: "CloudFront distribution URL"
    Value: !GetAtt CloudFrontDistribution.DomainName
EOF

# Create Lambda handler
mkdir -p dist/backend
cat > dist/backend/lambda.js << 'EOF'
const serverlessExpress = require('@vendia/serverless-express');
const app = require('./server');

exports.handler = serverlessExpress({ app });
EOF

# Build the application
echo "📦 Building application..."
./scripts/deploy.sh

# Copy Lambda handler
cp dist/backend/lambda.js dist/backend/lambda.js

# Install serverless-express
cd dist/backend
npm install @vendia/serverless-express
cd ../..

# Deploy with SAM
echo "🚀 Deploying to AWS..."
sam build
sam deploy --guided

echo "✅ Serverless deployment complete!"
echo "Check the CloudFormation outputs for your API and frontend URLs"
