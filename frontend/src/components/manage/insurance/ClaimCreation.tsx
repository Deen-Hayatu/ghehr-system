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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SubmitIcon,
  Description as ClaimIcon,
  Schedule as PendingIcon,
  CheckCircle as ProcessedIcon,
  Cancel as RejectedIcon,
  AttachFile as AttachIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface Claim {
  id: string;
  patientName: string;
  memberId: string;
  serviceDate: string;
  serviceType: string;
  serviceCode: string;
  provider: string;
  claimAmount: string;
  status: 'draft' | 'submitted' | 'processing' | 'paid' | 'rejected';
  submissionDate?: string;
  paymentDate?: string;
  rejectionReason?: string;
  attachments: string[];
}

const ClaimCreation: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 'CLM-001',
      patientName: 'Kwame Asante',
      memberId: 'NHIS-123456789',
      serviceDate: '2025-07-15',
      serviceType: 'Consultation',
      serviceCode: 'CPT-99213',
      provider: 'Greater Accra Regional Hospital',
      claimAmount: 'GHS 85.00',
      status: 'paid',
      submissionDate: '2025-07-16',
      paymentDate: '2025-07-20',
      attachments: ['medical_report.pdf', 'prescription.pdf']
    },
    {
      id: 'CLM-002',
      patientName: 'Ama Osei',
      memberId: 'NHIS-987654321',
      serviceDate: '2025-07-22',
      serviceType: 'Laboratory Tests',
      serviceCode: 'CPT-80053',
      provider: 'Korle-Bu Teaching Hospital',
      claimAmount: 'GHS 150.00',
      status: 'processing',
      submissionDate: '2025-07-23',
      attachments: ['lab_results.pdf']
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    memberId: '',
    serviceDate: '',
    serviceType: '',
    serviceCode: '',
    provider: '',
    claimAmount: '',
    diagnosis: '',
    notes: ''
  });

  const handleSubmitClaim = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newClaim: Claim = {
        id: `CLM-${String(claims.length + 1).padStart(3, '0')}`,
        ...formData,
        status: 'submitted',
        submissionDate: new Date().toISOString().split('T')[0],
        attachments: []
      };
      
      setClaims(prev => [...prev, newClaim]);
      setOpenDialog(false);
      setFormData({
        patientName: '',
        memberId: '',
        serviceDate: '',
        serviceType: '',
        serviceCode: '',
        provider: '',
        claimAmount: '',
        diagnosis: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <ProcessedIcon sx={{ color: '#4caf50' }} />;
      case 'rejected':
        return <RejectedIcon sx={{ color: '#f44336' }} />;
      case 'processing':
      case 'submitted':
        return <PendingIcon sx={{ color: '#ff9800' }} />;
      default:
        return <ClaimIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'rejected':
        return 'error';
      case 'processing':
      case 'submitted':
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
          📄 Insurance Claims Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ backgroundColor: '#4caf50' }}
        >
          Create Claim
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {claims.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Claims
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {claims.filter(c => ['submitted', 'processing'].includes(c.status)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {claims.filter(c => c.status === 'paid').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {claims.filter(c => c.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Claims Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Insurance Claims
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Claim ID</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Service</strong></TableCell>
                  <TableCell><strong>Provider</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Service Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {claim.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {claim.memberId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{claim.serviceType}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {claim.serviceCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{claim.provider}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {claim.claimAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(claim.status)}
                        label={claim.status.toUpperCase()}
                        color={getStatusColor(claim.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(claim.serviceDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Attachments">
                          <IconButton size="small">
                            <AttachIcon />
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

      {/* New Claim Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Insurance Claim</DialogTitle>
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
                  label="Service Date"
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
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
                  label="Service Code (CPT/ICD)"
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
                <TextField
                  fullWidth
                  label="Claim Amount"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                  placeholder="GHS 0.00"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Primary Diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="ICD-10 code and description"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Additional information for claim processing..."
                />
              </Grid>
              <Grid size={12}>
                <Button
                  variant="outlined"
                  startIcon={<AttachIcon />}
                  sx={{ mt: 1 }}
                >
                  Attach Supporting Documents
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Attach medical reports, prescriptions, lab results, etc.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitClaim}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SubmitIcon />}
            disabled={loading || !formData.patientName || !formData.memberId || !formData.serviceDate}
          >
            {loading ? 'Creating...' : 'Submit Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimCreation;
