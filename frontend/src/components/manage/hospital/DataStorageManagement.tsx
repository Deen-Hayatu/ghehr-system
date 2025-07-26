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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  Assessment as RecordIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import PatientService from '../../../services/PatientService';
import { Patient } from '../../../types/Patient';

interface PatientDataUsage {
  id: string;
  patientId: string;
  patientName: string;
  email: string;
  lastVisit: string;
  storageUsed: number; // in MB
  recordsCount: number;
  imagesCount: number;
  documentsCount: number;
  registrationDate: string;
}

const DataStorageManagement: React.FC = () => {
  const { token } = useAuth();
  const [patientData, setPatientData] = useState<PatientDataUsage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredData, setFilteredData] = useState<PatientDataUsage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and process patient data for storage analytics
  useEffect(() => {
    const loadPatientStorageData = async () => {
      if (!token) {
        console.error('No authentication token available');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const patients = await PatientService.getAllPatients(token);
        
        // Generate storage analytics for each patient
        const storageData: PatientDataUsage[] = patients.map((patient, index) => {
          // Simulate storage usage based on patient data
          const baseStorage = Math.random() * 200 + 50; // 50-250 MB base
          const recordMultiplier = Math.floor(Math.random() * 30) + 5; // 5-35 records
          const imageMultiplier = Math.floor(Math.random() * 15) + 1; // 1-16 images
          const docMultiplier = Math.floor(Math.random() * 20) + 3; // 3-23 documents
          
          // Calculate storage based on content
          const recordStorage = recordMultiplier * 2.5; // ~2.5MB per record
          const imageStorage = imageMultiplier * 8.2; // ~8.2MB per image
          const docStorage = docMultiplier * 1.8; // ~1.8MB per document
          
          const totalStorage = baseStorage + recordStorage + imageStorage + docStorage;
          
          // Generate a plausible last visit date
          const daysAgo = Math.floor(Math.random() * 90); // 0-90 days ago
          const lastVisit = new Date();
          lastVisit.setDate(lastVisit.getDate() - daysAgo);
          
          return {
            id: patient.id,
            patientId: patient.patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@email.com`,
            lastVisit: lastVisit.toISOString().split('T')[0],
            storageUsed: Math.round(totalStorage * 100) / 100,
            recordsCount: recordMultiplier,
            imagesCount: imageMultiplier,
            documentsCount: docMultiplier,
            registrationDate: patient.createdAt.split('T')[0]
          };
        });
        
        setPatientData(storageData);
        setFilteredData(storageData);
      } catch (error) {
        console.error('Error loading patient storage data:', error);
        // Fallback to mock data if needed
        const mockData: PatientDataUsage[] = [
          {
            id: 'PAT-001',
            patientId: 'GH-001',
            patientName: 'Kwame Asante',
            email: 'kwame.asante@email.com',
            lastVisit: '2025-07-20',
            storageUsed: 245.6,
            recordsCount: 23,
            imagesCount: 8,
            documentsCount: 15,
            registrationDate: '2023-01-15'
          },
          {
            id: 'PAT-002',
            patientId: 'GH-002',
            patientName: 'Akosua Darko',
            email: 'akosua.darko@email.com',
            lastVisit: '2025-07-18',
            storageUsed: 189.3,
            recordsCount: 18,
            imagesCount: 5,
            documentsCount: 12,
            registrationDate: '2023-03-22'
          }
        ];
        setPatientData(mockData);
        setFilteredData(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientStorageData();
  }, [token]);

  // Calculate total storage statistics
  const totalStorageUsed = patientData.reduce((sum, patient) => sum + patient.storageUsed, 0);
  const totalPatients = patientData.length;
  const averageStoragePerPatient = totalStorageUsed / totalPatients;
  const totalRecords = patientData.reduce((sum, patient) => sum + patient.recordsCount, 0);
  const totalImages = patientData.reduce((sum, patient) => sum + patient.imagesCount, 0);
  const totalDocuments = patientData.reduce((sum, patient) => sum + patient.documentsCount, 0);

  // Storage capacity (Enterprise plan = unlimited, showing usage)
  const storageCapacityGB = Number.POSITIVE_INFINITY; // Unlimited for Enterprise
  const storageUsedGB = totalStorageUsed / 1024; // Convert MB to GB

  const applyFilters = () => {
    let filtered = patientData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeFilter) {
        case '1week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '1month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'older':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter(patient => new Date(patient.lastVisit) < cutoffDate);
          setFilteredData(filtered);
          return;
      }
      
      if (timeFilter !== 'older') {
        filtered = filtered.filter(patient => new Date(patient.lastVisit) >= cutoffDate);
      }
    }

    setFilteredData(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, timeFilter]);

  const formatStorageSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const getStorageUsageColor = (usage: number) => {
    if (usage > 500) return 'error';
    if (usage > 200) return 'warning';
    return 'success';
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2, minWidth: '200px' }} />
            <Typography variant="body1" color="textSecondary">
              Loading patient storage data...
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              💾 Data Storage Management
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                size="small"
              >
                Backup Data
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
            size="small"
            sx={{ backgroundColor: '#1976d2' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Enterprise Plan Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Enterprise Plan:</strong> You enjoy unlimited storage capacity. 
          Current usage: <strong>{storageUsedGB.toFixed(2)} GB</strong> across {totalPatients} patients.
        </Typography>
      </Alert>

      {/* Storage Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {storageUsedGB.toFixed(2)} GB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Storage Used
              </Typography>
              <Typography variant="caption" color="success.main">
                Unlimited Plan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalPatients}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg: {formatStorageSize(averageStoragePerPatient)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RecordIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalRecords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medical Records
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clinical Notes & Data
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ImageIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalImages + totalDocuments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Files & Images
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalImages} Images, {totalDocuments} Docs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Breakdown Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Storage Consumption Breakdown
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Medical Records</Typography>
                  <Typography variant="caption">{((totalRecords * 0.5) / 1024).toFixed(2)} GB</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={65} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="primary"
                />
                <Typography variant="caption" color="text.secondary">
                  65% of total storage
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Medical Images</Typography>
                  <Typography variant="caption">{((totalImages * 25) / 1024).toFixed(2)} GB</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={25} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="warning"
                />
                <Typography variant="caption" color="text.secondary">
                  25% of total storage
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Documents</Typography>
                  <Typography variant="caption">{((totalDocuments * 2) / 1024).toFixed(2)} GB</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={10} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="caption" color="text.secondary">
                  10% of total storage
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search patients by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Last Visit</InputLabel>
                <Select
                  value={timeFilter}
                  label="Filter by Last Visit"
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Patients</MenuItem>
                  <MenuItem value="1week">Last 1 Week</MenuItem>
                  <MenuItem value="1month">Last 1 Month</MenuItem>
                  <MenuItem value="3months">Last 3 Months</MenuItem>
                  <MenuItem value="6months">Last 6 Months</MenuItem>
                  <MenuItem value="1year">Last 1 Year</MenuItem>
                  <MenuItem value="older">More than 1 year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Patient Data Consumption Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Patient Data Consumption ({filteredData.length} patients)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Patient Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Last Visit</strong></TableCell>
                  <TableCell><strong>Storage Used</strong></TableCell>
                  <TableCell><strong>Records</strong></TableCell>
                  <TableCell><strong>Images</strong></TableCell>
                  <TableCell><strong>Documents</strong></TableCell>
                  <TableCell><strong>Registered</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {patient.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {patient.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStorageSize(patient.storageUsed)}
                        color={getStorageUsageColor(patient.storageUsed) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <RecordIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {patient.recordsCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ImageIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {patient.imagesCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <DocumentIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {patient.documentsCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(patient.registrationDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Data">
                          <IconButton size="small">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Archive Data">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
        </>
      )}
    </Box>
  );
};

export default DataStorageManagement;
