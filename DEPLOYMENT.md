# GhEHR Deployment Guide

## Overview
This guide covers the complete deployment process for the GhEHR (Ghana Electronic Health Records) system to AWS Elastic Beanstalk.

## Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- Git installed

## Quick Deployment

### 1. Deploy to AWS Elastic Beanstalk
```bash
# Run the deployment script
bash scripts/deploy.sh

# Upload to S3 and deploy
aws s3 cp deployment-package.zip s3://your-eb-bucket/ghehr-app-$(date +%Y%m%d-%H%M%S).zip
aws elasticbeanstalk create-application-version --application-name ghehr-system-us --version-label v$(date +%Y%m%d-%H%M%S) --source-bundle S3Bucket="your-eb-bucket",S3Key="ghehr-app-$(date +%Y%m%d-%H%M%S).zip"
aws elasticbeanstalk update-environment --environment-name ghehr-production-v2 --version-label v$(date +%Y%m%d-%H%M%S)
```

### 2. Environment Configuration
The application requires the following environment variables:

**Backend (.env)**:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=your-database-url
```

**Frontend (.env)**:
```
REACT_APP_API_URL=http://your-deployment-url.elasticbeanstalk.com
```

## Current Deployment
- **Live URL**: http://ghehr-production-v2.eba-nymf88yi.us-east-1.elasticbeanstalk.com
- **Status**: ✅ Fully functional
- **Features Working**: 
  - User authentication
  - Patient management
  - Clinical notes with AI analysis
  - Appointment scheduling
  - Billing & invoicing
  - PDF invoice download
  - Dashboard reports

## Architecture

### Backend (Node.js/Express)
- **Entry Point**: `backend/src/index.ts`
- **Routes**: Authentication, Patients, Appointments, Billing, Clinical Notes, Reports
- **Authentication**: JWT-based with role-based access control
- **File Structure**:
  ```
  backend/
  ├── src/
  │   ├── routes/          # API endpoints
  │   ├── middleware/      # Auth, error handling
  │   ├── models/          # Data models
  │   └── utils/           # Utilities
  ├── dist/               # Compiled JavaScript
  └── package.json
  ```

### Frontend (React/TypeScript)
- **Entry Point**: `frontend/src/index.tsx`
- **Components**: Dashboard, Patient Management, Billing, Clinical Notes
- **Authentication**: JWT token stored in localStorage
- **Styling**: Material-UI with Ghana-themed design
- **File Structure**:
  ```
  frontend/
  ├── src/
  │   ├── components/      # React components
  │   ├── contexts/        # Auth context
  │   └── theme/           # UI theme
  ├── build/              # Production build
  └── package.json
  ```

## Features

### ✅ Implemented Features
1. **User Authentication**
   - JWT-based login/logout
   - Role-based access (admin, doctor, nurse)
   - Protected routes

2. **Patient Management**
   - Patient registration and search
   - Medical history tracking
   - Unique patient IDs

3. **Clinical Notes with AI**
   - Real-time medical text analysis
   - Ghana-specific disease detection
   - Symptom extraction and confidence scoring
   - Treatment recommendations

4. **Appointment Scheduling**
   - Calendar view for providers
   - Appointment booking and management
   - Status tracking

5. **Billing & Payments**
   - Invoice creation and tracking
   - PDF invoice generation and download
   - Payment status management

6. **Dashboard & Reports**
   - Patient statistics
   - Revenue summaries
   - Appointment analytics

### 🚧 Planned Features
- WhatsApp integration for appointment booking
- Offline mode with auto-sync
- Voice notes and speech recognition
- SMS reminders via Twilio
- Mobile Money payment integration

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient

### Clinical Notes
- `GET /api/notes` - Get clinical notes
- `POST /api/notes` - Create clinical note
- `POST /api/notes/analyze` - Analyze medical text with AI

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment

### Billing
- `GET /api/billing` - List invoices
- `POST /api/billing` - Create invoice
- `GET /api/billing/:id/pdf` - Download invoice PDF

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics

## Security Features
- JWT authentication with secure secret
- CORS configuration
- Security headers (Helmet.js)
- Input validation and sanitization
- Rate limiting
- SQL injection prevention

## Troubleshooting

### Common Issues
1. **PDF Download Not Working**
   - Ensure JWT secret is consistent between auth routes and middleware
   - Check CORS headers are properly set
   - Verify authentication token is valid

2. **Frontend Can't Connect to Backend**
   - Check `REACT_APP_API_URL` in frontend `.env`
   - Ensure backend is deployed and accessible
   - Verify CORS configuration

3. **Authentication Issues**
   - Check JWT_SECRET environment variable
   - Verify token expiration settings
   - Check user credentials

### Debug Tools
Test pages are available for debugging:
- `test-pdf-download-debug.html` - PDF download testing
- `test-login.html` - Authentication testing
- `test-patient-api.html` - Patient API testing

## Monitoring
- AWS CloudWatch logs available
- Application health monitoring via Elastic Beanstalk
- Error tracking in application logs

## Support
For issues or questions, check the repository documentation or create an issue on GitHub.