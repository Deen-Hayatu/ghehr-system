import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  AdminPanelSettings as AdminIcon,
  PersonSearch as PatientSearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CommonHeader } from './CommonHeader';
import AdminReportLayout, { AdminReportType, ReportParams } from './AdminReportLayout';
import PatientReportLayout, { PatientReportType, PatientReportParams, Patient } from './PatientReportLayout';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface ReportStats {
  patientsToday: number;
  appointmentsToday: number;
  totalPatients: number;
  pendingBills: number;
  todayRevenue: number;
  monthlyRevenue: number;
  appointments: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  patientsByAge: {
    '0-18': number;
    '19-35': number;
    '36-50': number;
    '51-65': number;
    '65+': number;
  };
  commonDiagnoses: Array<{
    diagnosis: string;
    count: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportsManagement: React.FC = () => {
  const theme = useTheme();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab management
  const [mainTabValue, setMainTabValue] = useState(0);
  const [adminTabValue, setAdminTabValue] = useState(0);
  const [patientTabValue, setPatientTabValue] = useState(0);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/reports/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStats(response.data.data.stats);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.response?.data?.error?.message || 'Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  // Admin report generation
  const handleAdminReportGenerate = async (params: ReportParams): Promise<Blob> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reports/admin/${params.reportType}`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error generating admin report:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  };

  // Patient search functionality
  const searchPatients = async (query: string): Promise<Patient[]> => {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await axios.get(`/api/patients/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation for dashboard stats
    console.log('Generating dashboard PDF report...');
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const adminReportTypes: AdminReportType[] = ['summary', 'details', 'visits', 'booked', 'lists'];
  const patientReportTypes: PatientReportType[] = ['comprehensive', 'clinical', 'medical-history', 'recent-visits'];

  // Check if user has admin access
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'doctor';

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <CommonHeader 
        title="Reports & Analytics"
        subtitle="Comprehensive healthcare reports and analytics"
      />
      
      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Main Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={mainTabValue}
            onChange={(_, newValue) => setMainTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<AssessmentIcon />}
              label="Dashboard Overview"
              iconPosition="start"
            />
            {hasAdminAccess && (
              <Tab
                icon={<AdminIcon />}
                label="Admin Reports"
                iconPosition="start"
              />
            )}
            <Tab
              icon={<PatientSearchIcon />}
              label="Patient Reports"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={mainTabValue} index={0}>
          {/* Dashboard Overview */}
          <Typography variant="h6" gutterBottom>
            Dashboard Statistics
          </Typography>
          
          {/* Stats Cards */}
          <Container maxWidth="xl" sx={{ py: 2 }}>
            {/* Quick Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Today's Patients
                      </Typography>
                      <Typography variant="h4">
                        {stats?.patientsToday || 0}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Appointments Today
                      </Typography>
                      <Typography variant="h4">
                        {stats?.appointmentsToday || 0}
                      </Typography>
                    </Box>
                    <CalendarIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Patients
                      </Typography>
                      <Typography variant="h4">
                        {stats?.totalPatients || 0}
                      </Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Monthly Revenue
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(stats?.monthlyRevenue || 0)}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={generatePDF}
              >
                Export Dashboard PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={printReport}
              >
                Print Dashboard
              </Button>
            </Box>

            {/* Additional Statistics Tables */}
            {stats && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
                {/* Appointment Status */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Appointment Status
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Scheduled</TableCell>
                            <TableCell align="right">
                              <Chip label={stats.appointments.scheduled} color="primary" size="small" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Completed</TableCell>
                            <TableCell align="right">
                              <Chip label={stats.appointments.completed} color="success" size="small" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cancelled</TableCell>
                            <TableCell align="right">
                              <Chip label={stats.appointments.cancelled} color="error" size="small" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>No Show</TableCell>
                            <TableCell align="right">
                              <Chip label={stats.appointments.noShow} color="warning" size="small" />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Common Diagnoses */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Common Diagnoses
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.commonDiagnoses.map((diagnosis, index) => (
                            <TableRow key={index}>
                              <TableCell>{diagnosis.diagnosis}</TableCell>
                              <TableCell align="right">{diagnosis.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Container>
        </TabPanel>

        {/* Admin Reports Tab Panel */}
        {hasAdminAccess && (
          <TabPanel value={mainTabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Administrative Reports
            </Typography>
            
            {/* Admin Report Sub-tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={adminTabValue}
                onChange={(_, newValue) => setAdminTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Appointment Summary" />
                <Tab label="Appointment Details" />
                <Tab label="Visit Summary" />
                <Tab label="Booked Appointments" />
                <Tab label="Patient Lists" />
              </Tabs>
            </Paper>

            {adminReportTypes.map((reportType, index) => (
              <TabPanel key={reportType} value={adminTabValue} index={index}>
                <AdminReportLayout
                  reportType={reportType}
                  onGenerate={handleAdminReportGenerate}
                />
              </TabPanel>
            ))}
          </TabPanel>
        )}

        {/* Patient Reports Tab Panel */}
        <TabPanel value={mainTabValue} index={hasAdminAccess ? 2 : 1}>
          <Typography variant="h6" gutterBottom>
            Patient Reports
          </Typography>
          
          {/* Patient Report Sub-tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={patientTabValue}
              onChange={(_, newValue) => setPatientTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Clinical Details" />
              <Tab label="Prescription" />
              <Tab label="Test Order" />
              <Tab label="Vaccine" />
            </Tabs>
          </Paper>

          {patientReportTypes.map((reportType, index) => (
            <TabPanel key={reportType} value={patientTabValue} index={index}>
              <PatientReportLayout />
            </TabPanel>
          ))}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ReportsManagement;
