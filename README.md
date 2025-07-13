# GhEHR - Ghana Electronic Health Records System

A comprehensive Electronic Health Records (EHR) system designed specifically for healthcare facilities in Ghana, featuring AI-powered clinical notes, offline capabilities, and culturally appropriate design.

![GhEHR Logo](https://via.placeholder.com/150x75/4CAF50/FFFFFF?text=GhEHR)

## 🌟 Features

### Core Features (MVP)
- **Patient Management** - Digital registration with demographics and medical history
- **Clinical Records** - AI-powered medical notes with Ghana-specific disease detection
- **Appointment Scheduling** - Calendar view with SMS reminders
- **Billing & Payments** - Invoice generation with PDF export
- **Reporting** - Dashboard analytics and revenue summaries

### Advanced Features
- **AI-Powered Clinical Notes** ✅ - Real-time analysis of medical text for common Ghana diseases
- **PDF Invoice Generation** ✅ - Professional invoice documents with download functionality
- **WhatsApp Integration** 🚧 - Appointment booking via WhatsApp (planned)
- **Offline Mode** 🚧 - PWA with auto-sync capabilities (planned)
- **Voice Notes** 🚧 - Speech-to-text for clinical documentation (planned)

## 🏗️ Architecture

- **Frontend**: React.js with TypeScript, Material-UI
- **Backend**: Node.js/Express with TypeScript
- **Database**: In-memory storage (PostgreSQL ready)
- **Authentication**: JWT-based with role-based access control
- **Deployment**: AWS Elastic Beanstalk ready

## 🚀 Live Demo

**Production URL**: [http://ghehr-production-v2.eba-nymf88yi.us-east-1.elasticbeanstalk.com](http://ghehr-production-v2.eba-nymf88yi.us-east-1.elasticbeanstalk.com)

### Test Credentials
- **Email**: `admin@ghehr.gh`
- **Password**: `password`

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ghehr-system.git
   cd ghehr-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏥 AI-Powered Clinical Features

### Ghana Medical NLP
The system includes specialized AI for detecting common diseases in Ghana:

- **Malaria** - Fever, chills, headache detection
- **Typhoid** - Prolonged fever, abdominal pain
- **Tuberculosis** - Chronic cough, weight loss
- **Hypertension** - Blood pressure monitoring
- **Diabetes** - Blood sugar level tracking
- **Pneumonia** - Respiratory symptoms
- **Asthma** - Breathing difficulties
- **Malnutrition** - Growth and nutrition assessment

### Real-time Analysis
- Automatic symptom extraction from clinical notes
- Confidence scoring (0-1 scale) for condition suggestions
- Treatment recommendations based on detected conditions
- Debounced real-time analysis to prevent excessive API calls

## 📱 User Interface

### Design Principles
- **Low-Literacy Friendly** - Icon-based navigation with minimal text
- **Cultural Sensitivity** - Ghana-appropriate colors and symbols
- **Mobile-First** - Responsive design for tablets and phones
- **Offline-Ready** - Progressive Web App capabilities

### Key Screens
- **Dashboard** - Overview of patients, appointments, and revenue
- **Patient Management** - Registration and medical history
- **Clinical Notes** - AI-powered medical documentation
- **Appointments** - Calendar view and scheduling
- **Billing** - Invoice creation and PDF generation
- **Reports** - Analytics and summaries

## 🔐 Security & Compliance

- **Authentication** - JWT-based with secure token handling
- **Authorization** - Role-based access control (Admin, Doctor, Nurse)
- **Data Protection** - HIPAA-like compliance considerations
- **Audit Logging** - Comprehensive activity tracking
- **Security Headers** - Proper CORS, CSP, and security configurations

## 🚢 Deployment

### AWS Elastic Beanstalk (Recommended)

1. **Build the application**
   ```bash
   bash scripts/deploy.sh
   ```

2. **Deploy to AWS**
   ```bash
   # Configure AWS CLI first
   aws configure

   # Deploy using the deployment script
   # (See AWS-DEPLOYMENT.md for detailed instructions)
   ```

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 🧪 Testing

### Manual Testing
- **Login**: Use test credentials above
- **Patient Management**: Create and search patients
- **Clinical Notes**: Test AI analysis with medical text
- **Billing**: Create invoices and download PDFs
- **Reports**: View dashboard statistics

### API Testing
Use the included test pages:
- `test-pdf-download-debug.html` - PDF download testing
- Test API endpoints with curl or Postman

## 📊 API Documentation

### Authentication
```
POST /api/auth/login
Body: { "email": "admin@ghehr.gh", "password": "password" }
```

### Patients
```
GET /api/patients - List all patients
POST /api/patients - Create new patient
GET /api/patients/:id - Get patient details
```

### Clinical Notes
```
POST /api/notes - Create clinical note with AI analysis
GET /api/notes - Get notes by patient
POST /api/notes/analyze - Real-time medical text analysis
```

### Billing
```
GET /api/billing - List invoices
POST /api/billing - Create new invoice
GET /api/billing/:id/pdf - Download invoice PDF
```

### Reports
```
GET /api/reports/dashboard - Dashboard statistics
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Implement proper error handling
- Write comprehensive tests
- Use meaningful commit messages
- Update documentation for new features

## 📋 Project Status

### Completed ✅
- [x] Patient Management System
- [x] AI-Powered Clinical Notes
- [x] Appointment Scheduling
- [x] Billing & Invoice Generation
- [x] PDF Export Functionality
- [x] Dashboard & Reports
- [x] JWT Authentication
- [x] AWS Deployment
- [x] Security Headers & CORS

### In Progress 🚧
- [ ] WhatsApp Integration
- [ ] Offline Mode with PWA
- [ ] Voice Notes & Speech Recognition
- [ ] Mobile Money Integration
- [ ] Multi-language Support (Twi, Ga)

### Planned 📋
- [ ] PostgreSQL Database Integration
- [ ] Advanced Analytics
- [ ] Telemedicine Features
- [ ] Laboratory Integration
- [ ] Inventory Management
- [ ] Staff Management

## 🔧 Technical Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API calls
- React Hook Form for forms

### Backend
- Node.js with Express
- TypeScript for type safety
- JWT for authentication
- PDFKit for PDF generation
- Express-validator for validation

### Development Tools
- ESLint & Prettier for code quality
- Git for version control
- AWS CLI for deployment
- VS Code with extensions

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/ghehr-system/issues)
- **Email**: support@ghehr.gh
- **Documentation**: Check the `docs/` folder for detailed guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ghana Health Service for requirements and insights
- Healthcare professionals who provided feedback
- Open source community for tools and libraries
- AWS for cloud infrastructure support

---

**Built with ❤️ for Healthcare in Ghana**

*GhEHR - Empowering Healthcare Through Technology*
