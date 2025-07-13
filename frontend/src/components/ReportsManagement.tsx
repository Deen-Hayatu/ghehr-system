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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
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

const ReportsManagement: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation
    console.log('Generating PDF report...');
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive reports and analytics for healthcare management
        </Typography>
      </Box>

      {/* Report Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2,
            alignItems: 'center'
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Period"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          {selectedPeriod === 'custom' && (
            <>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={generatePDF}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={printReport}
            >
              Print
            </Button>
          </Box>
        </Box>
      </Paper>

      {stats && (
        <>
          {/* Key Metrics */}
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4
            }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Patients Today
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {stats.patientsToday}
                    </Typography>
                  </Box>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Appointments Today
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {stats.appointmentsToday}
                    </Typography>
                  </Box>
                  <CalendarIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Today's Revenue
                    </Typography>
                    <Typography variant="h4" component="h2" color="success.main">
                      {formatCurrency(stats.todayRevenue)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Monthly Revenue
                    </Typography>
                    <Typography variant="h4" component="h2" color="primary.main">
                      {formatCurrency(stats.monthlyRevenue)}
                    </Typography>
                  </Box>
                  <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Appointment Statistics */}
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              mb: 4
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appointment Status
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography>Scheduled</Typography>
                    <Chip label={stats.appointments.scheduled} color="primary" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography>Completed</Typography>
                    <Chip label={stats.appointments.completed} color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography>Cancelled</Typography>
                    <Chip label={stats.appointments.cancelled} color="error" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>No Show</Typography>
                    <Chip label={stats.appointments.noShow} color="warning" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Patient Age Distribution
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(stats.patientsByAge).map(([ageGroup, count]) => (
                    <Box key={ageGroup} display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography>{ageGroup} years</Typography>
                      <Chip label={count} color="primary" variant="outlined" size="small" />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Common Diagnoses */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Common Diagnoses
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.commonDiagnoses.map((diagnosis, index) => {
                      const totalDiagnoses = stats.commonDiagnoses.reduce((sum, d) => sum + d.count, 0);
                      const percentage = ((diagnosis.count / totalDiagnoses) * 100).toFixed(1);
                      return (
                        <TableRow key={index}>
                          <TableCell>{diagnosis.diagnosis}</TableCell>
                          <TableCell align="right">{diagnosis.count}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ReportsManagement;
