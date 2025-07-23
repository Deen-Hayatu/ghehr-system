import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { format as formatDate, subDays } from 'date-fns';

export type AdminReportType = 'summary' | 'details' | 'visits' | 'booked' | 'lists';

export interface ReportParams {
  reportType: AdminReportType;
  startDate: Date;
  endDate: Date;
  doctor?: string;
  status?: string;
  format: 'pdf' | 'excel';
}

interface AdminReportProps {
  reportType: AdminReportType;
  onGenerate: (params: ReportParams) => Promise<Blob>;
}

const reportTypeConfig = {
  summary: {
    title: 'Appointment Summary',
    description: 'Overview of appointments with key metrics',
    icon: AssessmentIcon,
    color: '#1976d2',
  },
  details: {
    title: 'Appointment Details',
    description: 'Detailed appointment information',
    icon: CalendarIcon,
    color: '#388e3c',
  },
  visits: {
    title: 'Visit Summary',
    description: 'Patient visit statistics and trends',
    icon: PeopleIcon,
    color: '#f57c00',
  },
  booked: {
    title: 'Booked Appointments',
    description: 'Currently scheduled appointments',
    icon: ScheduleIcon,
    color: '#7b1fa2',
  },
  lists: {
    title: 'Patient Lists',
    description: 'Comprehensive patient listings',
    icon: ListIcon,
    color: '#d32f2f',
  },
};

const AdminReportLayout: React.FC<AdminReportProps> = ({ reportType, onGenerate }) => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const config = reportTypeConfig[reportType];
  const IconComponent = config.icon;

  const handleGenerate = async (downloadFormat: 'pdf' | 'excel') => {
    try {
      setLoading(true);
      setError(null);

      const params: ReportParams = {
        reportType,
        startDate,
        endDate,
        doctor: selectedDoctor !== 'all' ? selectedDoctor : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        format: downloadFormat,
      };

      const blob = await onGenerate(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.title}_${formatDate(new Date(startDate), 'yyyy-MM-dd')}_to_${formatDate(new Date(endDate), 'yyyy-MM-dd')}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Error generating report:', error);
      setError(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    // Mock preview data - in production, fetch from API
    const mockData = {
      summary: [
        { date: '2025-07-21', patientId: 'P001', name: 'Kwame Asante', doctor: 'Dr. Sarah Wilson', status: 'Completed', duration: '30 min' },
        { date: '2025-07-21', patientId: 'P002', name: 'Ama Osei', doctor: 'Dr. John Smith', status: 'Scheduled', duration: '45 min' },
        { date: '2025-07-20', patientId: 'P003', name: 'Kofi Mensah', doctor: 'Dr. Sarah Wilson', status: 'Cancelled', duration: '30 min' },
      ],
      details: [
        { date: '2025-07-21', time: '09:00', patientId: 'P001', name: 'Kwame Asante', phone: '+233 20 123 4567', doctor: 'Dr. Sarah Wilson', type: 'Consultation', status: 'Completed', notes: 'Follow-up required' },
      ],
      visits: [
        { week: 'Week 29', totalVisits: 45, newPatients: 12, returnVisits: 33, cancellations: 3 },
        { week: 'Week 28', totalVisits: 52, newPatients: 15, returnVisits: 37, cancellations: 2 },
      ],
      booked: [
        { date: '2025-07-22', time: '10:00', patientId: 'P004', name: 'Akosua Darko', doctor: 'Dr. Sarah Wilson', type: 'Check-up', phone: '+233 24 567 8901' },
        { date: '2025-07-22', time: '14:30', patientId: 'P005', name: 'Yaw Boateng', doctor: 'Dr. John Smith', type: 'Consultation', phone: '+233 26 345 6789' },
      ],
      lists: [
        { patientId: 'P001', name: 'Kwame Asante', age: 34, gender: 'Male', lastVisit: '2025-07-21', nextAppointment: '2025-08-21', status: 'Active' },
        { patientId: 'P002', name: 'Ama Osei', age: 28, gender: 'Female', lastVisit: '2025-07-20', nextAppointment: '2025-07-25', status: 'Active' },
      ],
    };

    setPreviewData(mockData[reportType] || []);
  };

  React.useEffect(() => {
    generatePreview();
  }, [reportType, startDate, endDate, selectedDoctor, selectedStatus]);

  const renderPreviewTable = () => {
    if (previewData.length === 0) return null;

    const headers = Object.keys(previewData[0]);
    
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.slice(0, 5).map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header}>
                    {header === 'status' ? (
                      <Chip 
                        label={row[header]} 
                        size="small"
                        color={
                          row[header] === 'Completed' ? 'success' :
                          row[header] === 'Scheduled' ? 'primary' :
                          row[header] === 'Cancelled' ? 'error' : 'default'
                        }
                      />
                    ) : (
                      row[header]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {previewData.length > 5 && (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Showing 5 of {previewData.length} records. Generate full report to see all data.
            </Typography>
          </Box>
        )}
      </TableContainer>
    );
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: config.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <IconComponent sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {config.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.description}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filters */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <TextField
            type="date"
            label="Start Date"
            value={formatDate(startDate, 'yyyy-MM-dd')}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End Date"
            value={formatDate(endDate, 'yyyy-MM-dd')}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Doctor</InputLabel>
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              label="Doctor"
            >
              <MenuItem value="all">All Doctors</MenuItem>
              <MenuItem value="dr-asante">Dr. Kwame Asante</MenuItem>
              <MenuItem value="dr-osei">Dr. Ama Osei</MenuItem>
              <MenuItem value="dr-mensah">Dr. Kofi Mensah</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no-show">No Show</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Format Selection & Generate Buttons */}
        <Box display="flex" gap={2} alignItems="center" sx={{ mb: 3 }}>
          <FormControl size="small">
            <InputLabel>Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
              label="Format"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={() => handleGenerate('pdf')}
            disabled={loading}
            sx={{ backgroundColor: config.color }}
          >
            Generate PDF
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleGenerate('excel')}
            disabled={loading}
          >
            Generate Excel
          </Button>
          
          <Button
            variant="text"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print Preview
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Preview */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Preview ({formatDate(startDate, 'dd/MM/yyyy')} - {formatDate(endDate, 'dd/MM/yyyy')})
          </Typography>
          {renderPreviewTable()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminReportLayout;