# GhEHR - Ghana Electronic Health Records System

<div align="center">
  <h3>🏥 A comprehensive Electronic Health Records system designed for healthcare facilities in Ghana</h3>
  
  [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
  [![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-v19+-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue.svg)](https://www.typescriptlang.org/)
</div>

## 📋 Overview

GhEHR is a modern, secure, and user-friendly Electronic Health Records system specifically designed for healthcare facilities in Ghana. The system addresses the unique challenges of healthcare delivery in Ghana, including low-literacy users, offline capabilities, and local payment methods.

## ✨ Features

### 🏥 **Core Healthcare Management**
- **Patient Management**: Digital registration with demographics and medical history
- **Clinical Records**: Doctor's notes, diagnoses, and prescription management
- **Appointment Scheduling**: Calendar-based scheduling with SMS reminders
- **Billing & Payments**: Invoice generation with Mobile Money integration
- **Reporting**: Daily patient counts, revenue summaries, and analytics

### 🌍 **Ghana-Specific Features**
- **Low-Literacy UI**: Icon-based interface with minimal text
- **Language Support**: Swahili/Twi language options (planned)
- **Offline Mode**: Sync-able local storage for poor internet areas
- **Mobile Money**: Integration with local payment systems
- **Compliance**: HIPAA-like data protection standards

### 🔒 **Security & Compliance**
- JWT-based authentication
- Role-based access control (RBAC)
- Audit logging for all data access
- Encrypted data transmission
- Secure file uploads

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React.js      │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   TypeScript    │    │   Express.js    │    │   (planned)     │
│   Material-UI   │    │   TypeScript    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ghehr.git
   cd ghehr
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install --legacy-peer-deps
   ```

3. **Environment setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd frontend
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 📚 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "admin@ghehr.gh",
  "password": "password"
}

# Register
POST /api/auth/register
{
  "email": "user@ghehr.gh",
  "password": "password",
  "name": "User Name",
  "role": "doctor"
}
```

### Default Users
- **Admin**: admin@ghehr.gh / password
- **Doctor**: doctor@ghehr.gh / password

### Core Endpoints
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/appointments` - List appointments  
- `POST /api/appointments` - Create appointment
- `GET /api/billing` - List invoices
- `GET /api/reports/dashboard` - Dashboard statistics

## 🛠️ Development

### Project Structure
```
ghehr/
├── frontend/          # React.js application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts
│   └── package.json
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── README.md
```

### Available Scripts

**Backend**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run clean    # Clean build files
```

**Frontend**
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## 🚀 Deployment

### AWS Deployment (Recommended)

1. **Backend Deployment**
   ```bash
   # Build the application
   cd backend
   npm run build
   
   # Deploy to AWS EC2/ECS
   # Configure environment variables
   # Set up PostgreSQL RDS instance
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   cd frontend
   npm run build
   
   # Deploy to AWS S3 + CloudFront
   # Configure environment variables
   ```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-domain.com
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=ghehr_production
DB_USER=ghehr_user
DB_PASSWORD=your-secure-password
```

## 📋 Roadmap

### Phase 1: MVP (Months 1-4) ✅
- [x] Patient Management
- [x] Clinical Records
- [x] Appointment Scheduling
- [x] Billing & Payments
- [x] Basic Reporting

### Phase 2: Enhanced Features (Months 5-8)
- [ ] Database Integration (PostgreSQL)
- [ ] Advanced Reporting & Analytics
- [ ] Mobile App (Flutter)
- [ ] SMS Integration
- [ ] Multi-language Support

### Phase 3: Scale & Integration (Months 9-12)
- [ ] Multi-facility Support
- [ ] Lab Integration APIs
- [ ] Mobile Money Payment Gateway
- [ ] Data Export (PDF/Excel)
- [ ] Advanced Security Features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@ghehr.gh
- 📖 Documentation: [docs.ghehr.gh](https://docs.ghehr.gh)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/ghehr/issues)

## 🙏 Acknowledgments

- Healthcare professionals in Ghana for their input and feedback
- Open source community for the excellent tools and libraries
- Ghana Health Service for guidance on healthcare standards

---

<div align="center">
  <p>Built with ❤️ for healthcare in Ghana</p>
  <p>© 2025 GhEHR Team. All rights reserved.</p>
</div>
