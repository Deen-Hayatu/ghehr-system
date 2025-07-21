import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  InputAdornment,
  Alert,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CommonHeader } from './CommonHeader';
import { AdinkraSymbols } from '../theme/ghanaTheme';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Types for Appointment Management
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration?: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  facilityId: string;
  createdAt: string;
}

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const AppointmentManagement: React.FC = () => {
  const theme = useTheme();
  const { user, token, checkTokenValidity } = useAuth();

  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(''); // Show all appointments by default
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Form data for new appointment
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: user?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'consultation' as const,
    notes: '',
  });

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!token || !(await checkTokenValidity())) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        ...(selectedDate && { date: selectedDate }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedType && { type: selectedType }),
      });
      
      const response = await axios.get(`${API_BASE_URL}/api/appointments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setAppointments(response.data.data.appointments);
        console.log('✅ Appointments fetched successfully:', response.data.data.appointments);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.error?.message || 'Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients for appointment creation
  const fetchPatients = async () => {
    try {
      if (!token || !(await checkTokenValidity())) {
        console.warn('No valid token for fetching patients');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/patients?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setPatients(response.data.data.patients);
        console.log('✅ Patients fetched for appointments:', response.data.data.patients.length);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    }
  };

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    try {
      setError(null);
      
      if (!token || !(await checkTokenValidity())) {
        setError('Your session has expired. Please log in again.');
        return;
      }

      console.log('📤 Creating appointment:', formData);
      
      const response = await axios.post(`${API_BASE_URL}/api/appointments`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log('✅ Appointment created successfully:', response.data);
        
        // Show success message
        setSuccessMessage('Appointment scheduled successfully! 🎉');
        
        // Refresh appointments list
        await fetchAppointments();
        
        // Close dialog and reset form
        setAddDialogOpen(false);
        setFormData({
          patientId: '',
          doctorId: user?.id || '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          duration: 30,
          type: 'consultation',
          notes: '',
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      setError(error.response?.data?.error?.message || 'Error creating appointment');
    }
  };

  // Handle appointment status update
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setError(null);
      
      if (!token || !(await checkTokenValidity())) {
        setError('Your session has expired. Please log in again.');
        return;
      }
      
      const response = await axios.patch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccessMessage(`Appointment status updated to ${newStatus}! ✅`);
        await fetchAppointments();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      setError(error.response?.data?.error?.message || 'Error updating appointment');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
      default: return 'default';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'primary';
      case 'follow-up': return 'secondary';
      case 'emergency': return 'error';
      case 'surgery': return 'warning';
      default: return 'default';
    }
  };

  // Handle view appointment
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  // Get patient name
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId || p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : patientId;
  };

  useEffect(() => {
    console.log('AppointmentManagement useEffect triggered');
    console.log('Current token:', token ? 'Present' : 'Missing');
    
    // Clear success messages when filters change
    setSuccessMessage(null);
    
    if (token) {
      fetchAppointments();
      fetchPatients();
    } else {
      console.warn('No token available, skipping fetch operations');
      setError('Authentication required. Please log in again.');
    }
  }, [selectedDate, selectedStatus, selectedType, token]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <CommonHeader 
        title="Appointment Management"
        subtitle="Schedule and manage patient appointments"
      />
      
      {/* Main Content */}
      <Box sx={{ p: 3 }}>
      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => {
                // Always extract YYYY-MM-DD from the value
                const value = e.target.value;
                const formatted = value.includes('T') ? value.split('T')[0] : value;
                setSelectedDate(formatted);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="no-show">No Show</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="follow-up">Follow-up</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="surgery">Surgery</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAppointments}
              size="small"
            >
              Refresh
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              New Appointment
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Appointments Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>Loading appointments...</Typography>
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No appointments found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(appointment.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.time}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getPatientName(appointment.patientId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.type}
                          color={getTypeColor(appointment.type) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.duration || 30} min
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {appointment.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAppointment(appointment)}
                              color="primary"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {appointment.status === 'scheduled' && (
                            <Tooltip title="Mark as Completed">
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                color="success"
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                color="error"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Appointment Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Schedule New Appointment
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControl fullWidth>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    label="Patient"
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.patientId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <TextField
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
              
              <Box>
                <TextField
                  type="time"
                  label="Time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
              
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    label="Type"
                  >
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="follow-up">Follow-up</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="surgery">Surgery</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <TextField
                  type="number"
                  label="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  fullWidth
                />
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAppointment}
            disabled={!formData.patientId || !formData.date || !formData.time}
          >
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Appointment Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Appointment Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Patient:</strong> {getPatientName(selectedAppointment.patientId)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Time:</strong> {selectedAppointment.time}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Duration:</strong> {selectedAppointment.duration || 30} minutes
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {selectedAppointment.type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedAppointment.status}
              </Typography>
              {selectedAppointment.notes && (
                <Typography variant="body1" gutterBottom>
                  <strong>Notes:</strong> {selectedAppointment.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default AppointmentManagement;
