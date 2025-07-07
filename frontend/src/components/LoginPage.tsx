import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Avatar,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LocalHospital,
  HealthAndSafety,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AdinkraSymbols } from '../theme/ghanaTheme';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { login, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('LoginPage input change event:', {
      name: e.target.name,
      value: e.target.value,
      type: e.target.type,
      target: e.target
    });
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log('LoginPage form data updated:', newData);
      return newData;
    });
    // Clear error when user starts typing
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Login form submitted', formData);
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      console.log('🔑 Calling login function...', { email: formData.email });
      await login(formData.email, formData.password);
      console.log('🎉 Login successful from LoginPage');
      // Login successful - AuthContext will handle the redirect
    } catch (error: any) {
      console.error('❌ Login failed in LoginPage:', error);
      setFormError(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.1)} 50%, 
          ${alpha(theme.palette.success.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ghana Flag Pattern Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '33.33%',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          opacity: 0.05,
          pointerEvents: 'none', // Prevent interference with form inputs
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '33.33%',
          left: 0,
          right: 0,
          height: '33.33%',
          background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          opacity: 0.05,
          pointerEvents: 'none', // Prevent interference with form inputs
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '33.33%',
          background: `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
          opacity: 0.05,
          pointerEvents: 'none', // Prevent interference with form inputs
        }}
      />

      {/* Adinkra Symbols Decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          left: 40,
          color: alpha(theme.palette.primary.main, 0.1),
          transform: 'rotate(-15deg)',
          pointerEvents: 'none', // Prevent interference with form inputs
        }}
      >
        <AdinkraSymbols.GyeNyame />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 60,
          right: 60,
          color: alpha(theme.palette.secondary.main, 0.1),
          transform: 'rotate(20deg)',
          pointerEvents: 'none', // Prevent interference with form inputs
        }}
      >
        <AdinkraSymbols.Sankofa />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 80,
          left: 80,
          color: alpha(theme.palette.success.main, 0.1),
          transform: 'rotate(10deg)',
          pointerEvents: 'none', // Prevent interference with form inputs
        }}
      >
        <AdinkraSymbols.Dwennimmen />
      </Box>

      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          position: 'relative', // Ensure form is above background elements
          zIndex: 1, // Bring form to front
          gap: 4,
          maxWidth: 'lg',
          mx: 'auto',
        }}
      >
        {/* Left Side - Branding */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Box
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              mb: { xs: 4, md: 0 },
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  mr: 2,
                }}
              >
                <LocalHospital sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    textShadow: `2px 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                    // Remove gradient text that was causing transparency issues
                    // background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                    // backgroundClip: 'text',
                    // WebkitBackgroundClip: 'text',
                    // WebkitTextFillColor: 'transparent',
                  }}
                >
                  GhEHR
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 500
                }}>
                  Ghana Electronic Health Records
                </Typography>
              </Box>
            </Box>

            {/* Mission Statement */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HealthAndSafety sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h5" color="primary" fontWeight={600}>
                  Akwaaba! 🇬🇭
                </Typography>
              </Box>
              <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
                Welcome to Ghana's premier Electronic Health Records system. 
                Empowering healthcare professionals with modern technology 
                while honoring our rich cultural heritage.
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ color: theme.palette.primary.main }}>
                  <AdinkraSymbols.GyeNyame />
                </Box>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  "Gye Nyame" - Excellence in Healthcare, by God's Grace
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Right Side - Login Form */}
        <Box sx={{ flex: 1, width: '100%', maxWidth: 450, mx: 'auto' }}>
          <Card
            elevation={0}
            sx={{
              maxWidth: 450,
              mx: 'auto',
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              position: 'relative', // Ensure card is positioned
              zIndex: 2, // Bring card above background elements
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Form Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access your healthcare management dashboard
                </Typography>
              </Box>

              {/* Error Messages */}
              {(error || formError) && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {formError || error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.success.dark} 100%)`,
                    },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Test Credentials
                  </Typography>
                </Divider>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: alpha(theme.palette.secondary.main, 0.1),
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> admin@ghehr.gh<br />
                    <strong>Password:</strong> password
                  </Typography>
                </Paper>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
