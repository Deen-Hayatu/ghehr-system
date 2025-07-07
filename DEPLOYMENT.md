# GhEHR Production Deployment Guide

## Overview
This guide covers the deployment of the GhEHR (Ghana Electronic Health Records) system to production.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git repository access
- SSL certificate for HTTPS (recommended)
- PostgreSQL database (optional, currently uses in-memory storage)

## Quick Deployment

### 1. Build the Application
```bash
# Clone the repository
git clone <your-repo-url>
cd EHR

# Make the deployment script executable
chmod +x scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

### 2. Configure Environment
```bash
# Copy production environment template
cp backend/.env.production backend/.env

# Edit the environment file with your production values
nano backend/.env
```

### 3. Start Production Server
```bash
# Method 1: Using the production script
cd backend
chmod +x start-production.sh
./start-production.sh

# Method 2: Manual start
cd dist/backend
NODE_ENV=production node server.js
```

## Detailed Deployment Steps

### Frontend Deployment
The frontend is built as a static React application that can be served by any web server.

#### Option 1: Serve with Node.js (Express)
```bash
# Install serve globally
npm install -g serve

# Serve the built frontend
serve -s dist/frontend -l 3000
```

#### Option 2: Use Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/EHR/dist/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backend Deployment
The backend runs as a Node.js Express server.

#### Environment Configuration
Key environment variables to configure:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-key
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

#### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start dist/backend/server.js --name "ghehr-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Features Verification Checklist

After deployment, verify these features work correctly:

### ✅ Patient Management
- [ ] Patient registration
- [ ] Patient search and filtering
- [ ] Patient details view
- [ ] Patient data export

### ✅ Clinical Notes
- [ ] AI-powered medical analysis
- [ ] Symptom extraction
- [ ] Treatment recommendations
- [ ] Real-time text analysis

### ✅ Appointment Management
- [ ] Appointment scheduling
- [ ] Calendar view
- [ ] Appointment status updates
- [ ] Patient notification system

### ✅ Billing & Invoicing
- [ ] Invoice creation
- [ ] Patient selection dropdown
- [ ] Invoice PDF download
- [ ] Invoice printing
- [ ] Payment processing

### ✅ Reports & Analytics
- [ ] Dashboard statistics
- [ ] Revenue reports
- [ ] Patient analytics
- [ ] Data export functionality

## Security Considerations

### HTTPS Configuration
Always use HTTPS in production:
```bash
# Generate SSL certificate with Let's Encrypt
certbot --nginx -d your-domain.com
```

### Database Security
- Use strong database passwords
- Enable SSL connections
- Implement proper backup strategies
- Regular security updates

### API Security
- JWT token expiration (24 hours by default)
- Rate limiting enabled
- Input validation on all endpoints
- CORS properly configured

## Monitoring and Logging

### Application Logs
```bash
# View backend logs
pm2 logs ghehr-backend

# View specific log file
tail -f logs/app.log
```

### Health Checks
Create monitoring endpoints:
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump -U username -h localhost ghehr_prod > backup.sql

# Restore from backup
psql -U username -h localhost ghehr_prod < backup.sql
```

### File System Backup
```bash
# Backup uploads and logs
tar -czf ghehr-backup-$(date +%Y%m%d).tar.gz uploads/ logs/
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
netstat -tulpn | grep 5000
kill -9 <process_id>
```

#### 2. Permission Errors
```bash
# Fix file permissions
chmod +x scripts/*.sh
chown -R node:node /path/to/app
```

#### 3. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node server.js
```

## Performance Optimization

### Frontend Optimization
- Gzip compression enabled
- Static asset caching
- Code splitting implemented
- Bundle size optimization

### Backend Optimization
- Response compression
- Database query optimization
- API response caching
- Rate limiting

## Scaling Considerations

### Horizontal Scaling
- Use a load balancer (Nginx, HAProxy)
- Implement session storage (Redis)
- Database clustering
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Database optimization
- Application profiling
- Memory leak detection

## Support and Maintenance

### Regular Maintenance Tasks
- [ ] Security updates
- [ ] Database optimization
- [ ] Log rotation
- [ ] Performance monitoring
- [ ] Backup verification

### Version Updates
```bash
# Update to new version
git pull origin main
npm install
npm run build
pm2 restart ghehr-backend
```

## Contact Information
For technical support and questions:
- Email: support@ghehr.com
- Documentation: https://docs.ghehr.com
- Issue Tracker: https://github.com/your-org/ghehr/issues

---

**Note**: This deployment guide assumes a single-server setup. For high-availability production environments, consider implementing clustering, load balancing, and database replication.
