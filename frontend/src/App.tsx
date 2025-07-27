import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import Ghana theme and auth context
import { ghanaTheme } from './theme/ghanaTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import LoginPageSimple from './components/LoginPageSimple';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import AppointmentManagement from './components/AppointmentManagement';
import ClinicalNotes from './components/ClinicalNotes';
import BillingManagement from './components/BillingManagement';
import ReportsManagement from './components/ReportsManagement';
import MOHDashboard from './components/MOHDashboard';
import ManageManagement from './components/ManageManagement';
import EmailManagement from './components/EmailManagement';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes Component (inside AuthProvider)
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/login-simple" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPageSimple />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moh"
        element={
          <ProtectedRoute>
            <MOHDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage"
        element={
          <ProtectedRoute>
            <ManageManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinical-notes"
        element={
          <ProtectedRoute>
            <ClinicalNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emails"
        element={
          <ProtectedRoute>
            <EmailManagement />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={ghanaTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
