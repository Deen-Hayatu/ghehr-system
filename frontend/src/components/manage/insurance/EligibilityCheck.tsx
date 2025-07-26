import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import PatientService from '../../../services/PatientService';
import { PatientSelectionItem } from '../../../types/Patient';

interface EligibilityResult {
  id: string;
  patientName: string;
  memberId: string;
  insuranceProvider: string;
  planType: string;
  status: 'active' | 'inactive' | 'pending';
  effectiveDate: string;
  expirationDate: string;
  copay: string;
  deductible: string;
  coverageDetails: string[];
}

const EligibilityCheck: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [availablePatients, setAvailablePatients] = useState<PatientSelectionItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSelectionItem | null>(null);
  const [searchData, setSearchData] = useState({
    memberId: '',
    insuranceProvider: '',
    dateOfService: '',
  });
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);

  // Load patients for selection
  useEffect(() => {
    const loadPatients = async () => {
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      
      setPatientLoading(true);
      try {
        const patients = await PatientService.getPatientsForSelection(token);
        setAvailablePatients(patients);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setPatientLoading(false);
      }
    };
    
    loadPatients();
  }, [token]);

  const handlePatientSelect = (patient: PatientSelectionItem | null) => {
    setSelectedPatient(patient);
    // Clear previous eligibility result when patient changes
    setEligibilityResult(null);
  };
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!selectedPatient) {
      setError('Please select a patient first.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock eligibility result using selected patient data
      const mockResult: EligibilityResult = {
        id: 'ELG-001',
        patientName: selectedPatient.name,
        memberId: searchData.memberId || `NHIS-${selectedPatient.patientId}`,
        insuranceProvider: searchData.insuranceProvider || 'National Health Insurance Scheme',
        planType: 'Standard Coverage',
        status: 'active',
        effectiveDate: '2025-01-01',
        expirationDate: '2025-12-31',
        copay: 'GHS 5.00',
        deductible: 'GHS 0.00',
        coverageDetails: [
          'Outpatient consultations',
          'Emergency services',
          'Laboratory tests',
          'Prescription medications',
          'Diagnostic imaging',
          'Preventive care'
        ]
      };
      
      setEligibilityResult(mockResult);
    } catch (error) {
      setError('Failed to verify eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'inactive':
        return <CancelIcon sx={{ color: '#f44336' }} />;
      default:
        return <InfoIcon sx={{ color: '#ff9800' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        🔍 Insurance Eligibility Verification
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Patient & Insurance Information
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <Autocomplete
                options={availablePatients}
                value={selectedPatient}
                onChange={(event, newValue) => handlePatientSelect(newValue)}
                getOptionLabel={(option) => `${option.name} (${option.patientId})`}
                isOptionEqualToValue={(option, value) => option.patientId === value.patientId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    placeholder="Search by name or patient ID..."
                    required
                    error={!selectedPatient}
                    helperText={!selectedPatient ? 'Please select a patient to check eligibility' : ''}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Card sx={{ width: '100%', mb: 1 }}>
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {option.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {option.patientId} • Age: {option.age} • {option.gender}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}
                loading={patientLoading}
                noOptionsText="No patients found"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {selectedPatient && (
              <Grid size={12}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Selected Patient
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedPatient.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ID: {selectedPatient.patientId} • Age: {selectedPatient.age} • {selectedPatient.gender}
                        </Typography>
                        {selectedPatient.phone && (
                          <Typography variant="body2" color="textSecondary">
                            Phone: {selectedPatient.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Member ID / NHIS Number"
                value={searchData.memberId}
                onChange={(e) => setSearchData({ ...searchData, memberId: e.target.value })}
                placeholder="Enter insurance member ID"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Insurance Provider"
                value={searchData.insuranceProvider}
                onChange={(e) => setSearchData({ ...searchData, insuranceProvider: e.target.value })}
                placeholder="e.g., NHIS, Private Insurance"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Date of Service"
                type="date"
                value={searchData.dateOfService}
                onChange={(e) => setSearchData({ ...searchData, dateOfService: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                onClick={handleSearch}
                disabled={loading || !searchData.memberId}
                sx={{ mt: 2 }}
              >
                {loading ? 'Verifying...' : 'Check Eligibility'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Eligibility Results */}
      {eligibilityResult && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Eligibility Verification Results</Typography>
              <Chip
                icon={getStatusIcon(eligibilityResult.status)}
                label={`Coverage ${eligibilityResult.status.toUpperCase()}`}
                color={getStatusColor(eligibilityResult.status) as any}
                variant="filled"
              />
            </Box>

            {/* Patient & Insurance Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Patient Information
                  </Typography>
                  <Typography variant="body2"><strong>Name:</strong> {eligibilityResult.patientName}</Typography>
                  <Typography variant="body2"><strong>Member ID:</strong> {eligibilityResult.memberId}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Insurance Details
                  </Typography>
                  <Typography variant="body2"><strong>Provider:</strong> {eligibilityResult.insuranceProvider}</Typography>
                  <Typography variant="body2"><strong>Plan Type:</strong> {eligibilityResult.planType}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Coverage Details Table */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Coverage Information
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Coverage Item</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Effective Date</TableCell>
                    <TableCell>{new Date(eligibilityResult.effectiveDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Expiration Date</TableCell>
                    <TableCell>{new Date(eligibilityResult.expirationDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Copay</TableCell>
                    <TableCell>{eligibilityResult.copay}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Deductible</TableCell>
                    <TableCell>{eligibilityResult.deductible}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Covered Services */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
              Covered Services
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {eligibilityResult.coverageDetails.map((service, index) => (
                <Chip
                  key={index}
                  label={service}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EligibilityCheck;
