import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SubmitIcon,
  Assignment as AuthIcon,
  Schedule as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as DeniedIcon,
} from '@mui/icons-material';

interface PreAuthRequest {
  id: string;
  patientName: string;
  memberId: string;
  serviceType: string;
  serviceCode: string;
  provider: string;
  requestDate: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'approved' | 'denied' | 'partial';
  estimatedCost: string;
  approvalNumber?: string;
  notes: string;
}

const PreAuthorization: React.FC = () => {
  const [requests, setRequests] = useState<PreAuthRequest[]>([
    {
      id: 'PA-001',
      patientName: 'Kwame Asante',
      memberId: 'NHIS-123456789',
      serviceType: 'MRI Scan',
      serviceCode: 'CPT-70551',
      provider: 'Greater Accra Regional Hospital',
      requestDate: '2025-07-20',
      urgency: 'routine',
      status: 'approved',
      estimatedCost: 'GHS 850.00',
      approvalNumber: 'AUTH-2025-001234',
      notes: 'Brain MRI for suspected tumor - approved for 1 scan'
    },
    {
      id: 'PA-002',
      patientName: 'Ama Osei',
      memberId: 'NHIS-987654321',
      serviceType: 'Cardiac Surgery',
      serviceCode: 'CPT-33533',
      provider: 'Korle-Bu Teaching Hospital',
      requestDate: '2025-07-22',
      urgency: 'urgent',
      status: 'pending',
      estimatedCost: 'GHS 15,000.00',
      notes: 'Coronary artery bypass - awaiting review'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    memberId: '',
    serviceType: '',
    serviceCode: '',
    provider: '',
    urgency: 'routine' as PreAuthRequest['urgency'],
    estimatedCost: '',
    notes: ''
  });

  const handleSubmitRequest = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRequest: PreAuthRequest = {
        id: `PA-${String(requests.length + 1).padStart(3, '0')}`,
        ...formData,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      setRequests(prev => [...prev, newRequest]);
      setOpenDialog(false);
      setFormData({
        patientName: '',
        memberId: '',
        serviceType: '',
        serviceCode: '',
        provider: '',
        urgency: 'routine',
        estimatedCost: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon sx={{ color: '#4caf50' }} />;
      case 'denied':
        return <DeniedIcon sx={{ color: '#f44336' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: '#ff9800' }} />;
      default:
        return <AuthIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'denied':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'error';
      case 'urgent':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          📋 Pre-Authorization Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ backgroundColor: '#2196f3' }}
        >
          New Request
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {requests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {requests.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {requests.filter(r => r.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {requests.filter(r => r.status === 'denied').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Denied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requests Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pre-Authorization Requests
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Request ID</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Provider</strong></TableCell>
                  <TableCell><strong>Urgency</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Cost</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {request.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.memberId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{request.serviceType}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.serviceCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{request.provider}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.urgency.toUpperCase()}
                        color={getUrgencyColor(request.urgency) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status.toUpperCase()}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.estimatedCost}</TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit New Pre-Authorization Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Member ID"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Service Type"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Service Code (CPT)"
                  value={formData.serviceCode}
                  onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Healthcare Provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Urgency Level</InputLabel>
                  <Select
                    value={formData.urgency}
                    label="Urgency Level"
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as PreAuthRequest['urgency'] })}
                  >
                    <MenuItem value="routine">Routine</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Estimated Cost"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  placeholder="GHS 0.00"
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Clinical Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Provide clinical justification for the requested service..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitRequest}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SubmitIcon />}
            disabled={loading || !formData.patientName || !formData.memberId || !formData.serviceType}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PreAuthorization;
