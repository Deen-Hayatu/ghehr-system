// Option 1: Direct Integration in Dashboard Component
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar } from '@mui/material';

const Dashboard = () => {
  // Using the direct image URL from Imgur
  const logoUrl = 'https://imgur.com/a/QCjzN0f'; // Replace with actual image ID from your Imgur link
  
  return (
    <Box>
      {/* Header with Logo */}
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(to right, #dc143c, #ff8c00, #ffd700, #32cd32)' 
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {/* Logo from Imgur */}
            <Box
              component="img"
              src={logoUrl}
              alt="GhEHR Logo"
              sx={{
                height: '50px',
                width: 'auto',
                marginRight: '20px',
                backgroundColor: 'white',
                padding: '5px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
              Dashboard
            </Typography>
          </Box>
          
          {/* User info section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Akwaaba, Dr. Sarah Wilson!</Typography>
            <Avatar sx={{ bgcolor: 'white', color: '#dc143c' }}>SW</Avatar>
            <Typography variant="body2">
              Monday, 21 July 2025
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Rest of your dashboard content */}
    </Box>
  );
};

// Option 2: Create a Reusable Logo Component
import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface LogoProps extends BoxProps {
  height?: string | number;
  variant?: 'default' | 'header' | 'login';
}

export const GhEHRLogo: React.FC<LogoProps> = ({ 
  height = '50px', 
  variant = 'default',
  sx,
  ...props 
}) => {
  // Imgur direct image URL
  const logoUrl = 'https://i.imgur.com/YOUR_IMAGE_ID.png';
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'header':
        return {
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        };
      case 'login':
        return {
          height: '80px',
          marginBottom: '20px'
        };
      default:
        return {};
    }
  };
  
  return (
    <Box
      component="img"
      src={logoUrl}
      alt="GhEHR - Ghana Electronic Health Records"
      sx={{
        height,
        width: 'auto',
        objectFit: 'contain',
        ...getVariantStyles(),
        ...sx
      }}
      {...props}
    />
  );
};

// Option 3: Header Component with Imgur Logo
import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Settings, Notifications } from '@mui/icons-material';

const Header: React.FC = () => {
  const logoUrl = 'https://i.imgur.com/YOUR_IMAGE_ID.png';
  
  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(to right, #dc143c, #ff8c00, #ffd700, #32cd32)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section - Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={logoUrl}
            alt="GhEHR" 
            style={{ 
              height: '45px',
              marginRight: '15px',
              backgroundColor: 'white',
              padding: '5px',
              borderRadius: '8px'
            }} 
          />
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            GhEHR Dashboard
          </Typography>
        </Box>
        
        {/* Right Section - User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <Settings />
          </IconButton>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2">Dr. Sarah Wilson</Typography>
            <Typography variant="caption">Admin</Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Option 4: Complete Dashboard Implementation
import React from 'react';
import { 
  Box, Container, Grid, Card, CardContent, 
  Typography, Button, Paper 
} from '@mui/material';
import { 
  People, Description, CalendarMonth, 
  Payment, Assessment, LocalHospital 
} from '@mui/icons-material';

const DashboardWithLogo = () => {
  const logoUrl = 'https://i.imgur.com/YOUR_IMAGE_ID.png';
  
  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(to right, #dc143c, #ff8c00, #ffd700, #32cd32)' 
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              bgcolor: 'white', 
              p: 1, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              mr: 2
            }}>
              <img src={logoUrl} alt="GhEHR" style={{ height: '40px' }} />
            </Box>
            <Typography variant="h6">Dashboard</Typography>
          </Box>
          <Typography>Monday, 21 July 2025</Typography>
        </Toolbar>
      </AppBar>
      
      {/* Welcome Section */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5">
            Welcome back to your healthcare management dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#ffc107', mt: 1 }}>
            New Admin
          </Typography>
        </Paper>
        
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '4px solid #e91e63' }}>
              <CardContent>
                <Typography variant="h3">2</Typography>
                <Typography color="textSecondary">Total Patients</Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Add other stat cards... */}
        </Grid>
        
        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚀 Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button startIcon={<People />} fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Manage Patients
                  </Button>
                  <Button startIcon={<Description />} fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Clinical Notes
                  </Button>
                  {/* Add other buttons... */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Tips for using Imgur links:
// 1. Get the direct image link by right-clicking the image on Imgur
// 2. The URL should end with .png, .jpg, or another image extension
// 3. Format: https://i.imgur.com/IMAGE_ID.png
// 4. You can add error handling:

const LogoWithErrorHandling = () => {
  const [imageError, setImageError] = React.useState(false);
  const logoUrl = 'https://i.imgur.com/YOUR_IMAGE_ID.png';
  const fallbackLogo = '/fallback-logo.png'; // Local fallback
  
  return (
    <img 
      src={imageError ? fallbackLogo : logoUrl}
      alt="GhEHR Logo"
      onError={() => setImageError(true)}
      style={{ 
        height: '50px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '8px'
      }}
    />
  );
};

// Environment-based configuration
const getLogoUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://i.imgur.com/YOUR_IMAGE_ID.png';
  }
  // Use local image in development if needed
  return '/logo.png';
};