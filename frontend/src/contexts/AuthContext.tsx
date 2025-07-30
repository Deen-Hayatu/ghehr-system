import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  facilityId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  checkTokenValidity: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('ghehr_token');
    const savedUser = localStorage.getItem('ghehr_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ghehr_token');
        localStorage.removeItem('ghehr_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('🔐 Starting login process...', { email, apiUrl: API_BASE_URL });
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Making login request to:', `${API_BASE_URL}/api/auth/login`);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log('✅ Login response received:', response.data);

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        console.log('🎉 Login successful, saving user data...', newUser);
        
        // Save to state
        setToken(newToken);
        setUser(newUser);
        
        // Save to localStorage
        localStorage.setItem('ghehr_token', newToken);
        localStorage.setItem('ghehr_user', JSON.stringify(newUser));
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed';
      console.error('❌ Error message:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    // Clear state
    setUser(null);
    setToken(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('ghehr_token');
    localStorage.removeItem('ghehr_user');
    
    // Clear axios default authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkTokenValidity = (): boolean => {
    if (!token) return false;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        console.warn('🔐 Token expired, logging out...');
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔐 Invalid token format, logging out...', error);
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    error,
    checkTokenValidity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
