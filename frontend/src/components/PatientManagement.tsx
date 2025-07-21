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
  Pagination,
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
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LocalHospital as HospitalIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  // ...existing code...
  Description as DescriptionIcon, // Add this import
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AdinkraSymbols } from '../theme/ghanaTheme';
import { CommonHeader } from './CommonHeader';
import PatientRegistration from './PatientRegistration';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Types for Patient Management
interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: {
    region: string;
    district: string;
    town: string;
    area?: string;
  };
  bloodGroup?: string;
  insurance: {
    hasNHIS: boolean;
    nhisStatus?: 'active' | 'expired' | 'pending';
  };
  status: 'active' | 'inactive' | 'deceased';
  createdAt: string;
}

interface PatientsResponse {
  patients: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPatients: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta',
  'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo', 'Western North',
  'Savannah', 'North East', 'Bono', 'Bono East', 'Oti'
];

const PatientManagement: React.FC = () => {
  const theme = useTheme();
  const { user, token, checkTokenValidity } = useAuth();
  const navigate = useNavigate(); // Add this line
  
  // State management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalPatients: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!token || !checkTokenValidity()) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRegion && { region: selectedRegion }),
        ...(selectedGender && { gender: selectedGender }),
      });
      
      console.log('Fetching patients with URL:', `${API_BASE_URL}/api/patients?${params.toString()}`);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Axios default auth header:', axios.defaults.headers.common['Authorization']);
      
      const response = await axios.get(`${API_BASE_URL}/api/patients?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Patients API response:', response.data);
      
      if (response.data.success) {
        const data: PatientsResponse = response.data.data;
        console.log('📊 Setting patients data:', data.patients);
        setPatients(data.patients);
        setPagination(data.pagination);
        console.log('✅ Patients state updated successfully');
      } else {
        console.error('❌ API returned unsuccessful response:', response.data);
        setError('Failed to fetch patients');
      }
    } catch (error: any) {
      console.error('❌ Error fetching patients:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
        setError(error.response.data?.error?.message || 'Server error while fetching patients');
      } else if (error.request) {
        console.error('Request error:', error.request);
        setError('Network error - cannot reach server');
      } else {
        console.error('Setup error:', error.message);
        setError('Error setting up request');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load patients on component mount and when filters change
  useEffect(() => {
    console.log('PatientManagement useEffect triggered');
    console.log('Current user:', user);
    console.log('Current token:', token);
    
    // Clear success messages when filters change
    setSuccessMessage(null);
    
    if (token) {
      fetchPatients();
    } else {
      console.warn('No token available, skipping fetchPatients');
      setError('Authentication required. Please log in again.');
    }
  }, [currentPage, searchTerm, selectedRegion, selectedGender, token]);

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter changes
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setCurrentPage(1);
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Handle creating an invoice for a patient
  const handleCreateInvoice = (patient: Patient) => {
    console.log('Initiating invoice creation for patient:', patient);
    if (!patient || !patient.id) {
        console.error('Invalid patient data provided for invoice creation.');
        setError('Could not create invoice: Invalid patient data.');
        return;
    }
    const patientName = `${patient.firstName} ${patient.lastName}`.trim();
    console.log(`Navigating to /billing with patientId: ${patient.id} and patientName: ${patientName}`);
    navigate('/billing', { 
        state: { 
            patientId: patient.id, 
            patientName: patientName
        } 
    });
  };

  // Handle patient actions
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditDialogOpen(true);
  };

  const handleAddPatient = async (patientData: any) => {
    try {
      console.log('📤 Submitting patient data:', patientData);
      
      // Check token validity before proceeding
      if (!token || !(await checkTokenValidity())) {
        setError('Your session has expired. Please log in again.');
        return;
      }
      
      // Transform the flat form data to match backend Patient model
      const transformedData = {
        // Personal Information
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        middleName: patientData.middleName || undefined,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        nationality: patientData.nationality || 'Ghana',
        
        // Ghana-specific Identifiers
        ghanaCardNumber: patientData.ghanaCardNumber || undefined,
        nhisNumber: patientData.nhisNumber || undefined,
        votersId: patientData.votersId || undefined,
        
        // Contact Information
        phoneNumber: patientData.phoneNumber,
        alternativePhone: patientData.alternativePhone || undefined,
        email: patientData.email || undefined,
        
        // Address (nested object)
        address: {
          region: patientData.region,
          district: patientData.district,
          town: patientData.town,
          area: patientData.area || undefined,
          houseNumber: patientData.houseNumber || undefined,
          landmark: patientData.landmark || undefined,
          digitalAddress: patientData.digitalAddress || undefined,
        },
        
        // Emergency Contact (nested object)
        emergencyContact: {
          name: patientData.emergencyContactName,
          relationship: patientData.emergencyContactRelationship,
          phoneNumber: patientData.emergencyContactPhone,
        },
        
        // Medical Information
        bloodGroup: patientData.bloodGroup || undefined,
        allergies: patientData.allergies ? [patientData.allergies] : [],
        chronicConditions: patientData.chronicConditions ? [patientData.chronicConditions] : [],
        currentMedications: patientData.currentMedications ? [patientData.currentMedications] : [],
        preferredLanguage: patientData.preferredLanguage || 'English',
        
        // Insurance Information
        insurance: {
          hasNHIS: !!patientData.nhisNumber,
          nhisStatus: patientData.nhisNumber ? 'active' : undefined,
        },
      };
      
      console.log('📦 Transformed data for backend:', transformedData);
      
      const response = await axios.post(`${API_BASE_URL}/api/patients`, transformedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Patient creation response:', response.data);

      if (response.data.success) {
        console.log('🎉 Patient created successfully, refreshing list...');
        
        // Reset filters and pagination to show the new patient
        setSearchTerm('');
        setSelectedRegion('');
        setSelectedGender('');
        setCurrentPage(1);
        
        // Close dialog first
        setAddDialogOpen(false);
        
        // Show success message and clear any errors
        setError(null);
        setSuccessMessage('Patient registered successfully! 🎉');
        
        // Small delay to ensure state updates, then refresh
        setTimeout(async () => {
          await fetchPatients();
          console.log('✅ Patient list refreshed, new patient should be visible');
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        }, 100);
      }
    } catch (error: any) {
      console.error('❌ Error adding patient:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Show error to user
      if (error.response?.data?.error?.details) {
        setError(`Validation error: ${error.response.data.error.details.map((d: any) => d.msg).join(', ')}`);
      } else {
        setError(error.response?.data?.error?.message || 'Error creating patient');
      }
    }
  };

  const handleUpdatePatient = async (patientData: any) => {
    try {
      console.log('📤 Updating patient data:', patientData);
      
      if (!selectedPatient) {
        setError('No patient selected for update');
        return;
      }
      
      // Check token validity before proceeding
      if (!token || !(await checkTokenValidity())) {
        setError('Your session has expired. Please log in again.');
        return;
      }
      
      // Transform the flat form data to match backend Patient model (same as add)
      const transformedData = {
        // Personal Information
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        middleName: patientData.middleName || undefined,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        nationality: patientData.nationality || 'Ghana',
        
        // Ghana-specific Identifiers
        ghanaCardNumber: patientData.ghanaCardNumber || undefined,
        nhisNumber: patientData.nhisNumber || undefined,
        votersId: patientData.votersId || undefined,
        
        // Contact Information
        phoneNumber: patientData.phoneNumber,
        alternativePhone: patientData.alternativePhone || undefined,
        email: patientData.email || undefined,
        
        // Address (nested object)
        address: {
          region: patientData.region,
          district: patientData.district,
          town: patientData.town,
          area: patientData.area || undefined,
          houseNumber: patientData.houseNumber || undefined,
          landmark: patientData.landmark || undefined,
          digitalAddress: patientData.digitalAddress || undefined,
        },
        
        // Emergency Contact (nested object)
        emergencyContact: {
          name: patientData.emergencyContactName,
          relationship: patientData.emergencyContactRelationship,
          phoneNumber: patientData.emergencyContactPhone,
        },
        
        // Medical Information
        bloodGroup: patientData.bloodGroup || undefined,
        allergies: patientData.allergies ? [patientData.allergies] : [],
        chronicConditions: patientData.chronicConditions ? [patientData.chronicConditions] : [],
        currentMedications: patientData.currentMedications ? [patientData.currentMedications] : [],
        preferredLanguage: patientData.preferredLanguage || 'English',
        
        // Insurance Information
        insurance: {
          hasNHIS: !!patientData.nhisNumber,
          nhisStatus: patientData.nhisNumber ? 'active' : undefined,
        },
      };
      
      console.log('📦 Transformed data for backend:', transformedData);
      
      // Use PUT or PATCH for update
      const response = await axios.put(`${API_BASE_URL}/api/patients/${selectedPatient.id}`, transformedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Patient update response:', response.data);

      if (response.data.success) {
        console.log('🎉 Patient updated successfully, refreshing list...');
        
        // Close dialogs and clear selected patient
        setEditDialogOpen(false);
        setSelectedPatient(null);
        
        // Show success message and clear any errors
        setError(null);
        setSuccessMessage('Patient information updated successfully! ✅');
        
        // Refresh the patients list
        await fetchPatients();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (error: any) {
      console.error('❌ Error updating patient:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Show error to user
      if (error.response?.data?.error?.details) {
        setError(`Validation error: ${error.response.data.error.details.map((d: any) => d.msg).join(', ')}`);
      } else {
        setError(error.response?.data?.error?.message || 'Error updating patient');
      }
    }
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <CommonHeader 
        title="Patient Management"
        subtitle="Manage patient records and information"
      />
      
      {/* Main Content */}
      <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              mr: 2,
            }}
          >
            <PersonAddIcon sx={{ fontSize: 24, color: 'white' }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Patient Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register, search, and manage patient records
            </Typography>
          </Box>
          <Box sx={{ color: theme.palette.secondary.main }}>
            <AdinkraSymbols.GyeNyame />
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
            gap: 2, 
            mb: 3 
          }}
        >
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <PersonAddIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {pagination.totalPatients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <HospitalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {patients.filter(p => p.insurance.hasNHIS).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    NHIS Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                  <BadgeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {patients.filter(p => p.gender === 'female').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Female Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                  <BadgeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {patients.filter(p => p.gender === 'male').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Male Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Actions and Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 2fr' }, 
              gap: 2, 
              alignItems: 'center' 
            }}
          >
            <TextField
              fullWidth
              placeholder="Search patients by name, ID, or phone"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                label="Region"
              >
                <MenuItem value="">All Regions</MenuItem>
                {GHANA_REGIONS.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={selectedGender}
                onChange={(e) => handleGenderChange(e.target.value)}
                label="Gender"
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
                }}
              >
                Add Patient
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchPatients} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
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

      {/* Patients Table */}
      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Patient ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>NHIS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography>Loading patients...</Typography>
                    </TableCell>
                  </TableRow>
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchTerm || selectedRegion || selectedGender 
                          ? 'No patients found matching your filters' 
                          : 'No patients registered yet'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {patient.patientId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {patient.firstName} {patient.lastName}
                          </Typography>
                          {patient.middleName && (
                            <Typography variant="caption" color="text.secondary">
                              {patient.middleName}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {calculateAge(patient.dateOfBirth)} years
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.gender}
                          size="small"
                          color={patient.gender === 'male' ? 'primary' : patient.gender === 'female' ? 'secondary' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {patient.phoneNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {patient.address.town}, {patient.address.region}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.insurance.hasNHIS ? 'Active' : 'None'}
                          size="small"
                          color={patient.insurance.hasNHIS ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewPatient(patient)}
                              color="primary"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleEditPatient(patient)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Patient Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Personal Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Patient ID</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedPatient.patientId}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">
                    {selectedPatient.firstName} {selectedPatient.middleName} {selectedPatient.lastName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">{formatDate(selectedPatient.dateOfBirth)}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Age</Typography>
                  <Typography variant="body1">{calculateAge(selectedPatient.dateOfBirth)} years</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Contact & Location
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1">{selectedPatient.phoneNumber}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">
                    {selectedPatient.address.area && `${selectedPatient.address.area}, `}
                    {selectedPatient.address.town}, {selectedPatient.address.district}, {selectedPatient.address.region}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Blood Group</Typography>
                  <Typography variant="body1">{selectedPatient.bloodGroup || 'Not specified'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">NHIS Status</Typography>
                  <Chip
                    label={selectedPatient.insurance.hasNHIS ? 'Active' : 'Not Enrolled'}
                    size="small"
                    color={selectedPatient.insurance.hasNHIS ? 'success' : 'default'}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<DescriptionIcon />}
            onClick={() => {
              if (selectedPatient) {
                handleCreateInvoice(selectedPatient);
              }
            }}
          >
            Create Invoice
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => {
                if (selectedPatient) {
                    handleEditPatient(selectedPatient);
                    setViewDialogOpen(false); // Close view dialog to open edit dialog
                }
            }}
          >
            Edit Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Registration Dialog */}
      <PatientRegistration
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddPatient}
      />

      {/* Patient Edit Dialog */}
      <PatientRegistration
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdatePatient}
        editMode={true}
        patientData={selectedPatient}
      />
      </Box>
    </Box>
  );
};

export default PatientManagement;
