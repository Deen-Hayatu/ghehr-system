import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';

// Ensure this file is treated as a module
export {};

// Export types needed by other components (this makes it a module)
export type PatientReportType = 'comprehensive' | 'clinical' | 'medical-history' | 'recent-visits';

export interface PatientReportParams {
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
  reportType: PatientReportType;
}

// Interface for search results (simplified from backend)
interface PatientSearchResult {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  patientId: string;
}

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  email?: string;
  address: {
    region: string;
    district: string;
    town: string;
    area?: string;
    houseNumber?: string;
    landmark?: string;
    digitalAddress?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  insurance: {
    hasNHIS: boolean;
    nhisStatus?: 'active' | 'expired' | 'pending';
    privateInsurance?: {
      provider: string;
      policyNumber: string;
      expiryDate: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'deceased';
}

interface ClinicalNote {
  id: string;
  patientId: string;
  providerId?: string;
  content: string;
  date: string;
  tags?: string[];
  confidence?: { [key: string]: number };
  facilityId?: string;
  createdAt: string;
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
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientReportLayout: React.FC = () => {
  const { token } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<PatientSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState<PatientReportType>('comprehensive');
  const [tabValue, setTabValue] = useState(0);

  const searchPatients = debounce(async (term: string) => {
    if (!term || term.length < 2) {
      setPatients([]);
      return;
    }

    if (!token) {
      console.error('No authentication token available');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`/api/patients/search?q=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Patient search response:', response.data);
      
      // Handle the backend response structure
      if (response.data.success && response.data.data && response.data.data.patients) {
        setPatients(response.data.data.patients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  useEffect(() => {
    console.log('PatientReportLayout - Auth token available:', !!token);
    searchPatients(searchTerm);
    return () => {
      searchPatients.cancel();
    };
  }, [searchTerm, token]);

  const fetchPatientDetails = async (patientId: string) => {
    if (!token) {
      console.error('No authentication token available');
      return null;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Patient details response:', response.data);
      
      if (response.data.success && response.data.data && response.data.data.patient) {
        return response.data.data.patient;
      }
      return null;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicalNotes = async (patientId: string) => {
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const response = await axios.get(`/api/notes?patientId=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Clinical notes response:', response.data);
      
      // Handle the backend response structure
      if (response.data.success && response.data.data && response.data.data.notes) {
        setClinicalNotes(response.data.data.notes);
      } else {
        setClinicalNotes([]);
      }
    } catch (error) {
      console.error('Error fetching clinical notes:', error);
      setClinicalNotes([]);
    }
  };

  const handlePatientSelect = async (searchResult: PatientSearchResult | null) => {
    if (searchResult) {
      // Fetch full patient details
      const fullPatient = await fetchPatientDetails(searchResult.id);
      if (fullPatient) {
        setSelectedPatient(fullPatient);
        fetchClinicalNotes(searchResult.id);
      }
    } else {
      setSelectedPatient(null);
      setClinicalNotes([]);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch {
      return 'Invalid Date';
    }
  };

  const getPatientAge = (dateOfBirth: string) => {
    try {
      const today = new Date();
      const birthDate = parseISO(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Patient Reports
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Patient
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) => `${option.name} - ${option.phone}`}
                  value={patients.find(p => selectedPatient && p.id === selectedPatient.id) || null}
                  onChange={(event, newValue) => handlePatientSelect(newValue)}
                  inputValue={searchTerm}
                  onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
                  loading={searchLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search patients by name or phone"
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">
                          {option.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Phone: {option.phone} | Age: {option.age} | ID: {option.patientId}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText={searchTerm.length < 2 ? "Type at least 2 characters to search" : "No patients found"}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value as PatientReportType)}
                  >
                    <MenuItem value="comprehensive">Comprehensive Report</MenuItem>
                    <MenuItem value="clinical">Clinical Summary</MenuItem>
                    <MenuItem value="medical-history">Medical History</MenuItem>
                    <MenuItem value="recent-visits">Recent Visits</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {selectedPatient ? (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h5">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient ID: {selectedPatient.patientId} | Age: {getPatientAge(selectedPatient.dateOfBirth)} | Gender: {selectedPatient.gender}
                  </Typography>
                </Box>
                <Box>
                  <IconButton>
                    <PrintIcon />
                  </IconButton>
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Demographics" icon={<PersonIcon />} />
                  <Tab label="Medical History" icon={<HistoryIcon />} />
                  <Tab label="Clinical Notes" icon={<AssignmentIcon />} />
                  <Tab label="AI Analysis" icon={<LocalHospitalIcon />} />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Full Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Date of Birth:</strong> {formatDate(selectedPatient.dateOfBirth)}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Age:</strong> {getPatientAge(selectedPatient.dateOfBirth)} years
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Gender:</strong> {selectedPatient.gender}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Phone:</strong> {selectedPatient.phoneNumber}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Patient ID:</strong> {selectedPatient.patientId}
                      </Typography>
                      {selectedPatient.email && (
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Email:</strong> {selectedPatient.email}
                        </Typography>
                      )}
                      {selectedPatient.bloodGroup && (
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Address
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      {selectedPatient.address ? (
                        <>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {selectedPatient.address.town || 'N/A'}, {selectedPatient.address.district || 'N/A'}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {selectedPatient.address.region || 'N/A'}
                          </Typography>
                          {selectedPatient.address.area && (
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Area: {selectedPatient.address.area}
                            </Typography>
                          )}
                          {selectedPatient.address.digitalAddress && (
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Digital Address: {selectedPatient.address.digitalAddress}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No address information available
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Emergency Contact
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      {selectedPatient.emergencyContact ? (
                        <>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Name:</strong> {selectedPatient.emergencyContact.name || 'N/A'}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Relationship:</strong> {selectedPatient.emergencyContact.relationship || 'N/A'}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Phone:</strong> {selectedPatient.emergencyContact.phoneNumber || 'N/A'}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No emergency contact information available
                        </Typography>
                      )}
                    </Box>

                    {selectedPatient.insurance && selectedPatient.insurance.hasNHIS && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Insurance Information
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>NHIS:</strong> {selectedPatient.insurance.hasNHIS ? 'Yes' : 'No'}
                          </Typography>
                          {selectedPatient.insurance.nhisStatus && (
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>NHIS Status:</strong> {selectedPatient.insurance.nhisStatus}
                            </Typography>
                          )}
                          {selectedPatient.insurance.privateInsurance && (
                            <>
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Private Insurance Provider:</strong> {selectedPatient.insurance.privateInsurance.provider}
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Policy Number:</strong> {selectedPatient.insurance.privateInsurance.policyNumber}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </>
                    )}
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Medical Conditions
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {selectedPatient.chronicConditions.length > 0 ? (
                        selectedPatient.chronicConditions.map((condition, index) => (
                          <Chip
                            key={index}
                            label={condition}
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No chronic conditions recorded
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      Allergies
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map((allergy, index) => (
                          <Chip
                            key={index}
                            label={allergy}
                            color="error"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No allergies recorded
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      Current Medications
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {selectedPatient.currentMedications.length > 0 ? (
                        selectedPatient.currentMedications.map((medication, index) => (
                          <Chip
                            key={index}
                            label={medication}
                            color="info"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No current medications recorded
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Status Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Status:</strong> {selectedPatient.status}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Registered:</strong> {formatDate(selectedPatient.createdAt)}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Last Updated:</strong> {formatDate(selectedPatient.updatedAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {loading ? (
                  <Box display="flex" justifyContent="center" sx={{ p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : clinicalNotes.length > 0 ? (
                  <Grid container spacing={2}>
                    {clinicalNotes.map((note) => (
                      <Grid item xs={12} key={note.id}>
                        <Paper sx={{ p: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6">
                              Clinical Note - {note.createdAt ? formatDate(note.createdAt) : new Date().toLocaleDateString()}
                            </Typography>
                            {note.tags && note.tags.length > 0 && (
                              <Chip
                                label={`${note.tags.length} conditions identified`}
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                            {note.content}
                          </Typography>
                          
                          {note.tags && note.tags.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Identified Symptoms/Conditions:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {note.tags.map((tag, tagIndex) => (
                                  <Chip 
                                    key={tagIndex} 
                                    label={tag} 
                                    color="primary" 
                                    variant="outlined" 
                                    size="small"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {note.confidence && Object.keys(note.confidence).length > 0 && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
                              <Typography variant="subtitle2" color="secondary" gutterBottom>
                                AI Analysis - Condition Confidence:
                              </Typography>
                              {Object.entries(note.confidence).map(([condition, confidence]) => (
                                <Box key={condition} sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">
                                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {(confidence * 100).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={confidence * 100} 
                                    sx={{ height: 6, borderRadius: 1, mt: 0.5 }}
                                    color={confidence > 0.7 ? 'error' : confidence > 0.4 ? 'warning' : 'info'}
                                  />
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No clinical notes found for this patient.
                  </Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" sx={{ p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : clinicalNotes.length > 0 ? (
                  <Grid container spacing={2}>
                    {clinicalNotes
                      .filter((note) => note.confidence && Object.keys(note.confidence).length > 0)
                      .map((note) => (
                        <Grid item xs={12} key={note.id}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              AI Analysis - {note.createdAt ? formatDate(note.createdAt) : new Date().toLocaleDateString()}
                            </Typography>
                            
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Condition Analysis:
                            </Typography>
                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              {note.confidence ? Object.entries(note.confidence).map(([condition, confidence]) => (
                                <Grid item key={condition}>
                                  <Chip
                                    label={`${condition.charAt(0).toUpperCase() + condition.slice(1)} (${(confidence * 100).toFixed(1)}%)`}
                                    color={confidence > 0.7 ? 'error' : confidence > 0.4 ? 'warning' : 'info'}
                                    size="small"
                                  />
                                </Grid>
                              )) : null}
                            </Grid>

                            {note.tags && note.tags.length > 0 && (
                              <>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                  Identified Symptoms:
                                </Typography>
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                  {note.tags.map((tag, index) => (
                                    <Grid item key={index}>
                                      <Chip
                                        label={tag}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </>
                            )}

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                              Original Note: {note.content}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No AI analysis data available for this patient.
                  </Alert>
                )}
              </TabPanel>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: 4 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select a patient to view their report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Use the search field above to find and select a patient
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default PatientReportLayout;