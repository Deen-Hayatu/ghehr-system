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
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as ProviderIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

interface BillingProvider {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'specialist';
  npiNumber: string;
  taxId: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  contactPerson: string;
  status: 'active' | 'inactive' | 'pending';
  bankAccount: string;
  routingNumber: string;
  paymentMethod: 'direct_deposit' | 'check' | 'wire_transfer';
  joinDate: string;
  lastPayment?: string;
}

const BillingProvider: React.FC = () => {
  const [providers, setProviders] = useState<BillingProvider[]>([
    {
      id: 'BP-001',
      name: 'Greater Accra Regional Hospital',
      type: 'hospital',
      npiNumber: 'NPI-1234567890',
      taxId: 'TAX-001234567',
      address: '123 Independence Ave',
      city: 'Accra',
      phone: '+233-30-222-1234',
      email: 'billing@garh.gov.gh',
      contactPerson: 'Dr. Kwame Mensah',
      status: 'active',
      bankAccount: '****-****-****-1234',
      routingNumber: 'GCB-001234',
      paymentMethod: 'direct_deposit',
      joinDate: '2025-01-01',
      lastPayment: '2025-07-20'
    },
    {
      id: 'BP-002',
      name: 'Korle-Bu Teaching Hospital',
      type: 'hospital',
      npiNumber: 'NPI-2345678901',
      taxId: 'TAX-002345678',
      address: 'Korle-Bu Road',
      city: 'Accra',
      phone: '+233-30-202-4000',
      email: 'accounts@kbth.gov.gh',
      contactPerson: 'Dr. Ama Osei',
      status: 'active',
      bankAccount: '****-****-****-5678',
      routingNumber: 'GCB-005678',
      paymentMethod: 'direct_deposit',
      joinDate: '2025-01-15',
      lastPayment: '2025-07-18'
    },
    {
      id: 'BP-003',
      name: 'Healthy Life Pharmacy',
      type: 'pharmacy',
      npiNumber: 'NPI-3456789012',
      taxId: 'TAX-003456789',
      address: '45 Osu Oxford Street',
      city: 'Accra',
      phone: '+233-30-276-5432',
      email: 'billing@healthylife.com.gh',
      contactPerson: 'Mr. Kofi Asante',
      status: 'pending',
      bankAccount: '****-****-****-9012',
      routingNumber: 'ADB-009012',
      paymentMethod: 'check',
      joinDate: '2025-07-20'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<BillingProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'clinic' as BillingProvider['type'],
    npiNumber: '',
    taxId: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    contactPerson: '',
    status: 'pending' as BillingProvider['status'],
    bankAccount: '',
    routingNumber: '',
    paymentMethod: 'direct_deposit' as BillingProvider['paymentMethod']
  });

  const handleSubmitProvider = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (editingProvider) {
        // Update existing provider
        setProviders(prev => prev.map(p => 
          p.id === editingProvider.id 
            ? { ...p, ...formData }
            : p
        ));
      } else {
        // Add new provider
        const newProvider: BillingProvider = {
          id: `BP-${String(providers.length + 1).padStart(3, '0')}`,
          ...formData,
          joinDate: new Date().toISOString().split('T')[0]
        };
        setProviders(prev => [...prev, newProvider]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (provider?: BillingProvider) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        type: provider.type,
        npiNumber: provider.npiNumber,
        taxId: provider.taxId,
        address: provider.address,
        city: provider.city,
        phone: provider.phone,
        email: provider.email,
        contactPerson: provider.contactPerson,
        status: provider.status,
        bankAccount: provider.bankAccount,
        routingNumber: provider.routingNumber,
        paymentMethod: provider.paymentMethod
      });
    } else {
      setEditingProvider(null);
      setFormData({
        name: '',
        type: 'clinic',
        npiNumber: '',
        taxId: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        contactPerson: '',
        status: 'pending',
        bankAccount: '',
        routingNumber: '',
        paymentMethod: 'direct_deposit'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProvider(null);
  };

  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return '🏥';
      case 'clinic':
        return '🏢';
      case 'pharmacy':
        return '💊';
      case 'laboratory':
        return '🔬';
      case 'specialist':
        return '👨‍⚕️';
      default:
        return '🏢';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon sx={{ color: '#4caf50' }} />;
      case 'inactive':
        return <InactiveIcon sx={{ color: '#f44336' }} />;
      default:
        return <ProviderIcon sx={{ color: '#ff9800' }} />;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          🏦 Billing Provider Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#9c27b0' }}
        >
          Add Provider
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {providers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Providers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {providers.filter(p => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {providers.filter(p => p.status === 'pending').length}
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
              <Typography variant="h4" color="error.main">
                {providers.filter(p => p.status === 'inactive').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Providers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Registered Billing Providers
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Provider</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Contact</strong></TableCell>
                  <TableCell><strong>NPI/Tax ID</strong></TableCell>
                  <TableCell><strong>Payment Method</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Last Payment</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getProviderTypeIcon(provider.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {provider.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {provider.contactPerson}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={provider.type.toUpperCase()}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{provider.phone}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">{provider.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          NPI: {provider.npiNumber}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Tax: {provider.taxId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BankIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {provider.paymentMethod.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(provider.status)}
                        label={provider.status.toUpperCase()}
                        color={getStatusColor(provider.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {provider.lastPayment 
                        ? new Date(provider.lastPayment).toLocaleDateString()
                        : 'No payments'
                      }
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Provider">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(provider)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProvider ? 'Edit Provider' : 'Add New Billing Provider'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Provider Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Provider Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Provider Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BillingProvider['type'] })}
                  >
                    <MenuItem value="hospital">Hospital</MenuItem>
                    <MenuItem value="clinic">Clinic</MenuItem>
                    <MenuItem value="pharmacy">Pharmacy</MenuItem>
                    <MenuItem value="laboratory">Laboratory</MenuItem>
                    <MenuItem value="specialist">Specialist</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="NPI Number"
                  value={formData.npiNumber}
                  onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BillingProvider['status'] })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bank Account"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="Account number or masked format"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as BillingProvider['paymentMethod'] })}
                  >
                    <MenuItem value="direct_deposit">Direct Deposit</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                    <MenuItem value="wire_transfer">Wire Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitProvider}
            variant="contained"
            disabled={loading || !formData.name || !formData.npiNumber || !formData.taxId}
          >
            {loading ? 'Saving...' : editingProvider ? 'Update' : 'Add'} Provider
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingProvider;
