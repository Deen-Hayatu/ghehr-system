import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Divider,
  Fab,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  // ...existing code...
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon,
  CreditCard as CardIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { CommonHeader } from './CommonHeader';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface Service {
  name: string;
  amount: number;
}

interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  services: Service[];
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
  issuedDate: string;
  paidDate?: string;
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

interface BillingStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  thisMonth: number;
  lastMonth: number;
}

const BillingManagement: React.FC = () => {
  const { token } = useAuth(); // Use useAuth hook
  const location = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    thisMonth: 0,
    lastMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    services: [{ name: '', amount: '' }],
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    status: 'paid',
    paymentMethod: 'cash',
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    patientId: '',
    startDate: '',
    endDate: '',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const patientFromState = location.state as { patientId: string; patientName: string } | undefined;

    if (patientFromState?.patientId) {
      console.log('Received patient from navigation state:', patientFromState);
      
      // Pre-fill the new invoice form with the patient's ID
      setNewInvoice(prev => ({ ...prev, patientId: patientFromState.patientId }));
      
      // Switch to the "Create Invoice" tab
      setSelectedTab(1);
    }
  }, [location.state]);

  const calculateStats = useCallback((invoiceList: Invoice[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const newStats = {
      totalInvoices: invoiceList.length,
      totalRevenue: invoiceList.reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: invoiceList
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: invoiceList
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0),
      thisMonth: invoiceList
        .filter(inv => {
          const invDate = new Date(inv.issuedDate);
          return invDate.getMonth() === thisMonth && invDate.getFullYear() === thisYear;
        })
        .reduce((sum, inv) => sum + inv.amount, 0),
      lastMonth: invoiceList
        .filter(inv => {
          const invDate = new Date(inv.issuedDate);
          const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
          const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
          return invDate.getMonth() === lastMonth && invDate.getFullYear() === lastYear;
        })
        .reduce((sum, inv) => sum + inv.amount, 0),
    };

    setStats(newStats);
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      if (!token) {
        showSnackbar('Authentication required. Please log in again.', 'error');
        return;
      }

      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.patientId) queryParams.append('patientId', filters.patientId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`${API_BASE_URL}/api/billing?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data.invoices);
        calculateStats(data.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showSnackbar('Error fetching invoices', 'error');
    }
  }, [filters, calculateStats, token]);

  const fetchPatients = useCallback(async () => {
    setPatientsLoading(true);
    try {
      if (!token) {
        showSnackbar('Authentication token not found.', 'error');
        return;
      }
      // Using axios for consistency with other components
      const response = await axios.get(`${API_BASE_URL}/api/patients?limit=0`, { // limit=0 to fetch all
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        const patientList = response.data.data?.patients || response.data.patients || [];
        setPatients(patientList);
      } else {
        console.error('Failed to fetch patients:', response.data.error?.message);
        showSnackbar(response.data.error?.message || 'Error fetching patients', 'error');
      }
    } catch (error: any) {
      console.error('An error occurred while fetching patients:', error);
      const errorMessage = error.response?.data?.error?.message || 'An unexpected error occurred.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setPatientsLoading(false);
    }
  }, [token]); // Add token as a dependency

  const resetNewInvoiceForm = () => {
    setNewInvoice({
      patientId: '',
      services: [{ name: '', amount: '' }],
      notes: '',
    });
  };

  const createInvoice = async () => {
    try {
      if (!token) {
        showSnackbar('Authentication required. Please log in again.', 'error');
        return;
      }

      const services = newInvoice.services
        .filter(service => service.name && service.amount)
        .map(service => ({
          name: service.name,
          amount: parseFloat(service.amount),
        }));

      if (services.length === 0) {
        showSnackbar('Please add at least one service', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: newInvoice.patientId,
          services,
          notes: newInvoice.notes,
        }),
      });

      if (response.ok) {
        showSnackbar('Invoice created successfully', 'success');
        setCreateDialogOpen(false);
        resetNewInvoiceForm();
        fetchInvoices();
      } else {
        const error = await response.json();
        showSnackbar(error.error?.message || 'Error creating invoice', 'error');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showSnackbar('Error creating invoice', 'error');
    }
  };

  const updatePaymentStatus = async () => {
    if (!selectedInvoice) return;

    try {
      if (!token) {
        showSnackbar('Authentication required. Please log in again.', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/billing/${selectedInvoice.id}/payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        showSnackbar('Payment status updated successfully', 'success');
        setPaymentDialogOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        const error = await response.json();
        showSnackbar(error.error?.message || 'Error updating payment', 'error');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      showSnackbar('Error updating payment', 'error');
    }
  };

  const addService = () => {
    setNewInvoice(prev => ({
      ...prev,
      services: [...prev.services, { name: '', amount: '' }],
    }));
  };

  const removeService = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const updateService = (index: number, field: 'name' | 'amount', value: string) => {
    setNewInvoice(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      ),
    }));
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId || p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'cash': return <MoneyIcon />;
      case 'mobile_money': return <MobileIcon />;
      case 'card': return <CardIcon />;
      case 'bank_transfer': return <BankIcon />;
      default: return <MoneyIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const downloadInvoicePDF = async (invoiceId: string) => {
    try {
      if (!token) {
        showSnackbar('Authentication required. Please log in again.', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/billing/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to download PDF', 'error');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showSnackbar('Error downloading PDF', 'error');
    }
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const printInvoice = (invoice: Invoice) => {
    // Create a printable version of the invoice
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showSnackbar('Popup blocked. Please allow popups to print invoices.', 'error');
      return;
    }

    const services = invoice.services.map(s => 
      `<tr><td>${s.name}</td><td style="text-align: right">${formatCurrency(s.amount)}</td></tr>`
    ).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 1.2em; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GhEHR - Ghana Electronic Health Records</h1>
          <h2>Invoice</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Invoice ID:</strong> ${invoice.id}</p>
          <p><strong>Patient:</strong> ${getPatientName(invoice.patientId)}</p>
          <p><strong>Date:</strong> ${new Date(invoice.issuedDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th style="text-align: right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${services}
          </tbody>
          <tfoot>
            <tr class="total">
              <td><strong>Total</strong></td>
              <td style="text-align: right"><strong>${formatCurrency(invoice.amount)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 40px; text-align: center; color: #666;">
          <p>Thank you for choosing GhEHR Healthcare Services</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      await fetchInvoices();
      setLoading(false);
    };
    fetchPatients();
    loadInvoices();
  }, [fetchInvoices, fetchPatients]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <CommonHeader 
        title="Billing & Payment Management"
        subtitle="Manage invoices, process payments, and track revenue"
      />
      
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ReceiptIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Billing & Payment Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage invoices, process payments, and track revenue
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" component="h2">
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
              </Box>
              <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Pending Amount
                </Typography>
                <Typography variant="h5" component="h2" color="warning.main">
                  {formatCurrency(stats.pendingAmount)}
                </Typography>
              </Box>
              <PaymentIcon color="warning" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h5" component="h2" color="success.main">
                  {formatCurrency(stats.thisMonth)}
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
                  Total Invoices
                </Typography>
                <Typography variant="h5" component="h2">
                  {stats.totalInvoices}
                </Typography>
              </Box>
              <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Invoices" />
          <Tab label="Create Invoice" />
          <Tab label="Payment Processing" />
        </Tabs>
      </Paper>

      {/* Invoices Tab */}
      {selectedTab === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 2fr 1fr 1fr 1fr' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Patient</InputLabel>
                <Select
                  value={filters.patientId}
                  onChange={(e) => setFilters(prev => ({ ...prev, patientId: e.target.value }))}
                  label="Patient"
                >
                  <MenuItem value="">All Patients</MenuItem>
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                onClick={fetchInvoices}
                fullWidth
              >
                Apply Filters
              </Button>
            </Box>
          </Paper>

          {/* Invoices Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Issued Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{getPatientName(invoice.patientId)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        color={getStatusColor(invoice.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.paymentMethod ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          {getPaymentMethodIcon(invoice.paymentMethod)}
                          <Typography variant="body2">
                            {invoice.paymentMethod.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{new Date(invoice.issuedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => viewInvoiceDetails(invoice)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {invoice.status === 'pending' && (
                          <Tooltip title="Process Payment">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setPaymentDialogOpen(true);
                              }}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Download">
                          <IconButton size="small" onClick={() => downloadInvoicePDF(invoice.id)}>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                          <IconButton size="small" onClick={() => printInvoice(invoice)}>
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Create Invoice Tab */}
      {selectedTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Invoice
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                value={newInvoice.patientId}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, patientId: e.target.value }))}
                label="Patient"
                disabled={patientsLoading}
              >
                {patientsLoading && <MenuItem value=""><em>Loading patients...</em></MenuItem>}
                {!patientsLoading && patients.length === 0 && <MenuItem value=""><em>No patients found</em></MenuItem>}
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.patientId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Services
              </Typography>
              {newInvoice.services.map((service, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box 
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '2fr 1fr auto' },
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Service Name"
                      value={service.name}
                      onChange={(e) => updateService(index, 'name', e.target.value)}
                      placeholder="e.g., Consultation, Lab Test"
                    />
                    <TextField
                      fullWidth
                      label="Amount (GHS)"
                      type="number"
                      value={service.amount}
                      onChange={(e) => updateService(index, 'amount', e.target.value)}
                      placeholder="0.00"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeService(index)}
                      disabled={newInvoice.services.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addService}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Service
              </Button>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for the invoice..."
            />
            
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={createInvoice}
                disabled={!newInvoice.patientId}
              >
                Create Invoice
              </Button>
              <Button
                variant="outlined"
                onClick={resetNewInvoiceForm}
              >
                Reset Form
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Payment Processing Tab */}
      {selectedTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Processing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Process payments for pending invoices and update payment status
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices
                  .filter(invoice => invoice.status === 'pending')
                  .map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{getPatientName(invoice.patientId)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Chip label="Pending" color="warning" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PaymentIcon />}
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentDialogOpen(true);
                          }}
                        >
                          Process Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          {/* Dialog content would be the same as the Create Invoice tab */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={createInvoice} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Processing Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Invoice: {selectedInvoice.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Patient: {getPatientName(selectedInvoice.patientId)}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                Amount: {formatCurrency(selectedInvoice.amount)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={paymentData.status}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, status: e.target.value }))}
                    label="Payment Status"
                  >
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="mobile_money">Mobile Money</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={updatePaymentStatus} variant="contained">
            Update Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ mt: 2 }}>
              <Box 
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                  mb: 3
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom color="primary">
                    Invoice Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Invoice ID</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedInvoice.id}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Patient</Typography>
                    <Typography variant="body1">{getPatientName(selectedInvoice.patientId)}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Issue Date</Typography>
                    <Typography variant="body1">{new Date(selectedInvoice.issuedDate).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedInvoice.status}
                      color={getStatusColor(selectedInvoice.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom color="primary">
                    Payment Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {formatCurrency(selectedInvoice.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                    <Typography variant="body1">
                      {selectedInvoice.paymentMethod 
                        ? selectedInvoice.paymentMethod.replace('_', ' ').toUpperCase()
                        : 'Not specified'
                      }
                    </Typography>
                  </Box>
                  {selectedInvoice.paidDate && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Paid Date</Typography>
                      <Typography variant="body1">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom color="primary">
                Services
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Service</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.services.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell align="right">{formatCurrency(service.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(selectedInvoice.amount)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={() => {
              if (selectedInvoice) {
                printInvoice(selectedInvoice);
              }
            }}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (selectedInvoice) {
                downloadInvoicePDF(selectedInvoice.id);
              }
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default BillingManagement;