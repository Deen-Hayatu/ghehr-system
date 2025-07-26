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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Schedule as PendingIcon,
  Science as ProcessingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import PatientService from '../../../services/PatientService';
import HospitalConfigService from '../../../services/HospitalConfigService';
import { PatientSelectionItem } from '../../../types/Patient';

interface LabOrder {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  orderDate: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tests: string[];
  testCodes: string[];
  clinicalNotes: string;
  resultDate?: string;
  technician?: string;
  totalCost: number;
  department: string;
}

const LabOrders: React.FC = () => {
  const { token } = useAuth();
  const [hospitalConfig] = useState(HospitalConfigService.getCurrentConfig());
  const [orders, setOrders] = useState<LabOrder[]>([
    {
      id: 'LAB-001',
      patientName: 'Kwame Asante',
      patientId: 'PAT-001',
      doctorName: 'Dr. Ama Osei',
      orderDate: '2025-07-23',
      priority: 'routine',
      status: 'completed',
      tests: ['Complete Blood Count', 'Lipid Profile'],
      testCodes: ['CBC', 'LIPID'],
      clinicalNotes: 'Annual health checkup - evaluate cholesterol levels',
      resultDate: '2025-07-23',
      technician: 'John Mensah',
      totalCost: 85.00,
      department: 'Hematology'
    },
    {
      id: 'LAB-002',
      patientName: 'Akosua Darko',
      patientId: 'PAT-002',
      doctorName: 'Dr. Kofi Boateng',
      orderDate: '2025-07-23',
      priority: 'urgent',
      status: 'in_progress',
      tests: ['Blood Culture', 'ESR'],
      testCodes: ['BC', 'ESR'],
      clinicalNotes: 'Suspected infection - fever and elevated WBC',
      technician: 'Mary Adjei',
      totalCost: 120.00,
      department: 'Microbiology'
    },
    {
      id: 'LAB-003',
      patientName: 'Yaw Owusu',
      patientId: 'PAT-003',
      doctorName: 'Dr. Grace Ampong',
      orderDate: '2025-07-23',
      priority: 'stat',
      status: 'pending',
      tests: ['Cardiac Enzymes', 'Troponin'],
      testCodes: ['CE', 'TROP'],
      clinicalNotes: 'Emergency - suspected myocardial infarction',
      totalCost: 180.00,
      department: 'Clinical Chemistry'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<LabOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [availablePatients, setAvailablePatients] = useState<PatientSelectionItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSelectionItem | null>(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorName: '',
    priority: 'routine' as LabOrder['priority'],
    tests: [] as string[],
    testCodes: [] as string[],
    clinicalNotes: '',
    department: '',
    totalCost: 0
  });

  // Load patients when dialog opens
  useEffect(() => {
    if (openDialog && token) {
      loadPatients();
    }
  }, [openDialog, token]);

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

  const availableTests = [
    { name: 'Complete Blood Count', code: 'CBC', cost: 25, department: 'Hematology' },
    { name: 'Lipid Profile', code: 'LIPID', cost: 60, department: 'Clinical Chemistry' },
    { name: 'Blood Culture', code: 'BC', cost: 80, department: 'Microbiology' },
    { name: 'ESR', code: 'ESR', cost: 40, department: 'Hematology' },
    { name: 'Cardiac Enzymes', code: 'CE', cost: 100, department: 'Clinical Chemistry' },
    { name: 'Troponin', code: 'TROP', cost: 80, department: 'Clinical Chemistry' },
    { name: 'Thyroid Function', code: 'TFT', cost: 90, department: 'Endocrinology' },
    { name: 'Liver Function', code: 'LFT', cost: 70, department: 'Clinical Chemistry' },
    { name: 'Kidney Function', code: 'RFT', cost: 65, department: 'Clinical Chemistry' },
    { name: 'HbA1c', code: 'HBA1C', cost: 45, department: 'Clinical Chemistry' }
  ];

  const handleSubmitOrder = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (editingOrder) {
        setOrders(prev => prev.map(order => 
          order.id === editingOrder.id 
            ? { ...order, ...formData }
            : order
        ));
      } else {
        const newOrder: LabOrder = {
          id: `LAB-${String(orders.length + 1).padStart(3, '0')}`,
          ...formData,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'pending'
        };
        setOrders(prev => [...prev, newOrder]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelection = (test: typeof availableTests[0]) => {
    const isSelected = formData.tests.includes(test.name);
    
    if (isSelected) {
      setFormData({
        ...formData,
        tests: formData.tests.filter(t => t !== test.name),
        testCodes: formData.testCodes.filter(c => c !== test.code),
        totalCost: formData.totalCost - test.cost
      });
    } else {
      setFormData({
        ...formData,
        tests: [...formData.tests, test.name],
        testCodes: [...formData.testCodes, test.code],
        totalCost: formData.totalCost + test.cost,
        department: test.department
      });
    }
  };

  const handleOpenDialog = (order?: LabOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        patientName: order.patientName,
        patientId: order.patientId,
        doctorName: order.doctorName,
        priority: order.priority,
        tests: order.tests,
        testCodes: order.testCodes,
        clinicalNotes: order.clinicalNotes,
        department: order.department,
        totalCost: order.totalCost
      });
      // Find and set selected patient for editing
      const patient = availablePatients.find(p => p.patientId === order.patientId);
      setSelectedPatient(patient || null);
    } else {
      setEditingOrder(null);
      setSelectedPatient(null);
      setFormData({
        patientName: '',
        patientId: '',
        doctorName: '',
        priority: 'routine',
        tests: [],
        testCodes: [],
        clinicalNotes: '',
        department: '',
        totalCost: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrder(null);
    setSelectedPatient(null);
  };

  const handleViewOrder = (order: LabOrder) => {
    setViewingOrder(order);
    setViewDialog(true);
  };

  const handlePrintOrder = (order: LabOrder) => {
    // Create print content with branded header using hospital config
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${hospitalConfig.name} - Laboratory Order ${order.id}</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.4; 
          }
          .header {
            text-align: center;
            border-bottom: 3px solid ${hospitalConfig.colors.primary};
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-container {
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo {
            height: 63px;
            width: auto;
            object-fit: contain;
            padding: 4px 8px;
            filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
          }
          .logo-fallback {
            height: 63px;
            min-width: 63px;
            background: linear-gradient(135deg, #dc143c 0%, #ff8c00 30%, #ffd700 60%, #32cd32 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            color: white;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            padding: 6px 12px;
            border: 2px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
            filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
          }
          .hospital-info {
            margin-bottom: 10px;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: ${hospitalConfig.colors.primary};
            margin-bottom: 5px;
          }
          .hospital-tagline {
            font-size: 14px;
            color: #666;
            font-style: italic;
          }
          .contact-info {
            font-size: 12px;
            color: #888;
            margin-top: 10px;
          }
          .document-title {
            font-size: 20px;
            font-weight: bold;
            color: ${hospitalConfig.colors.primary};
            margin-top: 15px;
          }
          .order-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .label {
            font-weight: bold;
            color: #333;
          }
          .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .priority-routine { background: #e3f2fd; color: ${hospitalConfig.colors.primary}; }
          .priority-urgent { background: #fff3e0; color: ${hospitalConfig.colors.accent}; }
          .priority-stat { background: #ffebee; color: #d32f2f; }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-pending { background: #f5f5f5; color: #757575; }
          .status-in_progress { background: #fff3e0; color: ${hospitalConfig.colors.accent}; }
          .status-completed { background: #e8f5e8; color: ${hospitalConfig.colors.secondary}; }
          .status-cancelled { background: #ffebee; color: #d32f2f; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th {
            background: ${hospitalConfig.colors.primary};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .cost-section {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: right;
          }
          .total-cost {
            font-size: 18px;
            font-weight: bold;
            color: ${hospitalConfig.colors.primary};
          }
          .notes-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="https://i.imgur.com/b8WvnC0.png" alt="GhEHR - Ghana Electronic Health Records" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="logo-fallback" style="display: none;">
              GhEHR
            </div>
          </div>
          <div class="hospital-info">
            <div class="hospital-name">${hospitalConfig.name}</div>
            <div class="hospital-tagline">${hospitalConfig.tagline}</div>
            <div class="contact-info">
              ${hospitalConfig.address} • ${hospitalConfig.phone}
              ${hospitalConfig.email ? ` • ${hospitalConfig.email}` : ''}
              ${hospitalConfig.license ? `<br>License: ${hospitalConfig.license}` : ''}
            </div>
          </div>
          <div class="document-title">${HospitalConfigService.getLocalizedText('lab_order', hospitalConfig)}</div>
        </div>

        <div class="order-info">
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="label">Order ID:</span> ${order.id}
              </div>
              <div class="info-item">
                <span class="label">${HospitalConfigService.getLocalizedText('patient', hospitalConfig)}:</span> ${order.patientName}
              </div>
              <div class="info-item">
                <span class="label">Patient ID:</span> ${order.patientId}
              </div>
              <div class="info-item">
                <span class="label">${HospitalConfigService.getLocalizedText('doctor', hospitalConfig)}:</span> ${order.doctorName}
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="label">Order Date:</span> ${HospitalConfigService.formatDateTime(new Date(order.orderDate), hospitalConfig)}
              </div>
              <div class="info-item">
                <span class="label">Department:</span> ${order.department}
              </div>
              <div class="info-item">
                <span class="label">Priority:</span> 
                <span class="priority-badge priority-${order.priority}">${order.priority.toUpperCase()}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span> 
                <span class="status-badge status-${order.status}">${order.status.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 style="color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 5px;">Laboratory Tests Requested</h3>
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Test Code</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${order.tests.map((test, index) => `
              <tr>
                <td style="font-weight: 500;">${test}</td>
                <td>${order.testCodes[index] || 'N/A'}</td>
                <td>${order.department}</td>
                <td><span class="status-badge status-${order.status}">${order.status.replace('_', ' ').toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="cost-section">
          <div class="total-cost">${HospitalConfigService.getLocalizedText('total_cost', hospitalConfig)}: ${HospitalConfigService.formatCurrency(order.totalCost, hospitalConfig)}</div>
        </div>

        ${order.clinicalNotes ? `
          <div class="notes-section">
            <h4 style="color: ${hospitalConfig.colors.primary}; margin-top: 0;">Clinical Notes</h4>
            <p style="margin-bottom: 0;">${order.clinicalNotes}</p>
          </div>
        ` : ''}

        ${order.resultDate || order.technician ? `
          <div class="notes-section">
            <h4 style="color: ${hospitalConfig.colors.primary}; margin-top: 0;">Laboratory Results Information</h4>
            ${order.technician ? `<p><span class="label">Technician:</span> ${order.technician}</p>` : ''}
            ${order.resultDate ? `<p><span class="label">Result Date:</span> ${HospitalConfigService.formatDateTime(new Date(order.resultDate), hospitalConfig)}</p>` : ''}
          </div>
        ` : ''}

        <div class="footer">
          <p>This is an official document from ${hospitalConfig.name}</p>
          <p>Generated on ${HospitalConfigService.formatDateTime(new Date(), hospitalConfig)}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window for printing with proper timing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }
  };

  const handlePatientSelect = (patient: PatientSelectionItem | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setFormData({
        ...formData,
        patientName: patient.name,
        patientId: patient.patientId
      });
    } else {
      setFormData({
        ...formData,
        patientName: '',
        patientId: ''
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon sx={{ color: '#4caf50' }} />;
      case 'in_progress':
        return <ProcessingIcon sx={{ color: '#ff9800' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: '#2196f3' }} />;
      case 'cancelled':
        return <CancelledIcon sx={{ color: '#f44336' }} />;
      default:
        return <PendingIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
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
          🔬 Laboratory Orders Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#ff9800' }}
        >
          New Lab Order
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {orders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {orders.filter(o => o.status === 'pending').length}
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
              <Typography variant="h4" color="warning.main">
                {orders.filter(o => o.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {orders.filter(o => o.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Laboratory Orders
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Order ID</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Doctor</strong></TableCell>
                  <TableCell><strong>Tests</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Cost</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {order.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.patientId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{order.doctorName}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.tests.slice(0, 2).join(', ')}
                          {order.tests.length > 2 && ` +${order.tests.length - 2} more`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.department}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.priority.toUpperCase()}
                        color={getPriorityColor(order.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {HospitalConfigService.formatCurrency(order.totalCost, hospitalConfig)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewOrder(order)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Order">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(order)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Order">
                          <IconButton 
                            size="small"
                            onClick={() => handlePrintOrder(order)}
                          >
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
        </CardContent>
      </Card>

      {/* Add/Edit Order Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingOrder ? 'Edit Lab Order' : 'Create New Lab Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Patient Selection:</strong> Search and select a patient from the registered patients in the system.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid size={12}>
                <Autocomplete
                  options={availablePatients}
                  value={selectedPatient}
                  onChange={(event, newValue) => handlePatientSelect(newValue)}
                  getOptionLabel={(option) => `${option.name} (${option.patientId})`}
                  loading={patientLoading}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box display="flex" alignItems="center" gap={1} width="100%">
                        <PersonIcon fontSize="small" color="primary" />
                        <Box flexGrow={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {option.patientId} | Phone: {option.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search & Select Patient"
                      placeholder="Type patient name or ID..."
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: (
                          <React.Fragment>
                            {patientLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={patientLoading ? "Loading patients..." : "No patients found"}
                />
              </Grid>

              {selectedPatient && (
                <Grid size={12}>
                  <Card variant="outlined" sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Selected Patient Details
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedPatient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Patient ID: {selectedPatient.patientId} | Phone: {selectedPatient.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Ordering Doctor"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as LabOrder['priority'] })}
                  >
                    <MenuItem value="routine">Routine</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="stat">STAT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Select Tests
                </Typography>
                <Grid container spacing={1}>
                  {availableTests.map((test, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: formData.tests.includes(test.name) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          backgroundColor: formData.tests.includes(test.name) ? '#f3f8ff' : 'white'
                        }}
                        onClick={() => handleTestSelection(test)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="body2" fontWeight="bold">
                            {test.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {test.code}
                          </Typography>
                          <Typography variant="caption" color="primary" fontWeight="bold">
                            GHS {test.cost}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Clinical Notes"
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Clinical indication and relevant patient history..."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Total Cost"
                  value={`GHS ${formData.totalCost.toFixed(2)}`}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitOrder}
            variant="contained"
            disabled={loading || !selectedPatient || !formData.doctorName || formData.tests.length === 0}
          >
            {loading ? 'Saving...' : editingOrder ? 'Update' : 'Create'} Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - {viewingOrder?.id}
        </DialogTitle>
        <DialogContent>
          {viewingOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Patient Information */}
              <Grid size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Patient Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {viewingOrder.patientName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Patient ID:</strong> {viewingOrder.patientId}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="body2">
                          <strong>Doctor:</strong> {viewingOrder.doctorName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Order Date:</strong> {new Date(viewingOrder.orderDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Order Details */}
              <Grid size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={3}>
                        <Typography variant="body2">
                          <strong>Priority:</strong>
                        </Typography>
                        <Chip
                          label={viewingOrder.priority.toUpperCase()}
                          color={viewingOrder.priority === 'stat' ? 'error' : viewingOrder.priority === 'urgent' ? 'warning' : 'default'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <Typography variant="body2">
                          <strong>Status:</strong>
                        </Typography>
                        <Chip
                          label={viewingOrder.status.toUpperCase()}
                          color={viewingOrder.status === 'in_progress' ? 'warning' : viewingOrder.status === 'cancelled' ? 'error' : 'default'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <Typography variant="body2">
                          <strong>Department:</strong>
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {viewingOrder.department}
                        </Typography>
                      </Grid>
                      <Grid size={3}>
                        <Typography variant="body2">
                          <strong>Total Cost:</strong>
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                          {HospitalConfigService.formatCurrency(viewingOrder.totalCost, hospitalConfig)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Laboratory Tests */}
              <Grid size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Laboratory Tests ({viewingOrder.tests.length} tests)
                    </Typography>
                    {viewingOrder.tests.map((test, index) => (
                      <Card key={index} sx={{ mb: 2, bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid size={8}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {test}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Test Code: {viewingOrder.testCodes[index] || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid size={4}>
                              <Typography variant="body2">
                                <strong>Department:</strong> {viewingOrder.department}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Clinical Notes */}
              {viewingOrder.clinicalNotes && (
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Clinical Notes
                      </Typography>
                      <Typography variant="body2">
                        {viewingOrder.clinicalNotes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Results Information */}
              {(viewingOrder.technician || viewingOrder.resultDate) && (
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Results Information
                      </Typography>
                      <Grid container spacing={2}>
                        {viewingOrder.technician && (
                          <Grid size={6}>
                            <Typography variant="body2">
                              <strong>Technician:</strong> {viewingOrder.technician}
                            </Typography>
                          </Grid>
                        )}
                        {viewingOrder.resultDate && (
                          <Grid size={6}>
                            <Typography variant="body2">
                              <strong>Result Date:</strong> {new Date(viewingOrder.resultDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => viewingOrder && handlePrintOrder(viewingOrder)}
            variant="outlined"
            startIcon={<PrintIcon />}
          >
            Print Order
          </Button>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabOrders;
