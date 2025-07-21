import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  CalendarToday,
  Receipt,
  TrendingUp,
  LocalHospital,
  Notes,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AdinkraSymbols } from '../theme/ghanaTheme';
import { CommonHeader } from './CommonHeader';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Dashboard statistics interface
interface DashboardStats {
  totalPatients: number;
  todaysPatients: number;
  malePatients: number;
  femalePatients: number;
  nhisPatients: number;
  pediatricPatients: number;
  adultPatients: number;
  elderlyPatients: number;
  patientsWithChronicConditions: number;
  nhisPercentage: number;
  todaysGrowth: string;
  nhisGrowth: string;
  totalGrowth: string;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // Dashboard data state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/patients/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setDashboardStats(response.data.data);
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.response?.data?.error?.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Dynamic dashboard data based on fetched statistics
  const getDashboardCards = () => {
    if (!dashboardStats) return [];
    
    return [
      {
        title: 'Total Patients',
        value: dashboardStats.totalPatients.toString(),
        change: dashboardStats.totalGrowth,
        icon: People,
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1),
      },
      {
        title: 'Today\'s Registrations',
        value: dashboardStats.todaysPatients.toString(),
        change: dashboardStats.todaysGrowth,
        icon: PersonAdd,
        color: theme.palette.secondary.main,
        bgColor: alpha(theme.palette.secondary.main, 0.1),
      },
      {
        title: 'NHIS Patients',
        value: dashboardStats.nhisPatients.toString(),
        change: dashboardStats.nhisGrowth,
        icon: LocalHospital,
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
      },
      {
        title: 'Chronic Conditions',
        value: dashboardStats.patientsWithChronicConditions.toString(),
        change: '+2%', // Mock data for now
        icon: Receipt,
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
      },
    ];
  };

  const recentActivities = [
    { 
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
      activity: `Total patients in system: ${dashboardStats?.totalPatients || 0}`, 
      type: 'patient' 
    },
    { 
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
      activity: `NHIS enrolled patients: ${dashboardStats?.nhisPatients || 0}`, 
      type: 'nhis' 
    },
    { 
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
      activity: `Today's new registrations: ${dashboardStats?.todaysPatients || 0}`, 
      type: 'registration' 
    },
    { 
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
      activity: `Patients with chronic conditions: ${dashboardStats?.patientsWithChronicConditions || 0}`, 
      type: 'health' 
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <CommonHeader 
        title="GhEHR Dashboard"
        subtitle="Healthcare Management System"
      />

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ color: theme.palette.primary.main, mr: 2 }}>
                  <AdinkraSymbols.Sankofa />
                </Box>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  Akwaaba, {user?.name || 'Healthcare Professional'}!
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Welcome back to your healthcare management dashboard
              </Typography>
              <Chip
                label={`Role: ${(user?.role?.charAt(0).toUpperCase() || '') + (user?.role?.slice(1) || '') || 'Administrator'}`}
                color="secondary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '300px' } }}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Today's Date
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {new Date().toLocaleDateString('en-GH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ mb: 4 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {getDashboardCards().map((stat, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      background: stat.bgColor,
                      border: `2px solid ${alpha(stat.color, 0.3)}`,
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(stat.color, 0.3)}`,
                      },
                    }}
                  >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <stat.icon sx={{ fontSize: 40, color: stat.color }} />
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={stat.color} gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(stat.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: stat.color,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Box>
            ))}
          </Box>
          )}
        </Box>

        {/* Quick Actions and Recent Activity */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Quick Actions */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Quick Actions
                </Typography>
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 2, 
                    mt: 1 
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    onClick={() => navigate('/patients')}
                    sx={{ 
                      py: 2, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    Manage Patients
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    onClick={() => navigate('/appointments')}
                    sx={{ 
                      py: 2, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        borderColor: theme.palette.secondary.main,
                      }
                    }}
                  >
                    Schedule Appointment
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Notes />}
                    onClick={() => navigate('/clinical-notes')}
                    sx={{ 
                      py: 2, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        borderColor: theme.palette.info.main,
                      }
                    }}
                  >
                    Clinical Notes
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={() => navigate('/billing')}
                    sx={{ 
                      py: 2, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        borderColor: theme.palette.success.main,
                      }
                    }}
                  >
                    Billing & Payments
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/reports')}
                    sx={{ 
                      py: 2, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        borderColor: theme.palette.warning.main,
                      }
                    }}
                  >
                    View Reports
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocalHospital />}
                    onClick={() => navigate('/moh')}
                    sx={{ 
                      py: 2, 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        borderColor: theme.palette.info.main,
                      }
                    }}
                  >
                    MOH Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Activity */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  Recent Activity
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {recentActivities.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < recentActivities.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, mr: 2 }}>
                        {activity.time}
                      </Typography>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {activity.activity}
                      </Typography>
                      <Chip
                        label={activity.type}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
