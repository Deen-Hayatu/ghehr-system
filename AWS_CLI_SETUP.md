# AWS CLI Installation Guide for Windows

## Option 1: Download AWS CLI Installer
1. Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Open new command prompt
4. Run: aws configure

## Option 2: Install via Python pip
1. Install Python if not already installed
2. Run: pip install awscli
3. Run: aws configure

## Option 3: Use AWS CloudShell (No installation needed)
1. Login to AWS Console
2. Click on CloudShell icon (>_) in top navigation
3. Upload deployment-package.zip to CloudShell
4. Run deployment commands from there

## Configure AWS CLI
After installation, run:
```
aws configure
```

Enter:
- AWS Access Key ID: [Your access key]
- AWS Secret Access Key: [Your secret key]
- Default region name: us-east-1 (or your preferred region)
- Default output format: json

## Test AWS CLI
```
aws sts get-caller-identity
```

This should show your AWS account information.
