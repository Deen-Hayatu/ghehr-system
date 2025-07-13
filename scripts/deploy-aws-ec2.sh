#!/bin/bash

# AWS EC2 Docker Deployment Script for GhEHR
echo "🐳 Preparing GhEHR for AWS EC2 Docker deployment..."

# Build the application first
echo "📦 Building application..."
./scripts/deploy.sh

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t ghehr-system:latest .

# Tag for AWS ECR
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"  # Change to your preferred region
ECR_REPO="ghehr-system"

echo "📤 Preparing for AWS ECR..."
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo "ECR Repository: $ECR_REPO"

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>/dev/null || {
    echo "Creating ECR repository..."
    aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION
}

# Get ECR login token
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag and push image
echo "🚀 Pushing image to ECR..."
docker tag ghehr-system:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

# Create docker-compose for EC2
cat > docker-compose.yml << EOF
version: '3.8'

services:
  ghehr-backend:
    image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
    ports:
      - "80:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - JWT_SECRET=\${JWT_SECRET}
      - CORS_ORIGIN=\${CORS_ORIGIN}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - ghehr-backend
    restart: unless-stopped
EOF

# Create nginx configuration
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server ghehr-backend:5000;
    }

    server {
        listen 80;
        server_name _;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name _;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Create EC2 user data script
cat > ec2-user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y docker
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
yum install -y aws-cli

# Create app directory
mkdir -p /opt/ghehr
cd /opt/ghehr

# Download docker-compose.yml from S3 or copy from deployment
# aws s3 cp s3://your-deployment-bucket/docker-compose.yml .
# aws s3 cp s3://your-deployment-bucket/nginx.conf .

# Start the application
docker-compose up -d
EOF

echo "✅ Docker deployment package ready!"
echo "📁 Docker image pushed to ECR"
echo "📁 docker-compose.yml created"
echo "📁 nginx.conf created"
echo "📁 ec2-user-data.sh created"
echo ""
echo "Next steps:"
echo "1. Launch EC2 instance with the user data script"
echo "2. Copy docker-compose.yml and nginx.conf to EC2"
echo "3. Set environment variables"
echo "4. Run 'docker-compose up -d' on EC2"
