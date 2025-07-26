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
  Divider,
  Autocomplete,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Schedule as PendingIcon,
  LocalShipping as ProcessingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import PatientService from '../../../services/PatientService';
import HospitalConfigService from '../../../services/HospitalConfigService';
import { PatientSelectionItem } from '../../../types/Patient';

interface MedicationItem {
  id: string;
  name: string;
  strength: string;
  dosageForm: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  instructions: string;
  duration: string;
}

interface PharmacyOrder {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  orderDate: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'preparing' | 'ready' | 'dispensed' | 'cancelled';
  medications: MedicationItem[];
  totalCost: number;
  paymentStatus: 'pending' | 'paid' | 'insurance';
  pharmacist?: string;
  dispensedDate?: string;
  notes: string;
  orderType: 'prescription' | 'over_counter';
}

const PharmacyOrders: React.FC = () => {
  const { token } = useAuth();
  const [hospitalConfig] = useState(HospitalConfigService.getCurrentConfig());
  const [orders, setOrders] = useState<PharmacyOrder[]>([
    {
      id: 'PH-001',
      patientName: 'Kwame Asante',
      patientId: 'PAT-001',
      doctorName: 'Dr. Ama Osei',
      orderDate: '2025-07-23',
      priority: 'routine',
      status: 'dispensed',
      medications: [
        {
          id: '1',
          name: 'Paracetamol',
          strength: '500mg',
          dosageForm: 'Tablet',
          quantity: 20,
          unitCost: 0.50,
          totalCost: 10.00,
          instructions: 'Take 1 tablet every 6 hours as needed for pain',
          duration: '5 days'
        },
        {
          id: '2',
          name: 'Amoxicillin',
          strength: '250mg',
          dosageForm: 'Capsule',
          quantity: 21,
          unitCost: 1.20,
          totalCost: 25.20,
          instructions: 'Take 1 capsule 3 times daily',
          duration: '7 days'
        }
      ],
      totalCost: 35.20,
      paymentStatus: 'paid',
      pharmacist: 'Alice Adjei',
      dispensedDate: '2025-07-23',
      notes: 'Patient counseled on antibiotic compliance',
      orderType: 'prescription'
    },
    {
      id: 'PH-002',
      patientName: 'Akosua Darko',
      patientId: 'PAT-002',
      doctorName: 'Dr. Kofi Boateng',
      orderDate: '2025-07-23',
      priority: 'urgent',
      status: 'preparing',
      medications: [
        {
          id: '1',
          name: 'Ceftriaxone',
          strength: '1g',
          dosageForm: 'Injection',
          quantity: 7,
          unitCost: 8.50,
          totalCost: 59.50,
          instructions: 'Administer IV once daily',
          duration: '7 days'
        }
      ],
      totalCost: 59.50,
      paymentStatus: 'insurance',
      notes: 'High priority - patient in ward',
      orderType: 'prescription'
    },
    {
      id: 'PH-003',
      patientName: 'Yaw Owusu',
      patientId: 'PAT-003',
      doctorName: 'Dr. Grace Ampong',
      orderDate: '2025-07-23',
      priority: 'stat',
      status: 'ready',
      medications: [
        {
          id: '1',
          name: 'Aspirin',
          strength: '75mg',
          dosageForm: 'Tablet',
          quantity: 30,
          unitCost: 0.30,
          totalCost: 9.00,
          instructions: 'Take 1 tablet daily with food',
          duration: '30 days'
        },
        {
          id: '2',
          name: 'Atorvastatin',
          strength: '20mg',
          dosageForm: 'Tablet',
          quantity: 30,
          unitCost: 2.50,
          totalCost: 75.00,
          instructions: 'Take 1 tablet at bedtime',
          duration: '30 days'
        }
      ],
      totalCost: 84.00,
      paymentStatus: 'pending',
      notes: 'Cardiac medication - ensure patient understands compliance',
      orderType: 'prescription'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PharmacyOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<PharmacyOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [availablePatients, setAvailablePatients] = useState<PatientSelectionItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSelectionItem | null>(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorName: '',
    priority: 'routine' as PharmacyOrder['priority'],
    medications: [] as MedicationItem[],
    notes: '',
    orderType: 'prescription' as PharmacyOrder['orderType'],
    paymentStatus: 'pending' as PharmacyOrder['paymentStatus']
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

  const availableMedications = [
    { name: 'Paracetamol', strength: '500mg', dosageForm: 'Tablet', unitCost: 0.50 },
    { name: 'Amoxicillin', strength: '250mg', dosageForm: 'Capsule', unitCost: 1.20 },
    { name: 'Ceftriaxone', strength: '1g', dosageForm: 'Injection', unitCost: 8.50 },
    { name: 'Aspirin', strength: '75mg', dosageForm: 'Tablet', unitCost: 0.30 },
    { name: 'Atorvastatin', strength: '20mg', dosageForm: 'Tablet', unitCost: 2.50 },
    { name: 'Metformin', strength: '500mg', dosageForm: 'Tablet', unitCost: 0.80 },
    { name: 'Lisinopril', strength: '10mg', dosageForm: 'Tablet', unitCost: 1.50 },
    { name: 'Ibuprofen', strength: '400mg', dosageForm: 'Tablet', unitCost: 0.60 },
    { name: 'Omeprazole', strength: '20mg', dosageForm: 'Capsule', unitCost: 1.80 },
    { name: 'Ciprofloxacin', strength: '500mg', dosageForm: 'Tablet', unitCost: 2.00 }
  ];

  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!selectedPatient || !formData.doctorName || formData.medications.length === 0) {
      alert('Please fill all required fields and add at least one medication');
      return;
    }

    // Validate medications
    const invalidMedications = formData.medications.filter(med => 
      !med.name || !med.instructions || med.quantity <= 0
    );
    
    if (invalidMedications.length > 0) {
      alert('Please complete all medication information');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const totalCost = formData.medications.reduce((sum, med) => sum + med.totalCost, 0);
      
      if (editingOrder) {
        setOrders(prev => prev.map(order => 
          order.id === editingOrder.id 
            ? { 
                ...order, 
                ...formData,
                patientName: selectedPatient.name,
                patientId: selectedPatient.patientId,
                totalCost,
                medications: formData.medications
              }
            : order
        ));
      } else {
        const newOrder: PharmacyOrder = {
          id: `PH-${String(orders.length + 1).padStart(3, '0')}`,
          ...formData,
          patientName: selectedPatient.name,
          patientId: selectedPatient.patientId,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          totalCost
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

  const addMedication = () => {
    const newMedication: MedicationItem = {
      id: String(formData.medications.length + 1),
      name: '',
      strength: '',
      dosageForm: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      instructions: '',
      duration: ''
    };
    setFormData({
      ...formData,
      medications: [...formData.medications, newMedication]
    });
  };

  const updateMedication = (index: number, field: keyof MedicationItem, value: any) => {
    const updatedMedications = formData.medications.map((med, i) => {
      if (i === index) {
        const updated = { ...med, [field]: value };
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalCost = updated.quantity * updated.unitCost;
        }
        return updated;
      }
      return med;
    });
    setFormData({ ...formData, medications: updatedMedications });
  };

  const removeMedication = (index: number) => {
    const updatedMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: updatedMedications });
  };

  const selectPredefinedMedication = (index: number, medication: typeof availableMedications[0]) => {
    const updatedMedications = formData.medications.map((med, i) => {
      if (i === index) {
        const quantity = med.quantity || 1;
        return {
          ...med,
          name: medication.name,
          strength: medication.strength,
          dosageForm: medication.dosageForm,
          unitCost: medication.unitCost,
          totalCost: quantity * medication.unitCost
        };
      }
      return med;
    });
    setFormData({ ...formData, medications: updatedMedications });
  };

  const handleOpenDialog = (order?: PharmacyOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        patientName: order.patientName,
        patientId: order.patientId,
        doctorName: order.doctorName,
        priority: order.priority,
        medications: order.medications,
        notes: order.notes,
        orderType: order.orderType,
        paymentStatus: order.paymentStatus
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
        medications: [],
        notes: '',
        orderType: 'prescription',
        paymentStatus: 'pending'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrder(null);
    setSelectedPatient(null);
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

  const handleViewOrder = (order: PharmacyOrder) => {
    setViewingOrder(order);
    setViewDialog(true);
  };

  const handlePrintOrder = (order: PharmacyOrder) => {
    // Create print content with branded header using hospital config
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${hospitalConfig.name} - Pharmacy Order ${order.id}</title>
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
          .status-preparing { background: #fff3e0; color: ${hospitalConfig.colors.accent}; }
          .status-ready { background: #e3f2fd; color: ${hospitalConfig.colors.primary}; }
          .status-dispensed { background: #e8f5e8; color: ${hospitalConfig.colors.secondary}; }
          .status-cancelled { background: #ffebee; color: #d32f2f; }
          .payment-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .payment-paid { background: #e8f5e8; color: ${hospitalConfig.colors.secondary}; }
          .payment-insurance { background: #e3f2fd; color: ${hospitalConfig.colors.primary}; }
          .payment-pending { background: #fff3e0; color: ${hospitalConfig.colors.accent}; }
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
          .medication-item {
            background: #fafafa;
            border-left: 4px solid ${hospitalConfig.colors.primary};
            padding: 10px;
            margin-bottom: 10px;
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
          <div class="document-title">${HospitalConfigService.getLocalizedText('pharmacy_order', hospitalConfig)}</div>
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
                <span class="label">Order Type:</span> ${order.orderType.replace('_', ' ').toUpperCase()}
              </div>
              <div class="info-item">
                <span class="label">Priority:</span> 
                <span class="priority-badge priority-${order.priority}">${order.priority.toUpperCase()}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span> 
                <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
              </div>
              <div class="info-item">
                <span class="label">Payment:</span> 
                <span class="payment-badge payment-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 style="color: ${hospitalConfig.colors.primary}; border-bottom: 2px solid ${hospitalConfig.colors.primary}; padding-bottom: 5px;">Prescribed Medications</h3>
        <table>
          <thead>
            <tr>
              <th>Medication</th>
              <th>Strength</th>
              <th>Form</th>
              <th>Quantity</th>
              <th>Duration</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            ${order.medications.map(med => `
              <tr>
                <td style="font-weight: 500;">${med.name}</td>
                <td>${med.strength}</td>
                <td>${med.dosageForm}</td>
                <td>${med.quantity}</td>
                <td>${med.duration}</td>
                <td style="font-weight: bold;">${HospitalConfigService.formatCurrency(med.totalCost, hospitalConfig)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4 style="color: ${hospitalConfig.colors.primary}; margin-top: 25px;">Medication Instructions</h4>
        ${order.medications.map((med, index) => `
          <div class="medication-item">
            <div style="font-weight: bold; color: ${hospitalConfig.colors.primary};">${index + 1}. ${med.name} ${med.strength}</div>
            <div style="margin-top: 5px; color: #333;">${med.instructions}</div>
          </div>
        `).join('')}

        <div class="cost-section">
          <div class="total-cost">${HospitalConfigService.getLocalizedText('total_cost', hospitalConfig)}: ${HospitalConfigService.formatCurrency(order.totalCost, hospitalConfig)}</div>
        </div>

        ${order.notes ? `
          <div class="notes-section">
            <h4 style="color: ${hospitalConfig.colors.primary}; margin-top: 0;">Pharmacy Notes</h4>
            <p style="margin-bottom: 0;">${order.notes}</p>
          </div>
        ` : ''}

        ${order.pharmacist || order.dispensedDate ? `
          <div class="notes-section">
            <h4 style="color: ${hospitalConfig.colors.primary}; margin-top: 0;">Dispensing Information</h4>
            ${order.pharmacist ? `<p><span class="label">Pharmacist:</span> ${order.pharmacist}</p>` : ''}
            ${order.dispensedDate ? `<p><span class="label">Dispensed Date:</span> ${HospitalConfigService.formatDateTime(new Date(order.dispensedDate), hospitalConfig)}</p>` : ''}
          </div>
        ` : ''}

        <div class="footer">
          <p>This is an official document from ${hospitalConfig.name}</p>
          <p>Generated on ${HospitalConfigService.formatDateTime(new Date(), hospitalConfig)}</p>
          <p style="margin-top: 10px; font-weight: bold;">⚠️ Keep this prescription safe. Do not share medications with others.</p>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispensed':
        return <CompletedIcon sx={{ color: '#4caf50' }} />;
      case 'ready':
        return <CompletedIcon sx={{ color: '#2196f3' }} />;
      case 'preparing':
        return <ProcessingIcon sx={{ color: '#ff9800' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: '#9e9e9e' }} />;
      case 'cancelled':
        return <CancelledIcon sx={{ color: '#f44336' }} />;
      default:
        return <PendingIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispensed':
        return 'success';
      case 'ready':
        return 'info';
      case 'preparing':
        return 'warning';
      case 'pending':
        return 'default';
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'insurance':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          💊 Pharmacy Orders Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#4caf50' }}
        >
          New Pharmacy Order
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
              <Typography variant="h4" color="warning.main">
                {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
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
              <Typography variant="h4" color="info.main">
                {orders.filter(o => o.status === 'ready').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {orders.filter(o => o.status === 'dispensed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dispensed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pharmacy Orders
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Order ID</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Doctor</strong></TableCell>
                  <TableCell><strong>Medications</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Payment</strong></TableCell>
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
                          {order.medications.slice(0, 2).map(med => med.name).join(', ')}
                          {order.medications.length > 2 && ` +${order.medications.length - 2} more`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.medications.length} item{order.medications.length !== 1 ? 's' : ''}
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
                      <Chip
                        label={order.paymentStatus.toUpperCase()}
                        color={getPaymentStatusColor(order.paymentStatus) as any}
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
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOrder ? 'Edit Pharmacy Order' : 'Create New Pharmacy Order'}
        </DialogTitle>
        <DialogContent>
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
                    error={!formData.patientId}
                    helperText={!formData.patientId ? 'Please select a patient' : ''}
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
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Prescribing Doctor"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PharmacyOrder['priority'] })}
                >
                  <MenuItem value="routine">Routine</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="stat">STAT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={formData.orderType}
                  label="Order Type"
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value as PharmacyOrder['orderType'] })}
                >
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="over_counter">Over Counter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  label="Payment Status"
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PharmacyOrder['paymentStatus'] })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

              {/* Medications Section */}
              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Medications</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addMedication}
                  >
                    Add Medication
                  </Button>
                </Box>
                
                {formData.medications.map((medication, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <FormControl fullWidth>
                          <InputLabel>Select Medication</InputLabel>
                          <Select
                            value={medication.name || ''}
                            label="Select Medication"
                            onChange={(e) => {
                              const selected = availableMedications.find(med => med.name === e.target.value);
                              if (selected) {
                                selectPredefinedMedication(index, selected);
                              }
                            }}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Select a medication...</em>
                            </MenuItem>
                            {availableMedications.map((med, i) => (
                              <MenuItem key={i} value={med.name}>
                                {med.name} {med.strength} ({med.dosageForm})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={medication.quantity}
                          onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="Unit Cost"
                          type="number"
                          value={medication.unitCost}
                          onChange={(e) => updateMedication(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="Total Cost"
                          value={HospitalConfigService.formatCurrency(medication.totalCost, hospitalConfig)}
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="Duration"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <IconButton
                          color="error"
                          onClick={() => removeMedication(index)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label="Instructions"
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take 1 tablet twice daily with food"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Pharmacy Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Additional instructions or notes for the pharmacist..."
                />
              </Grid>
              
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Total Order Cost"
                  value={HospitalConfigService.formatCurrency(formData.medications.reduce((sum, med) => sum + med.totalCost, 0), hospitalConfig)}
                  disabled
                />
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitOrder}
            variant="contained"
            disabled={loading || !formData.patientName || !formData.patientId || formData.medications.length === 0}
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
                          color={getPriorityColor(viewingOrder.priority) as any}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <Typography variant="body2">
                          <strong>Status:</strong>
                        </Typography>
                        <Chip
                          icon={getStatusIcon(viewingOrder.status)}
                          label={viewingOrder.status.toUpperCase()}
                          color={getStatusColor(viewingOrder.status) as any}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <Typography variant="body2">
                          <strong>Payment:</strong>
                        </Typography>
                        <Chip
                          label={viewingOrder.paymentStatus.toUpperCase()}
                          color={getPaymentStatusColor(viewingOrder.paymentStatus) as any}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
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

              {/* Medications */}
              <Grid size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Medications ({viewingOrder.medications.length} items)
                    </Typography>
                    {viewingOrder.medications.map((medication, index) => (
                      <Card key={index} sx={{ mb: 2, bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid size={12}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {medication.name} {medication.strength} ({medication.dosageForm})
                              </Typography>
                            </Grid>
                            <Grid size={4}>
                              <Typography variant="body2">
                                <strong>Quantity:</strong> {medication.quantity}
                              </Typography>
                            </Grid>
                            <Grid size={4}>
                              <Typography variant="body2">
                                <strong>Duration:</strong> {medication.duration}
                              </Typography>
                            </Grid>
                            <Grid size={4}>
                              <Typography variant="body2">
                                <strong>Cost:</strong> {HospitalConfigService.formatCurrency(medication.totalCost, hospitalConfig)}
                              </Typography>
                            </Grid>
                            <Grid size={12}>
                              <Typography variant="body2">
                                <strong>Instructions:</strong> {medication.instructions}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes */}
              {viewingOrder.notes && (
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Pharmacy Notes
                      </Typography>
                      <Typography variant="body2">
                        {viewingOrder.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Dispensing Information */}
              {(viewingOrder.pharmacist || viewingOrder.dispensedDate) && (
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Dispensing Information
                      </Typography>
                      <Grid container spacing={2}>
                        {viewingOrder.pharmacist && (
                          <Grid size={6}>
                            <Typography variant="body2">
                              <strong>Pharmacist:</strong> {viewingOrder.pharmacist}
                            </Typography>
                          </Grid>
                        )}
                        {viewingOrder.dispensedDate && (
                          <Grid size={6}>
                            <Typography variant="body2">
                              <strong>Dispensed Date:</strong> {new Date(viewingOrder.dispensedDate).toLocaleDateString()}
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

export default PharmacyOrders;
