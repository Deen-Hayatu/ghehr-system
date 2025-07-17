# GhEHR Local Development Guide

This guide will help you set up and run the GhEHR system locally for development and testing.

## Project Structure

- **Backend**: Node.js/Express API with TypeScript
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL (simulated with local data for development)

## Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- VS Code with recommended extensions

## Getting Started

### 1. Clone the Repository

If you haven't already, clone the repository:

```bash
git clone https://github.com/your-organization/ghehr.git
cd ghehr
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following content:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_for_development
```

Start the backend development server:

```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm start
```

The frontend will run on http://localhost:3000

## Using VS Code Tasks

For convenience, we have set up VS Code tasks to streamline development:

1. Press `Ctrl+Shift+P` to open the Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose one of the following tasks:
   - "Restart GhEHR Backend": Restarts the backend development server
   - "Start GhEHR Frontend": Starts the frontend development server

## Development Workflow

1. **Feature Branches**:
   - Create a feature branch for your work
   - Example: `git checkout -b feature/patient-search`

2. **Backend Development**:
   - Make changes to TypeScript files in `backend/src/`
   - The server will automatically restart when files change
   - Test API endpoints with Postman or curl before using in frontend

3. **Frontend Development**:
   - Make changes to TypeScript/React files in `frontend/src/`
   - React will automatically reload when files change
   - Use React DevTools for debugging

4. **Testing**:
   - Follow the [Local Testing Protocol](./LOCAL_TESTING_PROTOCOL.md) for comprehensive testing
   - Test features across different browsers and screen sizes
   - Pay special attention to Ghana-specific features like the Medical NLP System

5. **Code Quality**:
   - Run linters before committing
   - Ensure proper TypeScript typing
   - Follow the project's code style guidelines

## Core Features to Test

### 1. Patient Management

Test patient registration, search, and management functionality:

- Creating new patients with various demographic data
- Searching for patients by name, ID, or other attributes
- Viewing and editing patient details
- Handling NHIS insurance information correctly

### 2. Clinical Notes

Test the AI-powered clinical notes system:

- Creating new notes for patients
- Testing real-time medical text analysis
- Verifying condition detection and confidence scoring
- Testing treatment recommendations
- Ensuring proper data persistence

### 3. Appointment Scheduling

Test the appointment booking and management system:

- Creating new appointments
- Viewing the appointment calendar
- Filtering appointments by various criteria
- Updating and canceling appointments

### 4. Billing & Payments

Test the billing system:

- Creating invoices
- Adding line items
- Calculating totals
- Generating receipts

## Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check for port conflicts
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Frontend API connection issues**:
   - Verify backend is running
   - Check that CORS is properly configured
   - Confirm environment variables are set correctly

3. **Authentication problems**:
   - Check JWT token generation and validation
   - Verify login credentials
   - Check for token expiration issues

## Deployment Preparation

When you're ready to deploy:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Copy the build to the backend public directory

3. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

4. Follow the deployment protocol documented in DEPLOYMENT_PROTOCOL.md

Remember: Always verify functionality locally before deploying to production.
